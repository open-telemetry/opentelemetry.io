---
title: OpenTelemetry のバグを OpenTelemetry で修正した方法
linkTitle: OTel を OTel でデバッグ
date: 2022-09-22
author: >-
  [Kumar Pratyush](https://github.com/kpratyus),  [Sanket
  Mehta](https://github.com/sanketmehta28), [Severin
  Neumann](https://github.com/svrnm) (Cisco)
default_lang_commit: 2728c8fbf4f09cf3b8257a1b628a7631fc77d639
cSpell:ignore: distro Kumar Mehta Pratyush Sanket webserver WORKDIR xvfz
---

OpenTelemetry は、ソフトウェアの問題の根本原因を素早く見つけるためのものです。
最近、OpenTelemetry のある機能を使って、別の機能のバグの根本原因を特定し修正するという経験をしました。

このブログ記事では、この興味深い経験を共有します。
これにより、言語固有の実装における小さな違いが興味深い影響をもたらしうること、また Java と Python にはコンテキスト伝搬の問題をデバッグするための機能があることを学べます。

## 問題 {#the-issue}

### バグの説明 {#describe-the-bug}

ブログ記事 [Learn how to instrument NGINX with OpenTelemetry][] のために、Node.js のフロントエンドアプリケーションが NGINX を呼び出し、NGINX が Python のバックエンドアプリケーションへのリバースプロキシとして機能する小さなサンプルアプリを作成しました。

私たちの目標は、NGINX を OpenTelemetry で計装する方法だけでなく、ウェブサーバーを横断する分散トレースがどのように見えるかも示す、再利用可能な `docker-compose` を作ることでした。

Jaeger ではフロントエンドアプリケーションから NGINX までのトレースは表示されましたが、NGINX と Python アプリ間の接続は見えず、2つの切断されたトレースがありました。

事前に Java アプリケーションをバックエンドとしてテストした際には、NGINX からそのダウンストリームアプリケーションへのトレースが確認できていたため、これは驚きでした。

### 再現手順 {#steps-to-reproduce}

[put NGINX between two services][] の手順に従ってください。
Java ベースのアプリケーションを Python アプリケーションに置き換えます。
たとえば、以下の3つのファイルを `backend` フォルダに配置してください。

- `app.py`:

  ```python
  import time

  import redis
  from flask import Flask

  app = Flask(__name__)
  cache = redis.Redis(host='redis', port=6379)

  def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

  @app.route('/')
  def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
  ```

- `Dockerfile`:

  ```dockerfile
  FROM python:3.10-alpine
  WORKDIR /code
  ENV FLASK_APP=app.py
  ENV FLASK_RUN_HOST=0.0.0.0
  RUN apk add --no-cache gcc musl-dev linux-headers
  COPY requirements.txt requirements.txt
  RUN pip install -r requirements.txt
  RUN opentelemetry-bootstrap -a install
  EXPOSE 5000
  COPY . .
  CMD ["opentelemetry-instrument", "--traces_exporter", "otlp_proto_http", "--metrics_exporter", "console", "flask", "run"]
  ```

- `requirements.txt`:

  ```txt
  flask
  redis
  opentelemetry-distro
  opentelemetry-exporter-otlp-proto-http
  ```

`docker-compose.yml` を以下の内容で更新してください。

```yaml
version: '2'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - '16686:16686'
  collector:
    image: otel/opentelemetry-collector:latest
    command: ['--config=/etc/otel-collector-config.yaml']
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
  nginx:
    image: nginx-otel
    volumes:
      - ./opentelemetry_module.conf:/etc/nginx/conf.d/opentelemetry_module.conf
      - ./default.conf:/etc/nginx/conf.d/default.conf
  backend:
    build: ./backend
    image: backend-with-otel
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318/v1/traces
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
      - OTEL_SERVICE_NAME=python-app
  redis:
    image: 'redis:alpine'
  frontend:
    build: ./frontend
    image: frontend-with-otel
    ports:
      - '8000:8000'
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318/
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
      - OTEL_SERVICE_NAME=frontend
```

`docker compose up`[^1] を実行して環境を起動し、`curl localhost:8000` でフロントエンドにリクエストを送信してください。

### 期待される結果 {#what-did-you-expect-to-see}

[localhost:16686][] の Jaeger UI で、`frontend` から NGINX を経由して `python-app` までのトレースが表示されることを期待します。

### 実際の結果 {#what-did-you-see-instead}

[localhost:16686][] の Jaeger UI では、2つのトレースが表示されます。
1つは `frontend` から NGINX まで、もう1つは `python-app` のみのトレースです。

## 解決方法 {#the-solution}

### 手がかり {#the-hints}

Java アプリケーションをバックエンドに使ったセットアップでは動作していたため、問題は Python アプリケーションか、NGINX の計装と Python アプリケーションの組み合わせに起因していると分かっていました。

Python アプリケーション単体が問題ではないことはすぐに除外できました。
シンプルな Node.js アプリケーションをバックエンドとして試したところ、同じ結果が得られました。
フロントエンドから NGINX までのトレースと、Node.js アプリケーション単体のトレースの2つです。

これにより、伝搬の問題であることが分かりました。
トレースコンテキストが NGINX から Python および Node.js アプリケーションへ正常に転送されていなかったのです。

### 分析 {#the-analysis}

Java では問題が発生しないこと、そしておそらく伝搬が壊れていることが分かっていたため、やるべきことは明確でした。
トレースヘッダーを確認する必要がありました。

幸い、[Java][] と [Python][] の計装には、[HTTP リクエストおよびレスポンスヘッダー][HTTP request & response headers]をスパン属性として簡単にキャプチャできる機能があります。

環境変数 `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` と `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE` にカンマ区切りの HTTP ヘッダー名リストを指定することで、キャプチャしたい HTTP ヘッダーを定義できます。
今回のケースでは、すべての伝搬ヘッダーを指定しました。

```console
OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST=tracestate,traceparent,baggage,X-B3-TraceId
```

`docker-compose` ベースのサンプルでは、バックエンドサービスの定義に追加するだけです。

```yaml
backend:
  build: ./backend
  image: backend-with-otel
  environment:
    - OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318/v1/traces
    - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
    - OTEL_SERVICE_NAME=python-app
    - OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST=tracestate,traceparent,baggage,X-B3-TraceId
```

再度 `docker compose up`[^1] でサンプルアプリを起動し、`curl localhost:8080` でフロントエンドアプリケーションにリクエストを送信しました。

Jaeger ではトレースがまだ切断されていることが確認できます。
しかし、トレースの1つを詳しく見ると、NGINX からバックエンドへのリクエストヘッダーが収集されていることが分かります。

![Jaeger UI のスクリーンショット。http.request.header.traceparent に複数のエントリがあることを示している。](jaeger-with-request-headers.png)

見つかりました！
トレースヘッダー（`baggage`、`traceparent`、`tracestate`）が複数のヘッダーフィールドとして送信されていました。
NGINX モジュールがこれらの各ヘッダーの値を繰り返し追加しており、マルチバリューヘッダーは [RFC7230][] でカバーされているため、すぐには問題になりませんでした。

NGINX からダウンストリームサービスへの相関能力を Java アプリケーションでテストしました。
OTel Java SDK のソースコードを読み込んでいるわけではありませんが、Java は `traceparent` が複数の値を持つ場合でも柔軟に処理できるようです。
ただし、そのような形式は W3C Trace Context 仕様では無効です。
そのため、NGINX から Java サービスへの伝搬は動作しましたが、Python（および他の言語）はその柔軟性を持たず、NGINX からダウンストリームサービスへの伝搬は黙って失敗していました。

なお、他の言語が Java と同じ `traceparent` の読み取りに対する柔軟性を持つべきだと提案しているわけではありません（またはその逆も）。
バグは NGINX モジュールにあり、それを修正する必要がありました。

### 修正 {#the-fix}

問題を修正するために、[NGINX 用モジュールにいくつかのチェックを追加][added some checks to the module for NGINX]し、トレースヘッダーが一度だけ設定されるようにしました。

この修正は [otel-webserver-module の v1.0.1 リリース][v1.0.1 release of the otel-webserver-module]に含まれています。
つまり、以下のように `Dockerfile` を更新して NGINX モジュールをインストールできます。

```dockerfile
FROM nginx:1.18
ADD https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv1.0.1/opentelemetry-webserver-sdk-x64-linux.tgz /opt
RUN cd /opt ; tar xvfz opentelemetry-webserver-sdk-x64-linux.tgz
RUN cd /opt/opentelemetry-webserver-sdk; ./install.sh
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/opentelemetry-webserver-sdk/sdk_lib/lib
RUN echo "load_module /opt/opentelemetry-webserver-sdk/WebServerModule/Nginx/ngx_http_opentelemetry_module.so;\n$(cat /etc/nginx/nginx.conf)" > /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d
COPY opentelemetry_module.conf /etc/nginx/conf.d
```

[^1]: {{% param notes.docker-compose-v2 %}}

[learn how to instrument nginx with opentelemetry]: /blog/2022/instrument-nginx/
[put nginx between two services]: /blog/2022/instrument-nginx/#put-nginx-between-two-services
[localhost:16686]: http://localhost:16686/
[http request & response headers]: /docs/specs/semconv/http/http-spans/
[rfc7230]: https://httpwg.org/specs/rfc7230.html#field.order
[added some checks to the module for nginx]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/pull/204
[v1.0.1 release of the otel-webserver-module]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/tag/webserver%2Fv1.0.1
[java]: /docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers
[python]: /docs/zero-code/python/

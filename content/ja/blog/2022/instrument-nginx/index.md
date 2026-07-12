---
title: OpenTelemetry で NGINX を計装する方法を学ぶ
linkTitle: NGINX の計装
date: 2022-08-22
author: >-
  [Debajit Das](https://github.com/debajitdas), [Kumar
  Pratyush](https://github.com/kpratyus), [Severin
  Neumann](https://github.com/svrnm) (Cisco)
default_lang_commit: ad6f8d1e5179464d22f7e9cdf9fe86bc53f550e5
cSpell:ignore: Debajit Kumar Pratyush webserver
---

Apache HTTP Server と NGINX は最も人気のあるウェブサーバーです。
あなたのアプリケーションでもどちらか一方を使用している可能性が高いでしょう。
[以前のブログ記事][previous blog post]では、Apache HTTP Server 用の OpenTelemetry モジュールを使用して、Apache HTTP Server にオブザーバビリティを追加する方法を学びました。
このブログ記事では、NGINX のオブザーバビリティを得る方法を学びます！

## NGINX 用モジュールのインストール {#install-the-module-for-nginx}

以下では、docker を使用して `ngx_http_opentelemetry_module.so` を有効化・設定した NGINX サーバーを実行します。
もちろん、以下の `Dockerfile` で使用しているのと同じコマンドセットを使用して、ベアメタルマシン上の NGINX サーバーを設定することもできます。

空のディレクトリから始めます。
`Dockerfile` というファイルを作成し、以下の内容をコピーしてください。

```dockerfile
FROM nginx:1.23.1
RUN apt-get update ; apt-get install unzip
ADD https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv1.0.3/opentelemetry-webserver-sdk-x64-linux.tgz /opt
RUN cd /opt ; unzip opentelemetry-webserver-sdk-x64-linux.tgz.zip; tar xvfz opentelemetry-webserver-sdk-x64-linux.tgz
RUN cd /opt/opentelemetry-webserver-sdk; ./install.sh
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/opentelemetry-webserver-sdk/sdk_lib/lib
RUN echo "load_module /opt/opentelemetry-webserver-sdk/WebServerModule/Nginx/1.23.1/ngx_http_opentelemetry_module.so;\n$(cat /etc/nginx/nginx.conf)" > /etc/nginx/nginx.conf
COPY opentelemetry_module.conf /etc/nginx/conf.d
```

この `Dockerfile` は以下を行います。

- NGINX 1.23.1 がプリインストールされたベースイメージをプルする
- `unzip` をインストールする
- [opentelemetry-webserver-sdk-x64-linux][] パッケージをダウンロードする
- パッケージを展開して `/opt` に配置し、`./install.sh` を実行する
- `/opt/opentelemetry-webserver-sdk/sdk_lib/lib` にある依存関係をライブラリパス（`LD_LIBRARY_PATH`）に追加する
- NGINX に `ngx_http_opentelemetry_module.so` をロードするよう指示する
- モジュールの設定を NGINX に追加する

次に、`opentelemetry_module.conf` というファイルを作成し、以下の内容をコピーしてください。

```nginx
NginxModuleEnabled ON;
NginxModuleOtelSpanExporter otlp;
NginxModuleOtelExporterEndpoint localhost:4317;
NginxModuleServiceName DemoService;
NginxModuleServiceNamespace DemoServiceNamespace;
NginxModuleServiceInstanceId DemoInstanceId;
NginxModuleResolveBackends ON;
NginxModuleTraceAsError ON;
```

これにより OpenTelemetry が有効になり、以下の設定が適用されます。

- OTLP 経由で localhost:4317 にスパンを送信する
- 属性 `service.name` を `DemoService` に、`service.namespace` を `DemoServiceNamespace` に、`service.instance_id` を `DemoInstanceId` に設定する
- トレースをエラーとして報告するため、NGINX のログで確認できるようになる

利用可能なすべての設定については、[ディレクティブの全リスト][full list of directives]を参照してください。

`Dockerfile` と NGINX の設定が整ったら、docker イメージをビルドしてコンテナを実行します。

```sh
docker build -t nginx-otel --platform linux/amd64 .
docker run --platform linux/amd64 --rm -p 8080:80 nginx-otel
...
2022/08/12 09:26:42 [error] 69#69: mod_opentelemetry: ngx_http_opentelemetry_init_worker: Initializing Nginx Worker for process with PID: 69
```

コンテナが起動して稼働したら、たとえば `curl localhost:8080` を使用して NGINX にリクエストを送信します。

上記の設定では `NginxModuleTraceAsError` が `ON` に設定されているため、NGINX のエラーログにトレースがダンプされるのが確認できます。

```log
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: startMonitoringRequest: Starting Request Monitoring for: / HTTP/1.1
Host, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: startMonitoringRequest: WebServer Context: DemoServiceNamespaceDemoServiceDemoInstanceId, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: startMonitoringRequest: Request Monitoring begins successfully , client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_startInteraction: Starting a new module interaction for: ngx_http_realip_module, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Key : tracestate, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Value : , client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Key : baggage, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Value : , client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Key : traceparent, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_payload_decorator: Value : 00-987932d28550c0a1c0a82db380a075a8-fc0bf2248e93dc42-01, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_startInteraction: Interaction begin successful, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
2022/08/12 09:31:12 [error] 70#70: *3 mod_opentelemetry: otel_stopInteraction: Stopping the Interaction for: ngx_http_realip_module, client: 172.17.0.1, server: localhost, request: "GET / HTTP/1.1", host: "localhost:8080"
```

## Jaeger でスパンを表示する {#viewing-spans-in-jaeger}

この時点では、NGINX が生成したテレメトリーデータは OpenTelemetry Collector やその他のオブザーバビリティバックエンドに送信されていません。
`docker-compose` ファイルを作成して NGINX サーバー、Collector、Jaeger を起動することで、簡単に変更できます。

`docker-compose.yml` というファイルを作成し、以下の内容を追加してください。

```yaml
version: '3.8'
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
    ports:
      - 8080:80
```

以下の内容を含む `otel-collector-config.yaml` というファイルを作成してください。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [jaeger]
```

コンテナを起動する前に、`opentelemetry_module.conf` の3行目を正しいエクスポーターエンドポイントに更新してください。

```nginx
NginxModuleEnabled ON;
NginxModuleOtelSpanExporter otlp;
NginxModuleOtelExporterEndpoint collector:4317;
```

上記の `docker-compose.yaml` が `opentelemetry_module.conf` をコンテナ起動時にファイルボリュームとしてロードするため、docker イメージを再ビルドする必要はありません。

すべてを起動します[^1]。

```sh
docker compose up
```

別のシェルで、トラフィックを生成します。

```sh
curl localhost:8080
```

ブラウザで [localhost:16686][] を開き、`DemoService` からのトレースを検索して、そのうちの1つを掘り下げてみてください。

![Jaeger のトレースビューのスクリーンショット。異なる NGINX モジュールによって消費された時間を表すスパンのウォーターフォールを示しています。](nginx-spans-in-jaeger.png)

リクエスト中に実行された各 NGINX モジュールごとに1つのスパンが表示されます。
これにより、特定のモジュールの問題、たとえばリライトが暴走しているケースなどを簡単に特定できます。

## NGINX を2つのサービスの間に配置する {#put-nginx-between-two-services}

もちろん、NGINX がスタンドアロンのソリューションとして使用されることはほとんどありません！
多くの場合、NGINX はリバースプロキシまたはロードバランサーとして別のサービスの前に配置されます。
そして、NGINX を経由してダウンストリームサービスにアクセスするサービスが存在することもあります。

実行中のサンプルにさらに2つのサービスを追加します。

- `frontend` という名前の Node.js サービスで、フロントに配置されて NGINX を呼び出す
- `backend` という名前の Java サービスで、NGINX の背後に配置される

`docker-compose` ファイルを更新して、これら2つのサービスを含め、NGINX の `default.conf` を上書きするようにします。

```yaml
version: '3.8'
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
      - OTEL_TRACES_EXPORTER=otlp
      - OTEL_METRICS_EXPORTER=none
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318/
      - OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
      - OTEL_SERVICE_NAME=backend
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

リクエストを NGINX からバックエンドサービスに転送する `default.conf` を作成します。

```nginx
server {
    listen       80;
    location / {
        proxy_pass http://backend:8080;
    }
}
```

`backend` と `frontend` の2つの空のフォルダを作成します。

frontend フォルダに、シンプルな Node.js アプリを作成します。

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');

const initAndStartSDK = async () => {
  const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
  return sdk;
};

const main = async () => {
  try {
    const sdk = await initAndStartSDK();
    const express = require('express');
    const http = require('http');
    const app = express();
    app.get('/', (_, response) => {
      const options = {
        hostname: 'nginx',
        port: 80,
        path: '/',
        method: 'GET',
      };
      const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', (d) => {
          response.send('Hello World');
        });
      });
      req.end();
    });
    app.listen(8000, () => {
      console.log('Listening for requests');
    });
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

main();
```

frontend サービスを完成させるために、以下の内容で空の `Dockerfile` を作成します。

```dockerfile
FROM node:16
WORKDIR /app
RUN npm install @opentelemetry/api @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/sdk-node express
COPY app.js .
EXPOSE 8000
CMD [ "node", "app.js" ]
```

backend サービスには、OpenTelemetry Java エージェントがインストールされた Tomcat を使用します。
`backend` フォルダに以下のような `Dockerfile` を作成してください。

```dockerfile
FROM tomcat
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar javaagent.jar
ENV JAVA_OPTS="-javaagent:javaagent.jar"
CMD ["catalina.sh", "run"]
```

ご覧のとおり、`Dockerfile` が OpenTelemetry Java エージェントを自動的にダウンロードして追加します。

トップレベルディレクトリに以下のファイルが揃っているはずです。

- ./default.conf
- ./docker-compose.yml
- ./Dockerfile
- ./opentelemetry_module.conf
- ./otel-collector-config.yaml
- ./backend/Dockerfile
- ./frontend/Dockerfile
- ./frontend/app.js

すべてが揃ったら、デモ環境を起動できます[^1]。

```sh
docker compose up
```

数秒以内に、5つの docker コンテナが起動して稼働するはずです。

- Jaeger
- OpenTelemetry Collector
- NGINX
- Frontend
- Backend

`curl localhost:8000` でフロントエンドにいくつかリクエストを送信し、ブラウザで [localhost:16686][] の Jaeger UI を確認してください。
frontend から NGINX を経由して backend へ向かうトレースが表示されるはずです。

frontend のトレースは、NGINX が Tomcat からの `Page Not Found` を転送しているため、エラーを示しているはずです。

![Jaeger のトレースビューのスクリーンショット。frontend から NGINX を経由して backend へ向かうスパンのウォーターフォールを示しています。](frontend-to-backend-spans-in-jaeger.png)

## 次のステップ {#whats-next}

このブログ記事で学んだことを、ご自身の NGINX のインストールに適用できるはずです。
あなたの体験をぜひお聞かせください！
問題が発生した場合は、[イシューを作成][create an issue]してください。

[^1]: {{% param notes.docker-compose-v2 %}}

[create an issue]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues
[full list of directives]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/5009fb7c0428ab7e3c18dd8eb283482ac77de932/instrumentation/otel-webserver-module?from_branch=main#configuration-1
[localhost:16686]: http://localhost:16686
[opentelemetry-webserver-sdk-x64-linux]: https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv1.0.0/opentelemetry-webserver-sdk-x64-linux.tgz.zip
[previous blog post]: /blog/2022/instrument-apache-httpd-server/

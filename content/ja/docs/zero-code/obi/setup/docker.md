---
title: DockerコンテナとしてOBIを実行する
linkTitle: Docker
description: OBIをDockerコンテナとしてセットアップして実行し、別のコンテナを計装する方法を学びます。
weight: 2
default_lang_commit: a4915a1d38456fa5abb367c96a23dd202bc856bf
cSpell:ignore: goblog
---

OBIは、スタンドアロンのDockerコンテナとして実行し、別のコンテナで実行されているプロセスを計装できます。

OBIの最新イメージは、[Docker Hub](https://hub.docker.com/r/otel/ebpf-instrument)で次の名前で見つけられます。

```text
ebpf-instrument:main
```

OBIコンテナは、次のように構成する必要があります。

- **特権**コンテナとして実行するか、`SYS_ADMIN` ケーパビリティを持つコンテナとして実行します(ただし、この最後のオプションは一部のコンテナ環境では機能しない場合があります)。
- `host` PID名前空間を使用して、他のコンテナ内のプロセスにアクセスできるようにします。

## Docker CLIの例 {#docker-cli-example}

この例では、HTTP/SまたはgRPCサービスを実行しているコンテナが必要です。
コンテナがない場合は、[Goで書かれたシンプルなブログエンジンサービス](https://macias.info)を使用できます。

```sh
docker run -p 18443:8443 --name goblog mariomac/goblog:dev
```

上記のコマンドは、シンプルなHTTPSアプリケーションを実行します。
このプロセスはコンテナの内部ポート`8443`を開き、ホストレベルではポート`18443`として公開されます。

環境変数を設定し、OBIが標準出力に出力し、実行可能ファイルを検査するようにポート(コンテナ)をリッスンするように構成します。

```sh
export OTEL_EBPF_TRACE_PRINTER=text
export OTEL_EBPF_OPEN_PORT=8443
```

OBIは次の設定で実行する必要があります。

- `--privileged` モード、または `SYS_ADMIN` ケーパビリティ(ただし、一部のコンテナ環境では `SYS_ADMIN` だけでは特権が不十分な場合があります)
- `--pid=host` オプションを使用したホストのPID名前空間を使用

```sh
docker run --rm \
  -e OTEL_EBPF_OPEN_PORT=8443 \
  -e OTEL_EBPF_TRACE_PRINTER=text \
  --pid=host \
  --privileged \
  docker.io/otel/ebpf-instrument:main
```

OBIの実行後、ブラウザで `https://localhost:18443` を開き、アプリを使用してテストデータを生成し、OBIが標準出力に次のようなトレースリクエストを出力することを確認します。

```sh
time=2023-05-22T14:03:42.402Z level=INFO msg="creating instrumentation pipeline"
time=2023-05-22T14:03:42.526Z level=INFO msg="Starting main node"
2023-05-22 14:03:53.5222353 (19.066625ms[942.583µs]) 200 GET / [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (355.792µs[321.75µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (170.958µs[142.916µs]) 200 GET /static/img.png [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (7.243667ms[295.292µs]) 200 GET /entry/201710281345_instructions.md [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (115µs[75.625µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
```

これで、OBIがターゲットのHTTPサービスをトレースするようになったので、OpenTelemetryエンドポイントにメトリクスとトレースを送信するか、Prometheusでメトリクスをスクレイプするように構成します。

トレースとメトリクスをエクスポートする方法については、[構成オプション](../../configure/options/)のドキュメントを参照してください。

## Docker Composeの例 {#docker-compose-example}

次のDocker composeファイルは、Docker CLIの例と同じ機能を再現します。

```yaml
version: '3.8'

services:
  # 計装するサービス。
  # 計装したい他のコンテナに変更してください。
  goblog:
    image: mariomac/goblog:dev
    ports:
      # 18843ポートを公開し、コンテナポート8443に転送します
      - '18443:8443'

  autoinstrumenter:
    image: docker.io/otel/ebpf-instrument:main
    pid: 'host'
    privileged: true
    environment:
      OTEL_EBPF_TRACE_PRINTER: text
      OTEL_EBPF_OPEN_PORT: 8443
```

次のコマンドでDocker composeファイルを実行し、アプリを使用してトレースを生成します。

```sh
docker compose -f compose-example.yml up
```

---
title: DockerコンテナとしてOBIを実行する
linkTitle: Docker
description: OBIをDockerコンテナとしてセットアップして実行し、別のコンテナを計装する方法を学びます。
weight: 3
default_lang_commit: 1a618723d0d64c5c05a4c6af5ebdfdea16ab2c5a
cSpell:ignore: goblog
---

OBIは、スタンドアロンのDockerコンテナとして実行し、別のコンテナで実行されているプロセスを計装できます。

OBIのコンテナイメージは、以下の両方のレジストリに公開されています。

- [Docker Hub](https://hub.docker.com/r/otel/ebpf-instrument):
  `otel/ebpf-instrument:v<version>`
- [GHCR](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/pkgs/container/opentelemetry-ebpf-instrumentation%2Febpf-instrument):
  `ghcr.io/open-telemetry/opentelemetry-ebpf-instrumentation/ebpf-instrument:v<version>`

開発タグは Docker Hub にも以下の名前で公開されています。

```text
otel/ebpf-instrument:main
```

OBIコンテナは、次のように構成する必要があります。

- 以下の例では**特権**コンテナとして実行するか、[有効な機能が必要とするケーパビリティ](../../security/)を付与します。
  v0.14.0 以降、ほとんどのプローブは `SYS_ADMIN` を必要としません。
  Go ライブラリレベルのコンテキスト伝搬やその他のユーザーメモリ書き込み機能では依然として必要です。
- `host` PID名前空間を使用して、他のコンテナ内のプロセスにアクセスできるようにします。

## イメージの署名と検証 {#image-signing-and-verification}

OBIコンテナイメージは、GitHub Actions の OIDC（OpenID Connect）プロトコルで認証されたエフェメラルキーを使用して、[Cosign](https://docs.sigstore.dev/cosign/signing/overview/) で署名されています。
これにより、OpenTelemetry プロジェクトが公開したコンテナの真正性と完全性が保証されます。

以下のコマンドを使用して、コンテナイメージの署名を検証できます。

```sh
export VERSION=v0.15.2

# Docker Hub のリリースイメージを検証する
cosign verify --certificate-identity-regexp 'https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/' --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' otel/ebpf-instrument:${VERSION}

# GHCR の同じリリースを検証する
cosign verify --certificate-identity-regexp 'https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/' --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' ghcr.io/open-telemetry/opentelemetry-ebpf-instrumentation/ebpf-instrument:${VERSION}
```

検証が成功すると、Cosign のクレームが検証されたことと署名されたイメージダイジェストが表示されます。
検証が失敗した場合は、以下を確認してください。

- クエリしたレジストリにタグが存在するか確認する
- `main` だけでなく、公開されたリリースタグを検証していることを確認する
- 上記に示された GitHub OIDC 発行者と ID 正規表現を使用していることを確認する

## Docker CLIの例 {#docker-cli-example}

この例では、HTTP/SまたはgRPCサービスを実行しているコンテナが必要です。
コンテナがない場合は、[Goで書かれたシンプルなブログエンジンサービス](https://macias.info)を使用できます。

```sh
export VERSION=v0.15.2
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

- この例では `--privileged` モード、または有効な機能が必要とするケーパビリティを使用
- `--pid=host` オプションを使用したホストのPID名前空間を使用

```sh
docker run --rm \
  -e OTEL_EBPF_OPEN_PORT=8443 \
  -e OTEL_EBPF_TRACE_PRINTER=text \
  --pid=host \
  --privileged \
  otel/ebpf-instrument:${VERSION}
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
    image: otel/ebpf-instrument:v0.15.2
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

## コンテキスト伝搬 {#context-propagation}

上記の例ではコンテキスト伝搬を有効にしていません。
`OTEL_EBPF_BPF_CONTEXT_PROPAGATION` を設定する場合は、以下のホストパスもOBIコンテナにマウントしてください。

- `/sys/kernel/tracing`: カーネル 6.6.128以降、6.12.75以降、6.18.14以降、および 6.19以降で、OBIはFIONREAD補正チェックを実行するためにこのマウントが必要です。
  これがないと、OBIはコンテキスト伝搬を無効にします。
  詳細は[コンテキスト伝搬に必要なホストマウント](../../security/#required-host-mount-for-context-propagation)を参照してください。
- `/sys/fs/cgroup`: OBIはこのパスを使用して、新しく作成されたソケットをリッスンします。
  これがないと、一部のリクエストでコンテキストが伝搬されない場合があります。
  詳細は[分散トレース](../../distributed-traces/)を参照してください。

```yaml
services:
  autoinstrumenter:
    image: otel/ebpf-instrument:main
    pid: 'host'
    privileged: true
    volumes:
      - /sys/kernel/tracing:/sys/kernel/tracing
      - /sys/fs/cgroup:/sys/fs/cgroup
    environment:
      OTEL_EBPF_OPEN_PORT: 8443
      OTEL_EBPF_BPF_CONTEXT_PROPAGATION: headers
```

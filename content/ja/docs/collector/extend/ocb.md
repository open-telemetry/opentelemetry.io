---
title: OpenTelemetry Collector Builderを使用してカスタムコレクターをビルドする
linkTitle: カスタムコレクターのビルド
description: OpenTelemetry Collectorの独自のディストリビューションを組み立てる
weight: 200
aliases: [/docs/collector/custom-collector/]
params:
  providers-vers: v1.48.0
default_lang_commit: c2343a16d205913e724abb7a959ec87ff7e80f89
cSpell:ignore: darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

OpenTelemetry Collectorには、特定のコンポーネントが事前に構成された5つの公式[ディストリビューション](/docs/collector/distributions/)があります。
より柔軟性が必要な場合は、[OpenTelemetry Collector Builder][ocb]（または`ocb`）を使用して、カスタムコンポーネント、アップストリームコンポーネント、およびほかの公開されている利用可能なコンポーネントを含む独自のディストリビューションのカスタムバイナリを生成できます。

次のガイドでは、`ocb`を使用して独自のコレクターをビルドする方法を説明します。
この例では、カスタムコンポーネントの開発とテストをサポートするコレクターディストリビューションを作成します。
任意のGolang統合開発環境（IDE）でコレクターコンポーネントを直接起動およびデバッグできます。
IDEのすべてのデバッグ機能（スタックトレースは素晴らしい教師です！）を使用して、コレクターがコンポーネントコードとどのように対話するかを理解します。

## 前提条件 {#prerequisites}

`ocb`ツールは、コレクターのディストリビューションをビルドするためにGoを必要とします。
開始する前に、マシンに[互換性のあるバージョン](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md#compatibility)のGoが[インストール](https://go.dev/doc/install)されていることを確認してください。

## OpenTelemetry Collector Builderのインストール {#install-the-opentelemetry-collector-builder}

`ocb`バイナリは、OpenTelemetry Collectorの[`cmd/builder`タグが付いたリリース][tags]からダウンロード可能なアセットとして入手できます。
オペレーティングシステムとチップセットに適したアセットを見つけてダウンロードしてください。

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

`ocb`が正しくインストールされたことを確認するには、ターミナルで`./ocb help`と入力します。
コマンドの`help`出力がコンソールに表示されるはずです。

## OpenTelemetry Collector Builderの構成 {#configure-the-opentelemetry-collector-builder}

YAMLマニフェストファイルで、`ocb`を構成します。
マニフェストには2つの主要なセクションがあります。
1つ目のセクションである`dist`には、コード生成とコンパイルプロセスの構成オプションが含まれています。
2つ目のセクションには、`extensions`、`exporters`、`receivers`、`processors`などのトップレベルのモジュールタイプが含まれています。
それぞれのモジュールタイプは、コンポーネントのリストを受け付けます。

マニフェストの`dist`セクションには、`ocb`コマンドラインの`flags`に相当するタグが含まれています。
次の表は、`dist`セクションの構成オプションを示しています。

| Tag                | Description                                                    | Optional         | Default Value                                                                     |
| ------------------ | -------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| module:            | Go modの規約に従った新しいディストリビューションのモジュール名 | はい、ただし推奨 | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:              | ディストリビューションのバイナリ名                             | はい             | `otelcol-custom`                                                                  |
| description:       | 長いアプリケーション名                                         | はい             | `Custom OpenTelemetry Collector distribution`                                     |
| output_path:       | 出力（ソースとバイナリ）を書き込むパス                         | はい             | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:           | カスタムOpenTelemetry Collectorのバージョン                    | はい             | `1.0.0`                                                                           |
| go:                | 生成されたソースのコンパイルに使用するGoバイナリ               | はい             | PATHから取得されるgo                                                              |
| debug_compilation: | 成果物のバイナリにデバッグを保存する                           | はい             | False                                                                             |

すべての`dist`タグはオプションです。
カスタムコレクターディストリビューションを他のユーザーが利用できるようにするか、または`ocb`を使用してコンポーネント開発およびテスト環境をブートストラップするかに応じて、それらのカスタム値を追加できます。

`ocb`を構成するには、次の手順に従います。

1. 次の内容で`builder-config.yaml`という名前のマニフェストファイルを作成します。

   ```yaml
   dist:
     name: otelcol-dev
     description: 開発者向けの基本的なOTelコレクターのディストリビューション
     output_path: ./otelcol-dev
   ```

1. カスタムコレクターディストリビューションに含めるコンポーネントのモジュールを追加します。
   さまざまなモジュールとコンポーネントの追加方法については、[`ocb`構成ドキュメント](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)を参照してください。

   この例のディストリビューションには、次のコンポーネントを追加します。
   - エクスポーター: OTLPとDebug
   - レシーバー: OTLP
   - プロセッサー: Batch

   `builder-config.yaml`マニフェストファイルは次のようになります。

   ```yaml
   dist:
     name: otelcol-dev
     description: 開発者向けの基本的なOTelコレクターのディストリビューション
     output_path: ./otelcol-dev

   exporters:
     - gomod: go.opentelemetry.io/collector/exporter/debugexporter {{%
         version-from-registry collector-exporter-debug %}}
     - gomod: go.opentelemetry.io/collector/exporter/otlpexporter {{%
         version-from-registry collector-exporter-otlp %}}

   processors:
     - gomod: go.opentelemetry.io/collector/processor/batchprocessor {{%
         version-from-registry collector-processor-batch %}}

   receivers:
     - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver {{%
         version-from-registry collector-receiver-otlp %}}

   providers:
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/envprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/fileprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpsprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/yamlprovider {{% param
         providers-vers %}}
   ```

{{% alert title="Tip" %}}

カスタムコレクターに追加できるコンポーネントのリストについては、[OpenTelemetry Registry](/ecosystem/registry/?language=collector)をご覧ください。
それぞれのレジストリのエントリには、`builder-config.yaml`に追加するために必要な完全な名前とバージョンが記載されていることに注意してください。

{{% /alert %}}

## コードを生成し、コレクターディストリビューションをビルドする {#generate-the-code-and-build-your-collector-distribution}

{{% alert title="Note" %}}

このセクションでは、`ocb`バイナリを使用してカスタムコレクターディストリビューションをビルドする方法を説明します。
Kubernetesなどのコンテナオーケスとレーターにカスタムコレクターディストリビューションをビルドしてデプロイしたい場合は、このセクションはスキップして、[コレクターディストリビューションのコンテナ化](#containerize-your-collector-distribution)を参照してください。

{{% /alert %}}

`ocb`がインストールおよび構成されたので、ディストリビューションをビルドする準備ができました。

ターミナルで次のコマンドを入力して、`ocb`を起動します。

```sh
./ocb --config builder-config.yaml
```

コマンドの出力は次のようになります。

```text
2025-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2025-06-03T15:05:37Z"}
2025-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2025-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2025-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2025-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2025-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2025-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

マニフェストの`dist`セクションで定義されているように、現在、コレクターディストリビューションのすべてのソースコードとバイナリを含む`otelcol-dev`という名前のフォルダーがあります。

フォルダ構成は次のようになります。

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

生成されたコードを使用して、コンポーネント開発プロジェクトをブートストラップし、これらのコンポーネントを使用して独自のコレクターディストリビューションをビルドおよび配布できます。

## コレクターディストリビューションのコンテナ化 {#containerize-your-collector-distribution}

{{% alert title="Note" %}}

このステップでは、`Dockerfile`内でコレクターのディストリビューションをビルドします。
Kubernetesのようなコンテナオーケストレーターにコレクターディストリビューションをデプロイする必要がある場合は、次の手順に従ってください。
コンテナ化せずにコレクターディストリビューションをビルドしたい場合は、[コードを生成し、コレクターディストリビューションをビルドする](#generate-the-code-and-build-your-collector-distribution)を参照してください。

{{% /alert %}}

カスタムコレクターをコンテナ化するには、次のステップに従います。

1. プロジェクトに2つの新しいファイルを追加します。
   - `Dockerfile` - コレクターのディストリビューションのコンテナイメージ定義
   - `collector-config.yaml` - ディストリビューションをテストするための最小限のコレクター構成YAML

   これらのファイルを追加した後、ファイルは次のようになります。

   ```text
   .
   ├── builder-config.yaml
   ├── collector-config.yaml
   └── Dockerfile
   ```

1. 次の内容を`Dockerfile`に追加します。
   この定義は、コレクターのディストリビューションをインプレースでビルドし、生成されたコレクターディストリビューションバイナリがターゲットコンテナアーキテクチャ（たとえば、`linux/arm64`、`linux/amd64`）と一致することを保証します。

   ```dockerfile
   FROM alpine:3.19 AS certs
   RUN apk --update add ca-certificates

   FROM golang:1.25.0 AS build-stage
   WORKDIR /build

   COPY ./builder-config.yaml builder-config.yaml

   RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@{{% version-from-registry collector-builder %}}
   RUN --mount=type=cache,target=/root/.cache/go-build builder --config builder-config.yaml

   FROM gcr.io/distroless/base:latest

   ARG USER_UID=10001
   USER ${USER_UID}

   COPY ./collector-config.yaml /otelcol/collector-config.yaml
   COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
   COPY --chmod=755 --from=build-stage /build/otelcol-dev /otelcol

   ENTRYPOINT ["/otelcol/otelcol-dev"]
   CMD ["--config", "/otelcol/collector-config.yaml"]

   EXPOSE 4317 4318 12001
   ```

1. `collector-config.yaml`ファイルに次の定義を追加します。

   ```yaml
   receivers:
     otlp:
       protocols:
         grpc:
           endpoint: 0.0.0.0:4317
         http:
           endpoint: 0.0.0.0:4318

   exporters:
     debug:
       verbosity: detailed

   service:
     pipelines:
       traces:
         receivers: [otlp]
         exporters: [debug]
       metrics:
         receivers: [otlp]
         exporters: [debug]
       logs:
         receivers: [otlp]
         exporters: [debug]
   ```

1. 次のコマンドを使用して、`linux/amd64`と`linux/arm64`をターゲットビルドアーキテクチャとして使用して、`ocb`のマルチアーキテクチャDockerイメージをビルドします。
   より詳しくは、マルチアーキテクチャビルドに関するこの[ブログ記事](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)をご覧ください。

   ```sh
   # Dockerマルチアーキテクチャビルドを有効にする
   docker run --rm --privileged tonistiigi/binfmt --install all
   docker buildx create --name mybuilder --use

   # DockerイメージをLinux AMDおよびARMとしてビルドし、ビルド結果を「docker images」にロードします
   docker buildx build --load \
     -t <collector_distribution_image_name>:<version> \
     --platform=linux/amd64,linux/arm64 .

   # 新たにビルドされたイメージをテストします
   docker run -it --rm -p 4317:4317 -p 4318:4318 \
       --name otelcol <collector_distribution_image_name>:<version>
   ```

## さらなる学びのために {#further-reading}

- [レシーバーをビルドする](/docs/collector/extend/custom-component/receiver)
- [コネクターをビルドする](/docs/collector/extend/custom-component/connector)

[ocb]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags

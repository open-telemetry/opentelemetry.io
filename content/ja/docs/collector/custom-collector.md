---
title: カスタムコレクターのビルド
weight: 29
default_lang_commit: 52ef6272047483d1d4913a7e5ce8532196c58b30 # patched
drifted_from_default: file not found
cSpell:ignore: darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

カスタムコレクターのレシーバー、プロセッサー、エクステンション、またはエクスポーターをビルドおよびデバッグする計画がある場合は、独自のコレクターインスタンスが必要になります。
これにより、任意のGolang IDE内でOpenTelemetry Collectorコンポーネントを直接起動およびデバッグできるようになります。

この方法でコンポーネント開発に取り組むもうひとつの興味深い側面は、IDEのすべてのデバッグ機能（スタックトレースは素晴らしい教師です！）を使用して、コレクター自体がコンポーネントのコードとどのように対話するかを理解できることです。

OpenTelemetryコミュニティは、独自のディストリビューションの組み立てを支援するために[OpenTelemetry Collector builder][ocb]（略して`ocb`）と呼ばれるツールを開発しました。
これにより、公開されているコンポーネントとともにカスタムコンポーネントを含むディストリビューションを簡単にビルドできるようになります。

プロセスの一環として、`ocb`は独自のカスタムコンポーネントのビルドとデバッグに役立つコレクターのソースコードを生成します。
それでは始めましょう。

## ステップ 1 - ビルダーのインストール {#step-1---install-the-builder}

{{% alert color="primary" title="注意" %}}

`ocb`ツールは、コレクターのディストリビューションをビルドするためにGoを必要とします。
まだのインストールしていない場合は、マシンに[Goをインストール](https://go.dev/doc/install)してください。

{{% /alert %}}

`ocb`バイナリは、OpenTelemetry Collectorの[`cmd/builder`タグが付いたリリース][tags]からダウンロード可能なアセットとして入手できます。
OSとチップセットに基づいて名前が付けられたアセットのリストがあるため、ご自身の構成に適したものをダウンロードしてください。

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

`ocb`が使用可能であることを確認するには、ターミナルに移動して`./ocb help`と入力し、Enterキーを押すと`help`コマンドの出力がコンソールに表示されるはずです。

## ステップ 2 - ビルダーマニフェストファイルの作成 {#step-2---create-a-builder-manifest-file}

ビルダーの`manifest`ファイルは`yaml`であり、コード生成とコンパイルプロセスに関する情報と、コレクターのディストリビューションに追加したいコンポーネントを組み合わせて渡します。

`manifest`は、コード生成とコンパイルプロセスの構成に役立つタグを含む`dist`という名前のマップで始まります。
実際に`dist`のすべてのタグは、`ocb`コマンドラインの`flags`に相当します。

`dist`マップのタグは次のとおりです。

| タグ         | 説明                                                                                       | 任意 | デフォルト値                                                                      |
| ------------ | ------------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------- |
| module:      | Go modの規約に従った、新しいディストリビューションのモジュール名。任意ですが推奨されます。 | はい | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:        | ディストリビューションのバイナリ名。                                                       | はい | `otelcol-custom`                                                                  |
| description: | 長いアプリケーション名。                                                                   | はい | `Custom OpenTelemetry Collector distribution`                                     |
| output_path: | 出力（ソースとバイナリ）を書き込むパス。                                                   | はい | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:     | カスタムOpenTelemetry Collectorのバージョン。                                              | はい | `1.0.0`                                                                           |
| go:          | 生成されたソースのコンパイルに使用するGoバイナリ。                                         | はい | PATHから取得されるgo                                                              |

上の表からわかるように、すべての`dist`タグはオプショナルであるため、カスタムコレクターディストリビューションの利用可能性を他のユーザーに提供する意図があるか、または単に`ocb`を使用してコンポーネントの開発およびテスト環境をブートストラップするだけかに応じて、それらのカスタム値を追加します。

このチュートリアルでは、コンポーネントの開発とテストをサポートするコレクターのディストリビューションを作成します。

次の内容で`builder-config.yaml`という名前のマニフェストファイルを作成します。

```yaml
dist:
  name: otelcol-dev
  description: 開発者向けの基本的なOTelコレクターのディストリビューション
  output_path: ./otelcol-dev
```

次に、このカスタムコレクターディストリビューションに組み込みたいコンポーネントを表すモジュールを追加する必要があります。
それぞれのモジュールとコンポーネントの追加方法については、[ocb設定ドキュメント](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)をご覧ください。

開発とテストのコレクターディストリビューションに次のコンポーネントを追加します。

- エクスポーター: OTLPおよびDebug
- レシーバー: OTLP
- プロセッサー: Batch

`builder-config.yaml`マニフェストファイルは、コンポーネントの追加後、次のようになります。

<!-- prettier-ignore -->
```yaml
dist:
  name: otelcol-dev
  description: 開発者向けの基本的なOTelコレクターのディストリビューション
  output_path: ./otelcol-dev

exporters:
  - gomod:
      go.opentelemetry.io/collector/exporter/debugexporter {{% version-from-registry collector-exporter-debug %}}
  - gomod:
      go.opentelemetry.io/collector/exporter/otlpexporter {{% version-from-registry collector-exporter-otlp %}}

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor {{% version-from-registry collector-processor-batch %}}

receivers:
  - gomod:
      go.opentelemetry.io/collector/receiver/otlpreceiver {{% version-from-registry collector-receiver-otlp %}}

providers:
  - gomod: go.opentelemetry.io/collector/confmap/provider/envprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/fileprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpsprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/yamlprovider v1.18.0
```

{{% alert color="primary" title="Tip" %}}

カスタムコレクターに追加できるコンポーネントのリストについては、[OpenTelemetry Registry](/ecosystem/registry/?language=collector)をご覧ください。
レジストリのエントリには、`builder-config.yaml`に追加するために必要な完全な名前とバージョンが記載されていることに注意してください。

{{% /alert %}}

## ステップ 3a - コードを生成し、コレクターのディストリビューションをビルドする {#step-3a---generate-the-code-and-build-your-collectors-distribution}

{{% alert color="primary" title="Note" %}}

このステップは、`ocb`バイナリを使用してカスタムコレクターのディストリビューションをビルドするために使用されます。
（たとえば、Kubernetesのような）コンテナオーケストレーターにカスタムコレクターのディストリビューションをビルドしてデプロイしたい場合は、このステップをスキップして[ステップ 3b](#step-3b---containerize-your-collectors-distribution)に進んでください。

{{% /alert %}}

必要なのは`ocb`に仕事をさせることだけなので、ターミナルに移動して次のコマンドを入力します。

```cmd
./ocb --config builder-config.yaml
```

すべてが順調に進んだ場合、コマンドの出力は次のようになります。

```nocode
2022-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2023-01-03T15:05:37Z"}
2022-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2022-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2022-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2022-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2022-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

設定ファイルの`dist`セクションで定義されているように、現在コレクターのディストリビューションのソースコードとバイナリを含む`otelcol-dev`という名前のフォルダがあります。

フォルダ構成は次のようになります。

```console
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

生成されたコードを使用して、コンポーネント開発プロジェクトをブートストラップし、コンポーネントを使用してコレクターのディストリビューションを簡単にビルドおよび配布できるようになりました。

## ステップ 3b - コレクターのディストリビューションをコンテナ化する {#step-3b---containerize-your-collectors-distribution}

{{% alert color="primary" title="注意" %}}

このステップでは、`Dockerfile`内でコレクターのディストリビューションをビルドします。
（たとえば、Kubernetesのような）コンテナオーケストレーターにコレクターのディストリビューションをデプロイする必要がある場合は、このステップに従ってください。
コンテナ化せずにコレクターのディストリビューションのみをビルドしたい場合は、[ステップ 3a](#step-3a---generate-the-code-and-build-your-collectors-distribution)に進んでください。

{{% /alert %}}

プロジェクトに次の2つの新しいファイルを追加する必要があります。

- `Dockerfile` - コレクターのディストリビューションのコンテナイメージ定義
- `collector-config.yaml` - ディストリビューションをテストするための最小限のコレクター構成YAML

これらのファイルを追加した後、ファイルは次のようになります。

```console
.
├── builder-config.yaml
├── collector-config.yaml
└── Dockerfile
```

次の`Dockerfile`は、コレクターのディストリビューションをインプレースでビルドし、結果として得られるコレクターのディストリビューションバイナリがターゲットのコンテナアーキテクチャ（たとえば、`linux/arm64`、`linux/amd64`）と一致することを保証します。

<!-- prettier-ignore-start -->
```yaml
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
<!-- prettier-ignore-end -->

最小限の`collector-config.yaml`定義は次のとおりです。

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

次のコマンドを使用して、`linux/amd64`と`linux/arm64`をターゲットビルドアーキテクチャとして使用して、OCBのマルチアーキテクチャDockerイメージをビルドします。
より詳しくは、マルチアーキテクチャビルドに関するこの[ブログ記事](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/)をご覧ください。

```bash
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

- [トレースレシーバーをビルドする](/docs/collector/extend/custom-component/receiver/)
- [コネクターをビルドする](/docs/collector/extend/custom-component/connector/)

[ocb]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags

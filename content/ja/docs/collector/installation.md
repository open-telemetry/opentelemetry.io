---
title: コレクターのインストール
weight: 2
default_lang_commit: a570a00
# prettier-ignore
cSpell:ignore: darwin dpkg GOARCH journalctl kubectl otelcorecol pprof tlsv zpages
---

OpenTelemetryコレクターはさまざまなオペレーティングシステムやアーキテクチャにデプロイできます。
以下の手順は、コレクターの最新の安定版をダウンロードしてインストールする方法を示しています。

OpenTelemetryコレクターに適用可能なデプロイメントモデル、コンポーネント、リポジトリについてよく知らない場合は、まず[データ収集][Data Collection]と[デプロイ方法][Deployment Methods]のページを確認してください。

## Docker

以下のコマンドはDockerイメージをプルし、コレクターをコンテナ内で実行します。
`{{% param vers %}}` を実行したいコレクターのバージョンに置き換えてください。

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker pull otel/opentelemetry-collector-contrib:{{% param vers %}}
docker run otel/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

作業ディレクトリからカスタム設定ファイルを読み込むには、そのファイルをボリュームとしてマウントします。

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose

以下の例のように、既存の `docker-compose.yaml` ファイルにOpenTelemetryコレクターを追加できます。

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the Collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
```

## Kubernetes

次のコマンドは、エージェントをデーモンセットと単一のゲートウェイインスタンスとしてデプロイします。

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

先ほどの例は、本番環境で使う前に拡張したりカスタマイズしたりするための、出発点としてのものです。
本番環境でのカスタマイズとインストールについては、[OpenTelemetry Helm Charts][] を参照してください。

また、[OpenTelemetry Operator][] を使って、OpenTelemetryコレクターインスタンスのプロビジョニングとメンテナンスを行えます。
この機能には、自動アップグレード処理、OpenTelemetry コンフィギュレーションに基づいた `Service` コンフィギュレーション、デプロイメントへの自動サイドカーインジェクションなどがあります。

Kubernetesでコレクターを使用する方法については、[Kubernetesで始める](/docs/kubernetes/getting-started/)を参照してください。

## Nomad

[HashiCorp NomadでOpenTelemetryを始める][Getting Started with OpenTelemetry on HashiCorp Nomad]に、エージェント、ゲートウェイとして、あるいは完全なデモの形でコレクターをデプロイするための参照ジョブファイルがあります。

## Linux

すべてのコレクターのリリースには、Linux amd64/arm64/i386システム用のAPK、DEB、RPMパッケージが含まれています。
インストール後のデフォルト設定は `/etc/otelcol/config.yaml` にあります。

> Note: サービスの自動設定には `systemd` が必要です。

### APKのインストール

Alpine系のシステムを使い始めるには、以下のコマンドを実行します。

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.apk
apk add --allow-untrusted otelcol_{{% param vers %}}_linux_amd64.apk
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.apk
apk add --allow-untrusted otelcol_{{% param vers %}}_linux_arm64.apk
```

{{% /tab %}} {{% tab i386 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.apk
apk add --allow-untrusted otelcol_{{% param vers %}}_linux_386.apk
```

{{% /tab %}} {{< /tabpane >}}

### DEBのインストール

Debian系のシステムで使い始めるには、以下のコマンドを実行します。

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_amd64.deb
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_arm64.deb
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_386.deb
```

{{% /tab %}} {{< /tabpane >}}

### RPMのインストール

Red Hat系のシステムで使い始めるには、以下のコマンドを実行します。

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_amd64.rpm
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_arm64.rpm
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_386.rpm
```

{{% /tab %}} {{< /tabpane >}}

### 手動でのLinuxへのインストール

Linux向けの[リリース][releases]は、さまざまなアーキテクチャに対応しています。
バイナリを含むファイルをダウンロードし、あなたのマシンに手動でインストールしてください。

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_arm64.tar.gz
```

{{% /tab %}} {{% tab i386 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_386.tar.gz
```

{{% /tab %}} {{% tab ppc64le %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

### 自動サービスコンフィギュレーション

デフォルトでは、`otelcol` systemd サービスはインストール後に `--config=/etc/otelcol/config.yaml` オプションをつけて起動します。

別の設定を使うには、`/etc/otelcol/otelcol.conf` systemd 環境ファイルにある `OTELCOL_OPTIONS` 変数を適切なコマンドラインオプションに設定します。
`/usr/bin/otelcol --help` を実行すると、利用可能なすべてのオプションを確認できます。
このファイルに追加の環境変数を追加して `otelcol` サービスに渡せます。

コレクターの設定ファイルまたは `/etc/otelcol/otelcol.conf` を変更した場合は、`otelcol` サービスを再起動して変更を適用します。

```sh
sudo systemctl restart otelcol
```

`otelcol` サービスからの出力をチェックするには、以下を実行します。

```sh
sudo journalctl -u otelcol
```

## macOS

macOS向けの [リリース][releases] は Intel および ARM システムで利用可能です。
リリースはgzip圧縮されたtarball (`.tar.gz`) としてパッケージ化されています。
解凍するには、以下のコマンドを実行してください。

{{< tabpane text=true >}} {{% tab Intel %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_arm64.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

すべてのコレクターのリリースには、解凍後に実行できる `otelcol` 実行ファイルが含まれています。

## Windows

Windows向けの [リリース][releases] は gzip された tarball (`.tar.gz`) としてパッケージ化されています。
すべてのコレクターのリリースには、解凍後に実行できる `otelcol.exe` 実行ファイルが含まれています。

## ソースからビルドする

以下のコマンドを使用して、ローカルのオペレーティングシステムに基づいてコレクターの最新バージョンをビルドできます。

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
[opentelemetry helm charts]: /docs/kubernetes/helm/
[opentelemetry operator]: /docs/kubernetes/operator/
[getting started with opentelemetry on hashicorp nomad]: https://github.com/hashicorp/nomad-open-telemetry-getting-started
[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases

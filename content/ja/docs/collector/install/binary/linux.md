---
title: Linuxにコレクターをインストールする
linkTitle: Linux
weight: 100
default_lang_commit: c88a006471f039334aed7990736e089a62b33f94
---

すべてのコレクターのリリースには、Linux amd64/arm64/i386システム用のAPK、DEB、RPMパッケージが含まれています。
インストール後のデフォルト設定は `/etc/otelcol/config.yaml` にあります。

> Note: サービスの自動設定には `systemd` が必要です。

## DEBのインストール {#deb-installation}

Debian系のシステムで使い始めるには、以下のコマンドを実行します。

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_amd64.deb
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
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

## RPMのインストール {#rpm-installation}

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

## 手動でのインストール {#manual-installation}

Linux向けの[リリース][releases]は、さまざまなアーキテクチャに対応しています。
バイナリファイルをダウンロードし、あなたのマシンに手動でインストールしてください。

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

## 自動サービスコンフィギュレーション {#automatic-service-configuration}

OpenTelemetry Collector が `systemd` サービスとして動作する場合、デフォルトで `/etc/otelcol/config.yaml` 設定ファイルを使用して起動します。

この設定を変更したい場合は、`systemd` 環境ファイル `/etc/otelcol/otelcol.conf` 内の `OTELCOL_OPTIONS` 変数を編集します。
同じファイルで `otelcol` サービスの追加の環境変数を定義することもできます。
利用可能なすべてのオプションの一覧を確認するには、以下のコマンドを実行します。

```sh
/usr/bin/otelcol --help
```

Collector の設定ファイル（`config.yaml`）または環境ファイル（`otelcol.conf`）を変更した場合は、サービスを再起動して変更を適用する必要があります。

```sh
sudo systemctl restart otelcol
```

`otelcol` サービスのログ出力をチェックするには、以下を実行します。

```sh
sudo journalctl -u otelcol
```

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases

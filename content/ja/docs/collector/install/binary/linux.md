---
title: Linuxにコレクターをインストールする
linkTitle: Linux
weight: 100
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

## Linux {#linux}

すべてのコレクターのリリースには、Linux amd64/arm64/i386システム用のAPK、DEB、RPMパッケージが含まれています。
インストール後のデフォルト設定は `/etc/otelcol/config.yaml` にあります。

> Note: サービスの自動設定には `systemd` が必要です。

### DEBのインストール {#deb-installation}

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

### RPMのインストール {#rpm-installation}

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

### 手動でのLinuxへのインストール {#manual-linux-installation}

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

### 自動サービスコンフィギュレーション {#automatic-service-configuration}

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

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases

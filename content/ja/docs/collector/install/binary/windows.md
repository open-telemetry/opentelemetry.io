---
title: Windowsでコレクターをインストールする
linkTitle: Windows
weight: 300
default_lang_commit: ec1657d18d8e1c63bf353049e8a7bf7e65c3e9cb
---

## Windows {#windows}

Windows向けの [リリース][releases] はMSIインストーラーと gzip された tarball (`.tar.gz`) として利用できます。
MSIはディストリビューション名をつけたWindowsサービスとしてコレクターをインストールし、表示名を「OpenTelemetry Collector」として、ディストリビューション名でアプリケーションイベントログのソースを登録します。

### MSIインストール {#msi-installation}

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

### 手動インストール {#manual-installation}

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

すべてのリリースには、インストール後に実行できるコレクターの実行ファイルが含まれています。

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases

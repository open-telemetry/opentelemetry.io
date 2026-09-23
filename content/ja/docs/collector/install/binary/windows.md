---
title: Windowsでコレクターをインストールする
linkTitle: Windows
weight: 300
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

Windows 向けの[リリース][releases]は MSI インストーラーと gzip された tarball（`.tar.gz`）として利用できます。

## MSI インストール {#msi-installation}

MSI はディストリビューション名をつけた Windows サービスとしてコレクターをインストールし、表示名を「OpenTelemetry Collector」とします。
また、ディストリビューション名でアプリケーションイベントログのソースを登録します。

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

## 手動インストール {#manual-installation}

gzip された tarball を展開するには、次のコマンドを実行します。

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

すべての Collector リリースには、インストールして実行できる実行ファイルが含まれています。

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases

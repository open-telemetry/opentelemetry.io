---
title: 在 Windows 上安装 Collector
linkTitle: Windows
weight: 300
default_lang_commit: 4f007739e0f0fc0b178b8dae457ef06c1c9a5757
---

Windows [发布版本](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)提供 MSI 安装包和压缩 tarball (`.tar.gz`)。

## MSI 安装 {#msi-installation}

MSI 会将 Collector 安装为 Windows 服务，服务名与发行版名称相同，显示名称为 "OpenTelemetry Collector"。它还会以发行版名称注册一个应用程序事件日志源。

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

## 手动安装 {#manual-installation}

要解压压缩 tarball，请运行以下命令：

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

每个 Collector 版本都包含一个可执行文件，解压后即可安装并运行。

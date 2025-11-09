---
title: Install the Collector on Windows
aliases: [../installation/#windows]
---

## Windows

Windows [releases][] are available as MSI installers and gzipped tarballs
(`.tar.gz`). The MSI installs the Collector as a Windows service named after the
distribution, with the display name "OpenTelemetry Collector", and registers an
Application Event Log source with the distribution name.

### MSI installation

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

### Manual installation

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

Every release includes the Collector executable that you can run after
installation.

[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases

---
title: Install the Collector on Windows
linkTitle: Windows
weight: 300
---

Windows [releases][] are available as MSI installers and gzipped tarballs
(`.tar.gz`).

## MSI installation

The MSI installs the Collector as a Windows service named after the
distribution, with the display name "OpenTelemetry Collector". It also registers
an Application Event Log source with the distribution name.

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

## Manual installation

To unpack the gzipped tarball, run the following command:

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

Every Collector release includes an executable that you can install and run.

[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases

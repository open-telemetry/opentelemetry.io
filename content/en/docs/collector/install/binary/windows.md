---
title: Install the Collector on Windows
redirect_from:
  - /docs/collector/installation/#windows
---

## Windows

### MSI Installation

Download from GitHub releases and run:

```
OpenTelemetry-Collector.msi
```

### Manual Installation

Unzip the binary:

```
otelcol_windows_amd64.zip
```

Run:

```powershell
otelcol.exe --config config.yaml
```

Use Windows Services Manager to configure as a service.
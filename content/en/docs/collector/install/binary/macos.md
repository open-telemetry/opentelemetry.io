---
title: Install the Collector on macOS
redirect_from:
  - /docs/collector/installation/#macos
---

## macOS

Download the macOS binary:

```bash
curl -L \
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest/download/otelcol_darwin_amd64.tar.gz \
  -o otelcol.tar.gz
tar -xvf otelcol.tar.gz
sudo mv otelcol /usr/local/bin/
```

Run:

```bash
otelcol --config config.yaml
```
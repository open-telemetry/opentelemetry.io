---
title: Install the Collector on Linux
redirect_from:
  - /docs/collector/installation/#linux
---

## Linux Installation

You can install the Collector using DEB or RPM packages or manually.

### DEB Installation

```bash
curl -L https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest/download/otelcol_amd64.deb -o otelcol.deb
sudo dpkg -i otelcol.deb
```

Manage via systemd:

```bash
sudo systemctl start otelcol
sudo systemctl status otelcol
```

### RPM Installation

```bash
curl -L https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest/download/otelcol_x86_64.rpm -o otelcol.rpm
sudo rpm -Uvh otelcol.rpm
```

### Manual Linux installation

```bash
tar -xvf otelcol_<version>_linux_amd64.tar.gz
sudo mv otelcol /usr/local/bin/
```

### Automatic service configuration

Systemd example:

```ini
[Service]
ExecStart=/usr/local/bin/otelcol --config=/etc/otelcol/config.yaml
Restart=always
```

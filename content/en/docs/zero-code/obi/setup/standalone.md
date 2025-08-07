---
title: Run OBI as a standalone process
linkTitle: Standalone
description: Learn how to setup and run OBI as a standalone Linux process.
weight: 4
---

OBI can run as a standalone Linux OS process with elevated privileges that can
inspect other running processes.

## Download and install

You can download the OBI executable from the
[OBI releases page](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases).

## Set up OBI

1. Create a configuration file following the
   [configuration options](../../configure/options/) documentation.

2. Run OBI as a privileged process:

```bash
sudo ./obi --config=<path to config file>
```

## Example configuration

Here's an example configuration file (`obi-config.yml`):

```yaml
# Basic configuration
discovery:
  services:
    - name: my-service
      open_ports: [8080, 8090]
      exe_path: /usr/local/bin/my-service

# Traces configuration
traces:
  # Enable tracing
  enabled: true

  # OpenTelemetry endpoint
  otlp_endpoint: http://localhost:4318

  # Trace format
  format: otlp

# Metrics configuration
metrics:
  # Enable metrics
  enabled: true

  # OpenTelemetry endpoint
  otlp_endpoint: http://localhost:4318

  # Metrics format
  format: otlp

# Logging configuration
log_level: info
```

## Run OBI

Run OBI with the configuration file:

```bash
sudo ./obi --config=obi-config.yml
```

## Configuration options

For a complete list of configuration options, see the
[configuration documentation](../../configure/options/).

## Permissions

OBI requires elevated privileges to function properly. For more information
about the specific capabilities required, see the
[security documentation](../../security/).

## Example: Docker instrumentation

To instrument a Docker container, you can run OBI on the host:

```bash
sudo ./obi --config=obi-config.yml
```

With a configuration that targets the container:

```yaml
discovery:
  services:
    - name: my-container-service
      open_ports: [8080]
      exe_path: /proc/*/root/app/my-app
```

## Example: System-wide instrumentation

To instrument all services on a system:

```yaml
discovery:
  services:
    - name: all-services
      open_ports: [80, 443, 8080, 8443]

log_level: info
```

This configuration will instrument all processes listening on the specified
ports.

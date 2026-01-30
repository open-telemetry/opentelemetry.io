---
title: Run OBI as a standalone process
linkTitle: Standalone
description: Learn how to setup and run OBI as a standalone Linux process.
weight: 5
---

OBI can run as a standalone Linux OS process with elevated privileges that can
inspect other running processes.

## Download and install

> [!NOTE]
>
> We are working on providing a standalone binary distribution.
> To track planned updates, see
> [open-telemetry/opentelemetry-ebpf-instrumentation#13][#13].

You can download the OBI executable from the
[OBI releases page](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases).

## Set up OBI

1. Create a configuration file following the
   [configuration options](../../configure/options/) documentation.
   You can start with the [OBI configuration YAML example](../../configure/example/)

2. Run OBI as a privileged process:

```bash
sudo ./obi --config=<path to config file>
```

## Permissions

OBI requires elevated privileges to function properly. For more information
about the specific capabilities required, see the
[security documentation](../../security/).

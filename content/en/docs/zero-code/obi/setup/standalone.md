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
> We are working on providing a standalone binary distribution. To track planned
> updates, see [open-telemetry/opentelemetry-ebpf-instrumentation#13][#13].

[#13]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/13

You can get OBI by extracting the necessary files from the container image.

```sh
IMAGE=ghcr.io/open-telemetry/opentelemetry-ebpf-instrumentation/ebpf-instrument:latest
docker pull $IMAGE
ID=$(docker create $IMAGE)
docker cp $ID:ebpf-instrument .
docker cp $ID:obi-java-agent.jar .
docker rm -v $ID
```

It is important that both `ebpf-instrument` and `obi-java-agent.jar` are located
in the same directory.

## Set up OBI

1. Create a configuration file following the
   [configuration options](../../configure/options/) documentation. You can
   start with the [OBI configuration YAML example](../../configure/example/)

2. Run OBI as a privileged process:

```bash
sudo ./ebpf-instrument --config=<path to config file>
```

## Permissions

OBI requires elevated privileges to function properly. For more information
about the specific capabilities required, see the
[security documentation](../../security/).

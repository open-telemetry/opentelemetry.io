---
title: Install the Collector
aliases:
  - /docs/collector/installation/
weight: 2
cSpell:ignore: darwin dpkg journalctl kubectl otelcorecol pprof tlsv zpages
---

You can deploy the OpenTelemetry Collector on a wide variety of operating
systems and architectures. The following instructions show how to download and
install the latest stable version of the Collector.

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection][]
and [Deployment Methods][] pages.

## Installation Options

Choose your installation method:

- [Install with Docker](./docker/)
- [Install with Kubernetes](./kubernetes/)
- [Install from a Binary](./binary/)

## Build from source

You can build the latest version of the Collector based on the local operating
system using the following commands:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
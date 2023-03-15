---
title: OpenTelemetry Collector Builder (OCB)
linkTitle: Builder
weight: 25
---

The OpenTelemetry Collector Builder (OCB) is a command-line tool that allows
users to build a custom [distribution](../distributions) for the OpenTelemetry
Collector.

This tool is currently being used to build both the
[core](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol)
and the
[contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)
distributions. It can be used to build custom distributions as well, allowing
users to cherry-pick components they need for their production usage,
potentially even including their own custom components.

## Installing

Download `ocb` from the Collector's
[release page](https://github.com/open-telemetry/opentelemetry-collector/releases).
A container image is **NOT** available at this time. We recommend that you
download and use the same version that you'll use in your manifest, since the
builder is only guaranteed to work with the OpenTelemetry Collector API matching
the builder's version.

> Attention: you need the [Go](https://go.dev/) tooling, even if you don't
> intend to compile your distribution.

## Manifest

A central part of a custom distribution is the distribution's manifest. This
manifest defines the metadata for the distribution and lists all components that
should be included.

This is an example `manifest.yaml`, containing only four components:

```yaml
dist:
  module: github.com/open-telemetry/opentelemetry-collector-releases/sidecar
  name: sidecar
  description: OpenTelemetry Collector Sidecar version
  version: 0.73.0
  output_path: ./_build
  otelcol_version: 0.73.0

receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.73.0

exporters:
  - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.73.0
  - gomod: go.opentelemetry.io/collector/exporter/otlphttpexporter v0.73.0

processors:
  - gomod: go.opentelemetry.io/collector/processor/batchprocessor v0.73.0
```

The properties under the `dist` section are metadata about the distribution.
Some of them, like the name and description end up being used by the
distribution itself in places such as the help command (`--help`)

> Tip: you can keep the manifest in a source code repository and generate the
> binaries via your CI/CD pipeline

## Building the custom distribution

Build a distribution by running the following command:

```sh
ocb --config manifest.yaml
```

This generates a binary under `./_build/sidecar` as per `output_path` in the
manifest. It is a regular OpenTelemetry Collector binary that can be configured
and started like the official distributions. For instance, this is a valid
configuration file for this distribution:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
processors:

exporters:
  otlp:
    endpoint: example.com:4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp]
```

If the previous configuration is saved to `sidecar.yaml`, then you can start the
custom distribution as follows:

```sh
./_build/sidecar --config sidecar.yaml
```

## Generating the sources

By default, `ocb` will generate the sources and will compile the distribution in
one go. While this is recommended practice, there are situations where you do
not want to generate the binary on the same step, or perhaps you want to
generate the sources and further customize it. In such cases, use the
`--skip-compilation` flag: the sources will be available under `_build` but no
binaries will be generated. For better maintainability, add your custom code to
their own source files, making only brief references on the generated files.

[ocb]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder

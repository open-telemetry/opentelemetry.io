---
title: Migrating away from the Jaeger exporter in the Collector
linkTitle: Jaeger Collector Exporter Migration
date: 2023-09-14
author: >-
  [Alex Boten](https://github.com/codeboten) (Lightstep)
cSpell:ignore:
---

The
[latest binary](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.85.0)
release of the OpenTelemetry Collector no longer includes exporters for the
native Jaeger format. This change was prompted because Jaeger has support for
OTLP out of the box. If you are a current user of either the Jaeger or Jaeger
Thrift exporter, you have a couple of options to choose from when upgrading to
the latest Collector.

## Switch to OTLP exporter

The recommended option is to switch to the OpenTelemetry Protocol exporter. This
exporter is included in all the official distributions supported by the
community. To switch, you'll need to update the collector configuration. Find
the following Jaeger exporter configuration:

```yaml
exporters:
  jaeger:
    endpoint: https://jaeger.example.com:14250

service:
  pipelines:
    exporters: [jaeger]
```

And replace it with the OTLP configuration:

```yaml
exporters:
  otlp/jaeger: # Jaeger supports OTLP directly. The default port for OTLP/gRPC is 4317
    endpoint: https://jaeger.example.com:4317

service:
  pipelines:
    exporters: [otlp/jaeger]
```

Depending on your version of Jaeger, you may need to set the following
environment variable `COLLECTOR_OTLP_ENABLED=true`.

## Build a custom Collector

If switching to the OTLP exporter isn't an option, an alternative is to build a
custom Collector that includes the Jaeger exporter. The process to build is
documented [here](https://opentelemetry.io/docs/collector/custom-collector/).
Your manifest file will need to include the following line to add the Jaeger
exporter:

```yaml
exporters:
  - gomod: go.opentelemetry.io/collector/exporter/jaegerexporter v0.85.0
  - gomod:
      go.opentelemetry.io/collector/exporter/jaegerthrifthttpexporter v0.85.0
```

Further example of manifest files for existing Collector distributions can be
found in the
[opentelemetry-collector-releases](https://github.com/open-telemetry/opentelemetry-collector-releases/blob/main/distributions/otelcol)
repository.

If either of these options do not work for your use-case, please reach out to
the [#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) community via [CNCF Slack](https://slack.cncf.io) or open an
issue in the
[repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/new/choose).

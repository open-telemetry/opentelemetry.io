---
title: Configuration
weight: 20
description:
  Point the OpenTelemetry Injector at your Collector or backend and control what
  gets instrumented on a Linux host.
cSpell:ignore: metapackage
---

After [installing](../installation/) the system packages, the
[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector)
instruments supported applications and exports telemetry using OTLP to
`localhost` on ports `4317` (gRPC) and `4318` (HTTP) by default. This page
describes how to change where telemetry is sent and how to adjust the injected
configuration.

## Set the export destination

The recommended setup is to run a local
[OpenTelemetry Collector](/docs/collector/) on the host that receives this
telemetry and forwards it to your backend.

To send telemetry somewhere else, edit the injector environment file at
`/etc/opentelemetry/injector/default_env.conf`. Any environment variable set
there is applied to every instrumented process. For example, to export directly
to an OTLP endpoint that requires an API key:

```conf
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com
OTEL_EXPORTER_OTLP_HEADERS=api-key=REPLACE_ME
```

Because `default_env.conf` uses standard OpenTelemetry environment variables,
you can configure any SDK behavior the same way, such as `OTEL_SERVICE_NAME`,
`OTEL_RESOURCE_ATTRIBUTES`, or the various sampler and exporter settings. See
[SDK environment variables](/docs/languages/sdk-configuration/) for the full
list.

Restart your applications for configuration changes to take effect.

## Use a configuration file

For richer setups you can drive the instrumentation with a
[declarative configuration](/docs/languages/sdk-configuration/declarative-configuration/)
file instead of individual environment variables. You rarely need to write one
from scratch: each language package ships a ready-to-use reference file at
`/etc/opentelemetry/<language>/otel-config.yaml` that wires up the exporter
endpoint, headers, and service name through environment-variable interpolation.

Copy or adapt that file to a location of your choice, then activate it by
setting `OTEL_CONFIG_FILE` in `/etc/opentelemetry/injector/default_env.conf`:

```conf
OTEL_CONFIG_FILE=/etc/opentelemetry/config.yaml
```

> [!NOTE]
>
> For .NET, file-based configuration also requires
> `OTEL_EXPERIMENTAL_FILE_BASED_CONFIGURATION_ENABLED=true`. Without it, the
> configuration file is silently ignored.

## Run a local Collector

Running a [Collector](/docs/collector/) on the host lets you keep the export
configuration of your applications simple: they send OTLP to `localhost`, and
the Collector handles batching, retries, and routing to one or more backends.
Install and run the Collector separately for now; it is not yet part of the base
`opentelemetry` metapackage.

## Next steps

- Learn more about the [OpenTelemetry Collector](/docs/collector/).
- Review the available
  [SDK environment variables](/docs/languages/sdk-configuration/).

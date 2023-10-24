---
title: Getting Started
cSpell:ignore: docker dokey dpkg okey telemetrygen
weight: 1
---

The OpenTelemetry Collector listens to [traces](/docs/concepts/signals/traces/), [metrics](/docs/concepts/signals/metrics/) and [logs](/docs/concepts/signals/logs/), processes the
telemetry, and exports it to a wide variety of observability back-ends using its
components. For a conceptual overview of the collector, read the
[introduction](/docs/collector).

The following tutorial shows how to deploy the OpenTelemetry Collector and send telemetry to
it using the default configuration and the
[telemetrygen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)
utility.

## Prerequisites

To follow this tutorial you need the following

- [Go](https://go.dev/) 1.20 or higher

## Test the OpenTelemetry Collector in five minutes

1. Download and run the OpenTelemetry Collector Docker container:

   ```sh
   docker pull otel/opentelemetry-collector:{{% param collectorVersion %}}
   docker run -p 127.0.0.1:4317:4317 -p 127.0.0.1:55679:55679 otel/opentelemetry-collector:{{% param collectorVersion %}}
   ```

2. Download and install the telemetrygen utility from the
   [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/) repository:

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

3. The telemetrygen command generates dummy telemetry for testing. Try sending
   some traces to the Collector:

   ```sh
   telemetrygen traces --otlp-insecure --duration 5s
   ```

   After five seconds, `telemetrygen` stops and shows the sended messages in the console:

   ```text
   2023-10-23T12:58:19.835+0200	INFO	traces/worker.go:88	traces generated	{"worker": 0, "traces": 994418}
   2023-10-23T12:58:19.835+0200	INFO	traces/traces.go:79	stop the batch span processor
   ```

   In the terminal window, running the collector container, logs should show activity related
   to the trace ingest similar to this:

   ```text
   Span #434
      Trace ID       : ba7ef95fce7499811ca72158350c907c
      Parent ID      : 1d3c9f49b3f2cf47
      ID             : 7609079dc6253034
      Name           : okey-dokey
      Kind           : Server
      Start time     : 2023-10-23 11:01:29.53251 +0000 UTC
      End time       : 2023-10-23 11:01:29.532634 +0000 UTC
      Status code    : Unset
      Status message :
   ```

4. Open `http://localhost:55679/debug/tracez` in your browser and select one of
   the samples in the table to see the traces you've just generated.

## Next steps

In this tutorial you've started the OpenTelemetry Collector and sent telemetry
to it. As next steps, consider doing the following:

- Learn about the different modes of the Collector in
  [Deployment Methods](../deployment/).
- Familiarize yourself with the Collector
  [configuration](/docs/collector/configuration) files and structure.
- Explore available components in the [registry](https://opentelemetry.io/ecosystem/registry/?language=collector)
- Learn how to [build a custom collector with the OpenTelemetry Collector Builder (OCB)](/docs/collector/custom-collector/)

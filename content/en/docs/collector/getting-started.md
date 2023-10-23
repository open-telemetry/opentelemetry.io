---
title: Getting Started
# prettier-ignore
cSpell:ignore: otelcol telemetrygen docker jaeger zipkin prometheus dpkg
weight: 1
---

The OpenTelemetry Collector listens to metrics, logs, and traces, processes the
telemetry, and exports it to a wide variety of observability back-ends using its
components. For a conceptual overview of the Collector, read the [introduction][].

The following tutorial shows how to deploy the Collector in agent mode and send
telemetry to it using the default configuration and the telemetrygen utility.

## Prerequisites

To follow this tutorial you need the following

*  Go >= 1.20

## Test the OpenTelemetry Collector in five minutes

1. [Download and install](/docs/collector/installation) the Collector for your
   operating system and architecture. For example:

   ```sh
   sudo apt-get update
   sudo apt-get -y install wget systemctl
   wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.deb
   sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_amd64.deb
   ```

   Alternatively, you can download and run the Docker container:

   ```sh
   docker pull otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
   docker run otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
   ```

2. Download and install the telemetrygen utility from the
   [opentelemetry-collector-contrib] repository:

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

3. The telemetrygen command generates dummy telemetry for testing. Try sending
   some traces to the Collector:

   ```sh
   telemetrygen traces --otlp-insecure --duration 5s
   ```

4. Open http://localhost:55679/debug/tracez in your browser and select one of
   the samples in the table to see the traces you've just generated.

## Collector demo

The OpenTelemetry Collector demo deploys a load generator, agent, and gateway,
as well as Jaeger, Zipkin and Prometheus back-ends.

To try the demo, run the following commands:

```sh
git clone git@github.com:open-telemetry/opentelemetry-collector-contrib.git --depth 1; \
  cd opentelemetry-collector-contrib/examples/demo; \
  docker compose up -d
```

You can find more information about the demo in the [README.md][] file.

{{% alert title="Note" color="info" %}} {{% _param notes.docker-compose-v2 %}}
{{% /alert %}}

## Next steps

In this tutorial you've started the OpenTelemetry Collector and sent telemetry
to it. As next steps, consider doing the following:

- Learn about the different modes of the Collector in [Deployment Methods][].
- Familiarize yourself with the Collector [configuration][] files and structure.
- Try additional components using the [opentelemetry-collector-contrib][]
  project.

[collector]: /docs/collector
[configuration]: /docs/collector/configuration
[data-collection]: /docs/concepts/components/#collector
[deployment-methods]: ../deployment/
[opentelemetry-collector-contrib]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib
[readme.md]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo

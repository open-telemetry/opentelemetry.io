---
title: Docker deployment
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: otelcollector otlphttp spanmetrics
---

## Prerequisites

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/#install-compose)
  v2.0.0+
- Make (optional)
- 6 GB of RAM for the application

## Get and run the demo

1.  Clone the Demo repository:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  Change to the demo folder:

    ```shell
    cd opentelemetry-demo/
    ```

3.  Use make to start the demo:

    ```shell
    make start
    ```

    > **Notes:**
    >
    > If you do not have the make utility installed, you can also use
    > `docker compose up --force-recreate --remove-orphans --detach`[^1] to
    > start the demo.

## Verify the web store and Telemetry

Once the images are built and containers are started you can access:

- Web store: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Feature Flags UI: <http://localhost:8080/feature/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>

## Bring your own backend

Likely you want to use the web store as a demo application for an observability
backend you already have (e.g., an existing instance of Jaeger, Zipkin, or one
of the [vendor of your choice](/ecosystem/vendors/).

OpenTelemetry Collector can be used to export telemetry data to multiple
backends. By default, the collector in the demo application will merge the
configuration from two files:

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

To add your backend, open the file
[src/otelcollector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config-extras.yml)
with an editor.

- Start by adding a new exporter. For example, if your backend supports OTLP
  over HTTP, add the following:

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- Then override the `exporters` for telemetry pipelines that you want to use for
  your backend.

  ```yaml
  service:
    pipelines:
      traces/example:
        receivers: [forward]
        processors: [] # optional
        exporters: [otlphttp/example]
  ```

> **Note** The `forward` connector is defined in
> [src/otelcollector/otelcol-config.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml)
> and can be used in `otelcol-config-extras.yml` to subscribe to the data
> received by the collector.

{{% alert title="Note" color="info" %}} When merging YAML values with the
Collector, objects are merged and arrays are replaced. The `spanmetrics`
exporter must be included in the array of exporters for the `traces` pipeline if
overridden. Not including this exporter will result in an error. {{% /alert %}}

Vendor backends might require you to add additional parameters for
authentication, please check their documentation. Some backends require
different exporters, you may find them and their documentation available at
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

After updating the `otelcol-config-extras.yml`, start the demo by running
`make start`. After a while, you should see the traces flowing into your backend
as well.

[^1]: {{% _param notes.docker-compose-v2 %}}

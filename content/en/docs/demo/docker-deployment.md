---
title: Docker deployment
linkTitle: Docker
aliases: [/docs/demo/docker_deployment]
cSpell:ignore: otelcollector otlphttp
---

## Prerequisites

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/#install-compose)
  v2.0.0+
- 4 GB of RAM for the application

## Get and run the demo

1.  Clone the Demo repository:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  Change to the demo folder:

    ```shell
    cd opentelemetry-demo/
    ```

3.  Run docker compose[^1] to start the demo:

    ```shell
    docker compose up --no-build
    ```

    > **Notes:**
    >
    > - The `--no-build` flag is used to fetch released docker images from
    >   [ghcr](https://ghcr.io/open-telemetry/demo) instead of building from
    >   source. Removing the `--no-build` command line option will rebuild all
    >   images from source. It may take more than 20 minutes to build if the
    >   flag is omitted.
    > - If you're running on Apple Silicon, run `docker compose build`[^1] in
    >   order to create local images vs. pulling them from the repository.

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

- Then add a new pipeline with your new exporter:

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

Vendor backends might require you to add additional parameters for
authentication, please check their documentation. Some backends require
different exporters, you may find them and their documentation available at
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

After updating the `otelcol-config-extras.yml`, start the demo by running
`docker compose up`[^1]. After a while, you should see the traces flowing into
your backend as well.

[^1]: {{% _param notes.docker-compose-v2 %}}

---
title: Docker deployment
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: otelcollector otlphttp spanmetrics tracetest
---

<!-- markdownlint-disable code-block-style ol-prefix -->

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

3.  Start the demo[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4.  (Optional) Enable API observability-driven testing[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-odd
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --profile odd up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Verify the web store and Telemetry

Once the images are built and containers are started you can access:

- Web store: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Feature Flags UI: <http://localhost:8080/feature/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Tracetest UI: <http://localhost:11633/>, only when using `make start-odd`

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
      traces:
        exporters: [spanmetrics, otlphttp/example]
  ```

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

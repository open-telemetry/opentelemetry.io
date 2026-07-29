---
title: Docker deployment
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: firepit otlphttp
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Prerequisites

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0+
- Make (optional)
- 6 GB of RAM for the application (or ~3 GB using
  [minimal mode](#run-in-minimal-mode))
- 14 GB of disk space

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
docker compose -f compose.yaml -f compose.full.yaml -f compose.observability.yaml -f compose.extras.yaml up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    The demo is split across layered Compose files, and `make start` combines
    four of them:

    - `compose.yaml` — the core web store services
    - `compose.full.yaml` — Kafka and the services that depend on it
    - `compose.observability.yaml` — Jaeger, Prometheus, Grafana, and OpenSearch
    - `compose.extras.yaml` — a placeholder for your own additions

    > [!NOTE]
    >
    > A bare `docker compose up` loads only `compose.yaml`. That starts the web
    > store, but without Kafka or any of the observability backends, so there is
    > nowhere to view the telemetry. Pass the files explicitly, as shown above,
    > or use `make start`.

    ### Run in minimal mode

    If you have limited resources, you can start the demo without Kafka and its
    dependent services, reducing memory usage to approximately 3 GB of RAM:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-minimal
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f compose.yaml -f compose.observability.yaml -f compose.extras.yaml up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    Minimal mode drops `compose.full.yaml`, so the following services are
    **not** included:

    - `accounting`
    - `fraud-detection`
    - `kafka`

    ### Run with the AI agent

    The agent, MCP server, and chatbot are not started by default. To add
    them[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-agentic
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f compose.yaml -f compose.full.yaml -f compose.observability.yaml -f compose.extras.yaml -f compose.agent.yaml up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    This adds the Chatbot UI at <http://localhost:8080/chatbot/>. By default the
    agent replays recorded LLM responses (`USE_VCR=True`), so no API key is
    required. To talk to a real LLM, set `LLM_BASE_URL`, `LLM_MODEL`, and
    `API_KEY` in `.env.override`.

    ### Run with continuous profiling

    To add the eBPF profiler and the Firepit profiling UI[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-profiling
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f compose.yaml -f compose.full.yaml -f compose.observability.yaml -f compose.profiling.yaml -f compose.extras.yaml up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    Profiles are then available at <http://localhost:8080/profiles/>.

4. (Optional) Run the end-to-end tests[^1]:

    The Cypress frontend tests run against a demo that is already up:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-frontend-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f compose.yaml -f compose.full.yaml -f compose.observability.yaml -f compose.extras.yaml -f compose.tests.yaml run frontendTests
```

    {{% /tab %}} {{< /tabpane >}}

    The telemetry tests instead assert that each service emits the expected
    traces, metrics, and logs. This target starts the demo itself and stops it
    again when the run finishes, so run it with the demo stopped:

    ```shell
    make run-telemetry-tests
    ```

## Verify the web store and Telemetry

Once the images are built and containers are started you can access:

- Web store: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Flagd configurator UI: <http://localhost:8080/feature>
- Telemetry documentation: <http://localhost:8080/telemetry/>
- Chatbot UI: <http://localhost:8080/chatbot/>, only when using
  `make start-agentic`
- Firepit profiling UI: <http://localhost:8080/profiles/>, only when using
  `make start-profiling`

## Changing the demo's primary port number

By default, the demo application will start a proxy for all browser traffic
bound to port 8080. To change the port number, set the `ENVOY_PORT` environment
variable before starting the demo.

- For example, to use port 8081[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose -f compose.yaml -f compose.full.yaml -f compose.observability.yaml -f compose.extras.yaml up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Bring your own backend

Likely you want to use the web store as a demo application for an observability
backend you already have (e.g., an existing instance of Jaeger, Zipkin, or one
of the [vendors of your choice](/ecosystem/vendors/)).

OpenTelemetry Collector can be used to export telemetry data to multiple
backends. The collector in the demo application layers its configuration from
several files, each merged on top of the previous one. Which files are loaded
depends on how you start the demo:

- `otelcol-config.yml` — the base configuration, always loaded
- `otelcol-config-full.yml` — adds the receivers for services that only run in
  the full demo, such as Kafka
- `otelcol-config-observability.yml` — wires up the bundled backends (Jaeger,
  Prometheus, and OpenSearch)
- `otelcol-config-extras.yml` — your own additions, always loaded last

`make start` and `make start-minimal` load all four files. Starting the demo
without the observability stack loads fewer of them, but
`otelcol-config-extras.yml` is always applied last, so your changes take
precedence in every mode.

To add your backend, open the file
[src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml)
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
        exporters: [span_metrics, otlphttp/example]
  ```

> [!NOTE]
>
> When merging YAML values with the Collector, objects are merged and arrays are
> replaced. The `span_metrics` connector must be included in the array of
> exporters for the `traces` pipeline if overridden, since the `metrics`
> pipeline consumes it as a receiver. Leaving it out will result in an error.

Vendor backends might require you to add additional parameters for
authentication, please check their documentation. Some backends require
different exporters, you may find them and their documentation available at
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

After updating the `otelcol-config-extras.yml`, start the demo by running
`make start`. After a while, you should see the traces flowing into your backend
as well.

[^1]: {{% param notes.docker-compose-v2 %}}

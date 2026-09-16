---
title: Docker deployment
linkTitle: Docker
aliases: [docker_deployment]
cSpell:ignore: Firepit span_metrics
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Prerequisites

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0+
- Make (optional)
- 6 GB of RAM for the application (or ~3 GB using
  [minimal mode](#deployment-modes))
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
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    > [!NOTE]
    >
    > A bare `docker compose up` loads only `compose.yaml`. That starts the web
    > store, but without Kafka or any of the observability backends, so there is
    > nowhere to view the telemetry. Pass the files explicitly, as shown above,
    > or use `make start`.

    ### Deployment modes

    The demo supports several deployment modes. The default `make start` runs
    the full demo with all services and the observability stack. Other modes
    let you reduce resource usage or exclude certain components:

    | Mode | Make target | Description |
    | --- | --- | --- |
    | Full | `make start` | All services and observability backends (default) |
    | Minimal | `make start-minimal` | Excludes Kafka and its dependent services (`accounting`, `fraud-detection`, `kafka`), reducing memory usage to ~3 GB |
    | No observability | `make start-no-o11y` | All services without the observability backends (Jaeger, Grafana, Prometheus, OpenSearch) |
    | Minimal, no observability | `make start-minimal-no-o11y` | Minimal services without the observability backends |
    | Profiling | `make start-profiling` | Full mode with an eBPF profiler and the [Firepit](https://github.com/florianl/firepit) UI for profiling data |
    | Agentic | `make start-agentic` | Full mode with an AI agent, MCP server, and chatbot for interacting with the demo |

    For example, to start the demo in minimal mode:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-minimal
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    ### Run with the AI agent

    The agent, MCP server, and chatbot are not started by default. To add
    them[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-agentic
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.agent.yaml \
  up --force-recreate --remove-orphans --detach
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
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.profiling.yaml \
  -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    Profiles are then available at <http://localhost:8080/profiles/>.

4. (Optional) Run telemetry sanity tests:

    The demo includes a suite of telemetry sanity tests that verify each
    service is producing traces, metrics, and logs and that they reach the
    expected backends (Jaeger, Prometheus, OpenSearch). For details, see
    [test/telemetry/README.md](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/README.md).

    | Test scope | Make target | Starts |
    | --- | --- | --- |
    | Full | `make run-telemetry-tests` | Full deployment (`make start`) |
    | Minimal | `make run-telemetry-tests-minimal` | Minimal deployment (`make start-minimal`) |
    | Agentic | `make run-telemetry-tests-agentic` | Agentic deployment (with agent, MCP, and chatbot) |

    Each target builds the test image from `./test/telemetry`, starts the
    corresponding deployment, runs the tests, and then tears down the demo.

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-telemetry-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
# The demo must be running before you start the tests.
docker build -t opentelemetry-demo-telemetry-tests ./test/telemetry
docker run --rm --network opentelemetry-demo \
  --env-file .env --env-file .env.override \
  -e TEST_SCOPE=full \
  opentelemetry-demo-telemetry-tests
```

    {{% /tab %}} {{< /tabpane >}}

5. (Optional) Run the frontend end-to-end tests[^1]:

    The Cypress frontend tests run against a demo that is already up:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-frontend-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  -f compose.tests.yaml \
  run frontendTests
```

    {{% /tab %}} {{< /tabpane >}}

## Verify the web store and Telemetry

Once the images are built and containers are started you can access:

- Web store: <http://localhost:8080/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Flagd configurator UI: <http://localhost:8080/feature>
- Telemetry documentation (generated by Weaver):
  <http://localhost:8080/telemetry/>

The following are available when the observability stack is running (i.e., not
in `*-no-o11y` modes):

- Grafana: <http://localhost:8080/grafana/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- OpAMP UI: <http://localhost:8080/opamp/>

The following are available only in specific deployment modes:

- Firepit UI (profiling mode): <http://localhost:8080/profiles/>
- Chatbot (agentic mode): <http://localhost:8080/chatbot/>

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
ENVOY_PORT=8081 docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
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
    otlp_http/example:
      endpoint: <your-endpoint-url>
  ```

- Then override the `exporters` for telemetry pipelines that you want to use for
  your backend.

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [debug, otlp_grpc/jaeger, span_metrics, otlp_http/example]
  ```

> [!NOTE]
>
> When merging YAML values with the Collector, objects are merged and arrays are
> replaced. The `span_metrics` connector bridges traces to metrics, so it must
> be retained on traces `exporters` and metrics `receivers` when overriding
> those pipelines — omitting it causes the collector to crash. All other
> exporters are optional: omitting one simply stops data from being sent to that
> backend. The upstream exporter names are:
>
> - **traces**: `debug`, `otlp_grpc/jaeger`, `span_metrics` _(required)_
> - **metrics**: `debug`, `otlp_http/prometheus`
> - **logs**: `debug`, `opensearch`

Vendor backends might require you to add additional parameters for
authentication, please check their documentation. Some backends require
different exporters, you may find them and their documentation available at
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

After updating the `otelcol-config-extras.yml`, start the demo by running
`make start`. After a while, you should see the traces flowing into your backend
as well.

[^1]: {{% param notes.docker-compose-v2 %}}

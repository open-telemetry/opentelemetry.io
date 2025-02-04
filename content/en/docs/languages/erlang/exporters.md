---
title: Exporters
weight: 50
cSpell:ignore: rebar relx
---

{{% docs/languages/exporters/intro erlang %}}

## Exporting to the OpenTelemetry Collector

The [Collector](/docs/collector/) provides a vendor agnostic way to receive,
process and export telemetry data. The package
[opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter)
provides support for both exporting over both HTTP (the default) and gRPC to the
collector, which can then export Spans to a self-hosted service like Zipkin or
Jaeger, as well as commercial services. For a full list of available exporters,
see the [registry](/ecosystem/registry/?component=exporter).

## Setting up the Collector

For testing purposes, you can start with the following Collector configuration
at the root of your project:

```yaml
# otel-collector-config.yaml

# OpenTelemetry Collector config that receives OTLP and exports to Jager
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'
processors:
  batch:
    send_batch_size: 1024
    timeout: 5s
exporters:
  debug:
  otlp/jaeger:
    endpoint: jaeger-all-in-one:4317
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, otlp/jaeger]
```

For a more detailed example, you can view the
[config](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/config/otel-collector-config.yaml)
that `opentelemetry-erlang` uses for testing.

For the purposes of this tutorial, we'll start the Collector as a docker image
along side our app. For this tutorial, we'll continue along with the Dice Roll
example from the [Getting Started](/docs/languages/erlang/getting-started) guide

Add this docker-compose file to the root of your app:

```yaml
# docker-compose.yml
version: '3'
services:
  otel:
    image: otel/opentelemetry-collector-contrib:0.98.0
    command: ['--config=/conf/otel-collector-config.yaml']
    ports:
      - 4317:4317
      - 4318:4318
    volumes:
      - ./otel-collector-config.yaml:/conf/otel-collector-config.yaml
    links:
      - jaeger-all-in-one

  jaeger-all-in-one:
    image: jaegertracing/all-in-one:latest
    ports:
      - '16686:16686'
```

This configuration is used in
[docker-compose.yml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/docker-compose.yml)
to start the Collector with receivers for both HTTP and gRPC that then export to
Zipkin also run by [docker-compose](https://docs.docker.com/compose/).

To export to the running Collector the `opentelemetry_exporter` package must be
added to the project's dependencies:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"},
        {opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

It should then be added to the configuration of the Release before the SDK
Application to ensure the exporter's dependencies are started before the SDK
attempts to initialize and use the exporter.

Example of Release configuration in `rebar.config` and for
[mix's Release task](https://hexdocs.pm/mix/Mix.Tasks.Release.html):

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% rebar.config
{relx, [{release, {my_instrumented_release, "0.1.0"},
         [opentelemetry_exporter,
	      {opentelemetry, temporary},
          my_instrumented_app]},

       ...]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# mix.exs
def project do
  [
    releases: [
      my_instrumented_release: [
        applications: [opentelemetry_exporter: :permanent, opentelemetry: :temporary]
      ],

      ...
    ]
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

Finally, the runtime configuration of the `opentelemetry` and
`opentelemetry_exporter` Applications are set to export to the Collector. The
configurations below show the defaults that are used if none are set, which are
the HTTP protocol with endpoint of `localhost` on port `4318`. Note:

- If using `grpc` for the `otlp_protocol` the endpoint should be changed to
  `http://localhost:4317`.
- If you're using the docker compose file from above, you should replace
  `localhost` with `otel`.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, otlp}]},

 {opentelemetry_exporter,
  [{otlp_protocol, http_protobuf},
   {otlp_endpoint, "http://localhost:4318"}]}]}
].
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/config.exs
config :opentelemetry,
  resource: %{service: %{name: "roll_dice_app"}},
  span_processor: :batch,
  traces_exporter: :otlp

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: "http://localhost:4318"
  # otlp_endpoint: "http://otel:4318" if using docker compose file
```

{{% /tab %}} {{< /tabpane >}}

You can see your traces by running `docker compose up` in one terminal, then
`mix phx.server` in another. After sending some requests through the app, go to
`http://localhost:16686` and select `roll_dice_app` from the Service drop down,
then click "Find Traces".

## Gotchas

Some environments do not allow containers to execute as root users. If you work
in an environment like this, you can add `user: "1001"` as a top-level key/value
to the `otel` service in the `docker-compose.yml` file used in this tutorial.

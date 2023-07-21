---
title: Exporters
weight: 50
spelling: cSpell:ignore ostream jaegertracing millis chrono rebar relx
versions:
  otelSdk: 1.3
  otelApi: 1.2
  otelExporter: 1.6
  otelPhoenix: 1.1
  otelCowboy: 0.2
---

In order to visualize and analyze your [traces](/docs/concepts/signals/traces/)
and metrics, you will need to export them to a backend.

## Exporting to the OpenTelemetry Collector

The [Collector](/docs/collector/) provides a vendor agnostic way to receive,
process and export telemetry data. The package
[opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter)
provides support for both exporting over both HTTP (the default) and gRPC to the
collector, which can then export Spans to a self-hosted service like Zipkin or
Jaeger, as well as commercial services. For a full list of available exporters,
see the [registry](/ecosystem/registry/?component=exporter).

For testing purposes the `opentelemetry-erlang` repository has a Collector
configuration,
[config/otel-collector-config.yaml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/config/otel-collector-config.yaml)
that can be used as a starting point. This configuration is used in
[docker-compose.yml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/docker-compose.yml)
to start the Collector with receivers for both HTTP and gRPC that then export to
Zipkin also run by [docker-compose](https://docs.docker.com/compose/).

To export to the running Collector the `opentelemetry_exporter` package must be
added to the project's dependencies:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"},
        {opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"}]}.
{{< /tab >}}

{{< tab Elixir >}}
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"}
  ]
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

It should then be added to the configuration of the Release before the SDK
Application to ensure the exporter's dependencies are started before the SDK
attempts to initialize and use the exporter.

Example of Release configuration in `rebar.config` and for
[mix's Release task](https://hexdocs.pm/mix/Mix.Tasks.Release.html):

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% rebar.config
{relx, [{release, {my_instrumented_release, "0.1.0"},
         [opentelemetry_exporter,
	      {opentelemetry, temporary},
          my_instrumented_app]},

       ...]}.
{{< /tab >}}

{{< tab Elixir >}}
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
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

Finally, the runtime configuration of the `opentelemetry` and
`opentelemetry_exporter` Applications are set to export to the Collector. The
configurations below show the defaults that are used if none are set, which are
the HTTP protocol with endpoint of `localhost` on port `4318`. If using `grpc`
for the `otlp_protocol` the endpoint should be changed to
`http://localhost:4317`.

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, otlp}]},

 {opentelemetry_exporter,
  [{otlp_protocol, http_protobuf},
   {otlp_endpoint, "http://localhost:4318"}]}]}
].
{{< /tab >}}

{{< tab Elixir >}}
# config/runtime.exs
config :opentelemetry,
  span_processor: :batch,
  traces_exporter: :otlp

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: "http://localhost:4318"
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

---
title: Erlang/Elixir
weight: 14
description: >
  <img width="35" class="img-initial" src="/img/logos/32x32/Erlang_SDK.svg"
  alt="Erlang/Elixir"></img> A language-specific implementation of OpenTelemetry
  in Erlang/Elixir.
---

{{% lang_instrumentation_index_head erlang %}}

Packages of the API, SDK and OTLP exporter are published to
[hex.pm](https://hex.pm) as
[opentelemetry_api](https://hex.pm/packages/opentelemetry_api),
[opentelemetry](https://hex.pm/packages/opentelemetry) and
[opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter).

## Version support

OpenTelemetry Erlang supports Erlang 23+ and Elixir 1.13+.

## Installation

The API and SDK packages are available on [Hex](https://hex.pm):

- [opentelemetry_api](https://hex.pm/packages/opentelemetry_api) is the API
  package used to instrument applications.
- [opentelemetry](https://hex.pm/packages/opentelemetry) is the SDK package to
  include in your deploy-able -- e.g. an OTP Release or an escript.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{deps, [{opentelemetry_api, "~> 1.2"},
        {opentelemetry, "~> 1.3"}]}.
{{< /tab >}}

{{< tab Elixir >}}
def deps do
  [
    {:opentelemetry_api, "~> 1.2"},
    {:opentelemetry, "~> 1.3"}
  ]
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

In addition, there are packages for exporting, both over the
[OpenTelemetry Protocol (OTLP)](https://hex.pm/packages/opentelemetry_exporter)
and [Zipkin protocol](https://hex.pm/packages/opentelemetry_zipkin), as well as
Instrumentation Libraries that provide instrumentation to plug in -- through
middlewares, telemetry event handlers, etc -- to your application for many
common Erlang and Elixir applications, like
[Phoenix](https://www.phoenixframework.org/) and
[Ecto](https://hexdocs.pm/ecto/Ecto.html). See the
[instrumentation directory of the Contrib repos](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation).

Other Applications in Contrib help with writing manual instrumentation. There is
[opentelemetry_telemetry](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/utilities/opentelemetry_telemetry)
for creating OpenTelemetry Spans from `telemetry` events, and
[OpenTelemetryProcessPropagator](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/propagators/opentelemetry_process_propagator)
which provides functions for cross process context propagation.

### Installing Cutting-edge Applications

There is some functionality that has not yet been released to Hex. In that
situation, you may want to install the packages directly from the repo. Because
the repo is an umbrella project this requires options to the git dependencies in
rebar3 and Hex:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{opentelemetry_api, {git_subdir, "http://github.com/open-telemetry/opentelemetry-erlang", {branch, "main"}, "apps/opentelemetry_api"}},
{opentelemetry, {git_subdir, "http://github.com/open-telemetry/opentelemetry-erlang", {branch, "main"},
"apps/opentelemetry"}}
{{< /tab >}}

{{< tab Elixir >}}
{:opentelemetry_api, github: "open-telemetry/opentelemetry-erlang", sparse:
"apps/opentelemetry_api", override: true},
{:opentelemetry, github: "open-telemetry/opentelemetry-erlang", sparse:
"apps/opentelemetry", override: true},
{:opentelemetry_exporter, github: "open-telemetry/opentelemetry-erlang", sparse: "apps/opentelemetry_exporter", override: true}
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Installing Experimental Applications

The Experimental API and SDK Applications are where
[Signals](/docs/concepts/signals/) live before they are stable and can be moved
to the main API and SDK packages. These Applications are published to Hex but
will always be versioned less than `1.0.0`:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{deps, [{opentelemetry_api, "~> 1.2"},
        {opentelemetry, "~> 1.3"},
        {opentelemetry_api_experimental, "~> 0.3"},
        {opentelemetry_experimental, "~> 0.3"}]}.
{{< /tab >}}

{{< tab Elixir >}}
def deps do
  [
    {:opentelemetry_api, "~> 1.2"},
    {:opentelemetry, "~> 1.3"},
    {:opentelemetry_api_experimental, "~> 0.3"},
    {:opentelemetry_experimental, "~> 0.3"}
  ]
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

When part of the experimental Application becomes stable it is moved to the
stable Application.

{{% /lang_instrumentation_index_head %}}

---
title: Getting Started
weight: 20
spelling: cSpell:ignore rebar relx stdlib bogons
spelling: cSpell:ignore defmodule erts hipe Eshell erlang
---

Welcome to the OpenTelemetry for Erlang/Elixir getting started guide! This guide
will walk you through the basic steps in installing, configuring, and exporting
data from OpenTelemetry.

## Creating a New Project

To get started with this guide, create a new project with `rebar3` or `mix`:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
rebar3 new release otel_getting_started
{{< /tab >}}

{{< tab Elixir >}}
mix new --sup otel_getting_started
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Then, in the project you just created, add both `opentelemetry_api` and
`opentelemetry` as dependencies. We add both because this is a project we will
run as a Release and export spans from.

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

In the case of Erlang, the API Application will also need to be added to
`src/otel_getting_started.app.src` and a `relx` section to `rebar.config`. In an
Elixir project, a `releases` section needs to be added to `mix.exs`:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% src/otel_getting_started.app.src
...
{applications, [kernel,
                stdlib,
                opentelemetry_api]},
...

%% rebar.config
{relx, [{release, {otel_getting_started, "0.1.0"},
         [{opentelemetry, temporary},
          otel_getting_started]},

       ...]}.
{{< /tab >}}

{{< tab Elixir >}}
# mix.exs
releases: [
  otel_getting_started: [
    version: "0.0.1",
    applications: [opentelemetry: :temporary, otel_getting_started: :permanent]
  ]
]
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

The SDK `opentelemetry` should be added as early as possible in the Release boot
process to ensure it is available before any telemetry is produced. Here it is
also set to `temporary` under the assumption that we prefer to have a running
Release not producing telemetry over crashing the entire Release.

In addition to the API and SDK, an exporter for getting data out is needed. The
SDK comes with an exporter for debugging purposes that prints to stdout and
there are separate packages for exporting over the
[OpenTelemetry Protocol (OTLP)](https://hex.pm/packages/opentelemetry_exporter)
and the [Zipkin protocol](https://hex.pm/packages/opentelemetry_zipkin).

## Initialization and Configuration

Configuration is done through the
[Application environment](https://erlang.org/doc/design_principles/applications.html#configuring-an-application)
or [OS Environment Variables](/docs/specs/otel/sdk-environment-variables/). The
SDK (`opentelemetry` Application) uses the configuration to initialize a
[Tracer Provider](https://hexdocs.pm/opentelemetry/otel_tracer_server.html), its
[Span Processors](https://hexdocs.pm/opentelemetry/otel_span_processor.html) and
the [Exporter](https://hexdocs.pm/opentelemetry/otel_exporter.html).

### Using the Console Exporter

Exporters are packages that allow telemetry data to be emitted somewhere -
either to the console (which is what we're doing here), or to a remote system or
collector for further analysis and/or enrichment. OpenTelemetry supports a
variety of exporters through its ecosystem, including popular open source tools
like Jaeger and Zipkin.

To configure OpenTelemetry to use a particular exporter, in this case
`otel_exporter_stdout`, the Application environment for `opentelemetry` must set
the `exporter` for the span processor `otel_batch_processor`, a type of span
processor that batches up multiple spans over a period of time:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, {otel_exporter_stdout, []}}]}
].
{{< /tab >}}

{{< tab Elixir >}}
# config/runtime.exs
config :opentelemetry,
  span_processor: :batch,
  traces_exporter: {:otel_exporter_stdout, []}
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

## Working with Spans

Now that the dependencies and configuration are set up, we can create a module
with a function `hello/0` that starts some spans:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% start an active span and run a local function
    ?with_span(operation, #{}, fun nice_operation/1).

nice_operation(_SpanCtx) ->
    ?add_event(<<"Nice operation!">>, [{<<"bogons">>, 100}]),
    ?set_attributes([{another_key, <<"yes">>}]),

    %% start an active span and run an anonymous function
    ?with_span(<<"Sub operation...">>, #{},
               fun(_ChildSpanCtx) ->
                       ?set_attributes([{lemons_key, <<"five">>}]),
                       ?add_event(<<"Sub span event!">>, [])
               end).
{{< /tab >}}

{{< tab Elixir >}}
# lib/otel_getting_started.ex
defmodule OtelGettingStarted do
  require OpenTelemetry.Tracer, as: Tracer

  def hello do
    Tracer.with_span :operation do
      Tracer.add_event("Nice operation!", [{"bogons", 100}])
      Tracer.set_attributes([{:another_key, "yes"}])

      Tracer.with_span "Sub operation..." do
        Tracer.set_attributes([{:lemons_key, "five"}])
        Tracer.add_event("Sub span event!", [])
      end
    end
  end
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

In this example, we're using macros that use the process dictionary for context
propagation and for getting the tracer.

Inside our function, we're creating a new span named `operation` with the
`with_span` macro. The macro sets the new span as `active` in the current
context -- stored in the process dictionary, since we aren't passing a context
as a variable.

Spans can have attributes and events, which are metadata and log statements that
help you interpret traces after-the-fact. The first span has an event
`Nice operation!`, with attributes on the event, as well as an attribute set on
the span itself.

Finally, in this code snippet, we can see an example of creating a child span of
the currently-active span. When the `with_span` macro starts a new span, it uses
the active span of the current context as the parent. So when you run this
program, you'll see that the `Sub operation...` span has been created as a child
of the `operation` span.

To test out this project and see the spans created, you can run with
`rebar3 shell` or `iex -S mix`, each will pick up the corresponding
configuration for the release, resulting in the tracer and exporter to started.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
$ rebar3 shell
===> Compiling otel_getting_started
Erlang/OTP 23 [erts-11.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [hipe]

Eshell V11.1  (abort with ^G)
1>
1> otel_getting_started:hello().
true
*SPANS FOR DEBUG*
{span,177312096541376795265675405126880478701,5706454085098543673,undefined,
      13736713257910636645,<<"Sub operation...">>,internal,
      -576460750077844044,-576460750077773674,
      [{lemons_key,<<"five">>}],
      [{event,-576460750077786044,<<"Sub span event!">>,[]}],
      [],undefined,1,false,undefined}
{span,177312096541376795265675405126880478701,13736713257910636645,undefined,
      undefined,operation,internal,-576460750086570890,
      -576460750077752627,
      [{another_key,<<"yes">>}],
      [{event,-576460750077877345,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
{{< /tab >}}

{{< tab Elixir >}}
$ iex -S mix
Erlang/OTP 23 [erts-11.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [hipe]

Compiling 1 file (.ex)
Interactive Elixir (1.11.0) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> OtelGettingStarted.hello()
true
iex(2)>
*SPANS FOR DEBUG*
{span,180094370450826032544967824850795294459,5969980227405956772,undefined,
      14276444653144535440,<<"Sub operation...">>,'INTERNAL',
      -576460741349434100,-576460741349408901,
      [{lemons_key,<<"five">>}],
      [{event,-576460741349414157,<<"Sub span event!">>,[]}],
      [],undefined,1,false,undefined}
{span,180094370450826032544967824850795294459,14276444653144535440,undefined,
      undefined,:operation,'INTERNAL',-576460741353342627,
      -576460741349400034,
      [{another_key,<<"yes">>}],
      [{event,-576460741349446725,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

## Exporting to the OpenTelemetry Collector

The [Collector](/docs/collector/) provides a vendor agnostic way to receive,
process and export telemetry data. The package
[opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter)
provides support for both exporting over both HTTP (the default) and gRPC to the
collector, which can then export Spans to a self-hosted service like Zipkin or
Jaeger, as well as commercial services. For a full list of available exporters,
see the [registry](/ecosystem/registry/?component=exporter).

For testing purposes the `opentelemetry-erlang` repo has a Collector
configuration,
[config/otel-collector-config.yaml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/config/otel-collector-config.yaml)
that can be used as a starting point. This configuration is used in
[docker-compose.yml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/docker-compose.yml)
to start the Collector with receivers for both HTTP and gRPC that then export to
Zipkin also run by [docker-compose](https://docs.docker.com/compose/).

To export to the running Collector the `opentelemetry_exporter` package must be
added to the project's dependencies:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{deps, [{opentelemetry_api, "~> 1.3"},
        {opentelemetry, "~> 1.3"},
        {opentelemetry_exporter, "~> 1.4"}]}.
{{< /tab >}}

{{< tab Elixir >}}
def deps do
  [
    {:opentelemetry_api, "~> 1.3"},
    {:opentelemetry, "~> 1.3"},
    {:opentelemetry_exporter, "~> 1.4"}
  ]
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

It should then be added to the configuration of the Release before the SDK
Application to ensure the exporter's dependencies are started before the SDK
attempts to initialize and use the exporter.

Example of Release configuration in `rebar.config` and for
[mix's Release task](https://hexdocs.pm/mix/Mix.Tasks.Release.html):

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

Finally, the runtime configuration of the `opentelemetry` and
`opentelemetry_exporter` Applications are set to export to the Collector. The
configurations below show the defaults that are used if none are set, which are
the HTTP protocol with endpoint of `localhost` on port `4318`. If using `grpc`
for the `otlp_protocol` the endpoint should be changed to
`http://localhost:4317`.

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

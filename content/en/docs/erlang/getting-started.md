---
title: "Getting Started"
weight: 20
---

Welcome to the OpenTelemetry for Erlang/Elixir getting started guide! This guide
will walk you the basic steps in installing, configuring, and exporting data
from OpenTelemetry.

# Installation

OpenTelemetry packages for Erlang/Elixir are available on
[hex.pm](https://hex.pm). When working on an Application with instrumentation
you'll want to add the dependency `opentelemetry_api`. And in the case of Erlang
add it to `applications` list in your `.app.src` file as well. This package
contains only the API  of OpenTelemetry, it will start no processes and any
operation, like starting a span, done when only the API is available will be a
no-op that creates no data. The implementation of the API is in the package
`opentelemetry`, this Application will boot a Supervision tree handling the
necessary components for recording and exporting traces. You'll want to only
depend on the `opentelemetry` package in a project that will be deployed.

To get started with this guide, create a new project with `rebar3` or `mix`:

{{< tabs Erlang Elixir >}}

{{< tab >}}
$ rebar3 new release otel_getting_started
{{< /tab >}}

{{< tab >}}
$ mix new otel_getting_started
{{< /tab >}}

{{< /tabs >}}


Then, in the project you just created add both `opentelemetry_api` and
`opentelemetry` as dependencies. We add both because this is a project we will
run as a Release and export spans from.

{{< tabs Erlang Elixir >}}

{{< tab >}}
{deps, [{opentelemetry_api, "~> 0.6"}, 
        {opentelemetry, "~> 0.6"}]}.
{{< /tab >}}

{{< tab >}}
def deps do
  [
    {:opentelemetry_api, "~> 0.6"},
    {:opentelemetry, "~> 0.6"}
  ]
end
{{< /tab >}}

{{< /tabs >}}

In the case of Erlang the Applications will also need to be added to
`src/otel_getting_started.app.src`, while in an Elixir project a `releases`
section needs to be added to `mix.exs`: 

{{< tabs Erlang Elixir >}}

{{< tab >}}
...
{applications, [kernel,
                stdlib,
                opentelemetry_api,
                opentelemetry]},
...
{{< /tab >}}

{{< tab >}}
releases: [
  otel_getting_started: [
    version: "0.0.1",
    applications: [otel_getting_started: :permanent]
  ]
]
{{< /tab >}}

{{< /tabs >}}

# Initialization and Configuration

Configuration is done through the [Application
environment](https://erlang.org/doc/design_principles/applications.html#configuring-an-application)
or [OS Environment
Variables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md). The
`opentelemetry` Application uses the configuration to initialize a [Tracer
Provider](https://hexdocs.pm/opentelemetry_api/otel_tracer_provider.html), its
[Span Processors](https://hexdocs.pm/opentelemetry/otel_span_processor.html) and
the [Exporter](https://hexdocs.pm/opentelemetry/otel_exporter.html).

## Using the Console Exporter

Exporters are packages that allow telemetry data to be emitted somewhere -
either to the console (which is what we're doing here), or to a remote system or
collector for further analysis and/or enrichment. OpenTelemetry supports a
variety of exporters through its ecosystem including popular open source tools
like Jaeger and Zipkin.

To configure OpenTelemetry to use a particular exporter, in this case
`otel_exporter_stdout`, the Application environment for `opentelemetry` must
set the `exporter` for the span processor `otel_batch_processor`, a type
of span processor that batches up multiple spans over a period of time:

{{< tabs Erlang Elixir >}}

{{< tab >}}
%% config/sys.config.src
[
 {opentelemetry,
  [{processors, [{otel_batch_processor,
                  #{exporter => {otel_exporter_stdout, []}}
                 }]
   }]}
].
{{< /tab >}}

{{< tab >}}
# config/runtime.exs
config :opentelemetry, :processors,
  otel_batch_processor: %{
    exporter: {:otel_exporter_stdout, []}
  }
{{< /tab >}}

{{< /tabs >}}

# Working with Spans

Now that the dependencies and configuration is setup we can create a module with
a function `hello/0` that starts some spans:

{{< tabs Erlang Elixir >}}

{{< tab >}}
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% start an active span and run a local function
    ?with_span(<<"operation">>, #{}, fun nice_operation/1).

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

{{< tab >}}
# lib/otel_getting_started.ex
defmodule OtelGettingStarted do
  require OpenTelemetry.Tracer, as: Tracer

  def hello do
    Tracer.with_span "operation" do
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

{{< /tabs >}}

In the snippets, we're using macros which utilizes the process dictionary for
context propagation and for getting the tracer.

Inside our function, we're creating a new span named `operation` with the
`with_span` macro. with the context we just created, and a name. The macro sets
the new span as `active` in the current context -- stored in the process
dictionary since we aren't passing a context as a variable. 

Spans can have attributes and events, which are metadata and log statements that
help you interpret traces after-the-fact. The first span has an event `Nice
operation!` with attributes on the event, as well as an attribute set on the
span itself. 

Finally, in this code snippet we can see an example of creating a child span of
the currently active span. When `with_span` macro starts a new span it uses the
active span of the current context for the parent. So when you run this program,
you'll see that the `Sub operation...` span has been created as a child of the
`operation` span.

To test out this project and see the spans created you can run with `rebar3
shell` or `iex -S mix`, each will pick up the corresponding configuration for
the release, resulting in the tracer and exporter to started.

{{< tabs Erlang Elixir >}}

{{< tab >}}
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
      undefined,<<"operation">>,internal,-576460750086570890,
      -576460750077752627,
      [{another_key,<<"yes">>}],
      [{event,-576460750077877345,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
{{< /tab >}}

{{< tab >}}
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
      undefined,<<"operation">>,'INTERNAL',-576460741353342627,
      -576460741349400034,
      [{another_key,<<"yes">>}],
      [{event,-576460741349446725,<<"Nice operation!">>,[{<<"bogons">>,100}]}],
      [],undefined,1,false,undefined}
{{< /tab >}}

{{< /tabs >}}

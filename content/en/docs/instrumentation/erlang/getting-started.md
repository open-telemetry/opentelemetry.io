---
title: Getting Started
weight: 10
# prettier-ignore
cSpell:ignore: bogons defmodule defp ecto elixirc erts Eshell hipe KHTML postgres rebar relx rolldice stdlib
---

<!-- markdownlint-disable no-duplicate-heading -->
<!-- markdownlint-capture -->

Welcome to the OpenTelemetry for Erlang/Elixir getting started guide! This guide
will walk you through the basic steps in installing, configuring, and exporting
data from OpenTelemetry.

## Phoenix

This part of the guide will show you how to get started with OpenTelemetry in
the Phoenix Web Framework.

### Prerequisites

Ensure that you have Erlang, Elixir, PostgreSQL (or the database of your
choice), and Phoenix installed locally. The Phoenix
[installation guide](https://hexdocs.pm/phoenix/installation.html) will help you
get set up with everything you need.

### Example Application

The following example uses a basic [Phoenix](https://www.phoenixframework.org/)
web application. For reference, a complete example of the code you will build
can be found here:
[opentelemetry-erlang-contrib/examples/dice_game](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/dice_game).
You can git clone that project or just follow along in your browser.

Additional examples can be found [here](/docs/instrumentation/erlang/examples/).

### Dependencies

We'll need a few other dependencies that Phoenix doesn't come with.

- `opentelemetry_api`: contains the interfaces you'll use to instrument your
  code. Things like `Tracer.with_span` and `Tracer.set_attribute` are defined
  here.
- `opentelemetry`: contains the SDK that implements the interfaces defined in
  the API. Without it, all the functions in the API are no-ops.
- `opentelemetry_exporter`: allows you to send your telemetry data to an
  OpenTelemetry Collector and/or to self-hosted or commercial services.
- `opentelemetry_phoenix`: creates OpenTelemetry spans from the Elixir
  `:telemetry` events created by Phoenix.
- `opentelemetry_cowboy`: creates OpenTelemetry spans from the Elixir
  `:telemetry` events created by the Cowboy web server (which is used by
  Phoenix).

```elixir
# mix.exs
def deps do
  [
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry_phoenix, "~> {{% param versions.otelPhoenix %}}"},
    {:opentelemetry_cowboy, "~> {{% param versions.otelCowboy %}}"},
  ]
end
```

The last two also need to be setup when your application starts:

```elixir
# application.ex
@impl true
def start(_type, _args) do
  :opentelemetry_cowboy.setup()
  OpentelemetryPhoenix.setup(adapter: :cowboy2)
end
```

If you're using ecto, you'll also want to add
`OpentelemetryEcto.setup([:dice_game, :repo])`.

We also need to configure the `opentelemetry` application as temporary by adding
a `releases` section to your project configuration. This will ensure that if it
terminates, even abnormally, the `dice_game` application will be terminated.

```elixir
# mix.exs
def project do
  [
    app: :dice_game,
    version: "0.1.0",
    elixir: "~> 1.14",
    elixirc_paths: elixirc_paths(Mix.env()),
    start_permanent: Mix.env() == :prod,
    releases: [
      dice_game: [
        applications: [opentelemetry: :temporary]
      ]
    ],
    aliases: aliases(),
    deps: deps()
  ]
end
```

Now we can use the new `mix setup` command to install the dependencies, build
the assets, and create and migrate the database.

### Try It Out

We can ensure everything is working by setting the stdout exporter as
OpenTelemetry's `traces_exporter` and then starting the app with
`mix phx.server`.

```elixir
# config/dev.exs
config :opentelemetry, traces_exporter: {:otel_exporter_stdout, []}
```

If everything went well, you should be able to visit
[`localhost:4000`](http://localhost:4000) in your browser and see quite a few
lines that look like this in your terminal.

(Don't worry if the format looks a little unfamiliar. Spans are recorded in the
Erlang `record` data structure. You can find more information about records
[here](https://www.erlang.org/doc/reference_manual/records.html), and
[this](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/apps/opentelemetry/include/otel_span.hrl#L19)
file describes the `span` record structure, and explains what the different
fields are.)

```shell
*SPANS FOR DEBUG*
{span,64480120921600870463539706779905870846,11592009751350035697,[],
      undefined,<<"/">>,server,-576460731933544855,-576460731890088522,
      {attributes,128,infinity,0,
                  #{'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,'http.target' => <<"/">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.transport' => 'IP.TCP',
                    'net.host.name' => <<"localhost">>,
                    'net.host.port' => 4000,'net.peer.port' => 62839,
                    'net.sock.host.addr' => <<"127.0.0.1">>,
                    'net.sock.peer.addr' => <<"127.0.0.1">>,
                    'http.route' => <<"/">>,'phoenix.action' => home,
                    'phoenix.plug' =>
                        'Elixir.DiceGameWeb.PageController'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_phoenix">>,<<"1.1.0">>,
                             undefined}}
```

These are the raw Erlang records that will get serialized and sent when you
configure the exporter for your preferred service.

### Rolling The Dice

Now we'll check out the API endpoint that will let us roll the dice and return a
random number between 1 and 6.

Before we call our API, let's add our first bit of manual instrumentation. In
our `DiceController` we call a private `dice_roll` method that generates our
random number. This seems like a pretty important operation, so in order to
capture it in our trace we'll need to wrap it in a span.

```elixir
defp dice_roll do
  Tracer.with_span("dice_roll") do
    to_string(Enum.random(1..6))
  end
end
```

It would also be nice to know what number it generated, so we can extract it as
a local variable and add it as an attribute on the span.

```elixir
defp dice_roll do
  Tracer.with_span("dice_roll") do
    roll = Enum.random(1..6)

    Tracer.set_attribute(:roll, roll)

    to_string(roll)
  end
end
```

Now if you point your browser/curl/etc. to
[`localhost:4000/api/rolldice`](http://localhost:4000/api/rolldice) you should
get a random number in response, and 3 spans in your console.

<details>
<summary>View the full spans</summary>

```shell
*SPANS FOR DEBUG*
{span,224439009126930788594246993907621543552,5581431573601075988,[],
      undefined,<<"/api/rolldice">>,server,-576460729549928500,
      -576460729491912750,
      {attributes,128,infinity,0,
                  #{'http.request_content_length' => 0,
                    'http.response_content_length' => 1,
                    'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.host' => <<"localhost">>,
                    'http.host.port' => 4000,'http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,
                    'http.target' => <<"/api/rolldice">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.host.ip' => <<"127.0.0.1">>,
                    'net.transport' => 'IP.TCP',
                    'http.route' => <<"/api/rolldice">>,
                    'phoenix.action' => roll,
                    'phoenix.plug' => 'Elixir.DiceGameWeb.DiceController'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_cowboy">>,<<"0.2.1">>,
                             undefined}}

{span,237952789931001653450543952469252891760,13016664705250513820,[],
      undefined,<<"HTTP GET">>,server,-576460729422104083,-576460729421433042,
      {attributes,128,infinity,0,
                  #{'http.request_content_length' => 0,
                    'http.response_content_length' => 1258,
                    'http.status_code' => 200,
                    'http.client_ip' => <<"127.0.0.1">>,
                    'http.flavor' => '1.1','http.host' => <<"localhost">>,
                    'http.host.port' => 4000,'http.method' => <<"GET">>,
                    'http.scheme' => <<"http">>,
                    'http.target' => <<"/favicon.ico">>,
                    'http.user_agent' =>
                        <<"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36">>,
                    'net.host.ip' => <<"127.0.0.1">>,
                    'net.transport' => 'IP.TCP'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_cowboy">>,<<"0.2.1">>,
                             undefined}}

{span,224439009126930788594246993907621543552,17387612312604368700,[],
      5581431573601075988,<<"dice_roll">>,internal,-576460729494399167,
      -576460729494359917,
      {attributes,128,infinity,0,#{roll => 2}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"dice_game">>,<<"0.1.0">>,undefined}}
```

</details>
<!-- markdownlint-disable heading-increment -->

##### `<<"/api/rolldice">>`

This is the first span in the request, aka the root span. That `undefined` next
to the span name tells you that it doesn't have a parent span. The two very
large negative numbers are the start and end time of the span, in the `native`
time unit. If you're curious, you can calculate the duration in milliseconds
like so
`System.convert_time_unit(-576460729491912750 - -576460729549928500, :native, :millisecond)`.
The `phoenix.plug` and `phoenix.action` will tell you the controller and
function that handled the request. You'll notice however, that the
instrumentation_scope is `opentelemetry_cowboy`. When we told
opentelemetry_phoenix's setup function that we want to use the `:cowboy2`
adapter, that let it know not to create and additional span, but to instead
append attributes to the existing cowboy span. This ensures we have more
accurate latency data in our traces.

##### `<<"HTTP GET">>`

This is the request for the favicon, which you can see in the
`'http.target' => <<"/favicon.ico">>` attribute. I _believe_ it has a generic
name because it does not have an `http.route`.

##### `<<"dice_roll">>`

This is the custom span we added to our private method. You'll notice it only
has the one attribute that we set, `roll => 2`. You should also note that it is
part of the same trace as our `<<"/api/rolldice">>` span,
`224439009126930788594246993907621543552` and has a parent span ID of
`5581431573601075988` which is the span ID of the `<<"/api/rolldice">>` span.
That means that this span is a child of that one, and will be shown below it
when rendered in your tracing tool of choice.

### Next Steps

Enrich your automatically generated instrumentation with
[manual instrumentation](/docs/instrumentation/erlang/manual) of your own
codebase. This allows you to customize the observability data your application
emits.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/erlang/exporters) to one or
more telemetry backends.

## Creating a New Mix/Rebar Project

To get started with this guide, create a new project with `rebar3` or `mix`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
rebar3 new release otel_getting_started
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
mix new --sup otel_getting_started
```

{{% /tab %}} {{< /tabpane >}}

Then, in the project you just created, add both `opentelemetry_api` and
`opentelemetry` as dependencies. We add both because this is a project we will
run as a Release and export spans from.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

In the case of Erlang, the API Application will also need to be added to
`src/otel_getting_started.app.src` and a `relx` section to `rebar.config`. In an
Elixir project, a `releases` section needs to be added to `mix.exs`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
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
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# mix.exs
releases: [
  otel_getting_started: [
    version: "0.0.1",
    applications: [opentelemetry: :temporary, otel_getting_started: :permanent]
  ]
]
```

{{% /tab %}} {{< /tabpane >}}

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
or
[OS Environment Variables](/docs/specs/otel/configuration/sdk-environment-variables/).
The SDK (`opentelemetry` Application) uses the configuration to initialize a
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

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, {otel_exporter_stdout, []}}]}
].
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/runtime.exs
config :opentelemetry,
  span_processor: :batch,
  traces_exporter: {:otel_exporter_stdout, []}
```

{{% /tab %}} {{< /tabpane >}}

## Working with Spans

Now that the dependencies and configuration are set up, we can create a module
with a function `hello/0` that starts some spans:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
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
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
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
```

{{% /tab %}} {{< /tabpane >}}

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

{{< tabpane text=true >}} {{% tab Erlang %}}

```console
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
```

{{% /tab %}} {{% tab Elixir %}}

```console
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
```

{{% /tab %}} {{< /tabpane >}}

## Next Steps

Enrich your instrumentation with more
[manual instrumentation](/docs/instrumentation/erlang/manual).

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/erlang/exporters) to one or
more telemetry backends.

If you'd like to explore a more complex example, take a look at the
[OpenTelemetry Demo](/docs/demo/), which includes the Erlang/Elixir based
[Feature Flag Service](/docs/demo/services/feature-flag/).

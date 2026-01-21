---
title: Getting Started
weight: 10
# prettier-ignore
cSpell:ignore: defmodule defp ecto elixirc elli KHTML postgres rebar relx rolldice stdlib
---

<!-- markdownlint-disable no-duplicate-heading -->

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

The following example will take you through creating a basic
[Phoenix](https://www.phoenixframework.org/) web application and instrumenting
it with OpenTelemetry. For reference, a complete example of the code you will
build can be found here:
[opentelemetry-erlang-contrib/examples/roll_dice](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice).

Additional examples can be found in
[opentelemetry-erlang-contrib examples](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples).

### Initial Setup

Run `mix phx.new roll_dice`. Type "y" to install dependencies.

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
  `:telemetry` events created by the Cowboy web server, which is used by
  Phoenix.

```elixir
# mix.exs
def deps do
  [
    # other default deps...
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry_phoenix, "~> {{% param versions.otelPhoenix %}}"},
    {:opentelemetry_cowboy, "~> {{% param versions.otelCowboy %}}"},
    {:opentelemetry_ecto, "~> {{% param versions.otelEcto %}}"} # if using ecto
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
  OpentelemetryEcto.setup([:dice_game, :repo]) # if using ecto
end
```

Also, make sure your `endpoint.ex` file contains the following line:

```elixir
# endpoint.ex
plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
```

We also need to configure the `opentelemetry` application as temporary by adding
a `releases` section to your project configuration. This will ensure that if it
terminates, even abnormally, the `roll_dice` application will not be terminated.

```elixir
# mix.exs
def project do
  [
    app: :roll_dice,
    version: "0.1.0",
    elixir: "~> 1.14",
    elixirc_paths: elixirc_paths(Mix.env()),
    start_permanent: Mix.env() == :prod,
    releases: [
      roll_dice: [
        applications: [opentelemetry: :temporary]
      ]
    ],
    aliases: aliases(),
    deps: deps()
  ]
end
```

The last thing you'll need is to configure the exporter. For development, we can
use the stdout exporter to ensure everything is working properly. Configure
OpenTelemetry's `traces_exporter` like so:

```elixir
# config/dev.exs
config :opentelemetry, traces_exporter: {:otel_exporter_stdout, []}
```

Now we can use the new `mix setup` command to install the dependencies, build
the assets, and create and migrate the database.

### Try It Out

Run `mix phx.server`.

If everything went well, you should be able to visit
[`localhost:4000`](http://localhost:4000) in your browser and see quite a few
lines that look like this in your terminal.

(Don't worry if the format looks a little unfamiliar. Spans are recorded in the
[Erlang `record` data structure](https://www.erlang.org/doc/reference_manual/records.html),
and
[`otel_span.hrl`](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/apps/opentelemetry/include/otel_span.hrl#L19)
describes the `span` record structure, and explains what the different fields
are.)

```shell
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
                        'Elixir.RollDiceWeb.PageController'}},
      {events,128,128,infinity,0,[]},
      {links,128,128,infinity,0,[]},
      undefined,1,false,
      {instrumentation_scope,<<"opentelemetry_phoenix">>,<<"1.1.0">>,
                             undefined}}
```

These are the raw Erlang records that will get serialized and sent when you
configure the exporter for your preferred service.

### Rolling The Dice

Now we'll create the API endpoint that will let us roll the dice and return a
random number between 1 and 6.

```elixir
# router.ex
scope "/api", RollDiceWeb do
  pipe_through :api

  get "/rolldice", DiceController, :roll
end
```

And create a bare `DiceController` without any instrumentation:

```elixir
# lib/roll_dice_web/controllers/dice_controller.ex
defmodule RollDiceWeb.DiceController do
  use RollDiceWeb, :controller

  def roll(conn, _params) do
    send_resp(conn, 200, roll_dice())
  end

  defp roll_dice do
    to_string(Enum.random(1..6))
  end
end
```

If you like, call the route to see the result. You'll still see some telemetry
pop up in your terminal. Now it's time to enrich that telemetry by instrumenting
our `roll` function by hand

In our `DiceController` we call a private `dice_roll` method that generates our
random number. This seems like a pretty important operation, so in order to
capture it in our trace we'll need to wrap it in a span.

```elixir
defmodule RollDiceWeb.DiceController do
  use RollDiceWeb, :controller
  require OpenTelemetry.Tracer, as: Tracer

  # ...snip

  defp roll_dice do
    Tracer.with_span("dice_roll") do
      to_string(Enum.random(1..6))
    end
  end
end
```

It would also be nice to know what number it generated, so we can extract it as
a local variable and add it as an attribute on the span.

```elixir
defp roll_dice do
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
                    'phoenix.plug' => 'Elixir.RollDiceWeb.DiceController'}},
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

##### Generated Spans

In the output above there are 3 spans. The name of the span is the 6th element
in the tuple and each is detailed below:

###### `<<"/api/rolldice">>`

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

###### `<<"HTTP GET">>`

This is the request for the favicon, which you can see in the
`'http.target' => <<"/favicon.ico">>` attribute. I _believe_ it has a generic
name because it does not have an `http.route`.

###### `<<"dice_roll">>`

This is the custom span we added to our private method. You'll notice it only
has the one attribute that we set, `roll => 2`. You should also note that it is
part of the same trace as our `<<"/api/rolldice">>` span,
`224439009126930788594246993907621543552` and has a parent span ID of
`5581431573601075988` which is the span ID of the `<<"/api/rolldice">>` span.
That means that this span is a child of that one, and will be shown below it
when rendered in your tracing tool of choice.

### Next Steps

Enrich your automatically generated instrumentation with
[manual instrumentation](/docs/languages/erlang/instrumentation) of your own
codebase. This allows you to customize the observability data your application
emits.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/erlang/exporters) to one or more
telemetry backends.

## Elli

This section shows how to get started with OpenTelemetry and the Elli HTTP
server.

### Prerequisites

Ensure that you have Erlang and [rebar3](https://rebar3.org) installed locally.

### Example Application

The following example will take you through creating a basic
[Elli](https://github.com/elli-lib/elli) web application and instrumenting it
with OpenTelemetry. For reference, a complete example of the code you will build
can be found here:
[opentelemetry-erlang-contrib/examples/roll_dice_elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/examples/roll_dice_elli).
Note the full example has extra code for an HTML interface we won't cover here.

Additional examples can be found
[in the Erlang example docs](/docs/languages/erlang/examples/).

### Initial Setup

`rebar3 new release roll_dice_elli`

### Dependencies

We'll need a few other dependencies that Elli doesn't come with.

- `opentelemetry_api`: contains the interfaces you'll use to instrument your
  code. Things like `Tracer.with_span` and `Tracer.set_attribute` are defined
  here.
- `opentelemetry`: contains the SDK that implements the interfaces defined in
  the API. Without it, all the functions in the API are no-ops.
- `opentelemetry_exporter`: allows you to send your telemetry data to an
  OpenTelemetry Collector and/or to self-hosted or commercial services.
- `opentelemetry_elli`: creates OpenTelemetry spans as an Elli middleware.
- `opentelemetry_api_experimental`: the unstable parts of the API that includes
  support for metrics.
- `opentelemetry_experimental`: the unstable parts of the SDK that includes
  support for metrics.

These are all added, along with `elli` to the rebar3 dependencies and the
Applications to include in the Release:

```erlang
{deps, [elli,
        recon,
        opentelemetry_api,
        opentelemetry_exporter,
        opentelemetry,
        opentelemetry_elli,

        opentelemetry_api_experimental},
        opentelemetry_experimental}
       ]}.

{shell, [{apps, [opentelemetry_experimental, opentelemetry, roll_dice]},
         {config, "config/sys.config"}]}.

{relx, [{release, {roll_dice, "0.1.0"},
         [opentelemetry_exporter,
          opentelemetry_experimental,
          opentelemetry,
          recon,
          roll_dice,
          sasl]}
]}.
```

And the dependencies must be included in the Application's `.app.src`,
`src/roll_dice.app.src`:

```erlang
{application, roll_dice,
 [{description, "OpenTelemetry example application"},
  {vsn, "0.1.0"},
  {registered, []},
  {mod, {roll_dice_app, []}},
  {applications,
   [kernel,
    stdlib,
    elli,
    opentelemetry_api,
    opentelemetry_api_experimental,
    opentelemetry_elli
   ]},
  {env,[]},
  {modules, []},

  {licenses, ["Apache-2.0"]},
  {links, []}
 ]}.
```

### Configuration

The SDK and Experimental SDK are configured in `config/sys.config`:

```erlang
{opentelemetry,
 [{span_processor, batch},
  {traces_exporter, {otel_exporter_stdout, []}}]},

{opentelemetry_experimental,
 [{readers, [#{module => otel_metric_reader,
               config => #{export_interval_ms => 1000,
                           exporter => {otel_metric_exporter_console, #{}}}}]}]},
```

With this configuration the completed spans and recorded metrics will be output
to the console every second.

### The Elli Server

The HTTP server is started in the top level Supervisor of the Application,
`src/roll_dice_sup.erl`:

```erlang
init([]) ->
    Port = list_to_integer(os:getenv("PORT", "3000")),

    ElliOpts = [{callback, elli_middleware},
                {callback_args, [{mods, [{roll_dice_handler, []}]}]},
                {port, Port}],

    ChildSpecs = [#{id => roll_dice_http,
                    start => {elli, start_link, [ElliOpts]},
                    restart => permanent,
                    shutdown => 5000,
                    type => worker,
                    modules => [roll_dice_handler]}],

    {ok, {SupFlags, ChildSpecs}}.
```

The handler, `roll_dice_handler` needs a `handle` function that accepts a `GET`
request and returns a random dice roll:

```erlang
handle(Req, _Args) ->
    handle(Req#req.method, elli_request:path(Req), Req).

handle('GET', [~"rolldice"], _Req) ->
    Roll = do_roll(),
    {ok, [], erlang:integer_to_binary(Roll)}.
```

`do_roll/0` returns a random number between 1 and 6:

```erlang
-spec do_roll() -> integer().
do_roll() ->
    rand:uniform(6).
```

### Instrumentation

The first step in instrumentation is to add the Elli Instrumentation Library,
[otel_elli_middleware](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli):

```erlang
{callback_args, [{mods, [{otel_elli_middleware, []},
                         {roll_dice_handler, []}]}]},
```

Then in the handler the name of the span created by the handler should be
updated to match the semantic conventions for HTTP:

```erlang
handle('GET', [~"rolldice"], _Req) ->
    ?update_name(~"GET /rolldice"),
    Roll = do_roll(),
    {ok, [], erlang:integer_to_binary(Roll)}.

handle_event(_Event, _Data, _Args) ->
    ok.

%%

-spec do_roll() -> integer().
do_roll() ->
    ?with_span(dice_roll, #{},
               fun(_) ->
                       Roll = rand:uniform(6),
                       ?set_attribute('roll.value', Roll),
                       ?counter_add(?ROLL_COUNTER, 1, #{'roll.value' => Roll}),
                       Roll
               end).
```

Last code we need is to create the instruments, `ROLL_COUNTER` in
`roll_dice_app.erl`:

```erlang
-include_lib("opentelemetry_api_experimental/include/otel_meter.hrl").

start(_StartType, _StartArgs) ->
    create_instruments(),
    roll_dice_sup:start_link().

create_instruments() ->
    ?create_counter(?ROLL_COUNTER, #{description => ~"The number of rolls by roll value.",
                                     unit => '1'}).
```

### Try It Out

```text
rebar3 shell
```

Now if you point your browser/curl/etc. to
[`localhost:3000/rolldice`](http://localhost:3000/rolldice) you should get a
random number in response, and 3 spans and 1 metric in your console.

<details>
<summary>View the full spans</summary>

```text
roll_counter{roll.value=1} 1

{span,319413853664572622578356032097465423781,9329051549219651155,
{tracestate,[]},
4483837830122616505,true,dice_roll,internal,-576460743866039000,
-576460743861510287, {attributes,128,infinity,0,#{'roll.value' => 1}},
{events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
undefined,1,false,
{instrumentation_scope,<<"roll_dice">>,<<"0.1.0">>,undefined}}
{span,120980994633230227841304483210494731701,17581728945491241369,
{tracestate,[]}, undefined,undefined,<<"GET /">>,server,-576460745567307647,
-576460745552778124, {attributes,128,infinity,0, #{<<"http.flavor">> =>
<<"1.1">>, <<"http.host">> => <<"localhost:3000">>, <<"http.method">> =>
<<"GET">>, <<"http.response_content_length">> => 428, <<"http.status">> =>
200,<<"http.target">> => <<"/">>, <<"http.user_agent">> => <<"Mozilla/5.0 (X11;
Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>, <<"net.host.ip">> =>
<<"127.0.0.1">>, <<"net.host.name">> => "rosa",<<"net.host.port">> => 3000,
<<"net.peer.ip">> => <<"127.0.0.1">>, <<"net.peer.name">> =>
<<"localhost:3000">>, <<"net.peer.port">> => 34112, <<"net.transport">> =>
<<"IP.TCP">>}}, {events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
{status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
{span,99954316162469909244758406078309269908,7583363800346194390,
{tracestate,[]}, undefined,undefined,<<"HTTP GET">>,server,-576460745388883955,
-576460745387339610, {attributes,128,infinity,0, #{<<"http.flavor">> =>
<<"1.1">>, <<"http.host">> => <<"localhost:3000">>, <<"http.method">> =>
<<"GET">>, <<"http.response_content_length">> => 457642, <<"http.status">> =>
200, <<"http.target">> => <<"/static/index.js">>, <<"http.user_agent">> =>
<<"Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>,
<<"net.host.ip">> => <<"127.0.0.1">>, <<"net.host.name">> =>
"rosa",<<"net.host.port">> => 3000, <<"net.peer.ip">> => <<"127.0.0.1">>,
<<"net.peer.name">> => <<"localhost:3000">>, <<"net.peer.port">> => 34112,
<<"net.transport">> => <<"IP.TCP">>}}, {events,128,128,infinity,0,[]},
{links,128,128,infinity,0,[]}, {status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
{span,319413853664572622578356032097465423781,4483837830122616505,
{tracestate,[]}, 4897145615278856533,true,<<"GET
/rolldice">>,server,-576460743866475748, -576460743861225124,
{attributes,128,infinity,0, #{<<"http.flavor">> => <<"1.1">>, <<"http.host">> =>
<<"localhost:3000">>, <<"http.method">> => <<"GET">>,
<<"http.response_content_length">> => 1, <<"http.status">> => 200,
<<"http.target">> => <<"/rolldice">>, <<"http.user_agent">> => <<"Mozilla/5.0
(X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0">>, <<"net.host.ip">>
=> <<"127.0.0.1">>, <<"net.host.name">> => "rosa",<<"net.host.port">> => 3000,
<<"net.peer.ip">> => <<"127.0.0.1">>, <<"net.peer.name">> =>
<<"localhost:3000">>, <<"net.peer.port">> => 34112, <<"net.transport">> =>
<<"IP.TCP">>}}, {events,128,128,infinity,0,[]}, {links,128,128,infinity,0,[]},
{status,unset,<<>>}, 1,false,
{instrumentation_scope,<<"opentelemetry_elli">>,<<"0.2.0">>,undefined}}
```

</details>

## Next Steps

Enrich your instrumentation with more
[manual instrumentation](/docs/languages/erlang/instrumentation).

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/erlang/exporters) to one or more
telemetry backends.

---
title: Instrumentation
aliases: [manual]
weight: 30
description: Instrumentation for OpenTelemetry Erlang/Elixir
---

{{% include instrumentation-intro.md %}}

## Setup

Add the following dependencies to your project:

- `opentelemetry_api`: contains the interfaces you'll use to instrument your
  code. Things like `Tracer.with_span` and `Tracer.set_attribute` are defined
  here.
- `opentelemetry`: contains the SDK that implements the interfaces defined in
  the API. Without it, all the functions in the API are no-ops.

```elixir
# mix.exs
def deps do
  [
    {:opentelemetry, "~> 1.3"},
    {:opentelemetry_api, "~> 1.2"},
  ]
end
```

## Traces

### Initialize Tracing

To start [tracing](/docs/concepts/signals/traces/) a
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) is required
for creating a [`Tracer`](/docs/concepts/signals/traces/#tracer). When the
OpenTelemetry SDK Application (`opentelemetry`) boots, it starts and configures
a global `TracerProvider`. A `Tracer` for each loaded OTP Application is created
once the `TracerProvider` has started.

If a TracerProvider is not successfully created (for example, the
`opentelemetry` application is not booted or fails to boot), the OpenTelemetry
APIs for tracing will use a no-op implementation and will not generate data.

### Acquiring a Tracer

Each OTP Application has a `Tracer` created for it when the `opentelemetry`
Application boots. The name and version of each `Tracer` is the same as the name
and version of the OTP Application the module using the `Tracer` is in. If the
call to use a `Tracer` is not in a module, for example when using the
interactive shell, a `Tracer` with a blank name and version is used.

The created `Tracer`'s record can be looked up by the name of a module in the
OTP Application:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
opentelemetry:get_application_tracer(?MODULE)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
:opentelemetry.get_application_tracer(__MODULE__)
```

{{% /tab %}} {{< /tabpane >}}

This is how the Erlang and Elixir macros for starting and updating `Spans` get a
`Tracer` automatically without need for you to pass the variable in each call.

### Create Spans

Now that you have [Tracer](/docs/concepts/signals/traces/#tracer)s initialized,
you can create [Spans](/docs/concepts/signals/traces/#spans).

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?with_span(main, #{}, fun() ->
                        %% do work here.
                        %% when this function returns the Span ends
                      end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
require OpenTelemetry.Tracer

...

OpenTelemetry.Tracer.with_span :main do
  # do work here
  # when the block ends the Span ends
end
```

{{% /tab %}} {{< /tabpane >}}

The above code sample shows how to create an active Span, which is the most
common kind of Span to create.

### Create Nested Spans

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
parent_function() ->
    ?with_span(parent, #{}, fun child_function/0).

child_function() ->
    %% this is the same process, so the span parent set as the active
    %% span in the with_span call above will be the active span in this function
    ?with_span(child, #{},
               fun() ->
                   %% do work here. when this function returns, child will complete.
               end).
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
require OpenTelemetry.Tracer

def parent_function() do
    OpenTelemetry.Tracer.with_span :parent do
        child_function()
    end
end

def child_function() do
    # this is the same process, so the span :parent set as the active
    # span in the with_span call above will be the active span in this function
    OpenTelemetry.Tracer.with_span :child do
        ## do work here. when this function returns, :child will complete.
    end
end
```

{{% /tab %}} {{< /tabpane >}}

### Spans in Separate Processes

The examples in the previous section were Spans with a child-parent relationship
within the same process where the parent is available in the process dictionary
when creating a child Span. Using the process dictionary this way isn't possible
when crossing processes, either by spawning a new process or sending a message
to an existing process. Instead, the context must be manually passed as a
variable.

To pass Spans across processes we need to start a Span that isn't connected to
particular process. This can be done with the macro `start_span`. Unlike
`with_span`, the `start_span` macro does not set the new span as the currently
active span in the context of the process dictionary.

Connecting a span as a parent to a child in a new process can be done by
attaching the context and setting the new span as currently active in the
process. The whole context should be attached in order to not lose other
telemetry data like [baggage](/docs/specs/otel/baggage/api/).

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
SpanCtx = ?start_span(child),

Ctx = otel_ctx:get_current(),

proc_lib:spawn_link(fun() ->
                        otel_ctx:attach(Ctx),
                        ?set_current_span(SpanCtx),

                        %% do work here

                        ?end_span(SpanCtx)
                    end),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
span_ctx = OpenTelemetry.Tracer.start_span(:child)
ctx = OpenTelemetry.Ctx.get_current()

task = Task.async(fn ->
                      OpenTelemetry.Ctx.attach(ctx)
                      OpenTelemetry.Tracer.set_current_span(span_ctx)
                      # do work here

                      # end span here
                      OpenTelemetry.Tracer.end_span(span_ctx)
                  end)

_ = Task.await(task)
```

{{% /tab %}} {{< /tabpane >}}

### Linking the New Span

A [Span](/docs/concepts/signals/traces/#spans) can be created with zero or more
[Span Links](/docs/concepts/signals/traces/#span-links) that causally link it to
another Span. A Span Link needs a Span context to be created.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
Parent = ?current_span_ctx,
proc_lib:spawn_link(fun() ->
                        %% a new process has a new context so the span created
                        %% by the following `with_span` will have no parent
                        Link = opentelemetry:link(Parent),
                        ?with_span('other-process', #{links => [Link]},
                                   fun() -> ok end)
                    end),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
parent = OpenTelemetry.Tracer.current_span_ctx()
task = Task.async(fn ->
                    # a new process has a new context so the span created
                    # by the following `with_span` will have no parent
                    link = OpenTelemetry.link(parent)
                    Tracer.with_span :"my-task", %{links: [link]} do
                      :hello
                    end
                 end)
```

{{% /tab %}} {{< /tabpane >}}

### Adding Attributes to a Span

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a Span so it carries more information about the current operation that
it’s tracking.

The following example shows the two ways of setting attributes on a span by both
setting an attribute in the start options and then again with `set_attributes`
in the body of the span operation:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?with_span(my_span, #{attributes => [{'start-opts-attr', <<"start-opts-value">>}]},
           fun() ->
               ?set_attributes([{'my-attribute', <<"my-value">>},
                                {another_attribute, <<"value-of-attribute">>}])
           end)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.with_span :span_1, %{attributes: [{:"start-opts-attr", <<"start-opts-value">>}]} do
  Tracer.set_attributes([{:"my-attributes", "my-value"},
                         {:another_attribute, "value-of-attributes"}])
end
```

{{% /tab %}} {{< /tabpane >}}

### Semantic Attributes

Semantic Attributes are attributes that are defined by the [OpenTelemetry
Specification][] in order to provide a shared set of attribute keys across
multiple languages, frameworks, and runtimes for common concepts like HTTP
methods, status codes, user agents, and more. These attribute keys are generated
from the specification and provided in
[opentelemetry_semantic_conventions](https://hex.pm/packages/opentelemetry_semantic_conventions).

For example, an instrumentation for an HTTP client or server would need to
include semantic attributes like the scheme of the URL:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-include_lib("opentelemetry_semantic_conventions/include/trace.hrl").

?with_span(my_span, #{attributes => [{?HTTP_SCHEME, <<"https">>}]},
           fun() ->
             ...
           end)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
alias OpenTelemetry.SemanticConventions.Trace, as: Trace

Tracer.with_span :span_1, %{attributes: [{Trace.http_scheme(), <<"https">>}]} do

end
```

{{% /tab %}} {{< /tabpane >}}

### Adding Events

A [Span Event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on an [Span](/docs/concepts/signals/traces/#spans) that represents a
discrete event with no duration that can be tracked by a single timestamp. You
can think of it like a primitive log.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Gonna try it">>),

%% Do the thing

?add_event(<<"Did it!">>),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Gonna try it")

%% Do the thing

Tracer.add_event("Did it!")
```

{{% /tab %}} {{< /tabpane >}}

Events can also have attributes of their own:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
?add_event(<<"Process exited with reason">>, [{pid, Pid)}, {reason, Reason}]))
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.add_event("Process exited with reason", pid: pid, reason: Reason)
```

{{% /tab %}} {{< /tabpane >}}

### Set Span Status

A [Status](/docs/concepts/signals/traces/#span-status) can be set on a
[Span](/docs/concepts/signals/traces/#spans), typically used to specify that a
Span has not completed successfully - `StatusCode.ERROR`. In rare scenarios, you
could override the Error status with `StatusCode.OK`, but don’t set
`StatusCode.OK` on successfully-completed spans.

The status can be set at any time before the span is finished:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-include_lib("opentelemetry_api/include/opentelemetry.hrl").

?set_status(?OTEL_STATUS_ERROR, <<"this is not ok">>)
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
Tracer.set_status(:error, "this is not ok")
```

{{% /tab %}} {{< /tabpane >}}

## Metrics

To produce metrics the dependencies `opentelemetry_experimental_api` and
`opentelemetry_experimental` must be added to the project. Application
environment configuration for `opentelemetry_experimental` is used to configure
a `MeterProvider` which is initialized when the application starts. Meters are
created with the `MeterProvider` automatically on boot and the appropriate
`Meter` is used to create instruments depending on where in your code your
create the instrument. OpenTelemetry Erlang currently supports the following
instruments:

- Counter, a synchronous instrument that supports non-negative increments
- Asynchronous Counter, an asynchronous instrument which supports non-negative
  increments
- Histogram, a synchronous instrument that supports arbitrary values that are
  statistically meaningful, such as histograms, summaries, or percentile
- Asynchronous Gauge, an asynchronous instrument that supports non-additive
  values, such as room temperature
- UpDownCounter, a synchronous instrument that supports increments and
  decrements, such as the number of active requests
- Asynchronous UpDownCounter, an asynchronous instrument that supports
  increments and decrements

For more on synchronous and asynchronous instruments, and which kind is best
suited for your use case, see
[Supplementary Guidelines](/docs/specs/otel/metrics/supplementary-guidelines/).

### Initialize Metrics

{{% alert %}} If you’re instrumenting a library, skip this step. {{% /alert %}}

To enable metrics in your application, you’ll need to have an initialized
`MeterProvider` with a `Reader`. This is done through configuration of the
`opentelemetry_experimental` application:

```erlang
{opentelemetry_experimental,
  [{readers, [#{module => otel_metric_reader,
                config => #{export_interval_ms => 1000,
                            exporter => {otel_exporter_metrics_otlp, #{}}}}]}]},
```

This configuration tells the application to create a `MetricProvider` with a
single `Reader`. The `Reader` exports every second to an OTLP receiver, like the
collector, at `localhost:4318` by default. To change the endpoint add to the map
`endpoints => ["<host>:<port>"]` and configure the protocol to use
`protocol => http_protobuf | grpc`.

Use `exporter => {otel_exporter_metrics_console, #{}}` for outputting the
metrics to the console.

### Acquiring a Meter

Instruments are created with a `Meter`. Acquiring a `Meter` manually is not
required but done automatically when the macros for instrument creation are
used.

### Synchronous and asynchronous instruments

### Using Counters

Counters can be used to measure a non-negative, increasing value.

Creating a counter can be done with the `?create_counter` macro:

```erlang
?create_counter(my_fun_counter, #{description => ~"Number of times this function
is called."})
```

To increment the counter use the `?counter_add` macro passing the name of the
instrument, the increment value and a map of attributes:

```erlang
?counter_add(my_fun_counter, 1, #{}),
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a
cumulative value that goes up or down.

For example, here’s how you report the number of items of some collection:

```erlang
create_items_counter() ->
  ?create_counter('items.counter', #{description => ~"Number of items",
                                     unit => '{items}'})

add_item(Item) ->
  ...
  ?updown_counter_add('items.counter', 1),

remove_item(Item) ->
  ...
  ?updown_counter_add('items.counter', -1),
```

### Using Histograms

Histograms are used to measure a distribution of values over time.

```erlang
?create_histogram('task.duration', #{description => ~"Duration of a task",
                                     unit => 's'}),
```

The `?histogram_record` macro is then used to record a measurement:

```erlang
{Microseconds, Result} = timer:tc(TaskFun),
?histogram_record('task.duration', Microseconds),
```

### Using Observable Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value.

For example, here’s how you report time since the Erlang node started:

```erlang
?create_observable_counter('uptime', fun(_Args) ->
                                         Uptime = erlang:convert_time_unit(erlang:monotonic_time() - erlang:system_info(start_time), native, seconds),
                                         [{Uptime, #{}}]
                                     end,
                                     [],
                                     #{description => ~"The duration since the node started.",
                                       unit => 's'}),
```

### Using Observable UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value.

For example, the number of active HTTP connections for a web server:

```erlang
?create_observable_updown_counter('http.server.active_requests', fun(_Args) ->
                                         ActiveRequests = ....
                                         [{ActiveRequests, #{}}]
                                     end,
                                     [],
                                     #{description => ~"Number of active HTTP server requests.",
                                       unit => {request}'}),
```

### Using Observable Gauges

Observable Gauges should be used to measure non-additive values.

For example, here’s how you report memory usage of ETS tables on a node:

```erlang
?create_observable_gauge('memory.ets', fun(_Args) ->
                                         EtsMemory = erlang:memory(ets),
                                         [{EtsMemory, #{}}]
                                     end,
                                     [],
                                     #{description => ~"Memory used by ETS tables.",
                                       unit => 'By'}),
```

### Adding Attributes

Attributes can be added to any measurement as a map in the last place in the
recording macro:

```erlang
?updown_counter_add('items.counter', 1, #{~"key-1" => ~"value-1"}),
```

### Registering Views

A view provides SDK users with the flexibility to customize the metrics output
by the SDK. You can customize which metric instruments are to be processed or
ignored. You can also customize aggregation and what attributes you want to
report on metrics.

Every instrument has a default view, which retains the original name,
description, and attributes, and has a default aggregation that is based on the
type of instrument. When a registered view matches an instrument, the default
view is replaced by the registered view. Additional registered views that match
the instrument are additive, and result in multiple exported metrics for the
instrument.

Here’s how you create a view that renames the `latency` instrument to
`request.latency`:

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{name => request.latency',
               selector => #{instrument_name => 'latency'}}]}
  ]},
```

Or if instead you want a histogram for latency:

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => 'latency'},
               aggregation_module => otel_aggregation_histogram_explicit}]}
  ]},
```

The SDK filters metrics and attributes before exporting metrics. For example,
you can use views to reduce memory usage of high cardinality metrics or drop
attributes that might contain sensitive data.

Here’s how you create a view that drops the latency:

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => 'latency'},
               aggregation_module => otel_aggregation_drop}]}
  ]},
```

A wildcard can be used to match all instruments:

```erlang
{opentelemetry_experimental,
  [...
    {views, [#{selector => #{instrument_name => '*'},
               aggregation_module => otel_aggregation_drop}]}
  ]},
```

Since Views are additive any additional views mean specific metrics can be
exported while all others, that have no match besides the wildcard, are dropped.

## Logs

The logs API, found in `apps/opentelemetry_experimental_api` of the
[opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang)
repository, is currently unstable, documentation TBA.

## Next Steps

You’ll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/erlang/exporters) to one or more
telemetry backends.

[opentelemetry specification]: /docs/specs/otel/

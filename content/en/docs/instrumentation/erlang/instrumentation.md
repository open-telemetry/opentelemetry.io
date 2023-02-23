---
title: Instrumentation
weight: 30
---

Instrumentation is the act of adding observability code to your application.
This can be done with direct calls to the OpenTelemetry API within your code or
including a dependency which calls the API and hooks into your project, like a
middleware for an HTTP server.

## TracerProvider and Tracers

In OpenTelemetry each service being traced has at least one `TracerProvider`
that is used to hold configuration about the name/version of the service, what
sampler to use and how to process/export the spans. A `Tracer` is created by a
`TracerProvider` and has a name and version. In the Erlang/Elixir OpenTelemetry
the name and version of each `Tracer` is the same as the name and version of the
OTP Application the module using the `Tracer` is in. If the call to use a
`Tracer` is not in a module, for example when using the interactive shell, the
default `Tracer` is used.

Each OTP Application has a `Tracer` created for it when the `opentelemetry`
Application boots. This can be disabled by setting the Application environment
variable `create_application_tracers` to `false`. If you want a more specific
name for a `Tracer` you can create a `Tracer` with a name and version and pass
it manually to `otel_tracer` or `OpenTelemetry.Tracer`. Examples:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
Tracer = opentelemetry:get_tracer(test_tracer),
SpanCtx = otel_tracer:start_span(Tracer, <<"hello-world">>, #{}),
...
otel_tracer:end_span(SpanCtx).
{{< /ot-tab >}}

{{< ot-tab >}}
tracer = OpenTelemetry.get_tracer(:test_tracer)
span_ctx = OpenTelemetry.Tracer.start_span(tracer, "hello-world", %{})
...
OpenTelemetry.Tracer.end_span(span_ctx)
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

In most cases you will not need to manually create a `Tracer`. Simply use the
macros provided, which are covered in the following section, and the `Tracer`
for the Application the macro is used in will be used automatically.

Giving names to each `Tracer`, and in the case of Erlang/Elixir having that name
be the name of the Application, allows for the ability to blacklist traces from
a particular Application. This can be useful if, for example, a dependency turns
out to be generating too many or in some way problematic spans and it is desired
to disable their generation.

Additionally, the name and version of the `Tracer` are exported as the
[`InstrumentationLibrary`](/docs/reference/specification/glossary/#instrumentation-library)
component of spans. This allows users to group and search spans by the
Application they came from.

## Starting Spans

A trace is a tree of spans, starting with a root span that has no parent. To
represent this tree, each span after the root has a parent span associated with
it. When a span is started the parent is set based on the `context`. A `context`
can either be implicit, meaning your code does not have to pass a `Context`
variable to track the active `context`, or explicit where your code must pass
the `Context` as an argument not only to the OpenTelemetry functions but to any
function you need to propagate the `context` so that spans started in those
functions have the proper parent.

For implicit context propagation across functions within a process the
[process dictionary](https://erlang.org/doc/reference_manual/processes.html#process-dictionary)
is used to store the context. When you start a span with the macro `with_span`
the context in the process dictionary is updated to make the newly started span
the currently active span and this span will be end'ed when the block or
function completes. Additionally, starting a new span within the body of
`with_span` will use the active span as the parent of the new span and the
parent is again the active span when the child's block or function body
completes:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
parent_function() ->
    ?with_span(<<"parent">>, #{}, fun child_function/0).

child_function() ->
    %% this is the same process, so the span <<"parent">> set as the active
    %% span in the with_span call above will be the active span in this function
    ?with_span(<<"child">>, #{},
               fun() ->
                   %% do work here. when this function returns, <<"child">> will complete.
               end).

{{< /ot-tab >}}

{{< ot-tab >}}
require OpenTelemetry.Tracer

def parent_function() do
    OpenTelemetry.Tracer.with_span "parent" do
        child_function()
    end
end

def child_function() do
    # this is the same process, so the span <<"parent">> set as the active
    # span in the with_span call above will be the active span in this function
    OpenTelemetry.Tracer.with_span "child" do
        ## do work here. when this function returns, <<"child">> will complete.
    end
end
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

### Cross Process Propagation

The examples in the previous section were spans with a child-parent relationship
within the same process where the parent is available in the process dictionary
when creating a child span. Using the process dictionary this way isn't possible
when crossing processes, either by spawning a new process or sending a message
to an existing process. Instead, the context must be manually passed as a
variable.

#### Creating Spans for New Processes

To pass spans across processes we need to start a span that isn't connected to
particular process. This can be done with the macro `start_span`. Unlike
`with_span`, the `start_span` macro does not set the new span as the currently
active span in the context of the process dictionary.

Connecting a span as a parent to a child in a new process can be done by
attaching the context and setting the new span as currently active in the
process. The whole context should be attached in order to not lose other
telemetry data like [baggage](/docs/reference/specification/baggage/api/).

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
SpanCtx = ?start_span(<<"child">>),
Ctx = otel_ctx:get_current(),

proc_lib:spawn_link(fun() ->
                        otel_ctx:attach(Ctx),
                        ?set_current_span(SpanCtx),

                        %% do work here

                        ?end_span(SpanCtx)
                    end),
{{< /ot-tab >}}

{{< ot-tab >}}
span_ctx = OpenTelemetry.Tracer.start_span(<<"child">>)
ctx = OpenTelemetry.Ctx.get_current()

task = Task.async(fn ->
                      OpenTelemetry.Ctx.attach(ctx)
                      OpenTelemetry.Tracer.set_current_span(span_ctx)
                      # do work here

                      # end span here
                      OpenTelemetry.Tracer.end_span(span_ctx)
                  end)

_ = Task.await(task)
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

#### Linking the New Span

If the work being done by the other process is better represented as a `link` --
see
[the `link` definition in the specification](/docs/reference/specification/overview/#links-between-spans)
for more on when that is appropriate -- then the `SpanCtx` returned by
`start_span` is passed to `link/1` to create a `link` that can be passed to
`with_span` or `start_span`:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
Parent = ?current_span_ctx,
proc_lib:spawn_link(fun() ->
                        %% a new process has a new context so the span created
                        %% by the following `with_span` will have no parent
                        Link = opentelemetry:link(Parent),
                        ?with_span(<<"other-process">>, #{links => [Link]},
                                   fun() -> ok end)
                    end),
{{< /ot-tab >}}

{{< ot-tab >}}
parent = OpenTelemetry.current_span_ctx()
task = Task.async(fn ->
                    # a new process has a new context so the span created
                    # by the following `with_span` will have no parent
                    link = OpenTelemetry.link(parent)
                    Tracer.with_span "my-task", %{links: [link]} do
                      :hello
                    end
                 end)
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

### Attributes

Attributes are key-value pairs that are applied as metadata to your spans and
are useful for aggregating, filtering, and grouping traces. Attributes can be
added at span creation, or at any other time during the life cycle of a span
before it has completed.

The key can be an atom or a utf8 string (a regular string in Elixir and a
binary, `<<"..."/utf8>>`, in Erlang). The value can be of any type. If necessary
the key and value are converted to strings when the attribute is exported in a
span.

The following example shows the two ways of setting attributes on a span by both
setting an attribute in the start options and then again with `set_attributes`
in the body of the span operation:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
?with_span(<<"my-span">>, #{attributes => [{<<"start-opts-attr">>, <<"start-opts-value">>}]},
           fun() ->
               ?set_attributes([{<<"my-attribute">>, <<"my-value">>},
                                {another_attribute, <<"value-of-attribute">>}])
           end)
{{< /ot-tab >}}

{{< ot-tab >}}
Tracer.with_span "span-1", %{attributes: [{<<"start-opts-attr">>, <<"start-opts-value">>}]} do
  Tracer.set_attributes([{"my-attributes", "my-value"},
                         {:another_attribute, "value-of-attributes"}])
end
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

#### Semantic Attributes

Semantic Attributes are attributes that are defined by the [OpenTelemetry
Specification][] in order to provide a shared set of attribute keys across
multiple languages, frameworks, and runtimes for common concepts like HTTP
methods, status codes, user agents, and more. These attribute keys and values
are available in the header `opentelemetry_api/include/otel_resource.hrl`.

For details, see [Trace semantic conventions][].

### Events

An event is a human-readable message on a span that represents "something
happening" during it's lifetime. For example, imagine a function that requires
exclusive access to a resource like a database connection from a pool. An event
could be created at two points - once, when the connection is checked out from
the pool, and another when it is checked in.

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
?with_span(<<"my-span">>, #{},
           fun() ->
               ?add_event(<<"checking out connection">>),
               %% acquire connection from connection pool
               ?add_event(<<"got connection, doing work">>),
               %% do some work with the connection and then return it to the pool
               ?add_event(<<"checking in connection">>)
           end)
{{< /ot-tab >}}

{{< ot-tab >}}
Tracer.with_span "my-span" do
  Span.add_event("checking out connection")
  # acquire connection from connection pool
  Span.add_event("got connection, doing work")
  # do some work with the connection and then return it to the pool
  Span.add_event("checking in connection")
end
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

A useful characteristic of events is that their timestamps are displayed as
offsets from the beginning of the span, allowing you to easily see how much time
elapsed between them.

Additionally, events can also have attributes of their own:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
?add_event("Process exited with reason", [{pid, Pid)}, {reason, Reason}]))
{{< /ot-tab >}}

{{< ot-tab >}}
Span.add_event("Process exited with reason", pid: pid, reason: Reason)
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

## Cross Service Propagators

Distributed traces extend beyond a single service, meaning some context must be
propagated across services to create the parent-child relationship between
spans. This requires cross service
[_context propagation_](/docs/reference/specification/overview/#context-propagation),
a mechanism where identifiers for a trace are sent to remote processes.

In order to propagate trace context over the wire, a propagator must be
registered with OpenTelemetry. This can be done through configuration of the
`opentelemetry` application:

<!-- prettier-ignore-start -->
{{< ot-tabs Erlang Elixir >}}

{{< ot-tab >}}
%% sys.config
...
{text_map_propagators, [baggage,
                        trace_context]},
...
{{< /ot-tab >}}

{{< ot-tab >}}
## runtime.exs
...
text_map_propagators: [:baggage, :trace_context],
...
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

If you instead need to use the
[B3 specification](https://github.com/openzipkin/b3-propagation), originally
from the [Zipkin project](https://zipkin.io/), then replace `trace_context` and
`:trace_context` with `b3` and `:b3` for Erlang or Elixir respectively.

## Library Instrumentation

Library instrumentations, broadly speaking, refers to instrumentation code that
you didn't write but instead include through another library. OpenTelemetry for
Erlang/Elixir supports this process through wrappers and helper functions around
many popular frameworks and libraries. You can find in the
[opentelemetry-erlang-contrib repo](https://github.com/open-telemetry/opentelemetry-erlang-contrib/),
published to [hex.pm](https://hex.pm) under the
[OpenTelemetry Organization](https://hex.pm/orgs/opentelemetry) and the
[registry](/ecosystem/registry/).

## Creating Metrics

The metrics API, found in `apps/opentelemetry-experimental-api` of the
`opentelemetry-erlang` repository, is currently unstable, documentation TBA.

[opentelemetry specification]: /docs/reference/specification/
[trace semantic conventions]:
  /docs/reference/specification/trace/semantic_conventions/

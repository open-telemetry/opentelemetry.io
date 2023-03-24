---
title: Instrumentation
weight: 30
---

Instrumentation is the act of adding observability code to your application.
This can be done with direct calls to the OpenTelemetry API within your code or
including a dependency which calls the API and hooks into your project, like a
middleware for an HTTP server.

## Tracing

### Initialize Tracing

To start [tracing](/docs/concepts/signals/traces/) a
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) is required
for creating a [`Tracer`](/docs/concepts/signals/traces/#tracer). When the
OpenTelemetry SDK Application (`opentelemetry`) boots, it starts and configures a
global `TracerProvider`. A `Tracer` for each loaded OTP Application is created
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

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
opentelemetry:get_application_tracer(?MODULE)
{{< /tab >}}

{{< tab Elixir >}}
:opentelemetry.get_application_tracer(__MODULE__)
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

This is how the Erlang and Elixir macros for starting and updating `Spans` get a
`Tracer` automatically without need for you to pass the variable in each call.

### Create Spans

Now that you have [Tracer](/docs/concepts/signals/traces/#tracer)s initialized,
you can create [Spans](/docs/concepts/signals/traces/#spans-in-opentelemetry).

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
?with_span(main, #{}, fun() ->
                        %% do work here.
                        %% when this function returns the Span ends
                      end).

{{< /tab >}}

{{< tab Elixir >}}
require OpenTelemetry.Tracer

...

OpenTelemetry.Tracer.with_span :main do
  # do work here
  # when the block ends the Span ends       
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

The above code sample shows how to create an active Span, which is the most
common kind of Span to create.

### Create Nested Spans

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
parent_function() ->
    ?with_span(parent, #{}, fun child_function/0).

child_function() ->
    %% this is the same process, so the span parent set as the active
    %% span in the with_span call above will be the active span in this function
    ?with_span(child, #{},
               fun() ->
                   %% do work here. when this function returns, child will complete.
               end).

{{< /tab >}}

{{< tab Elixir >}}
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
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

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
telemetry data like [baggage](/docs/reference/specification/baggage/api/).

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
SpanCtx = ?start_span(child),

Ctx = otel_ctx:get_current(),

proc_lib:spawn_link(fun() ->
                        otel_ctx:attach(Ctx),
                        ?set_current_span(SpanCtx),

                        %% do work here

                        ?end_span(SpanCtx)
                    end),
{{< /tab >}}

{{< tab Elixir >}}
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
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Linking the New Span

A [Span](/docs/concepts/signals/traces/#spans-in-opentelemetry) can be created
with zero or more Span Links that causally link it to another Span. A
[Link](/docs/concepts/signals/traces/#span-links) needs a Span context to be
created.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
Parent = ?current_span_ctx,
proc_lib:spawn_link(fun() ->
                        %% a new process has a new context so the span created
                        %% by the following `with_span` will have no parent
                        Link = opentelemetry:link(Parent),
                        ?with_span('other-process', #{links => [Link]},
                                   fun() -> ok end)
                    end),
{{< /tab >}}

{{< tab Elixir >}}
parent = OpenTelemetry.current_span_ctx()
task = Task.async(fn ->
                    # a new process has a new context so the span created
                    # by the following `with_span` will have no parent
                    link = OpenTelemetry.link(parent)
                    Tracer.with_span :my-task, %{links: [link]} do
                      :hello
                    end
                 end)
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Adding Attributes to a Span

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a Span so it carries more information about the current operation that
it’s tracking.

The following example shows the two ways of setting attributes on a span by both
setting an attribute in the start options and then again with `set_attributes`
in the body of the span operation:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
?with_span(my_span, #{attributes => [{'start-opts-attr', <<"start-opts-value">>}]},
           fun() ->
               ?set_attributes([{'my-attribute', <<"my-value">>},
                                {another_attribute, <<"value-of-attribute">>}])
           end)
{{< /tab >}}

{{< tab Elixir >}}
Tracer.with_span :span_1, %{attributes: [{:"start-opts-attr", <<"start-opts-value">>}]} do
  Tracer.set_attributes([{:"my-attributes", "my-value"},
                         {:another_attribute, "value-of-attributes"}])
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Semantic Attributes

Semantic Attributes are attributes that are defined by the [OpenTelemetry
Specification][] in order to provide a shared set of attribute keys across
multiple languages, frameworks, and runtimes for common concepts like HTTP
methods, status codes, user agents, and more. These attribute keys are generated
from the specification and provided in
[opentelemetry_semantic_conventions](https://hex.pm/packages/opentelemetry_semantic_conventions).

For example, an instrumentation for an HTTP client or server would need to
include semantic attributes like the scheme of the URL:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
-include_lib("opentelemetry_semantic_conventions/include/trace.hrl").

?with_span(<my_span, #{attributes => [{?HTTP_SCHEME, <<"https">>}]},
           fun() ->
             ...
           end)
{{< /tab >}}

{{< tab Elixir >}}
alias OpenTelemetry.SemanticConventions.Trace, as: Trace

Tracer.with_span :span_1, %{attributes: [{Trace.http_scheme(), <<"https">>}]} do
  
end
{{< /tab >}}

{{< /tabpane >}}

### Adding Events

A [Span
Event](/docs/concepts/signals/traces/#span-events) is a
human-readable message on an
[Span](/docs/concepts/signals/traces/#spans-in-opentelemetry)
that represents a discrete event with no duration that can be tracked by a
single time stamp. You can think of it like a primitive log.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
?add_event(<<"Gonna try it">>),

%% Do the thing

?add_event(<<"Did it!">>),
{{< /tab >}}

{{< tab Elixir >}}
Tracer.add_event("Gonna try it")

%% Do the thing

Tracer.add_event("Did it!")
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Events can also have attributes of their own:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
?add_event(<<"Process exited with reason">>, [{pid, Pid)}, {reason, Reason}]))
{{< /tab >}}

{{< tab Elixir >}}
Tracer.add_event("Process exited with reason", pid: pid, reason: Reason)
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Set Span Status

A [Status](/docs/concepts/signals/traces/#span-status) can be set on a
[Span](/docs/concepts/signals/traces/#spans-in-opentelemetry), typically used to
specify that a Span has not completed successfully - `StatusCode.ERROR`. In rare
scenarios, you could override the Error status with `StatusCode.OK`, but don’t
set `StatusCode.OK` on successfully-completed spans.

The status can be set at any time before the span is finished:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
-include_lib("opentelemetry_api/include/opentelemetry.hrl").

?set_status(?OTEL_STATUS_ERROR, <<"this is not ok">>)
{{< /tab >}}

{{< tab Elixir >}}
Tracer.set_status(:error, "this is not ok")
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

## Creating Metrics

The metrics API, found in `apps/opentelemetry_experimental_api` of the
[opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang)
repository, is currently unstable, documentation TBA.

[opentelemetry specification]: /docs/reference/specification/
[trace semantic conventions]:
  /docs/reference/specification/trace/semantic_conventions/

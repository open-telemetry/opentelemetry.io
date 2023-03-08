---
title: Manual Instrumentation
linkTitle: Manual
aliases:
  - /docs/instrumentation/ruby/manual_instrumentation
  - /docs/instrumentation/ruby/events
  - /docs/instrumentation/ruby/context-propagation
weight: 4
---

Auto-instrumentation is the easiest way to get started with instrumenting your
code, but in order to get the most insight into your system, you should add
manual instrumentation where appropriate. To do this, use the OpenTelemetry SDK
to access the currently executing span and add attributes to it, and/or to
create new spans.

## Initializing the SDK

First, ensure you have the SDK package installed:

```sh
gem install opentelemetry-sdk
```

Then include configuration code that runs when your program initializes. Make
sure that `service.name` is set by configuring a service name.

### Acquiring a Tracer

To begin [tracing](/docs/concepts/signals/traces), you will need to ensure you
have an initialized [`Tracer`](/docs/concepts/signals/traces#tracer) that comes
from a [`TracerProvider`](/docs/concepts/signals/traces#tracer-provider).

The easiest and most common way to do this is to use the globally-registered
TracerProvider. If you are using
[instrumentation libraries](/docs/instrumentation/ruby/automatic), such as in a
Rails app, then one will be registered for you.

```ruby
# If in a rails app, this lives in config/initializers/opentelemetry.rb
require "opentelemetry/sdk"

OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
end

# 'Tracer' can be used throughout your code now
MyAppTracer = OpenTelemetry.tracer_provider.tracer('<YOUR_TRACER_NAME>')
```

With a `Tracer` acquired, you can manually trace code.

## Tracing

### Get the current span

It's very common to add information to the current
[span](/docs/concepts/signals/traces#spans-in-opentelemetry) somewhere within
your program. To do so, you can get the current span and add
[attributes](/docs/concepts/signals/traces#attributes) to it.

```ruby
require "opentelemetry/sdk"

def track_extended_warranty(extended_warranty)
  # Get the current span
  current_span = OpenTelemetry::Trace.current_span

  # And add useful stuff to it!
  current_span.add_attributes({
    "com.extended_warranty.id" => extended_warranty.id,
    "com.extended_warranty.timestamp" => extended_warranty.timestamp
  })
end
```

### Creating New Spans

To create a [span](/docs/concepts/signals/traces#spans-in-opentelemetry), you’ll
need a [configured `Tracer`](#acquiring-a-tracer).

Typically when you create a new span, you'll want it to be the active/current
span. To do that, use `in_span`:

```ruby
require "opentelemetry/sdk"

def do_work
  MyAppTracer.in_span("do_work") do |span|
    # do some work that the 'do_work' span tracks!
  end
end
```

### Creating nested spans

If you have a distinct sub-operation you’d like to track as a part of another
one, you can create nested
[spans](/docs/concepts/signals/traces#spans-in-opentelemetry) to represent the
relationship:

```ruby
require "opentelemetry/sdk"

def parent_work
  MyAppTracer.in_span("parent") do |span|
    # do some work that the 'parent' span tracks!

    child_work

    # do some more work afterwards
  end
end

def child_work
  MyAppTracer.in_span("child") do |span|
    # do some work that the 'child' span tracks!
  end
end
```

In the preceding example, two spans are created - named `parent` and `child` -
with `child` nested under `parent`. If you view a trace with these spans in a
trace visualization tool, `child` will be nested under `parent`.

### Add attributes to a span

[Attributes](/docs/concepts/signals/traces#attributes) let you attach key/value
pairs to a [span](/docs/concepts/signals/traces#spans-in-opentelemetry) so it
carries more information about the current operation that it’s tracking.

You can use `set_attribute` to add a single attribute to a span:

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.set_attribute("animals", ["elephant", "tiger"])
```

You can use `add_attributes` to add a map of attributes:

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  "my.cool.attribute" => "a value",
  "my.first.name" => "Oscar"
})
```

You can also add attributes to a span as
[it's being created](#creating-new-spans):

```ruby
require "opentelemetry/sdk"

MyAppTracer.in_span('foo', attributes: { "hello" => "world", "some.number" => 1024 }) do |span|
  #  do stuff with the span
end
```

> &#9888; Spans are thread safe data structures that require locks when they are
> mutated. You should therefore avoid calling `set_attribute` multiple times and
> instead assign attributes in bulk with a Hash, either during span creation or
> with `add_attributes` on an existing span.

> &#9888; Sampling decisions happen at the moment of span creation. If your
> sampler considers span attributes when deciding to sample a span, then you
> _must_ pass those attributes as part of span creation. Any attributes added
> after creation will not be seen by the sampler, because the sampling decision
> has already been made.

### Add semantic attributes

[Semantic Attributes][semconv-spec] are pre-defined
[Attributes](/docs/concepts/signals/traces#attributes) that are well-known
naming conventions for common kinds of data. Using Semantic Attributes lets you
normalize this kind of information across your systems.

To use Semantic Attributes in Ruby, add the appropriate gem:

```sh
gem install opentelemetry-semantic_conventions
```

Then you can use it in code:

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/semantic_conventions'

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  OpenTelemetry::SemanticConventions::Trace::HTTP_METHOD => "GET",
  OpenTelemetry::SemanticConventions::Trace::HTTP_URL => "https://opentelemetry.io/",
})
```

### Add Span Events

A [span event](/docs/concepts/signals/traces#span-events) is a human-readable
message on a span that represents "something happening" during it's lifetime.
For example, imagine a function that requires exclusive access to a resource
that is under a mutex. An event could be created at two points - once, when we
try to gain access to the resource, and another when we acquire the mutex.

```ruby
require "opentelemetry/sdk"

span = OpenTelemetry::Trace.current_span

span.add_event("Acquiring lock")
if mutex.try_lock
  span.add_event("Got lock, doing work...")
  # some code here
  span.add_event("Releasing lock")
else
  span.add_event("Lock already in use")
end
```

A useful characteristic of events is that their timestamps are displayed as
offsets from the beginning of the span, allowing you to easily see how much time
elapsed between them.

Events can also have attributes of their own e.g.

```ruby
require "opentelemetry/sdk"

span.add_event("Cancelled wait due to external signal", attributes: {
  "pid" => 4328,
  "signal" => "SIGHUP"
})
```

### Add Span Links

A [span](/docs/concepts/signals/traces#spans-in-opentelemetry) can be created
with zero or more [span links](/docs/concepts/signals/traces#span-links) that
causally link it to another span. A link needs a
[span context](/docs/concepts/signals/traces#span-context) to be created.

```ruby
require "opentelemetry/sdk"

span_to_link_from = OpenTelemetry::Trace.current_span

link = OpenTelemetry::Trace::Link.new(span_to_link_from.context)

MyAppTracer.in_span("new-span", links: [link])
  # do something that 'new_span' tracks

  # The link in 'new_span' casually associated it with the span it's linked from,
  # but it is not necessarily a child span.
end
```

Span Links are often used to link together different traces that are related in
some way, such as a long-running task that calls into sub-tasks asynchronously.

Links can also be created with additional attributes:

```ruby
link = OpenTelemetry::Trace::Link.new(span_to_link_from.context, attributes: { "some.attribute" => 12 })
```

### Set span status

A [status](/docs/concepts/signals/traces#span-status) can be set on a
[span](/docs/concepts/signals/traces#spans-in-opentelemetry), typically used to
specify that a span has not completed successfully - StatusCode.ERROR. In rare
scenarios, you could override the Error status with StatusCode.OK, but don’t set
StatusCode.OK on successfully-completed spans.

The status can be set at any time before the span is finished:

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # something that obviously fails
rescue
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
end
```

### Record exceptions in spans

It can be a good idea to record exceptions when they happen. It’s recommended to
do this in conjunction with [setting span status](#set-span-status).

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # something that obviously fails
rescue Exception => e
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
  current_span.record_exception(e)
end
```

Recording an exception creates a
[Span Event](/docs/concepts/signals/traces#span-events) on the current span with
a stack trace as an attribute on the span event.

Exceptions can also be recorded with additional attributes:

```ruby
current_span.record_exception(ex, attributes: { "some.attribute" => 12 })
```

## Context Propagation

> Distributed Tracing tracks the progression of a single Request, called a
> Trace, as it is handled by Services that make up an Application. A Distributed
> Trace transverses process, network and security boundaries. [Glossary][]

This requires _context propagation_, a mechanism where identifiers for a trace
are sent to remote processes.

> &#8505; The OpenTelemetry Ruby SDK will take care of context propagation as
> long as your service is leveraging auto-instrumented libraries. Please refer
> to the [README][auto-instrumentation] for more details.

In order to propagate trace context over the wire, a propagator must be
registered with the OpenTelemetry SDK. The W3 TraceContext and Baggage
propagators are configured by default. Operators may override this value by
setting `OTEL_PROPAGATORS` environment variable to a comma separated list of
[propagators][propagators]. For example, to add B3 propagation, set
`OTEL_PROPAGATORS` to the complete list of propagation formats you wish to
support:

```sh
export OTEL_PROPAGATORS=tracecontext,baggage,b3
```

Propagators other than `tracecontext` and `baggage` must be added as gem
dependencies to your Gemfile, e.g.:

```ruby
gem 'opentelemetry-propagator-b3'
```

[glossary]: /docs/concepts/glossary/
[propagators]:
  https://github.com/open-telemetry/opentelemetry-ruby/tree/main/propagator
[auto-instrumentation]:
  https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[semconv-gem]:
  https://github.com/open-telemetry/opentelemetry-ruby/tree/main/semantic_conventions
[semconv-spec]: /docs/reference/specification/trace/semantic_conventions/
[opentelemetry specification]: /docs/reference/specification/

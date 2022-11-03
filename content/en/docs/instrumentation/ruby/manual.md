---
title: Manual Instrumentation
linkTitle: Manual
aliases:
  - /docs/instrumentation/ruby/manual_instrumentation
  - /docs/instrumentation/ruby/events
  - /docs/instrumentation/ruby/context-propagation
weight: 4
---

Auto-instrumentation is the easiest way to get started with instrumenting your code, but in order to get the most insight into your system, you should add manual instrumentation where appropriate.
To do this, use the OpenTelemetry SDK to access the currently executing span and add attributes to it, and/or to create new spans.

### Add information to the current span

It's often beneficial to add information to the currently executing span in a trace.
For example, you may have an application or service that handles extended warranties, and you want to associate it with the span when querying your tracing datastore.
In order to do this, get the current span and set [attributes](#attributes) with your application's domain specific data:

```ruby
def track_extended_warranty(extended_warranty)
  current_span = OpenTelemetry::Trace.current_span
  current_span.add_attributes({
    "com.extended_warranty.id" => extended_warranty.id,
    "com.extended_warranty.timestamp" => extended_warranty.timestamp
  })
end
```

### Creating New Spans

Auto-instrumentation can show the shape of requests to your system, but only you know the really important parts.
In order to get the full picture of what's happening, you will have to add manual instrumentation and create some custom spans.
To do this, grab the tracer from the OpenTelemetry API and generate a span:

```ruby
# ...

def search_by(query)
  tracer = OpenTelemetry.tracer_provider.tracer('my-tracer')
  tracer.in_span("search_by") do |span|
    # ... expensive query
  end
end
```

The `in_span` convenience method is unique to Ruby implementation, which reduces some of the boilerplate code that you would have to otherwise write yourself:

```ruby
def search_by(query)
  span = tracer.start_span("search_by", kind: :internal)
  OpenTelemetry::Trace.with_span(span) do |span, context|
    # ... expensive query
  end
rescue Exception => e
  span&.record_exception(e)
  span&.status = OpenTelemetry::Trace::Status.error("Unhandled exception of type: #{e.class}")
  raise e
ensure
  span&.finish
end
```

### Attributes

Attributes are keys and values that are applied as metadata to your spans and are useful for aggregating, filtering, and grouping traces. Attributes can be added at span creation, or at any other time during the lifecycle of a span before it has completed.

```ruby
# setting attributes at creation...
tracer.in_span('foo', attributes: {  "hello" => "world", "some.number" => 1024, "tags" => [ "bugs", "won't fix" ] }, kind: :internal) do |span|

  # ... and after creation
  span.set_attribute("animals", ["elephant", "tiger"])

  span.add_attributes({ "my.cool.attribute" => "a value", "my.first.name" => "Oscar" })
end
```

> &#9888; Spans are thread safe data structures that require locks when they are mutated.
> You should therefore avoid calling `set_attribute` multiple times and instead assign attributes in bulk with a Hash, either during span creation or with `add_attributes` on an existing span.

> &#9888; Sampling decisions happen at the moment of span creation.
> If your sampler considers span attributes when deciding to sample a span, then you _must_ pass those attributes as part of span creation. Any attributes added after creation will not be seen by the sampler, because the sampling decision has already been made.

#### Semantic Attributes

Semantic Attributes are attributes that are defined by the [OpenTelemetry Specification][] in order to provide a shared set of attribute keys across multiple languages, frameworks, and runtimes for common concepts like HTTP methods, status codes, user agents, and more. These attributes are available in the [Semantic Conventions gem][semconv-gem].

For details, see [Trace semantic conventions][semconv-spec].

### Span Events

An event is a human-readable message on a span that represents "something happening" during it's lifetime. For example, imagine a function that requires exclusive access to a resource that is under a mutex. An event could be created at two points - once, when we try to gain access to the resource, and another when we acquire the mutex.

```ruby
span.add_event("Acquiring lock")
if mutex.try_lock
  span.add_event("Got lock, doing work...")
  # some code here
  span.add_event("Releasing lock")
else
  span.add_event("Lock already in use")
end
```

A useful characteristic of events is that their timestamps are displayed as offsets from the beginning of the span, allowing you to easily see how much time elapsed between them.

Events can also have attributes of their own e.g.

```ruby
span.add_event("Cancelled wait due to external signal", attributes: { "pid" => 4328, "signal" => "SIGHUP" })
```

## Context Propagation

> Distributed Tracing tracks the progression of a single Request, called a Trace, as it is handled by Services that make up an Application. A Distributed Trace transverses process, network and security boundaries. [Glossary][]

This requires _context propagation_, a mechanism where identifiers for a trace are sent to remote processes.

> &#8505; The OpenTelemetry Ruby SDK will take care of context propagation as long as your service is leveraging auto-instrumented libraries. Please refer to the [README][auto-instrumentation] for more details.

In order to propagate trace context over the wire, a propagator must be registered with the OpenTelemetry SDK.
The W3 TraceContext and Baggage propagators are configured by default.
Operators may override this value by setting `OTEL_PROPAGATORS` environment variable to a comma separated list of [propagators][propagators].
For example, to add B3 propagation, set `OTEL_PROPAGATORS` to the complete list of propagation formats you wish to support:

```sh
export OTEL_PROPAGATORS=tracecontext,baggage,b3
```

Propagators other than `tracecontext` and `baggage` must be added as gem dependencies to your Gemfile, e.g.:

```ruby
gem 'opentelemetry-propagator-b3'
```

[glossary]: /docs/concepts/glossary/
[propagators]: https://github.com/open-telemetry/opentelemetry-ruby/tree/main/propagator
[auto-instrumentation]: https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[semconv-gem]: https://github.com/open-telemetry/opentelemetry-ruby/tree/main/semantic_conventions
[semconv-spec]: {{< relref "/docs/reference/specification/trace/semantic_conventions" >}}
[OpenTelemetry Specification]: {{< relref "/docs/reference/specification" >}}

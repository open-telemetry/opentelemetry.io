---
title: Propagation
weight: 60
cSpell:ignore: elli
---

## Cross Service Propagators

Distributed traces extend beyond a single service, meaning some context must be
propagated across services to create the parent-child relationship between
Spans. This requires cross service
[_context propagation_](/docs/specs/otel/overview/#context-propagation), a
mechanism where identifiers for a Trace are sent to remote processes.

Instrumentation Libraries for HTTP frameworks and servers like
[Phoenix](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_phoenix),
[Cowboy](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_cowboy),
[Elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli)
and clients like
[Tesla](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_tesla)
will automatically inject or extract context using the globally registered
propagators. By default the global propagators used are the W3C
[Trace Context](https://w3c.github.io/trace-context/) and
[Baggage](https://www.w3.org/TR/baggage/) formats.

These global propagators can be configured by the Application environment
variable `text_map_propagators`:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Erlang %}}

```erlang
%% sys.config
...
{text_map_propagators, [baggage,
                        trace_context]},
...
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
## runtime.exs
...
text_map_propagators: [:baggage, :trace_context],
...
```

{{% /tab %}} {{< /tabpane >}}

Or through a comma separated list with the environment variable
`OTEL_PROPAGATORS`. Both forms of configuration accept the values
`trace_context`, `baggage`, [`b3`](https://github.com/openzipkin/b3-propagation)
and `b3multi`.

To manually inject or extract context the `otel_propagator_text_map` module can
be used:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Erlang %}}

```erlang
%% uses the context from the process dictionary to add to an empty list of headers
Headers = otel_propagator_text_map:inject([]),

%% creates a context in the process dictionary from Headers
otel_propagator_text_map:extract(Headers),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# uses the context from the process dictionary to add to an empty list of headers
headers = :otel_propagator_text_map.inject([])

# creates a context in the process dictionary from headers
:otel_propagator_text_map.extract(headers)
```

{{% /tab %}} {{< /tabpane >}}

`otel_propagator_text_map:inject/1` and `otel_propagator_text_map:extract/1` use
globally registered propagators. To use a specific propagator
`otel_propagator_text_map:inject/2` and `otel_propagator_text_map:extract/2` can
be used with the first argument being the name of the propagator module to call.

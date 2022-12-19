---
title: Propagation
weight: 35
---

## Cross Service Propagators

Distributed traces extend beyond a single service, meaning some context must be
propagated across services to create the parent-child relationship between
Spans. This requires cross service [_context
propagation_]({{< relref "/docs/reference/specification/overview#context-propagation" >}}),
a mechanism where identifiers for a trace are sent to remote processes.

In order to propagate [Trace context]({{< relref
"/docs/concepts/signals/traces.md#context-propagation" >}}) over the wire, a propagator must be
registered with OpenTelemetry. This can be done through configuration of the
`opentelemetry` application:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% sys.config
...
{text_map_propagators, [baggage,
                        trace_context]},
...
{{< /tab >}}

{{< tab Elixir >}}
## runtime.exs
...
text_map_propagators: [:baggage, :trace_context],
...
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

If you instead need to use the [B3
specification](https://github.com/openzipkin/b3-propagation), originally from
the [Zipkin project](https://zipkin.io/), then replace `trace_context` and
`:trace_context` with `b3` and `:b3` for Erlang or Elixir respectively.


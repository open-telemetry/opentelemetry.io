{{ $lang := .Get 0 | default "" -}}

With context propagation, [Signals](/docs/concepts/signals) can be correlated
with each other, regardless of where they are generated. Although not limited to
tracing, context propagation allows [traces](/docs/concepts/signals/traces) to
build causal information about a system across services that are arbitrarily
distributed across process and network boundaries.

For the vast majority of use cases, libraries that natively support
OpenTelemetry or [instrumentation libraries](../libraries) will automatically
propagate trace context across services for you. Only in rare cases you will
need to propagate context manually.

{{ if $lang -}}

To learn more about context propagation, read the
[concept page about it](/docs/concepts/context-propagation).

{{ else -}}

To understand context propagation, you need to understand two separate concepts:
context and propagation.

{{ end -}}

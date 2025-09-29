---
---

This is the OpenTelemetry {{ $name }} documentation. OpenTelemetry is an
observability framework -- an API, SDK, and tools that are designed to aid in
the generation and collection of application telemetry data such as metrics,
logs, and traces. This documentation is designed to help you understand how to
get started using OpenTelemetry {{ $name }}.

## Status and Releases

The current status of the major functional components for OpenTelemetry
{{ $name }} is as follows:

| Traces              | Metrics              | Logs              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

For releases, including the [latest release][], see [Releases]. {{ $.Inner }}

[latest release]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>

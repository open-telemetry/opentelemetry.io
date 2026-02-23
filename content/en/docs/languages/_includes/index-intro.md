---
---

Welcome to the OpenTelemetry {{ $name }} documentation. This section introduces
how to use OpenTelemetry with {{ $name }} to generate and collect telemetry data
such as metrics, logs, and traces using the OpenTelemetry API and SDKs.

These pages are intended to help you get started and understand the current
capabilities and status of OpenTelemetry {{ $name }}.

## Status and Releases

The current status of the major functional components for OpenTelemetry
{{ $name }} is as follows:

| Traces              | Metrics              | Logs              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

For releases, including the [latest release][], see [Releases][]. {{ $.Inner }}

[latest release]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>

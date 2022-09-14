{{ $data := index $.Site.Data.instrumentation.languages (.Get 0) }}
{{ $name := $data.name }}
{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" (.Get 0) -}}

This is the OpenTelemetry for {{ $name }} documentation. OpenTelemetry is an
observability framework -- an API, SDK, and tools that are designed to aid in
the generation and collection of application telemetry data such as metrics,
logs, and traces. This documentation is designed to help you understand how to
get started using OpenTelemetry for {{ $name }}.

## Status and Releases

The current status of the major functional components for OpenTelemetry {{ $name }} is
as follows:

| Traces    | Metrics      | Logs         |
| --------  | -------      | -------      |
| {{ $data.status.traces | humanize }}    | {{ $data.status.metrics | humanize }} | {{ $data.status.logs | humanize }} |

For releases, including the [latest release][], see [Releases][].
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

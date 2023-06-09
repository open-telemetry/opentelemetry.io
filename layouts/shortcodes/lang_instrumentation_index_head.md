{{/*
  TODO: keep this duplicate of `layouts/shortcodes/docs/instrumentation/lang-index-intro.md`
  only until the Go docs are updated.
*/ -}}

{{ $data := index $.Site.Data.instrumentation.languages (.Get 0) }}
{{ $name := $data.name }}
{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" (.Get 0) -}}
{{ $tracesStatus := $data.status.traces | humanize }}
{{ $metricsStatus := $data.status.metrics | humanize }}
{{ $logsStatus := $data.status.logs | humanize }}
{{ if in "Stable Experimental" $tracesStatus }}
    {{ $tracesStatus = printf "[%s](/docs/specs/otel/versioning-and-stability/#%s)" $tracesStatus $data.status.traces }}
{{ end }}
{{ if in "Stable Experimental" $metricsStatus }}
    {{ $metricsStatus = printf "[%s](/docs/specs/otel/versioning-and-stability/#%s)" $metricsStatus $data.status.metrics }}
{{ end }}
{{ if in "Stable Experimental" $logsStatus }}
    {{ $logsStatus = printf "[%s](/docs/specs/otel/versioning-and-stability/#%s)" $logsStatus $data.status.logs }}
{{ end }}
This is the OpenTelemetry {{ $name }} documentation. OpenTelemetry is an
observability framework -- an API, SDK, and tools that are designed to aid in
the generation and collection of application telemetry data such as metrics,
logs, and traces. This documentation is designed to help you understand how to
get started using OpenTelemetry {{ $name }}.

## Status and Releases

The current status of the major functional components for OpenTelemetry {{ $name }} is
as follows:

| Traces    | Metrics      | Logs         |
| --------  | -------      | -------      |
| {{ $tracesStatus }}    | {{ $metricsStatus }} | {{ $logsStatus }} |

For releases, including the [latest release][], see [Releases][].
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

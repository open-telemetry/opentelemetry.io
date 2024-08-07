{{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

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

{{ partial "docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}

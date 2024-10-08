{{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $translation := .Get 1 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

{{ $content := index $.Site.Data.languages $translation }}
{{ replace $content.introPage.description "{{ $name }}" $name }}

## {{ $content.introPage.releases.title }}

{{ $traces := $content.introPage.releases.traces }}
{{ $metrics := $content.introPage.releases.metrics }}
{{ $logs := $content.introPage.releases.logs }}

{{ replace $content.introPage.releases.description "{{ $name }}" $name }}

| {{ $traces }}       | {{ $metrics }}       | {{ $logs }}       |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

{{ partial "docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}

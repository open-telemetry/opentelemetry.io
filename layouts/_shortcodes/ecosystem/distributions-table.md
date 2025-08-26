<!-- cSpell:ignore: cond -->
{{/* Common variables */ -}}
{{ $data := sort (sort $.Site.Data.ecosystem.distributions "components") "name" "asc" -}}
{{ $filter := .Get "filter" -}}
{{ $otelRepoUrl := "github.com/open-telemetry/opentelemetry-collector-releases" -}}

{{/* Apply filters based on context */ -}}
{{ if eq $filter "non-collector" -}}
  {{/* Show only non-collector items */ -}}
  {{ $filtered := slice -}}
  {{ range $data -}}
    {{ if not (in .components "Collector") -}}
      {{ $filtered = $filtered | append . -}}
    {{ end -}}
  {{ end -}}
  {{ $data = $filtered -}}
{{ else if eq $filter "first-party-collector" -}}
  {{/* Show only OSS collector items */ -}}
  {{ $data = where $data "components" "intersect" (slice "Collector") -}}
  {{ $filtered := slice -}}
  {{ range $data -}}
    {{ if strings.Contains .url $otelRepoUrl -}}
      {{ $filtered = $filtered | append . -}}
    {{ end -}}
  {{ end -}}
  {{ $data = $filtered -}}
{{ else -}}
  {{/* Show only third-party collector items */ -}}
  {{ $data = where $data "components" "intersect" (slice "Collector") -}}
  {{ $filtered := slice -}}
  {{ range $data -}}
    {{ if not (strings.Contains .url $otelRepoUrl) -}}
      {{ $filtered = $filtered | append . -}}
    {{ end -}}
  {{ end -}}
  {{ $data = $filtered -}}
{{ end -}}

{{ if ne $filter "first-party-collector" -}}
{{ partial "include" (dict
    "_dot" .
    "_path" "otel-does-not-validate-3rd-pty-distros.md")
-}}
{{ end }}

Name[^1]     | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

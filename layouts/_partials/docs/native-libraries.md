{{ $howMany := .Get 1 | default 10 -}}
{{ $langIndex := .Get 0 }}
{{ $lang := index $.Site.Data.instrumentation $langIndex -}}
{{ $integrations := where (slice ) ".language" $langIndex -}}

{{ $integrations := slice }} {{ range $entry := $.Site.Data.registry }}
{{ if and (and (eq $entry.language $langIndex) (eq $entry.isNative true)) (eq $entry.registryType "instrumentation") }}
{{ $integrations = $integrations | append $entry }} {{ end }} {{ end }}

{{ range first $howMany (sort $integrations "name") }}
- [{{ .title }}]({{ .urls.docs }})
{{- end }}

{{ if eq (len $integrations) 0 -}}

<div class="alert alert-secondary" role="alert">
<h4 class="alert-title">Help wanted!</h4>
As of today, we don't know about any {{ $lang.name }} library that has OpenTelemetry
natively integrated. If you know about such a library,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">let us know</a>.
</div>
{{ else -}}
<div class="alert alert-info" role="alert">
If you know a {{ $lang.name }} library that has OpenTelemetry
natively integrated,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">let us know</a>.
</div>
{{ end -}}

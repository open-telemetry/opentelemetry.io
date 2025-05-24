<!-- prettier-ignore -->
{{ $howMany := .Get 1 | default 10 -}}
{{ $langIndex := .Get 0 }}
{{ $lang := index $.Site.Data.instrumentation $langIndex -}}
{{ $integrations := where (slice ) ".language" $langIndex -}}

{{ $integrations := slice }} {{ range $entry := $.Site.Data.registry }}
{{ if and (and (eq $entry.language $langIndex) (eq $entry.isNative true)) (eq $entry.registryType "instrumentation") }}
{{ $integrations = $integrations | append $entry }} {{ end }} {{ end }}

{{ range first $howMany (sort $integrations "name") -}}

<!-- prettier-ignore -->
- [{{ .title }}]({{ .urls.docs }})
{{- end }}

{{ if eq (len $integrations) 0 -}}

<div class="alert alert-secondary" role="alert">
<h4 class="alert-title">Потрібна допомога!</h4>
Станом на сьогодні, ми не знаємо жодної бібліотеки {{ $lang.name }}, яка має нативну інтеграцію з OpenTelemetry. Якщо ви знаєте про таку бібліотеку,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">повідомте нам</a>.
</div>
{{ else -}}
<div class="alert alert-info" role="alert">
Якщо ви знаєте бібліотеку {{ $lang.name }}, яка має нативну інтеграцію з OpenTelemetry,
<a href="https://github.com/open-telemetry/opentelemetry.io/issues/new" target="_blank" rel="noopener" class="external-link">повідомте нам</a>.
</div>
{{ end -}}

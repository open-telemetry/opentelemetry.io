{{ $howMany := .Get 1 | default 10 -}}
{{ $langIndex := .Get 0 -}}
{{ $lang := index $.Site.Data.instrumentation $langIndex -}}
{{ $integrations := slice -}}

{{ range $entry := $.Site.Data.registry -}}
  {{ if and (and (eq $entry.language $langIndex) (eq $entry.isNative true)) (eq $entry.registryType "instrumentation") -}}
    {{ $integrations = $integrations | append $entry -}}
  {{ end -}}
{{ end -}}

{{ range first $howMany (sort $integrations "name") }}
- [{{ .title }}]({{ .urls.docs }})
{{- end }}

{{ if eq (len $integrations) 0 -}}

<div class="alert alert-secondary" role="alert">
<div class="h4 alert-title">Потрібна допомога!</div>

Станом на сьогодні, ми не знаємо жодної бібліотеки {{ $lang.name }}, яка має нативну інтеграцію з OpenTelemetry. Якщо ви знаєте про таку бібліотеку, [повідомте нам][let us know].

</div>

{{- else -}}

<div class="alert alert-info" role="alert">

Якщо ви знаєте бібліотеку {{ $lang.name }}, яка має нативну інтеграцію з OpenTelemetry, [повідомте нам][let us know].

</div>

{{- end }}

[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose

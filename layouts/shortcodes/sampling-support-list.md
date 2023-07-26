{{- range $lang, $data := $.Site.Data.instrumentation }}
  {{- $path := printf "/docs/instrumentation/%s/sampling.md" $lang }}
  {{- with site.GetPage $path }}
    {{- template "list-item" (dict "name" $data.name "page" .) }}
  {{- end }}
{{- end }}

{{ define "list-item" -}}
- [{{ .name }}]({{ .page.RelPermalink }})
{{ end -}}

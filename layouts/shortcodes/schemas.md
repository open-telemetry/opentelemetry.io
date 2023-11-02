{{ $schemaFiles := partial "schema-file-list.html" . -}}
{{ range $schemaFiles }}
- [`{{ .Name }}`](/schemas/{{ .Name }})
{{- end -}}

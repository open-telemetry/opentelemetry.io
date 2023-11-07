{{- $schemaFiles := partial "schema-file-list.html" . -}}

| Version |
|---------|
{{ range $i, $schema := $schemaFiles -}}
| [`{{ $schema.Name }}`](/schemas/{{ $schema.Name }})
{{- if eq $i 0 -}}
  ([latest](../latest))
{{- end -}} |
{{ end -}}

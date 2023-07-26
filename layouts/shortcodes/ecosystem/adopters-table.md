{{ $data := $.Site.Data.ecosystem.adopters }}
Organization[^1] | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
{{ .name }} | {{ delimit (sort .components) ", " }} | {{ if .reference }} [{{ .referenceTitle }}]({{ .reference }}) {{ end }}
{{- end }}

[^1]: Organizations are listed alphabetically

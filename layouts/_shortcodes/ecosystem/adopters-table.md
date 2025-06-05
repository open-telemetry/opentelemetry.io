{{ $data := sort $.Site.Data.ecosystem.adopters "name" }}
Organization[^1] | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
{{ .name }} | {{ delimit (sort .components) ", " }} | {{ if .reference }} [{{ .referenceTitle }}]({{ .reference }}) {{ end }}
{{- end }}

[^1]: Organizations are listed alphabetically

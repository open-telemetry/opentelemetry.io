<!-- cSpell:ignore: cond -->
{{ $data := sort (sort $.Site.Data.ecosystem.distributions "components") "name" "asc" -}}
Name[^1]     | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

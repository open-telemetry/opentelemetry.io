{{ $data := sort $.Site.Data.ecosystem.integrations "name" -}}
Name[^1] | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

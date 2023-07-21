{{ $data := $.Site.Data.ecosystem.integrations }}
Name[^1] | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: listed alphabetically

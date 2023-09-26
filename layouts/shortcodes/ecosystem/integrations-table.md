<!-- cSpell:ignore: cond -->
{{ $data := sort (sort $.Site.Data.ecosystem.integrations "name") "oss" "desc" -}}
Name[^1]     | OSS | Components |  Learn more
------------ | --- | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{- cond .oss "Yes" "No" }} | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

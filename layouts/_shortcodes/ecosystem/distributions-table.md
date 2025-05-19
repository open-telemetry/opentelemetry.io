<!-- cSpell:ignore: cond -->
{{ $data := slice -}}
{{ if .Get "source" -}}
  {{ $data = sort (sort (index $.Site.Data.ecosystem (.Get "source")) "components") "name" "asc" -}}
{{ else -}}
  {{ $data = sort (sort $.Site.Data.ecosystem.distributions "components") "name" "asc" -}}
{{ end -}}
Name[^1]     | Components |  Learn more
------------ | ---------- |  ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

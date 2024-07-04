<!-- cSpell:ignore: cond -->
{{ $data := sort (sort $.Site.Data.ecosystem.integrations "name") "oss" "desc" -}}
Name[^1]     | OSS | Components |  Learn more
------------ | --- | ---------- |  ----------
{{- range $data }}
{{ $cncfTag := cond (not (eq .cncf false)) (printf "<img alt=\"CNCF %s Project\" title=\"CNCF %s Project\" style=\"display: inline-block; padding-left: 8px; border: none; width: 16; height: 16px;\" src=\"/img/cncf-icon-color.svg\">" (humanize .cncf) (humanize .cncf)) "" -}}
[{{ .name }}]({{ .url }}){{ $cncfTag }} | {{- cond .oss "Yes" "No" }} | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: Listed alphabetically

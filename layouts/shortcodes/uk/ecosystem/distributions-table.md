<!-- cSpell:ignore: cond -->
{{ $data := sort (sort $.Site.Data.ecosystem.distributions "components") "name" "asc" -}}
Назва[^1]    | Компонет   | Дізнатись більше
------------ | ---------- | ----------
{{- range $data }}
[{{ .name }}]({{ .url }}) | {{ delimit (sort .components) ", " }} | [{{ replace .docsUrl "https://" "" }}]({{ .docsUrl }})
{{- end }}

[^1]: В алфавітному порядку

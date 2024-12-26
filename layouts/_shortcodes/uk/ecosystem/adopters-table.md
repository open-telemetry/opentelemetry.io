{{ $data := sort $.Site.Data.ecosystem.adopters "name" }}
Організація[^1] | Компонент |  Дізнатись більше
------------ | ---------- |  ----------
{{- range $data }}
{{ .name }} | {{ delimit (sort .components) ", " }} | {{ if .reference }} [{{ .referenceTitle }}]({{ .reference }}) {{ end }}
{{- end }}

[^1]: Організації перераховані в алфавітному порядку

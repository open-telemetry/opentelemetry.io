---
title: "{{ .Title }}"
url: {{ .RelPermalink }}
{{ with .Description }}description: "{{ . }}"{{ end }}
---

{{ .Content }}
{{ if .Pages }}
## Pages

{{ range .Pages }}{{ if not .Draft }}
- [{{ .Title }}]({{ .RelPermalink }}){{ with .Description }}: {{ . }}{{ end }}
{{ end }}{{ end }}
{{ end }}
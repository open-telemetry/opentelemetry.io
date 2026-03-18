---
title: "{{ .Title }}"
url: {{ .RelPermalink }}
{{ with .Description }}description: "{{ . }}"{{ end }}
---

{{ partial "render-shortcodes.md" . }}
{{ if .Pages }}

## Pages

{{ range .Pages }}{{ if not .Draft }}
- [{{ .Title }}]({{ .RelPermalink }}){{ with .Description }}: {{ . }}{{ end }}
{{ end }}{{ end }}
{{ end }}

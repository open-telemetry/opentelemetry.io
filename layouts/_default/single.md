---
title: "{{ .Title }}"
url: {{ .RelPermalink }}
{{ with .Description }}description: "{{ . }}"{{ end }}
{{ with .Date }}date: {{ .Format "2006-01-02" }}{{ end }}
{{ with .Lastmod }}lastmod: {{ .Format "2006-01-02" }}{{ end }}
---

{{ partial "render-shortcodes.md" . }}

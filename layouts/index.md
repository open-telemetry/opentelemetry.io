---
title: "{{ .Title }}"
url: /
description: "{{ .Site.Params.description }}"
---

# {{ .Title }}

> {{ .Site.Params.description }}

## Sections

{{ range .Site.Menus.main }}
- [{{ .Name }}]({{ .URL }})
{{ end }}
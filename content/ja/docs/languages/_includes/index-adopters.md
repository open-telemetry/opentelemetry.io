---
default_lang_commit: b6ddba1118d07bc3c8d1d07b293f227686d0290e
---

{{ $lang := .Get 0 -}}
{{ $Lang := $lang | humanize -}}
{{ $howMany := .Get 1 | default 10 -}}
{{ $adopters := where $.Site.Data.ecosystem.adopters ".components" "intersect" (slice $Lang) -}}

## 誰がOpenTelemetry {{ $Lang }}を使用していますか？

OpenTelemetry {{ $Lang }}は、以下のような多くの組織で使用されています。

{{- if eq $lang "ruby" }}

{{ range first $howMany (sort $adopters "name") }}
- [{{ .name }}]({{ .url }})
{{- end }}

完全な一覧と組織を追加するための手順については、[アダプター](/ecosystem/adopters/)を参照してください。

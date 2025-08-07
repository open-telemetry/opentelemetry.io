---
default_lang_commit: 0458d947ff552527f88cd617377a8148e5e72bd7
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

完全な一覧と組織を追加するための手順については、[採用者](/ecosystem/adopters/)を参照してください。

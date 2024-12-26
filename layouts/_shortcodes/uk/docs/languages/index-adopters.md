{{ $lang := .Get 0 -}}
{{ $Lang := $lang | humanize -}}
{{ $howMany := .Get 1 | default 10 -}}
{{ $adopters := where $.Site.Data.ecosystem.adopters ".components" "intersect" (slice $Lang) -}}

## Хто використовує OpenTelemetry {{ $Lang }}? {#who-uses-opentelemetry-{{ $Lang }}}

OpenTelemetry {{ $Lang }} використовується багатьма організаціями, включаючи:

{{ range first $howMany (sort $adopters "name") }}
- [{{ .name }}]({{ .url }})
{{- end }}

Для повного списку та інструкцій щодо додавання вашої організації дивіться
[Adopters](/ecosystem/adopters/).

<!-- prettier-ignore -->
{{ $lang := .Get 0 -}}
{{ $Lang := $lang | humanize -}}
{{ $howMany := .Get 1 | default 10 -}}
{{ $adopters := where $.Site.Data.ecosystem.adopters ".components" "intersect" (slice $Lang) -}}

## Who's using OpenTelemetry {{ $Lang }}?

OpenTelemetry {{ $Lang }} is in use by a number of organizations, including:

{{ range first $howMany (sort $adopters "name") -}}

<!-- prettier-ignore -->
- [{{ .name }}]({{ .url }})
{{- end }}

For the complete list, and instructions for adding your organization, see
[Adopters](/ecosystem/adopters/).
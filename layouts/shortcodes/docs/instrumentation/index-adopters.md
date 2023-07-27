{{ $lang := .Get 0 | humanize -}}
{{ $data := $.Site.Data.ecosystem.adopters }}

## Who's using OpenTelemetry {{ $lang }}?

OpenTelemetry {{ $lang }} is in use by a number of organizations, including:

{{- range $data }} 
    {{- if in .components $lang }}
- [{{ .name }}]({{ .url }}) 
    {{- end }}
{{- end }}

To have your organisation listed, follow the
[instructions given at the bottom of the Adopters page](/ecosystem/adopters/).
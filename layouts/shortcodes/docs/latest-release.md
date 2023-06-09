{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" (.Get 0) -}}

For releases, including the [latest release][], see [Releases][].
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

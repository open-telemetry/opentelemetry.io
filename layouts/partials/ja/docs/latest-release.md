{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" .lang -}}

[最新のリリース][latest release]を含むリリース情報については、[リリース][Releases]をご覧ください。
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

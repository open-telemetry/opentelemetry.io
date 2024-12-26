{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" .lang -}}

Для випусків, включаючи [останній випуск][latest release], дивіться [Випуски][Releases].
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

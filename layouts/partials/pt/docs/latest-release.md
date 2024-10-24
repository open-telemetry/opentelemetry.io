{{ $relUrl := printf "https://github.com/open-telemetry/opentelemetry-%s/releases" .lang -}}

Para lançamentos, incluindo a [última versão][latest release], consulte a página de [Lançamentos][Releases].
{{- .Inner }}

[latest release]: {{ $relUrl }}/latest
[Releases]: {{ $relUrl }}

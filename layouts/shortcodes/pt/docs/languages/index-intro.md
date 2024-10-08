{{/*
default_lang_commit: 2e21274a01a24a62c67595591d8f4255bef640fc
*/ -}}
{{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

Esta é a documentação do OpenTelemetry para a linguagem {{ $name }}. O OpenTelemetry é um
framework de observabilidade -- uma API, SDK, e ferramentas que são projetadas para auxiliar na
geração e coleta de dados telemétricos de aplicações, como métricas, logs e rastros. Esta documentação foi criada para auxiliá-lo a entender como começar a utilizar o OpenTelemetry em {{ $name }}.

## Status e Lançamentos

O status atual dos principais componentes funcionais do OpenTelemetry para {{ $name }} é o seguinte:

| Rastros              | Métricas              | Logs              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

{{ partial "docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}

{{/*
default_lang_commit: 2e21274a01a24a62c67595591d8f4255bef640fc
*/ -}} {{ $prettier_ignore := `

<!-- prettier-ignore -->
` -}}
{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

Esta é a documentação do OpenTelemetry para a linguagem {{ $name }}. O
OpenTelemetry é um framework de observabilidade -- API, SDKs, e ferramentas que
são desenvolvidas para auxiliar na geração e coleta de dados de telemetria de
aplicações, como métricas, logs e rastros. Esta documentação foi criada para te
auxiliar a entender como começar a utilizar o OpenTelemetry em {{ $name }}.

## Estado e Lançamentos

O estado atual dos principais componentes funcionais do OpenTelemetry para
{{ $name }} é o seguinte:

| Rastros             | Métricas             | Logs              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

{{ partial "pt/docs/latest-release.md" (dict "lang" $lang "Inner" .Inner) -}}

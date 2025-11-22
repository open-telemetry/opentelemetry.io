---
default_lang_commit: 3c38c3392fc74f8f071a7a0179fbd141faa7dc40
---

Esta é a documentação do OpenTelemetry para a linguagem {{ $name }}. O
OpenTelemetry é um framework de observabilidade -- API, SDKs, e ferramentas que
são desenvolvidas para auxiliar na geração e coleta de dados de telemetria de
aplicações, como métricas, logs e rastros. Esta documentação foi criada para te
auxiliar a entender como começar a utilizar o OpenTelemetry em {{ $name }}.

## Estado e Lançamentos {#status-and-releases}

O estado atual dos principais componentes funcionais do OpenTelemetry para
{{ $name }} é o seguinte:

| Rastros             | Métricas             | Logs              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

Para lançamentos, incluindo a [última versão][latest release], consulte a página
de [Lançamentos][Releases]. {{ $.Inner }}

[latest release]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]:
  <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>

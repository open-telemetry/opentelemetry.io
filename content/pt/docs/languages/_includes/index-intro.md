---
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

Boas-vindas à documentação do OpenTelemetry para {{ $name }}. Esta seção
apresenta como usar o OpenTelemetry com {{ $name }} para gerar e coletar dados
de telemetria, como métricas, logs e rastros, utilizando a API e os SDKs do
OpenTelemetry.

Estas páginas foram criadas para te ajudar a começar e a entender as capacidades
e o estado atuais do OpenTelemetry para {{ $name }}.

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

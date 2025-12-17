---
title: Instrumentação
description: Como o OpenTelemetry facilita a instrumentação
weight: 15
default_lang_commit: efeda2d8ded2471211697c3993f6d475a3a8b06e
---

Para que um sistema seja [observável], ele deve ser **instrumentado**: ou seja,
o código dos componentes do sistema deve emitir [rastros], [métricas] e [logs].

Com o OpenTelemetry, você pode instrumentar seu código de duas maneiras:

1. [Soluções manuais](code-based/) por meio das
   [APIs e SDKs oficiais para a maioria das linguagens](/docs/languages/)
2. [Soluções sem código](zero-code/)

As **soluções manuais** permitem obter uma visão mais aprofundada e telemetria
rica diretamente da sua aplicação. Possibilitando o uso da API OpenTelemetry
para gerar telemetria a partir da sua aplicação, atuando como um complemento
essencial para telemetria gerada pelas soluções sem código.

As **soluções sem código** são ótimas para começar ou quando você não pode
modificar a aplicação da qual precisa extrair telemetria. Provendo telemetria
rica das bibliotecas que você utiliza e/ou do ambiente em que sua aplicação está
sendo executada. Outra forma de pensar nisso é que elas oferecem informações
sobre o que está acontecendo _nas bordas_ da sua aplicação.

Você pode utilizar ambas as soluções simultaneamente.

## Benefícios adicionais do OpenTelemetry

O OpenTelemetry oferece mais do que apenas soluções de telemetria manuais e sem
código. Os seguintes recursos também fazem parte do OpenTelemetry:

- Bibliotecas podem utilizar a API OpenTelemetry como dependência, sem impactar
  as aplicações que usam essa biblioteca, a menos que o SDK do OpenTelemetry
  seja importado.
- Para cada um dos [sinais], você tem à disposição diversos métodos para
  criá-los, processá-los e exportá-los.
- Com a [propagação de contexto](../context-propagation/) integrada nas
  implementações, você pode correlacionar sinais independentemente de onde eles
  são gerados.
- [Recursos](../resources/) e
  [Escopo de instrumentação](../instrumentation-scope/) permitem agrupar sinais
  por diferentes entidades, como [host](/docs/specs/semconv/resource/host/),
  [sistema operacional](/docs/specs/semconv/resource/os/) ou
  [cluster K8s](/docs/specs/semconv/resource/k8s/#cluster).
- Cada implementação específica de linguagem da API e SDK segue os requisitos e
  expectativas da [especificação OpenTelemetry](/docs/specs/otel/).
- As [Convenções Semânticas](../semantic-conventions/) fornecem um esquema de
  nomenclatura comum que pode ser usado para padronização em diferentes bases de
  código e plataformas.

[logs]: ../signals/logs/
[métricas]: ../signals/metrics/
[observável]: ../observability-primer/#what-is-observability
[sinais]: ../signals/
[rastros]: ../signals/traces/

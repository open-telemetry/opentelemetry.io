---
title: Instrumentação
description: Como o OpenTelemetry facilita a instrumentação
weight: 15
default_lang_commit: 82bd738d51426acb34e126b230a8a1281f193e3e
drifted_from_default: true
---

Para que um sistema seja observável, ele deve ser **instrumentado**: ou seja, o
código dos componentes do sistema deve emitir
[rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) e
[logs](/docs/concepts/signals/logs/).

Com o OpenTelemetry, você pode instrumentar seu código de duas maneiras:

1. [Soluções manuais](/docs/concepts/instrumentation/code-based) por meio das
   [APIs e SDKs oficiais para a maioria das linguagens](/docs/languages/)
2. [Soluções sem código](/docs/concepts/instrumentation/zero-code/)

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
- Para cada [sinal](/docs/concepts/signals) (rastros, métricas, logs), você tem
  à disposição diversos métodos para criá-los, processá-los e exportá-los.
- Com a [propagação de contexto](/docs/concepts/context-propagation) integrada
  nas implementações, você pode correlacionar sinais, independentemente de onde
  eles são gerados.
- [Recursos](/docs/concepts/resources) e
  [Escopo de instrumentação](/docs/concepts/instrumentation-scope) permitem
  agrupar sinais por diferentes entidades, como
  [host](/docs/specs/semconv/resource/host/),
  [sistema operacional](/docs/specs/semconv/resource/os/) ou
  [cluster K8s](/docs/specs/semconv/resource/k8s/#cluster).
- Cada implementação específica de linguagem da API e SDK segue os requisitos e
  expectativas da [especificação OpenTelemetry](/docs/specs/otel/).
- As [Convenções Semânticas](/docs/concepts/semantic-conventions) fornecem um
  esquema de nomenclatura comum que pode ser usado para padronização em
  diferentes bases de código e plataformas.

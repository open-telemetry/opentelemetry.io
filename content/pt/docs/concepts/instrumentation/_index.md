---
title: Instrumentação
description: Como o OpenTelemetry facilita a instrumentação
aliases: [instrumentation]
weight: 15
default_lang_commit: 13c2d415e935fac3014344e67c6c61556779fd6f
---

Para tornar um sistema observável, ele deve ser **instrumentado**: Ou seja, o
código dos componentes do sistema devem emitir
[rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/), e
[logs](/docs/concepts/signals/logs/).

Usando o OpenTelemetry, você pode instrumentar seu código de duas maneiras
principais:

1. [Soluções baseadas em código](/docs/concepts/instrumentation/code-based)
   através das
   [APIs e SDKs oficiais para a maioria das linguagens](/docs/languages/)
2. [Soluções autoinstrumentadas](/docs/concepts/instrumentation/zero-code/)

Soluções **baseadas em código** permitem obter uma visão mais profunda e rica da
telemetria da própria aplicação. Elas permitem que você use a API do
OpenTelemetry para gerar telemetria a partir da sua aplicação, o que atua como
um complemento essencial para a telemetria gerada por soluções
autoinstrumentadas.

Soluções **autoinstrumentadas** são ótimas para começar ou quando você não pode
modificar a aplicação da qual você precisa obter telemetria. Elas fornecem uma
rica telemetria a partir das bibliotecas que você usa e/ou do ambiente no qual
sua aplicação é executada. Outra forma de pensar é que elas fornecem informações
sobre o que está acontecendo _nas bordas_ da sua aplicação.

Você pode usar ambas as soluções simultaneamente.

## Benefícios adicionais do OpenTelemetry

O OpenTelemetry oferece mais do que apenas soluções de telemetria
autoinstrumentadas e baseadas em código. Também fazem parte do OpenTelemetry:

- As bibliotecas podem aproveitar a API do OpenTelemetry como uma dependência, o
  que não terá impacto nas aplicações que usam essa biblioteca, a menos que o
  SDK do OpenTelemetry seja importado.
- Para cada [sinal](/docs/concepts/signals) (rastros, métricas, logs), você tem
  vários métodos à sua disposição para criar, processar e exportá-los.
- Com a [propagação de contexto](/docs/concepts/context-propagation) incorporada
  nas implementações, você pode correlacionar sinais independentemente de onde
  eles são gerados.
- [Recursos](/docs/concepts/resources) e
  [Escopos de Instrumentação](/docs/concepts/instrumentation-scope) permitem
  agrupar sinais por diferentes entidades, como o
  [host](/docs/specs/semconv/resource/host/),
  [sistema operacional](/docs/specs/semconv/resource/os/) ou
  [cluster K8s](/docs/specs/semconv/resource/k8s/#cluster).
- Cada implementação específica de linguagem da API e SDK seguem os requisitos e
  expectativas da [especificação do OpenTelemetry](/docs/specs/otel/).
- As [Convenções Semânticas](/docs/concepts/semantic-conventions) fornecem um
  esquema de nomenclatura comum que pode ser usado para padronização em bases de
  código e plataformas.

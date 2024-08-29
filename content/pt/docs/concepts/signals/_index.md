---
title: Sinais
description:
  Aprenda sobre as categorias de telemetria suportadas pelo OpenTelemetry
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
default_lang_commit: 08e13eb62f2869300301670675969be705db59ae
---

O propósito do OpenTelemetry é coletar, processar e exportar **[sinais][]**.
Sinais são saídas do sistema que descrevem a atividade subjacente do sistema
operacional e das aplicações que estão sendo executadas em uma plataforma. Um
sinal pode ser algo que você deseja medir em um momento específico, como a
temperatura ou o uso de memória, ou um evento que passa pelos componentes do seu
sistema distribuído e que você gostaria de rastrear. Você pode agrupar
diferentes sinais para observar o funcionamento interno de uma mesma tecnologia
sob diferentes ângulos.

OpenTelemetry atualmente suporta [rastros](/docs/concepts/signals/traces),
[métricas](/docs/concepts/signals/metrics), [logs](/docs/concepts/signals/logs)
e [baggage](/docs/concepts/signals/baggage). Eventos são um tipo específico
de log, e o
[perfilamento está sendo trabalhado](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
pelo Grupo de Trabalho de Perfilamento (Profiling Working Group).

[sinais]: /docs/specs/otel/glossary/#signals

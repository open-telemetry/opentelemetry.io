---
title: Sinais
description: Aprenda sobre a categorias de telemetria suportadas pelo OpenTelemetry.
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
default_lang_commit: 08e13eb62f2869300301670675969be705db59ae
---

O objetivo do OpenTelemetry é colletar, processar e exportar **[signals][]**.
Sinais são saídas de sistemas que descrevem atividades fundamentais do
sistema operacional e aplicações em execução na plataforma. Um sinal pode
ser alguma coisa que você quer avaliar em algum ponto específico do tempo,
como por exemplo, memória utilizada, ou um evento que passa por um componente
do seu sistema distribuido como um trace. você pode agrupar diferentes sinais
para observar o funcionamento interno da mesma tecnologia sob diferentes ângulos.

OpenTelemetry atualmente suporta [traces](/docs/concepts/signals/traces),
[metrics](/docs/concepts/signals/metrics), [logs](/docs/concepts/signals/logs)
e [baggage](/docs/concepts/signals/baggage). _Events_ são um tipo específico de logs e
[_profiles_ are being worked on](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
pelo Grupo de Trabalho de Profiling.

[signals]: /docs/specs/otel/glossary/#signals

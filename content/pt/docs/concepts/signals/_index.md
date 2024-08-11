---
title: Sinais
description: Aprenda sobre as categorias de telemetria suportadas pelo OpenTelemetry.
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
default_lang_commit: 08e13eb62f2869300301670675969be705db59ae
---

O objetivo do OpenTelemetry é coletar, processar e exportar **[sinais][]**.
Sinais são saídas de sistemas que descrevem atividades fundamentais do
sistema operacional e aplicações em execução na plataforma. Um sinal pode
ser alguma coisa que você quer avaliar em algum ponto específico do tempo,
por exemplo, memória utilizada, ou um evento que passa por um componente
do seu sistema distribuido como um rastro. você pode agrupar diferentes sinais
para observar o funcionamento interno da mesma tecnologia sob diferentes ângulos.

OpenTelemetry atualmente suporta [rastros](/docs/concepts/signals/traces),
[métricas](/docs/concepts/signals/metrics), [logs](/docs/concepts/signals/logs)
e [baggage](/docs/concepts/signals/baggage). _Events_ são um tipo específico de logs e
[_profiles_ estão em processo de construção](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
pelo Grupo de Trabalho de Profiling.

[sinais]: /docs/specs/otel/glossary/#signals

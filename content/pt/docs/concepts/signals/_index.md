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
como temperatura, memória utilizada, ou um evento que passa por um componente
de 
something you want to measure at a specific point in time, like temperature or
memory usage, or an event that goes through the components of your distributed
system that you'd like to trace. You can group different signals together to
observe the inner workings of the same piece of technology under different
angles.

OpenTelemetry currently supports [traces](/docs/concepts/signals/traces),
[metrics](/docs/concepts/signals/metrics), [logs](/docs/concepts/signals/logs)
and [baggage](/docs/concepts/signals/baggage). _Events_ are a specific type of
log, and
[_profiles_ are being worked on](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
by the Profiling Working Group.

[signals]: /docs/specs/otel/glossary/#signals

---
title: Señales
description: Conozca las categorías de telemetría compatibles con OpenTelemetry
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: f2a520b85d72db706bff91d879f5bb10fd2e7367
---

El propósito de OpenTelemetry es recopilar, procesar y exportar [señales]. Las
señales son salidas del sistema que describen la actividad subyacente del
sistema operativo y las aplicaciones que se ejecutan en una plataforma. Una
señal puede ser algo que se desea medir en un momento específico, como la
temperatura o el uso de memoria, o un evento que atraviesa los componentes de tu
sistema distribuido y que deseas rastrear. Puedes agrupar diferentes señales
para observar el funcionamiento interno de la misma tecnología desde diferentes
perspectivas.

OpenTelemetry actualmente admite:

- [Traces](traces)
- [Metrics](metrics)
- [Logs](logs)
- [Baggage](baggage)

También en desarrollo o en fase de [proposal]:

- [Events], un tipo específico de [log](logs)
- El Grupo de Trabajo de Perfiles está trabajando en los [Profiles].

[Events]: /docs/specs/otel/logs/data-model/#events
[Profiles]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[señales]: /docs/specs/otel/glossary/#signals

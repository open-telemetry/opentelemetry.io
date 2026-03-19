---
title: Componentes
description:
  Componentes del Collector de OpenTelemetry - receivers, processors, exporters,
  connectors y extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

El Collector de OpenTelemetry está compuesto por componentes que manejan datos
de telemetría. Cada componente tiene un rol específico en el pipeline de datos.

## Tipos de componentes {#component-types}

- **[Recebedores](receiver/)** (_Receivers_) - Recolectan datos de telemetría de
  diversas fuentes y formatos
- **[Procesadores](processor/) (_Processors_)** - Transforman, filtran y
  enriquecen los datos de telemetría
- **[Exportadores](exporter/) (_Exporters_)** - Envían datos de telemetría a
  backends de observabilidad
- **[Conectores](connector/) (_Connectors_)** - Conectan dos pipelines, actuando
  como exporter y receiver a la vez
- **[Extensiones](extension/) (_Extensions_)** - Proporcionan capacidades
  adicionales como verificaciones de salud

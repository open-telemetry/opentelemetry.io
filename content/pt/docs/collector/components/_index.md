---
title: Componentes
description:
  Componentes do OpenTelemetry Collector - receivers, processors, exporters,
  connectors e extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

O OpenTelemetry Collector é composto por componentes que gerenciam dados de telemetria.
Cada componente possui uma função específica no _pipeline_ de dados.

## Tipos de Componentes {#component-types}

- **[Receivers](receiver/)** - Coletam dados de telemetria de diversas fontes e formatos
- **[Processors](processor/)** - Transformam, filtram e enriquecem dados de telemetria
- **[Exporters](exporter/)** - Enviam dados de telemetria para _backends_ de observabilidade
- **[Connectors](connector/)** - Conectam dois _pipelines_, atuando como _exporter_
  e _receiver_
- **[Extensions](extension/)** - Fornecem capacidades adicionais como verificações de integridade _(health checks)_

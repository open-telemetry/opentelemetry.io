---
title: Logs
description: Uma gravação de um evento.
weight: 3
cSpell:ignore: filelogreceiver semistructured transformprocessor
---

Um **log** é um registro de texto com um carimbo de data e hora, seja estruturado (recomendado) ou não estruturado, com metadados opcionais. Dentre os sinais de telemetria, os logs têm uma história mais consolidada. A maioria das linguagens de programação possui recursos de logging embutidas ou bibliotecas de logging bem conhecidas e amplamente utilizadas.

## Logs do OpenTelemetry

O OpenTelemetry não possui uma especificação de API ou SDK específica para gerar logs. Em vez disso, os logs no OpenTelemetry são os logs existentes que você já possui de um framework de logging ou componente de infraestrutura. Os SDKs e a autoinstrumentação do OpenTelemetry utilizam vários componentes para correlacionar automaticamente logs com [rastros](/docs/concepts/signals/traces).

O suporte do OpenTelemetry para logs é projetado para ser totalmente compatível ao que você já possui, oferecendo a capacidade de adicionar contextos a esses logs e uma série de ferramentas para analisar e manipular logs em um formato comum, abrangendo diversas fontes.

### Logs do OpenTelemetry no OpenTelemetry Collector

O [OpenTelemetry Collector](/docs/collector) fornece várias ferramentas para trabalhar com logs:

- Vários _receivers_ que analisam logs de fontes específicas e conhecidas de dados de logs.
- O `filelogreceiver`, que lê logs de qualquer arquivo e fornece recursos para analisá-los a partir de diferentes formatos ou usar uma expressão regular.
- _Processors_ como o `transformprocessor`, permite analisar dados aninhados, simplificar estruturas complexas, adicionando/removendo/atualizando valores e mais.
- _Exporters_ permitem emitir dados de log em um formato não OpenTelemetry.

O primeiro passo na adoção do OpenTelemetry frequentemente envolve implantar um Collector como um agente de logging de propósito geral.



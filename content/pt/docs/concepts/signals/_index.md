---
title: Sinais
description:
  Aprenda sobre as categorias de telemetria suportadas pelo OpenTelemetry
weight: 11
aliases: [data-sources, otel-concepts]
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

O propósito do OpenTelemetry é coletar, processar e exportar [sinais][signals].
Sinais são dados emitidos que descrevem a atividade subjacente do sistema
operacional e das aplicações que estão sendo executadas em uma plataforma. Um
sinal pode ser algo que você deseja medir em um momento específico, como a
temperatura ou o uso de memória, ou um evento que passa pelos componentes do seu
sistema distribuído e que você gostaria de rastrear. Você pode agrupar
diferentes sinais para observar o funcionamento interno de uma mesma tecnologia
sob diferentes ângulos.

O OpenTelemetry atualmente suporta:

- [Rastros](traces)
- [Métricas](metrics)
- [Logs](logs)
- [Bagagem](baggage)

Também em desenvolvimento ou na fase de [proposta][proposal]:

- [Eventos][Events], um tipo específico de [log](logs)
- [Perfis](profiles)

[Events]: /docs/specs/otel/logs/data-model/#events
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals

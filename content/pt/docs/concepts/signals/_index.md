---
title: Sinais
description:
  Aprenda sobre as categorias de telemetria suportadas pelo OpenTelemetry
weight: 11
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
---

O propósito do OpenTelemetry é coletar, processar e exportar [sinais]. Sinais
são dados emitidos que descrevem a atividade subjacente do sistema operacional e
das aplicações que estão sendo executadas em uma plataforma. Um sinal pode ser
algo que você deseja medir em um momento específico, como a temperatura ou o uso
de memória, ou um evento que passa pelos componentes do seu sistema distribuído
e que você gostaria de rastrear. Você pode agrupar diferentes sinais para
observar o funcionamento interno de uma mesma tecnologia sob diferentes ângulos.

O OpenTelemetry atualmente suporta:

- [Rastros](traces)
- [Métricas](metrics)
- [Logs](logs)
- [Bagagem](baggage)

Também em desenvolvimento ou na fase de [proposta]:

- [Eventos], um tipo específico de [log](logs)
- [Perfilamento] está sendo trabalhado pelo Grupo de Trabalho de Perfilamento
  _(Profiling Working Group)_.

[Eventos]: /docs/specs/otel/logs/data-model/#events
[Perfilamento]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposta]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[sinais]: /docs/specs/otel/glossary/#signals

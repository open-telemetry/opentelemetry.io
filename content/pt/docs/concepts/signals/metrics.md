---
title: Métricas
weight: 2
description: Uma medição capturada em tempo de execução.
default_lang_commit: 09f39d1aef5d792a68be42746a06ac828a499350
---

Uma **métrica** é uma **medição** de um serviço em tempo de execução. O momento
de captura dessas medições é conhecido como **evento de métrica**, que consiste
não apenas na medição em si, mas também no momento em que ela foi capturada e os
metadados associados.

Métricas de aplicação e solicitação são indicadores importantes de
disponibilidade e desempenho. Métricas personalizadas podem fornecer percepções
sobre como os indicadores de disponibilidade impactam a experiência do usuário
ou o negócio. Dados coletados podem ser usados para alertar sobre uma
interrupção ou acionar decisões de agendamento para escalar uma aplicação
automaticamente mediante alta demanda.

Para entender como as métricas no OpenTelemetry funcionam, vamos dar uma olhada
em uma lista de componentes que desempenharão um papel na instrumentação do
nosso código.

## Meter Provider

Um Meter Provider (às vezes chamado de `MeterProvider`) é uma fábrica para
`Meter`s (Medidas). Na maioria dos aplicativos, um Meter Provider é inicializado
uma vez e seu ciclo de vida corresponde ao ciclo de vida do aplicativo. A
inicialização do Meter Provider também inclui a inicialização do Resource e do
Exporter. Normalmente, é o primeiro passo na medição com OpenTelemetry. Em
alguns SDKs, um Meter Provider global já está inicializado para você.

## Meter

Um Meter cria [instrumentos métricos](#metric-instruments), capturando medições
sobre um serviço em tempo de execução. Os Meters são criados a partir de Meter
Providers.

## Metric Exporter

Exportadores de Métricas enviam dados de métricas para um consumidor. Este
consumidor pode ser saída padrão para depuração durante o desenvolvimento, o
OpenTelemetry Collector ou qualquer backend de código aberto, ou fornecedor de
sua escolha.

## Metric Instruments

No OpenTelemetry as medições são capturadas por **instrumentos métricos**. Um
instrumento métrico é definido por:

- Nome
- Tipo
- Unidade (opcional)
- Descrição (opcional)

O nome, a unidade e a descrição são escolhidos pelo desenvolvedor ou definidos
via [convenções semânticas](/docs/specs/semconv/general/metrics/) para as mais
comuns como métricas de solicitação e processo.

O tipo de instrumento pode ser um dos seguintes:

- **Counter**: Um valor que se acumula ao longo do tempo -- você pode pensar
  nisso como um odômetro em um carro; ele só sobe.
- **Asynchronous Counter**: O mesmo que o **Contador**, mas é coletado uma vez
  para cada exportação. Pode ser usado se você não tiver acesso aos incrementos
  contínuos, mas apenas ao valor agregado.
- **UpDownCounter**: Um valor que acumula ao longo do tempo, mas também pode
  diminuir novamente. Um exemplo poderia ser o comprimento da fila, ele
  aumentará e diminuirá com o número de itens de trabalho na fila.
- **UpDownCounter assíncrono**: O mesmo que o **UpDownCounter**, mas é coletado
  uma vez para cada exportação. Pode ser usado se você não tiver acesso às
  mudanças contínuas, mas apenas ao valor agregado (por exemplo, tamanho atual
  da fila).
- **Gauge**: Mede um valor atual no momento em que é lido. Um exemplo seria o
  medidor de combustível em um veículo. Os medidores são assíncronos.
- **Histogram**: Uma agregação de valores do lado do cliente, como latências de
  solicitação. Um histograma é uma boa escolha se você estiver interessado em
  estatísticas de valor. Por exemplo: Quantas solicitações levam menos de 1s?

Para mais informações sobre instrumentos síncronos e assíncronos, e qual tipo é
mais adequado para seu caso de uso, consulte
[Diretrizes Complementares](/docs/specs/otel/metrics/supplementary-guidelines/).

## Aggregation

Além dos instrumentos métricos, o conceito de **agregação** é importante
entender. Uma agregação é uma técnica pela qual inúmeras medições são combinadas
em estatísticas exatas ou estimadas sobre eventos métricos que ocorreram durante
uma janela de tempo. O protocolo OTLP transporta essas métricas agregadas. A API
OpenTelemetry fornece uma agregação padrão para cada instrumento que pode ser
substituída usando as Visualizações. O projeto OpenTelemetry visa fornecer
agregações padrão suportadas por visualizadores e backends de telemetria.

Ao contrário do [rastreamento de solicitação](/docs/concepts/signals/traces/),
cujo objetivo é capturar ciclos de vida de solicitação e fornecer contexto para
as partes individuais de uma solicitação, as métricas visam fornecer informações
estatísticas em conjunto. Alguns exemplos de casos de uso para métricas incluem:

- Relatar o número total de bytes lidos por um serviço, por tipo de protocolo.
- Relatar o número total de bytes lidos e os bytes por solicitação.
- Relatar a duração de uma chamada de sistema.
- Relatar tamanhos de solicitação para determinar uma tendência.
- Relatar o uso de CPU ou memória de um processo.
- Relatar valores médios de saldo de uma conta.
- Relatar solicitações ativas atuais sendo manipuladas.

## Views

Uma visualização fornece aos usuários do SDK a flexibilidade de personalizar a
saída de métricas pelo SDK. Você pode personalizar quais instrumentos de
métricas devem ser processados ou ignorados. Você também pode personalizar a
agregação e quais atributos deseja relatar sobre métricas.

## Language Support

Métricas são um sinal
[estável](/docs/specs/otel/versioning-and-stability/#stable) na especificação
OpenTelemetry. Para as implementações específicas de linguagem individual da
Metrics API & SDK, o status é o seguinte:

{{% signal-support-table "metrics" %}}

## Specification

Para saber mais sobre métricas no OpenTelemetry, consulte o
[especificação de métricas](/docs/specs/otel/overview/#metric-signal).

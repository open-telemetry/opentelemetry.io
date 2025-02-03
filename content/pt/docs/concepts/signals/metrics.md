---
title: Métricas
weight: 2
description: Uma medição capturada em tempo de execução.
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
---

Uma métrica é uma medição de um serviço capturada em tempo de execução. O
momento de captura dessas medições é conhecido como evento de métrica, que
consiste não apenas na medição em si, mas também no momento em que ela foi
capturada e os metadados associados.

Métricas de aplicação e de requisição são indicadores importantes de
disponibilidade e desempenho. Métricas personalizadas podem fornecer insights
sobre como os indicadores de disponibilidade impactam a experiência do usuário
ou o negócio. Os dados coletados podem ser usados para alertar sobre uma
interrupção ou desencadear decisões de escalonamento para aumentar
automaticamente uma implantação em caso de alta demanda.

Para entender como as métricas no OpenTelemetry funcionam, vamos analisar uma
lista de componentes que farão parte da instrumentação do nosso código.

## Meter Provider

Um Meter Provider (às vezes chamado de `MeterProvider`) é uma fábrica de
`medidores`. Na maioria das aplicações, um meter provider é inicializado uma vez
e seu ciclo de vida corresponde ao ciclo de vida da aplicação. A inicialização
do meter provider também inclui a inicialização do resource e do exporter. Esse
é tipicamente o primeiro passo para metrificar com o OpenTelemetry. Em alguns
SDKs, um meter provider global já é inicializado para sua aplicação.

## Medidor {#meter}

Um medidor cria [instrumentos de métrica](#metric-instruments), que serão
responsáveis por capturar dados e medir um serviço em tempo de execução.
Métricas são criadas a partir de Meter Providers (Medidores).

## Metric Exporter

Metric Exporters enviam dados de métricas para um consumidor. Esse consumidor
pode ser a saída padrão para depuração durante o desenvolvimento, uma instância
do OpenTelemetry Collector ou qualquer outro backend, seja de código aberto ou
um fornecedor de sua escolha.

## Metric Instruments

Com o OpenTelemetry, as medições são capturadas através de **instrumentos de
métrica**. Um instrumento de métrica é definido por:

- Nome
- Tipo
- Unidade <em>(opcional)</em>
- Descrição <em>(opcional)</em>

O nome, unidade e descrição podem ser escolhidos pelo desenvolvedor ou definidos
através da [convenção semântica](/docs/specs/semconv/general/metrics/) no caso
de métricas comuns, como por exemplo métricas de requisições e processos.

O tipo de instrumento deve ser um dos seguintes:

- **Counter**: Um valor que acumula com o tempo -- você pode imaginar isso como
  um odômetro de um carro; é um valor que só cresce.
- **Asynchronous Counter**: Assim como o **Counter**, porém é coletado uma vez a
  cada exportação. Pode ser usado em casos onde você não tenha acesso aos
  incrementos contínuos, mas apenas ao valor agregado.
- **UpDownCounter**: Um valor que acumula com o tempo, mas também pode cair. Um
  exemplo seria o tamanho de uma fila, este valor irá aumentar e diminuir de
  acordo com o número de itens que estão entrando ou saindo desta fila.
- **Asynchronous UpDownCounter**: Assim como o **UpDownCounter**, porém é
  coletado uma vez a cada exportação. Pode ser usado em casos onde você não
  tenha acesso às mudanças contínuas, mas apenas ao valor agregado (ex., atual
  tamanho da fila).
- **Gauge**: Mede o valor atual no momento da leitura. Um exemplo seria um
  medidor de tanque de combustível de um veículo. Gauges são síncronos.
- **Asynchronous Gauge**: Assim como o **Gauge**, porém é coletado uma vez a
  cada exportação. Pode ser usado em casos onde você não tenha acesso às
  mudanças contínuas, mas apenas ao valor agregado.
- **Histogram**: Uma agregação de valores, tal como latências de requisições. Um
  histograma é uma boa escolha se você está interessado em valores de
  estatísticas. Por exemplo: Quantas requisições estão levando menos de 1s?

Para visualizar mais instrumentos síncronos, assíncronos, e entender qual dos
tipos melhor se encaixa no seu caso de uso, veja
[Diretrizes Suplementares](/docs/specs/otel/metrics/supplementary-guidelines/).

## Agregação {#aggregation}

Além dos instrumentos de métrica, também é importante entendermos o conceito de
**agregações**. Uma agregação é uma técnica pela qual um grande número de
medições é combinado em estatísticas exatas ou estimadas sobre eventos de
métricas que ocorreram durante uma janela de tempo. O protocolo OTLP transporta
essas métricas agregadas. A API do OpenTelemetry fornece uma agregação padrão
para cada instrumento de medição, que podem ser sobrescritas com o uso de
_Views_. Por padrão, o projeto OpenTelemetry visa fornecer agregações que sejam
suportadas por diferentes visualizadores e backends de telemetria.

Ao contrário dos [rastros](../traces/), que são destinados a capturar os ciclos
de vida das requisições e fornecer o contexto para as partes individuais de uma
requisição, as métricas são destinadas a fornecer informações estatísticas em
forma de dados agregados. Alguns exemplos de caso de uso para as métricas
incluem:

- Reportar o número total de _bytes_ lidos por um serviço, por tipo de
  protocolo.
- Reportar o número total de _bytes_ lidos e os _bytes_ por requisição.
- Reportar a duração de uma chamada de sistema.
- Reportar tamanhos de requisições para determinar uma tendência.
- Reportar o uso de CPU ou memória de um processo.
- Reportar valores médios de saldo de uma conta.
- Reportar o número atual de requisições ativas sendo processadas.

## Views

Uma _view_ oferece aos usuários a flexibilidade de personalizar a emissão das
métricas fornecidas pelo SDK. Você pode personalizar quais instrumentos de
métrica devem ser processados ou ignorados. Você também pode customizar a
agregação e quais atributos deseja reportar em suas métricas.

## Suporte de linguagens de programação {#language-support}

As métricas são sinais
[estáveis](/docs/specs/otel/versioning-and-stability/#stable) nas especificações
do OpenTelemetry. Para uma implementação individual ou específica das Métricas
através do SDK ou API, os status são os seguintes:

{{% signal-support-table "metrics" %}}

## Especificação {#specification}

Para aprender mais sobre as métricas no OpenTelemetry, veja as
[especificações de métricas](/docs/specs/otel/overview/#metric-signal).

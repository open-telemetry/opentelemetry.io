---
title: Métricas
weight: 2
description: Uma medição capturada em tempo de execução.
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

Uma métrica é uma medição de um serviço capturada em tempo de execução. O
momento de captura dessa medição é conhecido como evento de métrica, que
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

## Limites de cardinalidade {#cardinality-limits}

A **cardinalidade** de uma métrica é o número de combinações únicas de atributos
reportadas para ela. Como o SDK mantém em memória um estado de agregação
separado (um ponto de dados) para cada combinação única, a cardinalidade
determina o custo de memória das métricas. Diferente dos logs, esse custo escala
com o número de combinações distintas de atributos, e não com o volume de
requisições, então atributos de alta cardinalidade, como IDs de usuário ou
caminhos de URL brutos, podem causar um crescimento ilimitado de memória.

Para proteger as aplicações disso, o SDK de métricas do OpenTelemetry aplica um
**limite de cardinalidade**: um número máximo de combinações únicas de atributos
rastreadas por fluxo de métrica. O padrão é 2000 e pode ser sobrescrito com uma
[View](#views).

Quando o limite é atingido, as combinações de atributos adicionais não são
simplesmente descartadas. Em vez disso, suas medições são agregadas em um único
**ponto de dados de overflow**, identificado pelo atributo
`otel.metric.overflow=true`. Esse design tem três propriedades importantes:

- **Nenhuma medição é perdida.** Apenas os atributos são descartados; os valores
  registrados são incorporados ao ponto de dados de overflow, então o total
  geral da métrica permanece correto.
- **A memória é limitada.** O SDK nunca rastreia mais do que o número
  configurado de combinações.
- **O overflow é observável.** Todos os SDKs usam o mesmo marcador
  `otel.metric.overflow=true`, então uma única consulta pode detectar overflow
  entre serviços, linguagens e backends.

A desvantagem é que qualquer consulta que **filtre ou agrupe por um atributo**
em uma métrica com overflow apresenta contagens menores do que as reais, porque
as medições incorporadas ao overflow não carregam mais esse atributo.

Isso é fácil de subestimar, porque o overflow substitui a combinação de
atributos **inteira**, e não apenas sua parte de alta cardinalidade. Suponha que
um contador de requisições registre `url.path` (alta cardinalidade) junto com
`success` (um booleano). Quando o fluxo entra em overflow, uma medição para
`{url.path=/checkout, success=false}` é incorporada ao único ponto de dados de
overflow `{otel.metric.overflow=true}`, descartando `success` junto com
`url.path`. Uma consulta por `success=false` então deixa de contabilizar essa
medição, mesmo que `success`, por si só, tenha a menor cardinalidade possível
para um atributo. Um alerta de taxa de erros construído sobre `success=false`
pode, portanto, parar de disparar, enquanto o total geral da métrica permanece
correto.

### Onde o limite não se aplica {#what-the-limit-does-not-apply-to}

O limite de cardinalidade se aplica apenas aos atributos fornecidos ao registrar
medições por meio da API de métricas. Ele **não** se aplica a:

- Atributos de [recurso](/docs/concepts/resources/), como `service.name` ou
  `service.instance.id`.
- Atributos do escopo de instrumentação definidos quando um [medidor](#meter) é
  criado.

Os valores dos atributos de recurso e do escopo de instrumentação são
registrados em todos os pontos de dados, incluindo o de overflow, então eles
continuam confiáveis para consultas mesmo durante o overflow. Isso não é um
motivo para realocar atributos de medição como forma de contornar o limite. Os
atributos devem ser posicionados de acordo com o que descrevem: um recurso
descreve a entidade que produz a telemetria, o escopo de instrumentação descreve
a biblioteca de instrumentação, e os atributos de medição descrevem uma medição
individual. Quando os atributos são modelados dessa forma, o contexto que é
constante durante todo o ciclo de vida do processo, como nome do serviço,
ambiente ou região, naturalmente pertence ao recurso, onde também continua
disponível para consultas durante o overflow.

### Temporalidade e limites de cardinalidade {#temporality-and-cardinality-limits}

Para instrumentos síncronos, a
[temporalidade de agregação](/docs/specs/otel/metrics/data-model/#temporality)
determina a rapidez com que o SDK consegue liberar o estado de agregação e,
portanto, a rapidez com que o limite é atingido:

- Com temporalidade **delta**, o SDK reinicia o estado após cada ciclo, então o
  limite restringe apenas as combinações ativas dentro de um único ciclo.
- Com temporalidade **cumulativa**, o SDK mantém o estado entre os ciclos, então
  uma vez que o limite é atingido, novas combinações continuam entrando em
  overflow até que o processo seja reiniciado.

Instrumentos assíncronos seguem regras diferentes que estão além do escopo desta
visão geral.

## Suporte de linguagens de programação {#language-support}

As métricas são sinais
[estáveis](/docs/specs/otel/versioning-and-stability/#stable) nas especificações
do OpenTelemetry. Para uma implementação individual ou específica das Métricas
através do SDK ou API, os status são os seguintes:

{{% signal-support-table "metrics" %}}

## Especificação {#specification}

Para aprender mais sobre as métricas no OpenTelemetry, veja as
[especificações de métricas](/docs/specs/otel/overview/#metric-signal).

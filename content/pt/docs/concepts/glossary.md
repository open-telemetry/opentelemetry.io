---
title: Glossário
description: >-
  Definições e convenções para termos de telemetria conforme usados no
  OpenTelemetry.
weight: 200
default_lang_commit: f37118d8489a60d73dd881645f317d866b53b418
---

Esse glossário define termos e [conceitos](/docs/concepts/) que são novos no
projeto do OpenTelemetry e esclarece os usos de termos específicos do
OpenTelemetry, comuns no universo de observabilidade.

Também comentamos sobre ortografia e capitalização, quando útil. Por exemplo,
consulte [OpenTelemetry](#opentelemetry) e [OTel](#otel).

## Termos {#terms}

### Agregação {#aggregation}

O processo de combinar múltiplas medições em estatísticas exatas ou estimadas
sobre as medições que aconteceram durante um intervalo de tempo, durante a
execução do programa. Utilizado pela [Fonte de Dados](#data-source) de uma
[Métrica](#metric).

### Amostragem {#sampling}

Um mecanismo para controlar a quantidade de dados exportados. Usado mais
comumente com a [Fonte de Dados](#data-source) de [Rastros](#trace). Consulte
[mais informações][sampling].

### API

Interface de Programação de Aplicações (_Application Programming Interface_). No
projeto OpenTelemetry, é utilizada para definir como os dados de telemetria são
gerados pela [Fonte de Dados](#data-source).

### Aplicação {#application}

Um ou mais [Serviços](#service) destinados a usuários finais ou outras
aplicações.

### Aplicação lado do cliente {#client-side-app}

Um componente de uma [Aplicação](#application) que não está sendo executado
dentro de uma infraestrutura privada e é normalmente usado diretamente por
usuários finais. Exemplos de aplicações client-side incluem aplicativos de
navegador, aplicativos móveis e aplicativos executados em dispositivos IoT.

### APM

O Monitoramento de Desempenho de Aplicações (_Application Performance
Monitoring_) envolve monitorar aplicações de software, sua performance
(velocidade, confiabilidade, disponibilidade, etc.) para detectar problemas,
alertar e fornecer ferramentas que permitam encontrar a causa raiz.

### Atributo {#attribute}

Termo do OpenTelemetry para [Metadados](#metadata). Adiciona informações
chave-valor à entidade que está produzindo telemetria. Usado em
[Sinais](#signal) e [Recursos](#resource). Consulte a [especificação de
atributos][attribute].

### Bagagem {#baggage}

Um mecanismo para propagar [Metadados](#metadata) para ajudar a estabelecer uma
relação casual entre eventos e serviços. Consulte as [especificações de
Bagagem][baggage].

### Biblioteca {#library}

Uma coleção específica da linguagem com comportamento invocado por uma
interface.

### Biblioteca de cliente {#client-library}

Consulte a seção [Biblioteca instrumentada](#instrumented-library).

### Biblioteca de instrumentação {#instrumentation-library}

Indica a [Biblioteca](#library) que fornece a instrumentação para uma
determinada [Biblioteca instrumentada](#instrumented-library). A
[Biblioteca instrumentada](#instrumented-library) e a
[Biblioteca de instrumentação](#instrumentation-library) podem ser a mesma
[Biblioteca](#library) caso esta possua instrumentação OpenTelemetry
incorporada. Consulte [a especificação da biblioteca][spec-instrumentation-lib].

### Biblioteca instrumentada {#instrumented-library}

Indica a [Biblioteca](#library) para a qual os sinais telemétricos
([Rastros](#trace), [Métricas](#metric), [Logs](#log)) são coletados. Consulte
[mais informações][spec-instrumented-lib].

### Campo {#field}

Um termo utilizado especificamente por [Registros de Log](#log-record).
[Metadados](#metadata) podem ser adicionados por meio de campos definidos,
incluindo [Atributos](#attribute) e [Recursos](#resource). Outros campos também
podem ser considerados `Metadados`, incluindo severidade e informações de
rastreamento. Consulte a [especificação de campos][field].

### Collector

O [OpenTelemetry Collector], ou simplesmente Collector, é uma implementação
neutra em relação a fornecedores sobre como receber, processar e exportar dados
de telemetria. Um único binário que pode ser implementado como um agente ou
_gateway_.

> **Ortografia**: Ao referir-se ao [OpenTelemetry Collector], sempre capitalize
> a palavra "Collector". Utilize apenas o termo "Collector" caso esteja
> utilizando Collector como um adjetivo &mdash; por exemplo, "Configuração do
> Collector".

[OpenTelemetry Collector]: /docs/collector/

### Contrib

Diversas [Bibliotecas Instrumentadas](#instrumentation-library) e o
[Collector](#collector) oferecem um conjunto de funcionalidades principais,
assim como um repositório contrib dedicado para funcionalidades não essenciais,
incluindo `Exporters` de fornecedores.

### Convenções semânticas {#semantic-conventions}

Define nomes e valores padrão de [Metadados](#metadata) para fornecer dados
telemétricos neutros em relação a fornecedores.

### DAG

[Grafos acíclicos dirigidos][dag].

### Dimensão {#dimension}

Termo utilizado especialmente por [Métricas](#metric). Consulte
[Atributo](#attribute).

### Distribuição {#distribution}

Uma distribuição é um encapsulamento em torno de um repositório upstream do
OpenTelemetry com algumas personalizações. Consulte [mais
detalhes][distribution].

### Especificação {#specification}

Descreve os requisitos e expectativas para implementações em todas as
linguagens. Consulte [mais informações][specification].

### Evento {#event}

Algo que aconteceu cuja representação depende da [Fonte de dados](#data-source).
Por exemplo, [Trecho](#span).

### Exporter

Fornece funcionalidades para emitir dados telemétricos aos consumidores.
Exporters podem ser push-based ou pull-based.

### **Fonte de dados** {#data-source}

Veja [Sinal](#signal)

### gRPC

Um framework [RPC](#rpc) de alta performance e open source. Mais sobre gRPC
[aqui](https://grpc.io).

### HTTP

Abreviação para [Hypertext Transfer Protocol][http].

### Instrumentação automática {#automatic-instrumentation}

Refere-se a métodos de coleta de telemetria que não exigem que o usuário final
modifique o código-fonte da aplicação. Os métodos variam conforme a linguagem de
programação e os exemplos incluem injeção de _bytecode_ ou _monkey patching_.

### JSON

Abreviação para [JavaScript Object Notation][json].

### Linguagem

Linguagem de programação.

### Log

Às vezes usado para se referir a uma coleção de [Registros de Log](#log-record).
Pode ser ambíguo, uma vez que as pessoas também costumam usar [Log](#log) para
se referir a um único [Registro de Log](#log-record). Quando a ambiguidade é
possível, utilize qualificadores adicionais, por exemplo, `Registro de Log`.
Consulte [mais informações][log].

### Metadados {#metadata}

Um par de chave-valor, por exemplo, `foo="bar"`, adicionado a uma entidade que
produz dados telemétricos. O OpenTelemetry chama esses pares de
[Atributos](#attribute). Além disso, as [Métricas](#metric) têm
[Dimensões](#dimension) e [Rótulos](#label), enquanto os [Logs](#log) têm
[Campos](#field).

### Métrica {#metric}

Registra um ponto de dados, seja medições brutas ou agregações pré-definidas,
como séries temporais com [Metadados](#metadata). Consulte [mais
informações][metric].

### OC

Abreviação para [OpenCensus](#opencensus).

### OpAMP

Abreviação para o
[Protocolo de Gerenciamento de Agentes Abertos _(Open Agent Management Protocol)_](/docs/collector/management/#opamp).

> **Ortografia**: Escreva OpAMP, e não `OPAMP` ou `opamp` em descrições ou
> instruções.

### OpenCensus

Precursor do OpenTelemetry. Para mais detalhes, consulte
[História](/docs/what-is-opentelemetry/#history).

### OpenTelemetry

Formado por meio de uma [fusão] dos projetos [OpenTracing](#opentracing) e
[OpenCensus](#opencensus), o OpenTelemetry &mdash; o tema deste site &mdash; é
uma coleção de [APIs](#api), [SDKs](#sdk) e ferramentas que você pode utilizar
para [instrumentar](/docs/concepts/instrumentation/), gerar,
[coletar](/docs/concepts/components/#collector) e
[exportar](/docs/concepts/components/#exporters)
[dados de telemetria](/docs/concepts/signals/), como [métricas](#metric),
[logs](#log) e [rastros](#trace).

> **Ortografia**: OpenTelemetry deve ser sempre uma única palavra, sem hífen, e
> capitalizada como mostrado.

[fusão]: /docs/what-is-opentelemetry/#history

### OpenTracing

Precursor do OpenTelemetry. Para mais detalhes, consulte
[História](/docs/what-is-opentelemetry/#history).

### OT

Abreviação para [OpenTracing](#opentracing).

### **OTel**

Abreviação para [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Ortografia**: Escreva OTel, e não `OTEL`.

### OTelCol

Abreviação para [OpenTelemetry Collector](#collector).

### OTEP

Um acrônimo para [Proposta de Melhoria do OpenTelemetry _(OpenTelemetry
Enhancement Proposal)_].

> **Spelling**: Escreva "OTEPs" como um plural. Não escreva `OTep` ou `otep` em
> descrições.

[Proposta de Melhoria do OpenTelemetry _(OpenTelemetry Enhancement Proposal)_]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

Abreviação para [OpenTelemetry Protocol](/docs/specs/otlp/).

### Propagação de Contexto {#context-propagation}

Permite que todas as [Fontes de dados](#data-source) compartilhem um mecanismo
subjacente de contexto para armazenar um estado e acessar dados ao longo do
ciclo de vida de uma [Transação](#transaction). Consulte a [especificação de
propagação de contexto][context propagation].

### Propagators

Usado para serializar e desserializar partes específicas de dados telemétricos,
como contexto de span e [bagagem](#baggage) em [Spans](#span). Consulte [mais
informações][propagators].

### Proto

Tipos de interface independentes de linguagem. Consulte [mais
informações][proto].

### Rastreador {#tracer}

Responsável pela criação de [Trecho](#span). Consulte [mais
informações][tracer].

### Rastro {#trace}

Um [DAG](#dag) de [Trechos](#span), onde os limites entre os [Trechos](#span)
são definidos como uma relação de pai-filho. Consulte [mais informações][trace].

### Rastro distribuído {#distributed-tracing}

Acompanha a progressão de uma única [Requisição](#request), chamada de
[Rastro](#trace), conforme é processada pelos [Serviços](#service) que compõem
uma [Aplicação](#application). Um [Rastro distribuído](#distributed-tracing)
atravessa limites de processo, rede e segurança.

Consulte [Rastreamento distribuído][distributed tracing].

### Receiver

Termo utilizado pelo [Collector](/docs/collector/configuration/#receivers) para
definir como os dados telemétricos são recebidos. Receivers podem ser push-based
ou pull-based. Consulte [mais informações][receiver].

### Recurso {#resource}

Captura informações sobre a entidade que produz dados telemétricos como
[Atributos](#attribute). Por exemplo, um processo que gera telemetria e está
sendo executado em um contêiner no Kubernetes possui um nome de processo, um
nome de pod, um namespace e, possivelmente, um nome de deployment. Todos esses
atributos podem ser incluídos no `Recurso`.

### Registro de log {#log-record}

Uma gravação de um [Evento](#event). Normalmente, o registro inclui um carimbo
de data/hora indicando quando o [Evento](#event) ocorreu, além de outros dados
que descrevem o que aconteceu, onde aconteceu, e assim por diante. Consulte
[mais informações][log record].

### REST

Abreviação para [Representational State Transfer][rest].

### Requisição {#request}

Veja [Rastro distribuído](#distributed-tracing).

### Rótulo {#label}

Um termo utilizado especificamente por [Métricas](#metric). Veja
[Metadados](#metadata).

### RPC

Abreviação para [Remote Procedure Call][rpc].

### SDK

Abreviação para Software Development Kit. Refere-se a um SDK de telemetria que
indica uma [Biblioteca](#library) que implementa a [API](#api) do OpenTelemetry.

### Serviço {#service}

Um componente de uma [Aplicação](#application). Múltiplas instâncias de um
[Serviço](#service) são tipicamente implantadas para que tenham alta
disponibilidade e escalabilidade. Um [Serviço](#service) pode ser implantado em
múltiplas localizações.

### Sinal {#signal}

Um dos [Rastros](#trace), [Métricas](#metric) ou [Logs](#log). Mais sobre Sinais
[aqui][signals].

### Span link

Um span link é uma conexão entre spans relacionados casualmente. Para detalhes,
consulte [Links entre spans](/docs/specs/otel/overview#links-between-spans) e
[Especificando Links](/docs/specs/otel/trace/api#specifying-links).

### Status

O resultado de uma operação. Normalmente usado para indicar se ocorreu um erro.
Consulte [mais informações][status].

### Tag

Consulte [Metadados](#metadata).

### Transação {#transaction}

Consulte [Rastro distribuído](#distributed-tracing).

### Trecho {#span}

Representa uma única operação dentro de um [Rastro](#trace). Consulte mais
detalhes [aqui][span].

### zPages

Uma alternativa interna aos exportadores externos. Quando incluídos, eles
coletam e agregam informações de rastros e métricas em segundo plano; estes
dados são exibidos em páginas da web quando solicitados. Consulte [mais
informações][zpages].

[baggage]: /docs/specs/otel/baggage/api/
[attribute]: /docs/specs/otel/common/#attributes
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: /docs/concepts/signals/traces/
[distribution]: /docs/concepts/distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[json]: https://en.wikipedia.org/wiki/JSON
[log]: /docs/specs/otel/glossary#log
[log record]: /docs/specs/otel/glossary#log-record
[metric]: /docs/concepts/signals/metrics/
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[proto]: https://github.com/open-telemetry/opentelemetry-proto
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: /docs/concepts/signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[spec-instrumented-lib]: /docs/specs/otel/glossary/#instrumented-library
[specification]: /docs/concepts/components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[trace]: /docs/specs/otel/overview#traces
[tracer]: /docs/specs/otel/trace/api#tracer
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md

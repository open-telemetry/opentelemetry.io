---
title: Rastros
weight: 1
description: O caminho de uma solicitação através do seu aplicativo.
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
---

Os **rastros** nos fornecem uma visão geral do que acontece quando uma
solicitação é feita para uma aplicação. Seja sua aplicação um monólito com um
único banco de dados ou uma grande variedade de serviços, os rastros são
essenciais para compreender o "caminho" completo que uma solicitação percorreu
na sua aplicação.

Vamos explorar isso com três unidades de trabalho, representadas como
[Trechos](#spans):

{{% alert title="Note" %}}

Os exemplos JSON a seguir não apresentam um formato específico, especialmente o
[OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding), que é mais verboso.

{{% /alert %}}

trecho `olá`:

```json
{
  "name": "olá",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "alguma_rota1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este é o trecho raiz, sinalizando o início e o fim de toda a operação. Note que
ele possui um campo `trace_id` indicando o rastro, mas não possui `parent_id`. É
assim que você sabe que é o trecho raiz.

O trecho `olá-cumprimentos`:

```json
{
  "name": "olá-cumprimentos",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "0x5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "alguma_rota2"
  },
  "events": [
    {
      "name": "e aí!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "até logo!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este trecho encapsula tarefas específicas, como dizer saudações, e seu pai é o
trecho `olá`. Note que ele compartilha o mesmo `trace_id` que o trecho raiz,
indicando que faz parte do mesmo rastro. Além disso, ele possui um `parent_id`
que corresponde ao `span_id` do trecho `olá`.

O trecho `olá-saudações`:

```json
{
  "name": "olá-saudações",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "alguma_rota3"
  },
  "events": [
    {
      "name": "olá!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este trecho representa a terceira operação neste rastro e assim como o anterior,
é um filho do trecho `olá`. Isso também o torna um irmão do trecho
`olá-cumprimentos`.

Esses três blocos de JSON compartilham o mesmo `trace_id`, e o campo `parent_id`
que representa uma hierarquia. Isso o torna um rastro!

Outra coisa que você notará é que cada trecho se parece com um log estruturado.
Isso porque, de certa forma, é mesmo! Uma maneira de pensar em rastros é como
uma coleção de logs estruturados com contexto, correlação, hierarquia e outros
recursos. No entanto, esses "logs estruturados" podem vir de diferentes
processos, serviços, VMs, data centers, e assim por diante. Isso torna possível
que o rastreamento represente uma visão de ponta a ponta de qualquer sistema.

Para compreender como o rastreamento no OpenTelemetry funciona, vamos analisar
uma lista de componentes que terão um papel fundamental na instrumentação do
nosso código.

## Trace Provider {#tracer-provider}

Um Trace Provider (às vezes chamado de `TracerProvider`) é uma fábrica de
`rastros`. Na maioria das aplicações, um Trace Provider é inicializado uma vez e
seu ciclo de vida corresponde ao ciclo de vida da aplicação. A inicialização do
Trace Provider também inclui a inicialização de Resource e Exporter. Geralmente
é a primeira etapa do rastreamento com OpenTelemetry. Em alguns SDKs, um Trace
Provider global já é inicializado para você.

## Rastro {#tracer}

Um rastro cria trechos contendo mais informações sobre o que está acontecendo em
uma determinada operação, como uma solicitação em um serviço. Rastros são
criados a partir de Trace Providers.

## Trace Exporters

Trace Exporters enviam rastros para um consumidor. Esse consumidor pode ser a
saída padrão para depuração em tempo de desenvolvimento, o OpenTelemetry
Collector ou qualquer backend de código aberto ou fornecedor de sua escolha.

## Propagação de Contexto {#context-propagation}

A propagação de contexto é o conceito central que possibilita o rastreamento
distribuído. Com a propagação de contexto, trechos podem ser correlacionados
entre si e montados em um rastro, independentemente de onde os trechos são
gerados. Para saber mais sobre este tópico, consulte a página de conceitos sobre
[Propagação de Contexto](../../context-propagation).

## Trechos {#spans}

Um **trecho** representa uma unidade de trabalho ou operação. Trechos são os
blocos que compõem os rastros. No OpenTelemetry, eles incluem as seguintes
informações:

- Nome
- ID do trecho pai (vazio para trecho raiz)
- Marcação de tempo do início e fim
- [Contexto do Trecho](#span-context)
- [Atributos](#attributes)
- [Eventos do Trecho](#span-events)
- [Links do Trecho](#span-links)
- [Estado do Trecho](#span-status)

Exemplo de trecho:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Trechos podem ser aninhados, como é indicado pela presença de um ID de trecho
pai: trechos filhos representam sub-operações. Isso permite que os trechos
capturem de forma mais precisa o trabalho realizado em uma aplicação.

### Contexto do Trecho {#span-context}

O contexto do trecho é um objeto imutável em cada trecho que contém o seguinte:

- O Trace ID que representando o rastro do qual o trecho faz parte
- O Span ID do trecho
- Trace Flags, uma codificação binária contendo informações sobre o rastro
- Trace State, uma lista de pares chave-valor que podem carregar informações de
  rastro específicos do fornecedor

O contexto do trecho é a parte de um trecho que é serializada e propagada junto
com a [Propagação de Contexto](#context-propagation) e [Baggage](../baggage).

Como o contexto do trecho contém o trace ID, o trace ID é usado ao criar
[links de trechos](#span-links).

### Atributos {#attributes}

Atributos são pares chave-valor que contêm metadados que você pode usar para
anotar um trecho e carregar informações sobre a operação que ele está
acompanhando.

Por exemplo, se um trecho rastreia uma operação que adiciona um item ao carrinho
de compras de um usuário em um sistema de eCommerce, é possível obter o ID do
usuário o ID do item a ser adicionado ao carrinho e o ID do carrinho.

Você pode adicionar atributos aos trecho durante ou após a criação do trecho.
Prefira adicionar atributos na criação do trecho para disponibilizar os
atributos para a amostragem do SDK. Se precisar adicionar um valor após a
criação do trecho, atualize o trecho com o valor.

Os atributos têm as seguintes regras que é implementada por cada SDK:

- Chaves devem ser valores de string não nulos
- Valores devem ser uma string não nula, boolean, valor de ponto flutuante,
  inteiro ou um array desses valores

Além disso, existem [atributos semânticos](/docs/specs/semconv/general/trace/),
que são convenções de nomenclatura conhecidas para metadados que estão
tipicamente presentes em operações comuns. É útil usar a nomenclatura de
atributos semânticos sempre que possível para que tipos comuns de metadados
sejam padronizados entre sistemas.

### Eventos de Trechos {#span-events}

Um evento de trecho pode ser considerado como uma mensagem de log estruturada
(ou anotação) em um trecho, tipicamente usada para apresentar um ponto
significativo e único no tempo durante a duração do trecho.

Por exemplo, considere dois cenários em um navegador web:

1. Rastrear o carregamento de uma página
2. Apontar quando uma página se torna interativa

Um trecho é mais adequado para o primeiro cenário, pois é uma operação que tem
início e fim.

Um evento de trecho é mais adequado para rastrear o segundo cenário porque
representa um ponto relevante e único na solicitação.

#### Quando usar eventos de trecho versus atributos de trecho {#when-to-use-span-events-versus-span-attributes}

Como eventos de trecho também contêm atributos, a questão de quando usar eventos
em vez de atributos nem sempre tem uma resposta óbvia. Para confirmar sua
decisão, verifique se uma data e hora específicas são relevantes para você.

Por exemplo, quando você está rastreando uma operação com um trecho e a mesma é
finalizada, você pode querer adicionar dados da operação à sua telemetria.

- Se a data e hora em que a operação é finalizada for significativo ou
  relevante, anexe os dados a um evento de trecho.
- Se a data e hora não forem relevantes, anexe os dados como atributos de
  trecho.

### Links de Trechos {#span-links}

Os links existem para que você possa associar um trecho a um ou mais trechos,
resultando em uma relação causal. Por exemplo, imagine que temos um sistema
distribuído onde algumas operações são rastreadas por um rastro.

Em resposta a algumas dessas ações, uma operação adicional é enfileirada para
ser executada, mas sua execução é assíncrona. Podemos rastrear essa operação
seguinte através de um rastro.

Gostaríamos de associar o rastro das operações subsequentes ao primeiro rastro,
mas não podemos prever quando as operações subsequentes começarão. Precisamos
associar os dois rastros, então utilizaremos um link de trecho.

Você pode vincular o último trecho do primeiro rastro ao primeiro trecho do
segundo rastro. Agora, eles estão causalmente associados entre si.

Os links são opcionais, mas servem como uma boa maneira de associar trechos de
rastro uns aos outros.

Para mais informações sobre Links de Trechos, consulte
[Link](/docs/specs/otel/trace/api/#link).

### O estado do Trecho {#span-status}

Cada trecho tem um estado. Os três valores possíveis são:

- `Unset`
- `Error`
- `OK`

O valor padrão é `Unset`. Um estado de trecho `Unset` significa que a operação
rastreada foi concluída com sucesso, sem erro.

Quando o estado de um trecho é `Error`, isso significa que algum erro ocorreu na
operação rastreada. Por exemplo, isso pode ser devido a um erro de HTTP 500 em
um servidor que está lidando com uma solicitação.

Quando o estado de um trecho é `OK`, isso significa que o trecho foi
expressamente marcado como livre de erros pelo desenvolvedor. Apesar de parecer
contraditório, não é necessário definir o estado de um trecho como `OK` quando
se sabe que foi concluído sem erros, pois já está implícito em `Unset`. O estado
de `OK` representa uma "decisão final" clara sobre o estado de um trecho que foi
explicitamente definido por um usuário. Isso é útil em qualquer situação em que
um desenvolvedor deseje que não haja outra interpretação de um trecho além de
"bem-sucedido".

Para reiterar: `Unset` representa um trecho que foi concluído sem erro. `OK`
representa quando um desenvolvedor marca explicitamente um trecho como
bem-sucedido. Na maioria dos casos, não é necessário marcar explicitamente um
trecho como OK.

### Tipo de Trecho {#span-kind}

Quando um trecho é criado, ele pode ser do tipo: `Client`, `Server`, `Internal`,
`Producer` ou `Consumer`. Esse tipo de trecho indica ao backend de rastreamento
como o rastro deve ser montado. De acordo com a especificação do OpenTelemetry,
o trecho pai de um servidor geralmente é um trecho de cliente remoto, e o trecho
filho de um cliente geralmente é um trecho de servidor. Da mesma forma, o trecho
pai de um consumidor é sempre um fornecedor, e o trecho filho de um fornecedor é
sempre um consumidor. Se o tipo de trecho não for especificado, ele será
assumido como interno.

Para mais informações sobre o tipo de Trecho, consulte
[SpanKind](/docs/specs/otel/trace/api/#spankind).

#### Client

Um trecho de client representa uma chamada remota síncrona de saída, como uma
solicitação HTTP ou uma chamada de banco de dados. Observe que, neste contexto,
"síncrono" não se refere a operações `async/await`, mas sim ao fato de que a
chamada não é enfileirada para processamento posterior.

#### Server

Um trecho de servidor representa uma chamada remota síncrona de entrada, como
uma solicitação HTTP de entrada ou uma chamada de procedimento remoto.

#### Internal

Trechos internos representam operações que não atravessam uma fronteira de
processo. Coisas como instrumentar uma chamada de função ou um Express
middleware podem usar trechos internos.

#### Producer

Trechos de fornecedor representam a criação de um trabalho que pode ser
processado de forma assíncrona mais tarde. Pode ser uma tarefa remota, como uma
adição em uma fila de tarefas, ou uma tarefa local processada por um ouvinte de
eventos.

### Consumer

Trechos de consumidor representam o processamento de um trabalho criado por um
produtor e podem começar muito tempo depois que o trecho de produtor já
terminou.

## Especificação {#specification}

Para mais informações, consulte
[especificação de rastros](/docs/specs/otel/overview/#tracing-signal).

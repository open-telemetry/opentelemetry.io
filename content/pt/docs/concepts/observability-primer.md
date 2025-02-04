---
title: Introdução à Observabilidade
description: Conceitos essenciais de Observabilidade
weight: 9
default_lang_commit: 6e3124135e38e749cdda15271d891813d6bc43db
cSpell:ignore: webshop
---

## O que é Observabilidade? {#what-is-observability}

Observabilidade permite que você compreenda um sistema de fora para dentro,
permitindo que você faça perguntas sobre ele sem precisar conhecer seu
funcionamento interno. Além disso, facilita a resolução de problemas e o
tratamento de novos problemas, ou seja, "problemas desconhecidos". Também ajuda
a responder à pergunta "Por que isso está acontecendo?"

Para fazer essas perguntas sobre o seu sistema, sua aplicação deve estar
devidamente instrumentada. Ou seja, o código da aplicação deve emitir
[sinais](/docs/concepts/signals/) como
[rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) e
[logs](/docs/concepts/signals/logs/). Uma aplicação está devidamente
instrumentada quando a equipe de desenvolvimento não precisa adicionar mais
instrumentação para solucionar um problema, pois já tem todas as informações
necessárias.

O [OpenTelemetry](/docs/what-is-opentelemetry/) é o mecanismo pelo qual o código
da aplicação é instrumentado para ajudar a tornar um sistema observável.

## Confiabilidade e métricas

**Telemetria** refere-se aos dados emitidos por um sistema e seu comportamento.
Esses dados podem vir na forma de [rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) e
[logs](/docs/concepts/signals/logs/).

**Confiabilidade** responde a pergunta: "O serviço está fazendo o que os
usuários esperam que ele faça?" Um sistema pode estar ativo 100% do tempo, mas,
se quando um usuário clica em "Adicionar ao Carrinho" para adicionar um par de
sapatos pretos ao carrinho de compras, o sistema nem sempre adiciona sapatos
pretos, então o sistema pode ser **não** confiável.

**Métricas** são dados numéricos sobre sua infraestrutura ou aplicação agregados
ao longo de um período de tempo. Exemplos incluem: taxa de erro do sistema,
utilização da CPU e taxa de requisições para um determinado serviço. Para mais
informações sobre métricas e como elas se relacionam com o OpenTelemetry,
consulte [Métricas](/docs/concepts/signals/metrics/).

**SLI**, ou _Service Level Indicator_, representa uma medida do comportamento de
um serviço. Um bom SLI mede seu serviço do ponto de vista dos seus usuários. Um
exemplo de SLI pode ser a velocidade de carregamento de uma página web.

**SLO**, ou _Service Level Objective_, representa a forma como confiabilidade é
comunicada para uma organização/outras equipes. Isso é feito associando um ou
mais SLIs ao valor de negócio.

## Compreendendo rastreamento distribuído

O rastreamento distribuído permite que você observe as requisições que se
propagam por sistemas complexos e distribuídos. O rastreamento distribuído
melhora a visibilidade da saúde da sua aplicação ou sistema, permitindo que você
faça depurações de comportamentos difíceis de reproduzir localmente. É essencial
para sistemas distribuídos, que costumam ter problemas não determinísticos ou
que são muito complicados de reproduzir localmente.

Para entender o rastreamento distribuído, você precisa compreender a função de
cada um de seus componentes: logs, trechos e rastros.

### Logs

Um **log** é uma mensagem com registro de data e hora emitida por serviços ou
outros componentes. Ao contrário dos [rastros](#distributed-traces), eles não
são necessariamente associados a uma requisição de usuário ou transação
específica. Você pode encontrar logs em praticamente todos os softwares. Logs
foram muito utilizados no passado tanto por equipes de desenvolvimento quanto de
operação para entender o comportamento de um sistema.

Exemplo de log:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Logs não são suficientes para rastrear a execução do código, pois geralmente não
apresentam informações contextuais, como de onde foram chamados.

Eles se tornam muito mais úteis quando incluídos como parte de um
[trecho](#spans) ou quando são correlacionados com um rastro e um trecho.

Para mais informações sobre logs e como eles se relacionam com o OpenTelemetry,
consulte [Logs](/docs/concepts/signals/logs/).

### Trechos {#spans}

Um **trecho** representa uma unidade de trabalho ou operação. Trechos rastreiam
operações específicas que uma requisição realiza, mostrando o que aconteceu
durante o tempo em que essa operação foi executada.

Um trecho contém nome, dados relacionados ao tempo,
[mensagens de log estruturadas](/docs/concepts/signals/traces/#span-events) e
[outros metadados (ou seja, Atributos)](/docs/concepts/signals/traces/#attributes)
para fornecer informações sobre a operação sendo rastreada.

#### Atributos de trecho

Os atributos de trechos são metadados anexados a um trecho.

A tabela a seguir contém exemplos de atributos de trecho:

| Chave                       | Valor                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"example.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (o cliente passa por um proxy)                                       |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

Para mais informações sobre trechos e como eles se relacionam com o
OpenTelemetry, consulte [Trecho](/docs/concepts/signals/traces/#spans).

### Rastros distribuídos {#distributed-traces}

Um **rastro distribuído**, mais comumente conhecido como um **rastro**, registra
os caminhos percorridos por requisições (feitas por uma aplicação ou usuário
final) enquanto se propagam por arquiteturas com múltiplos serviços, como
aplicações de microsserviços e _serverless_.

Um rastro é composto de um ou mais trechos. O primeiro trecho representa o
trecho raiz. Cada trecho raiz representa uma requisição do início ao fim. Os
trechos abaixo do trecho raiz fornecem um contexto mais aprofundado do que
ocorre durante uma requisição (ou quais etapas compõem uma requisição).

Sem rastreamento, encontrar a causa raiz de problemas de desempenho em um
sistema distribuído pode ser desafiador. O rastreamento torna a depuração e o
entendimento de sistemas distribuídos menos assustador, criando um passo a passo
do que acontece dentro de uma requisição à medida que ela flui por um sistema
distribuído.

Muitos _backends_ de Observabilidade visualizam rastros como diagramas em
cascata que se parecem com isto:

![Exemplo de Rastro](/img/waterfall-trace.svg 'Diagrama em cascata de rastreamento')

Os diagramas em cascata mostram a relação pai-filho entre um trecho raiz e seus
trechos filhos. Quando um trecho encapsula outro trecho, isso também representa
uma relação aninhada.

Para mais informações sobre rastros e como eles se relacionam com o
OpenTelemetry, consulte [Rastros](/docs/concepts/signals/traces/).

---
title: Ecossistema de Instrumentação
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
  - libraries
weight: 10
description: Ecossistema de Instrumentação no OpenTelemetry Java
default_lang_commit: d65798034935fcfdbdc6599b6e6d3dd942fbe62c
cSpell:ignore: logback
---

<!-- markdownlint-disable no-duplicate-heading -->

A instrumentação registra a telemetria usando a [API](../api/). O [SDK](../sdk/)
é a implementação de referência embutida na API, e é
[configurada](../configuration/) para processar e exportar a telemetria
produzida pelas chamadas de instrumentação da API. Esta página discute o
ecossistema de instrumentação no OpenTelemetry Java, incluindo recursos para
usuários finais e tópicos relacionados à instrumentação:

- [Categorias de instrumentação](#instrumentation-categories): Existem diversas
  categorias de instrumentação para diferentes casos de uso e padrões de
  instalação.
- [Propagação de Contexto](#context-propagation): Propagação de Contexto provê
  uma correlação entre rastros, métricas, e logs, permitindo que os sinais se
  complementem.
- [Convenções semânticas](#semantic-conventions): As convenções semânticas
  definem como produzir telemetria para operações padrão.
- [Log instrumentation](#log-instrumentation)

{{% alert %}} Embora as
[categorias de instrumentação](#instrumentation-categories) enumerem diversas
opções para instrumentar uma aplicação, nós recomendamos que os usuários iniciem
com o [Agente Java](#zero-code-java-agent). O agente Java possui uma instalação
simples, e automaticamente detecta e instala instrumentação de uma vasta
biblioteca. {{% /alert %}}

## Categorias de instrumentação {#instrumentation-categories}

Existem diversas categorias de instrumentação:

- [Sem código: Agente Java](#zero-code-java-agent) é uma forma de instrumentação
  sem código **[1]** que manipula dinamicamente o _bytecode_ da aplicação.
- [Sem código: Spring Boot starter](#zero-code-spring-boot-starter) é uma forma
  de instrumentação sem código **[1]** que utiliza a autoconfiguração do spring
  para instalar [biblioteca de instrumentação](#library-instrumentation).
- [Biblioteca de instrumentação](#library-instrumentation) envolve ou utiliza
  pontos de extensão para instrumentar uma biblioteca, exigindo que os usuários
  instalem e/ou adaptem o uso da biblioteca.
- [Instrumentação nativa](#native-instrumentation) é incorporada diretamente em
  bibliotecas e frameworks.
- [Instrumentação manual](#manual-instrumentation) é escrito pelos autores das
  aplicações, e normalmente específico para o domínio da aplicação.
- [Shims](#shims) conectam dados de uma biblioteca de observabilidade a outra,
  normalmente _de_ alguma biblioteca para o OpenTelemetry.

**[1]**: A instrumentação sem código é instalada automaticamente baseado nas
bibliotecas e frameworks detectados.

O projeto
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
contém o código fonte do Agente Java, inicializador Spring Boot, e Biblioteca de
instrumentação.

### Sem código: Agente Java {#zero-code-java-agent}

O agente do Java é uma forma de
[instrumentação automática](/docs/specs/otel/glossary/#automatic-instrumentation)
zero código que manipula dinamicamente o _bytecode_ da aplicação.

Para uma lista de bibliotecas instrumentadas pelo agente do Java, confira a
coluna _"Auto-instrumented versions"_ (versões auto-instrumentadas) em
[bibliotecas suportadas](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

Veja [Agente Java](/docs/zero-code/java/agent/) para mais detalhes.

### Sem código: inicializador Spring Boot {#zero-code-spring-boot-starter}

O inicializador Spring Boot é uma forma de
[instrumentação automática](/docs/specs/otel/glossary/#automatic-instrumentation)
zero código que aproveita a autoconfiguração do spring para instalar a
[biblioteca de instrumentação](#library-instrumentation).

Veja [inicializador Spring Boot](/docs/zero-code/java/spring-boot-starter/) para
detalhes.

### Biblioteca de instrumentação {#library-instrumentation}

[Biblioteca de instrumentação](/docs/specs/otel/glossary/#instrumentation-library)
envolve ou usa os pontos de extensão para instrumentar a biblioteca, obrigando
os usuários a instalar e/ou adaptar o uso da biblioteca.

Para uma lista de bibliotecas de instrumentação, veja a coluna _"Standalone
Library Instrumentation [1]"_ (Biblioteca autônoma de instrumentação) em
[bibliotecas suportadas](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

### Instrumentação nativa {#native-instrumentation}

[Instrumentação nativa](/docs/specs/otel/glossary/#natively-instrumented) é
definido diretamente nas bibliotecas ou _frameworks_. O OpenTelemetry encoraja
os autores de bibliotecas a adicionarem instrumentação nativa usando a
[API](../api/). No longo prazo, nós esperamos que a instrumentação nativa seja o
padrão, e que a instrumentação mantida pelo OpenTelemetry em
[opentelemetry-java-instrumentação](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
seja um meio temporário de preencher a lacuna.

{{% docs/languages/native-libraries "java" %}}

### Instrumentação manual {#manual-instrumentation}

[Instrumentação manual](/docs/specs/otel/glossary/#manual-instrumentation) é
escrita pelos autores das aplicações, e normalmente específica para o domínio da
aplicação.

### Shims

Um shim é uma instrumentação que conecta dados de uma biblioteca de
observabilidade até outra, normalmente _de_ alguma biblioteca para o
OpenTelemetry.

Shims mantidos no ecossistema OpenTelemetry Java:

| Descrição                                                                                                   | Documentação                                                                                                                                                                     | Sinal(s)          | Artefato                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Bridge [OpenTracing](https://opentracing.io/) no OpenTelemetry                                              | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)                                                                                       | Rastros           | `io.opentelemetry:opentelemetry-opentracing-shim:{{% param vers.otel %}}`                                                       |
| Bridge [Opencensus](https://opencensus.io/) no OpenTelemetry                                                | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim)                                                                                        | Rastros, Métricas | `io.opentelemetry:opentelemetry-opencensus-shim:{{% param vers.otel %}}-alpha`                                                  |
| Bridge [Micrometer](https://micrometer.io/) no OpenTelemetry                                                | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/micrometer/micrometer-1.5/library)                                      | Métricas          | `io.opentelemetry.instrumentation:opentelemetry-micrometer-1.5:{{% param vers.instrumentation %}}-alpha`                        |
| Bridge [JMX](https://docs.oracle.com/javase/7/docs/technotes/guides/management/agent.html) no OpenTelemetry | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/README.md)                                        | Métricas          | `io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha`                           |
| Bridge OpenTelemetry no [Prometheus Java client](https://github.com/prometheus/client_java)                 | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/prometheus-client-bridge)                                                                       | Métricas          | `io.opentelemetry.contrib:opentelemetry-prometheus-client-bridge:{{% param vers.contrib %}}-alpha`                              |
| Bridge OpenTelemetry no [Micrometer](https://micrometer.io/)                                                | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/micrometer-meter-provider)                                                                      | Métricas          | `io.opentelemetry.contrib:opentelemetry-micrometer-meter-provider:{{% param vers.contrib %}}-alpha`                             |
| Bridge [Log4j](https://logging.apache.org/log4j/2.x/index.html) no OpenTelemetry                            | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library)                                      | Logs              | `io.opentelemetry.instrumentation:opentelemetry-log4j-appender-2.17:{{% param vers.instrumentation %}}-alpha`                   |
| Bridge [Logback](https://logback.qos.ch/) no OpenTelemetry                                                  | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library)                                   | Logs              | `io.opentelemetry.instrumentation:opentelemetry-logback-appender-1.0:{{% param vers.instrumentation %}}-alpha`                  |
| Bridge OpenTelemetry context no [Log4j](https://logging.apache.org/log4j/2.x/index.html)                    | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure) | Context           | `io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:{{% param vers.instrumentation %}}-alpha` |
| Bridge OpenTelemetry context no [Logback](https://logback.qos.ch/)                                          | [LEIA-ME](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library)                                        | Context           | `io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:{{% param vers.instrumentation %}}-alpha`                       |

## Propagação de Contexto {#context-propagation}

As APIs do OpenTelemetry foram desenhadas para serem complementares, onde o todo
é maior que a soma das partes. Cada sinal tem seus pontos fortes e juntos formam
uma narrativa convincente de observabilidade.

É importante ressaltar que os dados de vários sinais são interligados através do
contexto de rastreamento:

- Trecho são relacionados com outros trechos através do trecho pai e links, que
  registram os contextos de rastreamento dos trechos relacionados.
- Métricas são relacionadas a trechos através de
  [exemplares](/docs/specs/otel/metrics/data-model/#exemplars), que registram o
  contexto de rastreamento de uma medição específica.
- Logs são relacionados a trechos ao registrar o contexto de rastreamento nos
  registros de logs.

Para essa correlação funcionar, o contexto de rastreamento precisa ser propagado
através da aplicação (entre chamada de funções e processos), e entre limites da
aplicação. A [API de contexto](../api/#context-api) facilita isso.

A instrumentação deve ser escrita de uma maneira que seja ciente do contexto:

- Bibliotecas que representam um ponto de entrada da aplicação (i.e. servidores
  HTTP, consumidores de mensagens, etc.) devem
  [extrair o contexto](../api/#contextpropagators) de mensagens recebidas.
- Bibliotecas que representam um ponto de saída de uma aplicação (ex. clientes
  HTTP, produtores de mensagens, etc.) devem
  [injetar o contexto](../api/#contextpropagators) em mensagens de saída.
- Bibliotecas devem passar implicitamente ou explicitamente o
  [contexto](../api/#context) através da pilha de chamadas e entre qualquer
  processo.

## Convenção semântica {#semantic-conventions}

As [convenções semânticas](/docs/specs/semconv/) definem como produzir
telemetria para operações padrão. Entre outras coisas, as convenções semânticas
especificam nomes e tipos de trechos, instrumentos de métrica, unidades de
métricas, tipos de métricas, e atributos chave, valor, e níveis de requisitos.

Ao escrever instrumentação, consulte a convenção semântica e confirme que
quaisquer convenções aplicáveis ao domínio estejam sendo seguidas.

O OpenTelemetry Java [publica artefatos](../api/#semantic-attributes) para
auxiliar a conformidade com a convenção semântica, incluindo constantes geradas
para chaves e valores de atributos.

## Instrumentação de Log {#log-instrumentation}

Enquanto as APIs do [LoggerProvider](../api/#loggerprovider) /
[Logger](../api/#logger) são estruturalmente similares ou equivalentes às APIs
de [rastros](../api/#tracerprovider) e [métricas](../api/#meterprovider), elas
possuem diferentes casos de uso. A partir de agora, `LoggerProvider` / `Logger`
e as classes associadas representam a
[Log Bridge API](/docs/specs/otel/logs/api/), que existe para escrever
anexadores de logs para conectar logs registrados através de outras APIs de log
/ frameworks no OpenTelemetry. Eles não são destinados para usuários finais como
um substituto para Log4j / SLF4J / Logback / etc.

Eles são dois _workflows_ típicos para consumir instrumentação de logs no
OpenTelemetry atendendo a diferentes requisitos de aplicação:

### Direto para o Collector {#direct-to-collector}

No _workflow_ direto para o Collector, logs são emitidos diretamente da
aplicação para o Collector usando um protocolo de rede (ex. OTLP). Este
_workflow_ é simples para configurar já que não requer nenhum componente
adicional de encaminhamento de log, e permite que uma aplicação facilmente emita
logs estruturados em conformidade com o
[modelo de dados de log](/docs/specs/otel/logs/data-model/). No entanto, a
sobrecarga necessária para as aplicações enfileirarem e exportarem os logs para
um local de rede pode não ser adequada para todas as aplicações.

Para usar este _workflow_:

- Instale o conector apropriado de log. **[1]**
- Configure o OpenTelemetry [Log SDK](../sdk/#sdkloggerprovider) para exportar
  registros de logs para o destino desejado (o
  [Collector](https://github.com/open-telemetry/opentelemetry-collector) ou
  outro).

**[1]**: Anexadores de Logs são um tipo de [shim](#shims) que conecta logs de um
_framework_ no SDK de Logs do OpenTelemetry. Veja os items "Bridge Log4j em
OpenTelemetry", "Bridge Logback em OpenTelemetry". Veja
[Exemplo de Anexadores de Logs](https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender)
para demonstração de uma variedade de cenários.

### Via arquivo ou stdout {#via-file-or-stdout}

No _workflow_ para arquivos ou _stdout_, os logs são gravados em arquivos ou na
saída _standout_. Outro componente (ex. FluentBit) é responsável por ler /
acompanhar os logs, convertê-los para um formato mais estruturado, e
encaminhá-los para um destino, como um Collector. Este _workflow_ pode ser
preferível em situações onde os requisitos da aplicação não permitem sobrecarga
adicional da abordagem [direto para o Collector](#direct-to-collector). No
entanto, isso requer que todos os campos de logs necessários para processamento
posterior sejam codificados nos logs, e este componente lendo os logs os
interprete no [modelo de dados de log](/docs/specs/otel/logs/data-model). A
instalação e configuração dos componentes de encaminhamento de log está fora do
escopo deste documento.

Correlação de Logs com rastros está disponível instalando um [shim](#shims) para
conectar o contexto do OpenTelemetry no log framework. Veja os items "Bridge
OpenTelemetry contexto em Log4j", "Bridge OpenTelemetry contexto em Logback".

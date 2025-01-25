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
cSpell:ignore: Logback logback
---

<!-- markdownlint-disable no-duplicate-heading -->

A instrumentação registra a telemetria usando a [API](../api/). O [SDK](../sdk/)
é a implementação de referência embutida na API, e é
[configurada](../configuration/) para processar e exportar a telemetrira produzia pelas chamadas de instrumentação da API. Esta página discute o ecossistema de instrumentação no OpenTelemetry Java, incluíndo recursos para usuários finais e tópicos relacionados com instrumentação:

- [Categorias de instrumentação](#instrumentation-categories): Existem diversas categorias de instrumentação para cada tipo de caso de uso e para cada padrão de instalação.
- [Propagação de Contexto](#context-propagation): Propagação de Contexto provê uma correlação entre traces, metrics, e logs, permitindo que os sinais complementem cada um deles.
- [Convensão semântica](#semantic-conventions): A Convensão semântica define como produzir telemetria para operações padronizadas.
- [Log instrumentation](#log-instrumentation): A Convensão semântica define como produzir telemetria para operações padronizadas.

{{% alert %}} Enquanto [Categorias de instrumentação](#instrumentation-categories)
mostram diversas opções para instrumentar uma aplicação, nós recomendamos que os usuários iniciem com a página [Agente Java](#zero-code-java-agent). O agente do Java possui uma instalação simples, e automaticamente instala e detecta a instrumentação para uma grande variedade de bibliotecas. {{% /alert %}}

## Categorias de instrumentação

Existem diversas categorias de instrumentação:

- [Zero-code: Agente Java](#zero-code-java-agent) é uma forma de instrumentação sem código **[1]** que manipula dinamicamente o bytecode da aplicação.
- [Zero-code: Spring Boot starter](#zero-code-spring-boot-starter) é uma forma de instrumentação sem código **[1]** que utiliza a autoconfiguração do spring para instalar [biblioteca de instrumentação](#library-instrumentation).
- [Biblioteca de instrumentação](#library-instrumentation) envolve ou utiliza pontos de extensão para instrumentar uma biblioteca, exigindo que os usuários instalem e/ou adaptem o uso da biblioteca.
- [Instrumentação nativa](#native-instrumentation) is built directly into libraries and frameworks.
- [Manual instrumentation](#manual-instrumentation) is written by application authors, and typically specific to the application domain.
- [Shims](#shims) bridge data from one observability library to another,
  typically _from_ some library into OpenTelemetry.

**[1]**: instrumentação sem código is installed automatically based on detected
libraries / frameworks.

The
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
project contains the source code for Agente Java, Spring Boot starter, and
Biblioteca de instrumentação.

### Zero-code: Agente Java

O agente do Java is a form of zero-code
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
that dynamically manipulates application bytecode.

For a list of libraries instrumented by O agente do Java, see the
"Auto-instrumented versions" column on
[supported libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

See [Agente Java](/docs/zero-code/java/agent/) for more details.

### Zero-code: Spring Boot starter

The Spring Boot starter is a form of zero-code
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
that leverages spring autoconfigure to install
[biblioteca de instrumentação](#library-instrumentation).

See [Spring Boot starter](/docs/zero-code/java/spring-boot-starter/) for
details.

### Biblioteca de instrumentação

[Biblioteca de instrumentação](/docs/specs/otel/glossary/#instrumentation-library)
wraps or uses extension points to instrument a library, requiring users to
install and/or adapt library usage.

For a list of instrumentation libraries, see the "Standalone Library
Instrumentation" column on
[supported libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

### Instrumentação nativa

[Instrumentação nativa](/docs/specs/otel/glossary/#natively-instrumented) is
built directly into libraries or frameworks. OpenTelemetry encourages library
authors to add instrumentação nativa using the [API](../api/). In the long
term, we hope the instrumentação nativa becomes the norm, and view the
instrumentation maintained by OpenTelemetry in
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
as a temporary means of filling the gap.

{{% docs/languages/native-libraries "java" %}}

### Manual instrumentation

[Manual instrumentation](/docs/specs/otel/glossary/#manual-instrumentation) is
written by application authors, and typically specific to the application
domain.

### Shims

A shim is instrumentation that bridges data from one observability library to
another, typically _from_ some library into OpenTelemetry.

Shims maintained in the OpenTelemetry Java ecosystem:

| Description                                                                                                   | Documentation                                                                                                                                                                   | Signal(s)       | Artifact                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Bridge [OpenTracing](https://opentracing.io/) into OpenTelemetry                                              | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)                                                                                       | Traces          | `io.opentelemetry:opentelemetry-opentracing-shim:{{% param vers.otel %}}`                                                       |
| Bridge [Opencensus](https://opencensus.io/) into OpenTelemetry                                                | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim)                                                                                        | Traces, Metrics | `io.opentelemetry:opentelemetry-opencensus-shim:{{% param vers.otel %}}-alpha`                                                  |
| Bridge [Micrometer](https://micrometer.io/) into OpenTelemetry                                                | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/micrometer/micrometer-1.5/library)                                      | Metrics         | `io.opentelemetry.instrumentation:opentelemetry-micrometer-1.5:{{% param vers.instrumentation %}}-alpha`                        |
| Bridge [JMX](https://docs.oracle.com/javase/7/docs/technotes/guides/management/agent.html) into OpenTelemetry | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/README.md)                                        | Metrics         | `io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha`                           |
| Bridge OpenTelemetry into [Prometheus Java client](https://github.com/prometheus/client_java)                 | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/prometheus-client-bridge)                                                                       | Metrics         | `io.opentelemetry.contrib:opentelemetry-prometheus-client-bridge:{{% param vers.contrib %}}-alpha`                              |
| Bridge OpenTelemetry into [Micrometer](https://micrometer.io/)                                                | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/micrometer-meter-provider)                                                                      | Metrics         | `io.opentelemetry.contrib:opentelemetry-micrometer-meter-provider:{{% param vers.contrib %}}-alpha`                             |
| Bridge [Log4j](https://logging.apache.org/log4j/2.x/index.html) into OpenTelemetry                            | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library)                                      | Logs            | `io.opentelemetry.instrumentation:opentelemetry-log4j-appender-2.17:{{% param vers.instrumentation %}}-alpha`                   |
| Bridge [Logback](https://logback.qos.ch/) into OpenTelemetry                                                  | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library)                                   | Logs            | `io.opentelemetry.instrumentation:opentelemetry-logback-appender-1.0:{{% param vers.instrumentation %}}-alpha`                  |
| Bridge OpenTelemetry context into [Log4j](https://logging.apache.org/log4j/2.x/index.html)                    | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure) | Context         | `io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:{{% param vers.instrumentation %}}-alpha` |
| Bridge OpenTelemetry context into [Logback](https://logback.qos.ch/)                                          | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library)                                        | Context         | `io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:{{% param vers.instrumentation %}}-alpha`                       |

## Propagação de Contexto

The OpenTelemetry APIs are designed to be complementary, with the whole greater
than the sum of the parts. Each signal has its own strengths, and collectively
stitch together a compelling observability story.

Importantly, the data from the various signals are linked together through trace
context:

- Spans are related to other spans through span parent and links, which each
  record trace context of related spans.
- Metrics are related to spans through
  [exemplars](/docs/specs/otel/metrics/data-model/#exemplars), which record
  trace context of a particular measurement.
- Logs are related to spans by recording trace context on log records.

For this correlation to work, trace context must be propagated throughout an
application (across function calls and threads), and across application
boundaries. The [context API](../api/#context-api) facilitates this.
Instrumentation needs to be written in a manner which is context aware:

- Libraries that represent the entry point to an application (i.e. HTTP servers,
  message consumers, etc.) should [extract context](../api/#contextpropagators)
  from incoming messages.
- Libraries that represent an exit point from an application (i.e. HTTP clients,
  message producers, etc.) should [inject context](../api/#contextpropagators)
  into outgoing messages.
- Libraries should implicitly or explicitly pass [Context](../api/#context)
  through the callstack and across any threads.

## Convensão semântica

The [Convensão semântica](/docs/specs/semconv/) define how to produce telemetry
for standard operations. Among other things, A Convensão semântica specify
span names, span kinds, metric instruments, metric units, metric types, and
attribute key, value, and requirement levels.

When writing instrumentation, consult A Convensão semântica and conform to
any which are applicable to the domain.

OpenTelemetry Java [publishes artifacts](../api/#semantic-attributes) to assist
in conforming to A Convensão semântica, including generated constants for
attribute keys and values.

TODO: discuss instrumentation API and how it helps conform to semantic
conventions

## Log instrumentation

While the [LoggerProvider](../api/#loggerprovider) / [Logger](../api/#logger)
APIs are structurally similar to the equivalent [trace](../api/#tracerprovider)
and [metric](../api/#meterprovider) APIs, they serve a different use case. As of
now, `LoggerProvider` / `Logger` and associated classes represent the
[Log Bridge API](/docs/specs/otel/logs/api/), which exists to write log
appenders to bridge logs recorded through other log APIs / frameworks into
OpenTelemetry. They are not intended for end user use as a replacement for Log4j
/ SLF4J / Logback / etc.

There are two typical workflows for consuming log instrumentation in
OpenTelemetry catering to different application requirements:

### Direct to collector

In the direct to collector workflow, logs are emitted directly from an
application to a collector using a network protocol (e.g. OTLP). This workflow
is simple to set up as it doesn't require any additional log forwarding
components, and allows an application to easily emit structured logs that
conform to the [log data model](/docs/specs/otel/logs/data-model/). However, the
overhead required for applications to queue and export logs to a network
location may not be suitable for all applications.

To use this workflow:

- Install appropriate log appender. **[1]**
- Configure the OpenTelemetry [Log SDK](../sdk/#sdkloggerprovider) to export log
  records to desired target destination (the
  [collector](https://github.com/open-telemetry/opentelemetry-collector) or
  other).

**[1]**: Log appenders are a type of [shim](#shims) which bridges logs from a
log framework into the OpenTelemetry log SDK. See "Bridge Log4j into
OpenTelemetry", "Bridge Logback into OpenTelemetry" entries. See
[Log Appender example](https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender)
for demonstration of a variety of scenarios.

### Via file or stdout

In the file or stdout workflow, logs are written to files or standout output.
Another component (e.g. FluentBit) is responsible for reading / tailing the
logs, parsing them to more structured format, and forwarding them a target, such
as the collector. This workflow may be preferable in situations where
application requirements do not permit additional overhead from
[direct to collector](#direct-to-collector). However, it requires that all log
fields required down stream are encoded into the logs, and that the component
reading the logs parse the data into the
[log data model](/docs/specs/otel/logs/data-model). The installation and
configuration of log forwarding components is outside the scope of this
document.

Log correlation with traces is available by installing a [shim](#shims) to
bridge OpenTelemetry context into the log framework. See "Bridge OpenTelemetry
context into Log4j", "Bridge OpenTelemetry context into Logback" entries.

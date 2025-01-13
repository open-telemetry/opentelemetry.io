---
title: Instrumentation ecosystem
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
  - libraries
weight: 10
description: Instrumentation ecosystem in OpenTelemetry Java
cSpell:ignore: Logback logback
---

<!-- markdownlint-disable no-duplicate-heading -->

Instrumentation records telemetry using the [API](../api/). The [SDK](../sdk/)
is the built-in reference implementation of the API, and is
[configured](../configuration/) to process and export the telemetry produced by
instrumentation API calls. This page discusses the OpenTelemetry ecosystem in
OpenTelemetry Java, including resources for end users and cross-cutting
instrumentation topics:

- [Instrumentation categories](#instrumentation-categories): There are a variety
  of categories of instrumentation addressing different use cases and
  installation patterns.
- [Context propagation](#context-propagation): Context propagation provides
  correlation between traces, metrics, and logs, allowing the signals to
  complement each other.
- [Semantic conventions](#semantic-conventions): The semantic conventions define
  how to produce telemetry for standard operations.
- [Log instrumentation](#log-instrumentation): The semantic conventions define
  how to produce telemetry for standard operations.

{{% alert %}} While [instrumentation categories](#instrumentation-categories)
enumerates several options for instrumenting an application, we recommend users
start with the [Java agent](#zero-code-java-agent). The Java agent has a simple
installation process, and automatically detects and installs instrumentation
from a large library. {{% /alert %}}

## Instrumentation categories

There are several categories of instrumentation:

- [Zero-code: Java agent](#zero-code-java-agent) is a form of zero-code
  instrumentation **[1]** that dynamically manipulates application bytecode.
- [Zero-code: Spring Boot starter](#zero-code-spring-boot-starter) is a form of
  zero-code instrumentation **[1]** that leverages spring autoconfigure to
  install [library instrumentation](#library-instrumentation).
- [Library instrumentation](#library-instrumentation) wraps or uses extension
  points to instrument a library, requiring users to install and/or adapt
  library usage.
- [Native instrumentation](#native-instrumentation) is built directly into
  libraries and frameworks.
- [Manual instrumentation](#manual-instrumentation) is written by application
  authors, and typically specific to the application domain.
- [Shims](#shims) bridge data from one observability library to another,
  typically _from_ some library into OpenTelemetry.

**[1]**: Zero-code instrumentation is installed automatically based on detected
libraries / frameworks.

The
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
project contains the source code for Java agent, Spring Boot starter, and
Library instrumentation.

### Zero-code: Java agent

The Java agent is a form of zero-code
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
that dynamically manipulates application bytecode.

For a list of libraries instrumented by the Java agent, see the
"Auto-instrumented versions" column on
[supported libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

See [Java agent](/docs/zero-code/java/agent/) for more details.

### Zero-code: Spring Boot starter

The Spring Boot starter is a form of zero-code
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
that leverages spring autoconfigure to install
[library instrumentation](#library-instrumentation).

See [Spring Boot starter](/docs/zero-code/java/spring-boot-starter/) for
details.

### Library instrumentation

[Library instrumentation](/docs/specs/otel/glossary/#instrumentation-library)
wraps or uses extension points to instrument a library, requiring users to
install and/or adapt library usage.

For a list of instrumentation libraries, see the "Standalone Library
Instrumentation" column on
[supported libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md).

### Native instrumentation

[Native instrumentation](/docs/specs/otel/glossary/#natively-instrumented) is
built directly into libraries or frameworks. OpenTelemetry encourages library
authors to add native instrumentation using the [API](../api/). In the long
term, we hope the native instrumentation becomes the norm, and view the
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

## Context propagation

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

## Semantic conventions

The [semantic conventions](/docs/specs/semconv/) define how to produce telemetry
for standard operations. Among other things, the semantic conventions specify
span names, span kinds, metric instruments, metric units, metric types, and
attribute key, value, and requirement levels.

When writing instrumentation, consult the semantic conventions and conform to
any which are applicable to the domain.

OpenTelemetry Java [publishes artifacts](../api/#semantic-attributes) to assist
in conforming to the semantic conventions, including generated constants for
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

{{% alert title="Note" color="info" %}}

An end-to-end example of log instrumentation using stdout is available in the
[Java examples repository](https://github.com/open-telemetry/opentelemetry-java-examples/blob/main/logging-k8s-stdout-otlp-json/README.md).

{{% /alert %}}

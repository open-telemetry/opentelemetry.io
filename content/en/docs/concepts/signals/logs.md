---
title: Logs
weight: 3
---

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with metadata. Of all telemetry signals logs have probably the
biggest legacy. Most programming languages have built-in logging capabilities or
well-known, widely used logging libraries. While logs are an independent data
source, they may also be attached to spans. In OpenTelemetry, any data that is
not part of a distributed trace or a metric is a log. For example, _events_ are
a specific type of log. Logs are often used to determine the root cause of an
issue and typically contain information about who changed what as well as the
result of the change.

For metrics and traces OpenTelemetry takes the approach of a clean-sheet design,
specifies a new API and provides full implementations of this API in multiple
languages.

Our approach with logs is somewhat different. For OpenTelemetry to be successful
in logging space we need to support existing legacy of logs and logging
libraries, while offering improvements and better integration with the rest of
observability world where possible.

This is in essence the philosophy behind OpenTelemetry’s logs support. We
embrace existing logging solutions and make sure OpenTelemetry works nicely with
existing logging libraries, log collection and processing solutions.

The [logs specification][] contains more details on this philosophy.

To understand how logging in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code.

## Log Appender / Bridge

As an application developer it is important for you to understand, that the
**Logs Bridge API** should not be called by you directly, as it is provided for
logging library authors to build log appenders / bridges. Instead you use your
preferred logging library and configure it to use an log appender (or log
bridge) that is able to emit logs into an OpenTelemetry LogRecordExporter.

## Logger Provider

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger Provider (sometimes called `LoggerProvider`) is a factory for
`Logger`s. In most cases, the Logger Provider is initialized once and its
lifecycle matches the application's lifecycle. Logger Provider initialization
also includes Resource and Exporter initialization.

## Logger

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger creates log records. Loggers are created from Log Providers.

## Log Record Exporter

Log Record Exporters send log records to a consumer. This consumer can be
standard output for debugging and development-time, the OpenTelemetry Collector,
or any open source or vendor backend of your choice.

## Log Record

A log record represents the recording of an event. In OpenTelemetry a log record
contains two kinds of fields:

- Named top-level fields of specific type and meaning
- Resource and attributes fields of arbitrary value and type

The top-level fields are:

| Field Name            | Description                                  |
| --------------------- | -------------------------------------------- |
| Timestamp             | Time when the event occurred.                |
|  ObservedTimestamp    | Time when the event was observed.            |
|  TraceId              | Request trace id.                            |
|  SpanId               | Request span id.                             |
|  TraceFlags           | W3C trace flag.                              |
|  SeverityText         | The severity text (also known as log level). |
|  SeverityNumber       | Numerical value of the severity.             |
|  Body                 | The body of the log record.                  |
|  Resource             | Describes the source of the log.             |
|  InstrumentationScope | Describes the scope that emitted the log.    |
| Attributes            | Additional information about the event.      |

You can find more details on log records and the definitions of those fields in
the
[Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

## Language Support

Metrics are a [stable](/docs/specs/otel/versioning-and-stability/#stable) signal
in the OpenTelemetry specification. For the individual language specific
implementations of the Metrics API & SDK, the status is as follows:

{{% logs_support_table " " %}}

## Specification

To learn more about logs in OpenTelemetry, see the [logs specification][].

[logs specification]: /docs/specs/otel/overview/#log-signal

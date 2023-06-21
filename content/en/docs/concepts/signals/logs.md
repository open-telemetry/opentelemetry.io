---
title: Logs
weight: 3
---

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with metadata. Of all telemetry signals logs, have the biggest
legacy. Most programming languages have built-in logging capabilities or
well-known, widely used logging libraries. Although logs are an independent data
source, they may also be attached to spans. In OpenTelemetry, any data that is
not part of a distributed trace or a metric is a log. For example, _events_ are
a specific type of log. Logs often contain detailed debugging/diagnostic info,
such as inputs to an operation, the result of the operation, and any supporting
metadata for that operation.

For traces and metrics, OpenTelemetry takes the approach of a clean-sheet
design, specifies a new API, and provides full implementations of this API in
multiple language SDKs.

OpenTelemetry's approach with logs is different. Because existing logging
solutions are widespread in language and operational ecosystems, OpenTelemetry
acts as a "bridge" between those logs, the tracing and metrics signals, and
other OpenTelemetry components. In fact, the API for logs is called the "Logs
Bridge API" for this reason.

The [logs specification][] contains more details on this philosophy.

To understand how logging in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code.

## Log Appender / Bridge

As an application developer, the **Logs Bridge API** should not be called by you
directly, as it is provided for logging library authors to build log appenders /
bridges. Instead, you just use your preferred logging library and configure it
to use an log appender (or log bridge) that is able to emit logs into an
OpenTelemetry LogRecordExporter.

OpenTelemetry language SDKs offer this functionality.

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

Logs are a [stable](/docs/specs/otel/versioning-and-stability/#stable) signal
in the OpenTelemetry specification. For the individual language specific
implementations of the Logs API & SDK, the status is as follows:

{{% logs-support-table %}}

## Specification

To learn more about logs in OpenTelemetry, see the [logs specification][].

[logs specification]: /docs/specs/otel/overview/#log-signal

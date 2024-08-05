---
title: Logs
weight: 3
description: A recording of an event.
---

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with optional metadata. Of all telemetry signals, logs have the
biggest legacy. Most programming languages have built-in logging capabilities or
well-known, widely used logging libraries.

## OpenTelemetry Logs

OpenTelemetry does not define a bespoke API or SDK to create logs. Instead,
OpenTelemetry logs are the existing logs you already have from a logging
framework or infrastructure component. OpenTelemetry SDKs and
autoinstrumentation utilize several components to automatically correlate logs
with [traces](/docs/signals/traces).

OpenTelemetry's support for logs is designed to be fully compatible with
what you already have, providing capabilities to wrap those logs with additional
context and a common toolkit to parse and manipulate logs into a common format
across many different sources.

### OpenTelemetry Logs in the OpenTelemetry Collector

The [OpenTelemetry Collector](/docs/collector) provides several tools to work
with logs:

- Several receivers which parse logs from specific, known sources of log data.
- The filelogreceiver, which reads logs from any file and provides features to
  parse them from different formats or use a regular expression.
- Processors like the transformprocessor which lets you parse nested data,
  flatten nested structures, add/remove/update values, and more.
- Exporters that let you emit log data in a non-OpenTelemetry format.

The first step in adopting OpenTelemetry frequently involves deploying a
Collector as a general-purposes logging agent.

### OpenTelemetry Logs for Applications

In applications, OpenTelemetry logs are created with any logging library or
built-in logging capabilities. When you add autoinstrumentation or activate an
SDK, OpenTelemetry will automatically correlate your existing logs with any
active trace and span, wrapping the log body with their IDs. In other words,
OpenTelemetry automatically correlates your logs and traces.

### Language Support

Logs are a [stable](/docs/specs/otel/versioning-and-stability/#stable) signal in
the OpenTelemetry specification. For the individual language specific
implementations of the Logs API & SDK, the status is as follows:

{{% signal-support-table "logs" %}}

## Structured, Unstructured, and Semistructured Logs

OpenTelemetry does not distinguish between structured and unstructured logs.
However, it is vitally important to understand the different kinds of formats
that log data can manifest in.

### Structured logs

A structured log is a log whose textual format follows a consistent,
machine-readable format. Two of are JSON:

```json
{
  "timestamp": "2024-08-04T12:34:56.789Z",
  "level": "INFO",
  "service": "user-authentication",
  "environment": "production",
  "message": "User login successful",
  "context": {
    "userId": "12345",
    "username": "johndoe",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  },
  "transactionId": "abcd-efgh-ijkl-mnop",
  "duration": 200,
  "request": {
    "method": "POST",
    "url": "/api/v1/login",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": {
      "username": "johndoe",
      "password": "******"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "success": true,
      "token": "jwt-token-here"
    }
  }
}
```

and for infrastructure components, Common Log Format (CLF):

```text
127.0.0.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234
```

It is also common to have different structured log formats mixed together. For
example, and Extended Log Format (ELF) log mixes JSON with the
whitespace-separated data in a CLF log.

```text
192.168.1.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" {"transactionId": "abcd-efgh-ijkl-mnop", "responseTime": 150, "requestBody": {"username": "johndoe"}, "responseHeaders": {"Content-Type": "application/json"}}
```

To make the most use of this log, parse both the JSON and
the ELF-related pieces into a shared format to make analysis on an observability
backend easier.

Structured logs are the preferred way to use logs. Because they are emitted in a
consistent format, they are easier to parse, which makes them easier to
preprocess in an OpenTelemetry Collector, correlate with other data, and
ultimate analyze in an Observability backend. Use structured logs if you can.

### Unstructured Logs

Unstructured logs are logs that don't follow a consistent structure. They may be
more human-readable, and are often used in development.

Examples of unstructured logs:

```text
[ERROR] 2024-08-04 12:45:23 - Failed to connect to database. Exception: java.sql.SQLException: Timeout expired. Attempted reconnect 3 times. Server: db.example.com, Port: 5432

System reboot initiated at 2024-08-04 03:00:00 by user: admin. Reason: Scheduled maintenance. Services stopped: web-server, database, cache. Estimated downtime: 15 minutes.

DEBUG - 2024-08-04 09:30:15 - User johndoe performed action: file_upload. Filename: report_Q3_2024.pdf, Size: 2.3 MB, Duration: 5.2 seconds. Result: Success
```

Structured logs are fine for debugging applications locally, but
are very difficult to use at scale when observing large systems.
Use structured logging if possible.

### Semistructured logs

A semistructured log is a log that does use some self-consistent patterns to
distinguish data so that it's machine-readable, but may not use the same
formatting and delimiters between data across different systems.

Example of a semistructured log:

```text
2024-08-04T12:45:23Z level=ERROR service=user-authentication userId=12345 action=login message="Failed login attempt" error="Invalid password" ipAddress=192.168.1.1 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
```

Although machine-readable, semistructured logs may require several different
parsers to allow for analysis at scale.

## OpenTelemetry Logging Componentry

The following lists of concepts and components power OpenTelemetry's
logging support.

### Log Appender / Bridge

As an application developer, the **Logs Bridge API** should not be called by you
directly, as it is provided for logging library authors to build log appenders /
bridges. Instead, you just use your preferred logging library and configure it
to use a log appender (or log bridge) that is able to emit logs into an
OpenTelemetry LogRecordExporter.

OpenTelemetry language SDKs offer this functionality.

### Logger Provider

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger Provider (sometimes called `LoggerProvider`) is a factory for
`Logger`s. In most cases, the Logger Provider is initialized once and its
lifecycle matches the application's lifecycle. Logger Provider initialization
also includes Resource and Exporter initialization.

### Logger

> Part of the **Logs Bridge API** and should only be used if you are the author
> of a logging library.

A Logger creates log records. Loggers are created from Log Providers.

### Log Record Exporter

Log Record Exporters send log records to a consumer. This consumer can be
standard output for debugging and development-time, the OpenTelemetry Collector,
or any open source or vendor backend of your choice.

### Log Record

A log record represents the recording of an event. In OpenTelemetry a log record
contains two kinds of fields:

- Named top-level fields of specific type and meaning
- Resource and attributes fields of arbitrary value and type

The top-level fields are:

| Field Name           | Description                                  |
| -------------------- | -------------------------------------------- |
| Timestamp            | Time when the event occurred.                |
| ObservedTimestamp    | Time when the event was observed.            |
| TraceId              | Request trace ID.                            |
| SpanId               | Request span ID.                             |
| TraceFlags           | W3C trace flag.                              |
| SeverityText         | The severity text (also known as log level). |
| SeverityNumber       | Numerical value of the severity.             |
| Body                 | The body of the log record.                  |
| Resource             | Describes the source of the log.             |
| InstrumentationScope | Describes the scope that emitted the log.    |
| Attributes           | Additional information about the event.      |

For more details on log records and log fields, see
[Logs Data Model](/docs/specs/otel/logs/data-model/).

### Specification

To learn more about logs in OpenTelemetry, see the [logs specification][].

[logs specification]: /docs/specs/otel/overview/#log-signal

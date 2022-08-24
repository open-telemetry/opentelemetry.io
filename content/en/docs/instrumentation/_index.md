---
title: Instrumentation
description: >-
  OpenTelemetry code instrumentation is supported for many popular programming languages
weight: 2
---

OpenTelemetry code [instrumentation][] is supported for the languages listed
below. Depending on the language, topics covered will include some or all of the
following:

- Automatic instrumentation
- Manual instrumentation
- Exporting data

If you are using Kubernetes, you can use the [OpenTelemetry Operator for
Kubernetes][otel-op] to [inject auto-instrumentation libraries][auto] for Java,
Node.js and Python into your application.

## Status and Releases
The current status of the major functional components for OpenTelemetry is as follows:

| Language                          | Traces            | Metrics             | Logs                |
|-----------------------------------|-------------------|---------------------|---------------------|
| [C#/.NET](net/_index.md)          | Stable            | Stable              | Stable              |
| [C++](cpp/_index.md)              | Stable            | Experimental        | Experimental        |
| [Erlang/Elixir](erlang/_index.md) | Stable            | Alpha               | Not Yet Implemented |
| [Go](go/_index.md)                | Stable            | Alpha               | Not Yet Implemented |
| [Java](java/_index.md)            | Stable            | Stable              | Experimental        |
| [JavaScript](js/_index.md)        | Release Candidate | Development         | Roadmap             |
| [PHP](php/_index.md)              | Pre-Alpha         | Pre-Alpha           | Not Yet Implemented |
| [Python](python/_index.md)        | Stable            | Release Candidate   | Experimental        |
| [Ruby](ruby/_index.md)            | Stable            | Not Yet Implemented | Not Yet Implemented |
| [Rust](rust/_index.md)            | Beta              | Alpha               | Not Yet Implemented |
| [Swift](swift/_index.md)          | Beta              | Alpha               | Not Yet Implemented |

[auto]: https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection
[instrumentation]: /docs/concepts/instrumenting/
[otel-op]: https://github.com/open-telemetry/opentelemetry-operator

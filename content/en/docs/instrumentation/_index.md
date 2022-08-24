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

| Language                 | Traces            | Metrics             | Logs                |
|--------------------------|-------------------|---------------------|---------------------|
| [C#/.NET](net/)          | Stable            | Stable              | Stable              |
| [C++](cpp/)              | Stable            | Experimental        | Experimental        |
| [Erlang/Elixir](erlang/) | Stable            | Alpha               | Not Yet Implemented |
| [Go](go/)                | Stable            | Alpha               | Not Yet Implemented |
| [Java](java/)            | Stable            | Stable              | Experimental        |
| [JavaScript](js/)        | Release Candidate | Development         | Roadmap             |
| [PHP](php/)              | Pre-Alpha         | Pre-Alpha           | Not Yet Implemented |
| [Python](python/)        | Stable            | Release Candidate   | Experimental        |
| [Ruby](ruby/)            | Stable            | Not Yet Implemented | Not Yet Implemented |
| [Rust](rust/)            | Beta              | Alpha               | Not Yet Implemented |
| [Swift](swift/)          | Beta              | Alpha               | Not Yet Implemented |

[auto]: https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection
[instrumentation]: /docs/concepts/instrumenting/
[otel-op]: https://github.com/open-telemetry/opentelemetry-operator

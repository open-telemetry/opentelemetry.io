---
title: Instrumentation
description: >-
  OpenTelemetry code instrumentation is supported for many popular programming
  languages
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

The current status of the major functional components for OpenTelemetry is as
follows:

{{% telemetry_support_table " " %}}

[auto]:
  https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: https://github.com/open-telemetry/opentelemetry-operator

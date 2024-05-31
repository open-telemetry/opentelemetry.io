---
title: Language APIs & SDKs
description:
  OpenTelemetry code instrumentation is supported for many popular programming
  languages
weight: 250
aliases: [/docs/instrumentation]
redirects: [{ from: /docs/instrumentation/*, to: ':splat' }]
---

OpenTelemetry code [instrumentation][] is supported for the languages listed
below. Depending on the language, topics covered will include some or all of the
following:

- Automatic instrumentation
- Manual instrumentation
- Exporting data

If you are using Kubernetes, you can use the [OpenTelemetry Operator for
Kubernetes][otel-op] to [inject auto-instrumentation libraries][auto] for .NET,
Java, Node.js, Python, Go into your application.

## Status and Releases

The current status of the major functional components for OpenTelemetry is as
follows:

{{% alert title="Important" color="warning" %}}

Regardless of an API/SDK's status, if your instrumentation relies on [semantic
conventions] that are marked as [Experimental] in the [semantic conventions
specification], your data flow might be subject to **breaking changes**.

[semantic conventions]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[semantic conventions specification]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

[auto]: /docs/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/kubernetes/operator/

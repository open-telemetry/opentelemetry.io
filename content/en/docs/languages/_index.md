---
title: Language APIs & SDKs
description: >-
  OpenTelemetry code instrumentation is supported for many popular programming
  languages
weight: 2
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

{{% telemetry-support-table " " %}}

{{% alert title="Note" color="warning" %}} Even though the API/SDK status
is stable, changes to underlying [semantic conventions][SemConv] can interrupt
your data flow. If the status of a Semantic Convention that your instrumentation
depends on is `Experimental`, it may be subject to future breaking changes.
{{% /alert %}}

[auto]: /docs/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/kubernetes/operator/
[SemConv]: /docs/concepts/semantic-conventions/

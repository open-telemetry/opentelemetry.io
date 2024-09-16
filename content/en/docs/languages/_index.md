---
title: Language APIs & SDKs
description:
  OpenTelemetry code instrumentation is supported for many popular programming
  languages
weight: 250
aliases: [/docs/instrumentation]
redirects: [{ from: /docs/instrumentation/*, to: ':splat' }]
---

OpenTelemetry code [instrumentation][] is supported for the languages listed in
the [Statuses and Releases](#status-and-releases) table below. Unofficial
implementations for [other languages](/docs/languages/other) are available as
well – you can find them in the
[registry](http://localhost:1313/ecosystem/registry/).

For Go, .NET, PHP, Python, Java and JavaScript you can use
[zero-code solutions](/docs/zero-code) to add instrumentation to your
application without cod changes.

If you are using Kubernetes, you can use the [OpenTelemetry Operator for
Kubernetes][otel-op] to [inject these zero-code solutions][zero-code] into your
application.

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

## API References

Special Interest Groups (SIGs) implementing the OpenTelemetry API & SDK in a
specific language, als publish API references for developers. The following
references are available:

{{% apidocs %}}

{{% alert title="Tip" color="info" %}}

Remember <https://opentelemetry.io/api-docs> to always have the list of
available API references at hand.

{{% /alert %}}

[zero-code]: /docs/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/kubernetes/operator/

---
title: OpenTelemetry .NET Automatic Instrumentation reaches version 1.0.0
linkTitle: .NET Automatic Instrumentation v1.0.0
date: 2023-09-14
author: [Fabrizio Ferri-Benedetti](https://github.com/theletterf/) (Splunk)'
cSpell:ignore: devopsnote librarysupport
---

The OpenTelemetry .NET SIG is happy to announce the
[first stable release](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v1.0.0)
of the OpenTelemetry .NET Automatic Instrumentation.

You can use the OpenTelemetry .NET Automatic Instrumentation to send traces and
metrics from .NET applications and services to observability backends without
having to modify their source code, including ASP.NET applications deployed on
IIS and Windows services running .NET applications.

The automatic instrumentation for .NET includes installer scripts and a NuGet
package that simplify the task of deploying and configuring the collection of
telemetry. The automatic instrumentation is fully compatible with manual
instrumentation in case you need to send custom spans or metrics.

To get started, [read the documentation](/docs/instrumentation/net/automatic) or
browse the
[examples](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples)
for demonstrations of different instrumentation scenarios covered by the
OpenTelemetry .NET Automatic Instrumentation.

Feedback is welcome:

- [Submit a GitHub issue](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/new).
- Write to us on [Slack](https://cloud-native.slack.com/archives/C01NR1YLSE7).
  If you are new, you can create a CNCF Slack account
  [here](https://slack.cncf.io/).

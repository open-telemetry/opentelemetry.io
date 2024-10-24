---
title: OpenTelemetry .NET Automatic Instrumentation metric signal support
linkTitle: .NET Auto-instrumentation Metrics
date: 2022-07-07
author: OpenTelemetry .NET Automatic Instrumentation Team
---

We're excited to announce the
[0.2.0-beta.1 release](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v0.2.0-beta.1)
of the
[OpenTelemetry .NET Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)
which adds metric signal support!

Now you can easily export metrics from:

- .NET Runtime,
- ASP.NET Core,
- ASP.NET Framework,
- HTTP clients (`System.Net.Http.HttpClient` and `System.Net.HttpWebRequest`),
- measurements created using
  [`System.Diagnostics.Metrics`](https://docs.microsoft.com/dotnet/core/diagnostics/metrics-instrumentation).

Over the next few months we plan to support:

- additional
  [instrumentation libraries](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.2.0-beta.1/docs/config.md#instrumentations),
- the log signal.

Please, give us your feedback (using your preferred method):

- [Submit a GitHub issue](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/new).
- Write to us on [Slack](https://cloud-native.slack.com/archives/C01NR1YLSE7).
  If you are new, you can create a CNCF Slack account
  [here](https://slack.cncf.io/).

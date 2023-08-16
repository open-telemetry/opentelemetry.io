---
title: OpenTelemetry .NET Automatic Instrumentation Releases its first Beta
linkTitle: .NET Auto-instrumentation Beta
date: 2022-05-12
author: OpenTelemetry .NET Automatic Instrumentation Team
cSpell:ignore: devopsnote librarysupport
---

We're excited to announce the
[first beta release](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v0.1.0-beta.1)
of the
[OpenTelemetry .NET Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)
project!

Without this project, .NET developers need to use instrumentation packages to
automatically generate telemetry data. For example, to instrument inbound
ASP.NET Core requests, you need to use the ASP.NET Core instrumentation package
and initialize it with the OpenTelemetry SDK.

Now, developers can use
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
to initialize [signal](/docs/specs/otel/glossary/#signals) providers and
generate telemetry data for supported
[instrumented libraries](/docs/specs/otel/glossary/#instrumented-library). This
approach has several benefits:

- A technical path forward to support automatic instrumentation via
  [byte-code instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#bytecode-instrumentations),
  which can allow for more automatic instrumentation support than relying solely
  on published instrumentation libraries
- No need to install and initialize an instrumentation library
- No need to modify and rebuild an application to add automatic instrumentation
- Less code needed to get started

This first beta release is an important milestone because it establishes the
technical foundation on which a rich set of automatic instrumentation
capabilities can be built on. This release includes support for:

- Gathering trace data from .NET applications without requiring code
  changes[^devopsnote]
- Gathering trace data from .NET libraries that the SDK does not
  support[^librarysupport]

See the
[examples](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/v0.1.0-beta.1/examples)
for demonstrations of different instrumentation scenarios covered by the
OpenTelemetry .NET Automatic Instrumentation.

Over the next few months we plan to:

- Support additional
  [instrumentation libraries](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/config.md#instrumented-libraries-and-frameworks)
- Improve dependency management
- Enable metrics support

Please, give us your **feedback** (using your preferred method):

- [Submit a GitHub issue](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/new).
- Write to us on [Slack](https://cloud-native.slack.com/archives/C01NR1YLSE7).
  If you are new, you can create a CNCF Slack account
  [here](https://slack.cncf.io/).

[^devopsnote]:
    The
    [supported and unsupported scenarios documentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#supported-and-unsupported-scenarios)
    describe the current limits.

[^librarysupport]:
    The
    [instrumentation library documentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/config.md#instrumented-libraries-and-frameworks)
    contains the list of libraries we can gather telemetry data from.

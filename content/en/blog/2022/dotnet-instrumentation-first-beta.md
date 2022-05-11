---
title: OpenTelemetry .NET Automatic Instrumentation Releases its first Beta
date: 2022-05-12
author: OpenTelemetry .NET Automatic Instrumentation Team
---

The .NET community already has a stable OpenTelemetry SDK. Using the SDK requires engineers 
to modify and rebuild their applications, which may be undesirable or not possible in some 
scenarios. Furthermore, the OpenTelemetry SDK does not provide instrumentation for all libraries 
or versions of libraries, and as a result, there is a desire to leverage 
[byte-code instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#bytecode-instrumentations) 
to support gathering telemetry from those libraries. The 
[OpenTelemetry .NET Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation) 
project strives to solve both of those problems.

The [first beta release](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v0.1.0-beta.1) 
of this project includes support for:

* Gathering trace data from .NET applications without requiring code changes[^devopsnote]
* Gathering trace data from .NET libraries that the SDK does not support[^librarysupport]

See the [examples](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/v0.1.0-beta.1/examples) 
for demonstrations of different instrumentation scenarios covered by the OpenTelemetry .NET 
Automatic Instrumentation.

Over the next few months we plan to:

* Support additional instrumentation libraries
* Improve dependency management
* Enable metrics support

Please, give us your **feedback** (using your preferred method):

* [Submit a GitHub issue](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/new).
* Write to us on [Slack](https://cloud-native.slack.com/archives/C01NR1YLSE7). If you are new, you 
can create a CNCF Slack account [here](http://slack.cncf.io/).

[^devopsnote]: The [supported and unsupported scenarios documentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/design.md#supported-and-unsupported-scenarios) 
describe the current limits.

[^librarysupport]: The [instrumentation library documentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v0.1.0-beta.1/docs/config.md#instrumented-libraries-and-frameworks) 
contains the list of libraries we can gather telemetry data from.

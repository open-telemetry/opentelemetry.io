---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
---

When you develop an app, you use third-party libraries and frameworks to
accelerate your work and avoid duplicated efforts. If you instrument your app
with OpenTelemetry, you don't want to spend additional time on manually adding
traces, logs, and metrics to those libraries and frameworks.

Use libraries that come with OpenTelemetry support natively or an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/) to generate
telemetry data for a library or framework.

The Java agent for automatic instrumentation includes instrumentation libraries
for many common Java frameworks. Most are turned on by default.
If you need to turn off certain instrumentation libraries, you can
[suppress them](../automatic/agent-config/#suppressing-specific-auto-instrumentation).

If you use [manual instrumentation](../manual) for your code, you can leverage
some instrumentation libraries for your dependencies standalone. To find out,
which standalone instrumentation libraries are available, take a look at
[this list](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
Follow the instructions of each instrumentation library to set them up.

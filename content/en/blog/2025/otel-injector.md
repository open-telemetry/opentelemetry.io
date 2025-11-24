---
title:
  Adding Automatic Instrumentation to Your App, Made Easy with the OpenTelemetry
  Injector
linkTitle: OpenTelemetry Injector
date: 2025-06-25
author: >-
  [Isabella Langan](https://github.com/isabella-rose-l) (Causely)
cSpell:ignore: Causely Langan Omlet
---

As OpenTelemetry adoption grows across infrastructure and application layers,
easing the operational burden of instrumentation remains a shared priority.
Today, we’re excited to highlight a recent donation from Splunk to the
OpenTelemetry community: a host-based mechanism to automatically inject
OpenTelemetry Automatic Instrumentation into your app on any Linux host.

This component has reached production stability and is now being donated to the
community as the **OpenTelemetry Injector**. It helps streamline OpenTelemetry
deployment across languages and systems.

## What it does

The OpenTelemetry Injector intercepts process invocation on hosts and adds
environment variables to set up OpenTelemetry Automatic Instrumentation for the
language used by the program, such as Java, Node.js, .NET, or Python.

It supports two methods for this injection:

- **systemd** environment variable configuration
- **`/etc/preload.so`** hook that scans process invocations, intercepts them,
  and adds environment variables

## Why Splunk is donating it

This component has reached production-grade stability, and Splunk is donating it
to:

- Share maintenance responsibilities with the community
- Align more closely with OpenTelemetry’s long-term direction
- Encourage broader collaboration and input from the ecosystem

## Where to find it

You can explore the code in the
[`opentelemetry-injector`](https://github.com/open-telemetry/opentelemetry-injector)
repository. It includes the full implementation of the Linux injection mechanism
and provides a foundation for ongoing contribution.

## What’s next

Together with contributors from **dash0** and **Omlet Stack**, the team will
continue supporting and maintaining the code in the near term. More importantly,
we’re actively looking for additional collaborators and maintainers from the
OpenTelemetry community to shape the roadmap together.

If you’re interested in improving auto-instrumentation workflows on Linux, this
is a great opportunity to get involved.

## Get involved

Want to learn more or contribute?

- 💬 Join the conversation in the `#otel-injector` channel on the
  [OpenTelemetry Slack](https://slack.cncf.io/).
- 🔗 Check out the
  [opentelemetry-injector repository](https://github.com/open-telemetry/opentelemetry-injector).

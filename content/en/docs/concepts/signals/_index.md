---
title: Signals
description: Learn about the categories of telemetry supported by OpenTelemetry
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
---

The purpose of OpenTelemetry is to collect, process, and export **[signals][]**.
Signals are system outputs that describe the underlying activity of the
operating system and applications running on a platform. A signal can be
something you want to measure at a specific point in time, like temperature or
memory usage, or an event that goes through the components of your distributed
system that you'd like to trace. You can group different signals together to
observe the inner workings of the same piece of technology under different
angles.

OpenTelemetry currently supports [traces](/docs/concepts/signals/traces),
[metrics](/docs/concepts/signals/metrics), [logs](/docs/concepts/signals/logs)
and [baggage](/docs/concepts/signals/baggage). _Events_ are a specific type of
log, and
[_profiles_ are being worked on](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
by the Profiling Working Group.

[signals]: /docs/specs/otel/glossary/#signals

---
title: Signals
description: Learn about the categories of telemetry supported by OpenTelemetry
aliases:
  - /docs/concepts/data-sources
  - /docs/concepts/otel-concepts
weight: 11
---

OpenTelemetry is structured around **[signals][]**. Signals are a system's
outputs that a human or machine can infer knowledge from. Those signals will
vary from system to system and depend on the objective you want to accomplish.
It can be something you want to measure at a certain point, like temperature or
RAM usage, or an event that goes through many components of your distributed
system that you'd like to trace down. Signals can all be used together to
provide different ways to observe the same piece of technology.

OpenTelemetry currently supports [traces](/docs/concepts/traces),
[metrics](/docs/concepts/metrics), [logs](/docs/concepts/logs) and
[baggage](/docs/concepts/baggage). _events_ are a specific type of log, and
[_profiles_ are being worked on](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)
by the Profiling Working Group.

[signals]: /docs/specs/otel/glossary/#signals

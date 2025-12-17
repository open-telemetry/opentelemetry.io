---
title: Signals
description: Learn about the categories of telemetry supported by OpenTelemetry
aliases: [data-sources, otel-concepts]
weight: 11
---

The purpose of OpenTelemetry is to collect, process, and export [signals].
Signals are system outputs that describe the underlying activity of the
operating system and applications running on a platform. A signal can be
something you want to measure at a specific point in time, like temperature or
memory usage, or an event that goes through the components of your distributed
system that you'd like to trace. You can group different signals together to
observe the inner workings of the same piece of technology under different
angles.

OpenTelemetry currently supports:

- [Traces](traces)
- [Metrics](metrics)
- [Logs](logs)
- [Baggage](baggage)

Also under development or at the [proposal] stage:

- [Events], a specific type of [log](logs)
- [Profiles] are being worked on by the Profiling Working Group.

[Events]: /docs/specs/otel/logs/data-model/#events
[Profiles]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals

---
title: Deprecating Span Events
linkTitle: Deprecating Span Events
date: 2026-03-13
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs), [Robert
  Pająk](https://github.com/pellared) (Splunk), [Trask
  Stalnaker](https://github.com/trask) (Microsoft),
sig: Specification, Logs
cSpell:ignore: Liudmila Molkova Pająk
---

If you have been following OpenTelemetry’s work on logging and events, you may
have seen the long-term vision laid out in
[OpenTelemetry Logging and You](/blog/2025/opentelemetry-logging-and-you/). That
post described a future where **events are logs**, emitted through the Logs API
and correlated with traces and metrics through context.

To move us closer to that vision, the OpenTelemetry maintainers have agreed on
an incremental plan to **deprecate the Span Event API**, while still supporting
use cases that rely on span events in exported traces.

This post explains why we’re making this change, what will (and won’t) change
for users, and how we plan to help you migrate.

## Why deprecate the Span Event API?

OpenTelemetry today offers two main ways to emit events that are correlated with
traces:

- Span events, created via methods like `Span.AddEvent` and
  `Span.RecordException`.
- Log-based events, created via the Logs API and linked to the active context.

Having two competing APIs for the same concept has several drawbacks:

- **Split guidance for instrumentation authors.** Library and framework authors
  need to decide between two ways of emitting very similar data. Different
  choices lead to inconsistent user experiences across the ecosystem.
- **Duplicate concepts for users.** Operators need to understand both span
  events and log events, how they are exported, and how their backends treat
  them.
- **Slower evolution.** Improvements to the event model (for example, around
  schemas, attributes, and back-compat) need to be specified and implemented in
  two places.

The OpenTelemetry community has been converging on a simpler mental model: as
described in _OpenTelemetry Logging and You_, **events are logs with a
well-defined structure**. They should be emitted via the Logs API, not as a
special case on spans.

At the same time, we recognize that span events are widely used today. Many
backends present span events in dedicated trace views, and some users depend on
events being sent in the same OTLP export payload as their parent span.

The plan in [OTEP 4430: Span Event API deprecation plan][OTEP] aims to balance
these goals:

- Provide **clear, consistent guidance** that new events should go through the
  Logs API.
- **Preserve existing workflows** that depend on span events in traces, via a
  compatibility layer.

In short: we are deprecating the **API** for recording span events, not the
ability to see events attached to spans.

## What is changing?

The deprecation touches several parts of the ecosystem. At a high level, the
plan includes changes:

- In the core specification.
- In language APIs and SDKs.
- In the Collector.
- In semantic conventions and instrumentations.

The details below summarize the intent.

### OTLP

Span events remain part of the OTLP trace data model. The deprecation targets
the **Span Event API** in the language APIs, not the wire representation.

At the same time, OTLP support for log-based events is already stable. This
allows the Logs API to represent the same kinds of structured events that span
events have historically carried, with better alignment across signals.

### Specification

In the tracing specification, the following APIs will be marked as deprecated in
favor of the Logs API:

- Methods that record exceptions on spans, such as `RecordException`.
- Methods that add arbitrary events to spans, such as `AddEvent`.

The updated guidance will recommend:

- Using the Logs API to record exceptions and other named events.
- Recording additional span details that don’t need their own timestamp as span
  attributes instead of span events.

### Language APIs and SDKs

Language APIs and SDKs will implement the following steps:

1. **First-class support for log-based events.**
   - Ensure the Logs API can record exceptions and events with the same level of
     detail that span events historically offered.
   - Stabilize this support so instrumentation authors can rely on it.
2. **SDK-based compatibility for span events.**
   - Ensure that there is a mechanism that allows converting log-based
     exceptions and events into span events and attaching them to the current
     span.
3. **Deprecate span event methods.**
   - Mark span APIs for recording events and exceptions as deprecated in
     documentation and type systems, pointing users to the Logs API instead,
     while ensuring that existing usages of span events continue to work during
     the transition.

### Collector

For the OpenTelemetry Collector, this plan encourages:

- Providing or adopting processors that implement the event-to-span-event
  bridge, so users can continue seeing events attached to spans while
  instrumentations migrate to the Logs API.

### Instrumentations and semantic conventions

For **stable instrumentations** that currently use span events:

- In the current major version, they are expected to **continue using existing
  span event APIs**.
- In the next major version, they should **switch to emitting events via the
  Logs API** instead of span events.
- Where span events were previously used just to attach additional details to a
  span (without needing a separate timestamp), those details should be moved to
  span attributes.

Non-stable instrumentations are encouraged to follow this guidance as soon as
practical, but have more flexibility.

Semantic conventions for events and exceptions will be updated to clearly
support both log-based events and, where necessary, the compatibility layer that
turns those events back into span events.

## What stays the same?

Even though the Span Event API is being deprecated, several important aspects of
user experience are intentionally preserved:

- **Trace-centric views can still show events on spans.** When the
  event-to-span-event bridge is enabled, log-based events will appear as span
  events in traces, preserving existing dashboards and workflows.
- **Correlation across signals continues to work the same way.** Log-based
  events participate in OpenTelemetry context, just like span events do today.
- **Existing data remains valid.** Data that already uses span events is still
  part of the supported OTLP trace model.

The deprecation is about providing a single recommended way to emit events in
new code, not about removing visibility into events on spans.

## How this fits into the logging vision

In _OpenTelemetry Logging and You_, we outlined a direction where:

- Logs are anything sent through a Logging Provider.
- **Events are a special kind of logs** with a stronger structure and schema.

Deprecating the Span Event API is a key step toward that model:

- Instrumentations and semantic conventions can treat events consistently as log
  records.
- Backends can invest in rich experiences for events in one place—the log and
  event data model—while still surfacing those events in trace views when
  helpful.
- Future enhancements (for example, around schemas, complex attributes, or event
  types) can be specified once for log-based events and applied across all
  signals.

If you’ve read
[Announcing Support for Complex Attribute Types in OTel](/blog/2025/complex-attribute-types/),
you can think of this as another step in making OpenTelemetry’s data model more
expressive and better aligned across traces, metrics, and logs.

## What should you do?

Depending on how you use OpenTelemetry today, the impact of this plan will be
different.

### Application developers and operators

If you primarily rely on **auto-instrumentation or library-provided
instrumentation**:

- You should not need to change code immediately.
- Watch for new major versions of your instrumentation libraries that start
  emitting log-based events.
- When upgrading, consider enabling the event-to-span-event compatibility option
  in your SDK or Collector if you depend on seeing events in span views and your
  backend does not yet support log-based events natively.

If you maintain your own custom instrumentation:

- Prefer the Logs API for new events and exceptions.
- Limit the use of span events to cases where you absolutely need them and where
  your language API has not yet deprecated those methods.

### Instrumentation authors

If you author OpenTelemetry instrumentations:

- Plan to **keep using span events** in your current stable major versions so
  users are not surprised by behavioral changes.
- For the next major version of each instrumentation, plan a **migration to the
  Logs API** for events and exceptions.
- Follow updated semantic conventions for naming events and choosing attributes,
  particularly for exceptions and other commonly used event types.

### Backend authors

If you build observability backends:

- Ensure you can **ingest and present log-based events** with the same care you
  give to span events today.
- Use this transition as an opportunity to improve how users navigate between
  traces and logs, since both will be carrying the same structured events.

## Feedback and next steps

This post summarizes the plan from [OTEP 4430][OTEP] and related specification
work.

We would very much appreciate your feedback on:

- The overall direction of treating events as log records.
- The proposed migration path for instrumentations.
- The SDK and Collector-based compatibility mechanisms.

We are gathering feedback in the
[community#3312](https://github.com/open-telemetry/community/issues/3312) issue.

Some of this work is already underway. For example:

- [opentelemetry-specification#4886](https://github.com/open-telemetry/opentelemetry-specification/pull/4886)
  refines how exceptions are emitted as logs via the Logs API.
- [semantic-conventions#3256](https://github.com/open-telemetry/semantic-conventions/pull/3256),
  [semantic-conventions#3226](https://github.com/open-telemetry/semantic-conventions/pull/3226),
  and
  [semantic-conventions#3311](https://github.com/open-telemetry/semantic-conventions/pull/3311)
  adjust semantic conventions so they can be consistently applied to log-based
  events.

As the specification and implementations progress, we will continue to refine
the guidance and provide more concrete migration examples in SDK and
instrumentation documentation.

Our goal is to make events in OpenTelemetry **simpler, more consistent, and more
powerful**, without breaking the workflows you rely on today.

[OTEP]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/fd43145dde7e5192ebc59a20992d98a3e6af5553/oteps/4430-span-event-api-deprecation-plan.md

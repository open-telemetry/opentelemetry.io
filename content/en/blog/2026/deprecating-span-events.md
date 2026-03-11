---
title: Deprecating Span Events
linkTitle: Deprecating Span Events
date: 2026-03-13
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Grafana Labs), [Robert
  Pająk](https://github.com/pellared) (Splunk), [Trask
  Stalnaker](https://github.com/trask) (Microsoft)
sig: Specification, Logs
cSpell:ignore: Liudmila loggerconfig Molkova Pająk
---

- OpenTelemetry is deprecating the Span Event API to remove confusion and
  duplication caused by having two overlapping ways to emit events: span events
  and log-based events.
- New code should write events as logs that are correlated with the current
  span.
- The older "span events" style will be phased out over time, but existing data
  and views that show events on spans will keep working.

This post explains why we’re making this change, what it means at a high
level, and how you can prepare.

## Why deprecate the Span Event API?

Today, OpenTelemetry offers two main ways to emit events that are correlated
with traces:

- Span events, created via
  [Tracing API](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.40.0/specification/trace/api.md)
  using methods `Span.AddEvent` or `Span.RecordException`.
- Log-based events, emitted via the
  [Logs API](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.40.0/specification/logs/api.md)
  (either directly or through logging libraries bridged into OpenTelemetry) and
  associated with the active context.

Having two competing APIs for the same concept has several drawbacks:

- **Split guidance for instrumentation authors.** Library and framework authors
  must choose between two ways of emitting very similar data. Different choices
  lead to inconsistent user experiences across the ecosystem.
- **Duplicate concepts for users.** Operators must understand both span events
  and log events, how they are exported, and how their backends treat them.
- **Slower evolution.** Improvements to the event model (for example, around
  schemas, attributes, and back-compat) must be specified and implemented in two
  places.

The OpenTelemetry community has been converging on a simpler mental model:
**events are named logs** emitted via the Logs API, correlated with traces and
metrics through context, rather than as a special case on spans. This change is
significant because it unifies how OpenTelemetry represents events.

At the same time, we recognize that span events are widely used today. Many
backends present span events in dedicated trace views, and some users depend on
events being sent in the same OTLP export payload as their parent span.

The plan in [OTEP 4430: Span Event API deprecation plan][OTEP] aims to balance
these goals:

- Provide **clear, consistent guidance** that new events should go through the
  Logs API.
- **Preserve existing workflows** that depend on span events in traces, via a
  compatibility layer.

In short, we are deprecating the **API** for recording span events, not the
ability to see events attached to spans.

## What is changing?

The deprecation focuses on **how new events are recorded**:

- OTLP support for log-based events is already stable, and the Logs API can
  capture everything span events historically carried, with richer metadata
  and more flexible export and filtering.
- The tracing specification will deprecate APIs such as `Span.AddEvent` and
  `Span.RecordException` in favor of emitting log-based events.
- Language APIs and SDKs will make log-based events first-class, and provide
  compatibility options that can still surface those events as span events
  where needed.
- Instrumentations and semantic conventions will gradually move from span
  events to log-based events in their next major versions, while keeping
  existing behavior stable until then.

## What stays the same?

Even though the Span Event API is being deprecated, several important aspects of
user experience are intentionally preserved:

- **Correlation across signals continues to work the same way.** Log-based
  events still participate in OpenTelemetry context.
- **Existing data remains valid.** Data that already uses span events remains
  part of the supported OTLP trace model.

Deprecation is about providing a single recommended way to emit events in new
code, not about removing visibility into events on spans.

## What should you do?

Depending on how you use OpenTelemetry today, this plan will affect you in
different ways.

### Application developers and operators

If you primarily rely on **auto-instrumentation or library-provided
instrumentation**:

- You should not need to change code immediately.
- Watch for new major versions of your instrumentation libraries that start
  emitting log-based events, and enable any compatibility options your SDK
  offers if you rely on events in span views.

If you maintain your own custom instrumentation:

- Prefer the Logs API for new events and exceptions.
- Avoid adding new dependencies on span event methods, especially where they
  are already marked as deprecated.

### Instrumentation authors

If you author OpenTelemetry instrumentations:

- Keep existing stable major versions behaviorally compatible for now.
- For the next major versions, plan to migrate events and exceptions to the
  Logs API following updated semantic conventions.

### Backend authors

If you build observability backends:

- Ensure you can **ingest and present log-based events** alongside traces.
- Use this transition to improve how users navigate between traces and logs
  carrying the same structured events.

## Feedback and next steps

This post summarizes the plan from [OTEP 4430][OTEP] and related specification
work. We would appreciate your feedback on the direction, migration path, and
compatibility mechanisms.

We are gathering feedback in
[community#3312](https://github.com/open-telemetry/community/issues/3312), and
ongoing specification and semantic convention changes are tracked in the
OpenTelemetry GitHub repositories.

Deprecation here does **not** mean removing span events. It is about shifting
the recommended way to emit new events toward the Logs API.

Our goal is to make events in OpenTelemetry **simpler, more consistent, and more
powerful**, without breaking the workflows you rely on today.

[OTEP]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/fd43145dde7e5192ebc59a20992d98a3e6af5553/oteps/4430-span-event-api-deprecation-plan.md

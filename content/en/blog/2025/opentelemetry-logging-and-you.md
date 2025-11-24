---
title: OpenTelemetry Logging and You
linkTitle: OTel Logging
date: 2025-04-18
author: >-
  [Austin Parker](https://github.com/austinlparker) (honeycomb.io)
sig: Logs
---

If you’ve been following OpenTelemetry for a while, you’ve probably heard a lot
about logs. [Log bridges](/docs/specs/otel/glossary/#log-appender--bridge),
[Logs API](/docs/specs/otel/logs/api), [events](/docs/concepts/glossary/#event),
you name it, we’ve talked about it. This blog post is intended to be a
discussion of the rationale and current design direction of logging in
OpenTelemetry.

## Definitions

Let’s get started with a basic definition of how OpenTelemetry thinks about
logs. Broadly, logs are any telemetry that is emitted through a log pipeline,
and are created by calling the Logs API. There are two ways we intend for users
to do this –

- Use the Logs API as a sink for existing loggers (sending existing logs to
  OpenTelemetry)
- Use the Logs API to emit [events](/docs/concepts/glossary/#event) or log
  records.

Regardless of the source, all logs emitted through the Logs API are able to
participate in the OpenTelemetry Context. Log records share the same transaction
or thread context as a metric or span. This is a fundamental part of
OpenTelemetry's design -- all of your telemetry signals can be correlated
through context.

With that said, what’s the distinction between a log and an event? It is rather
straightforward – events are logs that
[OpenTelemetry can make guarantees about](/docs/specs/otel/logs/data-model/#events).
An event has a mandatory name and a structure that is defined by a schema,
similar to how semantic conventions are defined today. While all log records in
OpenTelemetry are structured, only events have this defined schema. We are using
the word event because it most clearly describes what an event is – something
that happens, without a duration, and can be named.

**We believe that most log records should be events.**

## How is this different from other signals?

Logs and spans are often thought of as being conceptual twins, especially when
you start talking about events. What is a span other than an event with a
particularly detailed schema, after all? A key distinction between them is that
**spans have durations**. Events do not have an explicit duration; they could
represent a truly instantaneous occurrence or the result of minutes, hours, or
days of work. The other big difference is that **spans have an explicit
hierarchy**. Spans have connections to other spans, and a span with no
connections is still a complete trace. Events do not have this property -- you
can't tell from looking at one how it relates to others.

Logs and metrics differ in more clearly conceptual ways – a metric is a
numerical series of values across time. While it’s possible to convert logs into
metrics, this is downstream of the definition of the telemetry itself.

Fundamentally, OpenTelemetry is built on the concept that all signals are
interpreted together, rather than separately. Events can be considered to be a
part of the span that they were emitted under, and can be used to represent
everything from an exception, to security data, to an access log, to timing
information, and much more. This doesn't mean that events aren't useful on their
own -- for example, a front-end developer may wish to emit interaction events
for each click or tap on a screen that aren't part of a span -- but it does mean
that if an event takes place _during_ a span, it can be thought of as 'part of'
the span.

## How will we refer to these?

If there’s anything I can personally say that I’ve learned over the last seven
years of OpenTelemetry, it’s that people have very strong opinions about what
things should be named – especially when it comes to logging. It is impossible
for us to satisfy everyone’s desires or existing mental expectations when it
comes to the logging field. Thus, we’ll strive to use the nomenclature spelled
out in this post.

**Logs are anything you send through a Logging Provider, and events are a
special type of logs. Not all logs are events, but all events are logs.**

Semantic convention and instrumentation authors should use events. Logs should
be limited to bridging existing logging libraries to OpenTelemetry, or when no
other possible signal can be applied. For more, please refer to the
[Logs Specification](/docs/specs/otel/logs).

## Comments?

We’ve opened a
[GitHub issue to discuss this post](https://github.com/open-telemetry/community/issues/2679),
and we’d love your feedback.

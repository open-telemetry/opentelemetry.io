---
title: Opentelemetry Logging and You
linkTitle: OTel Logging # Mandatory, make sure that your short title.
date: 2025-04-16 # Put the current date, we will keep the date updated until your PR is merged
author:
  >- # If you have only one author, then add the single name on this line in quotes.
  [Austin Parker](https://github.com/austinlparker) (OpenTelemetry)
issue: the issue ID for this blog post # TODO: See https://opentelemetry.io/docs/contributing/blog/ for details
sig: Logging # TODO: add the name of the SIG that sponsors this blog post
---

If you’ve been following OpenTelemetry for a while, you’ve probably heard a lot
about logs. Logging bridges, Logging APIs, Events, you name it, we’ve talked
about it. This blog post is intended to be a discussion of the rationale and
current design direction of logging in OpenTelemetry.

## Definitions

Let’s get started with a basic definition of how OpenTelemetry thinks about
logs. Broadly, logs are any telemetry that is emitted through a LoggerProvider,
and are created by calling the Logging API. There are two ways we intend for
users to do this –

- Use the logging API as a sink for existing loggers (sending existing logs to
  the OpenTelemetry SDK)
- Use the logging API to emit events, our vision of a structured logging format

Regardless of the type of log, there is one thing they all have in common – logs
are part of the OpenTelemetry Context. This means that logs will have a
reference to the context of the transaction or request that they were emitted
under, irrespective of type or source. This is a fundamental part of the
OpenTelemetry data model – all of your telemetry must be linked, contextually,
to other telemetry.

With that said, what’s the distinction between a log and an event? It is rather
straightforward – events are logs that
[OpenTelemetry can make guarantees about](/docs/specs/otel/logs/data-model/#events).
An Event has a mandatory name and a structure that is defined via a schema,
similar to how semantic conventions are defined today. Some people may refer to,
or think of, these as ‘structured logs’ and it wouldn’t be wrong. We are using
the word event because it most clearly describes what an event is – something
that happens, without a duration, and can be named.

**We believe that all logs should be events**, or at least the overwhelming
majority of them.

## How is this different from other signals?

Logs and Spans are often thought of as being conceptual twins, especially when
you start talking about events. What is a span other than an event with a
particularly detailed schema, after all? A key distinction between them is that
**spans have durations**. Events make no guarantees or claims about duration or
time; They could represent a truly instantaneous occurrence, or the result of
minutes or hours of computation. The other big difference is that **spans have
an explicit hierarchy**. A span is part of a trace that contains many spans. A
span with no children is, in and of itself, a complete trace. Events do not have
this guarantee.

Logs and Metrics differ in more clearly conceptual ways – a metric is a
numerical series of values across time. While it’s possible to convert logs into
metrics, this is downstream of the definition of the telemetry itself.

Fundamentally, OpenTelemetry is built on the concept that all signals are
interpreted together, rather than separately. Events can be considered to be a
part of the span that they were emitted under, and can be used to represent
everything from an exception, to security data, to an access log, to timing
information, and much more. Events are not only useful in the presence of a
span, but if they’re emitted with a span context, they can reasonably be
interpreted as contained within the span.

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
be limited to legacy migrations of existing telemetry systems to OpenTelemetry,
or when no other possible signal can be applied.

## Comments?

We’ve opened a
[GitHub issue to discuss this post](https://github.com/open-telemetry/community/issues/2679),
we’d love your feedback.

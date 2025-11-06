---
title: Contributing the Unroll Processor to the OpenTelemetry Collector Contrib
linkTitle: Adding the Unroll Processor
date: 2025-11-06
author: >-
  [Keith Schmitt](https://github.com/schmikei) (Bindplane)
issue: 8039
sig: Collector
cSpell:ignore: Bindplane CloudWatch OTTL schmikei VPC
---

The idea for unrolling bundled logs inside the OpenTelemetry Collector didn't
start with a processor.

By "unrolling," I mean taking a single log record that contains multiple logical
events—for instance, a JSON array with ten log entries—and expanding it into ten
separate log records, one for each event. This lets you work with individual log
entries rather than bundled payloads.

When the Collector SIG first discussed the problem of how to handle logs that
contain multiple logical events in a single body, like a JSON array, the initial
instinct was to solve it with an
[OTTL (OpenTelemetry Transform Language) function inside the transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/41791).

And that made sense to me at first glance. OTTL is powerful, flexible, and can
handle transformations on the record level. But we found deeper challenges. The
transform processor had a hard time adding new log records mid-iteration. It
mutates and filters existing data, but expanding one record into many isn't
something it can feasibly do within its role as a single processor.

That's where we wanted to jump in and help. Back in January of this year I
helped develop a dedicated unroll processor in our distro of the OpenTelemetry
Collector, primarily because our customer base was running into these issues.

The unroll processor expands bundled records in a clean, deterministic way.
After running it for months in production, I wanted to help by
[upstreaming](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/42491)
the unroll processor so the OpenTelemetry community could benefit from a shared
solution.

Let me explain what the unroll processor is, how it works, how it can help you,
and how we helped contribute
[upstream](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/42500)
to the Contrib distribution.

## Why unroll?

The core problem is simple: some sources deliver multiple events within one log
record. You want to work with clean, individual log entries.

Before unroll, you had two options:

1. Pre-process logs outside the Collector—if you could insert the logic.
2. Try to bend OTTL/transform into doing something it was never designed for.

Neither turned out to be the right approach to address the problem.

## What the unroll processor does

The unroll processor takes a list-like log body, like a JSON array, and expands
it into one log record per element, while preserving timestamps, and both
resource and log attributes.

If your input had ten objects in a JSON array, you get ten distinct log records
out. Every log record would preserve its metadata and be ready for
transformations, filters, reductions, anything you'd want really.

It's simple, predictable, and production-safe.

## Why decide against OTTL?

We explored this deeply.

On paper, solving this using a transform + OTTL combo seemed simpler. Once we
got into it, we ran into a core limitation: OTTL can't safely add new records
during iteration. Trying to generate new entries mid-loop leads to skipped
records, unreliable statement execution, and brittle behavior.

Transform and filter processors are excellent for mutation and suppression. But
expansion is a different responsibility. It requires its own semantics,
lifecycle, and guarantees.

The unroll processor cleanly separates the concern of adding records from
transformation logic and operates in a way that's both composable and
predictable.

I helped develop the first version of the unroll processor in the Bindplane
Distro of OpenTelemetry Collector. It was first shipped and in use by customers
in January 2025 and has been running in production ever since.

I've seen customers use it across:

- VPC logs
- CloudWatch ingestion pipelines
- Windows + endpoint logs
- Bundled collector telemetry

We observed very low issue volume even under real production load and
specifically when the initial receiver or source of the log signals was fairly
format agnostic. This gave us the confidence to propose the component upstream.

## How to configure the unroll processor

Drop the unroll processor into your pipeline wherever you need to expand bundled
log payloads. Here's a minimal configuration example to get you started:

```yaml
processors:
  unroll:
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [..., unroll, ...]
      exporters: [logging]
```

## Common unroll pattern

The unroll processor only performs work if `log.body` is an iterable list—for
example, a proper JSON array. But in real-world pipelines, log records aren't
always so neatly structured. Sometimes, additional preprocessing is needed to
convert raw log payloads into a format that the unroll processor can operate on.

### Example: Multiple JSON objects in a single log record

Consider a case where multiple JSON objects are concatenated into a single log
record, like this:

```json
{"@timestamp":"2025-09-19T02:20:17.920Z", "log.level": "INFO", "message":"initialized", "ecs.version": "1.2.0","service.name":"ES_ECS","event.dataset":"elasticsearch.server","process.thread.name":"main","log.logger":"org.elasticsearch.node.Node","elasticsearch.node.name":"es-test-3","elasticsearch.cluster.name":"elasticsearch"},{"type": "server", "timestamp": "2025-09-18T20:44:01,838-04:00", "level": "INFO", "component": "o.e.n.Node", "cluster.name": "elasticsearch", "node.name": "es-test", "message": "initialized" }
```

Here's how you can preprocess using the `transform` processor followed by
`unroll`:

```yaml
receivers: ...

processors:
  transform:
    error_mode: ignore
    log_statements:
      - context: log
        statements:
          - set(body, Split(body, "\"},"))
  unroll: {}
exporters: ...

services:
  pipelines:
    logs:
      receivers: [...]
      processors: [transform, unroll]
      exporters: [...]
```

This transform statement uses `Split` to separate the body into chunks using the
`"},"` delimiter, producing a list-like body that the unroll processor can
expand.

## Summary

This feature started from a simple need: make the Collector more versatile and
capable of expanding log records.

We tried the OTTL route, realized it wouldn't easily work, and upstreamed a
purpose-built, production-tested, and easy-to-use unroll processor. The result
is a small config change that can unblock a huge number of real-world telemetry
ingestion problems.

We're not proposing to add record expansion to OTTL at this time. Expansion
changes the cardinality of the data stream and likely requires different
lifecycle and correctness guarantees, which is why a dedicated processor is a
good fit for today. Keeping the responsibilities separate lets OTTL focus on
transforming existing log records while the unroll processor handles expansion

The unroll processor is now available in the official
[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/unrollprocessor).
Please feel free to create issues and test it out for your logs pipelines.

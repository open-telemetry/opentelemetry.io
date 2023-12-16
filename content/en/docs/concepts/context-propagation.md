---
title: Context Propagation
weight: 10
description: Learn about the concept that enables Distributed Tracing.
---

With Context Propagation, [Signals](/docs/concepts/signals) can be correlated
with each other, regardless of where they are generated. Although not limited to
tracing, it is what allows [traces](/docs/concepts/signals/traces) to build
causal information about a system across services that are arbitrarily
distributed across. process and network boundaries.

We define Context Propagation by two sub-concepts: Context and Propagation.

## Context

A **Context** is an object that contains the information for the sending and
receiving service (or
[execution unit](/docs/specs/otel/glossary/#execution-unit)) to correlate one
signal with another.

For example, if Service A calls Service B, then a span from Service A whose ID
is in context will be used as the parent span for the next span created in
Service B. The trace ID that is in context will be used for the next span
created in Service B as well, which signifies that the span is part of the same
trace as the span from Service A.

## Propagation

**Propagation** is the mechanism that moves context between services and
processes. It serializes or deserializes the context object and provides the
relevant information to be propagated from one service to another. Propagation
is usually handled by instrumentation libraries and is transparent to the user,
but in the event that you need to manually propagate context, you can use
Propagation APIs.

OpenTelemetry maintains several official propagators. The default propagator is
using the headers specified by the
[W3C TraceContext](https://www.w3.org/TR/trace-context/) specification.

## Specification

To learn more about Context Propagation, see the
[Context specification](/docs/specs/otel/context/).

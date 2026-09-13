---
title: Trace context association in OBI
linkTitle: Trace context association
description:
  Learn how OBI associates outgoing requests with incoming parent requests for
  distributed traces.
weight: 23
cSpell:ignore: asyncio ForkJoin Netty SIGUSR1 uvloop WebFlux
---

## Introduction

Distributed tracing in OBI has two parts:

1. Find the active parent request for outgoing work.
2. Propagate the selected W3C `traceparent` value on the outgoing request.

The [distributed traces](../distributed-traces/) guide describes how OBI writes
trace context to outgoing HTTP/gRPC traffic. This page describes the first part:
how OBI associates an outgoing request with the incoming request that caused it,
and where that association can fail.

OBI performs this association from eBPF and runtime observations. It does not
read arbitrary application variables or framework context objects. Instead, it
uses the supported runtime hand-off mechanisms, socket activity, and OS thread
relationships described below.

## How OBI finds the parent request

When OBI observes an outgoing request, it looks for the parent trace context
that belongs to the incoming request currently being handled. OBI prefers
runtime-specific association data when it is available. If there is no
runtime-specific match, OBI falls back to language-agnostic OS thread and socket
signals.

The association step is separate from the step that writes the outgoing
`traceparent` value. For example, language-agnostic network-level context
propagation supports HTTP/1.x and gRPC over HTTP/2, but generic non-gRPC HTTP/2
traffic isn't supported. Go library-level context propagation can write context
for HTTP/2 and gRPC only on new, non-HTTPS connections; reused HTTP/2/gRPC
connections are not supported yet. Other limitations are documented in
[distributed traces](../distributed-traces/#go-context-propagation-by-instrumenting-at-library-level).

## Runtime-specific association

OBI has runtime-specific support for common asynchronous and threaded execution
models:

| Runtime or component | Association mechanism                                                                                                                          | Supported scope and limitations                                                                                                                                                            |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Go                   | Tracks trace context across goroutines.                                                                                                        | Go `1.18+`. Supports up to 6 nested goroutine levels.                                                                                                                                      |
| Node.js              | Uses Node.js async hooks to refresh the active request context before async callbacks and to associate outgoing sockets with incoming sockets. | Node.js `8.0+`. Custom handling of `SIGUSR1` can interfere with OBI's Node.js support.                                                                                                     |
| Java                 | Tracks hand-offs through common JDK task APIs, including `Executor`, `Runnable`, `Callable`, and `ForkJoinTask`.                               | JDK `8+`. Supports task parent lookup up to 3 hand-off levels. Custom queues or scheduler implementations that do not use these task APIs can fall back to the language-agnostic behavior. |
| Java virtual threads | Tracks virtual-thread mount and unmount operations so request context is keyed to the virtual thread rather than only the carrier OS thread.   | JDK `21+`. Log enrichment is skipped for requests handled on virtual threads.                                                                                                              |
| Python asyncio       | Tracks the current `asyncio` task, child task creation, inherited context, and `asyncio.to_thread()` work.                                     | Supported for Python `3.9+` with the `uvloop` event loop.                                                                                                                                  |
| Ruby Puma            | Associates requests when Puma's reactor thread hands accepted work to a worker thread.                                                         | Requires Puma `5.0+`. Ruby services not served by Puma use the language-agnostic behavior.                                                                                                 |
| NGINX                | Associates an incoming request with the upstream connection selected by NGINX.                                                                 | Applies to NGINX upstream proxying observed by OBI.                                                                                                                                        |

These mechanisms are designed for common framework behavior. For example, OBI
can usually associate parent and child spans for:

- Go handlers that create short goroutine trees while processing a request.
- Node.js HTTP frameworks that use the standard Node.js async runtime.
- Java servlet-style applications, such as many Spring MVC services, when
  outgoing work stays on the request thread or is dispatched through the common
  JDK task APIs listed above.
- Python `asyncio` services running on `uvloop`, including work created with
  `asyncio.create_task()`, `asyncio.gather()`, and `asyncio.to_thread()`.
- Ruby applications served by Puma.
- NGINX reverse proxy requests to upstream services.

## Language-agnostic association

When runtime-specific association is not available, OBI uses language-agnostic
signals that are visible from eBPF:

- The same OS thread is handling the incoming request and the outgoing request.
- The outgoing request is made from a child thread or process that OBI can
  relate back to the original request thread.
- The request thread performs socket setup or connection live checks before the
  outgoing request is completed by another worker thread.

This fallback allows OBI to handle many synchronous frameworks and some thread
pool patterns without language-specific code. It is intentionally bounded. OBI
does not try to reconstruct arbitrary application queues, user-space schedulers,
or framework-specific context objects that are not visible from the supported
observations.

## Limitations

OBI can miss the parent-child association when the application moves work in a
way OBI cannot observe. Common cases include:

- Work is placed on a framework queue and all outgoing socket activity happens
  later on a worker thread that OBI cannot relate to the original request.
- A reactive or event-loop framework transfers work through scheduling
  structures that are not covered by the runtime-specific mechanisms above.
  Spring WebFlux, Netty/Reactor, and custom Java schedulers can still miss
  association unless the hand-off also passes through an observed JDK task API
  or a language-agnostic socket signal.
- A background job, retry, or delayed task continues after the original request
  context is no longer active.
- Multiple logical requests are multiplexed on the same OS thread and there is
  no supported runtime-specific mechanism to identify the active logical task.
- The active context propagation method cannot write trace context for the
  outgoing protocol. In particular, language-agnostic network-level propagation
  does not support generic non-gRPC HTTP/2 traffic.

When parent association fails, OBI can still report spans for the observed
incoming and outgoing requests, but the outgoing request might start a new trace
or attach to a different parent than the application-level framework would have
chosen.

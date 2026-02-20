---
title: Context propagation implementation details
linkTitle: Context propagation
description: Learn how OBI does context propagation for various languages and frameworks.
weight: 24
---

## Introduction

To support distributed tracing for HTTP and other protocols, OBI performs automatic context
propagation, from incoming to outgoing requests. This context propagation works across protocols, 
for example, correlation may occur between incoming HTTP request and an outgoing SQL request.

In general, performing context propagation depends on how the application handles hand-off between
worker threads. In some cases, the worker threads are not actual OS threads, but they can be an 
abstraction on top of OS threads (e.g. `goroutines`, `coroutines`, `green threads`, `virtual threads`).
Therefore, it's very difficult to implement a single correct context propagation approach that works
for all programming languages and frameworks.

OBI implements various approaches to tackle specific programming languages and frameworks, but
they are by no means complete, and will fail to perform correct correlation in certain scenarios.
This documents attempts to capture some of the details, and provide guidance on what works and
what doesn't.

## Implementation details

In this section we'll go over each individual approach that is currently implemented and explain
the scope.

### Go programming language

The Go threading model is based on `goroutines`, where many `goroutines` map to a single OS thread.
Therefore, in order to perform correct correlation of incoming to outgoing requests, OBI tracks the
`goroutines` lifecycle. We attach probes to `runtime.newproc1` and `runtime.goexit1`, to track the
parent to child `goroutine` relationship, by keeping track the `goroutine` relationships in a 
in-memory map.

At a time of an outgoing client request, we use the parent to child relationship map, up to a depth of 3,
to lookup any, still active, incoming request that has launched the outgoing request goroutine.

Special consideration is taken for correct context propagation for `gRPC`, because the 
outgoing requests are all handled by the so called `loopyWriter`, which is a single goroutine 
handling the outgoing requests. In this specific scenario, we use the `HTTP2`/`gRPC` stream ID, 
as a unique key to identify the original request, when it's appended to the write queue when
`google.golang.org/grpc.(*ClientConn).NewStream` is invoked.

### Node.js

The `Node.js` runtime has an async request queue that is handling all incoming and outgoing requests.
When an incoming request is handled, any outgoing requests, typically done in async fashion to
avoid holding up the event loop, are added on the event queue loop as separate requests. To correctly
propagate context between incoming and outgoing requests, we must know which async operation was 
scheduled by what other async operation.

Prior to `Node.js` 20 we used to track the async event loop correlation, by injecting probes into
`EmitAsyncInit` and `AsyncReset`. However, from `Node.js` 20 and onward, more of the runtime 
handling was rewritten in JavaScript, and the eBPF probe approach misses number of critical correlation
steps.

To correctly track `Node.js`, OBI injects a small agent that hooks into `serverEmit`, `socketConnect` and
`socketWrite`. This agent is automatically injected in running processes, through the 
`Node.js` debugger interface, and it has 0 dependencies. It extracts the incoming and outgoing
file descriptors for the requests, and it communicates them to the eBPF side by performing a
fake file operation on `/dev/null`.

The eBPF side tracks the fake file access and establishes an internal in-memory map of 
incoming to outgoing file descriptor mappings. When an outgoing request happens, OBI looks up
the `Node.js` map to find the parent file descriptor, which is then matched to an incoming request.

`Node.js` correlation doesn't for for `HTTP2`/`gRPC`.

### nginx

`nginx` has a unique threading model, where number of incoming requests and handled by a 
custom thread pool of `upstream` handlers. To support `nginx` context propagation, OBI injects
two probes, a probe in `ngx_http_upstream_init` and a return probe on `ngx_event_connect_peer`.

At the time `ngx_http_upstream_init` is invoked, we start tracking the connection information
of the incoming request, while when `ngx_event_connect_peer` returns, we create a mapping
of the incoming request to the outgoing file descriptor. At the time OBI handles the outgoing 
request, it looks up the outgoing call file descriptor and fetches the connection information
of the incoming request, managing to correlate both. In a sense, this is very similar to how
we lookup the information for the `Node.js` event loop.

`nginx` correlation doesn't for for `HTTP2`/`gRPC`.

### Generic approach

The fallback approach of incoming to outgoing request correlation, for the purpose of
distributed trace context propagation, relies on thread ID correlation. The following
section outlines all the techniques we currently employ to match the requests by
thread ID:

1. Same thread. OBI tries to detect if the incoming and outgoing requests are handled
by the same thread. It detects if multiple current outgoing requests are handled by
the same thread and marks the correlation information as invalid. This helps us
prevent incorrect correlation, when the application framework handles multiple 
connections on the same thread.

2. Thread launches from other threads, through tracking of `sys_clone`. This approach
is similar to what we do for Go applications, where we track parent to child thread
relationships based on thread creation. This only helps simple applications that do
not use thread pools, and may have partial success with applications that have 
elastic thread pools, enabling the correlation when the thread pool is scaled up.

3. Connect calls or connection live checks on the incoming request. Number of 
application frameworks perform the initial outgoing request connect on the 
incoming thread, before they hand-off the work to the outgoing worker thread. In
case of keep-alive, they peek on the outgoing connection to ensure it hasn't 
dropped since the last request, which allows us to correlate the outgoing to the
incoming request by the connection information. Essentially, we use the handling
of the outgoing connection on the incoming request, as a way of matching the
incoming to outgoing requests.

This approach works well for single threaded programming languages and frameworks,
for example `Python` applications that do not use `asyncio`. The OpenJDK internal
HTTP client and the Apache HTTP client also work, because the outgoing connections
are 'inspected' on the same thread that handles the incoming request.

The generic correlation doesn't work for `HTTP2`/`gRPC`.

## What doesn't work

- Any reactive programming frameworks.
- Application frameworks with thread pools that handle the full connection
lifecycle on the outgoing worker threads. 
- Application frameworks that handle all incoming traffic on the same thread,
before handing over the request to be served by a worker thread. An example of this
the `Puma reactor` used in `Ruby on Rails`.
- `.net` `async`/`await` create number of complex thread pools that are unpredictable
in how the work is scheduled.

## Future work

- We have identified an approach that will allow us to track the `Puma reactor` used
in `Ruby on Rails`, by implementing an in-memory queue at the time the reactor thread
is scheduling the work on the thread pool.

- There might be a possibility to extend the generic tracking approach by tracking 
epoll wait and wake in the kernel. For example, it appears that the `Java` `Netty` reactor
is using epoll directly to ask for a client worker to pick up the next queued request.
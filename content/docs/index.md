---
title: "Documentation"
aliases:
  - /csharp/
  - /csharp/metrics/
  - /csharp/tracing/
  - /golang/
  - /golang/metrics/
  - /golang/tracing/
  - /java/
  - /java/metrics/
  - /java/tracing/
  - /js/
  - /js/metrics/
  - /js/tracing/
  - /python/
  - /python/metrics/
  - /python/tracing/
  - /ruby/
  - /ruby/metrics/
  - /ruby/tracing/
weight: 1
---

_Note: For documentation and guides on specific languages, please follow the link in the navigation bar for the language SDK or project you're interested in. This page contains general information about how OpenTelemetry works._

OpenTelemetry is a set of APIs, SDKs, tooling and integrations that are designed for the creation and management of _telemetry data_ such as traces, metrics, and logs. This documentation page is intended to broadly cover key terms, concepts, and instructions on how to use OpenTelemetry in your software.

## Basic Concepts

As with any technology, there are some fundamental concepts that you'll need to be familiar with in order to understand and use OpenTelemetry to its fullest. This section will cover basic terminology and concepts that the OpenTelemetry API expresses.

### Tracing

A _trace_ is a collection of _spans_, which are objects that represent the work being done by individual services or components involved in a request as it flows through a system. A span contains a _span context_, which is a set of globally unique identifiers that represent the unique request that each span is a part of. Your system may handle dozens, hundreds, thousands, or millions of requests per second -- each of these requests would have a single _trace identifier_, and each span in that request would have a unique _span identifier_. This span context is _immutable_ and cannot be modified after creation.

A trace contains a single _root span_ which encapsulates the end-to-end latency for the entire request. You can think of this as a single logical operation, such as clicking a button in a web application to add a product to a shopping cart. The root span would measure the time it took from an end-user clicking that button to the operation being completed or failing (so, the item is added to the cart or some error occurs) and the result being displayed to the user. A trace is comprised of the single root span and any number of _child spans_, which represent operations taking place as part of the request. Each span contains metadata about the operation, such as its name, start and end timestamps, attributes, events, and status.

To create and manage these spans, the OpenTelemetry API provides the _tracer_ interface. This object is responsible for tracking the _active span_ in your process, and allows you to access the current span in order to perform operations on it such as adding attributes, events, and finishing it when the work it tracks is complete. One or more tracer objects can be created in a process through the _tracer provider_, a factory interface that allows for multiple tracers to be instantiated in a single process with different options. 

Generally, the lifecycle of a span resembles the following:
* A request is received by a service. The span context is _extracted_ from the request headers, if it exists.
* A new span is created as a child of the extracted span context; If none exists, a new root span is created.
* The service handles the request. Additional attributes and events are added to the span that are useful for understanding the context of the request, such as the hostname of the machine handling the request, or customer identifiers.
* New spans may be created to represent work being done by sub-components of the service.
* When the service makes a remote call to another service, the current span context is serialized and forwarded to the next service by _injecting_ the span context into the headers or message envelope.
* The work being done by the service completes, successfully or not. The span status is appropriately set, and the span is marked finished.

### Metrics

A _metric_ is some raw measurement about a service, captured at runtime. Logically, the moment of capturing one of these measurements is known as a _metric event_ which consists not only of the measurement itself, but the time that it was captured. These raw measurements are then used by monitoring and alerting systems to provide statistical data about the performance of a service or system.

OpenTelemetry defines three _metric instruments_ that are intended for different purposes. These instruments are the _counter_, _measure_, and _observer_. A counter is a value that is summed over time -- you can think of this like an odometer on a car; It only ever goes up. A measure is a value that is aggregated over time. This is more akin to the trip odometer on a car, it represents a value over some defined range. An observer captures a current set of values at a particular point in time, like a fuel gauge in a vehicle. 

In addition to the three metric instruments, the concept of _aggregations_ is an important one to understand. An aggregation is a technique whereby a large number of measurements are combined into either exact or estimated statistics about metric events that took place during a time window. The API itself does not allow you to specify these aggregations, but provides some default ones -- please see the specification and SDK documentation for more detail here. In general, the OpenTelemetry SDK provides for common aggregations (such as sum, count, last value, and histograms) that are supported by visualizers and telemetry backends.

Unlike request tracing, which is intended to capture request lifecycles and provide context to the individual pieces of a request, metrics are intended to provide statistical information in aggregate. Some examples of use cases for metrics include:
* Reporting the total number of bytes read by a service, per protocol type.
* Reporting the total number of bytes read and the bytes per request.
* Reporting the duration of a system call.
* Reporting request sizes in order to determine a trend.
* Reporting CPU or memory usage of a process.
* Reporting average balance values from an account.
* Reporting current active requests being handled.

### Context

It is first necessary to disambiguate _context_ as a term in OpenTelemetry. When we refer to context, we may be referring not only to its logical usage -- the circumstances surrounding an event in your service -- but also to specific types of context, like a trace's span context. OpenTelemetry also specifies a generalized _telemetry context_ that is known as the _correlation context_, which is a set of keys and values that can be serialized and propagated between services that are using OpenTelemetry.

The correlation context is used to provide annotations and metadata from one service to the next -- you can use it, for example, to propagate values from a client process to a server process. These values can be added to telemetry data emitted by the child service, or used for other purposes (such as conditional execution of program logic) as required. Context can also be propagated _within_ a service, from function to function.

When we talk about context _propagation_, we're either referring to the act of serializing and deserializing a context object and passing it to a new service, or we're referring to passing it from thread to thread (or thread-like object) in a service. The specifics of this depend heavily on individual language features, so please refer to the language-specific documentation for OpenTelemetry to learn more about the details of context propagation for that language. For service-to-service communication (often referred to as an _RPC_, a remote process call) you'll see references to _injecting_ and _extracting_ context from the RPC headers or envelope.

## Installing and Configuring OpenTelemetry

The exact installation mechanism for OpenTelemetry varies based on the language you're developing in, but there are some similarities that we'll cover here.

### Import the OpenTelemetry API and SDK

You'll first need to import OpenTelemetry to your service code. If you're developing a library or some other component that is intended to be consumed by a runnable binary, then you would only take a dependency on the API. If your artifact is a standalone process or service, then you would take a dependency on the API and the SDK.

### Configure the OpenTelemetry API

In order to create traces or metrics, you'll need to first create a tracer and/or meter provider. In general, we reccomend that the SDK should provide a single default provider for these objects. You'll then get a tracer or meter instance from that provider, and give it a name and version. The name you choose here should identify what exactly is being instrumented -- if you're writing a library, for example, then you should name it after your library (i.e., `com.legitimatebusiness.myLibrary` or some other unique identifier) as this name will namespace all spans or metric events produced. It is also reccomended that you supply a version string (i.e., `semver:1.0.0`) that corresponds to the current version of your library or service.

### Configure the OpenTelemetry SDK

If you're building a service process, you'll also need to configure the SDK with appropriate options for exporting your telemetry data to some analysis backend. We recommend that this configuration be handled programmatically through a configuration file or some other mechanism. There are also per-language tuning options you may wish to take advantage of.

### Create Telemetry Data

Once you've configured the API and SDK, you'll then be free to create traces and metric events through the tracer and meter objects you obtained from the provider. You can also utilize a plugin or integration to create traces and metric events for you -- check out the [registry](/registry) or your language's repository for more information on these.

## Exporting Data

Once you've creataed telemetry data, you'll want to send it somewhere. OpenTelemetry supports two primary methods of exporting data from your process to an analysis backend, either directly from a process or by proxying it through the OpenTelemetry Collector.

In-process export requires you to import and take a dependency on one or more _exporters_, libraries that translate OpenTelemetry's in-memory span and metric objects into the appropriate format for telemetry analysis tools like Jaeger or Prometheus. In addition, OpenTelemetry supports a wire protocol known as _OTLP_, which is supported by all OpenTelemetry SDKs. This protocol can be used to send data to the OpenTelemetry Collector, a standalone binary process that can be run as a proxy or sidecar to your service instances or run on a separate host. The collector can then be configured to forward and export this data to your choice of analysis tools.

In addition to open source tools such as Jaeger or Prometheus, a growing list of companies support ingesting telemetry data from OpenTelemetry. Please see [this page](/vendors) for more details.

---
Title: "Status"
menu:
  main:
    weight: 30
    pre : <i class="fas fa-laptop-code"></i>
---

<a class="td-offset-anchor"></a>
<section class="row td-box td-box--1 position-relative td-box--gradient td-box--height-auto">
  <div class="container text-center td-arrow-down">
    <h1>OpenTelemetry Tracing Specification now 1.0!</h1>
    <span class="h4 mb-0">
      <p>Our goal is to provide a generally available, production quality
      release for the tracing data source across most OpenTelemetry components
      in the first half of 2021. Several components have already reached this
      milestone! We expect metrics to reach the same status in the second half
      of 2021 and are targeting logs in 2022.</p>
    </span>
  </div>
</section>

{{% blocks/section type="section" color="white" %}}

## Project Overview

OpenTelemetry is developed on a signal by signal basis. Tracing, metrics, baggage, and logging are examples of signals.
Signals are built on top of context propagation, a shared mechanism for correlating data across distributed systems.

Each signal consists of four core components: APIs, SDKs, the OTLP protocol, and the Collector. Signals also have contrib components, an ecosystem of plugins and instrumentation.
All instrumentation shares the same semantic conventions, to ensure that they produce the same data when observing common operations, such as HTTP requests.

A detailed overview of signals and components can be found [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md).

### Component Lifecycle

Components follow a development lifecycle: Draft, Experimental, Stable, Deprecated, Removed.  

**Draft** components are under design, and have not been added to the specification.  
**Experimental** components are released and available for beta testing.  
**Stable** components are backwards compatible and covered under long term support.  
**Deprecated** components are stable, but may eventually be removed.

The complete definitions for lifecycles and long term support can be found [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md).

### Current Status

The following is a high level status report for currently available signals. Note that while the OpenTelemetry clients conform to a shared specification, they are developed independently.

Checking the current status for each client in the README of its [github repo](https://github.com/open-telemetry) is recommended. Client support for specific features can be found in the [specification compliance tables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

#### Tracing

**API:** stable  
**SDK:** stable  
**Protocol:** stable  
**Collector:** stable  

* OpenTelemetry Tracing is now completely stable, and covered by long term support.
* OpenTelemetry clients are versioned to v1.0 once their tracing implementation is complete.
* The tracing specification is still extensible, but only in a backwards compatible manner.

#### Metrics

**API:** draft  
**SDK:** draft  
**Protocol:** stable  
**Collector:** experimental  

* OpenTelemetry Metrics is currently under active development.
* The data model is stable and released as part of the OTLP protocol.
* Experimental support for metric pipelines are available in the Collector.
* Collector support for Prometheus is under developemnet, in collaboration with the Prometheus community.
* The metric API and SDK specification is currently being protoypted in Java, .NET, and Python.

#### Baggage

**API:** stable  
**SDK:** stable  
**Protocol:** N/A  
**Collector:** N/A  

* OpenTelemetry Baggage is now completely stable.
* Baggage is not an observability tool, it is a system for attaching arbitratry keys and values to a transaction, so that downstream services may access them. As such, there is no OTLP or Collector component to baggage.

#### Logging

**API:** draft  
**SDK:** draft  
**Protocol:** experimental  
**Collector:** experimental

* OpenTelemetry Logging is currently under active development.
* The data model is experimental and released as part of the OTLP protocol.
* Log processing for many data formats has been added to the Collector, thanks to the donation of Stanza to the the OpenTelemetry project.
* Log appenders are currently under develop in many languages. Log appenders allow OpenTelemetry tracing data, such as trace and span IDs, to be appended to existing logging systems.
* An OpenTelemetry logging SDK is currently under development. This allows OpenTelemetry clients to injest logging data from existing logging systems, outputting logs as part of OTLP along with tracing and metrics.
* An OpTelemetry logging API is not currently under development. We are focusing first on integration with existing logging systems. When metrics is complete, focus will shift to development of an OpenTelemetry logging API.

#### Instrumentation

An effort to expand the availability and quality of OpenTelemetry instrumentation is scheduled for this summer.

* Stabilize and define long term support for instrumentation
* Provide instrumentation for a wider variety of important libraries
* Provide testing and CICD tools for writing and verifying instrumentation quality.

{{% /blocks/section %}}

<section class="row td-box">
  <div class="col">
    <div class="row section">
      <h2>Latest Releases</h2>
      {{< release_notes >}}
    </div>
  </div>
</section>

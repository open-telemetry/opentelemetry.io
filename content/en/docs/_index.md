---
title: Documentation
linkTitle: Docs
menu: { main: { weight: 10 } }
---

OpenTelemetry is a set of APIs, SDKs, tooling and integrations that are designed
for the creation and management of _telemetry data_ such as traces, metrics, and
logs. The OpenTelemetry documentation is intended to broadly cover key terms,
concepts, and instructions on how to use OpenTelemetry in your software.

![Implementation of the OpenTelemetry Reference Architecture](https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/Reference_Architecture.svg)

OpenTelemetry provides an implementation of all of its components as well as a
reference architecture. The project is flexible and extensible to support a
broad range of open-source and commercial solutions as well as end-user needs.

For greenfield environments, the OpenTelemetry Collector should be deployed as
an agent on each host within an environment and configured to send telemetry
data to the user's desired back-end(s). OpenTelemetry instrumentation libraries
should then be added to each application. By default, these instrumentation
libraries are configured to export their data to a locally running Collector.
Optionally, a pool of Collector instances can be deployed in a region.

For brownfield environments, the Collector supports many popular open-source
wire formats including Jaeger, Prometheus, and Fluent Bit. The Collector can
serve as a bridge for end-users who either desire to leverage OpenTelemetry or
eventually move to the open standards OpenTelemetry supports.

> For documentation and guides on language-specific instrumentation or the
> Collector, please follow the links in the navigation bar.

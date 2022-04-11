---
title: Collector
weight: 10
description: >-
  <img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Collector.svg" alt="Collector logo"></img>
  Vendor-agnostic way to receive, process and export telemetry data.
spelling: cSpell:ignore Otel
aliases: [/docs/collector/about]
---

![OpenTelemetry Collector diagram with Jaeger, OTLP and Prometheus integration](https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/Otel_Collector.svg)

## Introduction

The OpenTelemetry Collector offers a vendor-agnostic implementation of how to
receive, process and export telemetry data. It removes the need to run,
operate, and maintain multiple agents/collectors. This works with improved scalability and supports
open-source observability data formats (e.g. Jaeger, Prometheus, Fluent Bit,
etc.) sending to one or more open-source or commercial back-ends. The local Collector agent
is the default location to which instrumentation libraries export their telemetry data.

## Objectives

- *Usability*: Reasonable default configuration, supports popular protocols, runs and collects out of the box.
- *Performance*: Highly stable and performant under varying loads and configurations.
- *Observability*: An exemplar of an observable service.
- *Extensibility*: Customizable without touching the core code.
- *Unification*: Single codebase, deployable as an agent or collector with support for traces, metrics, and logs (future).

## When to use a collector

For most language specific instrumentation libraries you have exporters for popular backends and OTLP. You might wonder, 

> under what circumstances does one use a collector to send data, as opposed to having each service send directly to the backend?

For trying out and getting started with OpenTelemetry, sending your data directly to a backend is a great way to get value quickly.
Also, in a development or small-scale environment you can get decent results without a collector.

However, in general we recommend using a collector alongside your service, since it allows your service to offload data quickly and the collector
can take care of additional handling like retries, batching, encryption or even sensitive data filtering.

It is also easier to [setup a collector](./getting-started) than you might think: the default OTLP exporters in each language assume a local collector endpoint, so you'd start up a collector and you'd just start getting telemetry.

{{% latest_release "collector-releases" /%}}

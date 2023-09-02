---
title: Creating Custom Receivers
description:
aliases: [/docs/collector/receivers/about]
cascade:
  collectorVersion: 0.84.0
weight: 15
---

<!-- TODO hughesjj see how cascade works here, think it just auto inserts those keys to top level of this and subsequent docs -->

![OpenTelemetry Collector diagram with Jaeger, OTLP and Prometheus integration](img/otel-collector.svg)

## Introduction

Not every system provides an otlp-native export or import mechanism. In such
cases, you may wish to implement your own mechanism to import, process, and
export third party systems such as redis, prometheus, or jager. Opentelemetry
maintains a
[`opentelemetry-collector-contrib`](https://google.com/open-telemetry/opentelemetry-collector-contrib)
repository of such third party support, in addition to some useful common
tooling and a (more or less) weekly release of said components.

If you wish to build your own collector components, the docs herein will give
instructions and guidance on how to do so.  We'll also discuss adoption into
[`opentelemetry-collector-contrib`](https://github.com/open-telemetry/opentelemetry-collector-contrib), in case you wish to share your work with the world at large.

{{% alert title="Upstreaming is a commitment!" color="primary" %}}
Be forewarned that upstreaming is an endeavour.  
If you and any team you may be apart of are unable to provide maintenance or domain expertise for your receiver, consider
creating your own fork, [collector](../custom-collector.md), or even a [bespoke distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/mdatagen/statusdata.go#L21) instead.
{{% /alert %}}

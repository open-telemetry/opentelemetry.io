---
title: The Single Writer Principle
description: How to handle the single writer principle in Collector deployments
weight: 1
---

The Single Writer Principle is a design principle that refers to maintaining a single logical writer specific data types
of events or data. The intention is to prevent concurrent write attempts from multiple writers
to the same data source, potentially leading to data corruption or data loss

## Context in OTLP
Collector deployments can involve multiple instance across different nodes in a distributed systems.
It is possible in this case for these instances to receive and process data from the same resources.
When multiple collectors write data to the same backend (such as Prometheus), the issues that arise are 
a result of violating the single writer principle.

Duplicate samples for the same metric can be submitted. 


## Potential Problems caused by multiple writers

An example scenario might be where multiple collectors are submitting the same samples, as 
they are receiving traces from same resources. If each collector is scraped, it's possible to
observe inconsistent values for the same series due to data being collected by different collectors

Any inconsistency in the metric could be explained by a single series referencing each individaul collector, which
would have varying values due to inconsistent time intervals.

For this reason uniqueness is a crucial concept in most metric systems.

## Detection

One way to identify this is by inspecting the series visually.
A series with significant gaps or jumps may be a clue that multiple collectors are submitting the same samples.
Finding a pattern of plateaus that seem to oscillate may indicate that the data is coming from two sources. 

## Prevention
Implement a globally unique identifier for all metric data streams.

A potential approach is to use a unique identifier, such as a dynamic hostname in your configuration.

```yaml
connectors:
  spanmetrics:
    dimensions:
      - name: http.method
      - name: http.status_code
      - name: k8s.namespace.name
      - name: gateway_host: "{{ .hostname }}"

``







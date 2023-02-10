---
title: Deployment
description: Patterns you can apply to run the OpenTelemetry collector
weight: 2
---

The OpenTelemetry collector consists of a single binary which you can use in
different ways, for different use cases. This document describes deployment
patterns, their use cases along with pros and cons.

## Decentralized Deployment

Clients (SDK) directly ingest into back-end

![OpAMP example setup](../img/decentralized-sdk.svg)

Clients send to one or more collector, each client is configured with a
collector location.

Pros:

- Simple to get started

Cons:

- Scalability (human and load-wise)
- Inflexible

## Centralized Deployment

Clients send to a collection of OpenTelemetry collectors behind a load-balancer

Pros:

- Separation of concerns
- Centralized policy management

Cons:

- Effort

## Best Practices

Now that you are equipped with the essential deployment patterns for the
collector, let's have a closer look at best practices for collector (pipeline)
configurations for different use cases.

### Fan Out

Export signals into more than one back-end destination, for example, for
testing, policy (signals from dev/test go into backend X, prod goes into Y), or
migrations from one back-end to another (cut-over).

### Normalizing

Normalize the metadata from different instrumentations

### Multitenancy

You want to isolate different tenants (customers, teams, etc.)

### Cross-Environment

You want to aggregate signals from multiple environments (on-prem, Kubernetes,
etc.)

### Per-Signal Instances

Have one collector instance per signal type, for example, one dedicated to
Prometheus metrics, one dedicated to Jaeger traces.

## Other information

- GitHub repo [OpenTelemetry Collector Deployment Patterns][gh-patterns]
- YouTube video [OpenTelemetry Collector Deployment Patterns][y-patterns]

[gh-patterns]:
  https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs

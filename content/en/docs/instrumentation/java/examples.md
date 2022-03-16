---
title: Examples
description: Java instrumentation examples
aliases:
  - /docs/java/instrumentation_examples
  - /docs/instrumentation/java/instrumentation_examples
weight: 6
---

## Manual instrumentation

For fully-functional examples of manual instrumentation, see [Java OpenTelemetry
Examples][].

## Community Resources

### boot-opentelemetry-tempo

Project demonstrating Complete Observability Stack utilizing
[Prometheus](https://prometheus.io/), [Loki](https://grafana.com/oss/loki/)
(_For distributed logging_), [Tempo](https://grafana.com/oss/tempo/) (_For
Distributed tracing, this basically uses Jaeger Internally_),
[Grafana](https://grafana.com/grafana/) for **Java/spring** based applications
(_With OpenTelemetry auto / manual Instrumentation_) involving multiple
microservices with DB interactions

Checkout
[boot-opentelemetry-tempo](https://github.com/mnadeem/boot-opentelemetry-tempo)
and get started

```console
$ mvn clean package docker:build
$ docker-compose up
```

[Java OpenTelemetry Examples]: https://github.com/open-telemetry/opentelemetry-java-docs#java-opentelemetry-examples

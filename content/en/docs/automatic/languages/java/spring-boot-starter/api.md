---
title: Extending instrumentations with the API
linkTitle: Extend with the API
description:
  Use the OpenTelemetry API in combination with the Spring Boot starter to
  extend the automatically generated telemetry with custom spans and metrics
weight: 21
---

## Introduction

In addition to the out-of-the-box instrumentation, you can extend the Spring
starter with custom manual instrumentation using the OpenTelemetry API. This
allows you to create [spans](/docs/concepts/signals/traces/#spans) and
[metrics](/docs/concepts/signals/metrics) for your own code without doing too
many code changes.

The required dependencies are already included in the Spring Boot starter.

## OpenTelemetry

The Spring Boot starter is a special case where `OpenTelemetry` is available as
a Spring bean. Simply inject `OpenTelemetry` into your Spring components.

## Span

{{% alert title="Note" %}}

For the most common use cases, use the `@WithSpan` annotation instead of manual
instrumentation. See [Annotations](../annotations) for more information.

{{% /alert %}}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@Controller
public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("application");
  }
}
```

Use the `Tracer` to create a span as explained in the
[Span](/docs/languages/java/api/#span) section.

A full example can be found in the [example repository].

## Meter

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

@Controller
public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("application");
  }
}
```

Use the `Meter` to create a counter, gauge or histogram as explained in the
[Meter](/docs/languages/java/api/#meter) section.

A full example can be found in the [example repository].

[example repository]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native

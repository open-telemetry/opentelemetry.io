---
title: Extending instrumentations with the API
linkTitle: Extend with the API
description:
  Use the OpenTelemetry API in combination with the Java agent to extend the
  automatically generated telemetry with custom spans and metrics
weight: 21
---

## Introduction

In addition to the out-of-the-box instrumentation, you can extend the Java agent
with custom manual instrumentation using the OpenTelemetry API. This allows you
to create [spans](/docs/concepts/signals/traces/#spans) and
[metrics](/docs/concepts/signals/metrics) for your own code without doing too
many code changes.

## Dependencies

Add a dependency on the `opentelemetry-api` library.

### Maven

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry

The Java agent is a special case where `GlobalOpenTelemetry` is set by the
agent. Simply call `GlobalOpenTelemetry.get()` to access the `OpenTelemetry`
instance.

## Span

{{% alert title="Note" %}}

For the most common use cases, use the `@WithSpan` annotation instead of manual
instrumentation. See [Annotations](../annotations) for more information.

{{% /alert %}}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

Use the `Tracer` to create a span as explained in the
[Span](/docs/languages/java/api/#span) section.

A full example can be found in the [example repository].

## Meter

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

Use the `Meter` to create a counter, gauge or histogram as explained in the
[Meter](/docs/languages/java/api/#meter) section.

A full example can be found in the [example repository].

[example repository]:
  https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent

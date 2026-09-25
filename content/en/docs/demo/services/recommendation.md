---
title: Recommendation Service
linkTitle: Recommendation
aliases: [recommendationservice]
cSpell:ignore: Logback
---

This service is responsible to get a list of recommended products for the user
based on existing product IDs the user is browsing.

[Recommendation service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## Instrumentation

This service is a Spring Boot 4 application that uses Spring gRPC for
communication. Rather than the Java agent, it uses the
[OpenTelemetry Spring Boot starter](/docs/zero-code/java/spring-boot-starter/),
which configures the OpenTelemetry SDK and makes it available as an
`OpenTelemetry` bean. Export endpoints, resource attributes, and the service
name come from the standard `OTEL_*` environment variables.

```groovy
implementation platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:${opentelemetryInstrumentationVersion}")
implementation "io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter"
```

## Traces

### gRPC spans

The starter does not instrument gRPC, so the service adds the
[gRPC instrumentation library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/grpc-1.6/library/README.md)
and registers its interceptors as Spring gRPC global interceptors. This creates
the `ListRecommendations` server span and the `ListProducts` client span, and
propagates the trace context to the product catalog service.

```java
@Bean
GrpcTelemetry grpcTelemetry(OpenTelemetry openTelemetry) {
  return GrpcTelemetry.create(openTelemetry);
}

@Bean
@GlobalServerInterceptor
ServerInterceptor grpcTelemetryServerInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createServerInterceptor();
}

@Bean
@GlobalClientInterceptor
ClientInterceptor grpcTelemetryClientInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createClientInterceptor();
}
```

### Add attributes to the current span

Inside the gRPC handler, the current span is the server span created by the
interceptor. In `listRecommendations` an attribute is added to it.

```java
Span.current().setAttribute("demo.product.recommended.count", productIds.size());
```

### Create new spans

The service gets a `Tracer` from the `OpenTelemetry` bean. The `getProductList`
method creates the `get_product_list` span with `spanBuilder`, puts it into
context with `makeCurrent`, and ends it in a `finally` block. An exception is
recorded on the span and sets its status to error. The recommended products are
recorded as a string array attribute, `demo.product.filtered.list`.

```java
Tracer tracer = openTelemetry.getTracer("recommendation");

Span span = tracer.spanBuilder("get_product_list").startSpan();
try (Scope ignored = span.makeCurrent()) {
  ...
  span.setAttribute(FILTERED_LIST, recommended);
} catch (RuntimeException e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

## Metrics

### Initializing metrics

The service gets a `Meter` from the same `OpenTelemetry` bean and builds its
counter.

```java
LongCounter recommendations =
    openTelemetry
        .getMeter("recommendation")
        .counterBuilder("demo.recommendation.requests")
        .setDescription("Counts the total number of given recommendations")
        .setUnit("{recommendation}")
        .build();
```

Every request adds the number of products it recommended.

```java
recommendations.add(productIds.size(), CATALOG_RECOMMENDATION);
```

### Current metrics produced

Note that all the metric names below appear in Prometheus/Grafana with `.`
characters transformed to `_`.

#### Custom metrics

- `demo.recommendation.requests`: A counter of recommended products, with the
  `recommendation.type` attribute set to `catalog`.

#### Auto-instrumented metrics

- [Runtime metrics for the JVM](/docs/specs/semconv/runtime/jvm-metrics/), from
  the starter. They show the memory growth when the `recommendationCacheFailure`
  feature flag is on.
- [Latency metrics for RPCs](/docs/specs/semconv/rpc/rpc-metrics/), from the
  gRPC instrumentation library, for both the server and the client calls.
- [SDK self-observability metrics](/docs/specs/semconv/otel/sdk-metrics/),
  because the service sets `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest`. See
  the [Self-Observability Dashboard](/docs/demo/self-observability-dashboard/).

## Logs

The service logs through SLF4J and Logback, the Spring Boot default. The starter
installs the OpenTelemetry Logback appender itself, so the service needs no
logging configuration. Log records are exported over OTLP with the trace and
span IDs of the active span.

```java
logger.info("Receive ListRecommendations for product ids:{}", productIds);
```

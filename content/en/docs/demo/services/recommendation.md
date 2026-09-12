---
title: Recommendation Service
linkTitle: Recommendation
aliases: [recommendationservice]
cSpell:ignore: Logback Micrometer
---

This service is responsible to get a list of recommended products for the user
based on existing product IDs the user is browsing.

[Recommendation service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## Instrumentation

This service is a Spring Boot 4 application that uses Spring gRPC for
communication. Rather than using a standalone Java agent, the service produces
its own traces, metrics and logs using Micrometer and the
`spring-boot-starter-opentelemetry` starter. Endpoints, service names, and
resource attributes come from the standard `OTEL_*` environment variables mapped
by Spring Boot. The only telemetry setting in `application.yaml` is the sampling
probability.

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

## Traces

### gRPC spans

Spring gRPC registers Micrometer observation interceptors on the server and on
every client channel. Because of this, the `ListRecommendations` server span and
the `ListProducts` client span exist without any custom code, with W3C trace
context propagated automatically.

### Add attributes to the current span

To add attributes to the current span, it is retrieved from the Micrometer
Tracing `Tracer`. A tag keeps the value type. This is done inside
`listRecommendations` for the server span.

```java
Span span = tracer.currentSpan();
if (span != null) {
  span.tag("demo.product.recommended.count", productIds.size());
}
```

### Create new spans

Custom spans are generated using `tracer.nextSpan()` and scoped using
`tracer.withSpan(span)` for the `get_product_list` operation, which ends in a
`finally` block. Because Micrometer spans only take scalar tags, the array
attribute `demo.product.filtered.list` is set through the OpenTelemetry API on
the same span.

```java
Span span = tracer.nextSpan().name("get_product_list").start();
try (Tracer.SpanInScope ignored = tracer.withSpan(span)) {
  ...
} catch (RuntimeException e) {
  span.error(e);
  throw e;
} finally {
  span.end();
}
```

```java
io.opentelemetry.api.trace.Span.current().setAttribute(FILTERED_LIST, recommended);
```

## Metrics

### Custom metrics

Custom application metrics use a Micrometer `Counter` on the auto-configured
`MeterRegistry`. The OTLP registry keeps the dotted name, so it arrives as
`demo.recommendation.requests`.

```java
Counter.builder("demo.recommendation.requests")
    .description("Counts the total number of given recommendations")
    .baseUnit("{recommendation}")
    .tag("recommendation.type", "catalog")
    .register(meterRegistry);
```

### Auto-instrumented metrics

Spring Boot's Micrometer auto-configuration automatically binds JVM and system
meters for memory, GC, threads, and CPU. These are exported next to the counter,
and they show memory growth when the `recommendationCacheFailure` flag is on.

## Logs

Logging goes through Logback. The console keeps Spring Boot's default pattern
with trace and span IDs, while the OpenTelemetry Logback appender exports the
same records over OTLP. The appender connects to the auto-configured
OpenTelemetry instance once at startup.

```java
@Component
class OpenTelemetryAppenderInitializer implements InitializingBean {
  ...
  @Override
  public void afterPropertiesSet() {
    OpenTelemetryAppender.install(this.openTelemetry);
  }
}
```

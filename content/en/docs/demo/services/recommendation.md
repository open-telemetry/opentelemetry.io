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

<!-- YOUR WORDS: Spring Boot 4 app, gRPC via Spring gRPC, telemetry via Micrometer
and the spring-boot-starter-opentelemetry starter, no Java agent. Endpoints, resource
attributes and service name come from the OTEL_* environment variables, which Spring Boot
maps itself. Only telemetry setting in application.yaml is the sampling probability. -->

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

## Traces

### gRPC spans

<!-- YOUR WORDS: Spring gRPC registers Micrometer observation interceptors on the server
and on every client channel, so the ListRecommendations server span and the ListProducts
client span exist without code, with W3C trace context propagated. -->

### Add attributes to the current span

<!-- YOUR WORDS: the current span comes from the Micrometer Tracing Tracer; tag keeps the
value type; done in listRecommendations for the server span. -->

```java
Span span = tracer.currentSpan();
if (span != null) {
  span.tag("demo.product.recommended.count", productIds.size());
}
```

### Create new spans

<!-- YOUR WORDS: tracer.nextSpan() plus tracer.withSpan(span) for get_product_list, ended
in a finally block. Micrometer spans only take scalar tags, so the one array attribute
(demo.product.filtered.list) is set through the OpenTelemetry API on the same span. -->

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

<!-- YOUR WORDS: a Micrometer Counter on the auto-configured MeterRegistry; the OTLP
registry keeps the dotted name, so it arrives as demo.recommendation.requests. -->

```java
Counter.builder("demo.recommendation.requests")
    .description("Counts the total number of given recommendations")
    .baseUnit("{recommendation}")
    .tag("recommendation.type", "catalog")
    .register(meterRegistry);
```

### Auto-instrumented metrics

<!-- YOUR WORDS: Spring Boot's Micrometer auto-configuration binds the JVM and system
meters (memory, GC, threads, CPU), exported next to the counter; they show the memory
growth when the recommendationCacheFailure flag is on. -->

## Logs

<!-- YOUR WORDS: Logback; console keeps Spring Boot's default pattern with trace and span
ids; the OpenTelemetry Logback appender exports the same records over OTLP; the appender is
connected to the auto-configured OpenTelemetry instance once at startup. -->

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

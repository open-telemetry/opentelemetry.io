---
title: Ad Service
linkTitle: Ad
aliases: [adservice]
---

This service determines appropriate ads to serve to users based on context keys.
The ads will be for products available in the store.

[Ad service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## Auto-instrumentation

This service relies on the OpenTelemetry Java agent to automatically instrument
libraries such as gRPC, and to configure the OpenTelemetry SDK. The agent is
passed into the process using the `-javaagent` command line argument. Command
line arguments are added through the `JAVA_TOOL_OPTIONS` in the `Dockerfile`,
and leveraged during the automatically generated Gradle startup script.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## Traces

### Add attributes to auto-instrumented spans

Within the execution of auto-instrumented code you can get current span from
context.

```java
Span span = Span.current();
```

Adding attributes to a span is accomplished using `setAttribute` on the span
object. In the `getAds` function multiple attributes are added to the span.

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### Add span events

Adding an event to a span is accomplished using `addEvent` on the span object.
In the `getAds` function an event with an attribute is added when an exception
is caught.

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### Setting span status

If the result of the operation is an error, the span status should be set
accordingly using `setStatus` on the span object. In the `getAds` function the
span status is set when an exception is caught.

```java
span.setStatus(StatusCode.ERROR);
```

### Create new spans

New spans can be created and started using
`Tracer.spanBuilder("spanName").startSpan()`. Newly created spans should be set
into context using `Span.makeCurrent()`. The `getRandomAds` function will create
a new span, set it into context, perform an operation, and finally end the span.

```java
// create and start a new span manually
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// put the span into context, so if any child span is started the parent will be set properly
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## Metrics

### Initializing Metrics

Similar to creating spans, the first step in creating metrics is initializing a
`Meter` instance, e.g. `GlobalOpenTelemetry.getMeter("ad")`. From there, use the
various builder methods available on the `Meter` instance to create the desired
metric instrument, e.g.:

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Counts ad requests by request and response type")
  .build();
```

### Bridging non-OTel custom metrics (Prometheus client library)

The Ad service also exposes a small set of custom metrics using the
[Prometheus Java client library](https://github.com/prometheus/client_java)
rather than the OpenTelemetry SDK. These metrics are exposed on a separate HTTP
endpoint (`/metrics` on `AD_PROMETHEUS_PORT`, default `9465`) and scraped by the
OpenTelemetry Collector's
[`prometheus` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver),
which forwards them into the same pipeline as the OTel SDK metrics:

```java
private static final Counter adsServedCounter =
    Counter.builder()
        .name("demo_ad_served_total")
        .help("Total number of ads served, labeled by category")
        .labelNames("category")
        .register();

HTTPServer prometheusServer =
    HTTPServer.builder().port(prometheusPort).buildAndStart();
```

> [!NOTE]  
> This is intentionally included to illustrate a **common pattern during OTel
> adoption**: organizations frequently already own significant Prometheus
> instrumentation -- in libraries, third-party exporters, or legacy services --
> and want to ingest those metrics into an OpenTelemetry-native pipeline without
> rewriting everything up front. The Collector's `prometheus` receiver is the
> bridge that makes this possible.

The Collector configuration that wires this up:

```yaml
receivers:
  prometheus/ad:
    config:
      scrape_configs:
        - job_name: ad
          scrape_interval: 10s
          static_configs:
            - targets: ['ad:${env:AD_PROMETHEUS_PORT}']
```

> [!TIP] **Recommendation**: this is a _transitional_ pattern. Prefer the
> OpenTelemetry SDK for new custom metrics, and migrate existing
> Prometheus-client metrics to it -- incremental migration as you touch the
> surrounding code has proven successful in practice, but a focused refactor
> works too; what matters is that the migration happens.

### Current Metrics Produced

Note that all the metric names below appear in Prometheus/Grafana with `.`
characters transformed to `_`.

#### Custom metrics

The following custom metrics are currently available:

- `app.ads.ad_requests` (OpenTelemetry SDK): A counter of ad requests with
  dimensions describing whether the request was targeted with context keys or
  not, and whether the response was targeted or random ads.
- `demo_ad_served_total` (Prometheus client library, scraped by the Collector):
  A counter of ads served, labeled by `category` (e.g. `telescopes`,
  `binoculars`, `random`). See
  [Bridging non-OTel custom metrics](#bridging-non-otel-custom-metrics-prometheus-client-library)
  above.

#### Auto-instrumented metrics

The following auto-instrumented metrics are available for the application:

- [Runtime metrics for the JVM](/docs/specs/semconv/runtime/jvm-metrics/).
- [Latency metrics for RPCs](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## Logs

Ad Service uses Log4J, which is automatically configured by the OTel Java agent.

It includes the trace context in log records, enabling log correlation with
traces.

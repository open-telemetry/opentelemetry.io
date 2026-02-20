---
title: Migrating from Prometheus Client Libraries
linkTitle: Prometheus Client
weight: 5
cSpell:ignore: buildAndStart buildWithCallback hvac hvacOnTime initLabelValues labelValues PrometheusRegistry totalEnergyJoules
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/prometheus-migration"?>

{{% alert title="Note" %}}
This page currently covers Java. Support for additional languages is planned.
{{% /alert %}}

This guide is for developers familiar with the
[Prometheus client libraries](https://prometheus.github.io/client_java/) who want to understand
equivalent patterns in the OpenTelemetry metrics API.

The examples use a smart home theme. Smart home metrics have no existing conventions in either
the Prometheus or the OpenTelemetry ecosystem, which lets the examples focus on API patterns
rather than naming debates.

## Conceptual differences

Before looking at code, it helps to understand a few structural differences between the two
systems.

### Registry vs. MeterProvider

In Prometheus, metrics self-register to a global `PrometheusRegistry`. You can declare a metric
anywhere in your code, and it automatically becomes available for scraping. The exporter (HTTP
server or OTLP push) is attached to the registry separately, after the metrics are defined.

In OpenTelemetry, metrics flow through a `MeterProvider`, which you configure upfront with
exporters and collection schedules. You obtain a `Meter` — scoped to your library or component —
from the provider, and create instruments from that `Meter`. The practical consequence is that
**you configure where metrics go before you create them**, rather than after.

### Label names vs. attributes

Prometheus requires label _names_ to be declared at metric creation time. Label _values_ are
bound at record time, via `labelValues(...)`.

OpenTelemetry has no upfront label declaration. Attribute keys and values are both provided
together at the time of the measurement via `Attributes`.

### Naming conventions

Prometheus uses `snake_case` metric names. Counter names must end in `_total`; the client
library appends this automatically if omitted.

OpenTelemetry conventionally uses dotted names (for example, `motion.events`). When exporting
to Prometheus, the OpenTelemetry Prometheus exporter converts dots to underscores and appends
`_total` for counters automatically.

### Synchronous vs. asynchronous instruments

Both systems support two recording modes:

- **Prometheus** calls these _stateful_ (`Counter`, `Gauge`) and _callback_
  (`CounterWithCallback`, `GaugeWithCallback`). Stateful metrics maintain their own value;
  callback metrics invoke a function at scrape time to get the current value.
- **OpenTelemetry** calls these _synchronous_ (`LongCounter`, `LongHistogram`, etc.) and
  _asynchronous_ (built with `buildWithCallback(...)`). The semantics are the same.

## Initialization {#initialization}

In Prometheus, metrics self-register to the default registry, and you attach an exporter to
that registry as a separate, independent step. In OpenTelemetry, you configure the exporter
first as part of building the `MeterProvider`, then obtain a `Meter` and create instruments
from it.

### Expose a Prometheus scrape endpoint

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusScrapeInit.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.httpserver.HTTPServer;
import java.io.IOException;

public class PrometheusScrapeInit {
  public static void main(String[] args) throws IOException, InterruptedException {
    // Create a counter and register it with the default PrometheusRegistry.
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // Start the HTTP server; Prometheus scrapes http://localhost:9464/metrics.
    HTTPServer.builder().port(9464).buildAndStart();

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // sleep forever
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelScrapeInit.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;

public class OtelScrapeInit {
  // Preallocate attribute keys and, when values are static, entire Attributes objects.
  private static final AttributeKey<String> DOOR = AttributeKey.stringKey("door");
  private static final Attributes FRONT_DOOR = Attributes.of(DOOR, "front");

  public static void main(String[] args) throws InterruptedException {
    // Configure the SDK: register a Prometheus reader that serves /metrics.
    SdkMeterProvider meterProvider =
        SdkMeterProvider.builder()
            .registerMetricReader(PrometheusHttpServer.builder().setPort(9464).build())
            .build();

    OpenTelemetrySdk openTelemetry =
        OpenTelemetrySdk.builder().setMeterProvider(meterProvider).build();

    // Metrics are served at http://localhost:9464/metrics.
    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1, FRONT_DOOR);

    Thread.currentThread().join(); // sleep forever
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

### Push metrics to an OTLP endpoint

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusOtlpInit.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.opentelemetry.OpenTelemetryExporter;

public class PrometheusOtlpInit {
  public static void main(String[] args) throws Exception {
    // Create a counter and register it with the default PrometheusRegistry.
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // Start the OTLP exporter. It reads from the default PrometheusRegistry and
    // pushes metrics to the configured endpoint on a fixed interval.
    OpenTelemetryExporter.builder()
        .protocol("http/protobuf")
        .endpoint("http://localhost:4318")
        .intervalSeconds(60)
        .buildAndStart();

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // sleep forever
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelOtlpInit.java"?>
```java
package otel;

import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class OtelOtlpInit {
  public static void main(String[] args) throws InterruptedException {
    // Configure the SDK: export metrics over OTLP/HTTP on a fixed interval.
    OtlpHttpMetricExporter exporter =
        OtlpHttpMetricExporter.builder().setEndpoint("http://localhost:4318").build();

    SdkMeterProvider meterProvider =
        SdkMeterProvider.builder()
            .registerMetricReader(
                PeriodicMetricReader.builder(exporter).setInterval(Duration.ofSeconds(60)).build())
            .build();

    OpenTelemetrySdk openTelemetry =
        OpenTelemetrySdk.builder().setMeterProvider(meterProvider).build();

    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1);

    Thread.currentThread().join(); // sleep forever
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

## Counter {#counter}

A counter records monotonically increasing values. Prometheus `Counter` maps to OpenTelemetry
`DoubleCounter` or `LongCounter`.

### Synchronous counter

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusCounter.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;

public class PrometheusCounter {
  public static void counterUsage() {
    Counter hvacOnTime =
        Counter.builder()
            .name("hvac_on_seconds_total")
            .help("Total time the HVAC system has been running, in seconds")
            .labelNames("zone")
            .register();

    // Pre-bind to label value sets: subsequent calls go directly to the data point,
    // skipping the internal series lookup.
    var upstairs = hvacOnTime.labelValues("upstairs");
    var downstairs = hvacOnTime.labelValues("downstairs");

    upstairs.inc(127.5);
    downstairs.inc(3600.0);

    // Pre-initialize zones so they appear in /metrics with value 0 on startup.
    hvacOnTime.initLabelValues("basement");
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelCounter.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounter {
  // Preallocate attribute keys and, when values are static, entire Attributes objects.
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void counterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // HVAC on-time is fractional — use ofDoubles() to get a DoubleCounter.
    // No upfront label declaration: attributes are provided at record time.
    DoubleCounter hvacOnTime =
        meter
            .counterBuilder("hvac.on")
            .setDescription("Total time the HVAC system has been running")
            .setUnit("s")
            .ofDoubles()
            .build();

    hvacOnTime.add(127.5, UPSTAIRS);
    hvacOnTime.add(3600.0, DOWNSTAIRS);
  }
}
```
<!-- prettier-ignore-end -->

Key differences:

- `inc(value)` → `add(value)`. There is no no-argument shorthand in OpenTelemetry.
- OpenTelemetry distinguishes `LongCounter` (integers, the default) from `DoubleCounter`
  (via `.ofDoubles()`, for fractional values). Prometheus uses a single `Counter` type.
- Preallocate `AttributeKey` instances (always) and `Attributes` objects (when values are
  static) to avoid per-call allocation on the hot path.

{{% /tab %}} {{< /tabpane >}}

- **Unit encoding**: Prometheus encodes the unit in the metric name (`hvac_on_seconds_total`).
  OpenTelemetry separates the name (`hvac.on`) from the unit (`s`), and the Prometheus exporter
  appends the unit suffix automatically.
- **Series pre-initialization**: Prometheus clients can pre-initialize label value combinations
  so they appear in scrape output with value 0 before any recording occurs. OpenTelemetry has no
  equivalent; data points first appear on the first `add()` call.
- **Pre-bound series**: Prometheus clients let you cache the result of `labelValues()` to
  pre-bind to a specific label value combination. Subsequent calls go directly to the data point,
  skipping the internal series lookup. OpenTelemetry has no equivalent, though it is under
  discussion in the OpenTelemetry community.

### Asynchronous (callback) counter

Use an asynchronous counter when the total is maintained by an external source — such as a
device or runtime — and you want to observe it at collection time rather than increment it
yourself.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusCounterCallback.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.CounterWithCallback;

public class PrometheusCounterCallback {
  public static void counterCallbackUsage() {
    // The smart energy meter maintains its own cumulative joule total in firmware.
    // Use a callback counter to report that value at scrape time without
    // maintaining a separate counter in application code.
    CounterWithCallback.builder()
        .name("energy_consumed_joules_total")
        .help("Total energy consumed in joules")
        .callback(callback -> callback.call(SmartHomeDevices.totalEnergyJoules()))
        .register();
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelCounterCallback.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounterCallback {
  public static void counterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // The smart energy meter maintains its own cumulative joule total in firmware.
    // Use an asynchronous counter to report that value when a MetricReader
    // collects metrics, without maintaining a separate counter in application code.
    meter
        .counterBuilder("energy.consumed")
        .setDescription("Total energy consumed")
        .setUnit("J")
        .ofDoubles()
        .buildWithCallback(measurement -> measurement.record(SmartHomeDevices.totalEnergyJoules()));
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

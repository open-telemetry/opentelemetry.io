---
title: Prometheus Client Libraries vs. OpenTelemetry
linkTitle: Prometheus Client
weight: 5
cSpell:ignore: base2ExponentialBucketHistogram bedroomTemperatureCelsius buildAndStart buildWithCallback classicUpperBounds connectedDeviceCount defaultAggregation devicesConnected deviceCommandDuration explicitBucketHistogram GaugeWithCallback gaugeBuilder hvac hvacOnTime initLabelValues InstrumentSelector InstrumentType labelValues livingRoomTemperatureCelsius LongUpDownCounter nativeOnly OtelHistogramExplicitBucketView pendingCommandCount PrometheusHistogramNative PrometheusSummary PrometheusRegistry setDefaultAggregationSelector setExplicitBucketBoundariesAdvice thermostatSetpoint totalEnergyJoules upDownCounterBuilder
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/prometheus-migration"?>

{{% alert title="Note" %}}
This page currently covers Java. Support for additional languages is planned.
{{% /alert %}}

This guide is for developers familiar with the
[Prometheus client libraries](https://prometheus.io/docs/instrumenting/clientlibs/) who want to understand
equivalent patterns in the OpenTelemetry metrics API and SDK. It covers the most common
patterns, but is not exhaustive.

## Conceptual differences

Before looking at code, it helps to understand a few structural differences between the two
systems. The [Prometheus and OpenMetrics Compatibility](/docs/specs/otel/compatibility/prometheus_and_openmetrics/)
specification documents the complete translation rules between the two systems. This section
covers the differences most relevant to writing new instrumentation code.

### Registry (MeterProvider)

In Prometheus, metrics self-register to a global `PrometheusRegistry`. You can declare a metric
anywhere in your code, and it automatically becomes available for scraping. The exporter (HTTP
server or OTLP push) is attached to the registry as a separate, independent step.

In OpenTelemetry, metrics flow through a `MeterProvider`, which you configure upfront with
exporters and collection schedules. You obtain a `Meter` — scoped to your library or component —
from the provider, and create instruments from that `Meter`. The practical consequence is that
**you configure where metrics go before you create them**, rather than independently.

### Label names (attributes)

Prometheus requires label _names_ to be declared at metric creation time. Label _values_ are
bound at record time, via `labelValues(...)`.

OpenTelemetry has no upfront label declaration. Attribute keys and values are both provided
together at the time of the measurement via `Attributes`.

### Naming conventions

Prometheus uses `snake_case` metric names. Counter names must end in `_total`; the client
library appends this automatically if omitted.

OpenTelemetry conventionally uses [dotted names](/docs/specs/semconv/general/naming/). When exporting to Prometheus, the exporter
translates names: dots become underscores, unit abbreviations expand to full words (for example,
`s` → `seconds`), and counters receive a `_total` suffix. An OpenTelemetry counter named `hvac.on` with
unit `s` is exported as `hvac_on_seconds_total`. See the
[compatibility specification](/docs/specs/otel/compatibility/prometheus_and_openmetrics/) for
the complete set of name translation rules. The translation strategy is configurable — for
example, to preserve UTF-8 characters or suppress unit and type suffixes. See the
[Prometheus exporter](/docs/specs/otel/metrics/sdk_exporters/prometheus/) configuration
reference for details.

### Stateful and callback instruments

Both systems support two recording modes:

- **Prometheus** calls these _stateful_ (`Counter`, `Gauge`) and _callback_
  (`CounterWithCallback`, `GaugeWithCallback`). Stateful metrics maintain their own value;
  callback metrics invoke a function at scrape time to get the current value.
- **OpenTelemetry** calls these _synchronous_ (counter, histogram, etc.) and
  _asynchronous_ (observed via a registered callback). The semantics are the same.

### OTel: API and SDK

OpenTelemetry separates instrumentation from configuration with a two-layer design: an **API**
package and an **SDK** package. The API defines the interfaces used to record metrics. The SDK
provides the implementation — the concrete provider, exporters, and processing pipeline.

Instrumentation code should depend only on the API. The SDK is configured once at application
startup and wired to an API reference that gets passed to the rest of the codebase. This keeps
instrumentation library code decoupled from any specific SDK version and makes it straightforward to swap in a
no-op implementation for testing.

### OTel: Instrumentation scope

Prometheus metrics are global: every metric in a process shares the same flat namespace,
identified only by name and labels.

OpenTelemetry scopes each group of instruments to a `Meter`, identified by a name and optional
version (for example, `smart.home`). When exporting to Prometheus,
the scope name and version are added as `otel_scope_name` and `otel_scope_version` labels on
every metric point. These labels appear automatically and may be unfamiliar to users coming from
Prometheus. They can be suppressed via the exporter's `without_scope_info` option — see the
[Prometheus exporter](/docs/specs/otel/metrics/sdk_exporters/prometheus/) configuration
reference for details.

### OTel: Aggregation temporality

Prometheus metrics are always cumulative. OpenTelemetry supports both cumulative and delta
temporality, but the Prometheus exporter enforces cumulative for all instruments. For developers
migrating from Prometheus, this is transparent — the behavior you already rely on is preserved.

### OTel: Resource attributes

Prometheus identifies scrape targets using `job` and `instance` labels, which are added by the
Prometheus server at scrape time.

OpenTelemetry has a `Resource` — structured metadata attached to all telemetry from a process,
with attributes such as `service.name` and `service.instance.id`. When exporting to Prometheus,
the exporter maps resource attributes to the `job` and `instance` labels, with any remaining
attributes exposed in a `target_info` metric. See the
[compatibility specification](/docs/specs/otel/compatibility/prometheus_and_openmetrics/) for
the exact mapping rules. The `target_info` metric can be suppressed via `without_target_info`,
and specific resource attributes can be promoted to metric-level labels via
`with_resource_constant_labels`. See the
[Prometheus exporter](/docs/specs/otel/metrics/sdk_exporters/prometheus/) configuration
reference for details.

## Initialization {#initialization}

The examples below cover the two main deployment patterns: exposing a Prometheus scrape
endpoint and pushing to an OTLP endpoint.

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
    HTTPServer server = HTTPServer.builder().port(9464).buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(server::close));

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

import io.opentelemetry.api.OpenTelemetry;
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
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(PrometheusHttpServer.builder().setPort(9464).build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // Instrumentation code uses the OpenTelemetry API type, not the SDK type directly.
    OpenTelemetry openTelemetry = sdk;

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
    OpenTelemetryExporter exporter =
        OpenTelemetryExporter.builder()
            .protocol("http/protobuf")
            .endpoint("http://localhost:4318")
            .intervalSeconds(60)
            .buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(exporter::close));

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

import io.opentelemetry.api.OpenTelemetry;
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
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(
                        PeriodicMetricReader.builder(
                                OtlpHttpMetricExporter.builder()
                                    .setEndpoint("http://localhost:4318")
                                    .build())
                            .setInterval(Duration.ofSeconds(60))
                            .build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // Instrumentation code uses the OpenTelemetry API type, not the SDK type directly.
    OpenTelemetry openTelemetry = sdk;

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

A counter records monotonically increasing values. Prometheus `Counter` maps to the OpenTelemetry
`Counter` instrument.

- **Unit encoding**: Prometheus encodes the unit in the metric name (`hvac_on_seconds_total`).
  OpenTelemetry separates the name (`hvac.on`) from the unit (`s`), and the Prometheus exporter
  appends the unit suffix automatically.

### Counter

The Prometheus `Counter` includes two series-management features that have no OpenTelemetry
equivalent:

- **Series pre-initialization**: Prometheus clients can pre-initialize label value combinations
  so they appear in scrape output with value 0 before any recording occurs. OpenTelemetry has no
  equivalent; data points first appear on the first `add()` call.
- **Pre-bound series**: Prometheus clients let you cache the result of `labelValues()` to
  pre-bind to a specific label value combination. Subsequent calls go directly to the data point,
  skipping the internal series lookup. OpenTelemetry has no equivalent, though it is under
  discussion in the OpenTelemetry community.

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

- `inc(value)` → `add(value)`. Unlike Prometheus, OpenTelemetry requires an explicit value — there is no bare `inc()` shorthand.
- OpenTelemetry distinguishes `LongCounter` (integers, the default) from `DoubleCounter`
  (via `.ofDoubles()`, for fractional values). Prometheus uses a single `Counter` type.
- Preallocate `AttributeKey` instances (always) and `Attributes` objects (when values are
  static) to avoid per-call allocation on the hot path.

{{% /tab %}} {{< /tabpane >}}

### Callback (async) counter

Use a callback counter (an asynchronous counter in OpenTelemetry) when the total is maintained
by an external source — such as a device or runtime — and you want to observe it at collection
time rather than increment it yourself.

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

Key differences:

- OpenTelemetry distinguishes integer and floating-point counters; `.ofDoubles()` selects the
  floating-point variant. Prometheus `CounterWithCallback` always uses floating-point values.

{{% /tab %}} {{< /tabpane >}}

## Gauge {#gauge}

A gauge records an instantaneous value that can increase or decrease. Prometheus `Gauge`
supports two distinct recording patterns that map to different OpenTelemetry instrument types:
`set()` maps to OpenTelemetry `Gauge`, and `inc()`/`dec()` maps to OpenTelemetry
`UpDownCounter`.

### Gauge — `set()`

Use this pattern for values you explicitly set to an absolute value — such as a configuration
value or a device setpoint. Prometheus `Gauge.set()` maps to the OpenTelemetry `Gauge`
instrument.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusGauge.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusGauge {
  public static void gaugeUsage() {
    Gauge thermostatSetpoint =
        Gauge.builder()
            .name("thermostat_setpoint_celsius")
            .help("Target temperature set on the thermostat")
            .labelNames("zone")
            .register();

    thermostatSetpoint.labelValues("upstairs").set(22.5);
    thermostatSetpoint.labelValues("downstairs").set(20.0);
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelGauge.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleGauge;
import io.opentelemetry.api.metrics.Meter;

public class OtelGauge {
  // Preallocate attribute keys and, when values are static, entire Attributes objects.
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void gaugeUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    DoubleGauge thermostatSetpoint =
        meter
            .gaugeBuilder("thermostat.setpoint")
            .setDescription("Target temperature set on the thermostat")
            .setUnit("Cel")
            .build();

    thermostatSetpoint.set(22.5, UPSTAIRS);
    thermostatSetpoint.set(20.0, DOWNSTAIRS);
  }
}
```
<!-- prettier-ignore-end -->

Key differences:

- `set(value)` → `set(value, attributes)`. The method name is the same.
- OpenTelemetry distinguishes `LongGauge` (integers, via `.ofLongs()`) from `DoubleGauge`
  (the default). Prometheus uses a single `Gauge` type.
- Preallocate `AttributeKey` instances (always) and `Attributes` objects (when values are
  static) to avoid per-call allocation on the hot path.

{{% /tab %}} {{< /tabpane >}}

### Callback (async) gauge — absolute value

Use a callback gauge (an asynchronous gauge in OpenTelemetry) when a value is maintained
externally — such as a sensor reading — and you want to observe it at collection time rather
than track it yourself. Choose this over the incremental variant when the value is
**non-additive**: summing it across multiple instances would be meaningless. Temperature is the
classic example — adding the readings from three room sensors doesn't produce a useful number.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusGaugeCallback.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusGaugeCallback {
  public static void gaugeCallbackUsage() {
    // Temperature sensors maintain their own readings in firmware.
    // Use a callback gauge to report those values at scrape time without
    // maintaining a separate gauge in application code.
    GaugeWithCallback.builder()
        .name("room_temperature_celsius")
        .help("Current temperature in the room")
        .labelNames("room")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.livingRoomTemperatureCelsius(), "living_room");
              callback.call(SmartHomeDevices.bedroomTemperatureCelsius(), "bedroom");
            })
        .register();
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelGaugeCallback.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelGaugeCallback {
  private static final AttributeKey<String> ROOM = AttributeKey.stringKey("room");
  private static final Attributes LIVING_ROOM = Attributes.of(ROOM, "living_room");
  private static final Attributes BEDROOM = Attributes.of(ROOM, "bedroom");

  public static void gaugeCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // Temperature sensors maintain their own readings in firmware.
    // Use an asynchronous gauge to report those values when a MetricReader
    // collects metrics, without maintaining separate gauges in application code.
    meter
        .gaugeBuilder("room.temperature")
        .setDescription("Current temperature in the room")
        .setUnit("Cel")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.livingRoomTemperatureCelsius(), LIVING_ROOM);
              measurement.record(SmartHomeDevices.bedroomTemperatureCelsius(), BEDROOM);
            });
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

### Gauge — `inc()` and `dec()`

Prometheus `Gauge` supports `inc()` and `dec()` for values that change incrementally — such as
the number of connected devices or active sessions. OpenTelemetry `Gauge` records absolute values
only; this pattern maps to the OpenTelemetry `UpDownCounter` instrument.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounter.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusUpDownCounter {
  public static void upDownCounterUsage() {
    // Prometheus uses Gauge for values that can increase or decrease.
    Gauge devicesConnected =
        Gauge.builder()
            .name("devices_connected")
            .help("Number of smart home devices currently connected")
            .labelNames("device_type")
            .register();

    // Increment when a device connects, decrement when it disconnects.
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("lock").inc();
    devicesConnected.labelValues("lock").dec();
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelUpDownCounter.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongUpDownCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounter {
  // Preallocate attribute keys and, when values are static, entire Attributes objects.
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    LongUpDownCounter devicesConnected =
        meter
            .upDownCounterBuilder("devices.connected")
            .setDescription("Number of smart home devices currently connected")
            .build();

    // add() accepts positive and negative values.
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, LOCK);
    devicesConnected.add(-1, LOCK);
  }
}
```
<!-- prettier-ignore-end -->

Key differences:

- `inc()` / `dec()` → `add(1)` / `add(-1)`. `add()` accepts both positive and negative values.
- The Prometheus type is `Gauge`; the OpenTelemetry type is `LongUpDownCounter` (or
  `DoubleUpDownCounter` via `.ofDoubles()`).

{{% /tab %}} {{< /tabpane >}}

### Callback (async) gauge — incremental value

Use a callback gauge (an asynchronous up-down counter in OpenTelemetry) when a count that
would otherwise be tracked with `inc()`/`dec()` is maintained externally — such as by a device
manager or connection pool — and you want to observe it at collection time. Choose this over
the absolute-value variant when the value is **additive**: summing it across multiple instances
is meaningful. Connected device counts, for example, can be summed across service instances to
get a useful total. See the
[instrument selection guide](/docs/specs/otel/metrics/supplementary-guidelines/#instrument-selection)
for a fuller explanation of the additive vs. non-additive distinction.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounterCallback.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusUpDownCounterCallback {
  public static void upDownCounterCallbackUsage() {
    // The device manager maintains the count of connected devices.
    // Use a callback gauge to report that value at scrape time.
    GaugeWithCallback.builder()
        .name("devices_connected")
        .help("Number of smart home devices currently connected")
        .labelNames("device_type")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.connectedDeviceCount("thermostat"), "thermostat");
              callback.call(SmartHomeDevices.connectedDeviceCount("lock"), "lock");
            })
        .register();
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelUpDownCounterCallback.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounterCallback {
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // The device manager maintains the count of connected devices.
    // Use an asynchronous up-down counter to report that value when a MetricReader
    // collects metrics.
    meter
        .upDownCounterBuilder("devices.connected")
        .setDescription("Number of smart home devices currently connected")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.connectedDeviceCount("thermostat"), THERMOSTAT);
              measurement.record(SmartHomeDevices.connectedDeviceCount("lock"), LOCK);
            });
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

## Histogram {#histogram}

A histogram records the distribution of a set of measurements, tracking the count of
observations, their sum, and the number that fall within configurable bucket boundaries.

Both Prometheus and OpenTelemetry support classic (explicit-bucket) histograms and native (base2 exponential) histograms.
Prometheus also has a `Summary` type, which has no direct OTel equivalent — see
[Summary](#summary) below.

Prometheus `Histogram` maps to the OpenTelemetry `Histogram` instrument.

### Classic (explicit) histogram

- **Bucket configuration**: Prometheus declares bucket boundaries on the instrument itself via
  `classicUpperBounds()`. In OpenTelemetry, `setExplicitBucketBoundariesAdvice()` sets default
  boundaries on the instrument as a hint, but they can be overridden or replaced by views
  configured at the SDK level. This separation keeps instrumentation code independent of
  collection configuration.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusHistogram.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogram {
  public static void histogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .classicUpperBounds(0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelHistogram.java"?>
```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;
import java.util.List;

public class OtelHistogram {
  // Preallocate attribute keys and, when values are static, entire Attributes objects.
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void histogramUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // setExplicitBucketBoundariesAdvice() sets default boundaries as a hint to the SDK.
    // Views configured at the SDK level take precedence over this advice.
    DoubleHistogram deviceCommandDuration =
        meter
            .histogramBuilder("device.command.duration")
            .setDescription("Time to receive acknowledgment from a smart home device")
            .setUnit("s")
            .setExplicitBucketBoundariesAdvice(List.of(0.1, 0.25, 0.5, 1.0, 2.5, 5.0))
            .build();

    deviceCommandDuration.record(0.35, THERMOSTAT);
    deviceCommandDuration.record(0.85, LOCK);
  }
}
```
<!-- prettier-ignore-end -->

Key differences:

- `observe(value)` → `record(value, attributes)`.
- OpenTelemetry distinguishes `LongHistogram` (integers, via `.ofLongs()`) from `DoubleHistogram`
  (the default). Prometheus uses a single `Histogram` type.
- Preallocate `AttributeKey` instances (always) and `Attributes` objects (when values are
  static) to avoid per-call allocation on the hot path.
- SDK views can override the bucket boundaries set by `setExplicitBucketBoundariesAdvice()` —
  for example, to enforce different boundaries for a specific instrument:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelHistogramExplicitBucketView.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.View;
import java.util.List;

public class OtelHistogramExplicitBucketView {
  static SdkMeterProvider createMeterProvider() {
    // Override the bucket boundaries advised on the instrument for a specific histogram.
    return SdkMeterProvider.builder()
        .registerView(
            InstrumentSelector.builder().setName("device.command.duration").build(),
            View.builder()
                .setAggregation(
                    Aggregation.explicitBucketHistogram(List.of(0.1, 0.25, 0.5, 1.0, 2.5, 5.0)))
                .build())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

### Native (base2 exponential) histogram

Both systems support native (base2 exponential) histograms, which automatically adjust bucket
boundaries to cover the observed range without requiring manual configuration.

- **Format selection**: Prometheus selects the native histogram format at instrument creation time
  via `.nativeOnly()`. In OpenTelemetry, format selection is configured outside instrumentation
  code — on the exporter or via a view — so instrumentation code requires no changes.
- **Instrumentation code**: The OpenTelemetry instrumentation code is identical for classic and
  native histograms. The same `record()` calls produce either format depending on how the SDK is
  configured.

{{< tabpane text=true >}} {{% tab Java %}}

**Prometheus**

In Prometheus, the native histogram format is enabled at instrument creation time:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusHistogramNative.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogramNative {
  public static void nativeHistogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .nativeOnly()
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```
<!-- prettier-ignore-end -->

**OpenTelemetry**

In OpenTelemetry, the instrumentation code is identical to the classic (explicit) histogram
case. The base2 exponential format is configured separately, outside the instrumentation layer.

The preferred approach is to configure it on the metric exporter. This applies to all
histograms exported through that exporter without touching instrumentation code:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialExporter.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;

public class OtelHistogramExponentialExporter {
  static OtlpHttpMetricExporter createExporter() {
    // Configure the exporter to use exponential histograms for all histogram instruments.
    // This is the preferred approach — it applies globally without modifying instrumentation code.
    return OtlpHttpMetricExporter.builder()
        .setEndpoint("http://localhost:4318")
        .setDefaultAggregationSelector(
            type ->
                type == InstrumentType.HISTOGRAM
                    ? Aggregation.base2ExponentialBucketHistogram()
                    : Aggregation.defaultAggregation())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

For more granular control — for example, to use base2 exponential histograms for specific
instruments while keeping explicit buckets for others — configure a view instead:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialView.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.View;

public class OtelHistogramExponentialView {
  static SdkMeterProvider createMeterProvider() {
    // Use a view for per-instrument control — select a specific instrument by name
    // to use exponential histograms while keeping explicit buckets for others.
    return SdkMeterProvider.builder()
        .registerView(
            InstrumentSelector.builder().setName("device.command.duration").build(),
            View.builder().setAggregation(Aggregation.base2ExponentialBucketHistogram()).build())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

{{% /tab %}} {{< /tabpane >}}

### Summary {#summary}

Prometheus `Summary` computes quantiles client-side at scrape time and exposes them as labeled
time series (for example, `{quantile="0.95"}`). OpenTelemetry has no direct equivalent.

For migrating away from `Summary`:

- **Quantile estimation**: Switch to a `Histogram` with bucket boundaries that cover the range
  of values you care about. Quantiles can then be computed at query time — for example, with
  `histogram_quantile()` in PromQL. Unlike `Summary`, histogram-based quantiles can be
  aggregated across instances.
- **SLO compliance**: If you only need to know what fraction of observations fall below a
  specific threshold, use a histogram with a single bucket at that threshold. The bucket count
  directly expresses compliance against the threshold.

{{< tabpane text=true >}} {{% tab Java %}}

A typical Prometheus `Summary` recording client-side quantiles:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/PrometheusSummary.java"?>
```java
package otel;

import io.prometheus.metrics.core.metrics.Summary;

public class PrometheusSummary {
  public static void summaryUsage() {
    Summary deviceCommandDuration =
        Summary.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .quantile(0.5, 0.05)
            .quantile(0.95, 0.01)
            .quantile(0.99, 0.001)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```
<!-- prettier-ignore-end -->

In OpenTelemetry, replace this with a histogram instrument using bucket boundaries that bracket
your quantile thresholds. Quantiles are computed at query time rather than in the client.

{{% /tab %}} {{< /tabpane >}}

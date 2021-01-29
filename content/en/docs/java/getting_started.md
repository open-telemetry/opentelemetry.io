---
title: "Getting Started"
weight: 2
---

## Automatic Instrumentation

> Automatic instrumentation is applicable to trace data only today.

Download the [latest version](/docs/java/#releases-1). This package includes
the instrumentation agent, instrumentations for all supported libraries and all
available data exporters.

The instrumentation agent is enabled by passing the `-javaagent` flag to the JVM.

```java
java -javaagent:path/to/opentelemetry-javaagent-all.jar \
     -jar myapp.jar
```

By default OpenTelemetry Java agent uses the [OTLP
exporter](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/otlp)
configured to send data to a local [OpenTelemetry
Collector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md)
at `localhost:55680`.

Configuration parameters are passed as Java system properties (`-D` flags) or as
environment variables. For example:

```java
java -javaagent:path/to/opentelemetry-javaagent-all.jar \
     -Dotel.exporter=zipkin \
     -jar myapp.jar
```

An exporter jar can be specified via the `otel.exporter.jar` system property:

```java
java -javaagent:path/to/opentelemetry-javaagent-all.jar \
     -Dotel.exporter.jar=path/to/external-exporter.jar \
     -jar myapp.jar
```

For additional information, see the [Automatic Instrumentation documentation](/docs/java/automatic_instrumentation).

## Manual Instrumentation

### Traces

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import io.opentelemetry.exporter.otlp.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;

public class DoWork {

  // Instantiate a tracer
  Tracer tracer =
      OpenTelemetry.getGlobalTracer("io.opentelemetry.example.dowork");

  // Configure the SDK with batch processor and OTLP gRPC exporter
  OtlpGrpcSpanExporter spanExporter = OtlpGrpcSpanExporter.getDefault();
  BatchSpanProcessor spanProcessor =
      BatchSpanProcessor.builder(spanExporter).setScheduleDelayMillis(100).build();
  OpenTelemetrySdk.getGlobalTracerManagement().addSpanProcessor(spanProcessor);

  for (int i = 0; i < 10; i++) {
    // Start a span with scope
    Span exampleSpan = tracer.spanBuilder("exampleSpan").startSpan();
    try (Scope scope = exampleSpan.makeCurrent()) {
      // Add attributes
      exampleSpan.setAttribute("good", "true");
      exampleSpan.setAttribute("exampleNumber", i);
      Thread.sleep(100);
    } finally {
      // End span
      exampleSpan.end();
    }
  }
}
```

For more detailed information, see the [Manual Instrumentation documentation](/docs/java/manual_instrumentation/#traces).

#### Example

Several
[examples](https://github.com/open-telemetry/opentelemetry-java/tree/main/examples)
are provided to get started. The [HTTP
example](https://github.com/open-telemetry/opentelemetry-java/tree/main/examples/http)
demonstrates how to manually instrument a simple HTTP based Client/Server
application. The example creates a root span on the client and sends the
context over the HTTP request. On the server side, the example shows how to
extract the context and create a child span with an attached span event.
All generated data is logged locally.

To get started, perform the following steps::

1. Clone the repository
2. Change into the example directory
3. Compile the code
4. Start the server
5. Start the client

```bash
git clone git@github.com:open-telemetry/opentelemetry-java.git
cd opentelemetry-java/examples/http
../gradlew fatJar
java -cp ./build/libs/opentelemetry-examples-http-all-0.1.0-SNAPSHOT.jar io.opentelemetry.example.http.HttpServer
java -cp ./build/libs/opentelemetry-examples-http-all-0.1.0-SNAPSHOT.jar io.opentelemetry.example.http.HttpClient
```

### Metrics

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.context.Scope;
import io.opentelemetry.exporter.otlp.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.export.IntervalMetricReader;

public class DoWork {

  // Instantiate a meter
  Meter meter =
      OpenTelemetry.getGlobalMeter("io.opentelemetry.example.dowork");

  // Configure the SDK with OTLP gRPC exporter
  OtlpGrpcMetricExporter metricExporter = OtlpGrpcMetricExporter.getDefault();
  IntervalMetricReader intervalMetricReader =
      IntervalMetricReader.builder()
          .setMetricExporter(metricExporter)
          .setMetricProducers(
              Collections.singleton(
                  OpenTelemetrySdk.getGlobalMeterProvider().getMetricProducer()))
          .setExportIntervalMillis(500)
          .build();

  for (int i = 0; i < 10; i++) {
    // Create a metric
    counter.add(1);
  }

}
```

For more detailed information, see the [Manual Instrumentation documentation](/docs/java/manual_instrumentation/#metrics).

#### Example

Several
[examples](https://github.com/open-telemetry/opentelemetry-java/tree/main/examples)
are provided to get started. The [metrics
examples](https://github.com/open-telemetry/opentelemetry-java/tree/main/examples/metrics)
demonstrates how to generate other types of metrics.

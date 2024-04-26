---
title: Exporters
weight: 50
cSpell:ignore: okhttp
---

{{% docs/languages/exporters/intro java %}}

### Dependencies {#otlp-dependencies}

If you want to send telemetry data to an OTLP endpoint (like the
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) or
[Prometheus](#prometheus)), there are multiple OTLP options available, each
catering to different use cases. For most users, the default artifact will
suffice and be the most simple:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}'
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-otlp</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{< /tab >}} {{< /tabpane>}}

Under the hood, there are two protocol options supported, each with different
"sender" implementations.

- `grpc` - gRPC implementation of OTLP exporters, represented by
  `OtlpGrpcSpanExporter`, `OtlpGrpcMetricExporter`, `OtlpGrpcLogRecordExporter`.
- `http/protobuf` - HTTP with protobuf encoded payload implementation of OTLP
  exporters, represented by `OtlpHttpSpanExporter`, `OtlpHttpMetricExporter`,
  `OtlpHttpLogRecordExporter`.

A sender is an abstraction which allows different gRPC / HTTP client
implementations to fulfill the OTLP contract. Regardless of the sender
implementation, the same exporter classes are used. A sender implementation is
automatically used when it is detected on the classpath. The sender
implementations are described in detail below:

- `{groupId}:{artifactId}` - Sender description.
- `io.opentelemetry:opentelemetry-exporter-sender-okhttp` - The default sender,
  included automatically with `opentelemetry-exporter-otlp` and bundled with the
  OpenTelemetry Java agent. This includes an
  [OkHttp](https://square.github.io/okhttp/) based implementation for both the
  `grpc` and `http/protobuf` versions of the protocol, and will be suitable for
  most users. However, OkHttp has a transitive dependency on kotlin which is
  problematic in some environments.
- `io.opentelemetry:opentelemetry-exporter-sender-jdk` - This sender includes a
  JDK 11+
  [HttpClient](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html)
  based implementation for the `http/protobuf` version of the protocol. It
  requires zero additional dependencies, but requires Java 11+. To use, include
  the artifact and explicitly exclude the default
  `io.opentelemetry:opentelemetry-exporter-sender-okhttp` dependency.
- `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel` - This
  sender includes a [grpc-java](https://github.com/grpc/grpc-java) based
  implementation for the `grpc` version of the protocol. To use, include the
  artifact, explicitly exclude the default
  `io.opentelemetry:opentelemetry-exporter-sender-okhttp` dependency, and
  include one of the
  [gRPC transport implementations](https://github.com/grpc/grpc-java#transport).

### Usage

Next, configure the exporter to point at an OTLP endpoint.

If you use
[SDK autoconfiguration](/docs/languages/java/instrumentation/#automatic-configuration)
all you need to do is update your environment variables:

```shell
env OTEL_EXPORTER_OTLP_ENDPOINT=http://example:4317 java -jar ./build/libs/java-simple.jar
```

Note, that in the case of exporting via OTLP you do not need to set
`OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` since
`otlp` is their default value

In the case of [manual configuration] you can update the
[example app](/docs/languages/java/instrumentation#example-app) like the
following:

```java { hl_lines=["12-14",21,"39-53"] }
package otel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.Banner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.semconv.ServiceAttributes;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }

  @Bean
  public OpenTelemetry openTelemetry() {
    Resource resource = Resource.getDefault().toBuilder().put(ServiceAttributes.SERVICE_NAME, "dice-server").put(ServiceAttributes.SERVICE_VERSION, "0.1.0").build();

    SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
            .addSpanProcessor(BatchSpanProcessor.builder(OtlpGrpcSpanExporter.builder().build()).build())
            .setResource(resource)
            .build();

    SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
            .registerMetricReader(PeriodicMetricReader.builder(OtlpGrpcMetricExporter.builder().build()).build())
            .setResource(resource)
            .build();

    SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
            .addLogRecordProcessor(
                    BatchLogRecordProcessor.builder(OtlpGrpcLogRecordExporter.builder().build()).build())
            .setResource(resource)
            .build();

    OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
        .setTracerProvider(sdkTracerProvider)
        .setMeterProvider(sdkMeterProvider)
        .setLoggerProvider(sdkLoggerProvider)
        .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
        .buildAndRegisterGlobal();

    return openTelemetry;
  }
}
```

## Console

To debug your instrumentation or see the values locally in development, you can
use exporters writing telemetry data to the console (stdout).

If you followed the [Getting Started](/docs/languages/java/getting-started/) or
[Manual Instrumentation](/docs/languages/java/instrumentation/) guides, you
already have the console exporter installed.

The `LoggingSpanExporter`, the `LoggingMetricExporter` and the
`SystemOutLogRecordExporter` are included in the
`opentelemetry-exporter-logging` artifact.

If you use
[SDK autoconfiguration](/docs/languages/java/instrumentation/#automatic-configuration)
all you need to do is update your environment variables:

```shell
env OTEL_TRACES_EXPORTER=logging OTEL_METRICS_EXPORTER=logging OTEL_LOGS_EXPORTER=logging  java -jar ./build/libs/java-simple.jar
```

{{% docs/languages/exporters/jaeger %}}

{{% docs/languages/exporters/prometheus-setup %}}

### Dependencies {#prometheus-dependencies}

Install the
[`opentelemetry-exporter-prometheus`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-exporter-prometheus/latest)
artifact as a dependency for your application:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
    implementation 'io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha'
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-prometheus</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{< /tab >}} {{< /tabpane>}}

Update your OpenTelemetry configuration to use the exporter and to send data to
your Prometheus backend:

```java
import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;

int prometheusPort = 9464;
SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
        .registerMetricReader(PrometheusHttpServer.builder().setPort(prometheusPort).build())
        .setResource(resource)
        .build();
```

With the above you can access your metrics at <http://localhost:9464/metrics>.
Prometheus or an OpenTelemetry Collector with the Prometheus receiver can scrape
the metrics from this endpoint.

{{% docs/languages/exporters/zipkin-setup %}}

### Dependencies {#zipkin-dependencies}

To send your trace data to [Zipkin](https://zipkin.io/), you can use the
`ZipkinSpanExporter`.

Install the
[`opentelemetry-exporter-zipkin`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-exporter-zipkin/latest)
artifact as a dependency for your application:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
    implementation 'io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}-alpha'
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-zipkin</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{< /tab >}} {{< /tabpane>}}

Update your OpenTelemetry configuration to use the exporter and to send data to
your Zipkin backend:

```java
import io.opentelemetry.exporter.zipkin.ZipkinSpanExporter;

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(BatchSpanProcessor.builder(ZipkinSpanExporter.builder().setEndpoint("http://localhost:9411/api/v2/spans").build()).build())
        .setResource(resource)
        .build();
```

{{% docs/languages/exporters/outro java "https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html" %}}

{{< tabpane text=true >}} {{% tab Batch %}}

```java
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(BatchSpanProcessor.builder(...).build())
        .setResource(resource)
        .build();

SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
        .addLogRecordProcessor(
                BatchLogRecordProcessor.builder(...).build())
        .setResource(resource)
        .build();
```

{{% /tab %}} {{% tab Simple %}}

```java
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.logs.export.SimpleLogRecordProcessor;

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(SimpleSpanProcessor.builder(...).build())
        .setResource(resource)
        .build();

SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
        .addLogRecordProcessor(
                SimpleLogRecordProcessor.builder(...).build())
        .setResource(resource)
        .build();
```

{{< /tab >}} {{< /tabpane>}}

{{% /docs/languages/exporters/outro %}}

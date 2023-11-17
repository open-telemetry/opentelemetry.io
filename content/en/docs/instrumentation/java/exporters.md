---
title: Exporters
weight: 50
cSpell:ignore: autoconfigure classpath okhttp springframework
---

{{% docs/instrumentation/exporters-intro java %}}

{{% alert title="Note" color="info" %}}

If you use the Java agent for
[automatic instrumentation](/docs/instrumentation/java/automatic) you can learn
how to setup exporters following the
[Agent Configuration Guide](/docs/instrumentation/java/automatic/agent-config)

{{% /alert %}}

## OTLP

### Collector Setup

{{% alert title="Note" color="info" %}}

If you have a OTLP collector or backend already set up, you can skip this
section and [setup the OTLP exporter dependencies](#otlp-dependencies) for your
application.

{{% /alert %}}

To try out and verify your OTLP exporters, you can run the collector in a docker
container that writes telemetry directly to the console.

In an empty directory, create a file called `collector-config.yaml` with the
following content:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run the collector in a docker container:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

This collector is now able to accept telemetry via OTLP. Later you may want to
[configure the collector](/docs/collector/configuration) to send your telemetry
to your observability backend.

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
[SDK auto-configuration](/docs/instrumentation/java/manual/#automatic-configuration)
all you need to do is update your environment variables:

```shell
env OTEL_EXPORTER_OTLP_ENDPOINT=http://example:4317 java -jar ./build/libs/java-simple.jar
```

Note, that in the case of exporting via OTLP you do not need to set
`OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` since
`otlp` is their default value

In the case of [manual configuration] you can update the
[example app](/docs/instrumentation/java/manual#example-app) like the following:

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
import io.opentelemetry.semconv.resource.attributes.ResourceAttributes;

@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }

  @Bean
  public OpenTelemetry openTelemetry() {
    Resource resource = Resource.getDefault().toBuilder().put(SERVICE_NAME, "dice-server").put(SERVICE_VERSION, "0.1.0").build();

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

If you followed the
[Getting Started](/docs/instrumentation/java/getting-started/) or
[Manual Instrumentation](/docs/instrumentation/java/manual/) guides, you already
have the console exporter installed.

The `LoggingSpanExporter`, the `LoggingMetricExporter` and the
`SystemOutLogRecordExporter` are included in the
`opentelemetry-exporter-logging` artifact.

## Jaeger

[Jaeger](https://www.jaegertracing.io/) natively supports OTLP to receive trace
data. You can run Jaeger in a docker container with the UI accessible on port
16686 and OTLP enabled on ports 4137 and 4138:

```shell
docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Now following the instruction to setup the [OTLP exporters](#otlp-dependencies).

## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either
[enable Prometheus' OTLP Receiver](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)
and use the [OTLP exporter](#otlp) or you can use the `PrometheusExporter`.

### Backend Setup {#prometheus-setup}

{{% alert title="Note" color="info" %}}

If you have Prometheus or a Prometheus-compatible backend already set up, you
can skip this section and setup the [Prometheus](#prometheus-dependencies) or
[OTLP](#otlp-dependencies) exporter dependencies for your application.

{{% /alert %}}

You can run [Prometheus](https://prometheus.io) in a docker container,
accessible on port `9090` by following these instructions:

Create a file called `prometheus.yml` with the following content:

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

Run Prometheus in a docker container with the UI accessible on port `9090`:

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title="Note" color="info" %}}

When using Prometheus' OTLP Receiver, make sure that you set the OTLP endpoint
for metrics in your application to `http://localhost:9090/api/v1/otlp`.

Not all docker environments support `host.docker.internal`. In some cases you
may need to replace `host.docker.internal` with `localhost` or the IP address of
your machine.

{{% /alert %}}

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

## Zipkin

### Backend Setup {#zipkin-setup}

{{% alert title="Note" color="info" %}}

If you have Zipkin or a Zipkin-compatible backend already set up, you can skip
this section and setup the [Zipkin exporter dependencies](#zipkin-dependencies)
for your application.

{{% /alert %}}

You can run [Zipkin](https://zipkin.io/) on ina Docker container by executing
the following command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

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
        .addSpanProcessor(BatchSpanProcessor.builder(OZipkinSpanExporter.builder().setEndpoint("http://localhost:9411/api/v2/spans").build()).build())
        .setResource(resource)
        .build();
```

## Other available exporters

There are many other exporters available. For a list of available exporters, see
the [registry](/ecosystem/registry/?component=exporter&language=java).

Finally, you can also write your own exporter. For more information, see the
[SpanExporter Interface in the API documentation](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html).

## Batching spans and log records

For traces the OpenTelemetry SDK provides a set of default span and log record
processors, that allow you to either emit them one-by-one ("simple") or batched:

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

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

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use `opentelemetry-exporter-otlp`.

### OTLP Artifacts

There are multiple OTLP options available, each catering to different use cases.
For most users, the default artifact will suffice and be the most simple:

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

To see the traces exported quickly, you can run Jaeger with OTLP enabled in a
docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

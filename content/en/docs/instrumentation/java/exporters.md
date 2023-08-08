---
title: Exporters
weight: 50
---

In order to visualize and analyze your traces, you will need to export them to a
backend such as [Jaeger](https://www.jaegertracing.io/) or
[Zipkin](https://zipkin.io/). OpenTelemetry Java provides exporters for some
common open source backends.

If you use the Javaagent for
[automatic instrumentation](/docs/instrumentation/java/automatic) you can learn
how to setup exporters following the
[Agent Configuration Guide](/docs/instrumentation/java/automatic/agent-config)

For [manual instrumentation](/docs/instrumentation/java/manual), you will find
some introductions below on how to set up backends and the matching exporters.

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use `opentelemetry-exporter-otlp`:

<!-- prettier-ignore-start -->

{{< tabpane text=true >}}
{{% tab Gradle %}}

```kotlin
dependencies {
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:{{% param javaVersion %}}'
}
```

{{% /tab %}}
{{% tab Maven %}}

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

{{< /tab >}}
{{< /tabpane>}}

Next, configure the exporter to point at an OTLP endpoint.

If you use [SDK auto-configuration](/docs/instrumentation/java/manual/#automatic-configuration)
all you need to do is update your environment variables:

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_METRICS_EXPORTER=otlp OTEL_LOGS_EXPORTER=otlp java -jar ./build/libs/java-simple.jar
```

In the case of [manual configuration] you can update the [example app](/docs/instrumentation/java/manual#example-app) like the
following:

<!-- prettier-ignore-end -->

```java
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;

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
```

To try out the exporters quickly, you can run Jaeger with OTLP enabled in a
docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
---

When you develop an app, you use third-party libraries and frameworks to
accelerate your work and avoid duplicated efforts. If you instrument your
app with OpenTelemetry, you don't want to spend additional time on manually
adding traces, logs, and metrics to those libraries and frameworks. 

Use libraries that come withOpenTelemetry support natively or an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/)
to generate telemetry data for a library or framework.

The Java agent for automatic instrumentation includes instrumentation
libraries for many common Java frameworks. All instrumentations are
turned on by default. If you need to turn off certain instrumentation libraries,
you can [suppress them](../automatic/agent-config/#suppressing-specific-auto-instrumentation).

If you use [manual instrumentation](../manual) for your code, you can still
leverage instrumentation libraries for your dependencies. For example, if
you use [Java gRPC 1.6](https://grpc.io/docs/languages/java/), add the
following dependency:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
    implementation("io.opentelemetry.instrumentation:opentelemetry-grpc-1.6");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependency>
        <groupId>io.opentelemetry.instrumentation</groupId>
        <artifactId>opentelemetry-grpc-1.6</artifactId>
</dependency>
</project>
```

{{< /tab >}} {{< /tabpane>}}

_tbd_

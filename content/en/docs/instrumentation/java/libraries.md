---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
---

When you develop an app, you make use of third-party libraries and frameworks to
accelerate your work and to not reinvent the wheel. If you now instrument your
app with OpenTelemetry, you don't want to spend additional time on manually
adding traces, logs and metrics to those libraries and frameworks. Fortunately,
you don't have to reinvent the wheel for those either: libraries might come with
OpenTelemetry support natively or you can use an
[Instrumentation Library](/docs/concepts/instrumentation/libraries/) in order to
generate telemetry data for a library or framework.

The Java agent for automatic instrumentation is shipped with instrumentation
libraries for many common Java frameworks and all of them are turned on by
default, making it easy for you to get started and see a lot of telemetry out of
the box. If you require to disable certain instrumentation libraries, you can
[suppress them](../automatic/agent-config/#suppressing-specific-auto-instrumentation).

If you use [manual instrumentation](../manual) for your code, you can still
leverage instrumentation libraries for your dependencies.

For example, if you use [Java gRPC 1.6](https://grpc.io/docs/languages/java/)
add the following dependency:

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

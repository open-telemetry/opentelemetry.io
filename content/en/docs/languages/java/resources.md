---
title: Resources
weight: 70
cSpell:ignore: getenv myhost SIGINT uuidgen WORKDIR
---

{{% docs/languages/resources-intro %}}

If you use the Java agent for
[zero-code instrumentation](/docs/zero-code/java/agent/) you can setup resource
detection through
[agent configuration](/docs/zero-code/java/agent/configuration).

For manual instrumentation, you will find some introductions on how to set up
resource detection below.

## Detecting resources from common environments

You can use `ResourceProvider`s for filling in attributes related to common
environments, like [Container](/docs/specs/semconv/resource/container/),
[Host](/docs/specs/semconv/resource/host/) or
[Operating System](/docs/specs/semconv/resource/os/). These can be used with or
without
[autoconfiguration](/docs/languages/java/instrumentation/#automatic-configuration).

To use those providers, add the following dependency:

{{< tabpane text=true >}} {{% tab Gradle %}}

```kotlin
dependencies {
    implementation("io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.otel %}}-alpha");
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-resources</artifactId>
        </dependency>
    </dependencies>
</project>
```

{{< /tab >}} {{< /tabpane>}}

Next you can use them like the following in your code:

```java
import io.opentelemetry.instrumentation.resources.ContainerResource;
import io.opentelemetry.instrumentation.resources.HostResource;
import io.opentelemetry.instrumentation.resources.OsResource;
import io.opentelemetry.instrumentation.resources.ProcessResource;
import io.opentelemetry.instrumentation.resources.ProcessRuntimeResource;

...
    Resource resource = Resource.getDefault()
      .merge(ContainerResource.get())
      .merge(HostResource.get())
      .merge(OsResource.get())
      .merge(ProcessResource.get())
      .merge(ProcessRuntimeResource.get())
      .merge(Resource.create(Attributes.builder()
        .put(ResourceAttributes.SERVICE_NAME, "dice-service")
        ...
        .build()));
...
```

## Adding resources in code

Custom resources can be configured in your code like the following:

```java
Resource resource = Resource.getDefault()
    .merge(Resource.create(Attributes.builder()
        .put(ResourceAttributes.SERVICE_NAME, "dice-service")
        .put(ResourceAttributes.SERVICE_VERSION, "0.1.0")
        .put(ResourceAttributes.SERVICE_INSTANCE_ID, "dice-service-1")
        .put(ResourceAttributes.HOST_NAME, System.getenv("HOSTNAME"))
        .put(ResourceAttributes.PROCESS_PID, ProcessHandle.current().pid())
        .build()));

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
    .setResource(resource)
    ...
    .build();

SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
    .setResource(resource)
    ...
    .build();

SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
    .setResource(resource)
    ...
    .build();
```

## Next steps

Besides the
[Standard OpenTelemetry Resource Providers](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
shown in the samples above, there are more resource providers that you can add
to your configuration. These include:

- [AWS Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources)
- [GCP Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources)
- [OpenTelemetry Contributed Resource Providers](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/resource-providers)
- [Spring-Boot Resource Provider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-boot-resources)

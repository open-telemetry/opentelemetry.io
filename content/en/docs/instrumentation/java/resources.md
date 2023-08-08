---
title: Resources
weight: 70
cSpell:ignore: getenv myhost SIGINT uuidgen WORKDIR
---

A [resource](/docs/specs/otel/resource/sdk/) represents the entity producing
telemetry as resource attributes. For example, a process producing telemetry
that is running in a container on Kubernetes has a Pod name, a namespace, and
possibly a deployment name. All three of these attributes can be included in the
resource.

In your observability backend, you can use resource information to better
investigate interesting behavior. For example, if your trace or metrics data
indicate latency in your system, you can narrow it down to a specific container,
pod, or Kubernetes deployment.

If you use the Javaagent for
[automatic instrumentation](/docs/instrumentation/java/automatic) you can learn
how to setup resource detection following the [Agent Configuration
Guide]/docs/instrumentation/java/automatic/agent-config)

For manual instrumentation, you will find some introductions on how to set up
resource detection below.

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

    Resource resource = Resource.getDefault()
        .merge(Resource.create(attributes));

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

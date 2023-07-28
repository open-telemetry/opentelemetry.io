---
title: Injecting Auto-instrumentation
linkTitle: Auto-instrumentation
weight: 11
description:
  An implementation of auto-instrumentation using the OpenTelemetry Operator.
# prettier-ignore
cSpell:ignore: autoinstrumentation GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver REDISCALA
---

The OpenTelemetry Operator supports injecting and configuring
auto-instrumentation libraries for .NET, Java, Node.js and Python services.

## Installation

First, install the
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
into your cluster.

You can do this with the
[Operator release manifest](https://github.com/open-telemetry/opentelemetry-operator#getting-started),
the
[Operator helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart),
or with [Operator Hub](https://operatorhub.io/operator/opentelemetry-operator).

In most cases, you will need to install
[cert-manager](https://cert-manager.io/docs/installation/). If you use the helm
chart, there is an option to generate a self-signed cert instead.

## Create an OpenTelemetry Collector (Optional)

It is a best practice to send telemetry from containers to an
[OpenTelemetry Collector](../../collector/) instead of directly to a backend.
The Collector helps simplify secret management, decouples data export problems
(such as a need to do retries) from your apps, and lets you add additional data
to your telemetry, such as with the
[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)
component. If you chose not to use a Collector, you can skip to the next
section.

The Operator provides a
[Custom Resource Definition (CRD) for the OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector)
which is used to create an instance of the Collector that the Operator manages.
The following example deploys the Collector as a deployment (the default), but
there are other
[deployment modes](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes)
that can be used.

When using the `Deployment` mode the operator will also create a Service that
can be used to interact with the Collector. The name of the service is the name
of the `OpenTelemetryCollector` resource prepended to `-collector`. For our
example that will be `demo-collector`.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
          http:
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
      logging:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [logging]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [logging]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [logging]
EOF
```

The above command results in a deployment of the Collector that you can use as
an endpoint for auto-instrumentation in your pods.

## Configure Automatic Instrumentation

To be able to manage automatic instrumentation, the Operator needs to be
configured to know what pods to instrument and which automatic instrumentation
to use for those pods. This is done via the
[Instrumentation CRD](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentation).

Creating the Instrumentation resource correctly is paramount to getting
auto-instrumentation working. Making sure all endpoints and env vars are correct
is required for auto-instrumentation to work properly.

### .NET

The following command will create a basic Instrumentation resource that is
configured specifically for instrumenting .NET services.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

By default, the Instrumentation resource that auto-instruments .NET services
uses `otlp` with the `http/protobuf` protocol. This means that the configured
endpoint must be able to receive OTLP over `http/protobuf`. Therefore, the
example uses `http://demo-collector:4318`, which will connect to the `http` port
of the `otlpreceiver` of the Collector created in the previous step.

By default, the .NET auto-instrumentation ships with
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations).
This makes instrumentation easy, but could result in too much or unwanted data.
If there are any libraries you do not want to use you can set the
`OTEL_DOTNET_AUTO_[SIGNAL]_[NAME]_INSTRUMENTATION_ENABLED=false` where
`[SIGNAL]` is the type of the signal and `[NAME]` is the case-sensitive name of
the library.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  dotnet:
    env:
      - name: OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_ENABLED
        value: false
      - name: OTEL_DOTNET_AUTO_METRICS_PROCESS_INSTRUMENTATION_ENABLED
        value: false
```

For more details, see
[.NET Auto Instrumentation docs](/docs/instrumentation/net/automatic/).

### Java

The following command creates a basic Instrumentation resource that is
configured for instrumenting Java services.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

By default, the Instrumentation resource that auto-instruments Java services
uses `otlp` with the `grpc` protocol. This means that the configured endpoint
must be able to receive OTLP over `grpc`. Therefore, the example uses
`http://demo-collector:4317`, which connects to the `grpc` port of the
otlpreceiver of the Collector created in the previous step.

By default, the Java auto-instrumentation ships with
[many instrumentation libraries](/docs/instrumentation/java/automatic/#supported-libraries-frameworks-application-services-and-jvms).
This makes instrumentation easy, but could result in too much or unwanted data.
If there are any libraries you do not want to use you can set the
`OTEL_INSTRUMENTATION_[NAME]_ENABLED=false` where `[NAME]` is the name of the
library. If you know exactly which libraries you want to use, you can disable
the default libraries by setting
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false` and then use
`OTEL_INSTRUMENTATION_[NAME]_ENABLED=true` where `[NAME]` is the name of the
library. For more details, see
[Suppressing specific auto-instrumentation](/docs/instrumentation/java/automatic/agent-config/#suppressing-specific-auto-instrumentation).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

For more details, see
[Java Agent Configuration](/docs/instrumentation/java/automatic/agent-config/).

### Node.js

The following command creates a basic Instrumentation resource that is
configured for instrumenting Node.js services.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

By default, the Instrumentation resource that auto-instruments Node.js services
uses `otlp` with the `grpc` protocol. This means that the configured endpoint
must be able to receive OTLP over `grpc`. Therefore, the example uses
`http://demo-collector:4317`, which connects to the `grpc` port of the
`otlpreceiver` of the Collector created in the previous step.

By default, the Node.js auto-instrumentation ships with
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/metapackages/auto-instrumentations-node/README.md#supported-instrumentations).
At the moment, there is no way to opt-in to only specific packages or disable
specific packages. If you don't want to use a package included by the default
image you must either supply your own image that includes only the packages you
want or use manual instrumentation.

For more details, see
[Node.js auto-instrumentation](/docs/instrumentation/js/libraries/#node-autoinstrumentation-package).

### Python

The following command will create a basic Instrumentation resource that is
configured specifically for instrumenting Python services.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

🚨 By default, the `Instrumentation` resource that auto-instruments Python
services uses `otlp` with the `http/protobuf` protocol (gRPC is not supported at
this time). This means that the configured endpoint must be able to receive OTLP
over `http/protobuf`. Therefore, the example uses `http://demo-collector:4318`,
which will connect to the `http` port of the `otlpreceiver` of the Collector
created in the previous step.

> As of operator v0.67.0, the Instrumentation resource automatically sets
> `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` and `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`
> to `http/protobuf` for Python services. If you use an older version of the
> Operator you **MUST** set these env variables to `http/protobuf`, or python
> auto-instrumentation will not work.

By default the Python auto-instrumentation will detect the packages in your
Python service and instrument anything it can. This makes instrumentation easy,
but can result in too much or unwanted data. If there are any packages you do
not want to instrument, you can set the `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`
environment variable

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
  python:
    env:
      - name: OTEL_PYTHON_DISABLED_INSTRUMENTATIONS
        value:
          <comma-separated list of package names to exclude from
          instrumentation>
```

[See the Python Agent Configuration docs for more details.](/docs/instrumentation/python/automatic/agent-config/#disabling-specific-instrumentations)

---

Now that your Instrumentation object is created, your cluster has the ability to
auto-instrument services and send data to an endpoint. However,
auto-instrumentation with the OpenTelemetry Operator follows an opt-in model. In
order to activate automatic instrumentation, you'll need to add an annotation to
your deployment.

## Add annotations to existing deployments

The final step is to opt in your services to automatic instrumentation. This is
done by updating your service’s `spec.template.metadata.annotations` to include
a language-specific annotation:

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Java: `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js: `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python: `instrumentation.opentelemetry.io/inject-python: "true"`

The possible values for the annotation can be

- `"true"` - to inject `Instrumentation` resource with default name from the
  current namespace.
- `"my-instrumentation"` - to inject `Instrumentation` CR instance with name
  `"my-instrumentation"` in the current namespace.
- `"my-other-namespace/my-instrumentation"` - to inject `Instrumentation` CR
  instance with name `"my-instrumentation"` from another namespace
  `"my-other-namespace"`.
- `"false"` - do not inject

Alternatively, the annotation can be added to a namespace, which will result in
all services in that namespace to opt-in to automatic instrumentation. See the
[Operators auto-instrumentation documentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection)
for more details.

## Troubleshooting

If you run into problems trying to auto-instrument your code, here are a few
things that you can try.

### **1- Did the Instrumentation resource install?**

After installing the `Instrumentation` resource, verify that it installed
correctly by running this command, where `<namespace>` is the namespace in which
the `Instrumentation` resource is deployed:

```
kubectl describe otelinst -n <namespace>
```

Sample output:

```
Name:         python-instrumentation
Namespace:    application
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3
             instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:
               ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha
             instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0
             instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:
               ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
API Version:  opentelemetry.io/v1alpha1
Kind:         Instrumentation
Metadata:
 Creation Timestamp:  2023-07-28T03:42:12Z
 Generation:          1
 Resource Version:    3385
 UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53
Spec:
...
 Exporter:
   Endpoint:  http://otel-collector-collector.opentelemetry.svc.cluster.local:4318
...
 Propagators:
   tracecontext
   baggage
 Python:
   Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0
   Resource Requirements:
     Limits:
       Cpu:     500m
       Memory:  32Mi
     Requests:
       Cpu:     50m
       Memory:  32Mi
 Resource:
 Sampler:
Events:  <none>
```

### **2- Do the OTel Operator logs show any auto-instrumentation errors?**

Check the OTel Operator logs for any errors pertaining to auto-instrumentation
by running this command:

```
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### **3- Were the resources deployed in the right order?**

Order matters! The `Instrumentation` resource needs to be deployed before before
deploying the application, otherwise the auto-instrumentation won’t work.

Recall the auto-instrumentation annotation:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

The above annotation tells the OTel Operator to look for an `Instrumentation`
object in the pod’s namespace. It also tells the Operator to inject Python
auto-instrumentation into the pod.

When the pod starts up, the annotation tells the Operator to look for an
Instrumentation object in the pod’s namespace, and to inject
auto-instrumentation into the pod. It adds an
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
to the application's pod, called `opentelemetry-auto-instrumentation`, which is
then used to injects the auto-instrumentation into the app container.

If the `Instrumentation` resource isn’t present by the time the application is
deployed, however, the init-container can’t be created. Therefore, if the
application is deployed _before_ deploying the `Instrumentation` resource, the
auto-instrumentation will fail.

To make sure that the `opentelemetry-auto-instrumentation` init-container has
started up correctly (or has even started up at all), run the following command:

```
kubectl get events -n <your_app_namespace>
```

Which should output something like this:

```
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

If the output is missing `Created` and/or `Started` entries for
`opentelemetry-auto-instrumentation`, then it means that there is an issue with
your auto-instrumentation. This can be the result of any of the following:

- The `Instrumentation` resource wasn’t installed (or wasn’t installed
  properly).
- The `Instrumentation` resource was installed _after_ the application was
  deployed.
- There’s an error in the auto-instrumentation annotation, or the annotation in
  the wrong spot — see #4 below.

Be sure to check the output of `kubectl get events` for any errors, as these
might help point to the issue.

### **4- Is the auto-instrumentation annotation correct?**

Sometimes auto-instrumentation can fail due to errors in the
auto-instrumentation annotation.

Here are a few things to check for:

- **Is the auto-instrumentation for the right language?** For example, when
  instrumenting a Python application, make sure that the annotation doesn't
  incorrectly say `instrumentation.opentelemetry.io/inject-java: "true"`
  instead.
- **Is the auto-instrumentation annotation in the correct location?** When
  defining a `Deployment`, annotations can be added in one of two locations:
  `spec.metadata.annotations`, and `spec.template.metadata.annotations`. The
  auto-instrumentation annotation needs to be added to
  `spec.template.metadata.annotations`, otherwise it won’t work.

### **5- Was the auto-instrumentation endpoint configured correctly?**

The `spec.exporter.endpoint` attribute of the `Instrumentation` resource defines
where to send data to. This can be an [OTel Collector](/docs/collector/), or any
OTLP endpoint. If this attribute is left out, it defaults to
`http://localhost:4317`, which, most likely won't send telemetry data anywhere.

When sending telemetry to an OTel Collector located in the same Kubernetes
cluster, `spec.exporter.endpoint` should reference the name of the OTel
Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

For examples:

```yaml
spec:
  exporter:
    endpoint: http://otel-collector-collector.opentelemetry.svc.cluster.local:4317
```

Here, the Collector endpoint is set to
`http://otel-collector.opentelemetry.svc.cluster.local:4317`, where
`otel-collector` is the name of the OTel Collector Kubernetes `Service`. In the
above example, the Collector is running in a different namespace from the
application, which means that `opentelemetry.svc.cluster.local` must be appended
to the Collector’s service name, where `opentelemetry` is the namespace in which
the Collector resides.

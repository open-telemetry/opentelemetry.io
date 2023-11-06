---
title: Injecting Auto-instrumentation
linkTitle: Auto-instrumentation
weight: 11
description:
  An implementation of auto-instrumentation using the OpenTelemetry Operator.
# prettier-ignore
cSpell:ignore: autoinstrumentation GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver PTRACE REDISCALA
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

> If you want to use Go auto-instrumentation, you need to enable the feature
> gate. See
> [Controlling Instrumentation Capabilities](https://github.com/open-telemetry/opentelemetry-operator#controlling-instrumentation-capabilities)
> for details.

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
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
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

**Excluding auto-instrumentation**

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

**Learn more**

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

**Excluding auto-instrumentation**

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

**Learn more**

For more details, see
[Java agent Configuration](/docs/instrumentation/java/automatic/agent-config/).

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

**Excluding auto-instrumentation**

By default, the Node.js auto-instrumentation ships with
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/metapackages/auto-instrumentations-node/README.md#supported-instrumentations).
At the moment, there is no way to opt-in to only specific packages or disable
specific packages. If you don't want to use a package included by the default
image you must either supply your own image that includes only the packages you
want or use manual instrumentation.

**Learn more**

For more details, see
[Node.js auto-instrumentation](/docs/instrumentation/js/libraries/#registration).

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

By default, the `Instrumentation` resource that auto-instruments Python services
uses `otlp` with the `http/protobuf` protocol (gRPC is not supported at this
time). This means that the configured endpoint must be able to receive OTLP over
`http/protobuf`. Therefore, the example uses `http://demo-collector:4318`, which
will connect to the `http` port of the `otlpreceiver` of the Collector created
in the previous step.

> As of operator v0.67.0, the Instrumentation resource automatically sets
> `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` and `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`
> to `http/protobuf` for Python services. If you use an older version of the
> Operator you **MUST** set these env variables to `http/protobuf`, or Python
> auto-instrumentation will not work.

**Auto-instrumenting Python logs**

By default, Python logs auto-instrumentation is disabled. If you would like to
enable this feature, you must to set the `OTEL_LOGS_EXPORTER` and
`OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` environment variables as
follows:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
  namespace: application
spec:
  exporter:
    endpoint: http://demo-collector:4318
  env:
  propagators:
    - tracecontext
    - baggage
  python:
    env:
      - name: OTEL_LOGS_EXPORTER
        value: otlp_proto_http
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> Note that `OTEL_LOGS_EXPORTER` must be explicitly set to `otlp_proto_http`,
> otherwise it defaults to gRPC.

**Excluding auto-instrumentation**

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

**Learn more**

[See the Python agent Configuration docs for more details.](/docs/instrumentation/python/automatic/agent-config/#disabling-specific-instrumentations)

### Go

The following command creates a basic Instrumentation resource that is
configured specifically for instrumenting Go services.

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

By default, the Instrumentation resource that auto-instruments Go services uses
`otlp` with the `grpc` protocol. This means that the configured endpoint must be
able to receive OTLP over `grpc`. Therefore, the example uses
`http://demo-collector:4317`, which connects to the `grpc` port of the
`otlpreceiver` of the Collector created in the previous step.

> Go auto-instrumentation only supports exporting via gRPC. Setting the protocol
> or exporter to any other value via environment variables will result in silent
> failure.

The Go auto-instrumentation does not support disabling any instrumentation.
[See the Go Auto-Instrumentation repository for me details.](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

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
- Go: `instrumentation.opentelemetry.io/inject-go: "true"`
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

### Opt-in a Go Service

Unlike other languages' auto-instrumentation, Go works via an eBPF agent running
via a sidecar. When opted in, the Operator will inject this sidecar into your
pod. In addition to the `instrumentation.opentelemetry.io/inject-go` annotation
mentioned above, you must also supply a value for the
[`OTEL_GO_AUTO_TARGET_EXE` environment variable](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/how-it-works.md).
You can set this environment variable via the
`instrumentation.opentelemetry.io/otel-go-auto-target-exe` annotation.

```yaml
instrumentation.opentelemetry.io/inject-go: 'true'
instrumentation.opentelemetry.io/otel-go-auto-target-exe: '/path/to/container/executable'
```

This environment variable can also be set via the Instrumentation resource, with
the annotation taking precedence. Since Go auto-instrumentation requires
`OTEL_GO_AUTO_TARGET_EXE` to be set, you must supply a valid executable path via
the annotation or the Instrumentation resource. Failure to set this value causes
instrumentation injection to abort, leaving the original pod unchanged.

Since Go auto-instrumentation uses eBPF, it also requires elevated permissions.
When you opt in, the sidecar the Operator injects will require the following
permissions:

```yaml
securityContext:
  capabilities:
    add:
      - SYS_PTRACE
  privileged: true
  runAsUser: 0
```

## Troubleshooting

If you run into problems trying to auto-instrument your code, here are a few
things that you can try.

### Did the Instrumentation resource install?

After installing the `Instrumentation` resource, verify that it installed
correctly by running this command, where `<namespace>` is the namespace in which
the `Instrumentation` resource is deployed:

```sh
kubectl describe otelinst -n <namespace>
```

Sample output:

```yaml
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

### Do the OTel Operator logs show any auto-instrumentation errors?

Check the OTel Operator logs for any errors pertaining to auto-instrumentation
by running this command:

```sh
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

### Were the resources deployed in the right order?

Order matters! The `Instrumentation` resource needs to be deployed before before
deploying the application, otherwise the auto-instrumentation won’t work.

Recall the auto-instrumentation annotation:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

The annotation above tells the OTel Operator to look for an `Instrumentation`
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

```sh
kubectl get events -n <your_app_namespace>
```

Which should output something like this:

```text
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

### Is the auto-instrumentation annotation correct?

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

### Was the auto-instrumentation endpoint configured correctly?

The `spec.exporter.endpoint` attribute of the `Instrumentation` resource defines
where to send data to. This can be an [OTel Collector](/docs/collector/), or any
OTLP endpoint. If this attribute is left out, it defaults to
`http://localhost:4317`, which, most likely won't send telemetry data anywhere.

When sending telemetry to an OTel Collector located in the same Kubernetes
cluster, `spec.exporter.endpoint` should reference the name of the OTel
Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

For example:

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

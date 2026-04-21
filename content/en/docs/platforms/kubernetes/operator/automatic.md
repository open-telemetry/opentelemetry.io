---
title: Injecting Auto-instrumentation
linkTitle: Auto-instrumentation
weight: 11
description:
  An implementation of auto-instrumentation using the OpenTelemetry Operator.
# prettier-ignore
cSpell:ignore: GRPCNETCLIENT k8sattributesprocessor otelinst otlpreceiver REDISCALA
---

The OpenTelemetry Operator supports injecting and configuring
auto-instrumentation libraries for .NET, Java, Node.js, Python, and Go services.

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
chart, there is an option to generate a self-signed certificate instead.

> If you want to use Go auto-instrumentation, you need to enable the feature
> gate. See
> [Controlling Instrumentation Capabilities](#controlling-instrumentation-capabilities)
> for details.

## Create an OpenTelemetry Collector (Optional)

It is a best practice to send telemetry from containers to an
[OpenTelemetry Collector](/docs/platforms/kubernetes/collector/) instead of
directly to a backend. The Collector helps simplify secret management, decouples
data export problems (such as a need to do retries) from your apps, and lets you
add additional data to your telemetry, such as with the
[k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)
component. If you chose not to use a Collector, you can skip to the next
section.

The Operator provides a
[Custom Resource Definition (CRD) for the OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md)
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
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: demo
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
    exporters:
      debug:
        verbosity: basic

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
EOF
```

The above command results in a deployment of the Collector that you can use as
an endpoint for auto-instrumentation in your pods.

## Deployment Modes

The `OpenTelemetryCollector` custom resource exposes a `.Spec.Mode` property
that can be used to specify whether the Collector should run as a
[`DaemonSet`](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/),
[`Sidecar`](https://kubernetes.io/docs/concepts/workloads/pods/#workload-resources-for-managing-pods),
[`StatefulSet`](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/),
or
[`Deployment`](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
(default).

### Sidecar injection

A sidecar with the OpenTelemetry Collector can be injected into pod-based
workloads by setting the pod annotation `sidecar.opentelemetry.io/inject` to
either `"true"`, or to the name of a concrete `OpenTelemetryCollector` resource:

```yaml
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: sidecar-for-my-app
spec:
  mode: sidecar
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:

    exporters:
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [debug]
EOF

kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  annotations:
    sidecar.opentelemetry.io/inject: "true"
spec:
  containers:
  - name: myapp
    image: myapp:latest
    ports:
      - containerPort: 8080
        protocol: TCP
EOF
```

When there are multiple `OpenTelemetryCollector` resources with `mode: sidecar`
in the same namespace, use a concrete name. When there is only one `Sidecar`
instance in the namespace, setting the annotation to `"true"` is sufficient.

When using a `Deployment` or `StatefulSet`, add the annotation to the
`PodTemplate` section — **not** the top-level `metadata`:

```yaml
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
  annotations:
    sidecar.opentelemetry.io/inject: "true" # WRONG — has no effect here
spec:
  selector:
    matchLabels:
      app: my-app
  replicas: 1
  template:
    metadata:
      labels:
        app: my-app
      annotations:
        sidecar.opentelemetry.io/inject: "true" # CORRECT
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
          - containerPort: 8080
            protocol: TCP
EOF
```

The possible values for the annotation are:

- `"true"` — inject the `OpenTelemetryCollector` sidecar from the namespace.
- `"sidecar-for-my-app"` — name of the `OpenTelemetryCollector` CR instance in
  the current namespace.
- `"my-other-namespace/my-instrumentation"` — name and namespace of an
  `OpenTelemetryCollector` CR instance in another namespace.
- `"false"` — do not inject.

The annotation value can come either from the namespace or from the pod. The
most specific annotation wins, in this order:

- The pod annotation is used when it is set to a concrete instance name or to
  `"false"`.
- The namespace annotation is used when the pod annotation is either absent or
  set to `"true"`, and the namespace annotation is set to a concrete instance
  name or to `"false"`.

When using sidecar mode, the OpenTelemetry Collector container will have the
`OTEL_RESOURCE_ATTRIBUTES` environment variable set with Kubernetes resource
attributes, ready to be consumed by the
[resourcedetection](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)
processor.

### Using imagePullSecrets

The OpenTelemetry Collector defines a ServiceAccount field which could be set to run collector instances with a specific Service and their properties (e.g. imagePullSecrets). Therefore, if you have a constraint to run your collector with a private container registry, you should follow the procedure below:

- Create Service Account.

```bash
kubectl create serviceaccount <service-account-name>
```

- Create an imagePullSecret.

```bash
kubectl create secret docker-registry <secret-name> --docker-server=<registry name> \
        --docker-username=DUMMY_USERNAME --docker-password=DUMMY_DOCKER_PASSWORD \
        --docker-email=DUMMY_DOCKER_EMAIL
```

- Add image pull secret to service account

```bash
kubectl patch serviceaccount <service-account-name> -p '{"imagePullSecrets": [{"name": "<secret-name>"}]}'
```

## Configure Automatic Instrumentation

To be able to manage automatic instrumentation, the Operator needs to be
configured to know what pods to instrument and which automatic instrumentation
to use for those pods. This is done via the
[Instrumentation CRD](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/instrumentations.md).

Creating the Instrumentation resource correctly is paramount for getting
auto-instrumentation working. Making sure all endpoints and environment
variables are correct is required for auto-instrumentation to work properly.

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

#### Excluding auto-instrumentation {#dotnet-excluding-auto-instrumentation}

By default, the .NET auto-instrumentation ships with
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#instrumentations).
This makes instrumentation easy, but could result in too much or unwanted data.
If there are any libraries you do not want to use you can set
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

.NET auto-instrumentation also supports a runtime annotation to set the .NET
[Runtime Identifier (RID)](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog).
Currently `linux-x64` (default) and `linux-musl-x64` are supported:

```bash
instrumentation.opentelemetry.io/inject-dotnet: "true"
instrumentation.opentelemetry.io/otel-dotnet-auto-runtime: "linux-x64"   # default, can be omitted
instrumentation.opentelemetry.io/otel-dotnet-auto-runtime: "linux-musl-x64"  # for musl-based images
```

> **Note:** By default, the operator sets
> `OTEL_DOTNET_AUTO_TRACES_ENABLED_INSTRUMENTATIONS` to all available
> instrumentations supported by the consumed
> `opentelemetry-dotnet-instrumentation` release (e.g.
> `AspNet,HttpClient,SqlClient`). This value can be overridden by configuring
> the environment variable explicitly.

#### Learn more {#dotnet-learn-more}

For more details, see [.NET Auto Instrumentation docs](/docs/zero-code/dotnet/).

### Deno

The following command creates a basic Instrumentation resource that is
configured for instrumenting [Deno](https://deno.com) services.

```bash
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: demo-instrumentation
spec:
  env:
    - name: OTEL_DENO
      value: 'true'
  exporter:
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: '1'
EOF
```

Deno processes automatically export telemetry data to the configured endpoint
when they are started with the `OTEL_DENO=true` environment variable. Therefore,
the example specifies this environment variable in the `env` field of the
Instrumentation resource, so it is set for all services that have env vars
injected with this Instrumentation resource.

By default, the Instrumentation resource that auto-instruments Deno services
uses `otlp` with the `http/proto` protocol. This means that the configured
endpoint must be able to receive OTLP over `http/proto`. Therefore, the example
uses `http://demo-collector:4318`, which connects to the `http/proto` port of
the `otlpreceiver` of the Collector created in the previous step.

> [!NOTE]
>
> [Deno's OpenTelemetry integration][deno-docs] is not yet stable. As a result
> all workloads that want to be instrumented with Deno must have the
> `--unstable-otel` flag set when starting the Deno process.
>
> [deno-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

#### Configuration options {#deno-configuration-options}

By default, the Deno OpenTelemetry integration exports `console.log()` output
as [logs](/docs/concepts/signals/logs/), while still printing the logs to stdout /
stderr. You can configure these alternative behaviors:

- `OTEL_DENO_CONSOLE=replace`: only export `console.log()` output as logs; do
  not print to stdout / stderr.
- `OTEL_DENO_CONSOLE=ignore`: do not export `console.log()` output as logs; do
  print to stdout / stderr.

#### Learn more {#deno-learn-more}

For more details, see Deno's [OpenTelemetry integration][deno-otel-docs]
documentation.

[deno-otel-docs]: https://docs.deno.com/runtime/fundamentals/open_telemetry/

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
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

By default, the Instrumentation resource that auto-instruments Go services uses
`otlp` with the `http/protobuf` protocol. This means that the configured
endpoint must be able to receive OTLP over `http/protobuf`. Therefore, the
example uses `http://demo-collector:4318`, which connects to the `http/protobuf`
port of the `otlpreceiver` of the Collector created in the previous step.

The Go auto-instrumentation does not support disabling any instrumentation.
[See the Go Auto-Instrumentation repository for more details.](https://github.com/open-telemetry/opentelemetry-go-instrumentation)

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
    endpoint: http://demo-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF
```

By default, the Instrumentation resource that auto-instruments Java services
uses `otlp` with the `http/protobuf` protocol. This means that the configured
endpoint must be able to receive OTLP over `http` via `protobuf` payloads.
Therefore, the example uses `http://demo-collector:4318`, which connects to the
`http` port of the otlpreceiver of the Collector created in the previous step.

#### Excluding auto-instrumentation {#java-excluding-auto-instrumentation}

By default, the Java auto-instrumentation ships with
[many instrumentation libraries](/docs/zero-code/java/agent/getting-started/#supported-libraries-frameworks-application-services-and-jvms).
This makes instrumentation easy, but could result in too much or unwanted data.
If there are any libraries you do not want to use you can set
`OTEL_INSTRUMENTATION_[NAME]_ENABLED=false` where `[NAME]` is the name of the
library. If you know exactly which libraries you want to use, you can disable
the default libraries by setting
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED=false` and then use
`OTEL_INSTRUMENTATION_[NAME]_ENABLED=true` where `[NAME]` is the name of the
library. For more details, see
[Suppressing specific instrumentation](/docs/zero-code/java/agent/disable/).

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
  java:
    env:
      - name: OTEL_INSTRUMENTATION_KAFKA_ENABLED
        value: false
      - name: OTEL_INSTRUMENTATION_REDISCALA_ENABLED
        value: false
```

#### Learn more {#java-learn-more}

For more details, see
[Java agent Configuration](/docs/zero-code/java/agent/configuration/).

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

#### Excluding instrumentation libraries {#js-excluding-instrumentation-libraries}

By default, the Node.js zero-code instrumentation has all the instrumentation
libraries enabled.

To enable only specific instrumentation libraries you can use the
`OTEL_NODE_ENABLED_INSTRUMENTATIONS` environment variable as documented in the
[Node.js zero-code instrumentation documentation](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... other fields skipped from this example
spec:
  # ... other fields skipped from this example
  nodejs:
    env:
      - name: OTEL_NODE_ENABLED_INSTRUMENTATIONS
        value: http,nestjs-core # comma-separated list of the instrumentation package names without the `@opentelemetry/instrumentation-` prefix.
```

To keep all default libraries and disable only specific instrumentation
libraries you can use the `OTEL_NODE_DISABLED_INSTRUMENTATIONS` environment
variable. For details, see
[Excluding instrumentation libraries](/docs/zero-code/js/configuration/#excluding-instrumentation-libraries).

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
# ... other fields skipped from this example
spec:
  # ... other fields skipped from this example
  nodejs:
    env:
      - name: OTEL_NODE_DISABLED_INSTRUMENTATIONS
        value: fs,grpc # comma-separated list of the instrumentation package names without the `@opentelemetry/instrumentation-` prefix.
```

> [!NOTE]
>
> If both environment variables are set, `OTEL_NODE_ENABLED_INSTRUMENTATIONS` is
> applied first, and then `OTEL_NODE_DISABLED_INSTRUMENTATIONS` is applied to
> that list. Therefore, if the same instrumentation is included in both lists,
> that instrumentation will be disabled.

#### Learn more {#js-learn-more}

For more details, see
[Node.js auto-instrumentation](/docs/languages/js/libraries/#registration).

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

> As of operator v0.108.0, the Instrumentation resource automatically sets
> `OTEL_EXPORTER_OTLP_PROTOCOL` to `http/protobuf` for Python services. If you
> use an older version of the Operator you **MUST** set this environment
> variable to `http/protobuf`, or Python auto-instrumentation will not work.

#### Auto-instrumenting Python logs

By default, Python logs auto-instrumentation is disabled. If you would like to
enable this feature, you must to set
`OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` environment variable as
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
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

> As of operator v0.111.0 setting `OTEL_LOGS_EXPORTER` to `otlp` is not required
> anymore.

#### Excluding auto-instrumentation {#python-excluding-auto-instrumentation}

By default, the Python auto-instrumentation ships with
[many instrumentation libraries](https://github.com/open-telemetry/opentelemetry-operator/blob/main/autoinstrumentation/python/requirements.txt).
This makes instrumentation easy, but can result in too much or unwanted data. If
there are any packages you do not want to instrument, you can set the
`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS` environment variable.

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

See the
[Python agent configuration docs](/docs/zero-code/python/configuration/#disabling-specific-instrumentations)
for more details.

#### Learn more {#python-learn-more}

For Python-specific quirks, see
[Python OpenTelemetry Operator docs](/docs/zero-code/python/operator/#python-specific-topics)
and the
[Python agent configuration docs](/docs/zero-code/python/configuration/).

---

Now that your Instrumentation object is created, your cluster has the ability to
auto-instrument services and send data to an endpoint. However,
auto-instrumentation with the OpenTelemetry Operator follows an opt-in model. In
order to activate automatic instrumentation, you'll need to add an annotation to
your deployment.

## Add annotations to existing deployments

The final step is to opt in your services to automatic instrumentation. This is
done by updating your service's `spec.template.metadata.annotations` to include
a language-specific annotation:

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Deno: `instrumentation.opentelemetry.io/inject-sdk: "true"`
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
  privileged: true
  runAsUser: 0
```

### Auto-instrumenting a Python musl based container {#annotations-python-musl}

Since operator v0.113.0 Python auto-instrumentation also honors an annotation
that will permit it to run it on images with a different C library than glibc.

```sh
# for Linux glibc based images, this is the default value and can be omitted
instrumentation.opentelemetry.io/otel-python-platform: "glibc"
# for Linux musl based images
instrumentation.opentelemetry.io/otel-python-platform: "musl"
```

## Multi-container pods

### Single instrumentation

If nothing else is specified, instrumentation is performed on the first
container available in the pod spec (from `.spec.containers`, not init
containers). In some cases — for example when an Istio sidecar is injected — it
becomes necessary to specify on which container(s) the injection must be
performed.

Use the `instrumentation.opentelemetry.io/container-names` annotation to
indicate one or more container names (from `.spec.containers.name` or
`.spec.initContainers.name`) on which the injection must be made:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment-with-multiple-containers
spec:
  selector:
    matchLabels:
      app: my-pod-with-multiple-containers
  replicas: 1
  template:
    metadata:
      labels:
        app: my-pod-with-multiple-containers
      annotations:
        instrumentation.opentelemetry.io/inject-java: "true"
        instrumentation.opentelemetry.io/container-names: "myapp,myapp2"
    spec:
      containers:
        - name: myapp
          image: myImage1
        - name: myapp2
          image: myImage2
        - name: myapp3
          image: myImage3
```

In the above case, `myapp` and `myapp2` containers will be instrumented;
`myapp3` will not.

> **NOTE**: Go auto-instrumentation **does not** support multi-container pods.
> When injecting Go auto-instrumentation the first container should be the only
> container you want instrumented.

### Instrumenting init containers

Init containers can be instrumented by including their names in the
`container-names` annotation. When an init container is targeted for
instrumentation, the operator automatically inserts the instrumentation init
container **before** the target init container in the pod's init container
sequence. This ensures the instrumentation agent files are available when the
target init container runs.

Supported instrumentations for init containers: Java, Python, Node.js, .NET,
and SDK-only injection.

Not supported for init containers: Go (does not support multi-container pods),
Apache HTTPD, and Nginx.

> **Note**: Kubernetes guarantees that container names are unique across both
> the `initContainers` and `containers` lists within a pod spec, allowing the
> operator to unambiguously identify whether a container name refers to an init
> container or a regular container.

Example with both init container and regular container instrumentation:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment-with-init-container
spec:
  selector:
    matchLabels:
      app: my-app
  replicas: 1
  template:
    metadata:
      labels:
        app: my-app
      annotations:
        instrumentation.opentelemetry.io/inject-python: "true"
        instrumentation.opentelemetry.io/container-names: "my-init-job,myapp"
    spec:
      initContainers:
        - name: my-init-job
          image: my-python-init-image
      containers:
        - name: myapp
          image: my-python-app-image
```

In this example, both `my-init-job` (an init container) and `myapp` (a regular
container) will be instrumented with Python auto-instrumentation.

### Multiple instrumentations

Multi-instrumentation works only when the `enable-multi-instrumentation` feature
flag is set to `true`. When enabled, use language-specific container name
annotations to specify which containers should receive which instrumentation.

If language instrumentation specific container names are not specified,
instrumentation is performed on the first regular container available in the pod
spec (only if single instrumentation injection is configured).

In some cases, containers in the same pod use different technologies. Use the
language-specific container name annotations to indicate one or more container
names (from `.spec.containers.name` or `.spec.initContainers.name`) on which
the injection must be made:

| Language     | Annotation                                                         |
| ------------ | ------------------------------------------------------------------ |
| Java         | `instrumentation.opentelemetry.io/java-container-names`           |
| Node.js      | `instrumentation.opentelemetry.io/nodejs-container-names`         |
| Python       | `instrumentation.opentelemetry.io/python-container-names`         |
| .NET         | `instrumentation.opentelemetry.io/dotnet-container-names`         |
| Go           | `instrumentation.opentelemetry.io/go-container-names`             |
| Apache HTTPD | `instrumentation.opentelemetry.io/apache-httpd-container-names`   |
| Nginx        | `instrumentation.opentelemetry.io/nginx-container-names`          |
| SDK only     | `instrumentation.opentelemetry.io/sdk-container-names`            |

Example with Java and Python running in different containers:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment-with-multi-containers-multi-instrumentations
spec:
  selector:
    matchLabels:
      app: my-pod-with-multi-containers-multi-instrumentations
  replicas: 1
  template:
    metadata:
      labels:
        app: my-pod-with-multi-containers-multi-instrumentations
      annotations:
        instrumentation.opentelemetry.io/inject-java: "true"
        instrumentation.opentelemetry.io/java-container-names: "myapp,myapp2"
        instrumentation.opentelemetry.io/inject-python: "true"
        instrumentation.opentelemetry.io/python-container-names: "myapp3"
    spec:
      containers:
        - name: myapp
          image: myImage1
        - name: myapp2
          image: myImage2
        - name: myapp3
          image: myImage3
```

In the above case, `myapp` and `myapp2` will be instrumented with Java and
`myapp3` with Python instrumentation.

> **NOTE**: Go auto-instrumentation **does not** support multi-container pods.
> **NOTE**: A single container cannot be instrumented with multiple language instrumentations.
> **NOTE**: The `instrumentation.opentelemetry.io/container-names` annotation is not used for this feature.

## Using customized or vendor instrumentation

By default, the operator uses upstream auto-instrumentation libraries. Custom
auto-instrumentation images can be configured by overriding the `image` fields
in the `Instrumentation` CR:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: my-instrumentation
spec:
  java:
    image: your-customized-auto-instrumentation-image:java
  nodejs:
    image: your-customized-auto-instrumentation-image:nodejs
  python:
    image: your-customized-auto-instrumentation-image:python
  dotnet:
    image: your-customized-auto-instrumentation-image:dotnet
  go:
    image: your-customized-auto-instrumentation-image:go
  apacheHttpd:
    image: your-customized-auto-instrumentation-image:apache-httpd
  nginx:
    image: your-customized-auto-instrumentation-image:nginx
```

The Dockerfiles for auto-instrumentation can be found in the
[autoinstrumentation directory](https://github.com/open-telemetry/opentelemetry-operator/tree/main/autoinstrumentation).
Follow the instructions in the Dockerfiles on how to build a custom container
image.

## Using Apache HTTPD auto-instrumentation

For Apache HTTPD auto-instrumentation, the operator assumes HTTPD version 2.4
and configuration directory `/usr/local/apache2/conf` by default (as used in
the official `httpd` image). If you need version 2.2, a different config
directory, or custom agent attributes, use the following example:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: my-instrumentation
spec:
  apacheHttpd:
    image: your-customized-auto-instrumentation-image:apache-httpd
    version: "2.2"
    configPath: /your-custom-config-path
    attrs:
      - name: ApacheModuleOtelMaxQueueSize
        value: "4096"
```

A full list of available attributes can be found at
[otel-webserver-module](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module).

## Using Nginx auto-instrumentation

For Nginx auto-instrumentation, Nginx versions 1.22.0, 1.23.0, and 1.23.1 are
supported. The Nginx configuration file is expected to be
`/etc/nginx/nginx.conf` by default. Instrumentation also expects a `conf.d`
directory in the same directory as the configuration file, with an
`include <config-file-dir-path>/conf.d/*.conf;` directive in the `http { ... }`
section. You can also adjust OpenTelemetry SDK attributes:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: my-instrumentation
spec:
  nginx:
    image: your-customized-auto-instrumentation-image:nginx
    configFile: /my/custom-dir/custom-nginx.conf
    attrs:
      - name: NginxModuleOtelMaxQueueSize
        value: "4096"
```

A full list of available attributes can be found at
[otel-webserver-module](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module).

## Inject OpenTelemetry SDK environment variables only

You can configure the OpenTelemetry SDK for applications that cannot currently
be auto-instrumented by using `inject-sdk` in place of `inject-python` or
`inject-java`. This will inject environment variables like
`OTEL_RESOURCE_ATTRIBUTES`, `OTEL_TRACES_SAMPLER`, and
`OTEL_EXPORTER_OTLP_ENDPOINT` that you configure in the `Instrumentation`
resource, but will not inject the SDK itself.

```bash
instrumentation.opentelemetry.io/inject-sdk: "true"
```

## Target Allocator

The OpenTelemetry Operator comes with an optional component called the Target
Allocator (TA). When creating an `OpenTelemetryCollector` custom resource with
the Target Allocator enabled, the Operator will create a new deployment and
service to serve specific `http_sd_config` directives for each Collector pod as
part of that CR. It will also rewrite the Prometheus receiver configuration in
the CR so that it uses the deployed Target Allocator.

```yaml
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config:
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]
            metric_relabel_configs:
            - action: labeldrop
              regex: (id|name)
            - action: labelmap
              regex: label_(.+)
              replacement: $$1

    exporters:
      debug: {}

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          exporters: [debug]
EOF
```

The usage of `$$` in the replacement keys in the example above is based on the information provided in the Prometheus receiver [README](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md) documentation, which states:
`Note: Since the collector configuration supports env variable substitution $ characters in your prometheus configuration are interpreted as environment variables. If you want to use $ characters in your prometheus configuration, you must escape them using $$.`

Behind the scenes, the OpenTelemetry Operator will convert the Collector’s configuration after the reconciliation into the following:


```yaml
receivers:
  prometheus:
    target_allocator:
      endpoint: http://collector-with-ta-targetallocator:80
      interval: 30s
      collector_id: $POD_NAME

exporters:
  debug:

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [debug]
```

The OpenTelemetry Operator will also convert the Target Allocator's Prometheus
configuration after reconciliation into the following:

```yaml
config:
  scrape_configs:
    - job_name: otel-collector
      scrape_interval: 10s
      static_configs:
        - targets: ["0.0.0.0:8888"]
      metric_relabel_configs:
        - action: labeldrop
          regex: (id|name)
        - action: labelmap
          regex: label_(.+)
          replacement: $1
```

Note that in this case, the Operator replaces "$$" with a single "$" in the replacement keys. This is because the collector supports environment variable substitution, whereas the TA (Target Allocator) does not. Therefore, to ensure compatibility, the TA configuration should only contain a single "$" symbol.

More info on the TargetAllocator can be found [Target Allocator README](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md).

### Using Prometheus Custom Resources for service discovery

The Target Allocator can use Custom Resources from the prometheus-operator
ecosystem — such as `ServiceMonitor` and `PodMonitor` — for service discovery,
performing a function analogous to prometheus-operator itself. Enable this via
the `prometheusCR` section in the Collector CR:

```yaml
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta-prometheus-cr
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: everything-prometheus-operator-needs
    prometheusCR:
      enabled: true
      serviceMonitorSelector: {}
      podMonitorSelector: {}
      scrapeClasses: []
  config:
    receivers:
      prometheus:
        config: {}

    exporters:
      debug: {}

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          exporters: [debug]
EOF
```

The `scrapeClasses` attribute refers to the ScrapeClass feature of the
Prometheus Operator. See the
[Prometheus Operator scrape class documentation](https://prometheus-operator.dev/docs/developer/scrapeclass/)
for more details.

## Controlling Instrumentation Capabilities

The operator allows specifying, via feature flags, which languages the
`Instrumentation` resource may instrument. Languages enabled by default only
need their gate supplied when disabling. Language support can be disabled by
passing the flag with a value of `false`.

| Language     | Gate                                    | Default Value |
| ------------ | --------------------------------------- | ------------- |
| Java         | `enable-java-instrumentation`           | `true`        |
| Node.js      | `enable-nodejs-instrumentation`         | `true`        |
| Python       | `enable-python-instrumentation`         | `true`        |
| .NET         | `enable-dotnet-instrumentation`         | `true`        |
| Apache HTTPD | `enable-apache-httpd-instrumentation`   | `true`        |
| Go           | `enable-go-instrumentation`             | `false`       |
| Nginx        | `enable-nginx-instrumentation`          | `false`       |

Multi-instrumentation (multiple languages in the same pod) can be enabled with
the `enable-multi-instrumentation` flag, which defaults to `false`. For more
information about multi-instrumentation feature capabilities, see
[Multi-container pods with multiple instrumentations](#multiple-instrumentations).

## Configure resource attributes

The OpenTelemetry Operator can automatically set resource attributes as defined
in the
[OpenTelemetry Semantic Conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/non-normative/k8s-attributes.md).

### Configure resource attributes with annotations

Use the `resource.opentelemetry.io/` annotation prefix to add resource
attributes to data produced by OpenTelemetry instrumentation:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
  annotations:
    resource.opentelemetry.io/service.name: "my-service"
    resource.opentelemetry.io/service.version: "1.0.0"
    resource.opentelemetry.io/deployment.environment.name: "production"
spec:
  containers:
  - name: main-container
    image: your-image:tag
```

### Configure resource attributes with labels

You can also use common Kubernetes labels to set resource attributes (first
entry wins). The following labels are supported:

- `app.kubernetes.io/instance` → `service.name`
- `app.kubernetes.io/name` → `service.name`
- `app.kubernetes.io/version` → `service.version`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
  labels:
    app.kubernetes.io/name: "my-service"
    app.kubernetes.io/version: "1.0.0"
    app.kubernetes.io/part-of: "shop"
spec:
  containers:
  - name: main-container
    image: your-image:tag
```

This requires explicit opt-in via the `Instrumentation` CR:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: my-instrumentation
spec:
  defaults:
    useLabelsForResourceAttributes: true
```

### Priority for setting resource attributes

The priority for setting resource attributes is as follows (first found wins):

1. `OTEL_RESOURCE_ATTRIBUTES` and `OTEL_SERVICE_NAME` environment variables
2. Annotations with the `resource.opentelemetry.io/` prefix
3. Labels (e.g. `app.kubernetes.io/name`) when
   `defaults.useLabelsForResourceAttributes=true`
4. Resource attributes calculated from the pod's metadata (e.g. `k8s.pod.name`)
5. Resource attributes set in the `Instrumentation` CR under
   `spec.resource.resourceAttributes`

This priority is applied per attribute individually, so it is possible to set
some attributes via annotations and others via labels.

### How resource attributes are calculated from pod metadata

#### How `service.name` is calculated

The first value found in this order is used:

1. `pod.annotation[resource.opentelemetry.io/service.name]`
2. `pod.label[app.kubernetes.io/name]` (if `useLabelsForResourceAttributes=true`)
3. `k8s.deployment.name`
4. `k8s.replicaset.name`
5. `k8s.statefulset.name`
6. `k8s.daemonset.name`
7. `k8s.cronjob.name`
8. `k8s.job.name`
9. `k8s.pod.name`
10. `k8s.container.name`

#### How `service.version` is calculated

The first value found in this order is used:

1. `pod.annotation[resource.opentelemetry.io/service.version]`
2. `pod.label[app.kubernetes.io/version]` (if `useLabelsForResourceAttributes=true`)
3. Container Docker image tag (only if the tag does not contain a `/`)

#### How `service.instance.id` is calculated

The first value found in this order is used:

1. `pod.annotation[resource.opentelemetry.io/service.instance.id]`
2. Concatenation of `k8s.namespace.name`, `k8s.pod.name`, and
   `k8s.container.name` joined by `.`

#### How `service.namespace` is calculated

The first value found in this order is used:

1. `pod.annotation[resource.opentelemetry.io/service.namespace]`
2. `k8s.namespace.name`

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
   Endpoint:  http://demo-collector.opentelemetry.svc.cluster.local:4318
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

Order matters! The `Instrumentation` resource needs to be deployed before
deploying the application, otherwise the auto-instrumentation won't work.

Recall the auto-instrumentation annotation:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

When the pod starts up, the annotation above tells the OTel Operator to look for
an `Instrumentation` object in the pod's namespace. It also tells the Operator
to inject Python auto-instrumentation into the pod.

It adds an
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
to the application's pod, called `opentelemetry-auto-instrumentation`, which is
then used to inject the auto-instrumentation into the app container.

If the `Instrumentation` resource isn't present by the time the application is
deployed, however, the init-container can't be created. Therefore, if the
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

- The `Instrumentation` resource wasn't installed (or wasn't installed
  properly).
- The `Instrumentation` resource was installed _after_ the application was
  deployed.
- There's an error in the auto-instrumentation annotation, or the annotation in
  the wrong spot — see #4 below.

Be sure to check the output of `kubectl get events` for any errors, as these
might help point to the issue.

### Is the auto-instrumentation annotation correct?

Sometimes auto-instrumentation can fail due to errors in the
auto-instrumentation annotation.

Here are a few things to check for:

- **Is the auto-instrumentation for the right language?**
  - For example, when instrumenting a Python application, make sure that the
    annotation doesn't incorrectly say
    `instrumentation.opentelemetry.io/inject-java: "true"` instead.
  - For **Deno**, make sure you are using the
    `instrumentation.opentelemetry.io/inject-sdk: "true"` annotation, rather
    than an annotation containing the string `deno`.
- **Is the auto-instrumentation annotation in the correct location?** When
  defining a `Deployment`, annotations can be added in one of two locations:
  `spec.metadata.annotations`, and `spec.template.metadata.annotations`. The
  auto-instrumentation annotation needs to be added to
  `spec.template.metadata.annotations`, otherwise it won't work.

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
    endpoint: http://demo-collector.opentelemetry.svc.cluster.local:4317
```

Here, the Collector endpoint is set to
`http://demo-collector.opentelemetry.svc.cluster.local:4317`, where
`demo-collector` is the name of the OTel Collector Kubernetes `Service`. In the
above example, the Collector is running in a different namespace from the
application, which means that `opentelemetry.svc.cluster.local` must be appended
to the Collector's service name, where `opentelemetry` is the namespace in which
the Collector resides.

---
title: Injecting Auto-instrumentation
linkTitle: Auto-instrumentation
weight: 11
description:
  An implementation of auto-instrumentation using the OpenTelemetry Operator.
spelling: cSpell:ignore Otel
---

The OpenTelemetry Operator supports injecting and configuring
auto-instrumentation libraries for .NET, Java, NodeJS and Python
services.

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
to your telemetry, such as with the [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) component. If you
chose not to use a Collector, you can skip to the next section.

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
          processors: [memory_limiter]
          exporters: [logging]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [logging]
EOF
```

The above command results in a deployment of the Collector that you can use as
an endpoint for auto-instrumentation in your pods.

## Configure Autoinstrumentation

To be able to manage autoinstrumentation, the Operator needs to be configured to
know what pods to instrument and which autoinstrumentation to use for those
pods. This is done via the
[Instrumentation CRD](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentation).

Creating the Instrumentation resource correctly is paramount to getting
auto-instrumentation working. Making sure all endpoints and env vars are correct
is required for auto-instrumentation to work properly.

### .NET

Coming Soon

### Java

Coming Soon

### Node.js

Coming Soon

### Python

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

By default, the Instrumentation resource that auto-instruments python services
uses `otlp` with the `http/proto` protocol. This means that the configured
endpoint must be able to receive OTLP over `http/proto`. Therefore, the example
uses `http://demo-collector:4318`, which will connect to the `http` port of the
otlpreceiver of the Collector created in the previous step.

> As of operator v0.67.0, the Instrumentation resource automatically sets
> `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` and `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`
> to `http/proto` for Python services. If you use an older version of the
> Operator you **MUST** set these env variables to `http/proto`, or python
> auto-instrumentation will not work.

---

Now that your Instrumentation object is created, your cluster has the ability to
auto-instrument services and send data to an endpoint. However,
auto-instrumentation with the OpenTelemetry Operator follows an opt-in model. In
order to activate autoinstrumentation, you'll need to add an annotation to your
deployment.

## Add annotations to existing deployments

The final step is to opt in your services to autoinstrumentation. This is done
by updating your service’s `spec.template.metadata.annotations` to include a
language-specific annotation:

- .NET: `instrumentation.opentelemetry.io/inject-dotnet: "true"`
- Java: `instrumentation.opentelemetry.io/inject-java: "true"`
- Node.js: `instrumentation.opentelemetry.io/inject-nodejs: "true"`
- Python: `instrumentation.opentelemetry.io/inject-python: "true"`

Alternatively, the annotation can be added to a namespace, which will result in
all services in that namespace to opt-in to autoinstrumentation. See the
[Operators auto-instrumentation documentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection)
for more details.

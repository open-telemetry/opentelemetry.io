---
title: Using the OpenTelemetry Operatory to Inject Auto-Instrumentation
linkTitle: Operator
weight: 45
spelling: cSpell:ignore distro mkdir uninstrumented virtualenv
---

If you run your Python service in Kubernetes, you can take advantage of the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) to inject auto-instrumentation without having to modify each of your services directly.

## Setup

First, install the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) into your cluster.

You can do this with the [Operator release manifest](https://github.com/open-telemetry/opentelemetry-operator#getting-started), the [Operator helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator#opentelemetry-operator-helm-chart), or with [Operator Hub](https://operatorhub.io/operator/opentelemetry-operator).  

In most cases, you will need to install [cert-manager](https://cert-manager.io/docs/installation/). If you use the helm chart, there is an option to generate a self-signed cert instead.

## Create an OpenTelemetry Collector (Optional)

It is a best practice to send telemetry from containers to an [OpenTelemetry Collector](../../../../collector/) instead of directly to a backend.  The Collector helps simplify secret management, decouples data export problems (such as a need to do retries) from your apps, and lets you add additional data to your telemetry, such as with the `k8sattributesprocessor` component. If you chose not to use a Collector, you can skip to the next section.

The Operator provides a [Custom Resource Definition (CRD) for the OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector) which is used to create an instance of the Collector that the Operator manages. The following example deploys the Collector as a deployment (the default), but there are other [deployment modes](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes) that can be used.

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
The above command results in a deployment of the Collector that you can use as an endpoint for auto-instrumentation in your pods.

## Configure the Instrumentation

In order to auto-instrument services the operator needs to be told how and what to instrument.  This is done via the [Instrumenation CRD](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentation).

Creating the Instrumentation object correctly is paramount to getting auto-instrumentation working.  Via the instrumentation object you are  configuring the OpenTelemetry SDK for python. Making sure all endpoints and env vars are correct is required for auto-instrumentation to work properly.


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

By default the Instrumentation resource auto-instruments python services to export their telemetry using the `otlp exporter` with the `http/proto` protocol, which means the endpoint must be able to receive otlp `http/proto`.  Therefore, the example uses `http://demo-collector:4318`, which is the Collector's otlpreceiver's `http` port.

As of operator v0.67.0 the `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` and `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL` env vars are automatically set to `http/proto`.  If you use an older version of the Operator you **MUST** set these env variables or python auto-instrumentation will not work.

This document is working under the assumption that the only services opting into auto-instrumentation are python services.  If you have other languages to auto-instrument this instrumentation object will look different.  See the [Operators auto-instrumentation documentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection) for more details.

At this point you have the ability to auto-instrument python services, but auto-instrumentation follows an opt-in model.  In order to become instrumented services must update their annotations.

## Add annotations to existing deployments

The final step is to opt in your python services to auto-instrumentation.  This is done by updating the service’s `spec.template.metadata.annotations` to include `instrumentation.opentelemetry.io/inject-python: "true"`.  Alternatively, the annotation can be added to the namespace and all services in the namespace will opt-in.   See the [Operators auto-instrumentation documentation](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection) for more details.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-flask-example
  labels:
    app.kubernetes.io/name: flask-example
spec:
  ...
  template:
    metadata:
      labels:
        app.kubernetes.io/name: flask-example
      annotations:
        instrumentation.opentelemetry.io/inject-python: "true"
    ...
```






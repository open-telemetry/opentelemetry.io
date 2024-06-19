---
title: Auto-instrumentation
---

If you're using the [OpenTelemetry Operator](/docs/kubernetes/operator)'s
[auto-instrumentation](/docs/kubernetes/operator/automatic) capability and
you're not seeing any traces or metrics, then there are a few troubleshooting
steps that you can take to help you understand what’s going on and to get things
back on track.

## Troubleshooting Steps

### 1- Check installation status

After installing the `Instrumentation` resource, make sure that it _actually_
installed correctly by running this command:

```shell
kubectl describe otelinst -n <namespace>
```

Where `<namespace>` is the namespace in which the `Instrumentation` resource is
deployed.

Your output should look something like this:

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

### 2- Check the OpenTelemetry Operator Logs

Check the OpenTelemetry Operator logs for errors, by running this command:

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

The logs should not show any errors related to auto-instrumentation errors.

### 3- Check deployment order

Order matters. The `Instrumentation` resource must be deployed before deploying
the corresponding `Deployment` resource(s) being auto-instrumented.

Consider the following auto-instrumentation annotation snippet:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

It tells the OpenTelemetry Operator to look for an `Instrumentation` resource in
the pod’s namespace. It also tells the Operator to inject Python
auto-instrumentation into the pod.

When the pod starts up, the annotation tells the Operator to look for an
`Instrumentation` resource in the pod’s namespace, and to inject Python
auto-instrumentation into the pod. It adds an
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
to the application’s pod, called `opentelemetry-auto-instrumentation`, which is
then used to injects the auto-instrumentation into the app container.

But if the `Instrumentation` resource isn’t present by the time the `Deployment`
is deployed, the `init-container` can’t be created. This means that if the
`Deployment` resource is deployed _before_ you deploy the `Instrumentation`
resource, the auto-instrumentation will fail to initialize.

Check that the `opentelemetry-auto-instrumentation` `init-container` has started
up correctly (or has even started up at all), by running the following command:

```shell
kubectl get events -n <your_app_namespace>
```

Which should result in output that looks something like this:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

If the output is missing `Created` and/or `Started` entries for
`opentelemetry-auto-instrumentation`, then it means that there is an issue with
your auto-instrumentation configuration. This can be the result of any of the
following:

- The `Instrumentation` resource wasn’t installed (or wasn’t installed
  properly).
- The `Instrumentation` resource was installed _after_ the application was
  deployed.
- There’s an error in the auto-instrumentation annotation, or the annotation in
  the wrong spot — see #4 below.

You might also want to check the output of the events command for any errors, as
these might help point to your issue.

### 4- Check the auto-instrumentation configuration

You’ve added the auto-instrumentation annotation, but did you do it correctly?
Here are a couple of things to check for:

- **Are you auto-instrumenting for the right language?** For example, did you
  try to auto-instrument a Python application by adding a JavaScript
  auto-instrumentation annotation instead?
- **Did you put the auto-instrumentation annotation in the right spot?** When
  you’re defining a `Deployment` resource, there are two spots where you could
  add annotations: `spec.metadata.annotations`, and
  `spec.template.metadata.annotations`. The auto-instrumentation annotation
  needs to be added to `spec.template.metadata.annotations`, otherwise _it won’t
  work_.

### 5- Check auto-instrumentation endpoint configuration

The `spec.exporter.endpoint` configuration in the `Instrumentation` resource
allows you to define the destination for your telemetry data. If you omit it, it
defaults to `http://localhost:4317`. Unfortunately, that won’t send your output
anywhere useful.

If you’re sending out your instrumentation to a [Collector](/docs/collector/),
the value of `spec.exporter.endpoint` should reference the name of your
Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

For example: `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Where:

- `otel-collector` is the name of the OTel Collector Kubernetes
  [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/)
- In addition, if the Collector is running in a different namespace, you must
  append `opentelemetry.svc.cluster.local` to the Collector’s service name,
  where `opentelemetry` is the namespace in which the Collector resides (it can
  be any namespace of your choosing).

Finally, make sure that you are using the right Collector port. Normally, you
can choose either `4317` (gRPC) or `4318` (HTTP); however, for
[Python auto-instrumentation, you can only use `4318`](/docs/kubernetes/operator/automatic/#python).

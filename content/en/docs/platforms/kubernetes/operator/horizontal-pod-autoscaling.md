---
title: Horizontal Pod Autoscaling
description:
  Configure Horizontal Pod Autoscaling with your OpenTelemetry Collector
cSpell:ignore: autoscaler mebibyte mebibytes statefulset
---

Collectors managed by the OpenTelemetry Operator have built-in support for
[horizontal pod autoscaling (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).
HPA increases or decreases the number of replicas (copies) of your Kubernetes
pods, based on a set of metrics. These metrics are typically CPU and/or memory
consumption.

Having the OpenTelemetry Operator manage HPA functionality for the Collector
means that you don’t have to create a separate Kubernetes
`HorizontalPodAutoscaler` resource for autoscaling your Collector.

Since HPA only applies to `StatefulSets` and `Deployments` in Kubernetes, make
sure that your Collector’s `spec.mode` is either `deployment` or `statefulset`.

{{% alert title="Note" color="info" %}} HPA requires a
[Metrics Server](https://github.com/kubernetes-sigs/metrics-server) running on
your Kubernetes cluster.

- Managed Kubernetes clusters like
  [GKE (Google)](https://cloud.google.com/kubernetes-engine?hl=en) and
  [AKS (Microsoft Azure)](https://azure.microsoft.com/en-us/products/kubernetes-service)
  install a Metrics Server automagically as part of cluster provisioning.
- [EKS (AWS) doesn’t come installed with a Metrics Server by default](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html).
- Non-managed Kubernetes clusters and local desktop Kubernetes clusters (for
  example, [MiniKube](https://minikube.sigs.k8s.io/docs/),
  [KinD](https://kind.sigs.k8s.io/), [k0s](https://k0sproject.io)) require
  manual Metrics Server installation.

Consult your cloud provider documentation to determine whether or not your
managed Kubernetes cluster comes pre-installed with a Metrics Server.
{{% /alert %}}

To configure HPA, you must first define your resource requests and limits by
adding a `spec.resources` configuration to your `OpenTelemetryCollector` YAML:

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 64Mi
```

{{% alert title="Note" color="info" %}} Your own values might vary.
{{% /alert %}}

The `limits` configuration specifies the maximum memory and CPU values. In this
case, those limits are 100 millicores (0.1 core) of CPU, and 128Mi (mebibytes,
where 1 mebibyte == 1024 kilobytes) of RAM.

The `requests` configuration specifies the minimum guaranteed amount of
resources allocated for the container. In this case, the minimum allocation is
100 millicores of CPU and 64 mebibytes of RAM.

Next, you configure the autoscaling rules by adding an `spec.autoscaler`
configuration to the `OpenTelemetryCollector` YAML:

```yaml
autoscaler:
  minReplicas: 1
  maxReplicas: 2
  targetCPUUtilization: 50
  targetMemoryUtilization: 60
```

{{% alert title="Note" color="info" %}} Your own values might vary.
{{% /alert %}}

Putting it all together, the start of the `OpenTelemetryCollector` YAML should
look something like this:

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  image:
    otel/opentelemetry-collector-contrib:{{% version-from-registry
    collector-processor-batch %}}
  serviceAccount: otelcontribcol
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
    targetCPUUtilization: 50
    targetMemoryUtilization: 60
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi
```

Once the `OpenTelemetryCollector` is deployed to Kubernetes with HPA enabled,
the Operator creates a `HorizontalPodAutoscaler` resource for your Collector in
Kubernetes. You can check this by running

`kubectl get hpa -n <your_namespace>`

If everything worked as expected, here is what the output of the command should
look like:

```nocode
NAME                REFERENCE                        TARGETS                         MINPODS   MAXPODS   REPLICAS   AGE
otelcol-collector   OpenTelemetryCollector/otelcol   memory: 68%/60%, cpu: 37%/50%   1         3         2          77s
```

To get more detailed information, you can describe your HPA resource by running

`kubectl describe hpa <your_collector_name> -n <your_namespace>`

If everything worked as expected, here is what the output of the command should
look like:

```nocode
Name:                                                     otelcol-collector
Namespace:                                                opentelemetry
Labels:                                                   app.kubernetes.io/benchmark-test=otelcol-contrib
                                                          app.kubernetes.io/component=opentelemetry-collector
                                                          app.kubernetes.io/destination=dynatrace
                                                          app.kubernetes.io/instance=opentelemetry.otelcol
                                                          app.kubernetes.io/managed-by=opentelemetry-operator
                                                          app.kubernetes.io/name=otelcol-collector
                                                          app.kubernetes.io/part-of=opentelemetry
                                                          app.kubernetes.io/version=0.126.0
Annotations:                                              <none>
CreationTimestamp:                                        Mon, 02 Jun 2025 17:23:52 +0000
Reference:                                                OpenTelemetryCollector/otelcol
Metrics:                                                  ( current / target )
  resource memory on pods  (as a percentage of request):  71% (95779498666m) / 60%
  resource cpu on pods  (as a percentage of request):     12% (12m) / 50%
Min replicas:                                             1
Max replicas:                                             3
OpenTelemetryCollector pods:                              3 current / 3 desired
Conditions:
  Type            Status  Reason            Message
  ----            ------  ------            -------
  AbleToScale     True    ReadyForNewScale  recommended size matches current size
  ScalingActive   True    ValidMetricFound  the HPA was able to successfully calculate a replica count from memory resource utilization (percentage of request)
  ScalingLimited  True    TooManyReplicas   the desired replica count is more than the maximum replica count
Events:
  Type     Reason                   Age                  From                       Message
  ----     ------                   ----                 ----                       -------
  Warning  FailedGetResourceMetric  2m (x4 over 2m29s)   horizontal-pod-autoscaler  unable to get metric memory: no metrics returned from resource metrics API
  Warning  FailedGetResourceMetric  89s (x7 over 2m29s)  horizontal-pod-autoscaler  No recommendation
  Normal   SuccessfulRescale        89s                  horizontal-pod-autoscaler  New size: 2; reason: memory resource utilization (percentage of request) above target
  Normal   SuccessfulRescale        59s                  horizontal-pod-autoscaler  New size: 3; reason: memory resource utilization (percentage of request) above target
```

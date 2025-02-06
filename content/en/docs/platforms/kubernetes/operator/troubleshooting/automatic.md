---
title: Auto-instrumentation
cSpell:ignore: PYTHONPATH
---

If you're using the [OpenTelemetry Operator](/docs/platforms/kubernetes/operator)'s
capability to inject [auto-instrumentation](/docs/platforms/kubernetes/operator/automatic)
and you're not seeing any traces or metrics, follow these troubleshooting steps
to understand what’s going on.

## Troubleshooting steps

### Check installation status

After installing the `Instrumentation` resource, make sure that it is installed
correctly by running this command:

```shell
kubectl describe otelinst -n <namespace>
```

Where `<namespace>` is the namespace in which the `Instrumentation` resource is
deployed.

Your output should look like this:

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

### Check the OpenTelemetry Operator logs

Check the OpenTelemetry Operator logs for errors by running this command:

```shell
kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow
```

The logs should not show any errors related to auto-instrumentation errors.

### Check deployment order

Make sure the deployment order is correct. The `Instrumentation` resource must
be deployed before deploying the corresponding `Deployment` resources that are
auto-instrumented.

Consider the following auto-instrumentation annotation snippet:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

When the pod starts up, the annotation tells the Operator to look for an
`Instrumentation` resource in the pod’s namespace, and to inject Python
auto-instrumentation into the pod. It adds an
[init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
called `opentelemetry-auto-instrumentation` to the application’s pod, which is
then used to inject the auto-instrumentation into the app container.

Which you can see when you run:

```shell
kubectl describe pod <your_pod_name> -n <namespace>
```

Where `<namespace>` is the namespace in which your pod is deployed. The
resulting output should look like the following example, which shows what the
pod spec may look like after auto-instrumentation injection:

```text
Name:             py-otel-server-f89fdbc4f-mtsps
Namespace:        opentelemetry
Priority:         0
Service Account:  default
Node:             otel-target-allocator-talk-control-plane/172.24.0.2
Start Time:       Mon, 15 Jul 2024 17:23:45 -0400
Labels:           app=my-app
                  app.kubernetes.io/name=py-otel-server
                  pod-template-hash=f89fdbc4f
Annotations:      instrumentation.opentelemetry.io/inject-python: true
Status:           Running
IP:               10.244.0.10
IPs:
  IP:           10.244.0.10
Controlled By:  ReplicaSet/py-otel-server-f89fdbc4f
Init Containers:
  opentelemetry-auto-instrumentation-python:
    Container ID:  containerd://20ecf8766247e6043fcad46544dba08c3ef534ee29783ca552d2cf758a5e3868
    Image:         ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0
    Image ID:      ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python@sha256:3ed1122e10375d527d84c826728f75322d614dfeed7c3a8d2edd0d391d0e7973
    Port:          <none>
    Host Port:     <none>
    Command:
      cp
      -r
      /autoinstrumentation/.
      /otel-auto-instrumentation-python
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Mon, 15 Jul 2024 17:23:51 -0400
      Finished:     Mon, 15 Jul 2024 17:23:51 -0400
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  32Mi
    Requests:
      cpu:        50m
      memory:     32Mi
    Environment:  <none>
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Containers:
  py-otel-server:
    Container ID:   containerd://95fb6d06b08ead768f380be2539a93955251be6191fa74fa2e6e5616036a8f25
    Image:          otel-target-allocator-talk:0.1.0-py-otel-server
    Image ID:       docker.io/library/import-2024-07-15@sha256:a2ed39e9a39ca090fedbcbd474c43bac4f8c854336a8500e874bd5b577e37c25
    Port:           8082/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 15 Jul 2024 17:23:52 -0400
    Ready:          True
    Restart Count:  0
    Environment:
      OTEL_NODE_IP:                                       (v1:status.hostIP)
      OTEL_POD_IP:                                        (v1:status.podIP)
      OTEL_METRICS_EXPORTER:                             console,otlp_proto_http
      OTEL_LOGS_EXPORTER:                                otlp_proto_http
      OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED:  true
      PYTHONPATH:                                        /otel-auto-instrumentation-python/opentelemetry/instrumentation/auto_instrumentation:/otel-auto-instrumentation-python
      OTEL_TRACES_EXPORTER:                              otlp
      OTEL_EXPORTER_OTLP_TRACES_PROTOCOL:                http/protobuf
      OTEL_EXPORTER_OTLP_METRICS_PROTOCOL:               http/protobuf
      OTEL_SERVICE_NAME:                                 py-otel-server
      OTEL_EXPORTER_OTLP_ENDPOINT:                       http://otelcol-collector.opentelemetry.svc.cluster.local:4318
      OTEL_RESOURCE_ATTRIBUTES_POD_NAME:                 py-otel-server-f89fdbc4f-mtsps (v1:metadata.name)
      OTEL_RESOURCE_ATTRIBUTES_NODE_NAME:                 (v1:spec.nodeName)
      OTEL_PROPAGATORS:                                  tracecontext,baggage
      OTEL_RESOURCE_ATTRIBUTES:                          service.name=py-otel-server,service.version=0.1.0,k8s.container.name=py-otel-server,k8s.deployment.name=py-otel-server,k8s.namespace.name=opentelemetry,k8s.node.name=$(OTEL_RESOURCE_ATTRIBUTES_NODE_NAME),k8s.pod.name=$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME),k8s.replicaset.name=py-otel-server-f89fdbc4f,service.instance.id=opentelemetry.$(OTEL_RESOURCE_ATTRIBUTES_POD_NAME).py-otel-server
    Mounts:
      /otel-auto-instrumentation-python from opentelemetry-auto-instrumentation-python (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-x2nmj (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  kube-api-access-x2nmj:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
  opentelemetry-auto-instrumentation-python:
    Type:        EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:   200Mi
QoS Class:       Burstable
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  99s   default-scheduler  Successfully assigned opentelemetry/py-otel-server-f89fdbc4f-mtsps to otel-target-allocator-talk-control-plane
  Normal  Pulling    99s   kubelet            Pulling image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0"
  Normal  Pulled     93s   kubelet            Successfully pulled image "ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.45b0" in 288.756166ms (5.603779501s including waiting)
  Normal  Created    93s   kubelet            Created container opentelemetry-auto-instrumentation-python
  Normal  Started    93s   kubelet            Started container opentelemetry-auto-instrumentation-python
  Normal  Pulled     92s   kubelet            Container image "otel-target-allocator-talk:0.1.0-py-otel-server" already present on machine
  Normal  Created    92s   kubelet            Created container py-otel-server
  Normal  Started    92s   kubelet            Started container py-otel-server
```

If the `Instrumentation` resource isn’t present by the time the `Deployment` is
deployed, the `init-container` can’t be created. This means that if the
`Deployment` resource is deployed before you deploy the `Instrumentation`
resource, the auto-instrumentation fails to initialize.

Check that the `opentelemetry-auto-instrumentation` `init-container` has started
up correctly (or has even started up at all), by running the following command:

```shell
kubectl get events -n <namespace>
```

Where `<namespace>` is the namespace in which your pod is deployed. The
resulting output should look like the following example:

```text
53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation
```

If the output is missing `Created` or `Started` entries for
`opentelemetry-auto-instrumentation`, there might be an issue with your
auto-instrumentation configuration. This can be the result of any of the
following:

- The `Instrumentation` resource wasn’t installed or wasn’t installed properly.
- The `Instrumentation` resource was installed after the application was
  deployed.
- There’s an error in the auto-instrumentation annotation, or the annotation is
  in the wrong spot. See the next section.

You might also want to check the output of the events command for any errors, as
these might help point to your issue.

### Check the auto-instrumentation annotation

Consider the following auto-instrumentation annotation snippet:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'true'
```

If your `Deployment` resource is deployed to a namespace called `application`
and you have an `Instrumentation` resource called `my-instrumentation` which is
deployed to a namespace called `opentelemetry`, then the above annotation will
not work.

Instead, the annotation should be:

```yaml
annotations:
  instrumentation.opentelemetry.io/inject-python: 'opentelemetry/my-instrumentation'
```

Where `opentelemetry` is the namespace of the `Instrumentation` resource, and
`my-instrumentation` is the name of the `Instrumentation` resource.

[The possible values for the annotation can be](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md?plain=1#L151-L156):

- "true" - inject `OpenTelemetryCollector` resource from the namespace.
- "sidecar-for-my-app" - name of `OpenTelemetryCollector` CR instance in the
  current namespace.
- "my-other-namespace/my-instrumentation" - name and namespace of
  `OpenTelemetryCollector` CR instance in another namespace.
- "false" - do not inject

### Check the auto-instrumentation configuration

The auto-instrumentation annotation might have not been added correctly. Check
for the following:

- Are you auto-instrumenting for the right language? For example, did you try to
  auto-instrument a Python application by adding a JavaScript
  auto-instrumentation annotation instead?
- Did you put the auto-instrumentation annotation in the right location? When
  you’re defining a `Deployment` resource, there are two locations where you
  could add annotations: `spec.metadata.annotations`, and
  `spec.template.metadata.annotations`. The auto-instrumentation annotation
  needs to be added to `spec.template.metadata.annotations`, otherwise it
  doesn't work.

### Check auto-instrumentation endpoint configuration

The `spec.exporter.endpoint` configuration in the `Instrumentation` resource
allows you to define the destination for your telemetry data. If you omit it, it
defaults to `http://localhost:4317`, which causes the data to be dropped.

If you’re sending out your telemetry to a [Collector](/docs/collector/), the
value of `spec.exporter.endpoint` must reference the name of your Collector
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

For example: `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Where `otel-collector` is the name of the OTel Collector Kubernetes
[`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).

In addition, if the Collector is running in a different namespace, you must
append `opentelemetry.svc.cluster.local` to the Collector’s service name, where
`opentelemetry` is the namespace in which the Collector resides. It can be any
namespace of your choosing.

Finally, make sure that you are using the right Collector port. Normally, you
can choose either `4317` (gRPC) or `4318` (HTTP); however, for
[Python auto-instrumentation, you can only use `4318`](/docs/platforms/kubernetes/operator/automatic/#python).

### Check configuration sources

Auto-instrumentation currently overrides Java's `JAVA_TOOL_OPTIONS`, Python's
`PYTHONPATH`, and Node.js's `NODE_OPTIONS` for Node.js when set in a Docker
image or when defined in a `ConfigMap`. This is a known issue, and as a result,
these methods of setting these environment variables should be avoided until the
issue is resolved.

See reference issues for
[Java](https://github.com/open-telemetry/opentelemetry-operator/issues/1814),
[Python](https://github.com/open-telemetry/opentelemetry-operator/issues/1884),
and
[Node.js](https://github.com/open-telemetry/opentelemetry-operator/issues/1393).

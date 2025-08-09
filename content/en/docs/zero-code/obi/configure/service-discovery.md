---
title: Configure OBI service discovery
linkTitle: Service discovery
description:
  Configure how the OBI service discovery component searches for processes to
  instrument.
weight: 20
# prettier-ignore
cSpell:ignore: beyla filestorecsi kube-node-lease kube-system replicaset statefulset volumepopulator
---

The `OTEL_EBPF_AUTO_TARGET_EXE` and `OTEL_EBPF_OPEN_PORT` are environment
variables that make it easier to configure OBI to instrument a single service or
a group of related services.

In some scenarios, OBI instruments many services. For example, as a
[Kubernetes DaemonSet](../../setup/kubernetes/) that instruments all the
services in a node. The `discovery` YAML section lets you specify more granular
selection criteria for the services OBI can instrument.

| YAML<br>environment variable                                                                                     | Description                                                                                                                                                                                                                                                                                                             | Type            | Default                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instrument`                                                                                                     | Specify different selection criteria for different services, and override their reported name or namespace. Refer to the [discovery services](#discovery-services) section for details. .                                                                                                                               | list of objects | (unset)                                                                                                                                                       |
| `exclude_instrument`                                                                                             | Specify selection criteria for excluding services from being instrumented. Useful for avoiding instrumentation of services typically found in observability environments. Refer to the [exclude services from instrumentation](#exclude-services-from-instrumentation) section for details.                             | list of objects | (unset)                                                                                                                                                       |
| `default_exclude_instrument`                                                                                     | Disables instrumentation of OBI itself, the OpenTelemetry Collector, and other observability components. Set to empty to allow OBI to instrument itself and these other components. Refer to the [default exclude services from instrumentation](#default-exclude-services-from-instrumentation) section for details. . | list of objects | Path: `{*beyla,*alloy,*prometheus-config-reloader,*ebpf-instrument,*otelcol,*otelcol-contrib,*otelcol-contrib[!/]*}` and certain Kubernetes system namespaces |
| `skip_go_specific_tracers`<br>`OTEL_EBPF_SKIP_GO_SPECIFIC_TRACERS`                                               | Disables the detection of Go specifics when the **eBPF** tracer inspects executables to be instrumented. The tracer falls back to using generic instrumentation, which is generally less efficient. Refer to the [skip go specific tracers](#skip-go-specific-tracers) section for details. .                           | boolean         | false                                                                                                                                                         |
| `exclude_otel_instrumented_services`<br>`OTEL_EBPF_EXCLUDE_OTEL_INSTRUMENTED_SERVICES`                           | Disables OBI instrumentation of services already instrumented with OpenTelemetry. Refer to the [exclude instrumented services](#exclude-otel-instrumented-services) section for details.                                                                                                                                | boolean         | true                                                                                                                                                          |
| `exclude_otel_instrumented_services_span_metrics`<br>`OTEL_EBPF_EXCLUDE_OTEL_INSTRUMENTED_SERVICES_SPAN_METRICS` | Disables OBI span metric/service graph metric generation of services already instrumented with OpenTelemetry. Refer to the [exclude instrumented services](#exclude-otel-instrumented-services) section for details.                                                                                                    | boolean         | false                                                                                                                                                         |

## Discovery services

You can override the service name, namespace, and other configurations per
service type.

| YAML                   | Description                                                                                                                              | Type                     | Default |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| `open_ports`           | Selects the process to instrument by the port it has open (listens to). Refer to [open ports](#open-ports).                              | string                   | (unset) |
| `exe_path`             | Selects the processes to instrument by their executable name path. Refer to [executable path](#executable-path).                         | string (glob)            | (unset) |
| `containers_only`      | Selects processes to instrument which are running in an OCI container. Refer to [containers only](#containers-only).                     | boolean                  | false   |
| `k8s_namespace`        | Filter services by Kubernetes namespace. Refer to [K8s namespace](#k8s-namespace).                                                       | string (glob)            | (unset) |
| `k8s_pod_name`         | Filter services by Kubernetes Pod. Refer to [K8s Pod name](#k8s-pod-name).                                                               | string (glob)            | (unset) |
| `k8s_deployment_name`  | Filter services by Kubernetes Deployment. Refer to [K8s deployment name](#k8s-deployment-name).                                          | string (glob)            | (unset) |
| `k8s_replicaset_name`  | Filter services by Kubernetes ReplicaSet. Refer to [K8s ReplicaSet name](#k8s-replicaset-name).                                          | string (glob)            | (unset) |
| `k8s_statefulset_name` | Filter services by Kubernetes StatefulSet. Refer to [K8s StatefulSet name](#k8s-statefulset-name).                                       | string (glob)            | (unset) |
| `k8s_daemonset_name`   | Filter services by Kubernetes DaemonSet. Refer to [K8s DaemonSet name](#k8s-daemonset-name).                                             | string (glob)            | (unset) |
| `k8s_owner_name`       | Filter services by Kubernetes Pod owner (Deployment, ReplicaSet, DaemonSet, or StatefulSet). Refer to [K8s owner name](#k8s-owner-name). | string (glob)            | (unset) |
| `k8s_pod_labels`       | Filter services by Kubernetes Pod labels. Refer to [K8s Pod labels](#k8s-pod-labels).                                                    | map[string]string (glob) | (unset) |
| `k8s_pod_annotations`  | Filter services by Kubernetes Pod annotations. Refer to [K8s Pod annotations](#k8s-pod-annotations).                                     | map[string]string (glob) | (unset) |

### Open ports

Selects the process to instrument by the port it has open (listens to). This
property accepts a comma-separated list of ports, for example `80`, and port
ranges, for example `8000-8999`. If the executable matches only one of the ports
in the list, OBI considers it a match.

For example, specifying the following property:

```yaml
discovery:
  instrument:
    - open_ports: 80,443,8000-8999
```

OBI selects any executable that opens port 80, 443, or any of the ports between
8000 and 8999 included.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

If an executable opens multiple ports, you only need to specify one of those
ports for OBI to instrument all the HTTP/S and gRPC requests on all application
ports. Currently, you can't restrict the instrumentation only to the methods
exposed through a specific port.

### Executable path

Selects the processes to instrument by their executable name path. This property
accepts a glob to match against the full executable command line, including the
directory where the executable resides on the file system.

OBI tries to instrument all the processes with an executable path matching this
property. For example, setting `exe_path: *` makes OBI try to instrument all the
executables in the host.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### Containers only

Selects processes to instrument which are running in an OCI container. To
perform this check, OBI inspects the process network namespace and matches it
against its own network namespace. If OBI doesn't have enough permissions to
perform the network namespace inspection, it ignores this option.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s namespace

This selector property limits the instrumentation to the applications running in
the Kubernetes Namespaces with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s Pod name

This selector property limits the instrumentation to the applications running in
the Kubernetes Pods with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s deployment name

This selector property limits the instrumentation to the applications running in
the Kubernetes Deployments with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s replicaset name

This selector property limits the instrumentation to the applications running in
the Kubernetes ReplicaSets with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s statefulset name

This selector property limits the instrumentation to the applications running in
the Kubernetes StatefulSets with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s daemonset name

This selector property limits the instrumentation to the applications running in
the Kubernetes DaemonSet with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s owner name

This selector property limits the instrumentation to the applications running in
the Pods owned by a `Deployment`, `ReplicaSet`, `DaemonSet`, or `StatefulSet`
with a name matching the provided glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

### K8s Pod labels

This selector property limits the instrumentation to the applications running in
the Pods with labels matching the provided value as glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

For example:

```yaml
discovery:
  instrument:
    - k8s_namespace: frontend
      k8s_pod_labels:
        instrument: obi
```

The preceding example discovers all Pods in the `frontend` namespace that have a
label `instrument` with a value that matches the glob `obi`.

### K8s Pod annotations

This selector property limits the instrumentation to the applications running in
the Pods with annotations matching the provided value as glob.

If you specify other selectors in the same `instrument` entry, the processes
must match all the selector properties.

For example:

```yaml
discovery:
  instrument:
    - k8s_namespace: backend
      k8s_pod_annotations:
        obi.instrument: 'true'
```

The preceding example discovers all Pods in the `backend` namespace that have an
annotation `obi.instrument` with a value that matches the glob `true`.

## Exclude services from instrumentation

The `exclude_instrument` section lets you specify selection criteria for
excluding services from being instrumented. It follows the same definition
format as described in the [discovery services](#discovery-services) section of
this document.

This option helps you avoid instrumenting services typically found in
observability environments. For example, use this option to exclude
instrumenting Prometheus.

## Default exclude services from instrumentation

The `default_exclude_instrument` section disables instrumentation of OBI itself
(self-instrumentation), the OpenTelemetry Collector and other observability
components. It also disables instrumentation of various Kubernetes system
namespaces to reduce the overall cost of metric generation. The following
section contains all excluded components:

- Excluded services by `exe_path`: `*beyla`, `*alloy`, `*ebpf-instrument`,
  `*otelcol`, `*otelcol-contrib`, `*otelcol-contrib[!/]*`.
- Excluded services by `k8s_namespace`: `kube-system`, `kube-node-lease`,
  `local-path-storage`, `grafana-alloy`, `cert-manager`, `monitoring`,
  `gke-connect`, `gke-gmp-system`, `gke-managed-cim`,
  `gke-managed-filestorecsi`, `gke-managed-metrics-server`,
  `gke-managed-system`, `gke-system`, `gke-managed-volumepopulator`,
  `gatekeeper-system`.

Change this option to allow OBI to instrument itself or some of the other
excluded components.

Note: to enable such self-instrumentation, you still need to include them in the
`instrument` section, or these components need to be a part of a encompassing
inclusion criteria.

## Skip go specific tracers

The `skip_go_specific_tracers` option disables the detection of Go specifics
when the **eBPF** tracer inspects executables to be instrumented. The tracer
falls back to using generic instrumentation, which is generally less efficient.

## Exclude OTel instrumented services

The `exclude_otel_instrumented_services` option disables OBI instrumentation of
services already instrumented with OpenTelemetry. Since OBI is often deployed to
monitor all services in a Kubernetes cluster, monitoring already instrumented
services can lead to duplicate telemetry data, unless you carefully craft the
instrumentation selection (or exclusion) criteria. To avoid unnecessary
configuration overhead, OBI monitors for OpenTelemetry SDK calls to publish
metrics and traces, and automatically turns off instrumentation of services that
publish their own telemetry data. Turn this option off if your
application-generated telemetry data doesn't conflict with the OBI generated
metrics and traces.

## Override service name and namespace

If you export instrumentation data via OpenTelemetry or Prometheus, OBI follows
the
[service name conventions from the OpenTelemetry operator](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#how-resource-attributes-are-calculated-from-the-pods-metadata)
to improve interoperability with other instrumentation solutions.

OBI uses the following criteria in this order to automatically set the service
name and namespace:

1. Resource attributes set via `OTEL_RESOURCE_ATTRIBUTES` and
   `OTEL_SERVICE_NAME` environment variables of the instrumented process or
   container.
2. In Kubernetes, resource attributes set via the following Pod annotations:
   - `resource.opentelemetry.io/service.name`
   - `resource.opentelemetry.io/service.namespace`
3. In Kubernetes, resource attributes set via the following Pod labels:
   - `app.kubernetes.io/name` sets the service name
   - `app.kubernetes.io/part-of` sets the service namespace
4. In Kubernetes, resource attributes calculated from the Pod owner's metadata,
   in the following order (according to their availability):
   - `k8s.deployment.name`
   - `k8s.replicaset.name`
   - `k8s.statefulset.name`
   - `k8s.daemonset.name`
   - `k8s.cronjob.name`
   - `k8s.job.name`
   - `k8s.pod.name`
   - `k8s.container.name`
5. The executable name of the instrumented process.

You can override the Kubernetes labels from the previous bullet 3 via
configuration.

In YAML:

```yaml
kubernetes:
  resource_labels:
    service.name:
      # gets service name from the first existing Pod label
      - override-svc-name
      - app.kubernetes.io/name
    service.namespace:
      # gets service namespace from the first existing Pod label
      - override-svc-ns
      - app.kubernetes.io/part-of
```

They accept a comma-separated list of annotation and label names.

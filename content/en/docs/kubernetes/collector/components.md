---
title: Important Components for Kubernetes
linkTitle: Components
spelling:
  cSpell:ignore filelog crio containerd logtag gotime iostream varlogpods
  cSpell:ignore varlibdockercontainers UIDs k8sattributes replicasets
---

The [OpenTelemetry Collector](/docs/collector/) supports many different
receivers and processors to facilitate monitoring Kubernetes. This section
covers the components that are most important for collecting Kubernetes data and
enhancing it.

Components covered in this page:

- [Kubernetes Attributes Processor](#kubernetes-attributes-processor): adds
  Kubernetes metadata to incoming telemetry.
- [Filelog Receiver](#filelog-receiver): collects Kubernetes logs and
  application logs written to stdout/stderr.

For application traces, metrics, or logs, we recommend the
[OTLP receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver),
but any receiver that fits your data is appropriate.

## Kubernetes Attributes Processor

| Deployment Pattern   | Usable |
| -------------------- | ------ |
| DaemonSet (Agent)    | Yes    |
| Deployment (Gateway) | Yes    |
| Sidecar              | No     |

The Kubernetes Attributes Processor automatically discovers Kubernetes pods,
extracts their metadata, and adds the extracted metadata to spans, metrics, and
logs as resource attributes.

**The Kubernetes Attributes Processor is one of the most important components
for a collector running in Kubernetes. Any collector receiving application data
should use it.** Because it adds Kubernetes context to your telemetry, the
Kubernetes Attributes Processor lets you correlate your application's traces,
metrics, and logs signals with your Kubernetes telemetry, such as pod metrics
and traces.

The Kubernetes Attributes Processor uses the Kubernetes API to discover all pods
running in a cluster and keeps a record of their IP addresses, pod UIDs, and
interesting metadata. By default, data passing through the processor is
associated to a pod via the incoming request's IP address, but different rules
can be configured. Since the processor uses the Kubernetes API, it requires
special permissions (see example below). If you're using the
[OpenTelemetry Collector Helm chart](../../helm/collector/) you can use the
[`kubernetesAttributes` preset](../../helm/collector/#kubernetes-attributes-preset)
to get started.

The following attributes are added by default:

- `k8s.namespace.name`
- `k8s.pod.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.deployment.name`
- `k8s.node.name`

The Kubernetes Attributes Processor can also set custom resource attributes for
traces, metrics, and logs using the Kubernetes labels and Kubernetes annotations
you've added to your pods and namespaces.

```yaml
k8sattributes:
  auth_type: 'serviceAccount'
  extract:
    metadata: # extracted from the pod
      - k8s.namespace.name
      - k8s.pod.name
      - k8s.pod.start_time
      - k8s.pod.uid
      - k8s.deployment.name
      - k8s.node.name
    annotations:
      # Extracts the value of a pod annotation with key `annotation-one` and inserts it as a resource attribute with key `a1`
      - tag_name: a1
        key: annotation-one
        from: pod
      # Extracts the value of a namespaces annotation with key `annotation-two` with regexp and inserts it as a resource  with key `a2`
      - tag_name: a2
        key: annotation-two
        regex: field=(?P<value>.+)
        from: namespace
    labels:
      # Extracts the value of a namespaces label with key `label1` and inserts it as a resource attribute with key `l1`
      - tag_name: l1
        key: label1
        from: namespace
      # Extracts the value of a pod label with key `label2` with regexp and inserts it as a resource attribute with key `l2`
      - tag_name: l2
        key: label2
        regex: field=(?P<value>.+)
        from: pod
  pod_association: # How to associate the data to a pod (order matters)
    - sources: # First try to use the value of the resource attribute k8s.pod.ip
        - from: resource_attribute
          name: k8s.pod.ip
    - sources: # Then try to use the value of the resource attribute k8s.pod.uid
        - from: resource_attribute
          name: k8s.pod.uid
    - sources: # If neither of those work, use the request's connection to get the pod IP.
        - from: connection
```

There are also special configuration options for when the collector is deployed
as a Kubernetes DaemonSet (agent) or as a Kubernetes Deployment (gateway). For
details, see
[Deployment Scenarios](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor#deployment-scenarios)

For Kubernetes Attributes Processor configuration details, see
[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor).

Since the processor uses the Kubernetes API, it needs the correct permission to
work correctly. For most use cases, you should give the service account running
the collector the following permissions via a ClusterRole.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: collector
  namespace: <OTEL_COL_NAMESPACE>
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector
rules:
  - apiGroups:
      - ''
    resources:
      - 'pods'
      - 'namespaces'
    verbs:
      - 'get'
      - 'watch'
      - 'list'
  - apiGroups:
      - 'apps'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
  - apiGroups:
      - 'extensions'
    resources:
      - 'replicasets'
    verbs:
      - 'get'
      - 'list'
      - 'watch'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector
subjects:
  - kind: ServiceAccount
    name: collector
    namespace: <OTEL_COL_NAMESPACE>
roleRef:
  kind: ClusterRole
  name: otel-collector
  apiGroup: rbac.authorization.k8s.io
```

## Filelog Receiver

| Deployment Pattern   | Usable                                                          |
| -------------------- | --------------------------------------------------------------- |
| DaemonSet (Agent)    | Preferred                                                       |
| Deployment (Gateway) | Yes, but will only collect logs from the node it is deployed on |
| Sidecar              | Yes, but this would be considered advanced configuration        |

The Filelog Receiver tails and parses logs from files. Although it's not a
Kubernetes-specific receiver, it is still the de facto solution for collecting
any logs from Kubernetes.

The Filelog Receiver is composed of Operators that are chained together to
process a log. Each Operator performs a simple responsibility, such as parsing a
timestamp or JSON. Configuring a Filelog Receiver is not trivial. If you're
using the [OpenTelemetry Collector Helm chart](../../helm/collector/) you can
use the [`logsCollection` preset](../../helm/collector/#logs-collection-preset)
to get started.

Since Kubernetes logs normally fit a set of standard formats, a typical Filelog
Receiver configuration for Kubernetes looks like:

```yaml
filelog:
  include:
    - /var/log/pods/*/*/*.log
  exclude:
    # Exclude logs from all containers named otel-collector
    - /var/log/pods/*/otel-collector/*.log
  start_at: beginning
  include_file_path: true
  include_file_name: false
  operators:
    # Find out which format is used by kubernetes
    - type: router
      id: get-format
      routes:
        - output: parser-docker
          expr: 'body matches "^\\{"'
        - output: parser-crio
          expr: 'body matches "^[^ Z]+ "'
        - output: parser-containerd
          expr: 'body matches "^[^ Z]+Z"'
    # Parse CRI-O format
    - type: regex_parser
      id: parser-crio
      regex:
        '^(?P<time>[^ Z]+) (?P<stream>stdout|stderr) (?P<logtag>[^ ]*)
        ?(?P<log>.*)$'
      output: extract_metadata_from_filepath
      timestamp:
        parse_from: attributes.time
        layout_type: gotime
        layout: '2006-01-02T15:04:05.999999999Z07:00'
    # Parse CRI-Containerd format
    - type: regex_parser
      id: parser-containerd
      regex:
        '^(?P<time>[^ ^Z]+Z) (?P<stream>stdout|stderr) (?P<logtag>[^ ]*)
        ?(?P<log>.*)$'
      output: extract_metadata_from_filepath
      timestamp:
        parse_from: attributes.time
        layout: '%Y-%m-%dT%H:%M:%S.%LZ'
    # Parse Docker format
    - type: json_parser
      id: parser-docker
      output: extract_metadata_from_filepath
      timestamp:
        parse_from: attributes.time
        layout: '%Y-%m-%dT%H:%M:%S.%LZ'
    - type: move
      from: attributes.log
      to: body
    # Extract metadata from file path
    - type: regex_parser
      id: extract_metadata_from_filepath
      regex: '^.*\/(?P<namespace>[^_]+)_(?P<pod_name>[^_]+)_(?P<uid>[a-f0-9\-]{36})\/(?P<container_name>[^\._]+)\/(?P<restart_count>\d+)\.log$'
      parse_from: attributes["log.file.path"]
      cache:
        size: 128 # default maximum amount of Pods per Node is 110
    # Rename attributes
    - type: move
      from: attributes.stream
      to: attributes["log.iostream"]
    - type: move
      from: attributes.container_name
      to: resource["k8s.container.name"]
    - type: move
      from: attributes.namespace
      to: resource["k8s.namespace.name"]
    - type: move
      from: attributes.pod_name
      to: resource["k8s.pod.name"]
    - type: move
      from: attributes.restart_count
      to: resource["k8s.container.restart_count"]
    - type: move
      from: attributes.uid
      to: resource["k8s.pod.uid"]
```

For Filelog Receiver configuration details, see
[Filelog Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver).

In addition to the Filelog Receiver configuration, your OpenTelemetry Collector
installation in Kubernetes will need access to the logs it wants to collect.
Typically this means adding some volumes and volumeMounts to your collector
manifest:

```yaml
---
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
        - name: opentelemetry-collector
          ...
          volumeMounts:
            ...
            # Mount the volumes to the collector container
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            ...
      volumes:
        ...
        # Typically the collector will want access to pod logs and container logs
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        ...
```

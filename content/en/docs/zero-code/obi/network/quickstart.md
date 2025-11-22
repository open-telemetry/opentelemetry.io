---
title: OBI network metrics quickstart
linkTitle: Quickstart
description:
  A quickstart guide to produce Network Metrics from OpenTelemetry eBPF
  Instrumentation
weight: 1
---

OBI can generate network metrics in any environment (physical host, virtual
host, or container). It's recommended to use a Kubernetes environment, as OBI is
able to decorate each metric with the metadata of the source and destination
Kubernetes entities.

The instructions in this quickstart guide focus on deploying directly to
Kubernetes with the kubectl command line utility. This tutorial describes how to
deploy OBI in Kubernetes from scratch. To use Helm, consult the
[Deploy OBI in Kubernetes with Helm](../../setup/kubernetes-helm/)
documentation.

## Deploy OBI with network metrics

To enable network metrics, set the following option in your OBI configuration:

Environment variables:

```bash
export OBI_NETWORK_METRICS=true
```

Network metrics requires metrics to be decorated with Kubernetes metadata. To
enable this feature, set the following option in your OBI configuration:

Environment variables:

```bash
export OBI_KUBE_METADATA_ENABLE=true
```

For more configuration options, refer to the
[OBI configuration options](../../configure/options/).

To learn more about OBI configuration, consult the
[OBI configuration documentation](../../configure/options/).

## Simple setup

### Deploy OBI

The following YAML configuration provides a simple OBI deployment for network
metrics:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
  name: obi
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    network:
      enable: true
    attributes:
      kubernetes:
        enable: true
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  namespace: obi
  name: obi
spec:
  selector:
    matchLabels:
      instrumentation: obi
  template:
    metadata:
      labels:
        instrumentation: obi
    spec:
      serviceAccountName: obi
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: obi-config
          configMap:
            name: obi-config
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
          env:
            - name: OBI_CONFIG_PATH
              value: '/config/obi-config.yml'
```

Some observations about this configuration:

- The container image uses the latest under-development
  `otel/ebpf-instrument:main` image.
- OBI needs to run as a DaemonSet, as it is requires only one OBI instance per
  node
- To listen to network packets on the host, OBI requires the `hostNetwork: true`
  permission

### Verify network metrics generation

If everything works as expected, your OBI instances should be capturing and
processing network flows. To test this, check the logs for the OBI DaemonSet to
see some debug information being printed:

```bash
kubectl logs daemonset/obi -n obi | head
```

The output would be something like:

```text
network_flow: obi.ip=172.18.0.2 iface= direction=255 src.address=10.244.0.4 dst.address=10.96.0.1
```

### Export metrics to OpenTelemetry endpoint

After you have confirmed that network metrics are being collected, configure OBI
to export the metrics in OpenTelemetry format to a collector endpoint.

Check the
[data export documentation](/docs/zero-code/obi/configure/export-data#opentelemetry-metrics-exporter-component)
to configure the OpenTelemetry exporter.

### Allowed attributes

Be default, OBI includes the following [attributes](./) in the
`obi.network.flow.bytes` metric:

- `k8s.src.owner.name`
- `k8s.src.namespace`
- `k8s.dst.owner.name`
- `k8s.dst.namespace`
- `k8s.cluster.name`

OBI only includes a subset of the available attributes to avoid leading to a
cardinality explosion.

For example:

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.name
    - k8s.dst.owner.type
```

The equivalent Prometheus metric would be:

```text
obi.network.flow.bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

The previous example would aggregate the `obi.network.flow.bytes` value by
source and destination Kubernetes owner name and type, instead of individual pod
names.

## CIDR configuration

You can configure OBI to also break down metrics by CIDR ranges. This is useful
for tracking traffic to specific network ranges, such as cloud provider IP
ranges, or internal/external traffic.

The `cidrs` YAML subsection in `network` (or the `OBI_NETWORK_CIDRS` environment
variable) accepts a list of CIDR ranges, and the corresponding name.

For example, to track metrics by predefined networks:

```yaml
network:
  cidrs:
    - cidr: 10.0.0.0/8
      name: 'cluster-internal'
    - cidr: 192.168.0.0/16
      name: 'private'
    - cidr: 172.16.0.0/12
      name: 'container-internal'
```

Then, the equivalent Prometheus metric would be:

```text
obi_network_flow_bytes:
  src_cidr="cluster-internal"
  dst_cidr="private"
```

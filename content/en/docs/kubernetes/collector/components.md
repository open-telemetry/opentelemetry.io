---
title: Important Components for Kubernetes
linkTitle: Components
spelling:
  cSpell:ignore filelog crio containerd logtag gotime iostream varlogpods
  cSpell:ignore varlibdockercontainers
---

## Introduction

The [OpenTelemetry Collector](/docs/collector) community support many different
receivers and processors to facilitate monitoring Kubernetes. This section will
cover the components that are most important for collecting Kubernetes data as
well as enhancing is.

Important Components:

- [Filelog Receiver](#filelog-receiver) - used to collector Kubernetes logs and
  application logs written to stdout/stderr.

For application traces, metrics, or logs, we recommend the
[OTLP receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver),
but any receiver that fits your data is appropriate.

## Filelog Receiver

The Filelog Receiver tails and parses logs from files. Although not a
Kubernetes-specific receiver, it is still the defacto solution for collecting
any logs from Kubernetes.

The Filelog Receiver is composed of Operators that are chained together to
process a log. Each Operator performs a simple responsibility, such as parsing a
timestamp or JSON. Since Kubernetes logs normally fit a set of standard formats,
a typical Filelog Receiver configuration for Kubernetes looks like:

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

For in-depth details of how to configure a Filelog Receiver visit its
[documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver).

In addition to the Filelog Receiver configuration, your OpenTelemetry Collector
installation in Kubernetes will need access to the logs it wants to collect.
Typically this means adding some volumes and volumeMounts to your collector
manifest

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

Configuring a Filelog Receiver is not trivial. If you're using the
[OpenTelemetry Collector Helm chart](/docs/kubernetes/helm/collector/) you can
use the
[`logsCollection` preset](/docs/kubernetes/helm/collector/#logs-collection-preset)
to get started.

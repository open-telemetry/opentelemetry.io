---
title: Transforming telemetry
weight: 26
---

The OpenTelemetry Collector is a convenient place to transform data before
sending it to a vendor or other systems. This is frequently done for data
quality, governance, cost, and security reasons.

Processors available from the the
[Collector Contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)
support dozens of different transformations on metric, span and log data. The
following sections provide some basic examples on getting started with a few
frequently-used processors.

The configuration of processors, particularly advanced transformations, may have
a significant impact on collector performance.

## Basic filtering

**Processor**:
[filter processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)

The filter processor allows users to filter telemetry based on `include` or
`exclude` rules. Include rules are used for defining "allow lists" where
anything that does _not_ match include rules is dropped from the collector.
Exclude rules are used for defining "deny lists" where telemetry that matches
rules is dropped from the collector.

For example, to _only_ allow span data from services app1, app2, and app3 and
drop data from all other services:

```yaml
processors:
  filter/allowlist:
    spans:
      include:
        match_type: strict
        services:
          - app1
          - app2
          - app3
```

To only block spans from a service called development while allowing all other
spans, an exclude rule is used:

```yaml
processors:
  filter/denylist:
    spans:
      exclude:
        match_type: strict
        services:
          - development
```

The
[filter processor docs](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)
have more examples, including filtering on logs and metrics.

## Adding or Deleting Attributes

**Processor**:
[attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor)
or
[resource processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourceprocessor)

The attributes processor can be used to update, insert, delete, or replace
existing attributes on metrics or traces. For example, here’s a configuration
that adds an attribute called account_id to all spans:

```yaml
processors:
  attributes/accountid:
    actions:
      - key: account_id
        value: 2245
        action: insert
```

The resource processor has an identical configuration, but applies only to
[resource attributes](/docs/specs/otel/resource/semantic_conventions/). Use the
resource processor to modify infrastructure metadata related to telemetry. For
example, this inserts the Kubernetes cluster name:

```yaml
processors:
  resource/k8s:
    attributes:
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
```

## Renaming Metrics or Metric Labels

**Processor:**
[metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)

The
[metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)
shares some functionality with the
[attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor),
but also supports renaming and other metric-specific functionality.

```yaml
processors:
  metricstransform/rename:
    transforms:
      include: system.cpu.usage
      action: update
      new_name: system.cpu.usage_time
```

The
[metrics transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor)
also supports regular expressions to apply transform rules to multiple metric
names or metric labels at the same time. This example renames cluster_name to
cluster-name for all metrics:

```yaml
processors:
  metricstransform/clustername:
    transforms:
      - include: ^.*$
        match_type: regexp
        action: update
        operations:
          - action: update_label
            label: cluster_name
            new_label: cluster-name
```

## Enriching Telemetry with Resource Attributes

**Processor**:
[resource detection processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)
and
[k8sattributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)

These processors can be used for enriching telemetry with relevant
infrastructure metadata to help teams quickly identify when underlying
infrastructure is impacting service health or performance.

The resource detection processor adds relevant cloud or host-level information
to telemetry:

```yaml
processors:
  resourcedetection/system:
    # Modify the list of detectors to match the cloud environment
    detectors: [env, system, gcp, ec2, azure]
    timeout: 2s
    override: false
```

Similarly, the K8s processor enriches telemetry with relevant Kubernetes
metadata like pod name, node name, or workload name. The collector pod must be
configured to have read access to certain Kubernetes RBAC APIs, which is
documented
[here](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#hdr-RBAC).
To use the default options, it can be configured with an empty block:

```yaml
processors:
  k8sattributes/default:
```

## Advanced Transformations

More advanced attribute transformations are also available in the
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor).
The transform processor allows end-users to specify transformations on metrics,
logs, and traces using the
[OpenTelemetry Transformation Language](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl).

---
title: Transforming telemetry
weight: 26
# prettier-ignore
cSpell:ignore: accountid clustername k8sattributes metricstransform OTTL resourcedetection
---

The OpenTelemetry Collector is a convenient place to transform data before
sending it to a vendor or other systems. This is frequently done for data
quality, governance, cost, and security reasons.

Processors available from the
[Collector Contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)
support dozens of different transformations on metric, span and log data. The
following sections provide some basic examples on getting started with a few
frequently-used processors.

The configuration of processors, particularly advanced transformations, may have
a significant impact on collector performance.

## Basic filtering

**Processor**:
[filter processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)

The filter processor allows users to filter telemetry using
[OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md).
Telemetry that matches any condition is dropped.

For example, to _only_ allow span data from services app1, app2, and app3 and
drop data from all other services:

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - |
        resource.attributes["service.name"] != "app1" and
        resource.attributes["service.name"] != "app2" and
        resource.attributes["service.name"] != "app3"
```

To only drop spans from a service called `service1` while keeping all other
spans:

```yaml
processors:
  filter/ottl:
    error_mode: ignore
    traces:
      span:
        - resource.attributes["service.name"] == "service1"
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
[resource attributes](/docs/specs/semconv/resource/). Use the resource processor
to modify infrastructure metadata related to telemetry. For example, this
inserts the Kubernetes cluster name:

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
      - include: system.cpu.usage
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
configured to have
[read access to certain Kubernetes RBAC APIs](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor#readme-role-based-access-control).
To use the default options, it can be configured with an empty block:

```yaml
processors:
  k8sattributes/default:
```

## Setting a span status

**Processor**:
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor)

Use the transform processor to set a span's status. The following example sets
the span status to `Ok` when the `http.request.status_code` attribute is 400:

<!-- prettier-ignore-start -->

```yaml
transform:
  error_mode: ignore
  trace_statements:
    - set(span.status.code, STATUS_CODE_OK) where span.attributes["http.request.status_code"] == 400
```

<!-- prettier-ignore-end -->

You can also use the transform processor to modify the span name based on its
attributes or extract span attributes from the span name. For examples, see an
example
[config file](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9b28f76c02c18f7479d10e4b6a95a21467fd85d6/processor/transformprocessor/testdata/config.yaml)
file for the transform processor.

## Advanced Transformations

More advanced attribute transformations are also available in the
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor).
The transform processor allows end-users to specify transformations on metrics,
logs, and traces using the
[OpenTelemetry Transformation Language](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl).

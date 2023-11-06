---
title: Target Allocator
description:
  A tool to distribute targets of the PrometheusReceiver on all deployed
  Collector instances
cSpell:ignore: labeldrop labelmap statefulset
---

The OpenTelemetry Operator comes with an optional component, the
[Target Allocator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator)
(TA). In a nutshell, the TA is a mechanism for decoupling the service discovery
and metric collection functions of Prometheus such that they can be scaled
independently. The Collector manages Prometheus metrics without needing to
install Prometheus. The TA manages the configuration of the Collector's
Prometheus Receiver.

The TA serves two functions:

1. Even distribution of Prometheus targets among a pool of Collectors
2. Discovery of Prometheus Custom Resources

## Getting Started

When creating an OpenTelemetryCollector Custom Resource (CR) and setting the TA
as enabled, the Operator will create a new deployment and service to serve
specific `http_sd_config` directives for each Collector pod as part of that CR.
It will also change the Prometheus receiver configuration in the CR, so that it
uses the [http_sd_config](https://prometheus.io/docs/prometheus/latest/http_sd/)
from the TA. The following example shows how to get started with the Target
Allocator:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config: |
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]
            metric_relabel_configs:
            - action: labeldrop
              regex: (id|name)
              replacement: $$1
            - action: labelmap
              regex: label_(.+)
              replacement: $$1 

    exporters:
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

Behind the scenes, the OpenTelemetry Operator will convert the Collector’s
configuration after the reconciliation into the following:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 10s
          http_sd_configs:
            - url: http://collector-with-ta-targetallocator:80/jobs/otel-collector/targets?collector_id=$POD_NAME
          metric_relabel_configs:
            - action: labeldrop
              regex: (id|name)
              replacement: $$1
            - action: labelmap
              regex: label_(.+)
              replacement: $$1

exporters:
  debug:

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      processors: []
      exporters: [debug]
```

Note how the Operator removes any existing service discovery configurations
(e.g., `static_configs`, `file_sd_configs`, etc.) from the `scrape_configs`
section and adds an `http_sd_configs` configuration pointing to a Target
Allocator instance it provisioned.

For more detailed information on the TargetAllocator, see
[TargetAllocator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator).

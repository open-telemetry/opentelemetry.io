---
title: Business Metrics Service
linkTitle: Business Metrics
---

This optional Java service consumes orders from Kafka and records business
metrics. It uses its own consumer group, so it receives orders independently of
accounting and fraud detection. Checkout does not depend on this service.

[Business metrics service source](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/business-metrics)

## Instrumentation

The application uses the OpenTelemetry API to record custom metrics. Its image
contains no SDK, exporter, or Java agent. Without injected instrumentation it
processes orders and writes Java logging messages, but does not export
telemetry.

In Kubernetes, the
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) supplies Java
instrumentation. Install the operator and create an
[Instrumentation resource](/docs/platforms/kubernetes/operator/automatic/) in
the demo namespace, pointing its exporter to your Collector. The optional
deployment uses the pod annotation
`instrumentation.opentelemetry.io/inject-java: "true"` to request injection.

The injected agent supplies the SDK and exporters, instruments the Kafka
consumer, and exports Java logging messages. Kafka processing spans and logs can
be correlated with the metrics.

## Metrics

| Metric                 | Unit         | Description                                                 |
| ---------------------- | ------------ | ----------------------------------------------------------- |
| `demo.business.orders` | `{order}`    | Number of processed orders                                  |
| `demo.business.sales`  | `{currency}` | Product prices multiplied by quantities, excluding shipping |

Sales are grouped by the `currency` attribute, so amounts in different
currencies are not combined. Use a one-hour increase to display sales per hour,
grouped by currency. The counters reset when the process restarts.

Offsets are committed after each batch. A crash can cause replay and count an
order again. These metrics demonstrate instrumentation and are not a financial
ledger. Malformed messages are logged and skipped, and Kafka tombstones are
ignored.

## Deployment

The service is excluded from the default deployment. To run it with Docker
Compose, without instrumentation, add the optional layer:

```sh
docker compose -f compose.yaml -f compose.full.yaml -f compose.business-metrics.yaml up --build
```

For Kubernetes, build the image and load it into your local cluster, then apply
the optional deployment in the demo namespace:

```sh
docker build -f src/business-metrics/Dockerfile -t otel-demo-business-metrics:local .
kubectl apply -n <demo-namespace> -f src/business-metrics/kubernetes.yaml
```

For remote clusters, push the image to your registry and update the deployment's
image reference. Set `KAFKA_ADDR` to your Kafka service address if it differs
from `kafka:9092`. `KAFKA_TOPIC` defaults to `orders`.

The Helm chart also supports `components.business-metrics.enabled=true`. Select
the built image with `components.business-metrics.imageOverride` until it is
included in a demo release. The component does not expose a port or Service.

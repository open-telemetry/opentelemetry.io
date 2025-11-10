---
title: Telemetry Features
linkTitle: Telemetry Features
aliases: [demo_features, features]
---

## OpenTelemetry

- **[OpenTelemetry Traces](/docs/concepts/signals/traces/)**: all services are
  instrumented using OpenTelemetry available instrumentation libraries.
- **[OpenTelemetry Metrics](/docs/concepts/signals/metrics/)**: select services
  are instrumented using OpenTelemetry available instrumentation libraries. More
  will be added as the relevant SDKs are released.
- **[OpenTelemetry Logs](/docs/concepts/signals/logs/)**: select services are
  instrumented using OpenTelemetry available instrumentation libraries. More
  will be added as the relevant SDKs are released.
- **[OpenTelemetry Collector](/docs/collector/)**: all services are instrumented
  and sending the generated traces and metrics to the OpenTelemetry Collector
  via gRPC. The received traces are then exported to the logs and to Jaeger;
  received metrics and exemplars are exported to logs and Prometheus.

## Observability Solutions

- **[Grafana](https://grafana.com/)**: all metric dashboards are stored in
  Grafana.
- **[Jaeger](https://www.jaegertracing.io/)**: all generated traces are being
  sent to Jaeger.
- **[OpenSearch](https://opensearch.org/)**: all generated logs are sent to Data
  Prepper. OpenSearch will be used to centralize logging data from services.
- **[Prometheus](https://prometheus.io/)**: all generated metrics and exemplars
  are scraped by Prometheus.

## Environments

- **[Docker](https://docs.docker.com)**: this forked sample can be executed with
  Docker.
- **[Kubernetes](https://kubernetes.io/)**: the app is designed to run on
  Kubernetes (both locally, as well as on the cloud) using a Helm chart.

## Protocols

- **[gRPC](https://grpc.io/)**: microservices use a high volume of gRPC calls to
  communicate to each other.
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**: microservices use
  HTTP where gRPC is unavailable or not well supported.

## Other Components

- **[Envoy](https://www.envoyproxy.io/)**: Envoy is used as a reverse proxy for
  user-facing web interfaces such as the frontend, load generator, and feature
  flag service.
- **[Locust](https://locust.io)**: a background job that creates realistic usage
  patterns on the website using a synthetic load generator.
- **[OpenFeature](https://openfeature.dev)**: a feature flagging API and SDK
  that allows for the enabling and disabling of features in the application.
- **[flagd](https://flagd.dev)**: a feature flagging daemon that is used to
  manage feature flags in the demo application.
- **[llm](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/llm/)**:
  a mock Large Language Model (LLM) that adheres to
  [OpenAI's Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create)
  format and answers questions about a product.

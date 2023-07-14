---
title: OpenTelemetry Collector and Kubernetes
linkTitle: Collector
spelling:
  cSpell:ignore filelogreceiver hostmetricsreceiver kubeletstatsreceiver
  k8sobjectsreceiver k8sclusterreceiver k8sattributesprocessor
---

## Introduction

The [OpenTelemetry Collector](/docs/collector) can be used to monitor Kubernetes
using combinations of different components:

- [filelogreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver):
  Scrapes all the logs your cluster produces.
- [hostmetricsreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver):
  Scrapes the cpu, memory, process, etc. stats of your nodes.
- [kubeletstatsreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kubeletstatsreceiver):
  Scrapes metrics from kubelets, such as the pod memory or cpu usage.
- [k8sobjectsreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver):
  Collects objects, such as events, from the Kubernetes API server.
- [k8sclusterreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver):
  Collects cluster-level metrics, such as container restarts.
- [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor):
  Enhances traces, metrics, and logs with Kubernetes metadata.

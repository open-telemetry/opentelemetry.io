---
title: Приклад YAML файлу конфігурації OBI
linkTitle: Приклад YAML
description: Приклад YAML файлу конфігурації OBI.
weight: 100
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---

## Приклад YAML файлу {#yaml-file-example}

```yaml
discovery:
  instrument:
    - open_ports: 8443
log_level: DEBUG

ebpf:
  context_propagation: all

otel_traces_export:
  endpoint: http://localhost:4318

prometheus_export:
  port: 8999
  path: /metrics
```

Ця конфігурація включає наступні параметри:

- `discovery.instrument.open_ports`: інструментує сервіси, які слухають на порту 8443
- `log_level`: встановлює рівень логування на `DEBUG`
- `ebpf.context_propagation`: увімкнено передачу контексту за допомогою всіх підтримуваних механізмів
- `otel_traces_export.endpoint`: надсилає трейс на OpenTelemetry Collector за адресою `http://localhost:4318`
- `prometheus_export`: експортує метрики за адресою `http://localhost:8999/metrics`

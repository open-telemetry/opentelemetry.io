---
title: Приклад YAML файлу конфігурації OBI
linkTitle: Приклад YAML
description: Приклад YAML файлу конфігурації OBI.
weight: 100
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
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

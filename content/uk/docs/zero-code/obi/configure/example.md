---
title: Приклад YAML файлу конфігурації Config v1 OBI
linkTitle: Приклад YAML Config v1
description: Приклад YAML файлу конфігурації Config v1 OBI.
weight: 100
default_lang_commit: 2021ec6e35d03a3f5f99da13b908091068154a44
---

> [!NOTE]
>
> Ця сторінка використовує імена полів та приклади Config v1. Для Config v2 див. [Довідник Config v2](../config-v2/). Щоб конвертувати наявний файл, використовуйте [інструкцію з міграції](../migrate-to-config-v2/).

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

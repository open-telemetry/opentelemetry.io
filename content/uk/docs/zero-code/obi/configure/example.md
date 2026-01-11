---
title: Приклад YAML конфігурації OBI
linkTitle: YAML приклад
description: Приклад YAML конфігурації OBI.
weight: 100
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

## Приклад YAML файлу {#yaml-file-example}

Приклад конфігураційного файлу YAML OBI для надсилання OTLP-даних до точки доступу OpenTelemetry Collector:

```yaml
discovery:
  instrument:
    - open_ports: 443
log_level: DEBUG

ebpf:
  wakeup_len: 100

otel_traces_export:
  endpoint: http://localhost:4318

prometheus_export:
  port: 8999
  path: /metrics
```

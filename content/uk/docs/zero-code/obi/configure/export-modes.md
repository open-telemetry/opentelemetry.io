---
title: Налаштування режимів експорту OBI
linkTitle: Режими експорту
description: Налаштування OBI для експорту даних безпосередньо до точки доступу OTLP
weight: 1
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

У режимі Direct OBI надсилає метрики та трейси безпосередньо до віддаленої точки доступу за допомогою протоколу OpenTelemetry (OTLP).

OBI також може надавати точку доступу HTTP Prometheus, готову до збору, наприклад, у режимі **pull**.

Для використання режиму Direct потрібна конфігурація з обліковими даними для автентифікації. Встановіть облікові дані автентифікації точки доступу OTLP за допомогою цих змінних середовища:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

Щоб запустити в режимі Direct, використовуючи точку доступу збору Prometheus, див. документацію з конфігурації. [документація з конфігурації](../options/).

## Налаштування та запуск OBI {#configure-and-run-obi}

Цей посібник передбачає, що OBI та OTel Collector працюють нативно на одному хості, тому немає необхідності захищати трафік або надавати автентифікацію в приймачі OTLP OTel Collector.

Встановіть [Інструментацію OpenTelemetry eBPF](../../setup/) та завантажте приклад [конфігураційного файлу](/docs/zero-code/obi/configure/resources/instrumenter-config.yml).

Спочатку вкажіть виконуваний файл для інструментування. Для виконуваного файлу сервісу, що працює на порту `443`, додайте властивість `open_port` до YAML-документа:

```yaml
discovery:
  instrument:
    - open_ports: 443
```

Далі, вкажіть, куди надсилаються трейси та метрики. Якщо OTel Collector працює на локальному хості, він використовує порт `4318`:

```yaml
otel_metrics_export:
  endpoint: http://localhost:4318
otel_traces_export:
  endpoint: http://localhost:4318
```

Ви можете вказати комбінацію властивостей `otel_metrics_export` та `otel_traces_export`, щоб експортувати метрики, трейси або обидва.

Запустіть OBI з іменованим конфігураційним файлом:

```shell
obi -config instrument-config.yml
```

або

```shell
OTEL_EBPF_CONFIG_PATH=instrument-config.yml obi
```

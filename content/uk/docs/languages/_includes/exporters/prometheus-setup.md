---
default_lang_commit: 10b2aa9fc1a8f434b6212dc453f01dd520b2f9e3
---

## Prometheus

Щоб надіслати ваші метрики до [Prometheus](https://prometheus.io/), ви можете або
[увімкнути OTLP Receiver Prometheus](https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver)
і використовувати [OTLP експортер](#otlp), або ви можете використовувати експортер Prometheus,
`MetricReader`, який запускає HTTP сервер, що збирає метрики та серіалізує їх у
текстовий формат Prometheus за запитом.

### Налаштування бекенду {#prometheus-setup}

{{% alert title=Примітка %}}

Якщо у вас вже налаштований Prometheus або сумісний з Prometheus бекенд, ви можете пропустити цей розділ і налаштувати залежності експортера [Prometheus](#prometheus-dependencies) або [OTLP](#otlp-dependencies) для вашого застосунку.

{{% /alert %}}

Ви можете запустити [Prometheus](https://prometheus.io) у docker контейнері, доступному на порту `9090`, дотримуючись цих інструкцій:

Створіть файл під назвою `prometheus.yml` з наступним вмістом:

```yaml
scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
```

Запустіть Prometheus у docker контейнері з доступом до UI на порту `9090`:

```shell
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title=Примітка %}}

Коли використовуєте OTLP Receiver Prometheus, переконайтеся, що ви встановили OTLP endpoint для метрик у вашому застосунку на `http://localhost:9090/api/v1/otlp`.

Не всі docker середовища підтримують `host.docker.internal`. У деяких випадках вам може знадобитися замінити `host.docker.internal` на `localhost` або IP адресу вашої машини.

{{% /alert %}}

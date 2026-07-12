---
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

## Prometheus

Щоб надіслати ваші метрики до [Prometheus](https://prometheus.io/), ви можете або:

- [Увімкнути OTLP Receiver Prometheus](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver) і використовувати [OTLP експортер](#otlp) (рекомендується), або
- Ви можете використовувати експортер Prometheus, `MetricReader`, який запускає HTTP сервер, що збирає метрики та серіалізує їх у текстовий формат Prometheus за запитом.

### Налаштування бекенду {#prometheus-setup}

Щоб запустити бекенд Prometheus і почати збирати метрики, дивіться [Посібник з початку роботи з Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/).

Щоб увімкнути OTLP Receiver, дивіться [Посібник Prometheus з увімкнення OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver).

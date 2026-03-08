---
title: Компоненти телеметрії
linkTitle: Компоненти телеметрії
aliases: [demo_features, features]
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

## OpenTelemetry

- **[OpenTelemetry Traces](/docs/concepts/signals/traces/)**: всі сервіси інструментовані за допомогою доступних бібліотек інструментування OpenTelemetry.
- **[OpenTelemetry Metrics](/docs/concepts/signals/metrics/)**: вибрані сервіси інструментовані за допомогою доступних бібліотек інструментування OpenTelemetry. Більше буде додано в міру випуску відповідних SDK.
- **[OpenTelemetry Logs](/docs/concepts/signals/logs/)**: вибрані сервіси інструментовані за допомогою доступних бібліотек інструментування OpenTelemetry. Більше буде додано в міру випуску відповідних SDK.
- **[OpenTelemetry Collector](/docs/collector/)**: всі сервіси інструментовані та надсилають згенеровані трасування та метрики до OpenTelemetry Collector через gRPC. Отримані трасування експортуються до логів та Jaeger; отримані метрики та екземпляри експортуються до логів та Prometheus.

## Рішення для спостереження {#observability-solutions}

- **[Grafana](https://grafana.com/)**: всі метрики зберігаються в Grafana.
- **[Jaeger](https://www.jaegertracing.io/)**: всі згенеровані трасування надсилаються до Jaeger.
- **[OpenSearch](https://opensearch.org/)**: всі згенеровані логи надсилаються до Data Prepper. OpenSearch буде використовуватися для централізації даних логування з сервісів.
- **[Prometheus](https://prometheus.io/)**: всі згенеровані метрики та екземпляри збираються Prometheus.

## Середовища {#environments}

- **[Docker](https://docs.docker.com)**: цей зразок (форк) можна виконати за допомогою Docker.
- **[Kubernetes](https://kubernetes.io/)**: застосунок розроблений для роботи в Kubernetes (як локально, так і в хмарі) за допомогою Helm chart.

## Протоколи {#protocols}

- **[gRPC](https://grpc.io/)**: мікросервіси використовують великий обсяг gRPC викликів для взаємодії один з одним.
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**: мікросервіси використовують HTTP там, де gRPC недоступний або не підтримується належним чином.

## Інші компоненти {#other-components}

- **[Envoy](https://www.envoyproxy.io/)**: Envoy використовується як зворотний проксі для вебінтерфейсів, орієнтованих на користувача, таких як фронтенд, генератор навантаження та сервіс функцій.
- **[Locust](https://locust.io)**: фонове завдання, яке створює реалістичні шаблони використання на вебсайті за допомогою синтетичного генератора навантаження.
- **[OpenFeature](https://openfeature.dev)**: API та SDK для управління функціями, що дозволяє вмикати та вимикати функції в застосунку.
- **[flagd](https://flagd.dev)**: демон для управління функціями, який використовується для управління функціями в демонстраційному застосунку.
- **[llm](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/llm/)**: імітація великої мовної моделі (LLM), яка відповідає формату [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) і відповідає на запитання про товар.

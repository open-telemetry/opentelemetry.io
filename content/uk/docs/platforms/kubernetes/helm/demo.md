---
title: Чарт OpenTelemetry Demo
linkTitle: Чарт Demo
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

[Demo OpenTelemetry](/docs/demo/) — це розподілена система на основі мікросервісів, призначена для ілюстрації впровадження OpenTelemetry в умовах, близьких до реальних. В рамках цього проєкту спільнота OpenTelemetry створила [Helm чарт OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo), для легкого встановлення в Kubernetes.

## Конфігурація {#configuration}

Стандартний файл `values.yaml` чарту Demo готовий до встановлення. Всі компоненти мають налаштовані обмеження памʼяті для оптимізації продуктивності, що може викликати проблеми, якщо ваш кластер недостатньо великий. Вся установка обмежена ~4 гігабайтами памʼяті, але може використовувати менше.

Всі доступні параметри конфігурації (з коментарями) можна переглянути у файлі [`values.yaml`](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml), а детальні описи можна знайти в [README чарта](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo#chart-parameters).

## Встановлення {#installation}

Додайте репозиторій OpenTelemetry Helm:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Щоб встановити чарт з назвою релізу `my-otel-demo`, виконайте наступну команду:

```sh
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

Після встановлення всі служби стають доступними через проксі Frontend (<http://localhost:8080>) за допомогою наступних команд:

```sh
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

Після того, як проксі буде відкрито, ви також можете відвідати наступні шляхи:

| Компонент                         | Шлях                              |
| --------------------------------- | --------------------------------- |
| Вебмагазин                        | <http://localhost:8080>           |
| Grafana                           | <http://localhost:8080/grafana>   |
| Інтерфейс Feature Flags           | <http://localhost:8080/feature>   |
| Інтерфейс генератора навантаження | <http://localhost:8080/loadgen>   |
| Інтерфейс Jaeger                  | <http://localhost:8080/jaeger/ui> |

Для того, щоб відрізки трейсів з вебмагазину збиралися, необхідно експонувати OTLP/HTTP приймач OpenTelemetry Collector:

```sh
kubectl port-forward svc/my-otel-demo-otelcol 4318:4318
```

Для отримання додаткової інформації про використання демонстрації в Kubernetes, дивіться [Розгортання в Kubernetes](/docs/demo/kubernetes-deployment/).

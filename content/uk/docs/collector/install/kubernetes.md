---
title: Встановлення Колектора за допомогою Kubernetes
linkTitle: Kubernetes
weight: 200
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Використовуйте наступну команда для встановлення OpenTelemetry Collector як DaemonSet і одиничного екземпляра шлюзу:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

Цей приклад є відправною точкою. Інформацію про налаштування та встановлення, готову до використання дивіться у розділі [OpenTelemetry Helm Charts][].

Ви також можете використовувати [OpenTelemetry Operator][] для надання та обслуговування екземпляра OpenTelemetry Collector. Оператор включає функції, такі як: автоматичне оновлення, конфігурація `Service` на основі конфігурації OpenTelemetry, автоматична інʼєкція sidecar в розгортання та інше.

Інструкції щодо використання Collector з Kubernetes див. у розділі [Початок роботи в Kubernetes](/docs/platforms/kubernetes/getting-started/).

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/

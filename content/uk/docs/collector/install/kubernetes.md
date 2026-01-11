---
title: Встановлення Колектора за допомогою Kubernetes
linkTitle: Kubernetes
weight: 200
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

## Kubernetes

Наступна команда розгортає агента як daemonset і одиничний екземпляр шлюзу:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

Попередній приклад призначений для використання як відправна точка, яку можна розширити та налаштувати перед фактичним використанням у реальному житті. Інформацію про налаштування та встановлення, готову до використання, див. у розділі [OpenTelemetry Helm Charts][].

Ви також можете використовувати [OpenTelemetry Operator][] для надання та обслуговування екземпляра OpenTelemetry Collector з такими функціями, як автоматичне оновлення, конфігурація `Service` на основі конфігурації OpenTelemetry, автоматична інʼєкція sidecar в розгортання та інше.

Інструкції щодо використання Collector з Kubernetes див. у розділі [Початок роботи в Kubernetes](/docs/platforms/kubernetes/getting-started/).

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/

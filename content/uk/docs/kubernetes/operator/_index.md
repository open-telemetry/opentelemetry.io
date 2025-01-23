---
title: OpenTelemetry Operator для Kubernetes
linkTitle: Kubernetes Operator
description:
  Реалізація Kubernetes Operator, який керує колекторами та автоматичним інструментуванням робочого навантаження за допомогою бібліотек інструментування OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/kubernetes-operator/*, to: ':splat' }
---

## Вступ {#introduction}

OpenTelemetry Operator — це реалізація [Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

Оператор керує:

- OpenTelemetry Collector
- [автоматичним інструментуванням робочих навантажень за допомогою бібліотек інструментування OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Початок роботи {#getting-started}

Щоб встановити оператор у наявний кластер, переконайтеся, що у вас встановлений cert-manager, і виконайте:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Після того, як розгортання `opentelemetry-operator` буде готове, створіть екземпляр OpenTelemetry Collector (otelcol), наприклад:

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:

    exporters:
      # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
EOF
```

Для отримання додаткових параметрів конфігурації та налаштування інʼєкції автоматичного інструментування робочих навантажень за допомогою бібліотек інструментування OpenTelemetry, продовжуйте читати [тут](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).

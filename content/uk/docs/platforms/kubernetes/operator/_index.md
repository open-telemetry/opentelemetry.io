---
title: OpenTelemetry Operator для Kubernetes
linkTitle: Kubernetes Operator
description: Реалізація Kubernetes Operator, який керує колекторами та автоматичним інструментуванням робочого навантаження за допомогою бібліотек інструментування OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

## Вступ {#introduction}

[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) — це реалізація [Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

Оператор керує:

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [автоматичним інструментуванням робочих навантажень за допомогою бібліотек інструментування OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Початок роботи {#getting-started}

Щоб встановити оператор у наявний кластер, переконайтеся, що у вас встановлений [`cert-manager`](https://cert-manager.io/docs/installation/), і виконайте:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Після того, як розгортання `opentelemetry-operator` буде готове, створіть екземпляр OpenTelemetry Collector (otelcol), наприклад:

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15

    exporters:
      # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
EOF
```

> [!NOTE]
>
> Стандартно, `opentelemetry-operator` використовує [образ `opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector). Якщо оператор встановлено за допомогою [чартів Helm](/docs/platforms/kubernetes/helm/), використовується образ [`opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s). Якщо вам потрібен компонент, якого немає у цих випусках, вам може знадобитися [зібрати власний колектор](/docs/collector/extend/ocb/).

Для отримання додаткових параметрів конфігурації та налаштування інʼєкції автоматичного інструментування робочих навантажень за допомогою бібліотек інструментування OpenTelemetry, дивіться [OpenTelemetry Operator for Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).

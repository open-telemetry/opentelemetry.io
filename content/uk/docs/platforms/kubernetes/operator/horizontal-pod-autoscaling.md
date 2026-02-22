---
title: Горизонтальне автомасштабування подів
description: Налаштування горизонтального автомасштабування подів з вашим OpenTelemetry Collector
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: autoscaler statefulset мебібайт мебібайти міліядер
---

Колектори, що управляються OpenTelemetry Operator, мають вбудовану підтримку [горизонтального автоматичного масштабування подів (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/). HPA збільшує або зменшує кількість реплік (копій) ваших подів Kubernetes на основі набору метрик. Зазвичай цими метриками є споживання CPU та/або памʼяті.

Якщо OpenTelemetry Operator керує функціональністю HPA для Колектора, вам не потрібно створювати окремий ресурс Kubernetes `HorizontalPodAutoscaler` для автоматичного масштабування вашого Колектора.

Оскільки HPA застосовується тільки до `StatefulSets` і `Deployments` в Kubernetes, переконайтеся, що `spec.mode` вашого Колектора є або `deployment`, або `statefulset`.

> [!NOTE]
>
> HPA вимагає [Metrics Server](https://github.com/kubernetes-sigs/metrics-server) запущеного на вашому кластері Kubernetes.
>
> - Кластери Kubernetes, такі як [GKE (Google)](https://cloud.google.com/kubernetes-engine?hl=en) та [AKS (Microsoft Azure)](https://azure.microsoft.com/en-us/products/kubernetes-service) автоматично встановлюють Metrics Server під час виділення кластера.
> - [EKS (AWS) стандартно не постачається з Metrics Server](https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html).
> - Кластери Kubernetes, що не надаються хмарними провайдерами, та локальні кластери Kubernetes (наприклад, [MiniKube](https://minikube.sigs.k8s.io/docs/), [KinD](https://kind.sigs.k8s.io/), [k0s](https://k0sproject.io)) вимагають ручного встановлення Metrics Server.
>
> Проконсультуйтеся з документацією вашого постачальника хмари, щоб визначити, чи ваш кластер Kubernetes постачається з попередньо встановленим Metrics Server.

Щоб налаштувати HPA, ви повинні спочатку визначити ваші запити на ресурси та обмеження, додавши конфігурацію `spec.resources` до вашого YAML-файлу `OpenTelemetryCollector`:

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 64Mi
```

> [!NOTE]
>
> Ваші власні значення можуть відрізнятися.

Конфігурація `limits` вказує максимальні значення памʼяті та CPU. У цьому випадку ці обмеження становлять 100 міліядер (0,1 ядра) CPU та 128Mi (мебібайти, де 1 мебібайт == 1024 кілобайти) RAM.

Конфігурація `requests` вказує мінімально гарантовану кількість ресурсів, виділених для контейнера. У цьому випадку мінімальний обсяг становить 100 міліядер CPU та 64 мебібайти RAM.

Далі ви налаштовуєте правила автоматичного масштабування, додавши конфігурацію `spec.autoscaler` до YAML-файлу `OpenTelemetryCollector`:

```yaml
autoscaler:
  minReplicas: 1
  maxReplicas: 2
  targetCPUUtilization: 50
  targetMemoryUtilization: 60
```

> [!NOTE]
>
> Ваші власні значення можуть відрізнятися.

Якщо зібрати все разом, то початок YAML `OpenTelemetryCollector` має виглядати приблизно так:

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  image: otel/opentelemetry-collector-contrib:{{% version-from-registry
    collector-processor-batch %}}
  serviceAccount: otelcontribcol
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
    targetCPUUtilization: 50
    targetMemoryUtilization: 60
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi
```

Після розгортання `OpenTelemetryCollector` у Kubernetes з увімкненим HPA, Оператор створює ресурс `HorizontalPodAutoscaler` для вашого колектора у Kubernetes. Ви можете перевірити це, виконавши

```sh
kubectl get hpa -n <your_namespace>
```

Якщо все спрацювало, як очікувалося, ось як має виглядати вивід:

```nocode
NAME                REFERENCE                        TARGETS                         MINPODS   MAXPODS   REPLICAS   AGE
otelcol-collector   OpenTelemetryCollector/otelcol   memory: 68%/60%, cpu: 37%/50%   1         3         2          77s
```

Щоб отримати більш детальну інформацію, ви можете описати ваш ресурс HPA, виконавши

```sh
kubectl describe hpa <your_collector_name> -n <your_namespace>
```

Якщо все спрацювало, як очікувалося, ось як має виглядати вивід:

```nocode
Name:                                                     otelcol-collector
Namespace:                                                opentelemetry
Labels:                                                   app.kubernetes.io/benchmark-test=otelcol-contrib
                                                          app.kubernetes.io/component=opentelemetry-collector
                                                          app.kubernetes.io/destination=dynatrace
                                                          app.kubernetes.io/instance=opentelemetry.otelcol
                                                          app.kubernetes.io/managed-by=opentelemetry-operator
                                                          app.kubernetes.io/name=otelcol-collector
                                                          app.kubernetes.io/part-of=opentelemetry
                                                          app.kubernetes.io/version=0.126.0
Annotations:                                              <none>
CreationTimestamp:                                        Mon, 02 Jun 2025 17:23:52 +0000
Reference:                                                OpenTelemetryCollector/otelcol
Metrics:                                                  ( current / target )
  resource memory on pods  (as a percentage of request):  71% (95779498666m) / 60%
  resource cpu on pods  (as a percentage of request):     12% (12m) / 50%
Min replicas:                                             1
Max replicas:                                             3
OpenTelemetryCollector pods:                              3 current / 3 desired
Conditions:
  Type            Status  Reason            Message
  ----            ------  ------            -------
  AbleToScale     True    ReadyForNewScale  recommended size matches current size
  ScalingActive   True    ValidMetricFound  the HPA was able to successfully calculate a replica count from memory resource utilization (percentage of request)
  ScalingLimited  True    TooManyReplicas   the desired replica count is more than the maximum replica count
Events:
  Type     Reason                   Age                  From                       Message
  ----     ------                   ----                 ----                       -------
  Warning  FailedGetResourceMetric  2m (x4 over 2m29s)   horizontal-pod-autoscaler  unable to get metric memory: no metrics returned from resource metrics API
  Warning  FailedGetResourceMetric  89s (x7 over 2m29s)  horizontal-pod-autoscaler  No recommendation
  Normal   SuccessfulRescale        89s                  horizontal-pod-autoscaler  New size: 2; reason: memory resource utilization (percentage of request) above target
  Normal   SuccessfulRescale        59s                  horizontal-pod-autoscaler  New size: 3; reason: memory resource utilization (percentage of request) above target
```

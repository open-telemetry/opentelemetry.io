---
title: Чарт OpenTelemetry Collector
linkTitle: Чарт Collector
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: debugexporter filelog filelogreceiver hostmetricsreceiver kubelet kubeletstats kubeletstatsreceiver otlp_http sattributesprocessor sclusterreceiver sobjectsreceiver statefulset
---

## Вступ {#introduction}

[OpenTelemetry Collector](/docs/collector) є важливим інструментом для моніторингу кластера Kubernetes та всіх сервісів у ньому. Для полегшення встановлення та управління розгортанням колектора в Kubernetes спільнота OpenTelemetry створила [OpenTelemetry Collector Helm чарт](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector). Цей helm чарт може бути використаний для встановлення колектора як Deployment, Daemonset або Statefulset.

### Встановлення чарту {#installing-the-chart}

Щоб встановити chart з іменем релізу `my-opentelemetry-collector`, виконайте наступні команди:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set mode=<daemonset|deployment|statefulset>
```

### Конфігурація {#configuration}

OpenTelemetry Collector Chart вимагає встановлення параметра `mode`. `mode` може бути або `daemonset`, `deployment`, або `statefulset` залежно від того, який тип розгортання Kubernetes потрібен для вашого випадку використання.

Після встановлення chart надає кілька стандартних компонентів колектора для початку роботи. Стандартна конфігурація колектора виглядає так:

```yaml
exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug: {}
extensions:
  health_check: {}
processors:
  batch: {}
  memory_limiter:
    check_interval: 5s
    limit_percentage: 80
    spike_limit_percentage: 25
receivers:
  jaeger:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:14250
      thrift_compact:
        endpoint: ${env:MY_POD_IP}:6831
      thrift_http:
        endpoint: ${env:MY_POD_IP}:14268
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: opentelemetry-collector
          scrape_interval: 10s
          static_configs:
            - targets:
                - ${env:MY_POD_IP}:8888
  zipkin:
    endpoint: ${env:MY_POD_IP}:9411
service:
  extensions:
    - health_check
  pipelines:
    logs:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
    metrics:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - prometheus
    traces:
      exporters:
        - debug
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - jaeger
        - zipkin
  telemetry:
    metrics:
      address: ${env:MY_POD_IP}:8888
```

Чарт також відкриє порти на основі стандартних приймачів. Стандартну конфігурацію можна видалити, встановивши значення `null` у вашому `values.yaml`. Порти також можна відключити у `values.yaml`.

Ви можете додати/змінити будь-яку частину конфігурації, використовуючи розділ `config` у вашому `values.yaml`. При зміні конвеєра ви повинні явно вказати всі компоненти, які є в конвеєрі, включаючи будь-які стандартні компоненти.

Наприклад, щоб відключити конвеєри метрик і логів та не-otlp приймачі:

```yaml
config:
  receivers:
    jaeger: null
    prometheus: null
    zipkin: null
  service:
    pipelines:
      traces:
        receivers:
          - otlp
      metrics: null
      logs: null
ports:
  jaeger-compact:
    enabled: false
  jaeger-thrift:
    enabled: false
  jaeger-grpc:
    enabled: false
  zipkin:
    enabled: false
```

Усі варіанти конфігурації (з коментарями), доступні в чарті, можна переглянути у файлі [values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml).

### Пресети {#presets}

Багато важливих компонентів, які використовує OpenTelemetry Collector для моніторингу Kubernetes, вимагають спеціального налаштування в самому розгортанні Kubernetes Collector. Щоб полегшити використання цих компонентів, OpenTelemetry Collector Chart постачається з деякими пресетами, які при включенні обробляють складне налаштування для цих важливих компонентів.

Пресети слід використовувати як відправну точку. Вони налаштовують базову, але багату функціональність для своїх повʼязаних компонентів. Якщо ваш випадок використання вимагає додаткової конфігурації цих компонентів, рекомендується НЕ використовувати пресет, а замість цього вручну налаштувати компонент і все, що йому потрібно (томи, RBAC тощо).

#### Пресет збору логів {#logs-collection-preset}

OpenTelemetry Collector може бути використаний для збору логів, відправлених у стандартний вихід контейнерами Kubernetes.

Ця функція стандартно вимкнена. Вона має наступні вимоги для безпечного включення:

- Вимагає, щоб [Filelog receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver) був включений в образ Collector, такий як [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Хоча це не є суворою вимогою, рекомендується використовувати цей пресет з `mode=daemonset`. `filelogreceiver` зможе збирати логи лише на вузлі, де працює Collector, і кілька налаштованих Collectors на одному вузлі створять дубльовані дані.

Щоб увімкнути цю функцію, встановіть властивість `presets.logsCollection.enabled` у значення `true`. При включенні чарт додасть `filelogreceiver` до конвеєра `logs`. Цей приймач налаштований на читання файлів, де контейнерний runtime Kubernetes записує весь консольний вихід контейнерів (`/var/log/pods/*/*/*.log`).

Ось приклад `values.yaml`:

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

Стандартний конвеєр логів чарта використовує `debugexporter`. У поєднанні з `filelogreceiver` пресета `logsCollection` легко випадково передати експортовані логи назад у колектор, що може викликати "вибух логів".

Щоб запобігти зациклюванню, стандартна конфігурація приймача виключає власні логи колектора. Якщо ви хочете включити логи колектора, обовʼязково замініть експортер `debug` на експортер, який не відправляє логи на стандартний вихід колектора.

Ось приклад `values.yaml`, який замінює стандартний експортер `debug` у конвеєрі `logs` на експортер `otlp_http`, який відправляє логи контейнера на `https://example.com:55681` endpoint. Він також використовує `presets.logsCollection.includeCollectorLogs`, щоб сказати пресету увімкнути збір логів колектора.

```yaml
mode: daemonset

presets:
  logsCollection:
    enabled: true
    includeCollectorLogs: true

config:
  exporters:
    otlp_http:
      endpoint: https://example.com:55681
  service:
    pipelines:
      logs:
        exporters:
          - otlp_http
```

#### Пресет атрибутів Kubernetes {#kubernetes-attributes-preset}

OpenTelemetry Collector може бути налаштований для додавання метаданих Kubernetes, таких як `k8s.pod.name`, `k8s.namespace.name` та `k8s.node.name`, до логів, метрик та трас. Настійно рекомендується використовувати пресет або вручну увімкнути `k8sattributesprocessor`.

Через міркування RBAC ця функція стандартно вимкнена. Вона має наступні вимоги:

- Вимагає, щоб [Kubernetes Attributes processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor) був включений в образ Collector, такий як [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).

Щоб увімкнути цю функцію, встановіть властивість `presets.kubernetesAttributes.enabled` у значення `true`. При включенні chart додасть необхідні ролі RBAC до ClusterRole і додасть `k8sattributesprocessor` до кожного увімкненого конвеєра.

Ось приклад `values.yaml`:

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```

#### Пресет метрик Kubelet {#kubelet-metrics-preset}

OpenTelemetry Collector може бути налаштований для збору метрик вузлів, podʼів та контейнерів з API сервера на kubelet.

Ця функція стандартно вимкнена. Вона має наступні вимоги:

- Вимагає, щоб [Kubeletstats receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)
  був включений в образ Collector, такий як [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Хоча це не є суворою вимогою, рекомендується використовувати цей пресет з `mode=daemonset`. `kubeletstatsreceiver` зможе збирати метрики лише на вузлі, де працює Collector, і кілька налаштованих Collectors на одному вузлі створять дубльовані дані.

Щоб увімкнути цю функцію, встановіть властивість `presets.kubeletMetrics.enabled` у значення `true`. При включенні chart додасть необхідні ролі RBAC до ClusterRole і додасть `kubeletstatsreceiver` до конвеєра метрик.

Ось приклад `values.yaml`:

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```

#### Пресет метрик кластера {#cluster-metrics-preset}

OpenTelemetry Collector може бути налаштований для збору метрик рівня кластера з API сервера Kubernetes. Ці метрики включають багато метрик, зібраних Kube State Metrics.

Ця функція стандартно вимкнена. Вона має наступні вимоги:

- Вимагає, щоб [Kubernetes Cluster receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver) був включений в образ Collector, такий як [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Хоча це не є суворою вимогою, рекомендується використовувати цей пресет з `mode=deployment` або `mode=statefulset` з однією реплікою. Запуск `k8sclusterreceiver` на кількох Collectors створить дубльовані дані.

Щоб увімкнути цю функцію, встановіть властивість `presets.clusterMetrics.enabled` у значення `true`. При включенні чарт додасть необхідні ролі RBAC до ClusterRole і додасть `k8sclusterreceiver` до конвеєра метрик.

Ось приклад `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```

#### Пресет подій Kubernetes {#kubernetes-events-preset}

OpenTelemetry Collector може бути налаштований для збору подій Kubernetes.

Ця функція стандартно вимкнена. Вона має наступні вимоги:

- Вимагає, щоб [Kubernetes Objects receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver) був включений в образ Collector, такий як
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Хоча це не є суворою вимогою, рекомендується використовувати цей пресет з `mode=deployment` або `mode=statefulset` з однією реплікою. Запуск `k8sclusterreceiver` на кількох Collectors створить дубльовані дані.

Щоб увімкнути цю функцію, встановіть властивість `presets.kubernetesEvents.enabled` у значення `true`. При включенні чарт додасть необхідні ролі RBAC до ClusterRole і додасть `k8sobjectsreceiver` до конвеєра логів, налаштованого на збір лише подій.

Ось приклад `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```

#### Пресет метрик хосту {#host-metrics-preset}

OpenTelemetry Collector може бути налаштований для збору метрик хосту з вузлів Kubernetes.

Ця функція стандартно вимкнена. Вона має наступні вимоги:

- Вимагає, щоб [Host Metrics receiver](/docs/platforms/kubernetes/collector/components/#host-metrics-receiver)
  був включений в образ Collector, такий як [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Хоча це не є суворою вимогою, рекомендується використовувати цей пресет з `mode=daemonset`. `hostmetricsreceiver` зможе збирати метрики лише на вузлі, де працює Collector, і кілька налаштованих Collectors на одному вузлі створять дубльовані дані.

Щоб увімкнути цю функцію, встановіть властивість `presets.hostMetrics.enabled` у значення `true`. При включенні чарт додасть необхідні томи та volumeMounts і додасть `hostmetricsreceiver` до конвеєра метрик. Стандартно метрики будуть збиратися кожні 10 секунд, і наступні скрепери будуть увімкнені:

- cpu
- load
- memory
- disk
- filesystem[^1]
- network

Ось приклад `values.yaml`:

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
```

[^1]: через деякий збіг з пресетом `kubeletMetrics` деякі типи файлових систем та точки монтування стандартно виключені.

---
title: Розгортання OBI в Kubernetes за допомогою Helm
linkTitle: Helm чарт
description: Дізнайтеся, як розгорнути OBI як Helm чарт в Kubernetes.
weight: 2
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

> [!NOTE]
>
> Для отримання додаткової інформації про різноманітні параметри конфігурації Helm, ознайомтеся з [документацією Helm чарту OBI](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation) або дивіться на [Artifact Hub](https://artifacthub.io/packages/helm/opentelemetry-helm/opentelemetry-ebpf-instrumentation). Для отримання докладної інформації про параметри конфігурації дивіться файл [values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-ebpf-instrumentation/values.yaml)

Вміст:

<!-- TOC -->

- [Розгортання OBI з Helm](#deploying-obi-from-helm)
- [Налаштування OBI](#configuring-obi)
- [Налаштування метаданих OBI](#configuring-obi-metadata)
- [Централізація метаданих Kubernetes за допомогою k8s-cache](#centralizing-kubernetes-metadata-with-k8s-cache)
- [Надання секретів для конфігурації Helm](#providing-secrets-to-the-helm-configuration)
<!-- TOC -->

## Розгортання OBI з Helm {#deploying-obi-from-helm}

Спочатку потрібно додати репозиторій OpenTelemetry до Helm:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Наступна команда розгортає DaemonSet OBI зі стандартною конфігурацією в просторі `obi`:

```sh
helm install obi -n obi --create-namespace open-telemetry/opentelemetry-ebpf-instrumentation
```

Стандартна конфігурація OBI:

- експортує метрики як метрики Prometheus на HTTP-порті Pod `9090`, шлях `/metrics`.
- намагається інструментувати всі застосунки у вашому кластері.
- надає лише метрики на рівні застосунків і стандартно виключає [network-level metrics](../../network/)
- конфігурує OBI для додавання метаданих Kubernetes до метрик, наприклад `k8s.namespace.name` або `k8s.pod.name`

## Налаштування OBI {#configuring-obi}

Ви можете перевизначити стандартну конфігурацію OBI. Наприклад, щоб експортувати метрики та/або відрізки як OpenTelemetry замість Prometheus або обмежити кількість сервісів для інструментування.

Ви можете перевизначити стандартні [параметри конфігурації OBI](../../configure/) своїми значеннями.

Наприклад, створіть файл `helm-obi.yml` з власною конфігурацією:

```yaml
config:
  data:
    # Вміст фактичного файлу конфігурації OBI
    discovery:
      instrument:
        - k8s_namespace: demo
        - k8s_namespace: blog
    routes:
      unmatched: heuristic
```

Розділ `config.data` містить файл конфігурації OBI, описаний у [документації параметрів конфігурації OBI](../../configure/options/).

Потім передайте перевизначену конфігурацію команді `helm` за допомогою прапорця `-f`. Наприклад:

```sh
helm install obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

або, якщо чарт OBI був раніше розгорнутий:

```sh
helm upgrade obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

## Налаштування метаданих OBI {#configuring-obi-metadata}

Якщо OBI експортує дані за допомогою експортера Prometheus, вам, можливо, потрібно буде перевизначити анотації Pod OBI, щоб він був доступний для вашого скрепера Prometheus. Ви можете додати наступний розділ до прикладу файлу `helm-obi.yml`:

```yaml
podAnnotations:
  prometheus.io/scrape: 'true'
  prometheus.io/path: '/metrics'
  prometheus.io/port: '9090'
```

Аналогічно, чарт Helm дозволяє перевизначати імена, мітки та анотації для кількох ресурсів, залучених до розгортання OBI, таких як облікові записи сервісів, кластерні ролі, контексти безпеки тощо. [Документація Helm чарту OBI](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation) описує різноманітні параметри конфігурації.

## Централізація метаданих Kubernetes за допомогою k8s-cache {#centralizing-kubernetes-metadata-with-k8s-cache}

Стандартно кожен Pod OBI відкриває власні зʼєднання з сервером API Kubernetes для спостереження за метаданими Pod, Node та Service, не лише з його локального вузла, але й з усього кластера K8s. Це робиться для того, щоб збагачувати не лише джерело запиту, але й інформацію про призначення (наприклад, отримання імені сервісу для вихідного HTTP-запиту для додавання атрибутів [peer](/docs/specs/semconv/registry/attributes/service/#service-attributes-for-peer-services) або для метрики призначення [service graph](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)). Запит повних метаданих кластера K8s на великих кластерах з кожного Pod OBI може перевантажити сервер API і вплинути на весь кластер.

Щоб уникнути цього, чарт Helm OBI може розгорнути невеликий допоміжний сервіс з назвою `k8s-cache`. Кеш спостерігає за API Kubernetes один раз від імені всіх Pod OBI і передає метадані їм через gRPC, що усуває трафік інформерів OBI на кожен Pod до сервера API і значно зменшує навантаження на API.

Щоб увімкнути його, встановіть `k8sCache.replicas` на ненульове значення у вашому `helm-obi.yml`:

```yaml
k8sCache:
  replicas: 1
```

Зазвичай достатньо однієї репліки. Для високої доступності або дуже великих кластерів збільшить кількість реплік — Pod OBI будуть балансувати навантаження між ними через сервіс кешу і підключатися до справної репліки у разі відмови.

Коли `k8sCache.replicas` дорівнює `0` (стандартно), кеш не розгортається, і кожен Pod OBI використовує власні локальні інформери.

## Надавання секретів для конфігурації Helm {#providing-secrets-to-the-helm-configuration}

Якщо ви безпосередньо надсилаєте метрики та/або відрізки до вашого бекенду спостереження через точку доступу OpenTelemetry, вам, можливо, потрібно буде надати облікові дані через змінну середовища `OTEL_EXPORTER_OTLP_HEADERS`.

Рекомендований спосіб — зберігати таке значення в Kubernetes Secret, а потім вказати змінну середовища, що посилається на нього, у конфігурації Helm.

Наприклад, розгорніть наступний секрет:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: obi-secret
type: Opaque
stringData:
  otlp-headers: 'Authorization=Basic ....'
```

Потім зверніться до нього з файлу `helm-config.yml` через розділ `envValueFrom`:

```yaml
env:
  OTEL_EXPORTER_OTLP_ENDPOINT: '<...your OTLP endpoint URL...>'
envValueFrom:
  OTEL_EXPORTER_OTLP_HEADERS:
    secretKeyRef:
      key: otlp-headers
      name: obi-secret
```

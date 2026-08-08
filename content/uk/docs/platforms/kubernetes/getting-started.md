---
title: Початок роботи
weight: 1
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: filelog filelogreceiver kubelet kubeletstats kubeletstatsreceiver sattributes sattributesprocessor sclusterreceiver sobjectsreceiver
---

Ця сторінка проведе вас через найшвидший спосіб почати моніторинг вашого кластера Kubernetes за допомогою OpenTelemetry. Вона зосереджується на зборі метрик та логів для кластерів Kubernetes, вузлів, podʼів та контейнерів, а також на налаштуванні кластера для підтримки сервісів, що передають дані OTLP.

Якщо ви хочете побачити OpenTelemetry в дії з Kubernetes, найкраще місце для початку — це [Демо OpenTelemetry](/docs/demo/kubernetes-deployment/). Демо призначене для ілюстрації впровадження OpenTelemetry, але не є прикладом того, як моніторити сам Kubernetes. Після завершення цього керівництва, цікавим експериментом може бути встановлення демо та спостереження за тим, як весь моніторинг реагує на активне навантаження.

Якщо ви хочете почати міграцію з Prometheus до OpenTelemetry, або якщо вас цікавить використання OpenTelemetry Collector для збору метрик Prometheus, дивіться [Prometheus Receiver](/docs/platforms/kubernetes/collector/components/#prometheus-receiver).

## Огляд {#overview}

Kubernetes надає багато важливої телеметрії різними способами. Він має логи, події, метрики для багатьох різних обʼєктів та дані, що генеруються його робочими навантаженнями.

Для збору всіх цих даних ми будемо використовувати [OpenTelemetry Collector](/docs/collector/). Колектор має багато різних інструментів, які дозволяють ефективно збирати всі ці дані та покращувати їх у змістовний спосіб.

Для збору всіх даних нам знадобляться дві установки колектора: одна як [Daemonset](/docs/collector/deploy/agent/) і одна як [Deployment](/docs/collector/deploy/gateway/). Установка колектора як Daemonset буде використовуватися для збору телеметрії, що надходить від сервісів, логів та метрик для вузлів, podʼів та контейнерів. Установка колектора як Deployment буде використовуватися для збору метрик для кластера та подій.

Для встановлення колектора ми будемо використовувати [Helm-чарт OpenTelemetry Collector](/docs/platforms/kubernetes/helm/collector/), який має кілька опцій конфігурації, що полегшать налаштування колектора. Якщо ви не знайомі з Helm, ознайомтеся з [сайтом проєкту Helm](https://helm.sh/uk/). Якщо вас цікавить
використання оператора Kubernetes, дивіться [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/), але це керівництво зосередиться на Helm-чарті.

## Підготовка {#preparation}

Це керівництво передбачає використання [кластера Kind](https://kind.sigs.k8s.io/), але ви можете використовувати будь-який кластер Kubernetes, який вважаєте за потрібне.

Припускаючи, що у вас вже встановлено [Kind](https://kind.sigs.k8s.io/#installation-and-usage), створіть новий кластер kind:

```sh
kind create cluster
```

Припускаючи, що у вас вже встановлено [Helm](https://helm.sh/uk/docs/intro/install/), додайте Helm-чарт OpenTelemetry Collector, щоб його можна було встановити пізніше:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

## Daemonset Collector

Перший крок до збору телеметрії Kubernetes — це розгортання екземпляра daemonset OpenTelemetry Collector для збору телеметрії, повʼязаної з вузлами та робочими навантаженнями, що працюють на цих вузлах. Daemonset використовується для гарантії, що цей екземпляр колектора встановлено на всіх вузлах. Кожен екземпляр колектора в daemonset буде збирати дані тільки з вузла, на якому він працює.

Цей екземпляр колектора буде використовувати наступні компоненти:

- [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver): для збору трейсів, метрик та логів застосунків.
- [Kubernetes Attributes Processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor): для додавання метаданих Kubernetes до вхідної телеметрії застосунків.
- [Kubeletstats Receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver): для отримання метрик вузлів, podʼів та контейнерів з API-сервера на kubelet.
- [Filelog Receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver): для збору логів Kubernetes та логів застосунків, записаних у stdout/stderr.

Розгляньмо їх детальніше.

### OTLP Receiver

[OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver) є найкращим рішенням для збору трейсів, метрик та логів у [форматі OTLP](/docs/specs/otel/protocol/). Якщо ви передаєте телеметрію застосунків в іншому форматі, є велика ймовірність, що [колектор має приймач для цього](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver), але для цього керівництва ми припустимо, що телеметрія відформатована в OTLP.

Хоча це не є обовʼязковим, це загальноприйнята практика для застосунків, що працюють на вузлі, передавати свої трейси, метрики та логи до колектора, що працює на тому ж вузлі. Це спрощує мережеві взаємодії та дозволяє легко корелювати метадані Kubernetes за допомогою процесора `k8sattributes`.

### Kubernetes Attributes Processor

[Kubernetes Attributes Processor](/docs/platforms/kubernetes/collector/components/#kubernetes-attributes-processor) є дуже рекомендованим компонентом у будь-якому колекторі, що отримує телеметрію від podʼів Kubernetes. Цей процесор автоматично виявляє podʼи Kubernetes, витягує їх метадані, такі як імʼя podʼа або імʼя вузла, та додає витягнуті метадані до трейсів, метрик та логів як атрибути ресурсів. Оскільки він додає контекст Kubernetes до вашої телеметрії, Kubernetes Attributes Processor дозволяє корелювати трейси, метрики та логи вашого застосунку з телеметрією Kubernetes, такою як метрики podʼів та трейси.

### Kubeletstats Receiver

[Kubeletstats Receiver](/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver) є приймачем, що збирає метрики про вузол. Він буде збирати метрики, такі як використання памʼяті контейнером, використання CPU podʼом та помилки мережі вузла. Вся телеметрія включає метадані Kubernetes, такі як імʼя podʼа або імʼя вузла. Оскільки ми використовуємо Kubernetes Attributes Processor, ми зможемо корелювати трасування, метрики та логи нашого застосунку з метриками, що генеруються Kubeletstats Receiver.

### Filelog Receiver

[Filelog Receiver](/docs/platforms/kubernetes/collector/components/#filelog-receiver) буде збирати логи, записані у stdout/stderr, шляхом читання логів, які Kubernetes записує у `/var/log/pods/*/*/*.log`. Як і більшість лог-читачів, filelog receiver надає набір дій, що дозволяють вам аналізувати файл так, як вам потрібно.

Можливо, колись вам доведеться налаштувати Filelog Receiver самостійно, але для цього керівництва Helm-чарт OpenTelemetry зробить всю складну конфігурацію за вас. Крім того, він витягне корисні метадані Kubernetes на основі імені файлу. Оскільки ми використовуємо Kubernetes Attributes Processor, ми зможемо корелювати трейси, метрики та логи застосунку з логами, що генеруються Filelog Receiver.

---

Helm-чарт OpenTelemetry Collector полегшує налаштування всіх цих компонентів в установці daemonset колектора. Він також подбає про всі специфічні деталі Kubernetes, такі як RBAC, монтування та порти хосту.

Застереження, стандартно чарт не надсилає дані до жодного бекенду. Якщо ви хочете використовувати свої дані у вашому улюбленому бекенді, вам доведеться налаштувати експортер самостійно.

Ми будемо використовувати наступний `values.yaml`:

```yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-k8s

presets:
  # включає k8sattributesprocessor та додає його до трейсів, метрик та логів
  kubernetesAttributes:
    enabled: true
  # включає kubeletstatsreceiver та додає його до метрик
  kubeletMetrics:
    enabled: true
  # Включає filelogreceiver та додає його до логів
  logsCollection:
    enabled: true
## Чарт стандартно включає тільки debugexporter
## Якщо ви хочете надсилати свої дані кудись, вам потрібно
## налаштувати експортер, наприклад otlp exporter
# config:
#   exporters:
#     otlp:
#       endpoint: "<ДЕЯКИЙ БЕКЕНД>"
#   service:
#     pipelines:
#       traces:
#         exporters: [ otlp ]
#       metrics:
#         exporters: [ otlp ]
#       logs:
#         exporters: [ otlp ]
```

Щоб використовувати цей `values.yaml` з чартом, збережіть його у вашому улюбленому місці та потім виконайте наступну команду для встановлення чарта:

```sh
helm install otel-collector open-telemetry/opentelemetry-collector --values <шлях, де ви зберегли чарт>
```

Тепер у вашому кластері має працювати установка daemonset OpenTelemetry Collector, що збирає телеметрію з кожного вузла!

## Deployment Collector

Наступний крок до збору телеметрії Kubernetes — це розгортання екземпляра deployment колектора для збору телеметрії, повʼязаної з кластером в цілому. Deployment з точно одною реплікою гарантує, що ми не будемо генерувати дубльовані дані.

Цей екземпляр колектора буде використовувати наступні компоненти:

- [Kubernetes Cluster Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver): для збору метрик на рівні кластера та подій обʼєктів.
- [Kubernetes Objects Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver): для збору обʼєктів, таких як події, з API-сервера Kubernetes.

Розгляньмо їх детальніше.

### Kubernetes Cluster Receiver

[Kubernetes Cluster Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver) є рішенням колектора для збору метрик про стан кластера в цілому. Цей приймач може збирати метрики про умови вузлів, фази podʼів, перезапуски контейнерів, доступні та бажані розгортання та багато іншого.

### Kubernetes Objects Receiver

[Kubernetes Objects Receiver](/docs/platforms/kubernetes/collector/components/#kubernetes-objects-receiver) є рішенням колектора для збору обʼєктів Kubernetes як логів. Хоча можна збирати будь-які обʼєкти, загальним та важливим випадком використання є збір подій Kubernetes.

---

Helm-чарт OpenTelemetry Collector спрощує налаштування всіх цих компонентів в установці deployment колектора. Він також подбає про всі специфічні деталі Kubernetes, такі як RBAC та монтування.

Застереження, стандартно чарт не надсилає дані до жодного бекенду. Якщо ви хочете використовувати свої дані у вашому улюбленому бекенді, вам доведеться налаштувати експортер самостійно.

Ми будемо використовувати наступний `values.yaml`

```yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-k8s

# Ми хочемо тільки один з цих колекторів - бвльше і ми будемо генерувати дубльовані дані
replicaCount: 1

presets:
  # включає k8sclusterreceiver та додає його до метрик
  clusterMetrics:
    enabled: true
  # включає k8sobjectsreceiver для збору тільки подій та додає його до логів
  kubernetesEvents:
    enabled: true
## Чарт стандартно включає тільки debugexporter
## Якщо ви хочете надсилати свої дані кудись, вам потрібно
## налаштувати експортер, наприклад otlp exporter
# config:
# exporters:
#   otlp:
#     endpoint: "<ДЕЯКИЙ БЕКЕНД>"
# service:
#   pipelines:
#     traces:
#       exporters: [ otlp ]
#     metrics:
#       exporters: [ otlp ]
#     logs:
#       exporters: [ otlp ]
```

Щоб використовувати цей `values.yaml` з чартом, збережіть його у вашому улюбленому місці та потім виконайте наступну команду для встановлення чарта:

```sh
helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <шлях, де ви зберегли чарт>
```

Тепер у вашому кластері має працювати установка deployment колектора, що збирає метрики кластера та події!

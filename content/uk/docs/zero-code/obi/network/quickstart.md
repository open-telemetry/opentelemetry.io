---
title: Швидкий старт з отримання мережевих метрик OBI
linkTitle: Швидкий старт
description: Посібник для швидкого старту, щоб отримати мережеві метрики з Інструментації OpenTelemetry eBPF
weight: 1
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

OBI може генерувати мережеві метрики в будь-якому середовищі (фізичний хост, віртуальний хост або контейнер). Рекомендується використовувати середовище Kubernetes, оскільки OBI може прикрашати кожну метрику метаданими джерела та призначення Kubernetes-обʼєктів.

Інструкції в цьому посібнику швидкого старту зосереджені на безпосередньому розгортанні в Kubernetes за допомогою утиліти командного рядка kubectl. Цей посібник описує, як розгорнути OBI в Kubernetes з нуля. Щоб використовувати Helm, зверніться до документації [Розгортання OBI в Kubernetes за допомогою Helm](../../setup/kubernetes-helm/).

## Розгортання OBI з мережевими метриками {#deploy-obi-with-network-metrics}

Щоб увімкнути мережеві метрики, встановіть наступну опцію у вашій конфігурації OBI:

Змінні середовища:

```bash
export OTEL_EBPF_NETWORK_METRICS=true
```

Мережеві метрики вимагають, щоб вони були прикрашені метаданими Kubernetes. Щоб увімкнути цю функцію, встановіть наступну опцію у вашій конфігурації OBI:

Змінні середовища:

```bash
export OTEL_EBPF_KUBE_METADATA_ENABLE=true
```

Більше про конфігураційні параметри можна дізнатися в [документації з конфігурації OBI](../../configure/options/).

## Проста настройка {#simple-setup}

### Розгортання OBI {#deploy-obi}

Наступна конфігурація YAML забезпечує просте розгортання OBI для мережевих метрик:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: obi
  name: obi
---
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: obi
  name: obi-config
data:
  obi-config.yml: |
    network:
      enable: true
    attributes:
      kubernetes:
        enable: true
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  namespace: obi
  name: obi
spec:
  selector:
    matchLabels:
      instrumentation: obi
  template:
    metadata:
      labels:
        instrumentation: obi
    spec:
      serviceAccountName: obi
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: obi-config
          configMap:
            name: obi-config
        - name: obi
          image: otel/ebpf-instrument:main
          securityContext:
            privileged: true
          volumeMounts:
            - mountPath: /config
              name: obi-config
          env:
            - name: OTEL_EBPF_CONFIG_PATH
              value: '/config/obi-config.yml'
```

Деякі зауваження щодо цієї конфігурації:

- Контейнер використовує останній образ `otel/ebpf-instrument:main`, який знаходиться на стадії розробки.
- OBI потрібно запускати як DaemonSet, оскільки він вимагає лише одного екземпляра OBI на вузол.
- Щоб прослуховувати мережеві пакети на хості, OBI вимагає дозволу `hostNetwork: true`.

### Перевірка генерації мережевих метрик {#verify-network-metrics-generation}

Якщо все працює як очікувалося, ваші екземпляри OBI повинні захоплювати та обробляти мережеві потоки. Щоб це перевірити, перевірте журнали для DaemonSet OBI, щоб побачити деяку інформацію для налагодження:

```bash
kubectl logs daemonset/obi -n obi | head
```

Результат буде приблизно таким:

```text
network_flow: obi.ip=172.18.0.2 iface= direction=255 src.address=10.244.0.4 dst.address=10.96.0.1
```

### Експортування метрик до точки доступу OpenTelemetry {#export-metrics-to-opentelemetry-endpoint}

Якщо ви переконались, що мережеві метрики збираються, налаштуйте OBI для експорту метрик у форматі OpenTelemetry до точки доступу колектора.

Перевірте [документацію з експорту даних](/docs/zero-code/obi/configure/export-data#opentelemetry-metrics-exporter-component), щоб налаштувати експортер OpenTelemetry.

### Дозволені атрибути {#allowed-attributes}

Типово OBI включає наступні [атрибути](./) у метрику `obi.network.flow.bytes`:

- `k8s.src.owner.name`
- `k8s.src.namespace`
- `k8s.dst.owner.name`
- `k8s.dst.namespace`
- `k8s.cluster.name`

OBI включає лише підмножину доступних атрибутів, щоб уникнути вибуху кардинальності.

Наприклад:

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.name
    - k8s.dst.owner.type
```

Еквівалентна метрика Prometheus буде:

```text
obi.network.flow.bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

В цьому прикладі значення `obi.network.flow.bytes` буде агрегуватися за імʼям та типом власника Kubernetes джерела та призначення, а не за іменами окремих подів.

## Конфігурація CIDR {#cidr-configuration}

Ви можете налаштувати OBI для розподілу метрик за діапазонами CIDR. Це корисно для відстеження трафіку до конкретних мережевих діапазонів, таких як IP-діапазони постачальника хмари або внутрішній/зовнішній трафік.

Підрозділ YAML `cidrs` у `network` (або змінна середовища `OTEL_EBPF_NETWORK_CIDRS`) приймає список діапазонів CIDR та відповідну назву.

Наприклад, щоб відстежувати метрики за попередньо визначеними мережами:

```yaml
network:
  cidrs:
    - cidr: 10.0.0.0/8
      name: 'cluster-internal'
    - cidr: 192.168.0.0/16
      name: 'private'
    - cidr: 172.16.0.0/12
      name: 'container-internal'
```

Тоді еквівалентна метрика Prometheus буде такою:

```text
obi_network_flow_bytes:
  src_cidr="cluster-internal"
  dst_cidr="private"
```

---
title: Метрики мережі
linkTitle: Мережа
description: Налаштування OBI для спостереження за мережевими метриками між точками.
weight: 8
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: replicaset statefulset
---

Інструментування OpenTelemetry eBPF може бути налаштоване для надання мережевих метрик між різними кінцевими точками. Наприклад, між фізичними вузлами, контейнерами, подами Kubernetes, сервісами тощо.

## Початок роботи {#get-started}

Щоб почати використовувати мережеві метрики OBI, ознайомтеся з [документацією швидкого налаштування](quickstart/), а для розширеної конфігурації ознайомтеся з [документацією конфігурації](config/).

## Метрики мережі {#network-metrics}

OBI надає дві групи мережевих метрик:

**Метрики потоку**: захоплюють байти, надіслані та отримані між різними точками доступу з точки зору програми.

- `obi.network.flow.bytes`, якщо експортується через OpenTelemetry.
- `obi_network_flow_bytes_total`, якщо експортується через точку доступу Prometheus.
- Щоб увімкнути його, додайте опцію `network` до [OTEL_EBPF_METRICS_FEATURES](../configure/export-data/) configuration option.

**Метрики між зонами**: захоплюють байти, надіслані та отримані між різними зонами доступності з точки зору програми.

- `obi.network.inter.zone.bytes`, якщо експортується через OpenTelemetry.
- `obi_network_inter_zone_bytes_total`, якщо експортується через точку доступу Prometheus.
- Щоб увімкнути його, додайте опцію `network` до [OTEL_EBPF_METRICS_FEATURES](../configure/export-data/).

> [!NOTE]
>
> Метрики захоплюються з точки зору хосту, тому вони включають накладні витрати стеку мережі (заголовки протоколів тощо).

## Атрибути метрик {#metric-attributes}

Мережеві метрики маркуються наступними атрибутами:

| Атрибут                                     | Опис                                                                                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `obi.ip` / `obi_ip`                         | Локальна IP-адреса екземпляра OBI, який надіслав метрику                                                                                                                                           |
| `direction`                                 | `ingress` для вхідного трафіку, `egress` для вихідного трафіку                                                                                                                                     |
| `iface`                                     | Назва мережевого інтерфейсу                                                                                                                                                                        |
| `src.address`                               | IP-адреса джерела (локальна для виходу, віддалена для входу)                                                                                                                                       |
| `src.port`                                  | Порт джерела (локальний для виходу, віддалений для входу)                                                                                                                                          |
| `src.cidr`                                  | CIDR джерела (якщо налаштовано)                                                                                                                                                                    |
| `dst.address`                               | IP-адреса призначення (віддалена для виходу, локальна для входу)                                                                                                                                   |
| `dst.port`                                  | Порт призначення (віддалений для виходу, локальний для входу)                                                                                                                                      |
| `dst.cidr`                                  | CIDR призначення (якщо налаштовано)                                                                                                                                                                |
| `transport`                                 | Транспортний протокол: `tcp`, `udp`                                                                                                                                                                |
| `k8s.src.namespace` / `k8s_src_namespace`   | Назва простору імен джерела                                                                                                                                                                        |
| `k8s.src.name` / `k8s_src_name`             | Назва джерела pod                                                                                                                                                                                  |
| `k8s.src.type` / `k8s_src_type`             | Тип робочого навантаження джерела: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                         |
| `k8s.src.owner.name` / `k8s_src_owner_name` | Імʼя власника робочого навантаження джерела                                                                                                                                                        |
| `k8s.src.owner.type` / `k8s_src_owner_type` | Тип власника робочого навантаження джерела: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                       |
| `k8s.src.node.ip` / `k8s_src_node_ip`       | IP-адреса вузла джерела                                                                                                                                                                            |
| `k8s.src.node.name` / `k8s_src_node_name`   | Імʼя вузла джерела                                                                                                                                                                                 |
| `k8s.dst.namespace` / `k8s_dst_namespace`   | Назва простору імен призначення                                                                                                                                                                    |
| `k8s.dst.name` / `k8s_dst_name`             | Назва podʼа призначення                                                                                                                                                                            |
| `k8s.dst.type` / `k8s_dst_type`             | Тип робочого навантаження призначення: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                     |
| `k8s.dst.owner.name` / `k8s_dst_owner_name` | Імʼя власника робочого навантаження призначення                                                                                                                                                    |
| `k8s.dst.owner.type` / `k8s_dst_owner_type` | Тип власника робочого навантаження призначення: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                   |
| `k8s.dst.node.ip` / `k8s_dst_node_ip`       | IP-адреса вузла призначення                                                                                                                                                                        |
| `k8s.dst.node.name` / `k8s_dst_node_name`   | Імʼя вузла призначення                                                                                                                                                                             |
| `k8s.cluster.name` / `k8s_cluster_name`     | Назва кластера Kubernetes. OBI може автоматично виявити його в Google Cloud, Microsoft Azure та Amazon Web Services. Для інших постачальників встановіть властивість `OTEL_EBPF_KUBE_CLUSTER_NAME` |

## Агрегування метрик {#metric-reduction}

Для зменшення високої кардинальності метрик мережі, вони попередньо агрегуються на рівні процесу, щоб зменшити кількість метрик, що надсилаються до бекенду метрик.

Стандартно усі метрики агрегуються за такими атрибутами:

- `direction`
- `transport`
- `src.address`
- `dst.address`
- `src.port`
- `dst.port`

Ви можете вказати, які атрибути дозволені в конфігурації OBI, щоб агрегувати метрику за ними.

Наприклад, щоб агрегувати мережеві метрики за власником Kubernetes джерела та призначення (замість імен окремих podʼів), ви можете використовувати таку конфігурацію:

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.dst.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.type
```

Тоді еквівалентна метрика Prometheus буде такою:

```text
obi_network_flow_bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

В цьому прикладі значення `obi.network.flow.bytes` буде агрегуватися за імʼям та типом власника Kubernetes джерела та призначення, замість імен окремих podʼів.

## Метрики, основані на CIDR {#cidr-based-metrics}

Ви можете налаштувати OBI для розподілу метрик за діапазонами CIDR. Це корисно для відстеження трафіку до конкретних мережевих діапазонів, таких як IP-діапазони постачальників хмарних послуг або внутрішній/зовнішній трафік.

Підрозділ `cidrs` у YAML-файлі `network` (або змінна середовища `OTEL_EBPF_NETWORK_CIDRS`) приймає список діапазонів CIDR та відповідні імена. Наприклад:

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

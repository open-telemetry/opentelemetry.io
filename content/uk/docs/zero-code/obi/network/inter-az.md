---
title: Вимірювання трафіку між зонами доступності хмари
linkTitle: Вимірювання трафіку між зонами доступності хмари
description: Як виміряти мережевий трафік між різними зонами доступності хмари
weight: 1
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: obinetworkinterzone promql
---

> [!NOTE]
>
> Ця функція наразі доступна лише в кластерах Kubernetes.

Трафік між зонами доступності хмари може призвести до додаткових витрат. OBI може вимірювати його, або додаючи атрибути `src.zone` та `dst.zone` до регулярних мережевих метрик, або надаючи окрему метрику `obi.network.inter.zone.bytes` (OTel) / `obi_network_inter_zone_bytes_total` (Prometheus).

## Додавання атрибутів `src.zone` та `dst.zone` до звичайних мережевих метрик {#add-srczone-and-dstzone-attributes-to-regular-network-metrics}

Атрибути зон доступності джерела та призначення стандартно вимкнені в OBI. Щоб увімкнути їх, явно додайте їх до списку включених мережевих атрибутів у YAML-конфігурації OBI:

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      include:
        - k8s.src.owner.name
        - k8s.src.namespace
        - k8s.dst.owner.name
        - k8s.dst.namespace
        - k8s.cluster.name
        - src.zone
        - dst.zone
```

Ця конфігурація робить трафік між зонами доступності видимим для кожної метрики `obi_network_flow_bytes_total` з різними атрибутами `src_zone` та `dst_zone`.

Якщо вам потрібна вища деталізація у вимірюванні трафіку між зонами (наприклад, поди або вузли джерела/призначення), додавання атрибутів зон вплине на кардинальність метрики, навіть для трафіку в межах однієї зони доступності.

## Використання метрики `obi.network.inter.zone` {#use-the-obinetworkinterzone-metric}

Використання окремої метрики для трафіку між зонами зменшує вплив кардинальності метрики при зборі цих даних, оскільки атрибути `src.zone` та `dst.zone` не додаються до звичайних мережевих метрик.

Щоб увімкнути метрику `obi.network.inter.zone`, додайте опцію `network_inter_zone` до параметра конфігурації [OTEL_EBPF_METRICS_FEATURES](../../configure/export-data/), або її еквівалентні параметри YAML. Наприклад, якщо OBI налаштовано на експорт метрик через OpenTelemetry:

```yaml
metrics:
  features:
    - network
    - network_inter_zone
```

## Запити PromQL для вимірювання трафіку між зонами {#promql-queries-to-measure-inter-zone-traffic}

Припустимо, що обидва сімейства метрик `network` та `network_inter_zone` увімкнені, ви можете використовувати наступні запити PromQL для вимірювання трафіку між зонами:

Загальний пропуск трафіку між зонами:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

Пропускна здатність міжзонального трафіку, згрупована за зонами джерела та призначення:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval])) by(src_zone,dst_zone)
```

Загальна пропускна здатність трафіку в одній зоні:

```promql
sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
  - sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

Відсоток міжзонального трафіку від загального обсягу:

```promql
100 * sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
  / sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
```

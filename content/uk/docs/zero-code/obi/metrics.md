---
title: Експортовані метрики OBI
linkTitle: Експортовані метрики
description: Дізнайтеся про метрики HTTP/gRPC, які може експортувати OBI.
weight: 21
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: replicaset statefulset коміту
---

Наступна таблиця описує експортовані метрики в обох форматах OpenTelemetry та Prometheus.

| Сімейство   | Назва (OTel)                     | Назва (Prometheus)                     | Тип       | Одиниця | Опис                                                                                                                     |
| ----------- | -------------------------------- | -------------------------------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| Application | `http.client.request.duration`   | `http_client_request_duration_seconds` | Histogram | seconds | Тривалість HTTP викликів сервісів з боку клієнта                                                                         |
| Application | `http.client.request.body.size`  | `http_client_request_body_size_bytes`  | Histogram | bytes   | Розмір тіла HTTP запиту, надісланого клієнтом                                                                            |
| Application | `http.client.response.body.size` | `http_client_response_body_size_bytes` | Histogram | bytes   | Розмір тіла HTTP відповіді, надісланої клієнтом                                                                          |
| Application | `http.server.request.duration`   | `http_server_request_duration_seconds` | Histogram | seconds | Тривалість HTTP викликів сервісів з боку сервера                                                                         |
| Application | `http.server.request.body.size`  | `http_server_request_body_size_bytes`  | Histogram | bytes   | Розмір тіла HTTP запиту, отриманого на стороні сервера                                                                   |
| Application | `http.server.response.body.size` | `http_server_response_body_size_bytes` | Histogram | bytes   | Розмір тіла HTTP відповіді, отриманої на стороні сервера                                                                 |
| Application | `rpc.client.duration`            | `rpc_client_duration_seconds`          | Histogram | seconds | Тривалість викликів gRPC сервісів з боку клієнта                                                                         |
| Application | `rpc.server.duration`            | `rpc_server_duration_seconds`          | Histogram | seconds | Тривалість викликів RPC сервісів з боку сервера                                                                          |
| Application | `sql.client.duration`            | `sql_client_duration_seconds`          | Histogram | seconds | Тривалість операцій SQL клієнта (Експериментально)                                                                       |
| Application | `redis.client.duration`          | `redis_client_duration_seconds`        | Histogram | seconds | Тривалість операцій Redis клієнта (Експериментально)                                                                     |
| Application | `messaging.publish.duration`     | `messaging_publish_duration`           | Histogram | seconds | Тривалість операцій публікації Messaging (Kafka) (Експериментально)                                                      |
| Application | `messaging.process.duration`     | `messaging_process_duration`           | Histogram | seconds | Тривалість операцій обробки Messaging (Kafka) (Експериментально)                                                         |
| Network     | `obi.network.flow.bytes`         | `obi_network_flow_bytes`               | Counter   | bytes   | Байти, надіслані з вихідної мережевої точки в призначену мережеву точку                                                  |
| Network     | `obi.network.inter.zone.bytes`   | `obi_network_inter_zone_bytes`         | Counter   | bytes   | Байти, що проходять між зонами доступності хмари у вашому кластері (Експериментально, наразі доступно лише в Kubernetes) |

OBI може також експортувати [Span metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector) та [Service graph metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector), які ви можете увімкнути через опцію конфігурації [features](../configure/options/).

## Атрибути метрик OBI {#attributes-of-obi-metrics}

Для стислості, метрики та атрибути в цьому списку використовують OTel `dot.notation`. При використанні експортеру Prometheus, метрики використовують `underscore_notation`.

Щоб налаштувати, які атрибути показувати або які атрибути приховувати, перевірте розділ `attributes`->`select` в [документації з конфігурації](../configure/options/).

| Метрики                        | Назва                        | Стандартно                                           |
| ------------------------------ | ---------------------------- | ---------------------------------------------------- |
| Application (all)              | `http.request.method`        | показується                                          |
| Application (all)              | `http.response.status_code`  | показується                                          |
| Application (all)              | `http.route`                 | показується, якщо існує розділ конфігурації `routes` |
| Application (all)              | `k8s.daemonset.name`         | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.deployment.name`        | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.namespace.name`         | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.node.name`              | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.owner.name`             | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.pod.name`               | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.container.name`         | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.pod.start_time`         | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.pod.uid`                | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.replicaset.name`        | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.statefulset.name`       | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `k8s.cluster.name`           | показується, якщо увімкнено метадані Kubernetes      |
| Application (all)              | `service.name`               | показується                                          |
| Application (all)              | `service.namespace`          | показується                                          |
| Application (all)              | `target.instance`            | показується                                          |
| Application (all)              | `url.path`                   | приховано                                            |
| Application (client)           | `server.address`             | приховано                                            |
| Application (client)           | `server.port`                | приховано                                            |
| Application `rpc.*`            | `rpc.grpc.status_code`       | показується                                          |
| Application `rpc.*`            | `rpc.method`                 | показується                                          |
| Application `rpc.*`            | `rpc.system`                 | показується                                          |
| Application (server)           | `client.address`             | приховано                                            |
| `obi.network.flow.bytes`       | `obi.ip`                     | приховано                                            |
| `db.client.operation.duration` | `db.operation.name`          | показується                                          |
| `db.client.operation.duration` | `db.collection.name`         | приховано                                            |
| `messaging.publish.duration`   | `messaging.system`           | показується                                          |
| `messaging.publish.duration`   | `messaging.destination.name` | показується                                          |
| `messaging.process.duration`   | `messaging.system`           | показується                                          |
| `messaging.process.duration`   | `messaging.destination.name` | показується                                          |
| `obi.network.flow.bytes`       | `client.port`                | приховано                                            |
| `obi.network.flow.bytes`       | `direction`                  | приховано                                            |
| `obi.network.flow.bytes`       | `dst.address`                | приховано                                            |
| `obi.network.flow.bytes`       | `dst.cidr`                   | показується, якщо існує секція конфігурації `cidrs`  |
| `obi.network.flow.bytes`       | `dst.name`                   | приховано                                            |
| `obi.network.flow.bytes`       | `dst.port`                   | приховано                                            |
| `obi.network.flow.bytes`       | `dst.zone` (only Kubernetes) | приховано                                            |
| `obi.network.flow.bytes`       | `iface`                      | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.cluster.name`           | показується, якщо увімкнено Kubernetes               |
| `obi.network.flow.bytes`       | `k8s.dst.name`               | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.dst.namespace`          | показується, якщо увімкнено Kubernetes               |
| `obi.network.flow.bytes`       | `k8s.dst.node.ip`            | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.dst.node.name`          | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.dst.owner.type`         | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.dst.type`               | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.dst.owner.name`         | показується, якщо увімкнено Kubernetes               |
| `obi.network.flow.bytes`       | `k8s.src.name`               | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.src.namespace`          | показується, якщо увімкнено Kubernetes               |
| `obi.network.flow.bytes`       | `k8s.src.node.ip`            | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.src.owner.name`         | показується, якщо увімкнено Kubernetes               |
| `obi.network.flow.bytes`       | `k8s.src.owner.type`         | приховано                                            |
| `obi.network.flow.bytes`       | `k8s.src.type`               | приховано                                            |
| `obi.network.flow.bytes`       | `server.port`                | приховано                                            |
| `obi.network.flow.bytes`       | `src.address`                | приховано                                            |
| `obi.network.flow.bytes`       | `src.cidr`                   | показується, якщо існує секція конфігурації `cidrs`  |
| `obi.network.flow.bytes`       | `src.name`                   | приховано                                            |
| `obi.network.flow.bytes`       | `src.port`                   | приховано                                            |
| `obi.network.flow.bytes`       | `src.zone` (only Kubernetes) | приховано                                            |
| `obi.network.flow.bytes`       | `transport`                  | приховано                                            |
| `obi.network.flow.bytes`       | `network.type`               | приховано                                            |
| `obi.network.flow.bytes`       | `network.protocol.name`      | приховано                                            |
| `obi.network.flow.bytes`       | `src.country`                | показується, якщо є розділ конфігурації `geoip`      |
| `obi.network.flow.bytes`       | `src.asn`                    | показується, якщо є розділ конфігурації `geoip`      |
| `obi.network.flow.bytes`       | `dst.country`                | показується, якщо є розділ конфігурації `geoip`      |
| `obi.network.flow.bytes`       | `dst.asn`                    | показується, якщо є розділ конфігурації `geoip`      |
| Traces (SQL, Redis)            | `db.query.text`              | приховано                                            |

> [!NOTE]
>
> Метрика `obi.network.inter.zone.bytes` підтримує той самий набір атрибутів, що й `obi.network.flow.bytes`, але всі вони стандартно приховані, за винятком `k8s.cluster.name`, `src.zone` і `dst.zone`.

## Внутрішні метрики {#internal-metrics}

OBI може бути [сконфігуровано для звітування про внутрішні метрики](../configure/internal-metrics-reporter/) у форматі Prometheus.

| Назва                                | Тип        | Опис                                                                                         |
| ------------------------------------ | ---------- | -------------------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`            | Histogram  | Довжина груп трейсів, які скидаються з eBPF трейсера на наступний етап обробки               |
| `obi_metric_exports_total`           | Counter    | Довжина пакетів метрик, надісланих до віддаленого OTel колектора                             |
| `obi_metric_export_errors_total`     | CounterVec | Кількість помилок при кожному невдалому експорті метрик OTel, за типом помилки               |
| `obi_trace_exports_total`            | Counter    | Довжина пакетів трейсів, надісланих до віддаленого OTel колектора                            |
| `obi_trace_export_errors_total`      | CounterVec | Кількість помилок при кожному невдалому експорті трейсів OTel, за типом помилки              |
| `obi_prometheus_http_requests_total` | CounterVec | Кількість запитів до точки доступу збору метрик Prometheus, розбитих за HTTP портом і шляхом |
| `obi_instrumented_processes`         | GaugeVec   | Процеси, які підлягають інструментуванню OBI, з назвою процесу                               |
| `obi_internal_build_info`            | GaugeVec   | Інформація про версію бінарного файлу OBI, включаючи час збірки та хеш коміту                |

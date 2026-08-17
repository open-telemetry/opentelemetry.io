---
title: Експортовані метрики OBI
linkTitle: Експортовані метрики
description: Дізнайтеся про метрики застосунків, середовища виконання та мережі, які може експортувати OBI.
weight: 21
default_lang_commit: f4cc67cd44fa9d9f23de8f5a121f15d7eea9b043
cSpell:ignore: gogc replicaset statefulset коміту
---

Наступна таблиця описує експортовані метрики в обох форматах OpenTelemetry та Prometheus.

| Сімейство   | Назва (OTel)                          | Назва (Prometheus)                            | Тип       | Одиниця | Опис                                                                                                                              |
| ----------- | ------------------------------------- | --------------------------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Application | `http.client.request.duration`        | `http_client_request_duration_seconds`        | Histogram | seconds | Тривалість HTTP викликів сервісів з боку клієнта                                                                                  |
| Application | `http.client.request.body.size`       | `http_client_request_body_size_bytes`         | Histogram | bytes   | Розмір тіла HTTP запиту, надісланого клієнтом                                                                                     |
| Application | `http.client.response.body.size`      | `http_client_response_body_size_bytes`        | Histogram | bytes   | Розмір тіла HTTP відповіді, надісланої клієнтом                                                                                   |
| Application | `http.server.request.duration`        | `http_server_request_duration_seconds`        | Histogram | seconds | Тривалість HTTP викликів сервісів з боку сервера                                                                                  |
| Application | `http.server.request.body.size`       | `http_server_request_body_size_bytes`         | Histogram | bytes   | Розмір тіла HTTP запиту, отриманого на стороні сервера                                                                            |
| Application | `http.server.response.body.size`      | `http_server_response_body_size_bytes`        | Histogram | bytes   | Розмір тіла HTTP відповіді, отриманої на стороні сервера                                                                          |
| Application | `rpc.client.call.duration`            | `rpc_client_call_duration_seconds`            | Histogram | seconds | Тривалість викликів RPC сервісів з боку клієнта                                                                                   |
| Application | `rpc.server.call.duration`            | `rpc_server_call_duration_seconds`            | Histogram | seconds | Тривалість викликів RPC сервісів з боку сервера                                                                                   |
| Application | `db.client.operation.duration`        | `db_client_operation_duration_seconds`        | Histogram | seconds | Тривалість операцій клієнта бази даних (Експериментально)                                                                         |
| Application | `messaging.client.operation.duration` | `messaging_client_operation_duration_seconds` | Histogram | seconds | Тривалість операцій клієнта обміну повідомленнями в підтримуваних системах, таких як Kafka, MQTT, NATS та AMQP (Експериментально) |
| Application | `messaging.process.duration`          | `messaging_process_duration_seconds`          | Histogram | seconds | Тривалість операцій обробки повідомлень у підтримуваних системах, таких як Kafka, MQTT, NATS та AMQP (Експериментально)           |
| Application | `gen_ai.client.operation.duration`    | `gen_ai_client_operation_duration_seconds`    | Histogram | seconds | Тривалість операцій клієнта GenAI (Експериментально)                                                                              |
| Application | `gen_ai.client.token.usage`           | `gen_ai_client_token_usage`                   | Histogram | 1       | Кількість спожитих вхідних/вихідних токенів GenAI, з мітками за типом токена (Експериментально)                                   |
| Go runtime  | `go.memory.limit`                     | `go_memory_limit_bytes`                       | Gauge     | bytes   | Обмеження памʼяті середовища виконання, налаштоване для інструментованого сервісу Go                                              |
| Go runtime  | `go.memory.gc.cycles`                 | `go_memory_gc_cycles_total`                   | Counter   | cycles  | Завершені цикли збирання сміття Go                                                                                                |
| Go runtime  | `go.processor.limit`                  | `go_processor_limit`                          | Gauge     | threads | Поточне значення `GOMAXPROCS`                                                                                                     |
| Go runtime  | `go.config.gogc`                      | `go_config_gogc_percent`                      | Gauge     | percent | Поточний відсоток цільової купи `GOGC`                                                                                            |
| JVM runtime | `jvm.memory.used`                     | `jvm_memory_used_bytes`                       | Gauge     | bytes   | Поточна використана памʼять JVM, з мітками за типом памʼяті та пулом                                                              |
| JVM runtime | `jvm.memory.committed`                | `jvm_memory_committed_bytes`                  | Gauge     | bytes   | Поточна зарезервована памʼять JVM, з мітками за типом памʼяті та пулом                                                            |
| JVM runtime | `jvm.memory.limit`                    | `jvm_memory_limit_bytes`                      | Gauge     | bytes   | Поточне обмеження памʼяті JVM, з мітками за типом памʼяті та пулом                                                                |
| JVM runtime | `jvm.memory.used_after_last_gc`       | `jvm_memory_used_after_last_gc_bytes`         | Gauge     | bytes   | Памʼять JVM, використана після останнього збирання сміття                                                                         |
| JVM runtime | `obi.jvm.heap.used`                   | `obi_jvm_heap_used_bytes`                     | Gauge     | bytes   | Використання купи HotSpot до або після збирання сміття                                                                            |
| Network     | `obi.network.flow.bytes`              | `obi_network_flow_bytes_total`                | Counter   | bytes   | Байти, надіслані з вихідної мережевої точки в призначену мережеву точку                                                           |
| Network     | `obi.network.flow.packets`            | `obi_network_flow_packets_total`              | Counter   | packets | Пакети, що спостерігаються між вихідною та призначеною мережевими точками                                                         |
| Network     | `obi.network.inter.zone.bytes`        | `obi_network_inter_zone_bytes_total`          | Counter   | bytes   | Байти, що проходять між зонами доступності хмари у вашому кластері (Експериментально, наразі доступно лише в Kubernetes)          |
| Network     | `obi.stat.tcp.rtt`                    | `obi_stat_tcp_rtt_seconds`                    | Histogram | seconds | Час проходження TCP round-trip time (RTT) між мережевими точками (StatsO11y)                                                      |
| Network     | `obi.stat.tcp.failed.connections`     | `obi_stat_tcp_failed_connections_total`       | Counter   | 1       | Невдалі спроби TCP-зʼєднань між мережевими точками, з мітками за причиною невдачі (StatsO11y)                                     |
| Network     | `obi.stat.tcp.retransmits`            | `obi_stat_tcp_retransmits_total`              | Counter   | 1       | Повторні передачі TCP, що спостерігаються на з'єднання (StatsO11y)                                                                |
| Network     | `obi.stat.tcp.io`                     | `obi_stat_tcp_io_bytes_total`                 | Counter   | bytes   | Байти, передані на рівні сокета для кожного TCP-з'єднання та напрямку I/O (StatsO11y)                                             |

> [!NOTE]
>
> Версія v0.10.0 використовує назви семантичних угод OpenTelemetry `rpc.client.call.duration` та `rpc.server.call.duration`. Відповідні назви метрик Prometheus тепер містять `_call_`, як показано в таблиці.

OBI може також експортувати [Span metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector) та [Service graph metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector), які ви можете увімкнути через опцію конфігурації [features](../configure/options/).

## Атрибути метрик OBI {#attributes-of-obi-metrics}

Для стислості, метрики та атрибути в цьому списку використовують OTel `dot.notation`. При використанні експортеру Prometheus, метрики використовують `underscore_notation`.

Щоб налаштувати, які атрибути показувати або які атрибути приховувати, перевірте розділ `attributes`->`select` в [документації з конфігурації](../configure/options/).

| Метрики                               | Назва                                                     | Стандартно                                                |
| ------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Application (all)                     | `http.request.method`                                     | показується                                               |
| Application (all)                     | `http.response.status_code`                               | показується                                               |
| Application (all)                     | `http.route`                                              | показується, якщо існує розділ конфігурації `routes`      |
| Application (all)                     | `k8s.daemonset.name`                                      | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.deployment.name`                                     | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.namespace.name`                                      | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.node.name`                                           | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.owner.name`                                          | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.pod.name`                                            | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.container.name`                                      | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.pod.start_time`                                      | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.pod.uid`                                             | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.replicaset.name`                                     | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.statefulset.name`                                    | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `k8s.cluster.name`                                        | показується, якщо увімкнено метадані Kubernetes           |
| Application (all)                     | `container.id`                                            | показується, якщо увімкнено метадані Docker               |
| Application (all)                     | `container.name`                                          | показується, якщо увімкнено метадані Docker               |
| Application (all)                     | `cloud.provider`                                          | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `cloud.platform`                                          | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `cloud.region`                                            | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `cloud.account.id`                                        | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `cloud.availability_zone`                                 | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `cloud.resource_id`                                       | показується, якщо увімкнено метадані хмари (тільки Azure) |
| Application (all)                     | `host.id`                                                 | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `host.type`                                               | показується, якщо увімкнено метадані хмари                |
| Application (all)                     | `host.image.id`                                           | показується, якщо увімкнено метадані хмари (тільки AWS)   |
| Application (all)                     | `gcp.gce.instance.name`                                   | показується, якщо увімкнено метадані хмари (тільки GCP)   |
| Application (all)                     | `gcp.gce.instance.hostname`                               | показується, якщо увімкнено метадані хмари (тільки GCP)   |
| Application (all)                     | `service.name`                                            | показується                                               |
| Application (all)                     | `service.namespace`                                       | показується                                               |
| Application (all)                     | `target.instance`                                         | показується                                               |
| Application (all)                     | `url.path`                                                | приховано                                                 |
| Application (client)                  | `server.address`                                          | приховано                                                 |
| Application (client)                  | `server.port`                                             | приховано                                                 |
| Application `rpc.*`                   | `rpc.response.status_code`                                | показується                                               |
| Application `rpc.*`                   | `rpc.method`                                              | показується                                               |
| Application `rpc.*`                   | `rpc.system.name`                                         | показується                                               |
| Application (server)                  | `client.address`                                          | приховано                                                 |
| `obi.network.flow.bytes`              | `obi.ip`                                                  | приховано                                                 |
| `db.client.operation.duration`        | `db.operation.name`                                       | показується                                               |
| `db.client.operation.duration`        | `db.collection.name`                                      | приховано                                                 |
| `messaging.client.operation.duration` | `messaging.system`                                        | показується                                               |
| `messaging.client.operation.duration` | `messaging.destination.name`                              | показується                                               |
| `messaging.process.duration`          | `messaging.system`                                        | показується                                               |
| `messaging.process.duration`          | `messaging.destination.name`                              | показується                                               |
| `obi.network.flow.bytes`              | `client.port`                                             | приховано                                                 |
| `obi.network.flow.bytes`              | `direction`                                               | приховано                                                 |
| `obi.network.flow.bytes`              | `dst.address`                                             | приховано                                                 |
| `obi.network.flow.bytes`              | `dst.cidr`                                                | показується, якщо існує секція конфігурації `cidrs`       |
| `obi.network.flow.bytes`              | `dst.name`                                                | приховано                                                 |
| `obi.network.flow.bytes`              | `dst.port`                                                | приховано                                                 |
| `obi.network.flow.bytes`              | `dst.zone` (only Kubernetes)                              | приховано                                                 |
| `obi.network.flow.bytes`              | `iface`                                                   | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.cluster.name`                                        | показується, якщо увімкнено Kubernetes                    |
| `obi.network.flow.bytes`              | `k8s.dst.name`                                            | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.dst.namespace`                                       | показується, якщо увімкнено Kubernetes                    |
| `obi.network.flow.bytes`              | `k8s.dst.node.ip`                                         | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.dst.node.name`                                       | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.dst.owner.type`                                      | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.dst.type`                                            | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.dst.owner.name`                                      | показується, якщо увімкнено Kubernetes                    |
| `obi.network.flow.bytes`              | `k8s.src.name`                                            | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.src.namespace`                                       | показується, якщо увімкнено Kubernetes                    |
| `obi.network.flow.bytes`              | `k8s.src.node.ip`                                         | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.src.owner.name`                                      | показується, якщо увімкнено Kubernetes                    |
| `obi.network.flow.bytes`              | `k8s.src.owner.type`                                      | приховано                                                 |
| `obi.network.flow.bytes`              | `k8s.src.type`                                            | приховано                                                 |
| `obi.network.flow.bytes`              | `server.port`                                             | приховано                                                 |
| `obi.network.flow.bytes`              | `src.address`                                             | приховано                                                 |
| `obi.network.flow.bytes`              | `src.cidr`                                                | показується, якщо існує секція конфігурації `cidrs`       |
| `obi.network.flow.bytes`              | `src.name`                                                | приховано                                                 |
| `obi.network.flow.bytes`              | `src.port`                                                | приховано                                                 |
| `obi.network.flow.bytes`              | `src.zone` (only Kubernetes)                              | приховано                                                 |
| `obi.network.flow.bytes`              | `transport`                                               | приховано                                                 |
| `obi.network.flow.bytes`              | `network.type`                                            | приховано                                                 |
| `obi.network.flow.bytes`              | `network.protocol.name`                                   | приховано                                                 |
| `obi.network.flow.bytes`              | `src.country`                                             | показується, якщо є розділ конфігурації `geoip`           |
| `obi.network.flow.bytes`              | `src.asn`                                                 | показується, якщо є розділ конфігурації `geoip`           |
| `obi.network.flow.bytes`              | `dst.country`                                             | показується, якщо є розділ конфігурації `geoip`           |
| `obi.network.flow.bytes`              | `dst.asn`                                                 | показується, якщо є розділ конфігурації `geoip`           |
| `obi.stat.tcp.rtt`                    | `obi.ip`                                                  | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `src.address`                                             | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `dst.address`                                             | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `src.port`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `dst.port`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `src.name`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `dst.name`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `src.zone`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `dst.zone`                                                | приховано                                                 |
| `obi.stat.tcp.rtt`                    | `network.tcp.handshake.role`                              | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `obi.ip`                                                  | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `src.address`                                             | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `dst.address`                                             | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `src.port`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `dst.port`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `src.name`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `dst.name`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `src.zone`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `dst.zone`                                                | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `reason`                                                  | приховано                                                 |
| `obi.stat.tcp.failed.connections`     | `network.tcp.handshake.role`                              | приховано                                                 |
| `obi.stat.tcp.retransmits`            | Атрибути адреси, порту, імені та зони джерела/призначення | приховано                                                 |
| `obi.stat.tcp.io`                     | Атрибути адреси, порту, імені та зони джерела/призначення | приховано                                                 |
| `obi.stat.tcp.io`                     | `network.io.direction`                                    | показується                                               |
| Traces (HTTP)                         | `url.query`                                               | показується, якщо є рядок запиту                          |
| Traces (GraphQL)                      | `graphql.document`                                        | приховано                                                 |
| Traces (SQL, Redis)                   | `db.query.text`                                           | приховано                                                 |

> [!NOTE]
>
> Метрика `obi.network.inter.zone.bytes` підтримує той самий набір атрибутів, що й `obi.network.flow.bytes`, але всі вони стандартно приховані, за винятком `k8s.cluster.name`, `src.zone` і `dst.zone`.
>
> Метрика `obi.network.flow.packets` підтримує ті самі атрибути та стандартні значення, що й `obi.network.flow.bytes`. Метрики памʼяті JVM включають `jvm.memory.type` та `jvm.memory.pool.name`; `obi.jvm.heap.used` включає `jvm.gc.phase`.

## Внутрішні метрики {#internal-metrics}

OBI може бути [сконфігуровано для звітування про внутрішні метрики](../configure/internal-metrics-reporter/) у форматі Prometheus.

| Назва                                   | Тип        | Опис                                                                                         |
| --------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`               | Histogram  | Довжина груп трейсів, які скидаються з eBPF трейсера на наступний етап обробки               |
| `obi_metric_exports_total`              | Counter    | Довжина пакетів метрик, надісланих до віддаленого OTel колектора                             |
| `obi_metric_export_errors_total`        | CounterVec | Кількість помилок при кожному невдалому експорті метрик OTel, за типом помилки               |
| `obi_trace_exports_total`               | Counter    | Довжина пакетів трейсів, надісланих до віддаленого OTel колектора                            |
| `obi_trace_export_errors_total`         | CounterVec | Кількість помилок при кожному невдалому експорті трейсів OTel, за типом помилки              |
| `obi_prometheus_http_requests_total`    | CounterVec | Кількість запитів до точки доступу збору метрик Prometheus, розбитих за HTTP портом і шляхом |
| `obi_bpf_network_ignored_packets_total` | Counter    | Кількість мережевих пакетів, відкинутих фільтрами мережі OBI перед обліком потоків           |
| `obi_instrumented_processes`            | GaugeVec   | Процеси, які підлягають інструментуванню OBI, з назвою процесу                               |
| `obi_internal_build_info`               | GaugeVec   | Інформація про версію бінарного файлу OBI, включаючи час збірки та хеш коміту                |
| `obi_avoided_services`                  | GaugeVec   | Сервіси, для яких OBI пригнічував телеметрію після виявлення експорту OpenTelemetry SDK      |

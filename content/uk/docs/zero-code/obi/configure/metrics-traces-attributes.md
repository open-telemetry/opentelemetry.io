---
title: Налаштування атрибутів метрик та трейсів OBI
linkTitle: Атрибути метрик
description: Налаштуйте компонент атрибутів метрик та трейсів, який контролює атрибути, що звітуються, включаючи декорацію ідентифікатора екземпляра та метадані інструментованих контейнерів Kubernetes.
weight: 30
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: kube kubecache kubeconfig replicaset statefulset
---

Ви можете налаштувати те, як OBI декорує атрибути для метрик та трейсів. Використовуйте верхній розділ YAML `attributes`, щоб увімкнути та налаштувати, як встановлюються атрибути.

В документі [експортованих метрик OBI](../../metrics/) перераховано атрибути, які ви можете повідомляти з кожною метрикою. Стандартно OBI повідомляє про деякі атрибути та приховує інші, щоб контролювати кардинальність.

В кожній метриці ви контролюєте, які атрибути бачити, за допомогою підрозділу `select`. Це map, де кожен ключ — це назва метрики або в її OpenTelemetry, або в Prometheus порту, і кожна метрика має дві властивості: `include` та `exclude`.

- `include` — це список атрибутів для звітування. Кожен атрибут може бути назвою або шаблоном, наприклад, `k8s.dst.*`, щоб включити всі атрибути, що починаються з `k8s.dst`. Якщо ви не надасте список `include`, OBI звітує про стандартний набір атрибутів, див. [експортовані метрики OBI](../../metrics/) для отримання додаткової інформації.
  information about default attributes for a given metric
- `exclude` — це список імен атрибутів або шаблонів, які потрібно видалити зі списку `include` або стандартного набору атрибутів

Приклад:

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      # обмежте атрибути OTEL_EBPF_network_flow_bytes лише трьома атрибутами
      include:
        - obi.ip
        - src.name
        - dst.port
    sql_client_duration:
      # повідомляйте про всі можливі атрибути, крім db_statement
      include: ['*']
      exclude: ['db_statement']
    http_client_request_duration:
      # повідомляйте про стандартний набір атрибутів, але виключіть інформацію про Kubernetes Pod
      exclude: ['k8s.pod.*']
```

На додачу, ви можете використовувати шаблони як назви метрик, щоб додати та виключити атрибути для груп метрик з однаковою назвою. Наприклад:

```yaml
attributes:
  select:
    http_*:
      include: ['*']
      exclude: ['http_path', 'http_route']
    http_client_*:
      # перевизначте http_* exclusion
      include: ['http_path']
    http_server_*:
      # перевизначте http_* exclusion
      include: ['http_route']
```

У попередньому прикладі всі метрики з назвою, що починається з `http_` або `http.`, включають всі можливі атрибути, крім `http_path` і `http_route` або `http.path`/`http.route`. Розділи `http_client_*` і `http_server_*` перевизначають базову конфігурацію, дозволяючи атрибут `http_path` для метрик HTTP-клієнтів і `http_route` для метрик HTTP-серверів.

Коли назва метрики відповідає кільком визначенням з використанням шаблонів, точні відповідності мають пріоритет над відповідностями за шаблоном.

## Розподілені трейси та поширення контексту {#distributed-traces-and-context-propagation}

Секція YAML: `ebpf`

Ви можете налаштувати компонент у секції `ebpf` вашої YAML-конфігурації або через змінні середовища.

| YAML<br>змінна середовища                                        | Опис                                                                                                                                                                                                          | Тип     | Стандартно |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- |
| `context_propagation`<br>`OTEL_EBPF_BPF_CONTEXT_PROPAGATION`     | Керує методом передачі контексту трасування. Прийняті значення: `all`, `headers`, `ip`, `disabled`. Для отримання додаткової інформації зверніться до [розділу про передачу контексту](#context-propagation). | string  | disabled   |
| `track_request_headers`<br>`OTEL_EBPF_BPF_TRACK_REQUEST_HEADERS` | Відстежує вхідні заголовки `Traceparent` для відрізків трейсів. Для отримання додаткової інформації зверніться до [розділу про відстеження заголовків запитів](#track-request-headers).                       | boolean | false      |

### Поширення контексту {#context-propagation}

OBI вставляє значення заголовка `Traceparent` для вихідних HTTP-запитів, щоб воно могло поширювати будь-який вхідний контекст до downstream-сервісів. Це поширення контексту працює для будь-якої мови програмування.

Для HTTP-запитів, зашифрованих за допомогою TLS (HTTPS), OBI кодує значення заголовка `Traceparent` на рівні TCP/IP пакетів. OBI повинен бути присутнім з обох сторін звʼязку.

Кодування на рівні TCP/IP пакетів використовує Linux Traffic Control (TC). Програми eBPF, які також використовують TC, повинні правильно зʼєднуватися з OBI. Для отримання додаткової інформації про зʼєднання програм зверніться до [документації з сумісності Cilium](../../cilium-compatibility/).

Ви можете вимкнути кодування на рівні TCP/IP та програми TC, встановивши `context_propagation="headers"`. Це поширення контексту повністю сумісне з будь-якою бібліотекою розподіленого трасування OpenTelemetry.

Значення поширення контексту:

- `all`: Увімкнути як HTTP, так і IP-опції для поширення контексту
- `headers`: Увімкнути поширення контексту лише через HTTP-заголовки
- `ip`: Увімкнути поширення контексту лише через поле IP-опцій
- `disabled`: Вимкнути поширення контексту трасування

Щоб використовувати цю опцію в контейнеризованих середовищах (Kubernetes та Docker), ви повинні:

- Розгорнути OBI як `DaemonSet` з доступом до мережі хосту `hostNetwork: true`
- Змонтувати том `/sys/fs/cgroup` з хосту як локальний `/sys/fs/cgroup`
- Надати контейнеру OBI можливість `CAP_NET_ADMIN`

gRPC та HTTP/2 не підтримуються.

Для прикладу налаштування розподілених трейсів у Kubernetes дивіться наш посібник [Розподілені трасування з OBI](../../distributed-traces/).

### Відстеження заголовків запитів {#track-request-headers}

Ця опція дозволяє OBI обробляти будь-які вхідні значення заголовка `Traceparent`. Якщо вона увімкнена, коли OBI бачить вхідний серверний запит з значенням заголовка `Traceparent`, він використовує наданий 'trace ID' для створення своїх власних відрізків трейсів.

Ця опція не впливає на програми Go, де поле `Traceparent` завжди обробляється.

Увімкнення цієї опції може збільшити накладні витрати на продуктивність при високому обсязі запитів. Ця опція корисна лише при генерації трейсів OBI; вона не впливає на метрики.

### Інші атрибути {#other-attributes}

| Параметр YAML<br>Змінна середовища                         | Опис                                                                 | Тип     | Стандартно |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | ------- | ---------- |
| `heuristic_sql_detect`<br>`OTEL_EBPF_HEURISTIC_SQL_DETECT` | Увімкнути евристичне виявлення SQL-клієнтів. Див. нижче для деталей. | boolean | (false)    |

Опція `heuristic sql detect` дозволяє OBI виявляти запити SQL-клієнтів, перевіряючи оператори запитів, навіть якщо протокол безпосередньо не підтримується. Стандартно OBI виявляє запити SQL-клієнтів за їх форматом бінарного протоколу. Якщо ви використовуєте технологію бази даних, яка безпосередньо не підтримується OBI, ви можете увімкнути цю опцію, щоб отримати телеметрію клієнта бази даних. Ця опція типово не увімкнена, оскільки вона може створювати хибнопозитивні результати, наприклад, якщо застосунок надсилає текст SQL для ведення журналу через TCP-зʼєднання. В даний час OBI нативно підтримує бінарні протоколи PostgreSQL та MySQL.

## Оформлення ідентифікатора екземпляра {#instance-id-decoration}

Секція YAML: `attributes.instance_id`

OBI прикрашає метрики та трасування унікальним рядком ідентифікатора екземпляра, що ідентифікує кожен інструментований застосунок. Типово OBI використовує імʼя хосту, на якому працює OBI (може бути імʼям контейнера або Podʼа), за яким слідує PID інструментованого процесу. Ви можете перевизначити, як складається ідентифікатор екземпляра, у параметрі `instance_id` YAML в секції `attributes` верхнього рівня.

Наприклад:

```yaml
attributes:
  instance_id:
    dns: false
```

| YAML<br>змінна середовища                    | Опис                                                                                                                                                                                                                | Тип     | Стандартно |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- |
| `dns`<br>`OTEL_EBPF_HOSTNAME_DNS_RESOLUTION` | Якщо `true`, OBI намагається розвʼязати локальне імʼя хосту через мережевий DNS. Якщо `false`, використовується локальне імʼя. Для отримання додаткової інформації див. розділ [dns](#dns).                         | boolean | true       |
| `override_hostname`<br>`OTEL_EBPF_HOSTNAME`  | Якщо встановлено, OBI використовує наданий рядок як частину хосту ідентифікатора екземпляра. Перевизначає розвʼязання DNS. Для отримання додаткової інформації див. розділ [override hostname](#override-hostname). | string  | (unset)    |

### DNS

Якщо `true`, OBI намагається розвʼязати локальне імʼя хосту через мережевий DNS. Якщо `false`, використовується локальне імʼя.

### Перевизначення hostname {#override-hostname}

Якщо встановлено, OBI використовує наданий рядок як частину хосту ідентифікатора екземпляра. Ця опція має пріоритет над `dns`.

## Декоратор Kubernetes {#kubernetes-decorator}

Секція YAML: `attributes.kubernetes`

Ви можете налаштувати компонент у секції `attributes.kubernetes` вашої YAML-конфігурації або через змінні середовища.

Щоб увімкнути цю функцію, ви повинні надати додаткові дозволи для Pod OBI. Див. деталі в розділі ["Налаштування розділу декорування метаданих Kubernetes" на сторінці "Запуск OBI в Kubernetes"](../../setup/kubernetes/).

Якщо ви встановите цю опцію в `true`, OBI декорує метрики та трейси метаданими Kubernetes. Якщо ви встановите її в `false`, OBI вимикає декоратор метаданих Kubernetes. Якщо ви встановите її в `autodetect`, OBI намагається виявити, чи працює він у середовищі Kubernetes, і вмикає декорацію метаданих, якщо так.

Наприклад:

```yaml
attributes:
  kubernetes:
    enable: true
```

| YAML<br>змінна середовища                                               | Опис                                                                                                                                                                                                                   | Тип            | Стандартно     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| `enable`<br>`OTEL_EBPF_KUBE_METADATA_ENABLE`                            | Вимикає чи вимикає декорацію метаданих Kubernetes. Встановіть `autodetect`, щоб увімкнути, якщо ви працюєте в Kubernetes. Для отримання додаткової інформації див. розділ [увімкнення Kubernetes](#enable-kubernetes). | boolean/string | false          |
| `kubeconfig_path`<br>`KUBECONFIG`                                       | Шлях до файлу конфігурації Kubernetes. Для отримання додаткової інформації див. розділ [шлях конфігурації Kubernetes](#kubernetes-configuration-path).                                                                 | string         | ~/.kube/config |
| `disable_informers`<br>`OTEL_EBPF_KUBE_DISABLE_INFORMERS`               | Список інформерів для вимкнення (`node`, `service`). Для отримання додаткової інформації див. розділ [вимкнення інформерів](#disable-informers).                                                                       | string         | (empty)        |
| `meta_restrict_local_node`<br>`OTEL_EBPF_KUBE_META_RESTRICT_LOCAL_NODE` | Обмежити метадані лише локальним вузлом. Для отримання додаткової інформації див. розділ [обмеження метаданих локальним вузлом](#meta-restrict-local-node).                                                            | boolean        | false          |
| `informers_sync_timeout`<br>`OTEL_EBPF_KUBE_INFORMERS_SYNC_TIMEOUT`     | Максимальний час очікування метаданих Kubernetes перед початком. Для отримання додаткової інформації див. розділ [тайм-аут синхронізації інформерів](#informers-sync-timeout).                                         | Duration       | 30s            |
| `informers_resync_period`<br>`OTEL_EBPF_KUBE_INFORMERS_RESYNC_PERIOD`   | Періодичне повторне синхронізування всіх метаданих Kubernetes. Для отримання додаткової інформації див. розділ [період повторної синхронізації інформерів](#informers-resynchronization-period).                       | Duration       | 30m            |
| `service_name_template`<br>`OTEL_EBPF_SERVICE_NAME_TEMPLATE`            | Шаблон Go для назв сервісів. Для отримання додаткової інформації див. розділ [шаблон назв сервісів](#service-name-template).                                                                                           | string         | (empty)        |

### Увімкнення Kubernetes {#enable-kubernetes}

Якщо ви запускаєте OBI в середовищі Kubernetes, ви можете налаштувати його для декорування трейсів і метрик стандартними мітками OpenTelemetry:

- `k8s.namespace.name`
- `k8s.deployment.name`
- `k8s.statefulset.name`
- `k8s.replicaset.name`
- `k8s.daemonset.name`
- `k8s.node.name`
- `k8s.pod.name`
- `k8s.container.name`
- `k8s.pod.uid`
- `k8s.pod.start_time`
- `k8s.cluster.name`
- `k8s.owner.name`

### Шлях конфігурації Kubernetes {#kubernetes-configuration-path}

Це стандартна змінна середовища конфігурації Kubernetes. Використовуйте її, щоб вказати OBI, де знайти конфігурацію Kubernetes для звʼязку з кластером Kubernetes. Зазвичай вам не потрібно змінювати це значення.

### Вимкнення інформерів {#disable-informers}

Прийнятне значення — це список, який може містити `node` та `service`.

Ця опція дозволяє вибірково вимкнути деякі інформери Kubernetes, які безперервно слухають API Kubernetes, щоб отримати метадані, необхідні для декорування мережевих метрик або метрик і трейсів застосунків. Коли ви розгортаєте OBI як DaemonSet у дуже великих кластерах, всі екземпляри OBI, які створюють кілька інформерів, можуть перенавантажити API Kubernetes.

Вимкнення деяких інформерів призводить до неповноти звітних метаданих, але зменшує навантаження на API Kubernetes.

Ви не можете вимкнути інформер Pods. Щоб зробити це, вимкніть все декорування метаданих Kubernetes.

### Метадані обмежують локальний вузол {#meta-restrict-local-node}

Якщо це значення істинне, OBI зберігає метадані Pod і Node тільки з вузла, на якому працює екземпляр OBI.

Ця опція зменшує обсяг памʼяті, що використовується для зберігання метаданих, але деякі метрики, такі як байти мережі або метрики графа служб, не включатимуть метадані з цільових Pod на іншому вузлі.

### Тайм-аут синхронізації інформерів {#informers-sync-timeout}

Це максимальний час, протягом якого OBI чекає отримання всіх метаданих Kubernetes перед початком декорування метрик і трейсів. Якщо цей тайм-аут досягається, OBI починає працювати нормально, але атрибути метаданих можуть бути неповними, поки всі метадані Kubernetes оновлюються у фоновому режимі.

### Період ресинхронізації інформерів {#informers-resynchronization-period}

OBI негайно отримує будь-яке оновлення метаданих ресурсів. Крім того, OBI періодично синхронізує всі метадані Kubernetes з частотою, яку ви вказуєте за допомогою цієї властивості. Вищі значення зменшують навантаження на API-сервіс Kubernetes.

### Шаблон імені сервісів {#service-name-template}

Ви можете використовувати шаблони Go для імен сервісів. Це дозволяє створювати умовні або розширені імена сервісів.

Наступний контекст доступний для шаблону:

```text
Meta: (*informer.ObjectMeta)
  Name: (string)
  Namespace: (string)
  Labels:
    label1: lv1
    label2: lv2
  Annotations:
    Anno1: av1
    Anno2: av2
  Pod: (*PodInfo)
  ...

ContainerName: (string)
```

Повний обʼєкт і структуру можна знайти у вихідному файлі `kubecache informer.pb.go`.

Приклади шаблонів імен сервісів:

```go
{{- .Meta.Namespace }}/{{ index .Meta.Labels "app.kubernetes.io/name" }}/{{ index .Meta.Labels "app.kubernetes.io/component" -}}{{ if .ContainerName }}/{{ .ContainerName -}}{{ end -}}
```

або

```go
{{- .Meta.Namespace }}/{{ index .Meta.Labels "app.kubernetes.io/name" }}/{{ index .Meta.Labels "app.kubernetes.io/component" -}}
```

В цьому прикладі використовується лише перший рядок, і він обрізається, щоб запобігти появі пробілів у імені сервісу.

## Додаткові атрибути групи {#extra-group-attributes}

OBI дозволяє покращити ваші метрики за допомогою користувацьких атрибутів, використовуючи конфігурацію `extra_group_attributes`. Це дає вам можливість включити додаткові метадані у ваші метрики, виходячи за межі стандартного набору.

Щоб використовувати цю функцію, вкажіть імʼя групи та список атрибутів, які ви хочете включити в цю групу.

Зараз підтримується лише група `k8s_app_meta`. Ця група містить специфічні для Kubernetes метадані, такі як імʼя Pod, простір імен, імʼя контейнера, UID Pod та інше.

Приклад конфігурації:

```yaml
attributes:
  kubernetes:
    enable: true
  extra_group_attributes:
    k8s_app_meta: ['k8s.app.version']
```

У цьому прикладі:

- Додавання `k8s.app.version` до блоку `extra_group_attributes > k8s_app_meta` призводить до появи мітки `k8s.app.version` у метриках.
- Ви також можете визначити анотації з префіксом `resource.opentelemetry.io/` і суфіксом `k8s.app.version` у ваших маніфестах Kubernetes, ці анотації автоматично включаються в метрики.

В наступній таблиці описані стандартні атрибути групи.

| Group          | Label                  |
| -------------- | ---------------------- |
| `k8s_app_meta` | `k8s.namespace.name`   |
| `k8s_app_meta` | `k8s.pod.name`         |
| `k8s_app_meta` | `k8s.container.name`   |
| `k8s_app_meta` | `k8s.deployment.name`  |
| `k8s_app_meta` | `k8s.replicaset.name`  |
| `k8s_app_meta` | `k8s.daemonset.name`   |
| `k8s_app_meta` | `k8s.statefulset.name` |
| `k8s_app_meta` | `k8s.node.name`        |
| `k8s_app_meta` | `k8s.pod.uid`          |
| `k8s_app_meta` | `k8s.pod.start_time`   |
| `k8s_app_meta` | `k8s.cluster.name`     |
| `k8s_app_meta` | `k8s.owner.name`       |

А ця таблиця описує метрики та їх асоційовані групи.

| Group          | OTel Metric                      | Prom Metric                            |
| -------------- | -------------------------------- | -------------------------------------- |
| `k8s_app_meta` | `process.cpu.utilization`        | `process_cpu_utilization_ratio`        |
| `k8s_app_meta` | `process.cpu.time`               | `process_cpu_time_seconds_total`       |
| `k8s_app_meta` | `process.memory.usage`           | `process_memory_usage_bytes`           |
| `k8s_app_meta` | `process.memory.virtual`         | `process_memory_virtual_bytes`         |
| `k8s_app_meta` | `process.disk.io`                | `process_disk_io_bytes_total`          |
| `k8s_app_meta` | `messaging.publish.duration`     | `messaging_publish_duration_seconds`   |
| `k8s_app_meta` | `messaging.process.duration`     | `messaging_process_duration_seconds`   |
| `k8s_app_meta` | `http.server.request.duration`   | `http_server_request_duration_seconds` |
| `k8s_app_meta` | `http.server.request.body.size`  | `http_server_request_body_size_bytes`  |
| `k8s_app_meta` | `http.server.response.body.size` | `http_server_response_body_size_bytes` |
| `k8s_app_meta` | `http.client.request.duration`   | `http_client_request_duration_seconds` |
| `k8s_app_meta` | `http.client.request.body.size`  | `http_client_request_body_size_bytes`  |
| `k8s_app_meta` | `http.client.response.body.size` | `http_client_response_body_size_bytes` |
| `k8s_app_meta` | `rpc.client.duration`            | `rpc_client_duration_seconds`          |
| `k8s_app_meta` | `rpc.server.duration`            | `rpc_server_duration_seconds`          |
| `k8s_app_meta` | `db.client.operation.duration`   | `db_client_operation_duration_seconds` |
| `k8s_app_meta` | `gpu.kernel.launch.calls`        | `gpu_kernel_launch_calls_total`        |
| `k8s_app_meta` | `gpu.kernel.grid.size`           | `gpu_kernel_grid_size_total`           |
| `k8s_app_meta` | `gpu.kernel.block.size`          | `gpu_kernel_block_size_total`          |
| `k8s_app_meta` | `gpu.memory.allocations`         | `gpu_memory_allocations_bytes_total`   |

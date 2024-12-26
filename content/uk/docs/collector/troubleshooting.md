---
title: Усунення несправностей
description: Рекомендації щодо усунення несправностей в роботі Колектора
weight: 25
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
cSpell:ignore: confmap pprof tracez zpages
---

Тут ви дізнаєтеся, як усувати проблеми, пов’язані зі станом і продуктивністю OpenTelemetry Collector.

## Інструменти усунення несправностей {#troubleshooting-tools}

Колектор надає різноманітні метрики, журнали та розширення для діагностики проблем.

### Внутрішня телеметрія {#internal-telemetry}

Ви можете налаштувати та використовувати [внутрішню телеметрію](/docs/collector/internal-telemetry/) Колектора для моніторингу його продуктивності.

### Локальні експортери {#local-exporters}

Для певних типів проблем, таких як перевірка конфігурації та налагодження мережі, ви можете надіслати невеликий обсяг тестових даних до Колектора, налаштованого на вивід у локальні журнали. Використовуючи [локальний експортер](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information), можна перевірити, як Колектор обробляє дані.

Для оперативного усунення несправностей варто використовувати [`debug` експортер](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md), який підтверджує отримання, обробку та експорт даних Колектором. Наприклад:

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

Щоб почати тестування, створіть корисне навантаження Zipkin. Наприклад, ви можете створити файл з назвою `trace.json`, який містить

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

Запустивши колектор, надішліть це корисне навантаження до колектора:

```shell
curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

Ви повинні побачити запис у журналі, подібний до наведеного нижче:

```shell
2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

Ви також можете налаштувати експортер `debug` таким чином, щоб виводилося все корисне навантаження:

```yaml
exporters:
  debug:
    verbosity: detailed
```

Якщо ви повторно запустите попередній тест зі зміненою конфігурацією, вивід журналу матиме такий вигляд:

```shell
2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### Перевірка компонентів Колектора {#check-collector-components}

Використовуйте наступну команду, щоб отримати список доступних компонентів у дистрибутиві Колектора, включно з їх рівнями стабільності. Зверніть увагу, що формат виводу може змінюватися між версіями.

```shell
otelcol components
```

Зразок вихідних даних:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
exporters:
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
```

### Розширення {#extensions}

Нижче наведено список розширень, які можна увімкнути для налагодження Колектора.

#### Профілювальник продуктивності (pprof) {#performance-profiler-pprof}

[Розширення pprof](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/pprofextension/README.md), доступне локально на порту `1777`, дозволяє профілювати роботу Колектора в реальному часі. Це складний сценарій використання, який зазвичай не є необхідним.

#### zPages {#zpages}

[Розширення zPages](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension/README.md), доступне локально на порту `55679`, можна використовувати для перегляду живих даних з отримувачів і експортерів Колектора.

Сторінка TraceZ, доступна за `/debug/tracez`, корисна для налагодження операцій трасування, таких як:

- Проблеми з затримкою — виявлення повільних частин застосунку.
- Безвихідні ситуації та проблеми з інструментуванням — визначення запущених відрізків, які не завершуються.
- Помилки — аналіз типів помилок та місця їх виникнення.

Зверніть увагу, що `zpages` може містити журнали помилок, які Колектор сам не генерує.

Для контейнеризованих середовищ може знадобитися відкриття цього порту у загальнодоступному інтерфейсі, а не тільки локально. Конфігурація `endpoint` здійснюється в розділі `extensions`:

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

## Контрольний список для налагодження складних конвеєрів {#checklist-for-debugging-complex-pipelines}

Якщо телеметрія проходить через кілька Колекторів та мереж, може бути складно ізолювати проблему. Для кожного "кроку" телеметрії через Колектор або інший компонент у вашому конвеєрі важливо перевірити:

- Чи є повідомлення про помилки в журналах Колектора?
- Як телеметрія надходить у цей компонент?
- Як телеметрія змінюється (наприклад, чи застосовується семплювання або редагування)?
- Як телеметрія експортується з цього компонента?
- У якому форматі представлена телеметрія?
- Як налаштований наступний етап маршрутизації?
- Чи існують мережеві політики, що блокують або обмежують передавання даних?

## Поширені проблеми Колектора {#common-collector-issues}

У цьому розділі пояснюється, як розвʼязувати типові проблеми Колектора.

### Колектор має проблеми з даними {#collector-is-experiencing-data-issues}

Колектор та його компоненти можуть стикатися з проблемами під час обробки даних.

#### Колектор втрачає дані {#collector-is-dropping-data}

Колектор може втрачати дані з різних причин, найпоширеніші з них:

- Колектор неправильно налаштований, через що не може обробляти та експортувати дані так швидко, як отримує їх.
- Пункт призначення експортера недоступний або приймає дані надто повільно.

Щоб зменшити втрати, налаштуйте [параметр повторних спроб у черзі](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#configuration) для активних експортерів, особливо [Налаштування пакетної обробки черги відправлення](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#sending-queue-batch-settings).

#### Колектор не отримує дані {#collector-is-not-receiving-data}

Колектор може не отримувати дані з таких причин:

- Проблеми з мережею.
- Неправильна конфігурація отримувача.
- Неправильна конфігурація клієнта.
- Отримувач визначений у розділі `receivers`, але не увімкнений у жодному `pipelines`.

Перевірте [журнали Колектора](/docs/collector/internal-telemetry/#configure-internal-logs) і [zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md) для виявлення можливих проблем.

#### Колектор не обробляє дані {#collector-is-not-processing-data}

Більшість проблем з обробкою даних виникають через неправильну конфігурацію або нерозуміння роботи процесора. Наприклад:

- Процесор атрибутів працює тільки з "теґами" відрізків. Назва відрізка обробляється окремо через процесор відрізків.
- Процесори для трасувальних даних (окрім tail sampling) працюють лише на рівні окремих відрізків.

#### Колектор не експортує дані {#collector-is-not-exporting-data}

Можливі причини:

- Проблеми з мережею.
- Неправильна конфігурація експортера.
- Пункт призначення недоступний.

Перевірте [журнали Колектора](/docs/collector/internal-telemetry/#configure-internal-logs) і [zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md) на наявність помилок.

Часто проблеми з експортом даних пов’язані з мережею, наприклад, через налаштування брандмауера, DNS або проксі. Колектор підтримує [роботу через проксі](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#proxy-support).

### Колектор має проблеми з керуванням {#collector-is-experiencing-control-issues}

Колектор може несподівано завершувати роботу, перезапускатися або не запускатися взагалі.

#### Колектор виходить або перезапускається {#collector-exits-or-restarts}

Можливі причини:

- Перевантаження пам’яті через відсутній або неправильно налаштований [процесор `memory_limiter`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md).
- Неправильний розмір Колектора під навантаження.
- Некоректна конфігурація (наприклад, черга перевищує доступну пам’ять).
- Обмеження ресурсів інфраструктури (наприклад, у Kubernetes).

#### Колектор не запускається у Windows Docker-контейнерах {#collector-fails-to-start-in-windows-docker-containers}

У версіях до 0.90.1 Колектор може не запускатися у Windows Docker-контейнері, видаючи помилку `The service process could not connect to the service controller`. Щоб виправити це, потрібно встановити змінну середовища `NO_WINDOWS_SERVICE=1`, щоб запустити Колектор у режимі інтерактивного термінала без спроби запуститися як Windows-служба.

### Колектор має проблеми з конфігурацією {#collector-is-experiencing-configuration-issues}

Неправильна конфігурація може спричиняти різні проблеми.

#### Null мапи {#null-maps}

При об’єднанні кількох конфігурацій значення з попередніх можуть заміщуватися на `null`. Щоб уникнути цього:

- Використовуйте `{}` для позначення порожніх мап, наприклад: `processors: {}`.
- Уникайте пустих конфігурацій, таких як `processors:` без вказаних процесорів.

Докладніше про це у [документації confmap](https://github.com/open-telemetry/opentelemetry-collector/blob/main/confmap/README.md#null-maps).

---
title: Конфігурація OTLP Exporter
linkTitle: OTLP Exporter
weight: 20
aliases: [otlp-exporter-configuration]
default_lang_commit: 7d2755976883a7b5f2a5706397a79c0d274d0993
cSpell:ignore: EXPORTЕР
---

## Конфігурація Endpoint {#endpoint-configuration}

Наступні змінні середовища дозволяють налаштувати точки доступу OTLP/gRPC або OTLP/HTTP endpoint для ваших трасувань, метрик та логів.

### `OTEL_EXPORTER_OTLP_ENDPOINT`

Базова URL-адреса endpoint для будь-якого типу сигналу з опціонально вказаним номером порту. Корисно, коли ви надсилаєте більше одного сигналу на той самий endpoint і хочете, щоб одна змінна середовища керувала endpoint.

**Стандартні значення:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318"`

**Приклад:**

- gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint:443"`
- HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="http://my-api-endpoint/"`

Для OTLP/HTTP експортери в SDK створюють URL-адреси, специфічні для сигналів, коли ця змінна середовища встановлена. Це означає, що якщо ви надсилаєте трасування, метрики та логи, наступні URL-адреси створюються з наведеного вище прикладу:

- Трасування: `"http://my-api-endpoint/v1/traces"`
- Метрики: `"http://my-api-endpoint/v1/metrics"`
- Логи: `"http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

URL-адреса endpoint тільки для даних трасування з опціонально вказаним номером порту. Зазвичай закінчується на `v1/traces` при використанні OTLP/HTTP.

**Стандартні значення:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/traces"`

**Приклад:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

URL-адреса endpoint тільки для даних метрик з опціонально вказаним номером порту. Зазвичай закінчується на `v1/metrics` при використанні OTLP/HTTP.

**Стандартні значення:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/metrics"`

**Приклад:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

URL-адреса endpoint тільки для даних логів з опціонально вказаним номером порту. Зазвичай закінчується на `v1/logs` при використанні OTLP/HTTP.

**Стандартні значення:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/logs"`

**Приклад:**

- gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT`

URL-адреса точки доступу тільки для даних профілів, з опціональним номером порту. Зазвичай закінчується на `v1/profiles` при використанні OTLP/HTTP.

**Стандартні значення:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/profiles"`

**Приклад:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_PROFILES_ENDPOINT="http://my-api-endpoint/v1/profiles"`

## Конфігурація заголовків {#header-configuration}

Наступні змінні середовища дозволяють налаштувати додаткові заголовки як список пар ключ-значення для додавання в вихідні gRPC або HTTP запити.

### `OTEL_EXPORTER_OTLP_HEADERS`

Список заголовків, які застосовуються до всіх вихідних даних (трасування, метрики та логи).

**Стандартні значення:** None

**Приклад:**
`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

Список заголовків, які застосовуються до всіх вихідних трасувань.

**Стандартні значення:** None

**Приклад:**
`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

Список заголовків, які застосовуються до всіх вихідних метрик.

**Стандартні значення:** None

**Приклад:**
`export OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTЕР_OTLP_LOGS_HEADERS`

Список заголовків, які застосовуються до всіх вихідних логів.

**Стандартні значення:** None

**Приклад:**
`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_PROFILES_HEADERS`

Список заголовків, які застосовуються до всіх вихідних профілів.

**Стандартні значення:** None

**Приклад:**
`export OTEL_EXPORTER_OTLP_PROFILES_HEADERS="api-key=key,other-config-value=value"`

## Конфігурація тайм-ауту {#timeout-configuration}

Наступні змінні середовища налаштовують максимальний час (у мілісекундах), який OTLP Exporter чекатиме перед передачею наступної партії даних.

### `OTEL_EXPORTER_OTLP_TIMEOUT`

Значення тайм-ауту для всіх вихідних даних (трасування, метрики та логи) у мілісекундах.

**Стандартні значення:** `10000` (10с)

**Приклад:** `export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

Значення тайм-ауту для всіх вихідних трасувань у мілісекундах.

**Стандартні значення:** 10000 (10с)

**Приклад:** `export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

Значення тайм-ауту для всіх вихідних метрик у мілісекундах.

**Стандартні значення:** 10000 (10с)

**Приклад:** `export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

Значення тайм-ауту для всіх вихідних логів у мілісекундах.

**Стандартні значення:** 10000 (10с)

**Приклад:** `export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT`

Значення часу очікування для всіх вихідних профілів, у мілісекундах.

**Стандартні значення:** 10000 (10с)

**Приклад:** `export OTEL_EXPORTER_OTLP_PROFILES_TIMEOUT=500`

## Конфігурація протоколу {#protocol-configuration}

Наступні змінні середовища налаштовують транспортний протокол OTLP, який використовує OTLP експортер.

### `OTEL_EXPORTER_OTLP_PROTOCOL`

Вказує транспортний протокол OTLP, який буде використовуватися для всіх телеметричних даних.

**Стандартні значення:** Залежить від SDK, але зазвичай буде або `http/protobuf`, або `grpc`.

**Приклад:** `export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

Дійсні значення:

- `grpc` для використання OTLP/gRPC
- `http/protobuf` для використання OTLP/HTTP + protobuf
- `http/json` для використання OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`

Вказує транспортний протокол OTLP, який буде використовуватися для даних трасування.

**Стандартні значення:** Залежить від SDK, але зазвичай буде або `http/protobuf`, або `grpc`.

**Приклад:** `export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=grpc`

Дійсні значення:

- `grpc` для використання OTLP/gRPC
- `http/protobuf` для використання OTLP/HTTP + protobuf
- `http/json` для використання OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`

Вказує транспортний протокол OTLP, який буде використовуватися для даних метрик.

**Стандартні значення:** Залежить від SDK, але зазвичай буде або `http/protobuf`, або `grpc`.

**Приклад:** `export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=grpc`

Дійсні значення:

- `grpc` для використання OTLP/gRPC
- `http/protobuf` для використання OTLP/HTTP + protobuf
- `http/json` для використання OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`

Вказує транспортний протокол OTLP, який буде використовуватися для даних логів.

**Стандартні значення:** Залежить від SDK, але зазвичай буде або `http/protobuf`, або `grpc`.

**Приклад:** `export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=grpc`

Дійсні значення:

- `grpc` для використання OTLP/gRPC
- `http/protobuf` для використання OTLP/HTTP + protobuf
- `http/json` для використання OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL`

Вказує транспортний протокол OTLP, який буде використовуватися для даних профілів.

**Стандартні значення:** Залежить від SDK, але зазвичай буде або `http/protobuf`, або `grpc`.

**Приклад:** `export OTEL_EXPORTER_OTLP_PROFILES_PROTOCOL=grpc`

- `grpc` для використання OTLP/gRPC
- `http/protobuf` для використання OTLP/HTTP + protobuf
- `http/json` для використання OTLP/HTTP + JSON

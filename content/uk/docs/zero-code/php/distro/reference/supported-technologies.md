---
title: Підтримувані технології
description: >-
  Підтримувані версії PHP, SAPI, операційні системи, фреймворки та бібліотеки для OpenTelemetry PHP Distro.
weight: 2
cSpell:ignore: apk httplug musl mysqli psr
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
---

OpenTelemetry PHP Distro є дистрибутивом OpenTelemetry PHP. Він наслідує сумісність OpenTelemetry та розширює runtime-функції нативними компонентами.

## Обсяг автоінструментування {#auto-instrumentation-scope}

Автоінструментування захоплює телеметрію для підтримуваних фреймворків та бібліотек, але **не** інструментує:

- Внутрішності пропрієтарних або власних фреймворків
- Компоненти з закритим кодом без hook-ів інструментування
- Бізнес-логіку, специфічну для застосунку

Для непідтримуваних областей використовуйте ручне OpenTelemetry інструментування.

## Версії PHP {#php-versions}

Підтримувані версії PHP: `8.1` до `8.5`.

## Підтримувані SAPI {#supported-sapis}

- `php-cli`
- `php-fpm`
- `php-cgi`/`fcgi`
- `mod_php` (prefork)

## Підтримувані операційні системи {#supported-operating-systems}

- Linux
  - Архітектури: `x86_64`, `arm64`
  - системи на базі glibc: `deb`, `rpm`
  - системи на базі musl (Alpine): `apk`

## Інструментовані фреймворки {#instrumented-frameworks}

- Laravel `6.x` до `13.x`
- Slim `4.x`

## Інструментовані бібліотеки {#instrumented-libraries}

- cURL
- HTTP async (`php-http/httplug`)
- MySQLi
- PDO
- PostgreSQL
- PSR-18 HTTP Client (`psr/http-client`)

## Включені пакети автоінструментування {#included-auto-instrumentation-packages}

| Назва               | Включено з версії distro | Пакунок                                                                                                                     |
| ------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `curl`              | 1.0                      | [open-telemetry/opentelemetry-auto-curl](https://packagist.org/packages/open-telemetry/opentelemetry-auto-curl)             |
| `http-async-client` | 1.0                      | [open-telemetry/opentelemetry-auto-http-async](https://packagist.org/packages/open-telemetry/opentelemetry-auto-http-async) |
| `laravel`           | 1.0                      | [open-telemetry/opentelemetry-auto-laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel)       |
| `mysqli`            | 1.0                      | [open-telemetry/opentelemetry-auto-mysqli](https://packagist.org/packages/open-telemetry/opentelemetry-auto-mysqli)         |
| `pdo`               | 1.0                      | [open-telemetry/opentelemetry-auto-pdo](https://packagist.org/packages/open-telemetry/opentelemetry-auto-pdo)               |
| `postgresql`        | 1.2                      | [open-telemetry/opentelemetry-auto-postgresql](https://packagist.org/packages/open-telemetry/opentelemetry-auto-postgresql) |
| `psr18`             | 0.5                      | [open-telemetry/opentelemetry-auto-psr18](https://packagist.org/packages/open-telemetry/opentelemetry-auto-psr18)           |
| `slim`              | 1.0                      | [open-telemetry/opentelemetry-auto-slim](https://packagist.org/packages/open-telemetry/opentelemetry-auto-slim)             |

## Включені пакунки метрик {#included-metrics-packages}

| Включені з версії distro | Пакунок                                                                                                                     | Емітовані метрики                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 0.6.0                    | [open-telemetry/opentelemetry-metrics-runtime](https://packagist.org/packages/open-telemetry/opentelemetry-metrics-runtime) | Використання PHP пам'яті, GC цикли, пікове використання пам'яті |

## Додаткові runtime-функції {#additional-runtime-features}

- Автоматичне створення кореневого відрізка
- Групування URL кореневого відрізка
- Виведені відрізки
- [Інструментування на основі атрибутів](/docs/zero-code/php/distro/reference/attribute-instrumentation/) (`#[WithSpan]`, `#[SpanAttribute]`)
- Фонове надсилання телеметрії
- PHP runtime метрики (пам'ять, GC — експортуються автоматично через нативний асинхронний транспорт)

Фонове надсилання (експорт без блокування) працює з OTLP `http/protobuf` (стандартно). Якщо експортер або протокол змінено на непідтримуваний транспорт (наприклад gRPC), експорт стає синхронним.

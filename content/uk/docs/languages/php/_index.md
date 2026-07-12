---
title: PHP
description: >-
  <img width="35" class="img-initial otel-icon" src="/img/logos/32x32/PHP.svg" alt="PHP"> Специфічна для мови реалізація OpenTelemetry для PHP.
redirects:
  - { from: /php/*, to: ':splat' }
  - { from: /docs/php/*, to: ':splat' }
weight: 180
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: mbstring opcache
---

{{% docs/languages/index-intro php /%}}

## Додатково {#further-reading}

- [OpenTelemetry для PHP на GitHub](https://github.com/open-telemetry/opentelemetry-php)
- [Приклади](https://github.com/open-telemetry/opentelemetry-php/tree/main/examples)

## Вимоги {#requirements}

OpenTelemetry SDK для PHP прагне підтримувати всі офіційно підтримувані версії PHP відповідно до [www.php.net/supported-versions](https://www.php.net/supported-versions.php), і підтримка буде припинена для версій PHP протягом 12 місяців після завершення терміну їх підтримки.

Автоінструментування вимагає версію PHP 8.0+.

### Залежності {#dependencies}

Деякі пакунки `SDK` та `Contrib` мають залежність від [HTTP Factories (PSR-17)](https://www.php-fig.org/psr/psr-17/) та [php-http/async-client](https://docs.php-http.org/en/latest/clients.html). Ви можете знайти відповідні пакети composer, що реалізують дані стандарти, на [packagist.org](https://packagist.org/).

Дивіться [http-factory-implementations](https://packagist.org/providers/psr/http-factory-implementation), щоб знайти реалізацію `PSR-17 (HTTP factories)`, та [async-client-implementations](https://packagist.org/providers/php-http/async-client-implementation), щоб знайти реалізацію `php-http/async-client`.

### Необовʼязкові розширення PHP {#optional-php-extensions}

| Розширення                                                                | Призначення                                                      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [ext-grpc](https://github.com/grpc/grpc/tree/master/src/php)              | Потрібно для використання gRPC як транспорту для OTLP експортера |
| [ext-mbstring](https://www.php.net/manual/en/book.mbstring.php)           | Більш продуктивне, ніж резервне, `symfony/polyfill-mbstring`     |
| [ext-zlib](https://www.php.net/manual/en/book.zlib.php)                   | Якщо ви хочете стискати експортовані дані                        |
| [ext-ffi](https://www.php.net/manual/en/book.ffi.php)                     | Контекстне зберігання на основі fiber                            |
| [ext-protobuf](https://github.com/protocolbuffers/protobuf/tree/main/php) | _Значне_ покращення продуктивності для otlp+protobuf експорту    |

#### ext-ffi

Підтримка fiber може бути увімкнена шляхом встановлення змінної середовища `OTEL_PHP_FIBERS_ENABLED` до `true`. Використання fiber з не-`CLI` SAPIs може вимагати попереднього завантаження звʼязків. Один зі способів досягти цього — встановити [`ffi.preload`](https://www.php.net/manual/en/ffi.configuration.php#ini.ffi.preload) до `src/Context/fiber/zend_observer_fiber.h` та встановити [`opcache.preload`](https://www.php.net/manual/en/opcache.preloading.php) до `vendor/autoload.php`.

#### ext-protobuf

[Нативна бібліотека protobuf](https://packagist.org/packages/google/protobuf) є значно повільнішою, ніж розширення. Ми настійно рекомендуємо використовувати розширення.

## Налаштування {#setup}

OpenTelemetry для PHP розповсюджується через [packagist](https://packagist.org/packages/open-telemetry/), у ряді пакунків. Ми рекомендуємо встановлювати лише ті пакунки, які вам потрібні, що зазвичай мінімально включає `API`, `Context`, `SDK` та експортер.

Ми наполегливо рекомендуємо, щоб ваш код залежав лише від класів та інтерфейсів у пакунку `API`.

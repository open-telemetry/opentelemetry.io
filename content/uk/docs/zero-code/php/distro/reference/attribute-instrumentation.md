---
title: Інструментування на основі атрибутів
description: >-
  Автоматичне створення відрізків за допомогою PHP 8 атрибутів з OpenTelemetry PHP Distro.
weight: 4
cSpell:ignore: SpanAttribute WithSpan
default_lang_commit: be35d47dc1ad8f2c4d3607927a14e9c4cb2d2102
---

OpenTelemetry PHP Distro підтримує автоматичне створення відрізків з використанням PHP 8 атрибутів. Анотуйте методи або функції з `#[WithSpan]` для створення відрізків без написання коду інструментування вручну.

## Передумови {#prerequisites}

- PHP 8.0 або новіші (PHP атрибути вимагають PHP 8+).
- Пакунок `open-telemetry/api` встановлений у вашому додатку.
- `OTEL_PHP_ATTR_HOOKS_ENABLED=true` встановлено в середовищі (стандартно вимкнено).

## Увімкнення {#enable}

```sh
export OTEL_PHP_ATTR_HOOKS_ENABLED=true
```

Або в `php.ini`:

```ini
opentelemetry_distro.attr_hooks_enabled=true
```

## Базове використання {#basic-usage}

```php
use OpenTelemetry\API\Instrumentation\WithSpan;

class OrderService
{
    #[WithSpan]
    public function processOrder(int $orderId): string
    {
        // Відрізок з іменем "OrderService::processOrder" створюється автоматично.
        return "processed-{$orderId}";
    }
}
```

## Опції `#[WithSpan]` {#withspan-options}

```php
#[WithSpan(
    span_name: 'custom.span.name',          // типово: "ClassName::methodName"
    span_kind: SpanKind::KIND_SERVER,        // типово: KIND_INTERNAL
    attributes: ['key' => 'value'],          // статичні атрибути, додані до відрізка
)]
```

Усі аргументи опціональні і можуть передаватися позиційно або по імені:

```php
// Позиційно
#[WithSpan('payment.charge', SpanKind::KIND_CLIENT, ['db.system' => 'redis'])]

// По імені — будь-яка підмножина
#[WithSpan(span_kind: SpanKind::KIND_PRODUCER)]
#[WithSpan(span_name: 'message.publish', span_kind: SpanKind::KIND_PRODUCER)]
```

## Захоплення значень параметрів за допомогою `#[SpanAttribute]` {#capturing-parameter-values-with-spanattribute}

Додайте `#[SpanAttribute]` до параметрів функції, щоб включити їхні runtime значення як атрибути відрізка:

```php
use OpenTelemetry\API\Instrumentation\WithSpan;
use OpenTelemetry\API\Instrumentation\SpanAttribute;

class UserService
{
    #[WithSpan]
    public function createUser(
        #[SpanAttribute] string $username,               // ключ атрибуту = "username"
        string                  $password,               // не захоплюється
        #[SpanAttribute('user.email')] string $email,   // ключ атрибуту = "user.email"
    ): int {
        // ...
    }
}
```

## Захоплення значень властивостей за допомогою `#[SpanAttribute]` {#capturing-property-values-with-spanattribute}

Застосуйте `#[SpanAttribute]` до властивостей класу, щоб захопити їхнє значення в момент виклику методу:

```php
class InvoiceService
{
    #[SpanAttribute]
    public string $customerId = '';

    #[SpanAttribute('invoice.currency')]
    public string $currency = 'EUR';

    #[WithSpan('invoice.generate')]
    public function generate(): string
    {
        // Атрибути відрізка включають: customerId, invoice.currency
    }
}
```

## Запис помилок {#exception-recording}

Якщо анотований метод повідомляє про помилку, відрізок автоматично записує помилку і встановлює статус на `ERROR`. Помилка поширюється нормально.

```php
#[WithSpan]
public function riskyOperation(): void
{
    throw new \RuntimeException('something went wrong');
    // Відрізок завершується з STATUS_ERROR та прикріпленим event помилки.
}
```

## Вкладені відрізки {#nested-spans}

Виклик одного `#[WithSpan]` методу з іншого створює вкладені відрізки автоматично:

```php
class Pipeline
{
    #[WithSpan('pipeline.run')]
    public function run(): void
    {
        $this->step1(); // child span: "pipeline.step1"
        $this->step2(); // child span: "pipeline.step2"
    }

    #[WithSpan('pipeline.step1')]
    private function step1(): void {}

    #[WithSpan('pipeline.step2')]
    private function step2(): void {}
}
```

## Standalone-функції {#standalone-functions}

`#[WithSpan]` працює на standalone-функціях, а не тільки на методах:

```php
#[WithSpan('compute.result')]
function computeResult(#[SpanAttribute] int $input): int
{
    return $input * 2;
}
```

## Стандартні атрибути відрізка {#standard-span-attributes}

Кожен `#[WithSpan]` відрізок включає ці атрибути з місця декларації:

| Атрибут          | Значення                                    |
| ---------------- | ------------------------------------------- |
| `code.function`  | Імʼя функції або методу                     |
| `code.namespace` | Імʼя класу (порожнє для standalone-функцій) |
| `code.filepath`  | Шлях до вихідного файлу                     |
| `code.lineno`    | Номер рядка декларації                      |

## Сумісність {#compatibility}

`#[WithSpan]` та `#[SpanAttribute]` — це ті самі атрибути, що використовують офіційне розширення [opentelemetry-php-instrumentation](https://github.com/open-telemetry/opentelemetry-php-instrumentation). Застосунки, що вже використовують це розширення, можуть увімкнути цю функцію без зміни коду.

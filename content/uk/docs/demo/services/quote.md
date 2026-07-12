---
title: Сервіс котирувань
linkTitle: Котирування
aliases: [quoteservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: getquote
---

Цей сервіс відповідає за розрахунок вартості доставки, залежно від кількості предметів для надсилання. Сервіс котирувань викликається з Сервісу Доставки через HTTP.

Сервіс Котирувань реалізовано з використанням фреймворку Slim та php-di для управління Впровадженням Залежностей.

Інструментування PHP може відрізнятися при використанні іншого фреймворку.

[Джерело сервісу котирувань](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## Трейси {#traces}

### Ініціалізація Трейсування {#initializing-tracing}

У цьому демо, SDK OpenTelemetry автоматично створюється як частина автозавантаження SDK, яке відбувається як частина автозавантаження composer.

Це увімкнено шляхом встановлення змінної середовища
`OTEL_PHP_AUTOLOAD_ENABLED=true`.

```php
require __DIR__ . '/../vendor/autoload.php';
```

Існує кілька способів створити або отримати `Tracer`, у цьому прикладі ми отримуємо його від глобального постачальника трейсерів, який був ініціалізований вище, як частина автозавантаження SDK:

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### Ручне створення відрізків {#manually-creating-spans}

Створення відрізка вручну можна здійснити через `Tracer`. Типово відрізок буде дочірнім до активного відрізка в поточному контексті виконання:

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* розрахунок котирування */
$span->end();
```

### Додавання атрибутів до відрізка {#adding-attributes-to-spans}

Ви можете отримати поточний відрізок за допомогою `OpenTelemetry\API\Trace\Span`.

```php
$span = Span::getCurrent();
```

Додавання атрибутів до відрізка здійснюється за допомогою `setAttribute` на обʼєкті відрізка. У функції `calculateQuote` додаються 2 атрибути до `childSpan`.

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### Додавання подій до відрізка {#add-span-events}

Додавання подій до відрізка здійснюється за допомогою `addEvent` на обʼєкті відрізка. У маршруті `getquote` додаються події відрізка. Деякі події мають додаткові атрибути, інші — ні.

Додавання події відрізка без атрибутів:

```php
$span->addEvent('Отримано запит на котирування, обробляємо його');
```

Додавання події відрізка з додатковими атрибутами:

```php
$span->addEvent('Котирування оброблено, відповідь надіслано назад', [
    'app.quote.cost.total' => $payload
]);
```

## Метрики {#metrics}

У цьому демо метрики генеруються пакетними процесорами трейсів та логів. Метрики описують внутрішній стан процесора, такі як кількість експортованих відрізків або логів, ліміт черги та використання черги.

Ви можете увімкнути метрики, встановивши змінну середовища `OTEL_PHP_INTERNAL_METRICS_ENABLED` на `true`.

Також генерується ручна метрика, яка рахує кількість створених котирувань, включаючи атрибут для кількості предметів.

Лічильник створюється з глобально налаштованого Постачальника Метрик і збільшується кожного разу, коли створюється котирування:

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

Метрики накопичуються та експортуються періодично на основі значення, налаштованого в `OTEL_METRIC_EXPORT_INTERVAL`.

## Логи {#logs}

Сервіс котирувань генерує повідомлення в лог після розрахунку котирування. Пакет логування Monolog налаштований з [Міст Логів](/docs/concepts/signals/logs/#log-appender--bridge), який перетворює логи Monolog у формат OpenTelemetry. Логи, надіслані до цього логера, будуть
експортовані через глобально налаштований логер OpenTelemetry.

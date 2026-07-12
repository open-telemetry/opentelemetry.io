---
title: Сервіс електронної пошти
linkTitle: Електронна пошта
aliases: [emailservice]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: sinatra
---

Цей сервіс надсилатиме підтвердження електронною поштою користувачу, коли замовлення буде розміщено.

[Сирці сервісу електронної пошти](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## Ініціалізація трасування {#initializing-tracing}

Вам потрібно буде приєднати основні Ruby gems OpenTelemetry SDK та експортер, а також будь-які gems, які будуть потрібні для бібліотек автоінструментування (наприклад: Sinatra)

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

Ruby SDK використовує стандартні змінні середовища OpenTelemetry для автоматичної конфігурації експорту OTLP, атрибутів ресурсу та імені сервісу. Під час ініціалізації OpenTelemetry SDK ви також вкажете, які бібліотеки автоінструментування використовувати (наприклад: Sinatra)

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## Трейси {#traces}

### Додавання атрибутів до автоінструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоінструментованого коду ви можете отримати поточний відрізок з контексту.

```ruby
current_span = OpenTelemetry::Trace.current_span
```

Додавання кількох атрибутів до відрізка здійснюється за допомогою `add_attributes` на обʼєкті відрізка.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

Додавання лише одного атрибуту можна здійснити за допомогою `set_attribute` на обʼєкті відрізка.

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можна створити та помістити в активний контекст за допомогою `in_span` з обʼєкта OpenTelemetry Tracer. Коли використовується разом з блоком `do..end`, відрізок автоматично завершиться, коли блок завершить виконання.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # логіка в контексті спану тут
end
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

SDK OpenTelemetry Metrics та експортер метрик OTLP ініціалізуються на кореневому рівні у файлі `email_server.rb`. Для доступу до них спочатку потрібно виконати оператори `require`.

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

Ruby SDK використовує стандартні змінні середовища OpenTelemetry для автоматичної конфігурації експорту OTLP, атрибутів ресурсів та імені сервісу. Під час ініціалізації OpenTelemetry Metrics SDK також потрібно налаштувати постачальника метрик та зчитувач метрик.

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

За допомогою постачальника вимірювань ви тепер маєте доступ до вимірювань, які можна використовувати для створення глобальної метрики (наприклад: `counter`).

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```

### Власні метрики {#custom-metrics}

Наразі доступна така власна метрика:

- `app.confirmation.counter`: сукупна кількість надісланих електронних листів із підтвердженням замовлення

## Логи {#logs}

### Ініціалізація логів {#initializing-logs}

SDK OpenTelemetry Logs та експортер логів OTLP ініціалізуються на кореневому рівні у файлі `email_server.rb`. Для доступу до них спочатку потрібно виконати оператори `require`.

```ruby
require "opentelemetry-logs-sdk"
require "opentelemetry-exporter-otlp-logs"
```

Ruby SDK використовує стандартні змінні середовища OpenTelemetry для автоматичної конфігурації експорту OTLP, атрибутів ресурсів та імені сервісу. Під час ініціалізації OpenTelemetry Logs SDK вам потрібен постачальник логів для створення глобального логу.

```ruby
$logger = OpenTelemetry.logger_provider.logger(name: "email")
```

### Виведення структурованих логів {#emitting-structured-logs}

Ви можете використовувати метод `on_emit` логера для запису структурованих логів. Включіть `severity_text` (наприклад, `INFO`, `ERROR`), зрозумілий для людини `body` та атрибут `app.email.recipient`, який може допомогти в подальшому запиті логів.

```ruby
$logger.on_emit(
  timestamp: Time.now,
  severity_text: "INFO",
  body: "Order confirmation email sent",
  attributes: { "app.email.recipient" => data.email }
)
```

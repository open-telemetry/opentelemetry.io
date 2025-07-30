---
title: Сервіс електронної пошти
linkTitle: Електронна пошта
aliases: [emailservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
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

TBD

## Логи {#logs}

TBD

---
title: Інструментування
aliases:
  - manual_instrumentation
  - manual
  - /docs/languages/ruby/events
  - /docs/languages/ruby/context-propagation
weight: 20
description: Інструментування для OpenTelemetry Ruby
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: SIGHUP потокобезпечними
---

{{% include instrumentation-intro %}}

## Налаштування {#setup}

Спочатку переконайтеся, що у вас встановлений пакунок SDK:

```sh
gem install opentelemetry-sdk
```

Потім включіть код конфігурації, який виконується під час ініціалізації вашої програми. Переконайтеся, що `service.name` встановлено шляхом налаштування імені сервісу.

## Трейси {#traces}

### Отримання Tracer {#acquiring-a-tracer}

Щоб почати [трейсинг](/docs/concepts/signals/traces), вам потрібно переконатися, що у вас є ініціалізований [`Tracer`](/docs/concepts/signals/traces#tracer), який надходить від [`TracerProvider`](/docs/concepts/signals/traces#tracer-provider).

Найпростіший і найпоширеніший спосіб зробити це — використовувати глобально зареєстрований TracerProvider. Якщо ви використовуєте [бібліотеки інструментування](/docs/languages/ruby/libraries), наприклад, у застосунку Rails, то один буде зареєстрований для вас.

```ruby
# Якщо в застосунку Rails, це знаходиться в config/initializers/opentelemetry.rb
require "opentelemetry/sdk"

OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
end

# 'Tracer' тепер можна використовувати у всьому вашому коді
MyAppTracer = OpenTelemetry.tracer_provider.tracer('<YOUR_TRACER_NAME>')
```

Отримавши `Tracer`, ви можете вручну відстежувати код.

### Отримання поточного відрізка {#get-the-current-span}

Дуже часто потрібно додати інформацію до поточного [відрізка](/docs/concepts/signals/traces#spans) десь у вашій програмі. Для цього ви можете отримати поточний відрізок і додати до нього [атрибути](/docs/concepts/signals/traces#attributes).

```ruby
require "opentelemetry/sdk"

def track_extended_warranty(extended_warranty)
  # Отримати поточний відрізок
  current_span = OpenTelemetry::Trace.current_span

  # І додати корисні речі до нього!
  current_span.add_attributes({
    "com.extended_warranty.id" => extended_warranty.id,
    "com.extended_warranty.timestamp" => extended_warranty.timestamp
  })
end
```

### Створення нових відрізків {#creating-new-spans}

Щоб створити [відрізок](/docs/concepts/signals/traces#spans), вам знадобиться [налаштований `Tracer`](#acquiring-a-tracer).

Зазвичай, коли ви створюєте новий відрізок, ви хочете, щоб він був активним/поточним відрізком. Для цього використовуйте `in_span`:

```ruby
require "opentelemetry/sdk"

def do_work
  MyAppTracer.in_span("do_work") do |span|
    # виконайте деяку роботу, яку відстежує відрізок 'do_work'!
  end
end
```

### Створення вкладених відрізків {#creating-nested-spans}

Якщо у вас є окрема під-операція, яку ви хочете відстежувати як частину іншої, ви можете створити вкладені [відрізки](/docs/concepts/signals/traces#spans), щоб представити це відношення:

```ruby
require "opentelemetry/sdk"

def parent_work
  MyAppTracer.in_span("parent") do |span|
    # виконайте деяку роботу, яку відстежує відрізок 'parent'!

    child_work

    # виконайте ще деяку роботу після цього
  end
end

def child_work
  MyAppTracer.in_span("child") do |span|
    # виконайте деяку роботу, яку відстежує відрізок 'child'!
  end
end
```

У наведеному вище прикладі створюються два відрізки, з іменами `parent` і `child`, де `child` вкладений у `parent`. Якщо ви переглянете трейс з цими відрізками в інструменті візуалізації трейсів, `child` буде вкладений у `parent`.

### Додавання атрибутів до відрізка {#add-attributes-to-a-span}

[Атрибути](/docs/concepts/signals/traces#attributes) дозволяють вам прикріплювати пари ключ/значення до [відрізка](/docs/concepts/signals/traces#spans), щоб він ніс більше інформації про поточну операцію, яку він відстежує.

Ви можете використовувати `set_attribute`, щоб додати один атрибут до відрізка:

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.set_attribute("animals", ["elephant", "tiger"])
```

Ви можете використовувати `add_attributes`, щоб додати map атрибутів:

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  "my.cool.attribute" => "a value",
  "my.first.name" => "Oscar"
})
```

Ви також можете додати атрибути до відрізка під час [його створення](#creating-new-spans):

```ruby
require "opentelemetry/sdk"

MyAppTracer.in_span('foo', attributes: { "hello" => "world", "some.number" => 1024 }) do |span|
  # виконайте деяку роботу з відрізком
end
```

> &#9888; Відрізки є потокобезпечними структурами даних, які потребують блокувань під час їх зміни. Тому вам слід уникати багаторазового виклику `set_attribute` і замість цього призначати атрибути гуртом за допомогою Hash, або під час створення відрізка, або за допомогою `add_attributes` на наявному відрізку.
>
> &#9888; Рішення про семплінг приймаються в момент створення відрізка. Якщо ваш семплер враховує атрибути відрізка під час прийняття рішення про відбір відрізка, то ви _повинні_ передати ці атрибути як частину створення відрізка. Будь-які атрибути, додані після створення, не будуть враховані семплером, оскільки рішення про відбір вже прийнято.

### Додавання семантичних атрибутів {#add-semantic-attributes}

[Семантичні атрибути][semconv-spec] є попередньо визначеними [атрибутами](/docs/concepts/signals/traces#attributes), які є загальновідомими конвенціями іменування для поширених типів даних. Використання семантичних атрибутів дозволяє нормалізувати цю інформацію у ваших системах.

Щоб використовувати семантичні атрибути в Ruby, додайте відповідний gem:

```sh
gem install opentelemetry-semantic_conventions
```

Потім ви можете використовувати його в коді:

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/semantic_conventions'

current_span = OpenTelemetry::Trace.current_span

current_span.add_attributes({
  OpenTelemetry::SemanticConventions::Trace::HTTP_METHOD => "GET",
  OpenTelemetry::SemanticConventions::Trace::HTTP_URL => "https://opentelemetry.io/",
})
```

### Додавання подій до відрізка {#add-span-events}

[Подія відрізка](/docs/concepts/signals/traces#span-events) — це повідомлення, яке може прочитати людина, на відрізку, яке представляє "щось, що відбувається" під час його існування. Наприклад, уявіть функцію, яка потребує ексклюзивного доступу до ресурсу, який знаходиться у mutex. Подія може бути створена у двох точках: один раз, коли ми намагаємося отримати доступ до ресурсу, і ще один раз, коли ми отримуємо mutex.

```ruby
require "opentelemetry/sdk"

span = OpenTelemetry::Trace.current_span

span.add_event("Acquiring lock")
if mutex.try_lock
  span.add_event("Got lock, doing work...")
  # виконайте деяку роботу
  span.add_event("Releasing lock")
else
  span.add_event("Lock already in use")
end
```

Корисною характеристикою подій є те, що їхні часові мітки відображаються як зсуви від початку відрізка, що дозволяє легко побачити, скільки часу пройшло між ними.

Події також можуть мати власні атрибути, наприклад:

```ruby
require "opentelemetry/sdk"

span.add_event("Cancelled wait due to external signal", attributes: {
  "pid" => 4328,
  "signal" => "SIGHUP"
})
```

### Додавання посилань на відрізки {#add-span-links}

[Відрізок](/docs/concepts/signals/traces#spans) може бути створений з нулем або більшою кількістю [посилань на відрізки](/docs/concepts/signals/traces#span-links), які повʼязують його з іншим відрізком. Для створення посилання потрібен [контекст відрізка](/docs/concepts/signals/traces#span-context).

```ruby
require "opentelemetry/sdk"

span_to_link_from = OpenTelemetry::Trace.current_span

link = OpenTelemetry::Trace::Link.new(span_to_link_from.context)

MyAppTracer.in_span("new-span", links: [link])
  # виконайте деяку роботу, яку відстежує відрізком 'new-span'

  # Посилання в 'new_span' причинно повʼязує його з відрізком, з якого воно повʼязане,
  # але це не обовʼязково дочірній відрізок.
end
```

Посилання на відрізки часто використовуються для звʼязування різних трейсів, які повʼязані певним чином, наприклад, довготривале завдання, яке викликає підзавдання асинхронно.

Посилання також можуть бути створені з додатковими атрибутами:

```ruby
link = OpenTelemetry::Trace::Link.new(span_to_link_from.context, attributes: { "some.attribute" => 12 })
```

### Встановлення статусу відрізка {#set-span-status}

{{% include "span-status-preamble" %}}

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # щось, що явно не вдається
rescue
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
end
```

### Запис помилок у відрізки {#record-exceptions-in-spans}

Може бути гарною ідеєю записувати помилки, коли вони трапляються. Рекомендується робити це разом з [встановленням статусу відрізка](#set-span-status).

```ruby
require "opentelemetry/sdk"

current_span = OpenTelemetry::Trace.current_span

begin
  1/0 # щось, що явно не вдається
rescue Exception => e
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
  current_span.record_exception(e)
end
```

Запис помилки створює [подію відрізка](/docs/concepts/signals/traces#span-events) на поточному відрізку з трасуванням стека як атрибутом події відрізка.

Виключення також можуть бути записані з додатковими атрибутами:

```ruby
current_span.record_exception(ex, attributes: { "some.attribute" => 12 })
```

### Поширення контексту {#context-propagation}

> Розподілений трейсинг відстежує прогрес одного запиту, який називається трейсом, коли він обробляється сервісами, що складають застосунок. Розподілений трейс перетинає процеси, мережу та межі безпеки. [Глосарій][]

Це вимагає _поширення контексту_, механізму, за допомогою якого ідентифікатори для трейсу надсилаються до віддалених процесів.

> &#8505; SDK OpenTelemetry Ruby подбає про поширення контексту, якщо ваш сервіс використовує бібліотеки з автоматичним інструментуванням. Будь ласка, зверніться до [README][auto-instrumentation] для отримання додаткової інформації.

Для поширення контексту трейсу через мережу, поширювач повинен бути зареєстрований у SDK OpenTelemetry. Поширювачі W3 TraceContext і Baggage стандартно налаштовані. Оператори можуть перевизначити це значення, встановивши змінну середовища `OTEL_PROPAGATORS` на список [поширювачів][propagators], розділених комами, які ви хочете підтримувати:

```sh
export OTEL_PROPAGATORS=tracecontext,baggage,b3
```

Поширювачі, відмінні від `tracecontext` і `baggage`, повинні бути додані як залежності gem до вашого Gemfile, наприклад:

```ruby
gem 'opentelemetry-propagator-b3'
```

## Метрики {#metrics}

API та SDK для метрик наразі розробляються.

## Логи {#logs}

API та SDK для логів наразі розробляються.

## Наступні кроки {#next-steps}

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/ruby/exporters) до одного або більше бекендів телеметрії.

[глосарій]: /docs/concepts/glossary/
[propagators]: https://github.com/open-telemetry/opentelemetry-ruby/tree/main/propagator
[auto-instrumentation]: https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[semconv-spec]: /docs/specs/semconv/general/trace/

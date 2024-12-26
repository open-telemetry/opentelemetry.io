---
title: Початок роботи
description: Отримайте телеметрію з вашого застосунку менш ніж за 5 хвилин!
aliases: [getting_started]
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: darwin rolldice sinatra struct truffleruby
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Ruby.

Ви дізнаєтесь, як інструментувати простий застосунок таким чином, щоб [трейси][] виводилися в консоль.

## Попередні вимоги {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- CRuby >= `3.1`, JRuby >= `9.3.2.0`, or TruffleRuby >= `22.1`
- [Bundler](https://bundler.io/)

> [!WARNING]
>
> Хоча підтримка `jruby` та `truffleruby` тестувалася, вона наразі надається на основі найкращих зусиль.

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Rails](https://rubyonrails.org/). Якщо ви не використовуєте Rails, це не проблема, ви можете використовувати OpenTelemetry Ruby з іншими веб-фреймворками, такими як Sinatra та Rack. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=ruby).

Для більш детальних прикладів дивіться [приклади](/docs/languages/ruby/examples/).

### Залежності {#dependencies}

Для початку встановіть Rails:

```sh
gem install rails
```

### Створення застосунку {#create-the-application}

Створіть новий застосунок тільки для API з назвою `dice-ruby` і перейдіть до новоствореної теки `dice-ruby`

```sh
rails new --api dice-ruby
cd dice-ruby
```

Створіть контролер для кидання кубика:

```sh
rails generate controller dice
```

Це створить файл з назвою `app/controllers/dice_controller.rb`. Відкрийте цей файл у вашому улюбленому редакторі та оновіть його наступним кодом:

```ruby
class DiceController < ApplicationController
  def roll
    render json: rand(1..6).to_s
  end
end
```

Далі відкрийте файл `config/routes.rb` і додайте наступний код:

```ruby
Rails.application.routes.draw do
  get 'rolldice', to: 'dice#roll'
end
```

Запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```sh
rails server -p 8080
```

Якщо все працює правильно, ви повинні побачити число від 1 до 6. Тепер ви можете зупинити застосунок і інструментувати його за допомогою OpenTelemetry.

### Інструментування {#instrumentation}

Встановіть пакунки `opentelemetry-sdk` та `opentelemetry-instrumentation-all`:

```sh
bundle add opentelemetry-sdk opentelemetry-instrumentation-all
```

Включення `opentelemetry-instrumentation-all` надає [інструментування][] для Rails, Sinatra, кількох HTTP-бібліотек та інших.

Для застосунків Rails звичайний спосіб ініціалізації OpenTelemetry знаходиться в ініціалізаторі Rails. Для інших Ruby-сервісів виконайте цю ініціалізацію якомога раніше в процесі запуску.

Створіть файл з назвою `config/initializers/opentelemetry.rb` з наступним кодом:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # включає все інструментування!
end
```

Виклик `c.use_all()` включає все інструментування в пакунку `instrumentation/all`. Якщо у вас є складніші потреби в конфігурації, дивіться [конфігурацію конкретних бібліотек інструментування][config].

### Запуск інструментованого застосунку {#run-the-instrumented-application}

Тепер ви можете запустити ваш інструментований застосунок і вивести його в консоль:

```sh
env OTEL_TRACES_EXPORTER=console rails server -p 8080
```

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі та перезавантажте сторінку кілька разів. Ви повинні побачити відрізки, виведені в консоль, такі як наступні:

```ruby
#<struct OpenTelemetry::SDK::Trace::SpanData
 name="DiceController#roll",
 kind=:server,
 status=#<OpenTelemetry::Trace::Status:0x000000010587fc48 @code=1, @description="">,
 parent_span_id="\x00\x00\x00\x00\x00\x00\x00\x00",
 total_recorded_attributes=8,
 total_recorded_events=0,
 total_recorded_links=0,
 start_timestamp=1683555544407294000,
 end_timestamp=1683555544464308000,
 attributes=
  {"http.method"=>"GET",
   "http.host"=>"localhost:8080",
   "http.scheme"=>"http",
   "http.target"=>"/rolldice",
   "http.user_agent"=>"curl/7.87.0",
   "code.namespace"=>"DiceController",
   "code.function"=>"roll",
   "http.status_code"=>200},
 links=nil,
 events=nil,
 resource=
  #<OpenTelemetry::SDK::Resources::Resource:0x000000010511d1f8
   @attributes=
    {"service.name"=>"<YOUR_SERVICE_NAME>",
     "process.pid"=>83900,
     "process.command"=>"bin/rails",
     "process.runtime.name"=>"ruby",
     "process.runtime.version"=>"3.2.2",
     "process.runtime.description"=>"ruby 3.2.2 (2023-03-30 revision e51014f9c0) [arm64-darwin22]",
     "telemetry.sdk.name"=>"opentelemetry",
     "telemetry.sdk.language"=>"ruby",
     "telemetry.sdk.version"=>"1.2.0"}>,
 instrumentation_scope=#<struct OpenTelemetry::SDK::InstrumentationScope name="OpenTelemetry::Instrumentation::Rack", version="0.23.0">,
 span_id="\xA7\xF0\x9B#\b[\xE4I",
 trace_id="\xF3\xDC\b8\x91h\xB0\xDF\xDEn*CH\x9Blf",
 trace_flags=#<OpenTelemetry::Trace::TraceFlags:0x00000001057b7b08 @flags=1>,
 tracestate=#<OpenTelemetry::Trace::Tracestate:0x00000001057b67f8 @hash={}>>
```

## Що далі? {#what-next}

Додавання трасування до одного сервісу — це чудовий перший крок. OpenTelemetry надає ще кілька функцій, які дозволять вам отримати ще глибші знання!

- [Експортери][] дозволяють експортувати ваші дані до обраного бекенду.
- [Поширення контексту][] є, можливо, однією з найпотужніших концепцій в OpenTelemetry, оскільки вона перетворить ваше одиничне трасування сервісу в _розподілене трасування_, що дозволяє візуалізувати запит від кінця до кінця через процеси та мережеві межі.
- [Події відрізків][] дозволяють додати повідомлення зрозуміле людині на відрізок, яке представляє "щось, що відбувається" під час його життя.
- [Інструментування][instrumentation] дозволить вам збагачувати ваші трасування даними, специфічними для домену.
- [Демо OpenTelemetry](/docs/demo/) включає оснований на Ruby [Email Service](/docs/demo/services/email/).

[трейси]: /docs/concepts/signals/traces/
[інструментування]: https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation
[config]: ../libraries/#configuring-specific-instrumentation-libraries
[експортери]: ../exporters/
[поширення контексту]: ../instrumentation/#context-propagation
[instrumentation]: ../instrumentation/
[події відрізків]: ../instrumentation/#add-span-events

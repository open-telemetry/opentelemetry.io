---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
aliases: [configuring_automatic_instrumentation, automatic]
weight: 30
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: faraday sinatra
---

{{% docs/languages/libraries-intro ruby %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не підтримує OpenTelemetry з коробки, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації телеметричних даних для бібліотеки або фреймворку.

Наприклад, якщо ви використовуєте Rails і увімкнете [`opentelemetry-instrumentation-rails`](https://rubygems.org/gems/opentelemetry-instrumentation-rails/), ва застосунок Rails, який вже працює, автоматично генеруватиме телеметричні дані для вхідних запитів до ваших контролерів.

### Налаштування всіх бібліотек інструментування {#configuring-all-instrumentation-libraries}

OpenTelemetry Ruby надає метапакунок [`opentelemetry-instrumentation-all`](https://rubygems.org/gems/opentelemetry-instrumentation-all), який обʼєднує всі бібліотеки інструментування на основі Ruby в один пакунок. Це зручний спосіб додати телеметрію для всіх ваших бібліотек з мінімальними
зусиллями:

```sh
gem 'opentelemetry-sdk'
gem 'opentelemetry-exporter-otlp'
gem 'opentelemetry-instrumentation-all'
```

і налаштуйте це на початку життєвого циклу вашого застосунку. Дивіться приклад нижче використовуючи ініціалізатор Rails:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
  c.use_all() # увімкнути всі інструментування!
end
```

Це встановить всі бібліотеки інструментування та увімкне ті, що відповідають бібліотекам, які ви використовуєте у вашому застосунку.

### Перевизначення конфігурації для конкретних бібліотек інструментування {#overriding-configuration-for-specific-instrumentation-libraries}

Якщо ви увімкнули всі інструментування, але хочете перевизначити конфігурацію для якоїсь конкретної, викличте `use_all` з параметром конфігураційної map, де ключ представляє бібліотеку, а значення — її конкретний параметр конфігурації.

Наприклад, ось як ви можете встановити всі інструментування, _крім_ інструментування `Redis` у ваш застосунок:

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

OpenTelemetry::SDK.configure do |c|
  config = {'OpenTelemetry::Instrumentation::Redis' => { enabled: false }}
  c.use_all(config)
end
```

Щоб перевизначити більше інструментувань, додайте ще один запис у map `config`.

#### Перевизначення конфігурації для конкретних бібліотек інструментування за допомогою змінних середовища {#overriding-configuration-for-specific-instrumentation-libraries-with-environment-variables}

Ви також можете вимкнути конкретні бібліотеки інструментування за допомогою змінних середовища. Інструментування, вимкнене за допомогою змінної середовища, має пріоритет над локальною конфігурацією. Домовленість для імен змінних середовища — назва бібліотеки, записана великими літерами з заміною `::` на підкреслення, `OPENTELEMETRY` скорочено до `OTEL_LANG`, і додавання `_ENABLED`.

Наприклад, імʼя змінної середовища для `OpenTelemetry::Instrumentation::Sinatra` — `OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED`.

```bash
export OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED=false
```

### Налаштування конкретних бібліотек інструментування {#configuring-specific-instrumentation-libraries}

Якщо ви віддаєте перевагу більш вибірковому встановленню та використанню лише конкретних бібліотек інструментування, ви також можете це зробити. Наприклад, ось як використовувати лише `Sinatra` та `Faraday`, при цьому `Faraday` налаштовується з додатковим параметром конфігурації.

Спочатку встановіть конкретні бібліотеки інструментування, які ви хочете використовувати:

```sh
gem install opentelemetry-instrumentation-sinatra
gem install opentelemetry-instrumentation-faraday
```

Потім налаштуйте їх:

```ruby
require 'opentelemetry/sdk'

# встановити всі сумісні інструментування зі стандартною  конфігурацією
OpenTelemetry::SDK.configure do |c|
  c.use 'OpenTelemetry::Instrumentation::Sinatra'
  c.use 'OpenTelemetry::Instrumentation::Faraday', { opt: 'value' }
end
```

#### Налаштування конкретних бібліотек інструментування за допомогою змінних середовища {#configuring-specific-instrumentation-libraries-with-environment-variables}

Ви також можете визначити параметр для конкретних бібліотек інструментування за допомогою змінних середовища. За домовленістю, змінна середовища буде назвою інструментування, записаною великими літерами з заміною `::` на підкреслення, `OPENTELEMETRY` скорочено до `OTEL_{LANG}`, і додавання `_CONFIG_OPTS`.

Наприклад, імʼя змінної середовища для `OpenTelemetry::Instrumentation::Faraday` — `OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS`. Значення `peer_service=new_service;span_kind=client` перевизначає параметри, встановлені з [попереднього розділу](#configuring-specific-instrumentation-libraries) для Faraday.

```bash
export OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS="peer_service=new_service;span_kind=client"
```

Наступна таблиця містить прийнятний формат значень відповідно до типу даних параметра:

| Тип даних | Значення                   | Приклад          |
| --------- | -------------------------- | ---------------- |
| Array     | string with `,` separation | `option=a,b,c,d` |
| Boolean   | true/false                 | `option=true`    |
| Integer   | string                     | `option=string`  |
| String    | string                     | `option=string`  |
| Enum      | string                     | `option=string`  |
| Callable  | not allowed                | N\A              |

### Наступні кроки {#next-steps}

Бібліотеки інструментування — це найпростіший спосіб генерувати багато корисних телеметричних даних про ваші Ruby застосунки. Але вони не генерують дані, специфічні для логіки вашого застосунку! Для цього вам потрібно буде збагачувати інструментування з бібліотек інструментування вашим власним [кодом інструментування](../instrumentation).

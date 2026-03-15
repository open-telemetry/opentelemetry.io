---
title: Експортери
weight: 50
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

{{% docs/languages/exporters/intro %}}

## Точка доступу OTLP {#otlp-endpoint}

Щоб надіслати дані трасування на точку доступу OTLP (наприклад, [collector](/docs/collector) або Jaeger), вам потрібно використовувати пакунок експортерів, такий як `opentelemetry-exporter-otlp`:

{{< tabpane text=true >}} {{% tab bundler %}}

```sh
bundle add opentelemetry-exporter-otlp
```

{{% /tab %}} {{% tab gem %}}

```sh
gem install opentelemetry-exporter-otlp
```

{{% /tab %}} {{< /tabpane >}}

Далі налаштуйте експортер для вказівки на точку доступу OTLP. Наприклад, ви можете оновити `config/initializers/opentelemetry.rb` з [Початку роботи](../getting-started/), додавши `require 'opentelemetry-exporter-otlp'` до коду:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # вмикає всі інструменти!
end
```

Якщо ви зараз запустите свій застосунок, він буде використовувати OTLP для експорту трасувань:

```sh
rails server -p 8080
```

Стандартно трасування надсилаються на точку доступу OTLP, що слухає на localhost:4318. Ви можете змінити точку доступу, встановивши `OTEL_EXPORTER_OTLP_ENDPOINT` відповідним чином:

```sh
env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318" rails server -p 8080
```

Щоб швидко спробувати OTLP експортер і побачити ваші трасування візуалізованими на точці доступу, ви можете запустити Jaeger в Docker контейнері:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -п 14269:14269 \
  -п 9411:9411 \
  jaegertracing/all-in-one:latest
```

Ви можете візуалізувати трасування за допомогою інтерфейсу Jaeger trace UI, відвідавши `localhost:16686` у своєму вебоглядачі.

## Zipkin

Щоб налаштувати Zipkin якомога швидше, запустіть його в Docker контейнері:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Встановіть пакунок експортерів як залежність для вашого застосунку:

{{< tabpane text=true >}} {{% tab bundle %}}

```sh
bundle add opentelemetry-exporter-zipkin
```

{{% /tab %}} {{% tab gem %}}

```sh
gem install opentelemetry-exporter-zipkin
```

{{% /tab %}} {{< /tabpane >}}

Оновіть конфігурацію OpenTelemetry для використання експортера та надсилання даних на
ваш Zipkin backend:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

require 'opentelemetry-exporter-zipkin'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # вмикає всі інструменти!
end
```

Якщо ви зараз запустите свій застосунок, встановіть змінну середовища `OTEL_TRACES_EXPORTER` на Zipkin:

```sh
env OTEL_TRACES_EXPORTER=zipkin rails server
```

Стандартно трасування надсилаються на точку доступу Zipkin, що слухає на порту localhost:9411. Ви можете змінити endpoint, встановивши `OTEL_EXPORTER_ZIPKIN_ENDPOINT` відповідним чином:

```sh
env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:9411" rails server
```

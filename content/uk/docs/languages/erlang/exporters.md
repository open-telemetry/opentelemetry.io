---
title: Експортери
weight: 50
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
cSpell:ignore: rebar relx
---

{{% docs/languages/exporters/intro %}}

## Експорт до OpenTelemetry Collector {#exporting-to-the-opentelemetry-collector}

[Collector](/docs/collector/) надає незалежний від постачальника спосіб отримання, обробки та експорту телеметричних даних. Пакунок [opentelemetry_exporter](https://hex.pm/packages/opentelemetry_exporter) підтримує експорт як через HTTP (стандартно), так і через gRPC до колектора, який потім може експортувати Відрізки до самостійно розміщених сервісів, таких як Zipkin або Jaeger, а також до комерційних сервісів. Для повного списку доступних експортерів, дивіться [реєстр](/ecosystem/registry/?component=exporter).

## Налаштування Collector {#setting-up-the-collector}

Для тестування ви можете почати з наступної конфігурації Collector в корені вашого проєкту:

```yaml
# otel-collector-config.yaml

# Конфігурація OpenTelemetry Collector, яка отримує OTLP і експортує до Jager
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: '0.0.0.0:4317'
      http:
        endpoint: '0.0.0.0:4318'
exporters:
  debug:
  otlp/jaeger:
    endpoint: jaeger-all-in-one:4317
    tls:
      insecure: true
    sending_queue:
      batch:
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug, otlp/jaeger]
```

Для більш детального прикладу ви можете переглянути [конфігурацію](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/config/otel-collector-config.yaml) яку `opentelemetry-erlang` використовує для тестування.

Для цілей цього підручника ми запустимо Collector як образ docker поряд з нашим застосунком. Для цього підручника ми продовжимо з прикладом Dice Roll з розділу [Початок роботи](/docs/languages/erlang/getting-started)

Додайте цей файл docker-compose до кореня вашого застосунку:

```yaml
# docker-compose.yml
version: '3'
services:
  otel:
    image: otel/opentelemetry-collector-contrib:0.98.0
    command: ['--config=/conf/otel-collector-config.yaml']
    ports:
      - 4317:4317
      - 4318:4318
    volumes:
      - ./otel-collector-config.yaml:/conf/otel-collector-config.yaml
    links:
      - jaeger-all-in-one

  jaeger-all-in-one:
    image: jaegertracing/all-in-one:latest
    ports:
      - '16686:16686'
```

Ця конфігурація використовується в [docker-compose.yml](https://github.com/open-telemetry/opentelemetry-erlang/blob/main/docker-compose.yml) для запуску Collector з приймачами для HTTP та gRPC, які потім експортують до Zipkin також запущений за допомогою [docker-compose](https://docs.docker.com/compose/).

Щоб експортувати до запущеного Collector, пакунок `opentelemetry_exporter` повинен бути доданий до залежностей проєкту перед залежностями `opentelemetry`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
        {opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_exporter, "~> {{% param versions.otelExporter %}}"},
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

Потім його слід додати до конфігурації Release перед SDK Application, щоб забезпечити запуск залежностей експортера перед тим, як SDK спробує ініціалізувати та використовувати експортер.

Приклад конфігурації Release у `rebar.config` та для [завдання Release mix](https://hexdocs.pm/mix/Mix.Tasks.Release.html):

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% rebar.config
{relx, [{release, {my_instrumented_release, "0.1.0"},
         [opentelemetry_exporter,
	      {opentelemetry, temporary},
          my_instrumented_app]},

       ...]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# mix.exs
def project do
  [
    releases: [
      my_instrumented_release: [
        applications: [opentelemetry_exporter: :permanent, opentelemetry: :temporary]
      ],

      ...
    ]
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

Нарешті, конфігурація часу виконання `opentelemetry` та `opentelemetry_exporter` Applications налаштована на експорт до Collector. Нижче наведені конфігурації показують стандартні значення, які використовуються, якщо жодні не встановлені, а саме протокол HTTP з точкою доступу `localhost` на порту `4318`. Зверніть увагу:

- Якщо використовується `grpc` для `otlp_protocol`, кінцеву точку слід змінити на `http://localhost:4317`.
- Якщо ви використовуєте файл docker compose з вище, слід замінити `localhost` на `otel`.

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
[
 {opentelemetry,
  [{span_processor, batch},
   {traces_exporter, otlp}]},

 {opentelemetry_exporter,
  [{otlp_protocol, http_protobuf},
   {otlp_endpoint, "http://localhost:4318"}]}]}
].
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/config.exs
config :opentelemetry,
  resource: %{service: %{name: "roll_dice_app"}},
  span_processor: :batch,
  traces_exporter: :otlp

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: "http://localhost:4318"
  # otlp_endpoint: "http://otel:4318" якщо використовується файл docker compose
```

{{% /tab %}} {{< /tabpane >}}

Ви можете побачити свої трасування, запустивши `docker compose up` в одному терміналі, потім `mix phx.server` в іншому. Після надсилання кількох запитів через застосунок, перейдіть до `http://localhost:16686` і виберіть `roll_dice_app` зі списку Service, потім натисніть "Find Traces".

## Підводні камені {#gotchas}

Деякі середовища не дозволяють контейнерам виконуватися як root користувачі. Якщо ви працюєте в такому середовищі, ви можете додати `user: "1001"` як ключ/значення верхнього рівня до сервісу `otel` у файлі `docker-compose.yml`, який використовується в цьому підручнику.

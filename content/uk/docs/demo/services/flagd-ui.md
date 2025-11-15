---
title: Сервіс Flagd-UI
linkTitle: Flagd-UI
aliases: [flagd-uiservice]
default_lang_commit: 624a5ad2ea3c8f07660370aab626532469f946a3
cSpell:ignore: uiservice
---

Цей сервіс виступає в ролі інтерфейсу, де користувачі можуть вмикати та редагувати прапорці функцій, щоб змінювати поведінку демо-середовища.

[Flagd-UI service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/)

## Initializing Tracing {#initializing-tracing}

Після встановлення необхідних залежностей для автоматичної інструменталізації точок доступу і запитів Phoenix, ми налаштовуємо їх відповідно до [офіційної документації](/docs/languages/erlang/getting-started/), редагуючи файл `config/runtime.exs`:

```elixir
otel_endpoint =
  System.get_env("OTEL_EXPORTER_OTLP_ENDPOINT") ||
    raise """
    environment variable OTEL_EXPORTER_OTLP_ENDPOINT is missing.
    """

config :opentelemetry, :processors,
    otel_batch_processor: %{
      exporter: {:opentelemetry_exporter, %{endpoints: [otel_endpoint]}}
    }
```

І ми ініціалізуємо адаптер OpenTelemetry Bandit та бібліотеку Phoenix також всередині [`lib/flagd_ui/application.ex`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/lib/flagd_ui/application.ex):

```elixir
OpentelemetryBandit.setup()
OpentelemetryPhoenix.setup(adapter: :bandit)
```

## Трейси {#traces}

Phoenix і Bandit автоматично інструментуються за допомогою спеціальних бібліотек.

## Метрики {#metrics}

TBD

## Логи {#logs}

TBD

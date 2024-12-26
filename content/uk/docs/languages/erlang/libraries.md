---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: Ecto Hex
---

{{% docs/languages/libraries-intro "erlang" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не включає підтримку OpenTelemetry, ви можете використовувати
[бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library),
щоб генерувати телеметричні дані для бібліотеки або фреймворку.

Наприклад, [бібліотека інструментування для Ecto](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_ecto)
автоматично створює [відрізки](/docs/concepts/signals/traces/#spans) на основі
запитів.

## Налаштування {#setup}

Кожна бібліотека інструментування розповсюджується як пакунок Hex. Щоб встановити бібліотеку інструментування, додайте залежність до вашого файлу `mix.exs`. Наприклад:

```elixir
def deps do
  [
    {:opentelemetry_{package}, "~> 1.0"}
  ]
end
```

Де `{package}` — це назва бібліотеки інструментування.

Зверніть увагу, що деякі бібліотеки інструментування можуть мати попередні умови. Перевірте документацію кожної бібліотеки інструментування для подальших інструкцій.

## Доступні бібліотеки інструментування {#available-instrumentation-libraries}

Для повного списку бібліотек інструментування дивіться [список пакунків Hex](https://hex.pm/packages?search=opentelemetry&sort=recent_downloads).

Ви також можете знайти більше інструментів у [реєстрі](/ecosystem/registry/?language=erlang&component=instrumentation).

## Наступні кроки {#next-steps}

Після налаштування бібліотек інструментування, ви можете додати своє власне [інструментування](/docs/languages/erlang/instrumentation) до вашого коду, щоб збирати власні телеметричні дані.

Ви також можете налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/erlang/exporters) до одного або більше бекендів телеметрії.

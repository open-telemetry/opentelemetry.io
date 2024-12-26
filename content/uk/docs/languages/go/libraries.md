---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

{{% docs/languages/libraries-intro "go" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не підтримує OpenTelemetry з коробки, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації телеметричних даних для бібліотеки або фреймворку.

Наприклад, [бібліотека інструментування для `net/http`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp) автоматично створює [відрізки](/docs/concepts/signals/traces/#spans) та [метрики](/docs/concepts/signals/metrics/) на основі HTTP-запитів.

## Налаштування {#setup}

Кожна бібліотека інструментування є пакунком. Загалом, це означає, що вам потрібно виконати `go get` для відповідного пакету. Наприклад, щоб отримати бібліотеки інструментування, які підтримуються в [Contrib репозиторії](https://github.com/open-telemetry/opentelemetry-go-contrib), виконайте наступне:

```sh
go get go.opentelemetry.io/contrib/instrumentation/{import-path}/otel{package-name}
```

Потім налаштуйте її у вашому коді відповідно до вимог бібліотеки для активації.

[Початок роботи](../getting-started/) надає приклад налаштування інструментування для сервера `net/http`.

## Доступні пакети {#available-packages}

Повний список доступних бібліотек інструментування можна знайти в [реєстрі OpenTelemetry](/ecosystem/registry/?language=go&component=instrumentation).

## Наступні кроки {#next-steps}

Бібліотеки інструментування можуть генерувати телеметричні дані для вхідних та вихідних HTTP-запитів, але вони не інструментують ваш застосунок.

Збагачуйте свої телеметричні дані, інтегруючи [власне інструментування](../instrumentation/) у ваш код. Це доповнює телеметрію стандартної бібліотеки та може надати глибші відомості про роботу вашого застосунку.

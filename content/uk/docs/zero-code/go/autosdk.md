---
title: Go інструментування, Auto SDK
linkTitle: Auto SDK
description: Інтегруйте ручні відрізки з відрізками eBPF без кодування за допомогою Auto SDK.
weight: 16
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: tarcerprovider
---

Фреймворк інструментування OpenTelemetry Go eBPF, який використовується такими інструментами як [OBI](/docs/zero-code/obi), забезпечує підтримку інтеграції з вручну інструментованими відрізками OpenTelemetry через Auto SDK.

## Що таке Auto SDK? {#what-is-the-auto-sdk}

Auto SDK — це повністю реалізований, спеціальний OpenTelemetry Go SDK, розроблений для сумісності з автоматичним інструментуванням Go eBPF. Це дозволяє автоматично інструментованим пакункам (наприклад, `net/http`) підтримувати поширення контексту з ручними відрізками.

## Коли його варто використовувати? {#when-should-i-use-it}

Інструментування OpenTelemetry Go eBPF наразі підтримує лише обмежену кількість пакунків. Ви все ще можете захотіти розширити це інструментування та створити власні відрізки у своєму коді. Auto SDK робить це можливим, інструментуючи ваші власні відрізки зі спільним контекстом трасування, який також використовуватиметься автоматичними відрізками.

## Як його використовувати? {#how-do-i-use-it}

Починаючи з випуску [OpenTelemetry Go v1.36.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.36.0), Auto SDK автоматично імпортується як непряма залежність зі стандартним Go API. Ви можете підтвердити наявність Auto SDK у вашому проєкті, перевіривши наявність `go.opentelemetry.io/auto/sdk` у вашому `go.mod`.

Створення ручних відрізків за допомогою Auto SDK по суті таке ж саме, як створення відрізків за допомогою стандартного [Go інструментування](/docs/languages/go/instrumentation/).

З доступним Auto SDK, його використання настільки ж просте, як створення ручних відрізків за допомогою `tracer.Start()`:

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/otel"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Отримати трасувальник
		tracer := otel.Tracer("example-server")

		// Почати ручний відрізок
		_, span := tracer.Start(r.Context(), "manual-span")
		defer span.End()

		// Додати атрибут для демонстрації
		span.SetAttributes()
		span.AddEvent("Запит оброблено")
	})

	log.Println("Сервер працює на порту :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

У цьому прикладі фреймворк eBPF автоматично інструментує вхідні HTTP-запити, потім повʼязує ручний відрізок з тим самим трасуванням, що інструментоване з бібліотеки HTTP. Зверніть увагу, що в цьому прикладі немає ініціалізованого TracerProvider. Auto SDK реєструє власний TracerProvider, який є критично важливим для включення SDK.

По суті, вам не потрібно нічого робити для включення Auto SDK, окрім створення ручних відрізків у застосунку, інструментованому агентом Go zero-code. Доки ви не реєструєте вручну глобальний TracerProvider, Auto SDK буде автоматично включено.

> [!WARNING]
>
> Ручне встановлення глобального TracerProvider буде конфліктувати з Auto SDK та перешкоджати правильній кореляції ручних відрізків з відрізками на основі eBPF. Якщо ви створюєте ручні відрізки в Go-додатку, який також інструментований eBPF, не ініціалізуйте власний глобальний TracerProvider.

### TracerProvider Auto SDK {#auto-sdk-tarcerprovider}

У більшості випадків немає необхідності вручну взаємодіяти з вбудованим TracerProvider Auto SDK. Однак для деяких розширених випадків використання ви можете захотіти вручну налаштувати TracerProvider Auto SDK. Ви можете отримати до нього доступ за допомогою функції [`auto.TracerProvider()`](https://pkg.go.dev/go.opentelemetry.io/auto/sdk):

```go
import (
	"go.opentelemetry.io/otel"
    autosdk "go.opentelemetry.io/auto/sdk"
)

func main() {
	tp := autosdk.TracerProvider()
	otel.SetTracerProvider(tp)
}
```

## Як працює Auto SDK? {#how-does-the-auto-sdk-work}

Коли застосунок інструментується OpenTelemetry eBPF, програма eBPF шукає наявність залежності `go.opentelemetry.io/auto/sdk` у застосунку (памʼятайте, ця залежність є стандартно увімкненою у `go.opentelemetry.io/otel`; її не потрібно явно імпортувати). Якщо вона знайдена, програма eBPF включає логічне значення в глобальному OpenTelemetry SDK, щоб проінструктувати OpenTelemetry використовувати TracerProvider Auto SDK.

Потім Auto SDK працює дуже подібно до будь-якого іншого SDK, реалізуючи всю необхідну функціональність, визначену специфікацією. Основна відмінність полягає в тому, що він також автоматично інструментується eBPF для уніфікації поширення контексту з іншими бібліотеками, інструментованими eBPF.

По суті, Auto SDK — це спосіб, яким OpenTelemetry eBPF ідентифікує та оркеструє поширення контексту зі стандартним OpenTelemetry API, інструментуючи символи функцій OpenTelemetry так само, як він це робить для будь-якого іншого пакету.

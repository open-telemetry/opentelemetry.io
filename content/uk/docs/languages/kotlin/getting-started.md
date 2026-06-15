---
title: Початок роботи
description: Початок роботи з OpenTelemetry Kotlin SDK
weight: 10
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
---

OpenTelemetry Kotlin надає [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) реалізацію [специфікації OpenTelemetry](/docs/specs/otel/).

## OpenTelemetry Kotlin SDK

### Підтримувані платформи {#supported-platforms}

OpenTelemetry Kotlin наразі вимагає Kotlin 2.0 або новішої версії. Підтримувані платформи та їхні вимоги наведені нижче:

| Платформа  | Вимоги      |
| ---------- | ----------- |
| Android    | minSdk >=21 |
| JVM        | JDK >= 11   |
| iOS        | 16.0        |
| JavaScript | ES5         |

### Стабільність API {#api-stability}

API наразі підлягає змінам без попередження, і більшість символів вимагають явного включення. Ви можете включити їх окремо, додавши `@OptIn(ExperimentalApi::class)` на кожному виклику.

Альтернативно, ви можете включити їх для всього модуля або проєкту, змінивши аргументи компілятора Kotlin:

```kotlin
kotlin.compilerOptions {
    optIn.add("io.opentelemetry.kotlin.ExperimentalApi")
}
```

### Підтримувані режими {#supported-modes}

OpenTelemetry Kotlin API працює в 2 режимах:

- Звичайний режим, який захоплює телеметрію за допомогою реалізації Kotlin Multiplatform (KMP). Доступний для всіх цільових платформ.
- Режим сумісності, який виступає фасадом для [OpenTelemetry Java SDK](https://github.com/open-telemetry/opentelemetry-java). Доступний лише для цільових платформ JVM/Android.

## Встановлення OpenTelemetry Kotlin {#install-opentelemetry-kotlin}

Спочатку виберіть, чи слідувати інструкціям для звичайного режиму або режиму сумісності нижче.

### Використання звичайного режиму {#use-regular-mode}

1. Додайте ці залежності до `build.gradle` модуля, який ініціалізує SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:implementation:$otelKotlinVersion")
}
```

1. Ініціалізуйте SDK на ранньому етапі життєвого циклу вашого застосунку:

```kotlin
val otelKotlin: OpenTelemetry = createOpenTelemetry {
    // configure SDK here
}
```

1. Використовуйте Kotlin API у вашому застосунку.

### Використання режиму сумісності {#use-compatibility-mode}

Режим сумісності дозволяє використовувати Kotlin API, який під капотом використовує OpenTelemetry Java SDK. Це може бути корисно, якщо ви вже використовуєте Java реалізацію або не хочете використовувати Kotlin реалізацію.

1. Додайте ці залежності до `build.gradle` модуля, який ініціалізує SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:compat:$otelKotlinVersion")
}
```

1. Обгорніть ваш наявний екземпляр [OpenTelemetry Java](https://github.com/open-telemetry/opentelemetry-java) інстанцію:

```kotlin
val otelJava = io.opentelemetry.sdk.OpenTelemetrySdk.builder().build()
val otelKotlin: OpenTelemetry = otelJava.toOtelKotlinApi()

// або, альтернативно, створіть екземпляр, який використовує opentelemetry-java під капотом
val otelKotlin: OpenTelemetry = createCompatOpenTelemetry {
    // configure SDK here
}
```

1. Використовуйте Kotlin API разом або замість Java API у вашому застосунку.

### Налаштування інших модулів {#setup-other-modules}

Далі додайте залежності `api` та `noop` до `build.gradle` всіх модулів, які ви хочете інструментувати:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:api:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:noop:$otelKotlinVersion")
}
```

> [!NOTE]
>
> Не додавайте залежності `core`, `compat` або `implementation` у модуль, якщо вам не потрібно ініціалізувати SDK. Це гарантує, що ви пишете інструментування виключно за допомогою [Instrumentation API](/docs/specs/otel/overview/#api) OpenTelemetry.

#### Як я можу інструментувати свій застосунок? {#how-can-i-instrument-my-app}

Нижче наведено мінімальний приклад, який генерує лог та трасу:

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // генерує лог
    val logger = otel.loggerProvider.getLogger("my_logger")
    logger.log("Hello, World!")

    // починає та завершує відрізок
    val tracer = otel.tracerProvider.getTracer("my_tracer")
    tracer.startSpan("my_span").end()
}
```

Щоб надсилати телеметрію, передайте реальний екземпляр `OpenTelemetry` як параметр замість no-op. Якщо ви є автором бібліотеки, цей підхід дуже корисний, оскільки дозволяє користувачам вашої бібліотеки вибирати, чи отримувати телеметрію з вашої бібліотеки.

### Експорт до OpenTelemetry Collector {#export-to-an-opentelemetry-collector}

Як останній крок, ймовірно, потрібно налаштувати експорт телеметрії через [OTLP/HTTP](/docs/specs/otel/protocol/) до OpenTelemetry Collector або до бекенду, який приймає OTLP. Додайте залежність `exporters-otlp` у модуль, де ви ініціалізували SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:exporters-otlp:$otelKotlinVersion")
}
```

Потім налаштуйте експортери OTLP з пакетним процесором:

```kotlin
val url = "http://localhost:4318"
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        export {
            batchSpanProcessor(
                otlpHttpSpanExporter(url)
            )
        }
    }
    loggerProvider {
        export {
            batchLogRecordProcessor(
                otlpHttpLogRecordExporter(url)
            )
        }
    }
}
```

---

Вітаємо! Ви завершили кроки встановлення OpenTelemetry Kotlin SDK.

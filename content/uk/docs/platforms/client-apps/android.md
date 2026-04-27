---
title: Android
description: >-
  Використовуйте OpenTelemetry в застосунках, що працюють на платформах Android
weight: 10
vers:
  ot-android: 1.2.0
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: inactivity
---

OpenTelemetry Android забезпечує спостережуваність для нативних Android-застосунків. Створений на основі екосистеми [OpenTelemetry Java](/docs/languages/java/), він пропонує автоматичну інструментацію, моніторинг реальних користувачів (RUM) і можливості ручного інструментування, адаптовані для мобільних середовищ.

## Функції {#features}

OpenTelemetry Android включає такі ключові можливості:

- **Автоматичне інструментування**: вбудовані модулі для поширених шаблонів Android:
  - життєвий цикл Activity
  - життєвий цикл Fragment
  - виявлення ANR (Application Not Responding)
  - звітність про збої
  - виявлення змін мережі
  - виявлення повільного/замороженого рендерингу
  - час запуску
  - орієнтація екрана
  - події кліків на переглядах
- **Управління сесіями**: відстежуйте сесії користувачів із налаштованими часовими проміжками неактивності та максимальним часом сесії.
- **Офлайн-буферизація**: постійне зберігання на диску для буферизації даних телеметрії, коли пристрій не в мережі, що забезпечує відсутність втрати даних під час перебоїв у мережі.
- **Редагування атрибутів**: можливість редагувати або змінювати атрибути діапазонів перед експортом для забезпечення відповідності вимогам конфіденційності.

## Початок роботи {#getting-started}

### Передумови {#prerequisites}

- Android SDK 21 (Lollipop) або новішої версії
- Проєкт Gradle, що використовує Kotlin (також може бути Java)

### Налаштування Gradle {#gradle-setup}

Додайте залежність OpenTelemetry Android Agent до файлу `build.gradle.kts` вашого застосунку. Використовуйте Bill of Materials (BOM) для керування версіями:

```kotlin
dependencies {
    implementation(platform("io.opentelemetry.android:opentelemetry-android-bom:{{% param vers.ot-android %}}"))
    implementation("io.opentelemetry.android:android-agent")
}
```

> [!NOTE]
>
> Перевірте [релізи OpenTelemetry Android](https://github.com/open-telemetry/opentelemetry-android/releases) для отримання останньої версії.

### Ініціалізація агента {#initialize-the-agent}

Ініціалізуйте OpenTelemetry в методі `onCreate()` вашого класу `Application`:

```kotlin
class MyApplication : Application() {
    lateinit var openTelemetryRum: OpenTelemetryRum

    override fun onCreate() {
        super.onCreate()
        openTelemetryRum = initializeOpenTelemetry(this)
    }
}

private fun initializeOpenTelemetry(context: Context): OpenTelemetryRum =
    OpenTelemetryRumInitializer.initialize(
        context = context,
        configuration = {
            httpExport {
                baseUrl = "https://your-collector-endpoint:4318"
                baseHeaders = mapOf("Authorization" to "Bearer <token>")
            }
            instrumentations {
                // Усі інструментації типово ввімкнено.
                // Вимкніть певні за потреби:
                slowRendering { enabled(false) }
            }
            session {
                backgroundInactivityTimeout = 15.minutes
                maxLifetime = 4.days
            }
        }
    )
```

## Конфігурація {#configuration}

OpenTelemetry Android використовує DSL Kotlin для конфігурації, як показано в прикладі ініціалізації вище. У наступній таблиці описано доступні параметри конфігурації:

### Параметри конфігурації {#configuration-options}

| Блок                                      | Опис                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| `httpExport { baseUrl }`                  | URL-адреса OTLP для експорту даних телеметрії            |
| `httpExport { baseHeaders }`              | Спеціальні заголовки для включення в запити експорту     |
| `globalAttributes`                        | Атрибути, які додаються до всіх даних телеметрії         |
| `session { backgroundInactivityTimeout }` | Час неактивності перед початком нової сесії              |
| `session { maxLifetime }`                 | Максимальний час життя сесії                             |
| `instrumentations`                        | Налаштування окремих модулів автоматичної інструментації |

## Автоматична інструментація {#automatic-instrumentation}

OpenTelemetry Android надає модулі автоматичної інструментації, які можна ввімкнути або вимкнути. Для отримання детальної інформації про кожну інструментацію, включно з вихідними даними телеметрії та параметрами конфігурації, див. відповідну документацію.

### Життєвий цикл Activity {#activity-lifecycle}

Автоматично фіксує відрізки для подій життєвого циклу Activity (`onCreate`, `onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`). Див. [інструментацію Activity](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/activity/README.md).

### Життєвий цикл Fragment {#fragment-lifecycle}

Фіксує діапазони для подій життєвого циклу Fragment, що корисно для відстеження навігації в архітектурах з одним Activity. Див. [інструментацію Fragment](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/fragment/README.md).

### Виявлення ANR {#anr-detection}

Виявляє умови Application Not Responding (ANR) і повідомляє про них як діапазони, допомагаючи виявити проблеми, пов’язані з блокуванням основного потоку. Див. [інструментацію ANR](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/anr/README.md).

### Звітність про збої {#crash-reporting}

Фіксує необроблені винятки та повідомляє про них зі стеками трейсів, що дозволяє корелювати збої з сесіями користувачів і трасуваннями. Див. [інструментацію збоїв](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/crash/README.md).

### Моніторинг мережі {#network-monitoring}

Виявляє зміни стану мережі та додає інформацію про підключення до даних телеметрії, що допомагає зрозуміти умови мережі під час виникнення помилок. Див. [інструментацію мережі](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/network/README.md).

### Повільний і заморожений рендеринг {#slow-and-frozen-frames}

Відстежує продуктивність рендерингу кадрів і повідомляє про повільний рендеринг (>16 мс) і заморожені кадри (>700 мс), щоб допомогти виявити вузькі місця в продуктивності інтерфейсу. Див. [інструментацію повільного рендерингу](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/slowrendering/README.md).

## Ручна інструментація {#manual-instrumentation}

Отримайте доступ до API OpenTelemetry для ручної інструментації:

```kotlin
val openTelemetry = openTelemetryRum.openTelemetry
val tracer = openTelemetry.getTracer("com.example.myapp")

val span = tracer.spanBuilder("my-operation")
    .startSpan()

try {
    span.makeCurrent().use {
        // Ваш код тут
    }
} finally {
    span.end()
}
```

## Інструментація HTTP-клієнта {#http-client-instrumentation}

Інструментуйте клієнти OkHttp для відстеження мережевих запитів:

```kotlin
val okHttpClient = OkHttpTelemetry.builder(openTelemetryRum.openTelemetry)
    .build()
    .newCallFactory(OkHttpClient.Builder().build())
```

## Поради {#best-practices}

### Обмеження ресурсів {#resource-constraints}

Мобільні пристрої мають обмежені ресурси. Розгляньте ці поради:

- **Пакетний експорт**: Пакетна обробка типово увімкнена, щоб зменшити кількість мережевих викликів і споживання енергії.
- **Семплювання**: Реалізуйте стратегії семплювання, щоб зменшити обсяг даних, зберігаючи при цьому репрезентативні дані телеметрії.
- **Офлайн-буферизація**: Постійне зберігання на диску типово увімкнено, щоб обробляти ненадійні з’єднання.

### Питання конфіденційності {#privacy-considerations}

- Використовуйте редагування атрибутів, щоб видалити конфіденційні дані перед експортом.
- Розгляньте вимоги щодо згоди користувачів на збір даних телеметрії.
- Уникайте захоплення персонально ідентифікованої інформації (PII) в іменах діапазонів або атрибутах.

### Тестування {#testing}

Під час тестування з емулятором використовуйте `10.0.2.2` як адресу хосту, щоб отримати доступ до вашого локального колектора:

```kotlin
httpExport {
    baseUrl = "http://10.0.2.2:4318"
}
```

## Ресурси {#resources}

- [GitHub OpenTelemetry Android](https://github.com/open-telemetry/opentelemetry-android)
- [Документація OpenTelemetry Java](/docs/languages/java/)
- [Семантичні домовленості Android](/docs/specs/semconv/registry/attributes/android/)
- [Прикладні застосунків](https://github.com/open-telemetry/opentelemetry-android/tree/main/demo-app)

## Допомога та відгуки {#help-and-feedback}

Якщо у вас виникли запитання, зверніться через [GitHub Issues](https://github.com/open-telemetry/opentelemetry-android/issues) або канал [#otel-android](https://cloud-native.slack.com/archives/C05J0T9K27Q) у [CNCF Slack](https://slack.cncf.io/).

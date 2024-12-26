---
title: Бібліотеки інструментів
linkTitle: Бібліотеки
weight: 40
default_lang_commit: d96ebd8b6acadb9bd26a36f91eeb3410a2050c7e
# prettier-ignore
cSpell:ignore: darwin inout iphone NSURL Signposter tvos urlsession wifi профілюючому
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/libraries-intro "swift" %}}

## Використання бібліотек інструментів {#use-instrumentation-libraries}

OpenTelemetry-Swift надає кілька [бібліотек інструментів](/docs/specs/otel/glossary/#instrumentation-library), які генерують інструменти для вас, коли вони встановлені та ініціалізовані.

Наприклад, [інструментування NSURLSession](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation/URLSession) автоматично створює [відрізки](/docs/concepts/signals/traces/#spans) для всіх мережевих запитів, зроблених за допомогою NSURLSessions.

## Налаштування {#setup}

Усі бібліотеки інструментів доступні в OpenTelemetry Swift. Щоб увімкнути інструментування, дотримуйтесь інструкцій з використання.

## `SDKResourceExtension`

`SDKResourceExtension` надає деталі про пристрій як ресурс.

### Використання {#usage}

Використовуйте `DefaultResource.get()`, щоб створити обʼєкт ресурсу "все в одному". Цей ресурс можна додати до `TracerProvider` або `MetricProvider`.

```swift
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
            .with(resource: DefaultResource.get())
            .build())
```

### Деталі {#details}

`SDKResourceExtension` надає атрибути в обʼєкті ресурсу з деталями про пристрій iOS, деталі ОС та деталі застосунку. Він застосовує ці значення до відповідних [семантичних атрибутів](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value).

#### Інформація про застосунок {#application-info}

| Атрибут             | Приклад значення              | Опис                                                                                                |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `service.name`      | `MyApplication`               | `CFBundleName`; Назва застосунку, визначена в info.plist застосунку.                                |
| `service.version`   | `1.0 (1234)`                  | `CFBundleShortVersion` & (`CFBundleVersion`); Версія застосунку, визначена в info.plist застосунку. |
| `service.namespace` | `com.myCompany.myApplication` | `CFBundleIdentifier`                                                                                |

#### Інформація про пристрій {#device-info}

| Атрибут                   | Приклад значення        | Опис                                          |
| ------------------------- | ----------------------- | --------------------------------------------- |
| `device.model.identifier` | `iphone13,3`            | отримано з `sysctl` залежно від типу пристрою |
| `device.id`               | `00000000-0000-0000000` | рядок uuid `identifierForVendor`              |

#### Інформація про операційну систему {#operating-system-info}

| Атрибути         | Приклад значення                  | Опис                                                    |
| ---------------- | --------------------------------- | ------------------------------------------------------- |
| `os.type`        | `darwin`                          | визначено в `ResourceAttributes`                        |
| `os.name`        | `iOS`, `watchOS`, `macOS`         | `UIDevice.current.systemName` або залежно від платформи |
| `os.version`     | `15.4.0`                          | `ProcessInfo.processInfo.operatingSystemVersion`        |
| `os.description` | `iOS Version 15.4 (Build 19E240)` | Поєднання назви ОС, версії та збірки.                   |

## Інструментування `NSURLSession` {#urlsession-instrumentation}

Це інструментування створює відрізки для всіх мережевих запитів, зроблених за допомогою NSURLSessions. Воно також вставляє заголовки розподіленого трасування в інструментовані мережеві запити. `NetworkStatus` є залежністю цього пакунка, який надає атрибути стану мережі для мережевих відрізків.

Примітка: Інструментування NSURLSession покладається на глобального постачальника трасувань у обʼєкті OpenTelemetry. Власні постачальники трасувань повинні бути налаштовані та встановлені як глобальні постачальники перед цим інструментуванням.

### Використання {#usage-1}

Ініціалізуйте клас за допомогою `URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())`, щоб автоматично захоплювати всі мережеві виклики.

Цю поведінку можна змінити або доповнити, використовуючи необовʼязкові зворотні виклики, визначені в `URLSessionInstrumentationConfiguration`:

- `shouldInstrument: ((URLRequest) -> (Bool)?)?`

  Фільтруйте, які запити ви хочете інструментувати, стандартно всі.

- `shouldRecordPayload: ((URLSession) -> (Bool)?)?`

  Реалізуйте, якщо хочете, щоб сесія записувала дані корисного навантаження, стандартно false.

- `shouldInjectTracingHeaders: ((URLRequest) -> (Bool)?)?`

  Дозволяє фільтрувати, до яких запитів ви хочете вставляти заголовки для відстеження, стандартно true. Ви також повинні повернути true, якщо хочете вставити власні заголовки.

- `injectCustomHeaders: ((inout URLRequest, Span?) -> Void)?`

  Реалізуйте цей зворотний виклик, щоб вставити власні заголовки або змінити запит іншим чином.

- `nameSpan: ((URLRequest) -> (String)?)?`

  Змініть назву для даного запиту замість стандартної назви OpenTelemetry.

- `createdRequest: ((URLRequest, Span) -> Void)?`

  Викликається після створення запиту, дозволяє додати додаткову інформацію до відрізка.

- `receivedResponse: ((URLResponse, DataOrFile?, Span) -> Void)?`

  Викликається після отримання відповіді, дозволяє додати додаткову інформацію до відрізка.

- `receivedError: ((Error, DataOrFile?, HTTPStatus, Span) -> Void)?`

  Викликається після отримання помилки, дозволяє додати додаткову інформацію до відрізка.

Нижче наведено приклад ініціалізації. Конструкція `URLSessionInstrumentationConfiguration` може бути передана параметрами, визначеними вище, щоб відповідати потребам застосунку.

```swift
let sessionInstrumentation = URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())
```

### Деталі {#details-1}

Інструментування `NSURLSession` також надає додаткові атрибути, що надають деталі про стан мережі пристрою на момент мережевих запитів.

| Атрибут                       | Приклад значення              | Опис                                                                                   |
| ----------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `net.host.connection.type`    | `wifi`, `cell`, `unavailable` | Тип зʼєднання, який використовував пристрій на момент запиту.                          |
| `net.host.connection.subtype` | `EDGE` `LTE`, тощо            | Тип стільникового зʼєднання. Заповнюється лише якщо тип зʼєднання `cell`.              |
| `net.host.carrier.name`       | `T-Mobile`, `Verizon`, тощо   | Назва стільникового оператора. Заповнюється лише для типів стільникового зʼєднання.    |
| `net.host.carrier.icc`        | `DE`                          | Двосимвольний код країни ISO 3166-1 alpha-2, повʼязаний з мобільною мережею оператора. |
| `net.host.carrier.mcc`        | `310`                         | Мобільний код країни                                                                   |
| `net.host.carrier.mnc`        | `001`                         | Мобільний мережевий код                                                                |

## `SignpostIntegration`

Цей пакет створює виклики `os_signpost` `begin` та `end`, коли відрізки
починаються або закінчуються. Це дозволяє автоматичну інтеграцію додатків, інструментованих
за допомогою OpenTelemetry, щоб показувати їх відрізки в профілюючому застосунку, як `Instruments`. Він
також експортує `OSLog`, який використовується для публікації, щоб користувач міг додати додаткові події signpost. Ця функціональність показана в прикладі `Simple Exporter`.

### Повідомлення про версію {#version-notice}

- **iOS 15+, macOS 12+, tvOS 15+, watchOS 8+**: використовуйте **`OSSignposterIntegration`**, який використовує сучасний API `OSSignposter` для підвищення ефективності та сумісності.
- **Старі системи**: використовуйте **`SignPostIntegration`**, який базується на традиційному API `os_signpost`.

### Використання {#usage-2}

Add the appropriate span processor based on your deployment target (see the
[manual instrumentation](../instrumentation/)) docs for details on configuring
your providers:

#### Для iOS 15+, macOS 12+, tvOS 15+, watchOS 8+: {#for-ios-15-macos-12-tvos-15-watchos-8}

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
```

#### Для старих систем {#for-older-systems}

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
```

#### Або вибрати автоматично під час виконання: {#or-to-select-automatically-at-runtime}

```swift
if #available(iOS 15, macOS 12, tvOS 15, watchOS 8, *) {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
} else {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
}
```

## Доступні бібліотеки інструментів {#available-instrumentation-libraries}

Повний список бібліотек інструментів, створених OpenTelemetry, доступний у репозиторії [opentelemetry-swift](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation).

Ви також можете знайти більше інструментів в [реєстрі](/ecosystem/registry/?language=swift&component=instrumentation).

## Наступні кроки {#next-steps}

Після налаштування бібліотек інструментів, ви можете додати свої власні [інструменти](/docs/languages/swift/instrumentation) до вашого коду, щоб збирати власні дані телеметрії.

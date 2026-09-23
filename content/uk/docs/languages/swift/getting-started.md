---
title: Початок роботи
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 10
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: rolldice
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Swift.

Ви дізнаєтесь, як інструментувати простий застосунок таким чином, щоб [трейси][] виводилися в консоль.

## Попередні вимоги {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Swift](https://www.swift.org/)

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Vapor](https://vapor.codes). Якщо ви не використовуєте Vapor, це не проблема, ви можете використовувати OpenTelemetry Swift з будь-яким застосунком на Swift, незалежно від того, чи працюють вони на сервері, чи на пристрої iOS.

Для отримання додаткових прикладів дивіться [приклади](/docs/languages/swift/examples/).

### Залежності {#dependencies}

Для початку створіть файл з назвою `Package.swift` у новій теці з наступним вмістом:

```swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "dice-server",
    platforms: [
       .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.83.1")
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor")
            ],
            path: "."
        )
    ]
)
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

У тій самій теці створіть файл під назвою `main.swift` і додайте наступний код до файлу:

```swift
import Vapor

@main
enum Entrypoint {
    static func main() async throws {
        let app = try Application(.detect())
        defer { app.shutdown() }
        app.get("rolldice") { req in
            let result = Int.random(in: 1..<7)
            return result
        }
        try app.run()
    }
}
```

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```console
$ swift run
Building for debugging...
Build complete! (0.31s)
2023-10-04T17:16:13+0200 notice codes.vapor.application : [Vapor] Server starting on http://127.0.0.1:8080
```

## Інструментування {#instrumentation}

Щоб додати OpenTelemetry до вашого застосунку, оновіть `Package.swift` з наступними додатковими залежностями:

```swift
// swift-tools-version:5.9
import PackageDescription


let package = Package(
    name: "dice-server",
    platforms: [
       .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.83.1"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift", from: "1.0.0"),
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "OpenTelemetryApi", package: "opentelemetry-swift"),
                .product(name: "OpenTelemetrySdk", package: "opentelemetry-swift"),
                .product(name: "StdoutExporter", package: "opentelemetry-swift"),
                .product(name: "ResourceExtension", package: "opentelemetry-swift"),
            ],
            path: "."
        )
    ]
)
```

Оновіть файл `main.swift` кодом для ініціалізації трейсера та для виведення відрізків, коли викликається обробник запитів `rolldice`:

```swift
import Vapor
import OpenTelemetryApi
import OpenTelemetrySdk
import StdoutExporter
import ResourceExtension

@main
enum Entrypoint {
    static func main() async throws {

        let spanExporter = StdoutExporter();
        let spanProcessor = SimpleSpanProcessor(spanExporter: spanExporter)
        let resources = DefaultResources().get()

        let instrumentationScopeName = "DiceServer"
        let instrumentationScopeVersion = "semver:0.1.0"

        OpenTelemetry.registerTracerProvider(tracerProvider:
            TracerProviderBuilder()
                .add(spanProcessor: spanProcessor)
                .with(resource: resources)
                .build()
        )
        let tracer = OpenTelemetry.instance.tracerProvider.get(instrumentationName: instrumentationScopeName, instrumentationVersion: instrumentationScopeVersion) as! TracerSdk


        let app = try Application(.detect())
        defer { app.shutdown() }

        app.get("rolldice") { req in
            let span = tracer.spanBuilder(spanName: "GET /rolldice").setSpanKind(spanKind: .client).startSpan()
            let result = Int.random(in: 1..<7)
            span.end();
            return result
        }

        try app.run()
    }
}
```

Запустіть ваш сервер знову:

```sh
swift run
```

Коли ви відправите запит до сервера за адресою <http://localhost:8080/rolldice>, ви побачите, що відрізок виводиться в консоль (вивід відформатовано для зручності):

```json
{
  "attributes": {},
  "duration": 2.70605087280273e-5,
  "parentSpanId": "0000000000000000",
  "span": "GET /rolldice",
  "spanId": "635455eb236a1592",
  "spanKind": "client",
  "start": 718126321.210727,
  "traceFlags": {
    "sampled": true
  },
  "traceId": "c751f7af0586dac8ef3607c6fc128884",
  "traceState": {
    "entries": []
  }
}
```

## Наступні кроки {#next-steps}

Збагачуйте ваше інструментування, яке генерується автоматично, за допомогою [ручного інструментування](/docs/languages/swift/instrumentation) вашого власного коду. Це дозволить отримати налаштовані дані спостереження.

Ознайомтеся з доступними [бібліотеками інструментування](/docs/languages/swift/libraries/), які генерують телеметричні дані для популярних фреймворків та бібліотек.

[трейси]: /docs/concepts/signals/traces/

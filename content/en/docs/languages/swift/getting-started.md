---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
weight: 10
cSpell:ignore: rolldice
---

This page will show you how to get started with OpenTelemetry in Swift.

You will instrument a simple application to emit [traces][], [metrics][], and
[logs][] (including events) to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [Swift](https://www.swift.org/)

## Example Application

The following example uses a basic [Vapor](https://vapor.codes) application. If
you are not using Vapor, that's OK — you can use OpenTelemetry Swift with any
Swift application, no matter if they run on a server or on an iOS device.

For more examples, see [examples](/docs/languages/swift/examples/).

### Dependencies

To begin, create a file called `Package.swift` in a new directory with the
following content:

```swift
// swift-tools-version:6.0
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

### Create and launch an HTTP Server

In the same folder, create a file called `main.swift` and add the following code
to the file:

```swift
import Vapor

@main
enum Entrypoint {
    static func main() async throws {
        let app = try await Application.make(.detect())
        do {
            app.get("rolldice") { req in
                let result = Int.random(in: 1..<7)
                return result
            }
            try await app.execute()
            try await app.asyncShutdown()
        } catch {
            try? await app.asyncShutdown()
            throw error
        }
    }
}
```

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
swift run
```

Stop the server with Ctrl+C before continuing.

## Instrumentation

To add OpenTelemetry to your application, update `Package.swift` with the
following dependencies. Version 2.6.0 provides the APIs used below.

```swift
// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "dice-server",
    platforms: [
        .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.83.1"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift-core.git", from: "2.6.0"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift.git", from: "2.6.0"),
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "OpenTelemetryApi", package: "opentelemetry-swift-core"),
                .product(name: "OpenTelemetrySdk", package: "opentelemetry-swift-core"),
                .product(name: "StdoutExporter", package: "opentelemetry-swift-core"),
                .product(name: "ResourceExtension", package: "opentelemetry-swift"),
            ],
            path: "."
        )
    ]
)
```

Update `main.swift` to configure stdout exporters for all three signals. Each
`rolldice` request creates a server span, increments a counter, emits a log
record, and emits a named event:

```swift
import Vapor
import OpenTelemetryApi
import OpenTelemetrySdk
import StdoutExporter
import ResourceExtension

@main
enum Entrypoint {
    static func main() async throws {
        let resources = DefaultResources().get()
        let instrumentationScopeName = "DiceServer"
        let instrumentationScopeVersion = "semver:0.1.0"

        let spanExporter = StdoutSpanExporter()
        let spanProcessor = SimpleSpanProcessor(spanExporter: spanExporter)
        OpenTelemetry.registerTracerProvider(tracerProvider:
            TracerProviderBuilder()
                .add(spanProcessor: spanProcessor)
                .with(resource: resources)
                .build()
        )
        let tracer = OpenTelemetry.instance.tracerProvider.get(
            instrumentationName: instrumentationScopeName,
            instrumentationVersion: instrumentationScopeVersion
        )

        let metricReader = PeriodicMetricReaderBuilder(
            exporter: StdoutMetricExporter(isDebug: false)
        ).setInterval(timeInterval: 1).build()
        let meterProvider = MeterProviderSdk.builder()
            .setResource(resource: resources)
            .registerMetricReader(reader: metricReader)
            .registerView(
                selector: InstrumentSelector.builder()
                    .setMeter(name: instrumentationScopeName)
                    .build(),
                view: View.builder().build()
            )
            .build()
        OpenTelemetry.registerMeterProvider(meterProvider: meterProvider)
        let meter = meterProvider.meterBuilder(
            name: instrumentationScopeName
        ).build()
        let diceRolls = meter.counterBuilder(name: "dice.rolls").build()

        OpenTelemetry.registerLoggerProvider(loggerProvider:
            LoggerProviderBuilder()
                .with(resource: resources)
                .with(processors: [
                    SimpleLogRecordProcessor(logRecordExporter: StdoutLogExporter())
                ])
                .build()
        )
        let logger = OpenTelemetry.instance.loggerProvider.get(
            instrumentationScopeName: instrumentationScopeName
        )

        let app = try await Application.make(.detect())
        do {
            app.get("rolldice") { req in
                let span = tracer.spanBuilder(spanName: "GET /rolldice")
                    .setSpanKind(spanKind: .server)
                    .startSpan()
                defer { span.end() }

                let result = Int.random(in: 1..<7)
                diceRolls.add(value: 1)
                logger.logRecordBuilder()
                    .setSeverity(.info)
                    .setBody(.string("Rolled a dice"))
                    .emit()
                logger.logRecordBuilder()
                    .setEventName("dice.rolled")
                    .setAttributes(["dice.value": .int(result)])
                    .emit()
                return result
            }

            try await app.execute()
            try await app.asyncShutdown()
        } catch {
            try? await app.asyncShutdown()
            throw error
        }
    }
}
```

Start your server again, then send a request from another terminal:

```sh
swift run
```

```sh
curl http://localhost:8080/rolldice
```

The exporters print JSON to the server console. Look for these fields (IDs and
dice values will vary):

| Signal | Fields in the output                                          |
| ------ | ------------------------------------------------------------- |
| Trace  | `span` named `GET /rolldice` and `spanKind` set to `server`   |
| Metric | `name` set to `dice.rolls` and a `dataPoints` value           |
| Log    | `body` containing `Rolled a dice`                             |
| Event  | `eventName` set to `dice.rolled` and a `dice.value` attribute |

The view selects instruments from the `DiceServer` meter. The metric reader
exports cumulative counter values once per second. The event uses the logs API
and appears as a log record with an `eventName`.

## Next Steps

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/languages/swift/instrumentation) of your own
codebase. This gets you customized observability data.

Take a look at available
[instrumentation libraries](/docs/languages/swift/libraries/) that generate
telemetry data for popular frameworks and libraries.

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/

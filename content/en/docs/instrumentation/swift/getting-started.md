---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
cSpell:ignore: rolldice
weight: 10
---

This page will show you how to get started with OpenTelemetry in Swift.

You will learn how you can instrument a simple application, in such a way that
[traces][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [Swift](https://www.swift.org/)

## Example Application

The following example uses a basic [Vapor](https://vapor.codes) application. If
you are not using Vapor, that's OK — you can use OpenTelemetry Swift with any
Swift application, no matter if they run on a server or on an iOS device.

For more examples, see [examples](/docs/instrumentation/swift/examples/).

### Dependencies

To begin, create a file called `Package.swift` in a new directory with the
following content:

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

### Create and launch an HTTP Server

In the same folder, create a file called `main.swift` and add the following code
to the file:

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

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```console
$ swift run
Building for debugging...
Build complete! (0.31s)
2023-10-04T17:16:13+0200 notice codes.vapor.application : [Vapor] Server starting on http://127.0.0.1:8080
```

## Instrumentation

To add OpenTelemetry to your application, update the `Package.swift` with the
following additional dependencies:

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

Update the `main.swift` file with code to initialize a tracer and to emit spans
when the `rolldice` request handler is called:

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

Start your server again:

```sh
swift run
```

When you send a request to the server at <http://localhost:8080/rolldice>,
you'll see a span being emitted to the console (output is pretty printed for
convenience):

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

## Next Steps

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/instrumentation/swift/manual) of your own
codebase. This gets you customized observability data.

Take a look at available
[instrumentation libraries](/docs/instrumentation/swift/libraries/) that
generate telemetry data for popular frameworks and libraries.

[traces]: /docs/concepts/signals/traces/

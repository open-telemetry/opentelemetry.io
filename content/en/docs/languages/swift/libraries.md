---
title: Instrumentation Libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: darwin inout iphone NSURL Signposter wifi
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/libraries-intro "swift" %}}

## Use instrumentation libraries

OpenTelemetry-Swift provides several
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
that generate instrumentation for you when they're installed and initialized.

For example,
[the NSURLSession instrumentation](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation/URLSession)
automatically creates [spans](/docs/concepts/signals/traces/#spans) for all
network requests made with NSURLSessions.

## Setup

All instrumentation libraries are available in OpenTelemetry Swift. To turn on
an instrumentation, follow its instructions.

## `SDKResourceExtension`

`SDKResourceExtension` provides details about the device as a Resource.

### Usage

Use `DefaultResource.get()` to generate an all-in-one resource object. This
resource can be added to a `TracerProvider` or `MetricProvider`.

```swift
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
            .with(resource: DefaultResource.get())
            .build())
```

### Details

`SDKResourceExtension` provides attributes in a resource object with details
about the iOS device, OS details, and application details. It applies these
values to the appropriate
[semantic attributes](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value).

#### Application Info

| Attribute           | Value example                 | Description                                                                                              |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `service.name`      | `MyApplication`               | `CFBundleName`; The application name defined in the App's info.plist.                                    |
| `service.version`   | `1.0 (1234)`                  | `CFBundleShortVersion` & (`CFBundleVersion`); The application version as defined in the App's info.plist |
| `service.namespace` | `com.myCompany.myApplication` | `CFBundleIdentifier`                                                                                     |

#### Device Info

| Attribute                 | Value example           | Description                                    |
| ------------------------- | ----------------------- | ---------------------------------------------- |
| `device.model.identifier` | `iphone13,3`            | fetched from `sysctl` depending on device type |
| `device.id`               | `00000000-0000-0000000` | `identifierForVendor` uuid string              |

#### Operating System Info

| Attributes       | Value example                     | Description                                            |
| ---------------- | --------------------------------- | ------------------------------------------------------ |
| `os.type`        | `darwin`                          | predefined in `ResourceAttributes`                     |
| `os.name`        | `iOS`, `watchOS`, `macOS`         | `UIDevice.current.systemName` or dependent on platform |
| `os.version`     | `15.4.0`                          | `ProcessInfo.processInfo.operatingSystemVersion`       |
| `os.description` | `iOS Version 15.4 (Build 19E240)` | A combination of os name, version and build.           |

## `NSURLSession` instrumentation

This instrumentation creates spans for all network requests made with
NSURLSessions. It also injects distributed tracing headers in instrumented
network requests. `NetworkStatus` is a dependency of this package, which
provides network status attributes on network spans.

Note: The NSURLSession instrumentation relies on the global tracer provider in
the OpenTelemetry object. Custom tracer providers must be configured and set as
the global provider prior to this instrumentation.

### Usage

Initialize the class with
`URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())`
to automatically capture all network calls.

This behavior can be modified or augmented by using the optional callbacks
defined in `URLSessionInstrumentationConfiguration`:

- `shouldInstrument: ((URLRequest) -> (Bool)?)?`

  Filter which requests you want to instrument, all by default.

- `shouldRecordPayload: ((URLSession) -> (Bool)?)?`

  Implement if you want the session to record payload data, false by default.

- `shouldInjectTracingHeaders: ((URLRequest) -> (Bool)?)?`

  Allow filtering which requests you want to inject headers to follow the trace,
  true by default. You must also return true if you want to inject custom
  headers.

- `injectCustomHeaders: ((inout URLRequest, Span?) -> Void)?`

  Implement this callback to inject custom headers or modify the request in any
  other way.

- `nameSpan: ((URLRequest) -> (String)?)?`

  Modify the name for the given request instead of standard OpenTelemetry name.

- `createdRequest: ((URLRequest, Span) -> Void)?`

  Called after request is created, it allows to add extra information to the
  Span.

- `receivedResponse: ((URLResponse, DataOrFile?, Span) -> Void)?`

  Called after response is received, it allows to add extra information to the
  Span.

- `receivedError: ((Error, DataOrFile?, HTTPStatus, Span) -> Void)?`

  Called after an error is received, it allows to add extra information to the
  Span.

Below is an example of initialization.
`URLSessionInstrumentationConfiguration`'s construction can be passed the
parameters defined above to suit the needs of the application.

```swift
let sessionInstrumentation = URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())
```

### Details

`NSURLSession` instrumentation also provides additional attributes providing
details about the network state of the device at the time of network requests.

| Attribute                     | Value example                 | Description                                                                                 |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| `net.host.connection.type`    | `wifi`, `cell`, `unavailable` | The type of connection utilized by the device at the time of the request.                   |
| `net.host.connection.subtype` | `EDGE` `LTE`, etc             | They type of cellular connection. Only populated if the connection type is `cell`.          |
| `net.host.carrier.name`       | `T-Mobile`, `Verizon`, etc    | The cellular carrier name. Only populated for cellular connection types.                    |
| `net.host.carrier.icc`        | `DE`                          | The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network. |
| `net.host.carrier.mcc`        | `310`                         | Mobile Country Code                                                                         |
| `net.host.carrier.mnc`        | `001`                         | Mobile network code                                                                         |

## `SignpostIntegration`

This package creates `os_signpost` `begin` and `end` calls when spans are
started or ended. It allows automatic integration of applications instrumented
with OpenTelemetry to show their spans in a profiling app like `Instruments`. It
also exports the `OSLog` it uses for posting so the user can add extra signpost
events. This functionality is shown in `Simple Exporter` example.

### Version Notice

- **iOS 15+, macOS 12+, tvOS 15+, watchOS 8+**: Use
  **`OSSignposterIntegration`**, which utilizes the modern `OSSignposter` API
  for improved efficiency and compatibility.
- **Older systems**: Use **`SignPostIntegration`**, which relies on the
  traditional `os_signpost` API.

### Usage

Add the appropriate span processor based on your deployment target (see the
[manual instrumentation](../instrumentation/)) docs for details on configuring
your providers:

#### For iOS 15+, macOS 12+, tvOS 15+, watchOS 8+:

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
```

#### For older systems

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
```

#### Or, to select automatically at runtime:

```swift
if #available(iOS 15, macOS 12, tvOS 15, watchOS 8, *) {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
} else {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
}
```

## Available instrumentation libraries

A full list of instrumentation libraries produced by OpenTelemetry is available
from the
[opentelemetry-swift](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation)
repository.

You can also find more instrumentations available in the
[registry](/ecosystem/registry/?language=swift&component=instrumentation).

## Next steps

After you have set up instrumentation libraries, you might want to add your own
[instrumentation](/docs/languages/swift/instrumentation) to your code, to
collect custom telemetry data.

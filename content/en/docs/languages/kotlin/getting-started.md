---
title: Getting Started
description: Get started with the OpenTelemetry Kotlin SDK
weight: 10
---

OpenTelemetry Kotlin provides a
[Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) implementation of
the [OpenTelemetry specification](/docs/specs/otel/).

## OpenTelemetry Kotlin SDK

### Supported platforms

OpenTelemetry Kotlin currently requires Kotlin 2.0 or greater. Currently
supported platforms and their prerequisites are listed below:

| Platform   | Prerequisite |
| ---------- | ------------ |
| Android    | minSdk >=21  |
| JVM.       | JDK >= 11    |
| iOS        | 16.0         |
| JavaScript | ES5          |

### API stability

The API is currently subject to breaking change without notice and most symbols
require an opt-in. You can opt-in on a case-by-case basis by adding
`@OptIn(ExperimentalApi::class)` at each call site.

Alternatively, you can opt-in for your whole module or project by altering
Kotlin's compiler arguments:

```kotlin
kotlin.compilerOptions {
    optIn.add("io.opentelemetry.kotlin.ExperimentalApi")
}
```

### Supported modes

OpenTelemetry Kotlin's API operates in 2 modes:

1. Regular mode, which captures telemetry with a Kotlin Multiplatform (KMP)
   implementation. This is available for all targets.
2. Compatibility mode, which acts as a façade for the
   [OpenTelemetry Java SDK](https://github.com/open-telemetry/opentelemetry-java).
   This is available for JVM/Android targets only.

## Install OpenTelemetry Kotlin

Firstly, choose whether to follow the regular or compatibility mode guide below.

### Use regular mode

1. Add these dependencies to the `build.gradle` of the module that initializes
   the SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:implementation:$otelKotlinVersion")
}
```

1. Initialize the SDK early in your application lifecycle:

```kotlin
val otelKotlin: OpenTelemetry = createOpenTelemetry {
    // configure SDK here
}
```

1. Use the Kotlin API in your app.

### Use compatibility mode

Compatibility mode allows you to use a Kotlin API that uses the OpenTelemetry
Java SDK under the hood. This can be helpful if you already use the Java
implementation or don't want to use the Kotlin implementation.

1. Add these dependencies to the `build.gradle` of the module that initializes
   the SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:compat:$otelKotlinVersion")
}
```

1. Wrap your existing
   [OpenTelemetry Java](https://github.com/open-telemetry/opentelemetry-java)
   instance:

```kotlin
val otelJava = io.opentelemetry.sdk.OpenTelemetrySdk.builder().build()
val otelKotlin: OpenTelemetry = otelJava.toOtelKotlinApi()

// alternatively, create an instance that uses opentelemetry-java under the hood
val otelKotlin: OpenTelemetry = createCompatOpenTelemetry {
    // configure SDK here
}
```

1. Use the Kotlin API alongside or instead of the Java API in your app.

### Setup other modules

Next, add the `api` and `noop` dependencies to the `build.gradle` of all modules
you want to instrument:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:api:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:noop:$otelKotlinVersion")
}
```

> [!NOTE]
>
> Do not add the `core`, `compat`, or `implementation` dependencies in a module
> unless you need to initialize the SDK. This ensures that you are writing
> instrumentation solely against OpenTelemetry's
> [Instrumentation API](/docs/specs/otel/overview/#api).

#### How can I instrument my app?

A minimal example that emits a log and a trace is shown below:

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // emits a log
    val logger = otel.loggerProvider.getLogger("my_logger")
    logger.log("Hello, World!")

    // starts then ends a span
    val tracer = otel.tracerProvider.getTracer("my_tracer)
    tracer.startSpan("my_span").end()
}
```

To emit telemetry simply pass a real instance of `OpenTelemetry` as a parameter
rather than a no-op. If you're a library author, this pattern is very useful as
it allows your library consumers to opt-in to capturing telemetry from your
library.

### Export to an OpenTelemetry Collector

As a final step, you likely need to configure telemetry export over
[OTLP/HTTP](/docs/specs/otel/protocol/) to an OpenTelemetry Collector, or a
backend that accepts OTLP. Add the `exporters-otlp` dependency in the module
where you initialized the SDK:

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:exporters-otlp:$otelKotlinVersion")
}
```

Then configure OTLP exporters with a batch processor:

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

Congratulations! You've completed the installation steps for the OpenTelemetry
Kotlin SDK.

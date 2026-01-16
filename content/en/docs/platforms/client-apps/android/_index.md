---
title: Android
description: >-
  Use OpenTelemetry in apps running on Android platforms
weight: 10
cascade:
  vers:
    instrumentation: 1.0.1
cSpell:ignore: inactivity
---

OpenTelemetry Android provides observability for native Android applications.
Built on top of the [OpenTelemetry Java](/docs/languages/java/) ecosystem, it
offers automatic instrumentation, real user monitoring (RUM), and manual
instrumentation capabilities tailored for mobile environments.

## Features

OpenTelemetry Android includes these key capabilities:

- **Automatic Instrumentation**: Built-in modules for common Android patterns:
  - Activity lifecycle
  - Fragment lifecycle
  - ANR (Application Not Responding) detection
  - Crash reporting
  - Network change detection
  - Slow/frozen frame rendering detection
  - Startup timing
  - Screen orientation
  - View click events
- **Session Management**: Track user sessions with configurable inactivity
  timeouts and maximum session lifetimes.
- **Offline Buffering**: Disk persistence to buffer telemetry data when the
  device is offline, ensuring no data loss during network outages.
- **Attribute Redaction**: Capability to redact or modify span attributes before
  export for privacy compliance.

## Getting started

### Prerequisites

- Android SDK 21 (Lollipop) or higher
- Gradle project using Kotlin (Java may be possible)

### Gradle setup

Add the OpenTelemetry Android Agent dependency to your app-level
`build.gradle.kts` file. Use the Bill of Materials (BOM) to manage versions:

```kotlin
dependencies {
    implementation(platform("io.opentelemetry.android:opentelemetry-android-bom:{{% param vers.instrumentation %}}"))
    implementation("io.opentelemetry.android:android-agent")
}
```

> [!NOTE]
>
> Check the
> [OpenTelemetry Android releases](https://github.com/open-telemetry/opentelemetry-android/releases)
> for the latest version.

### Initialize the agent

Initialize OpenTelemetry in your `Application` class's `onCreate()` method:

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
                // All instrumentations are enabled by default.
                // Disable specific ones as needed:
                slowRendering { enabled(false) }
            }
            session {
                backgroundInactivityTimeout = 15.minutes
                maxLifetime = 4.days
            }
        }
    )
```

## Configuration

OpenTelemetry Android uses a Kotlin DSL for configuration, as shown in the
initialization example above. The following table describes the available
configuration options:

### Configuration options

| Block                                     | Description                                       |
| ----------------------------------------- | ------------------------------------------------- |
| `httpExport { baseUrl }`                  | OTLP endpoint URL for exporting telemetry         |
| `httpExport { baseHeaders }`              | Custom headers to include with export requests    |
| `globalAttributes`                        | Attributes added to all telemetry                 |
| `session { backgroundInactivityTimeout }` | Inactivity timeout before starting a new session  |
| `session { maxLifetime }`                 | Maximum session lifetime                          |
| `instrumentations`                        | Configure individual auto-instrumentation modules |

## Automatic instrumentation

OpenTelemetry Android provides automatic instrumentation modules that you can
enable or disable. For detailed information about each instrumentation,
including emitted telemetry and configuration options, see the linked
documentation.

### Activity lifecycle

Automatically captures spans for Activity lifecycle events (`onCreate`,
`onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`). See
[Activity instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/activity/README.md).

### Fragment lifecycle

Captures spans for Fragment lifecycle events, useful for tracking navigation
within single-activity architectures. See
[Fragment instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/fragment/README.md).

### ANR detection

Detects Application Not Responding (ANR) conditions and reports them as spans,
helping identify UI thread blocking issues. See
[ANR instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/anr/README.md).

### Crash reporting

Captures unhandled exceptions and reports them with stack traces, allowing you
to correlate crashes with user sessions and traces. See
[Crash instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/crash/README.md).

### Network monitoring

Detects network state changes and adds connectivity information to telemetry,
helping you understand the network conditions during errors. See
[Network instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/network/README.md).

### Slow and frozen frames

Monitors frame rendering performance and reports slow renders (>16ms) and frozen
frames (>700ms) to help identify UI jank. See
[Slow rendering instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/slowrendering/README.md).

## Manual instrumentation

Access the OpenTelemetry API for manual instrumentation:

```kotlin
val openTelemetry = openTelemetryRum.openTelemetry
val tracer = openTelemetry.getTracer("com.example.myapp")

val span = tracer.spanBuilder("my-operation")
    .startSpan()

try {
    span.makeCurrent().use {
        // Your code here
    }
} finally {
    span.end()
}
```

## HTTP client instrumentation

Instrument OkHttp clients to trace network requests:

```kotlin
val okHttpClient = OkHttpTelemetry.builder(openTelemetryRum.openTelemetry)
    .build()
    .newCallFactory(OkHttpClient.Builder().build())
```

## Best practices

### Resource constraints

Mobile devices have limited resources. Consider these best practices:

- **Batch exports**: Batch processing is enabled by default to reduce network
  calls and battery consumption.
- **Sampling**: Implement sampling strategies to reduce data volume while
  maintaining representative telemetry.
- **Offline buffering**: Disk persistence is enabled by default to handle
  intermittent connectivity.

### Privacy considerations

- Use attribute redaction to remove sensitive data before export.
- Consider user consent requirements for collecting telemetry.
- Avoid capturing personally identifiable information (PII) in span names or
  attributes.

### Testing

When testing with an emulator, use `10.0.2.2` as the host address to reach your
local machine's collector:

```kotlin
httpExport {
    baseUrl = "http://10.0.2.2:4318"
}
```

## Resources

- [OpenTelemetry Android GitHub](https://github.com/open-telemetry/opentelemetry-android)
- [OpenTelemetry Java documentation](/docs/languages/java/)
- [Android semantic conventions](/docs/specs/semconv/registry/attributes/android/)
- [Example applications](https://github.com/open-telemetry/opentelemetry-android/tree/main/demo-app)

## Help and feedback

If you have questions, reach out via
[GitHub Issues](https://github.com/open-telemetry/opentelemetry-android/issues)
or the [#otel-android](https://cloud-native.slack.com/archives/C05J0T9K27Q)
channel on [CNCF Slack](https://slack.cncf.io/).

---
title: Android
description: >-
  Use OpenTelemetry in apps running on Android platforms
weight: 10
cSpell:ignore: inactivity
---

OpenTelemetry Android provides observability for native Android applications.
Built on top of the [OpenTelemetry Java](/docs/languages/java/) ecosystem, it
offers automatic instrumentation, real user monitoring (RUM), and manual
instrumentation capabilities tailored for mobile environments.

## Features

OpenTelemetry Android includes these key capabilities:

- **Automatic Instrumentation**: Built-in modules for common Android patterns
  including Activity lifecycle, Fragment lifecycle, ANR (Application Not
  Responding) detection, crash reporting, network change detection, slow/frozen
  frame rendering detection, startup timing, screen orientation, and view click
  events.
- **Session Management**: Track user sessions with configurable inactivity
  timeouts and maximum session lifetimes.
- **Offline Buffering**: Disk persistence to buffer telemetry data when the
  device is offline, ensuring no data loss during network outages.
- **Attribute Redaction**: Capability to redact or modify span attributes before
  export for privacy compliance.

## Getting started

### Prerequisites

- Android SDK 21 (Lollipop) or higher
- Kotlin or Java project using Gradle

### Gradle setup

Add the OpenTelemetry Android Agent dependency to your app-level
`build.gradle.kts` file. Use the Bill of Materials (BOM) to manage versions:

```kotlin
dependencies {
    implementation(platform("io.opentelemetry.android:opentelemetry-android-bom:0.9.0"))
    implementation("io.opentelemetry.android:android-agent")
}
```

{{% alert title="Note" %}} Check the
[OpenTelemetry Android releases](https://github.com/open-telemetry/opentelemetry-android/releases)
for the latest version. {{% /alert %}}

### Initialize the agent

Initialize OpenTelemetry in your `Application` class's `onCreate()` method:

{{< tabpane text=true >}} {{% tab Kotlin %}}

```kotlin
import android.app.Application
import android.util.Log
import io.opentelemetry.android.OpenTelemetryRum
import io.opentelemetry.android.config.OtelRumConfig
import io.opentelemetry.api.common.Attributes
import io.opentelemetry.api.common.AttributeKey.stringKey
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.minutes

class MyApplication : Application() {
    lateinit var openTelemetryRum: OpenTelemetryRum

    override fun onCreate() {
        super.onCreate()
        openTelemetryRum = initializeOpenTelemetry()
    }

    private fun initializeOpenTelemetry(): OpenTelemetryRum {
        return OpenTelemetryRum.builder(this)
            .setEndpointUrl("https://your-collector-endpoint:4318")
            .addGlobalAttributes(
                Attributes.of(
                    stringKey("app.version"), BuildConfig.VERSION_NAME
                )
            )
            .build()
    }
}
```

{{% /tab %}} {{% tab Java %}}

```java
import android.app.Application;
import io.opentelemetry.android.OpenTelemetryRum;
import io.opentelemetry.api.common.Attributes;
import static io.opentelemetry.api.common.AttributeKey.stringKey;

public class MyApplication extends Application {
    private OpenTelemetryRum openTelemetryRum;

    @Override
    public void onCreate() {
        super.onCreate();
        openTelemetryRum = initializeOpenTelemetry();
    }

    private OpenTelemetryRum initializeOpenTelemetry() {
        return OpenTelemetryRum.builder(this)
            .setEndpointUrl("https://your-collector-endpoint:4318")
            .addGlobalAttributes(
                Attributes.of(
                    stringKey("app.version"), BuildConfig.VERSION_NAME
                )
            )
            .build();
    }
}
```

{{% /tab %}} {{< /tabpane >}}

Don't forget to register your custom `Application` class in
`AndroidManifest.xml`:

```xml
<application
    android:name=".MyApplication"
    ... >
</application>
```

## Configuration

OpenTelemetry Android supports configuration through a Kotlin DSL or builder
pattern:

```kotlin
OpenTelemetryRum.builder(context)
    .setEndpointUrl("https://your-collector-endpoint:4318")
    .addHeaders(mapOf("Authorization" to "Bearer <token>"))
    .addGlobalAttributes(Attributes.of(stringKey("environment"), "production"))
    .setSessionTimeout(15.minutes)
    .build()
```

### Configuration options

| Option                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `setEndpointUrl`      | OTLP endpoint URL for exporting telemetry        |
| `addHeaders`          | Custom headers to include with export requests   |
| `addGlobalAttributes` | Attributes added to all telemetry                |
| `setSessionTimeout`   | Inactivity timeout before starting a new session |

## Automatic instrumentation

OpenTelemetry Android provides automatic instrumentation modules that you can
enable or disable:

### Activity lifecycle

Automatically captures spans for Activity lifecycle events (`onCreate`,
`onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`).

### Fragment lifecycle

Captures spans for Fragment lifecycle events, useful for tracking navigation
within single-activity architectures.

### ANR detection

Detects Application Not Responding (ANR) conditions and reports them as spans,
helping identify UI thread blocking issues.

### Crash reporting

Captures unhandled exceptions and reports them with stack traces, allowing you
to correlate crashes with user sessions and traces.

### Network monitoring

Detects network state changes and adds connectivity information to telemetry,
helping you understand the network conditions during errors.

### Slow and frozen frames

Monitors frame rendering performance and reports slow renders (>16ms) and frozen
frames (>700ms) to help identify UI jank.

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
import io.opentelemetry.instrumentation.okhttp.v3_0.OkHttpTelemetry

val okHttpClient = OkHttpTelemetry.builder(openTelemetryRum.openTelemetry)
    .build()
    .newCallFactory(OkHttpClient.Builder().build())
```

## Best practices

### Resource constraints

Mobile devices have limited resources. Consider these best practices:

- **Batch exports**: Use batch processing to reduce network calls and battery
  consumption.
- **Sampling**: Implement sampling strategies to reduce data volume while
  maintaining representative telemetry.
- **Offline buffering**: Enable disk persistence to handle intermittent
  connectivity.

### Privacy considerations

- Use attribute redaction to remove sensitive data before export.
- Consider user consent requirements for collecting telemetry.
- Avoid capturing personally identifiable information (PII) in span names or
  attributes.

### Testing

When testing with an emulator, use `10.0.2.2` as the host address to reach your
local machine's collector:

```kotlin
.setEndpointUrl("http://10.0.2.2:4318")
```

## Resources

- [OpenTelemetry Android GitHub](https://github.com/open-telemetry/opentelemetry-android)
- [OpenTelemetry Java documentation](/docs/languages/java/)
- [Android semantic conventions](/docs/specs/semconv/registry/attributes/android/)
- [Example applications](https://github.com/open-telemetry/opentelemetry-android/tree/main/demo-app)

## Help and feedback

If you have questions, reach out via
[GitHub Discussions](https://github.com/open-telemetry/opentelemetry-android/discussions)
or the [#otel-android] channel on [CNCF Slack](https://slack.cncf.io/).

[#otel-android]: https://cloud-native.slack.com/archives/C05J0T9K27Q

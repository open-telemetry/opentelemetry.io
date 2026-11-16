---
title: Configure OpenTelemetry Kotlin
linkTitle: Configure the SDK
weight: 13
---

The OpenTelemetry Kotlin SDK is configured at initialization through its DSL
parameter. Both `createOpenTelemetry` and `createCompatOpenTelemetry` use the
same DSL, a full example of which is shown below:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    // configure SDK here
}
```

The following sections show how to configure different aspects of the SDK's
behavior. This is not an exhaustive list of ways to configure the SDK; rather it
attempts to highlight the most common use cases.

## Export

### Exporting telemetry via OTLP

OpenTelemetry Kotlin supports exporting via
[OTLP](/docs/specs/otel/protocol/exporter/) over HTTP in binary encoding. Logs
and traces can be exported with the following configuration, which sends data to
the default port for the [OpenTelemetry Collector](/docs/collector/):

```kotlin
val baseUrl = "http://localhost:4318"
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        export {
            batchSpanProcessor(
                otlpHttpSpanExporter {
                    endpoint = baseUrl
                }
            )
        }
    }
    loggerProvider {
        export {
            batchLogRecordProcessor(
                otlpHttpLogRecordExporter {
                    endpoint = baseUrl
                }
            )
        }
    }
}
```

If `endpoint` isn't set, the exporters read the `OTEL_EXPORTER_OTLP_ENDPOINT`
environment variable (or the signal-specific
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` and `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`),
and otherwise default to `http://localhost:4318`.

## Resource

[Resources](../../../concepts/resources) can be configured globally to add
attributes to all signals:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    serviceName = "checkout"

    resource(schemaUrl = "https://opentelemetry.io/schemas/1.30.0") {
        setStringAttribute("service.namespace", "payments")
        setBooleanAttribute("feature.experimental_checkout", true)
        setLongAttribute("service.instance.replica", 3)
        setDoubleAttribute("rollout.percentage", 0.25)
        setStringListAttribute("service.tags", listOf("checkout", "v2"))
    }

    tracerProvider {
        resource {}
    }
}
```

It's also possible to scope a resource to a single signal. This is merged with
any global configuration (local takes priority):

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        resource {
            setStringAttribute("service.namespace", "payments")
        }
    }
}
```

Syntactic sugar also allows setting the Resources from a `Map<String, Any>`:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    resource(mapOf("service.namespace" to "payments"))
}
```

By default, the SDK always sets `service.name`, `service.version`, and
`telemetry.sdk.*`. These can be overridden by supplying your own value.

## Limits

### Attribute limits

[Attribute limits](/docs/specs/otel/common/#attribute-limits) limit the number
of attributes and the length of their values in characters. These can be
configured globally as shown below:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    attributeLimits {
        attributeCountLimit = 200
        attributeValueLengthLimit = 256
    }
}
```

### Log Limits

[Log Limits](/docs/specs/otel/logs/sdk/#logrecord-limits) act similarly to the
[attribute limits](#attribute-limits) section, but are local to log records:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    loggerProvider {
        logLimits {
            attributeCountLimit = 200
            attributeValueLengthLimit = 256
        }
    }
}
```

### Span Limits

[Span Limits](/docs/specs/otel/trace/sdk/#span-limits) provide the same limits
as previously shown in the [attribute limits](#attribute-limits) section, and
also provide configuration that restricts how many links and events are
captured:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        spanLimits {
            linkCountLimit = 200
            eventCountLimit = 250
            attributeCountPerEventLimit = 50
            attributeCountPerLinkLimit = 20
            attributeCountLimit = 200
            attributeValueLengthLimit = 256
        }
    }
}
```

## Current context storage

As described in the
[current context instrumentation guide](/docs/languages/kotlin/instrumentation/#using-current-context)
it's possible to alter the default mechanism that stores the current context. By
default this is stored in a global, process-wide mechanism, but can be changed
to thread-local via `storageMode`:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    context {
        storageMode = CurrentContextStorageMode.THREAD_LOCAL
    }
}
```

You can implement custom storage mechanisms too. The `storage` function receives
a `rootSupplier` that provides the root `Context`. The example below implements
the same behavior as OpenTelemetry Kotlin's default approach to global context
storage:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    context {
        storage { rootSupplier -> MyCustomStorage(rootSupplier) }
    }
}

class MyCustomStorage(
    private val rootSupplier: () -> Context,
) : CurrentContextStorage {

    @Volatile
    private var current: Context? = null

    override fun current(): Context = current ?: rootSupplier()

    override fun attach(context: Context): Scope {
        val previous = current
        current = context
        return object : Scope {
            override fun detach(): Boolean {
                current = previous
                return true
            }
        }
    }
}
```

---
title: Налаштування OpenTelemetry Kotlin
linkTitle: Налаштування SDK
weight: 13
default_lang_commit: 5f6c57b59b2c0d705b50c089eeed8c2ef2eaff55
---

SDK OpenTelemetry Kotlin налаштовується під час ініціалізації за допомогою його параметра DSL. І `createOpenTelemetry`, і `createCompatOpenTelemetry` використовують той самий DSL, повний приклад якого наведено нижче:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    // configure SDK here
}
```

Наступні розділи показують, як налаштувати різні аспекти поведінки SDK. Це не вичерпний перелік способів налаштування SDK, скоріше тут висвітлено найчастіші випадки використання.

## Експорт {#export}

### Експорт телеметрії через OTLP {#exporting-telemetry-via-otlp}

OpenTelemetry Kotlin підтримує експорт через [OTLP](/docs/specs/otel/protocol/exporter/) поверх HTTP у двійковому кодуванні. Логи та траси можна експортувати за допомогою наведеної нижче конфігурації, яка надсилає дані до типового порту [OpenTelemetry Collector](/docs/collector/):

```kotlin
val baseUrl = "http://localhost:4318"
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        export {
            batchSpanProcessor(otlpHttpSpanExporter(baseUrl))
        }
    }
    loggerProvider {
        export {
            batchLogRecordProcessor(otlpHttpLogRecordExporter(baseUrl))
        }
    }
}
```

## Ресурс {#resource}

[Ресурси](../../../concepts/resources) можна налаштувати глобально, щоб додати атрибути до всіх сигналів:

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

Ресурс також можна обмежити одним сигналом. Його обʼєднують із будь-якою глобальною конфігурацією, причому локальна має пріоритет:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        resource {
            setStringAttribute("service.namespace", "payments")
        }
    }
}
```

Синтаксичний цукор також дозволяє задавати ресурси з `Map<String, Any>`:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    resource {
        resource(mapOf("service.namespace" to "payments"))
    }
}
```

За замовчуванням SDK завжди встановлює `service.name`, `service.version` і `telemetry.sdk.*`. Ці значення можна перевизначити, надавши власні.

## Обмеження {#limits}

### Обмеження атрибутів {#attribute-limits}

[Обмеження атрибутів](/docs/specs/otel/common/#attribute-limits) обмежують кількість атрибутів і довжину їхніх значень у символах. Їх можна налаштувати глобально, як показано нижче:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    attributeLimits {
        attributeCountLimit = 200
        attributeValueLengthLimit = 256
    }
}
```

### Обмеження для логів {#log-limits}

[Обмеження для логів](/docs/specs/otel/logs/sdk/#logrecord-limits) діють подібно до розділу [обмеження атрибутів](#attribute-limits), але стосуються записів логів:

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

### Обмеження для відрізків {#span-limits}

[Обмеження для відрізків](/docs/specs/otel/trace/sdk/#span-limits) надають ті самі обмеження, що й раніше в розділі [обмеження атрибутів](#attribute-limits), а також конфігурацію, яка обмежує кількість відрізків і подій, що захоплюються:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        spanLimits = 200
        eventCountLimit = 250
        attributeCountPerEventLimit = 50
        attributeCountPerLinkLimit = 20
        attributeCountLimit = 200
        attributeValueLengthLimit = 256
    }
}
```

## Неявне зберігання контексту {#implicit-context-storage}

Як описано в [посібнику з інструментування неявного контексту](/docs/languages/kotlin/instrumentation/#using-implicit-context), можна змінити типовий механізм зберігання неявного контексту. За замовчуванням його зберігають у глобальному механізмі на весь процес, але за допомогою `storageMode` це можна змінити на thread-local:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    context {
        storageMode = ImplicitContextStorageMode.THREAD_LOCAL
        // storage { MyCustomStorage() }
    }
}
```

Ви також можете реалізувати власні механізми зберігання. Нижчий приклад відтворює ту саму поведінку, що й типовий підхід OpenTelemetry Kotlin до глобального зберігання контексту:

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    context {
        storage { MyCustomStorage() }
    }
}

class CustomStorage(private val default: Context): ImplicitContextStorage {

    private var ref: Context = default

    override fun setImplicitContext(context: Context) {
        ref = context
    }

    override fun implicitContext(): Context = ref
}
```

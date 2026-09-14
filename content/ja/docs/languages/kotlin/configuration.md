---
title: OpenTelemetry Kotlin の設定
linkTitle: SDK の設定
weight: 13
default_lang_commit: f2a4b7cb9db81fb72aebf4019f6974ce8ede59de
---

OpenTelemetry Kotlin SDK は、DSL パラメーターを通じて初期化時に設定されます。
`createOpenTelemetry` と `createCompatOpenTelemetry` はどちらも同じ DSL を使用し、完全な例を以下に示します。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    // ここで SDK を設定する
}
```

以下のセクションでは、SDK の動作のさまざまな側面を設定する方法を示します。
これは SDK を設定する方法の網羅的なリストではなく、最も一般的なユースケースを取り上げています。

## エクスポート {#export}

### OTLP によるテレメトリーのエクスポート {#exporting-telemetry-via-otlp}

OpenTelemetry Kotlin は、HTTP 上のバイナリエンコーディングによる [OTLP](/docs/specs/otel/protocol/exporter/) でのエクスポートをサポートしています。
ログとトレースは以下の設定でエクスポートでき、[OpenTelemetry Collector](/docs/collector/) のデフォルトポートにデータを送信します。

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

## リソース {#resource}

[リソース](../../../concepts/resources)をグローバルに設定して、すべてのシグナルに属性を追加できます。

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

リソースを単一のシグナルにスコープすることも可能です。
これはグローバル設定とマージされます（ローカルが優先されます）。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    tracerProvider {
        resource {
            setStringAttribute("service.namespace", "payments")
        }
    }
}
```

糖衣構文により、`Map<String, Any>` からリソースを設定することもできます。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    resource {
        resource(mapOf("service.namespace" to "payments"))
    }
}
```

デフォルトでは、SDK は常に `service.name`、`service.version`、`telemetry.sdk.*` を設定します。
これらは独自の値を指定することで上書きできます。

## 制限 {#limits}

### 属性の制限 {#attribute-limits}

[属性の制限](/docs/specs/otel/common/#attribute-limits)は、属性の数と属性値の文字数を制限します。
以下のようにグローバルに設定できます。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    attributeLimits {
        attributeCountLimit = 200
        attributeValueLengthLimit = 256
    }
}
```

### ログの制限 {#log-limits}

[ログの制限](/docs/specs/otel/logs/sdk/#logrecord-limits)は[属性の制限](#attribute-limits)セクションと同様に機能しますが、ログレコードに限定されます。

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

### スパンの制限 {#span-limits}

[スパンの制限](/docs/specs/otel/trace/sdk/#span-limits)は[属性の制限](#attribute-limits)セクションで示したものと同じ制限を提供し、さらにキャプチャされるスパンとイベントの数を制限する設定も提供します。

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

## 暗黙的コンテキストストレージ {#implicit-context-storage}

[暗黙的コンテキストの計装ガイド](/docs/languages/kotlin/instrumentation/#using-implicit-context)で説明されているように、暗黙的コンテキストを格納するデフォルトのメカニズムを変更できます。
デフォルトではグローバルなプロセス全体のメカニズムに格納されますが、`storageMode` でスレッドローカルに変更できます。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    context {
        storageMode = ImplicitContextStorageMode.THREAD_LOCAL
        // storage { MyCustomStorage() }
    }
}
```

カスタムストレージメカニズムを実装することもできます。
以下の例は、OpenTelemetry Kotlin のグローバルコンテキストストレージに対するデフォルトのアプローチと同じ動作を実装しています。

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

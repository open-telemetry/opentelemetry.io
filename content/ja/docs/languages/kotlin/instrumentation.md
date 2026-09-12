---
title: 計装
weight: 11
aliases:
  - manual
  - manual_instrumentation
description: OpenTelemetry Kotlin の手動計装
default_lang_commit: e358f6a20be1341939fe50816902dd284c60bb16
---

{{% include instrumentation-intro.md %}}

## 安定性 {#stability}

OpenTelemetry Kotlin の API は安定版に達しておらず、破壊的変更が加わる可能性があります。
詳細については、Getting Started ガイドの [API 安定性のセクション](../getting-started#api-stability)を参照してください。

OpenTelemetry の Tracing API と Logging API は利用可能ですが、Metrics API はまだサポートされていません。

API 上のすべてのタイムスタンプはナノ秒単位です。

## セットアップ {#setup}

計装を記述するときは、[Getting Started ガイド](../getting-started#setup-other-modules)に記載されているとおり、API モジュールと noop モジュールのみに依存すべきです。
`OpenTelemetry` インターフェイスは、アプリケーション内の呼び出し元にパラメーターまたはプロパティとして注入する必要があります。
これが計装を記述するための主要なエントリーポイントです。

便利なパターンとして、Kotlin のデフォルトパラメーターを使用して no-op 実装を提供する方法があります。
これは任意ですが、SDK の初期化を担当していない場合や、OpenTelemetry を条件付きで有効にする場合に役立ちます。

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // OpenTelemetry インスタンスからトレーサーを取得
    val tracer = otel.getTracer("com.example.myclient")
}
```

## Logging API の使用 {#using-the-logging-api}

### Logger の取得 {#obtain-a-logger}

まず、`OpenTelemetry` インスタンスから `Logger` を取得します。
指定する名前は[計装スコープ](/docs/specs/otel/common/instrumentation-scope/)を識別します。

```kotlin
val logger = otel.loggerProvider.getLogger("com.example.myclient")

// シンタックスシュガーを使用することもできます
val logger = otel.getLogger("com.example.myclient")
```

`version`、`schemaUrl`、`attributes` はオプションで指定でき、キャプチャされたテレメトリーに関連付けられます。

```kotlin
val tracer = otel.getTracer(
    name = "com.example.myclient",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### シンプルなログレコードの出力 {#emit-a-simple-log-record}

`Logger` の参照を使用して、以下のようにシンプルなログレコードを出力できます。

```kotlin
logger.emit(
    body = "Hello, World!"
)
```

### ログレコードのカスタマイズ {#customize-the-log-record}

`emit` はログレコードのキャプチャ時にいくつかの他のパラメーターを受け付けます。
これらの詳細は [Logger API 仕様](/docs/specs/otel/logs/api/#emit-a-logrecord)に記載されています。

#### 重大度の指定 {#specify-the-severity}

`severityNumber` と `severityText` を指定して、ログレコードに関連付けられる重大度を変更します。

```kotlin
logger.emit(
    body = "Hello, World!"
    severityNumber: SeverityNumber? = SeverityNumber.INFO,
    severityText: String? = "INFO"
)
```

#### タイムスタンプの指定 {#specify-the-timestamps}

`timestamp` と `observedTimestamp` を指定して、ログレコードに関連付けられるタイムスタンプを変更します。

```kotlin
logger.emit(
    body = "Hello, World!"
    timestamp = 100,
    observedTimestamp = 90,
)
```

#### 例外の指定 {#specify-the-exception}

イベントに `Throwable` が関連付けられている場合は、`exception` を指定します。

```kotlin
fun example(logger: Logger) {
    try {
        performFoo()
    } catch (exc: IllegalStateException) {
        logger.emit(
            body = "Hello, World!"
            exception = IllegalStateException("my exception")
        )
    }
}
```

#### イベント名の指定 {#specify-the-event-name}

ログレコードが OpenTelemetry の[イベント](/docs/specs/otel/logs/data-model/#field-eventname)である場合は、`eventName` を指定します。

```kotlin
logger.emit(
    body = "Hello, World!"
    eventName = "event_name"
)
```

#### コンテキストの指定 {#specify-the-context}

ログレコードを特定のコンテキストに関連付けたい場合は、`context` を指定します。
これを指定しない場合、暗黙的なコンテキストが使用されます。

```kotlin
fun example(logger: Logger, ctx: Context) {
    logger.emit(
        body = "Hello, World!"
        context = ctx,
    )
}
```

コンテキストとは何か、およびその使い方についての詳細は、[コンテキストのセクション](#context)を参照してください。

#### 属性の指定 {#specify-the-attributes}

個々のログレコードに特定の属性を関連付けたい場合は、`attributes` パラメーターを指定します。

```kotlin
logger.emit("Hello, World!") {
    setStringAttribute("checkout.id", id)
    setLongAttribute("checkout.duration_ms", duration)
}
```

属性とは何か、およびその使い方についての詳細は、[属性のセクション](#attributes)を参照してください。

## Tracing API の使用 {#using-the-tracing-api}

### Tracer の取得 {#obtain-a-tracer}

まず、`OpenTelemetry` インスタンスから `Tracer` を取得します。
指定する名前は[計装スコープ](/docs/specs/otel/common/instrumentation-scope/)を識別します。

```kotlin
val tracer = otel.tracerProvider.getTracer("com.example.checkout")

// シンタックスシュガーを使用することもできます
val tracer = otel.getTracer("com.example.checkout")
```

`version`、`schemaUrl`、`attributes` はオプションで指定でき、キャプチャされたテレメトリーに関連付けられます。

```kotlin
val tracer = otel.getTracer(
    name = "com.example.checkout",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### シンプルなスパンの開始 {#start-a-simple-span}

`Tracer` の参照を使用して、以下のようにシンプルなスパンを開始および終了できます。

```kotlin
val span: Span = tracer.startSpan(name = "my_span")
```

### スパンの終了 {#end-a-span}

スパンは `end()` を呼び出して完了する必要があります。
呼び出し後は、その `Span` に対する操作は効果がありません。

```kotlin
span.end()
```

明示的な終了時刻を設定したい場合は、`timestamp` を渡します。
デフォルトでは、OpenTelemetry Kotlin は独自のクロックを使用して終了タイムスタンプを設定します。

```kotlin
span.end(timestamp = MyClock.now())
```

### 属性の指定 {#specify-attributes}

個々のスパンに特定の属性を関連付けたい場合は、`attributes` パラメーターを指定します。

```kotlin
val span: Span = tracer.startSpan("my_span") {
    setStringAttribute("checkout.id", id)
}
```

スパンの開始後に属性を設定することも可能です。

```kotlin
span.setStringAttribute("checkout.id", id)
```

属性とは何か、およびその使い方についての詳細は、[属性のセクション](#attributes)を参照してください。

### スパンステータスの設定 {#set-a-span-status}

デフォルトでは、スパンのステータスは `Unset` です。
スパンを明示的に `Ok` または `Error` としてマークでき、オペレーション中に何が問題だったかの説明を付けられます。

以下はスパンを `Ok` としてマークします。

```kotlin
span.setStatus(StatusData.Ok)
```

以下はスパンを `Error` としてマークし、オプションの説明を付けます。

```kotlin
span.setStatus(StatusData.Error("Something went wrong"))
```

### スパンが記録中かどうかの確認 {#check-if-a-span-is-recording}

スパンが記録中かどうかは以下のように確認できます。

```kotlin
if (span.isRecording()) {
    // データを追加
}
```

スパンが記録中でない場合、その関数の呼び出しは no-op になります。

### SpanKind の指定 {#specify-the-spankind}

[SpanKind](/docs/specs/otel/trace/api/#spankind) は以下のように `Span` に設定できます。

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    spanKind = SpanKind.CLIENT
)
```

デフォルトでは `SpanKind` は `INTERNAL` です。

### startTimestamp の指定 {#specify-the-starttimestamp}

`Span` の開始タイムスタンプは明示的に設定できます。

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    startTimestamp = MyClock.now()
)
```

これは、OpenTelemetry が初期化される前に発生したオペレーションのスパンをキャプチャする必要がある場合に役立ちます。

### parentContext の指定 {#specify-the-parentcontext}

スパンを特定のコンテキストに関連付けたい場合は、`context` を指定します。
これを指定しない場合、暗黙的なコンテキストが使用されます。

```kotlin
fun example(tracer: Tracer, ctx: Context) {
    tracer.startSpan(
        name = "my_span"
        parentContext = ctx,
    )
}
```

コンテキストとは何か、およびその使い方についての詳細は、[コンテキストのセクション](#context)を参照してください。

### スパンリンクの指定 {#specify-span-links}

[2つのスパンをリンク](/docs/specs/otel/trace/api/#add-link)したい場合があります。
これは初期化時に行えます。

```kotlin
val span: Span = tracer.startSpan("my_span") {
    addLink(otherSpan)
}
```

スパンの開始後にリンクを追加することも可能です。
スパンリンクに属性を関連付ける `attributes` パラメーターも利用できます。

```kotlin
span.addLink(otherSpan) {
    setStringAttribute("checkout.id", id)
}
```

### スパンでオペレーションをラップする {#wrap-an-operation-with-a-span}

スパンで記録したい同期オペレーションがある場合は、`wrapOperation` を使用してスパンを開始および終了できます。

```kotlin
span.wrapOperation {
    performFoo()
    span.setName(updatedName)
    StatusData.Ok
}
```

`wrapOperation` はラムダ内で任意のオペレーションを実行することで、スパンの開始と終了を自動的に処理するため、リソースリークを心配する必要がありません。
オペレーションが成功したかどうかを示す `StatusData` を返す必要があります。

さらに、`wrapOperation` 内で例外がスローされた場合、自動的に記録され、スパンステータスが `Error` に設定されます。

## 属性 {#attributes}

属性を受け付けるすべてのインターフェイスは同じ構文を持ちます。
型付きセッターを使用できます。

```kotlin
{
    setStringAttribute("string_key", "my_string")
    setBooleanAttribute("bool_key", true)
    setLongAttribute("long_key", 5L)
    setDoubleAttribute("double_key", 3.14)
    setByteArrayAttribute("byte_array_key", ByteArray(0))
    setStringListAttribute("string_list_key", listOf("my_string"))
    setBooleanListAttribute("bool_list_key", listOf(true))
    setLongListAttribute("long_list_key", listOf(5L))
    setDoubleListAttribute("double_list_key", listOf(3.14))
}
```

または、かわりに `Map<String, Any>` を渡すこともできます。

```kotlin
{
    setAttributes(mapOf(
        "string_key" to "my_string",
        "bool_key" to true,
        "long_key" to 5L,
        "double_key" to 3.14,
        "byte_array_key" to ByteArray(0),
        "string_list_key" to listOf("my_string"),
        "bool_list_key" to listOf(true),
        "long_list_key" to listOf(5L),
        "double_list_key" to listOf(3.14),
    ))
}
```

最後に、[`AnyValue` 型](/docs/specs/otel/common/#anyvalue)のオブジェクトを提供することも可能です。
これは複雑な値を表現したい場合に役立ちます。

```kotlin
{
    setAnyValueAttribute("my_key", AnyValue.StringValue("my_value"))
}
```

## コンテキスト {#context}

[`Context`](/docs/specs/otel/context/) は、API やプロセスの境界を越えて値を伝搬するための OpenTelemetry のアプローチです。
より具体的には、メトリクス、トレース、ログを相互に関連付けることで、特定のオペレーション時に何が起きていたかを把握できるようにします。

たとえば、REST API の一般的なパターンとして、各リクエストでスパンを開始および終了する方法があります。
このスパンが `Context` オブジェクトに関連付けられている場合、そのオブジェクトをリクエスト中に出力されるすべてのログレコードに渡す必要があります。

`Context` オブジェクトは、スパンの作成時に親子関係をモデル化するためにも使用できます。
REST API の例では、リクエストボディのデシリアライズや DB クエリなどのサブオペレーションを計測できます。

コンテキスト管理には、明示的と暗黙的の2つのアプローチがあります。

### 明示的なコンテキストの使用 {#using-explicit-context}

明示的なコンテキスト管理では、ログやスパンを作成するたびに、正しい `Context` への参照を指定する必要があります。

#### Context オブジェクトへのスパンの格納 {#store-a-span-in-a-context-object}

まず、`Context` オブジェクトへの参照を取得する必要があります。
これは `root()` を呼び出すことで実現できます。

```kotlin
val rootCtx: Context = otel.context.root()
```

`storeSpan` を呼び出して `Span` を `Context` に格納します。
これにより、スパンに関するメタデータを含む新しいイミュータブルな `Context` オブジェクトが作成されます。

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)
```

#### テレメトリーへの明示的なコンテキストの受け渡し {#pass-explicit-context-to-telemetry}

新しいコンテキストオブジェクトを `startSpan` に渡す必要があります。
返される `Span` は、`Context` に格納されたスパンの子であり、同じ traceId を共有します。

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)

val childSpan = tracer.startSpan(
    name = "child-span",
    parentContext = parentCtx,
)
```

ログレコードも同様の方法で `Context` に関連付けられます。

```kotlin
val rootCtx: Context = otel.context.root()
val newCtx: Context = rootCtx.storeSpan(parentSpan)

logger.emit(
    body = "Hello, World!",
    context = newCtx,
)
```

#### Context オブジェクトからのスパンの抽出 {#extract-a-span-from-a-context-object}

`Context` オブジェクトからスパンを抽出するには、`extractSpan()` を呼び出します。

```kotlin
val parentSpan: Span = parentCtx.extractSpan()
```

`Context` に `Span` が含まれていない場合、no-op オブジェクトが返されます。
これは `SpanContext` を通じて確認できます。

```kotlin
if (parentSpan.spanContext.isValid) {
    // スパンは有効なオブジェクト
}
```

#### Context へのその他の値の設定 {#setting-other-values-on-context}

任意の値は、キーを作成して `set` と `get` 関数を呼び出すことで `Context` に設定できます。

```kotlin
val key: ContextKey<MyObject> = otel.context.createKey("my-unique-key")
val root: Context = otel.context.root()
val newCtx: Context = root.set(key, MyObject())
val ref: MyObject = newCtx.get(key)
```

内部的には、これはまさに `Span` と `Baggage` が `Context` に格納される方法と同じです。

### 暗黙的なコンテキストの使用 {#using-implicit-context}

暗黙的なコンテキスト管理では、ログやスパンを作成するたびに、SDK が事前定義されたルールに基づいて正しい `Context` を選択します。

#### 暗黙的なコンテキストの危険性 {#the-dangers-of-implicit-context}

すべての呼び出し元で明示的に `Context` オブジェクトを渡すことは、認知的なオーバーヘッドを生じさせます。
OpenTelemetry には「暗黙的な」コンテキスト、つまり現在の実行単位に関連付けられたコンテキストの概念があります。

暗黙的なコンテキストはパラメーターを受け渡す認知的なオーバーヘッドを軽減しますが、それが自分が現在の実行単位とみなすものに一致しているかに注意する必要があります。
たとえば、Kotlin アプリケーションはスレッドローカルとコルーチンの両方を同時に使用することがあります。
スレッドローカルのアプローチを使用して暗黙的なコンテキストを格納しているにもかかわらずコルーチン内で実行している場合、暗黙的なコンテキストは無意味で誤解を招くものになります。

暗黙的なコンテキスト管理は、妥当なデフォルトを提供するのみです。
独自のアプリケーションでは、この妥当なデフォルトを明示的なコンテキスト管理で補うことを強くお勧めします。

#### 暗黙的なコンテキストの取得 {#obtaining-the-implicit-context}

暗黙的なコンテキストを取得するには、`implicit()` を呼び出します。

```kotlin
val implicitCtx: Context = otel.context.implicit()
```

暗黙的な `Context` が設定されていない場合、デフォルトでルートコンテキストが使用されます。

#### 暗黙的なコンテキストの設定 {#setting-the-implicit-context}

まず、`Span` を格納した新しい `Context` オブジェクトを作成します。
次に `asImplicitContext()` を呼び出します。
これにより、オペレーションのスコープに対して `Context` が自動的にアタッチされ、完了時にデタッチされます。

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
ctx.asImplicitContext {
    performFoo()
}
```

暗黙的な `Context` をより細かく制御したい場合は、`attach()` と `detach()` を自分で呼び出せます。
ただし、`attach/detach` の呼び出しを対応させ、エラーを適切に処理することが非常に重要です。
注意しないと、暗黙的なコンテキストに予期しない値が残る可能性があります。

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
val scope: Scope = ctx.attach()
performFoo()
scope.detach()
```

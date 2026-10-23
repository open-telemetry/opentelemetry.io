---
title: Інструментування
weight: 11
aliases:
  - manual
  - manual_instrumentation
description: Ручне інструментування для OpenTelemetry Kotlin
default_lang_commit: 823c9105d1857a79d9b356368ef1b7775534de4d
---

{{% include instrumentation-intro.md %}}

## Стабільність {#stability}

API OpenTelemetry Kotlin ще не досяг стабільності та може зазнавати несумісних змін. Докладніше див. [розділ про стабільність API](../getting-started#api-stability) у посібнику з початку роботи.

API трасування та ведення логів OpenTelemetry доступні, але API метрик ще не підтримується.

Усі мітки часу в API виражені в наносекундах.

## Налаштування {#setup}

Під час написання інструментування слід використовувати лише модулі API та noop, як описано в [посібнику з початку роботи](../getting-started#setup-other-modules). Інтерфейс `OpenTelemetry` слід передавати як параметр або властивість у місця викликів у вашому застосунку. Це основна точка входу для написання інструментування.

Корисним шаблоном є використання типових параметрів Kotlin для надання реалізації no-op. Це необовʼязково, але допомагає, якщо ви не відповідаєте за ініціалізацію SDK або вмикаєте OpenTelemetry лише за певних умов:

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // obtain tracer from the OpenTelemetry instance
    val tracer = otel.getTracer("com.example.myclient")
}
```

## Використання API логів {#using-the-logging-api}

### Отримання Logger {#obtain-a-logger}

Спочатку отримайте `Logger` з екземпляра `OpenTelemetry`. Надана назва ідентифікує [область інструментування](/docs/specs/otel/common/instrumentation-scope/):

```kotlin
val logger = otel.loggerProvider.getLogger("com.example.myclient")

// or use syntactic sugar
val logger = otel.getLogger("com.example.myclient")
```

Параметри `version`, `schemaUrl` і `attributes` можна задати необовʼязково, їх буде повʼязано із захопленою телеметрією:

```kotlin
val tracer = otel.getTracer(
    name = "com.example.myclient",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### Генерація простого запису логу {#emit-a-simple-log-record}

За допомогою посилання `Logger` простий запис логу можна згенерувати так:

```kotlin
logger.emit(
    body = "Hello, World!"
)
```

### Налаштування запису логу {#customize-the-log-record}

Під час захоплення записів логів `emit` приймає ще кілька інших параметрів. Їх докладно описано в [специфікації Logger API](/docs/specs/otel/logs/api/#emit-a-logrecord).

#### Задання критичності {#specify-the-severity}

Задайте `severityNumber` і `severityText`, щоб змінити критичність, повʼязану із записом логу:

```kotlin
logger.emit(
    body = "Hello, World!"
    severityNumber: SeverityNumber? = SeverityNumber.INFO,
    severityText: String? = "INFO"
)
```

#### Задання міток часу {#specify-the-timestamps}

Задайте `timestamp` і `observedTimestamp`, щоб змінити мітки часу, повʼязані із записом логу:

```kotlin
logger.emit(
    body = "Hello, World!"
    timestamp = 100,
    observedTimestamp = 90,
)
```

#### Задання винятку {#specify-the-exception}

Якщо з подією було повʼязано `Throwable`, задайте `exception`:

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

#### Задання назви події {#specify-the-event-name}

Якщо запис логу є [подією](/docs/specs/otel/logs/data-model/#field-eventname) OpenTelemetry, задайте `eventName`:

```kotlin
logger.emit(
    body = "Hello, World!"
    eventName = "event_name"
)
```

#### Задання контексту {#specify-the-context}

Якщо хочете повʼязати запис логу з конкретним контекстом, задайте `context`. Без цього параметра буде використано неявний контекст.

```kotlin
fun example(logger: Logger, ctx: Context) {
    logger.emit(
        body = "Hello, World!"
        context = ctx,
    )
}
```

Докладніше про те, що таке контекст і як ним користуватися, див. у [розділі про контекст](#context).

#### Задання атрибутів {#specify-the-attributes}

Задайте параметр `attributes`, якщо хочете повʼязати певні атрибути з окремим записом логу:

```kotlin
logger.emit("Hello, World!") {
    setStringAttribute("checkout.id", id)
    setLongAttribute("checkout.duration_ms", duration)
}
```

Докладніше про атрибути та їх використання див. у [розділі про атрибути](#attributes).

## Використання API трасування {#using-the-tracing-api}

### Отримання трейсера {#obtain-a-tracer}

Спочатку отримайте `Tracer` з екземпляра `OpenTelemetry`. Надана назва ідентифікує [область інструментування](/docs/specs/otel/common/instrumentation-scope/):

```kotlin
val tracer = otel.tracerProvider.getTracer("com.example.checkout")

// або використайте синтаксичний цукор
val tracer = otel.getTracer("com.example.checkout")
```

Параметри `version`, `schemaUrl` і `attributes` можна задати необовʼязково, їх буде повʼязано із захопленою телеметрією:

```kotlin
val tracer = otel.getTracer(
    name = "com.example.checkout",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### Запуск простого відрізка {#start-a-simple-span}

За допомогою посилання `Tracer` простий відрізок можна запустити й завершити так:

```kotlin
val span: Span = tracer.startSpan(name = "my_span")
```

### Завершення відрізка {#end-a-span}

Відрізок слід завершити викликом `end()`. Після цього подальші операції над `Span` не мають ефекту:

```kotlin
span.end()
```

Якщо потрібно задати явний час завершення, передайте `timestamp`. Зазвичай OpenTelemetry Kotlin використовує власний годинник, щоб заповнити мітку часу завершення:

```kotlin
span.end(timestamp = MyClock.now())
```

### Задання атрибутів {#specify-attributes}

Задайте параметр `attributes`, якщо хочете повʼязати певні атрибути з окремим відрізком:

```kotlin
val span: Span = tracer.startSpan("my_span") {
    setStringAttribute("checkout.id", id)
}
```

Атрибути також можна встановлювати після запуску відрізка:

```kotlin
span.setStringAttribute("checkout.id", id)
```

Докладніше про атрибути та їх використання див. у
[розділі про атрибути](#attributes).

### Встановлення статусу відрізка {#set-a-span-status}

Стандартно відрізки мають статус `Unset`. Ви можете явно позначити відрізок як `Ok` або `Error` разом із описом того, що пішло не так під час операції.

Цей виклик позначає відрізок як `Ok`:

```kotlin
span.setStatus(StatusData.Ok)
```

А цей позначає відрізок як `Error` з необовʼязковим описом:

```kotlin
span.setStatus(StatusData.Error("Something went wrong"))
```

### Перевірка, чи записується відрізок {#check-if-a-span-is-recording}

Можна перевірити, чи записується відрізок, ось так:

```kotlin
if (span.isRecording()) {
    // add some data
}
```

Якщо відрізок не записується, виклик його функцій дає результат no-op.

### Задання SpanKind {#specify-the-spankind}

[SpanKind](/docs/specs/otel/trace/api/#spankind) можна встановити для `Span` так:

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    spanKind = SpanKind.CLIENT
)
```

Стандартно `SpanKind` має значення `INTERNAL`.

### Задання startTimestamp {#specify-the-starttimestamp}

Час початку `Span` можна задати явно:

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    startTimestamp = MyClock.now()
)
```

Це корисно, якщо потрібно зафіксувати відрізок для операції, що сталася до ініціалізації OpenTelemetry.

### Задання parentContext {#specify-the-parentcontext}

Якщо хочете повʼязати відрізок з конкретним контекстом, задайте `context`. Без цього параметра буде використано неявний контекст.

```kotlin
fun example(tracer: Tracer, ctx: Context) {
    tracer.startSpan(
        name = "my_span"
        parentContext = ctx,
    )
}
```

Докладніше про те, що таке контекст і як ним користуватися, див. у [розділі про контекст](#context).

### Задання посилань на відрізки {#specify-span-links}

Іноді знадобиться [повʼязати два відрізки між собою](/docs/specs/otel/trace/api/#add-link). Це можна зробити під час ініціалізації:

```kotlin
val span: Span = tracer.startSpan("my_span") {
    addLink(otherSpan)
}
```

Посилання також можна додавати після запуску відрізка. Доступний ще й параметр `attributes`, який повʼязує атрибути з посиланням на відрізок:

```kotlin
span.addLink(otherSpan) {
    setStringAttribute("checkout.id", id)
}
```

### Обгортання операції відрізком {#wrap-an-operation-with-a-span}

Якщо у вас є синхронна операція, яку ви хочете зафіксувати відрізком, можна скористатися `wrapOperation`, щоб запустити й завершити відрізок:

```kotlin
span.wrapOperation {
    performFoo()
    span.setName(updatedName)
    StatusData.Ok
}
```

`wrapOperation` автоматично обробляє запуск і завершення відрізка, виконуючи довільну операцію в лямбді, тож вам не треба турбуватися про витік ресурсів. Ви повинні повернути `StatusData`, щоб позначити, чи була операція успішною.

Крім того, будь-які винятки, отримані в межах `wrapOperation`, фіксуються автоматично, а статус відрізка встановлюють як `Error`.

## Атрибути {#attributes}

Усі інтерфейси, що можуть приймати атрибути, мають однаковий синтаксис. Можна використовувати типізовані сетери:

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

Або натомість можна передати `Map<String, Any>`:

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

Нарешті, можна надати обʼєкт [типу `AnyValue`](/docs/specs/otel/common/#anyvalue). Це корисно, коли потрібно представити складні значення:

```kotlin
{
    setAnyValueAttribute("my_key", AnyValue.StringValue("my_value"))
}
```

## Контекст {#context}

OpenTelemetry використовує [`Context`](/docs/specs/otel/context/) для заповнення значень межами API та процесів. Інакше кажучи, він дозволяє повʼязувати метрики, трасування й логи між собою, щоб бачити, що відбувалося під час конкретної операції.

Наприклад, поширений шаблон для REST API полягає в тому, щоб запускати й завершувати відрізок для кожного запиту. Якщо цей відрізок повʼязано з обʼєктом `Context`, цей обʼєкт передають усім записам логів, які генеруються під час запиту.

Обʼєкти `Context` також можна використовувати для моделювання звʼязку між батьківським і дочірнім відрізками під час створення відрізків. У прикладі з REST API так можна вимірювати суб-операції, як-от десеріалізацію тіла запиту чи запити до бази даних.

Керувати контекстом можна двома способами: явним і неявним.

### Використання явного контексту {#using-explicit-context}

За явного керування контекстом під час кожного створення логу або відрізка потрібно вказувати посилання на правильний `Context`.

#### Зберігання відрізка в обʼєкті Context {#store-a-span-in-a-context-object}

Спочатку потрібно отримати посилання на обʼєкт `Context`. Це робиться викликом `root()`:

```kotlin
val rootCtx: Context = otel.context.root()
```

Викличте `storeSpan`, щоб зберегти `Span` у `Context`. Це створює новий незмінний обʼєкт `Context` із метаданими про відрізок:

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)
```

#### Передача явного контексту телеметрії {#pass-explicit-context-to-telemetry}

Далі новий обʼєкт контексту передають у `startSpan`. Повернений `Span` є нащадком відрізка, збереженого в `Context`, і має той самий traceId:

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)

val childSpan = tracer.startSpan(
    name = "child-span",
    parentContext = parentCtx,
)
```

Записи логів можна повʼязувати з `Context` подібним чином:

```kotlin
val rootCtx: Context = otel.context.root()
val newCtx: Context = rootCtx.storeSpan(parentSpan)

logger.emit(
    body = "Hello, World!",
    context = newCtx,
)
```

#### Вилучення відрізка з обʼєкта Context {#extract-a-span-from-a-context-object}

Якщо потрібно вилучити відрізок з обʼєкта `Context`, викличте
`extractSpan()`:

```kotlin
val parentSpan: Span = parentCtx.extractSpan()
```

Якщо `Context` не містить `Span`, буде повернено обʼєкт no-op. Перевірити це можна через `SpanContext`:

```kotlin
if (parentSpan.spanContext.isValid) {
    // span is a valid object
}
```

#### Встановлення інших значень у Context {#setting-other-values-on-context}

Довільні значення можна встановлювати в `Context`: створіть ключ і викличте функції `set` і `get`:

```kotlin
val key: ContextKey<MyObject> = otel.context.createKey("my-unique-key")
val root: Context = otel.context.root()
val newCtx: Context = root.set(key, MyObject())
val ref: MyObject = newCtx.get(key)
```

Під капотом саме так у `Context` зберігаються `Span` і `Baggage`.

### Використання неявного контексту {#using-implicit-context}

За неявного керування контекстом під час кожного створення логу чи відрізка SDK застосовує заздалегідь визначені правила, які обирають правильний `Context`.

#### Небезпеки неявного контексту {#the-dangers-of-implicit-context}

Явна передача обʼєктів `Context` у кожному місці виклику додає когнітивного навантаження. У OpenTelemetry існує концепція «неявного» контексту, тобто контексту, повʼязаного з поточною одиницею виконання.

Неявний контекст зменшує когнітивне навантаження, повʼязане з передачею параметрів між потоками, але слід бути обережним, щоб він збігався з тим, що ви вважаєте поточною одиницею виконання. Наприклад, застосунки Kotlin можуть одночасно використовувати thread-local і coroutines. Якщо ви зберігаєте неявний контекст через thread-local, але працюєте в coroutine, неявний контекст стає марним і хибним.

Неявне керування контекстом завжди може запропонувати лише доцільне стандартне значення. Наполегливо рекомендуємо доповнювати його явним керуванням контекстом у власному застосунку.

#### Отримання неявного контексту {#obtaining-the-implicit-context}

Щоб отримати неявний контекст, викличте `implicit()`:

```kotlin
val implicitCtx: Context = otel.context.implicit()
```

Якщо неявний `Context` не встановлено, типовим є кореневий контекст.

#### Встановлення неявного контексту {#setting-the-implicit-context}

Спочатку створіть новий обʼєкт `Context`, що зберігає `Span`. Потім викличте `asImplicitContext()`. Цей виклик автоматично прикріплює `Context` на час операції, а після завершення відʼєднує його:

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
ctx.asImplicitContext {
    performFoo()
}
```

Якщо потрібне докладніше керування неявним `Context`, можна самостійно викликати `attach()` і `detach()`. Проте дуже важливо зберігати рівновагу між викликами `attach/detach` і належно обробляти помилки. Якщо не бути обережним, у неявному контексті можуть опинитися неочікувані значення:

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
val scope: Scope = ctx.attach()
performFoo()
scope.detach()
```

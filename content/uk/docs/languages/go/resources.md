---
title: Ресурси
weight: 70
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: sdktrace thirdparty
---

{{% docs/languages/resources-intro %}}

Ресурси повинні бути призначені трасувальнику, вимірювачу та постачальнику логів під час їх ініціалізації, і створюються вони так само як атрибути:

```go
res := resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceNameKey.String("myService"),
    semconv.ServiceVersionKey.String("1.0.0"),
    semconv.ServiceInstanceIDKey.String("abcdef12345"),
)

provider := sdktrace.NewTracerProvider(
    ...
    sdktrace.WithResource(res),
)
```

Зверніть увагу на використання пакунка `semconv` для надання [звичайних імен](/docs/concepts/semantic-conventions/) для атрибутів ресурсу. Це допомагає забезпечити, щоб споживачі телеметрії, створеної з цими семантичними домовленостями, могли легко знаходити відповідні атрибути та розуміти їх значення.

Ресурси також можуть бути виявлені автоматично за допомогою реалізацій `resource.Detector`. Ці `Detector` можуть виявляти інформацію про поточний процес, операційну систему, на якій він працює, хмарного провайдера, що хостить цей екземпляр операційної системи, або будь-яку кількість інших атрибутів ресурсу.

```go
res, err := resource.New(
	context.Background(),
	resource.WithFromEnv(),      // Виявлення та надання атрибутів з середовищ змінних OTEL_RESOURCE_ATTRIBUTES та OTEL_SERVICE_NAME.
	resource.WithTelemetrySDK(), // Виявлення та надання інформації про використаний OpenTelemetry SDK.
	resource.WithProcess(),      // Виявлення та надання інформації про процес.
	resource.WithOS(),           // Виявлення та надання інформації про операційну систему.
	resource.WithContainer(),    // Виявлення та надання інформації про контейнер.
	resource.WithHost(),         // Виявлення та надання інформації про хост.
	resource.WithAttributes(attribute.String("foo", "bar")), // Додавання користувацьких атрибутів ресурсу.
	// resource.WithDetectors(thirdparty.Detector{}), // Використання власної реалізації Detector.
)
if errors.Is(err, resource.ErrPartialResource) || errors.Is(err, resource.ErrSchemaURLConflict) {
	log.Println(err) // Логування нефатальних помилок.
} else if err != nil {
	log.Fatalln(err) // Помилка може бути фатальною.
}
```

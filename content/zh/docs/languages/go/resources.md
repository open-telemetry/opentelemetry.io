---
title: 资源
weight: 70
default_lang_commit: ff6f300f46ac9bfab574f2a73a0555fccb64fda9
cSpell:ignore: sdktrace thirdparty
---

{{% docs/languages/resources-intro %}}

资源（Resource）应在初始化 Tracer、Meter 和 Logger 的提供者（Provider）时进行设置，其设置的方式与设置属性（Attribute）非常相似：

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

请注意，这里使用 semconv 包可以为资源属性提供[规范化的命名方式](/docs/concepts/semantic-conventions/)。
这能够确保使用这些语义约定生成的遥测数据，其下游系统或使用者可以更容易地识别这些属性，并准确理解它们所代表的含义。

资源还可以通过 `resource.Detector` 来实现自动检测。这些 `Detector` 可能会发现以下信息：

- 当前运行的进程信息；

- 当前运行的操作系统；

- 托管当前系统的云服务商；

- 其他任意资源属性。

```go
res, err := resource.New(
	context.Background(),
	resource.WithFromEnv(),      // 从环境变量 OTEL_RESOURCE_ATTRIBUTES 和 OTEL_SERVICE_NAME 中发现并提供属性。
	resource.WithTelemetrySDK(), // 发现并提供所使用的 OpenTelemetry SDK 信息。
	resource.WithProcess(),      // 发现并提供当前进程信息。
	resource.WithOS(),           // 发现并提供操作系统信息。
	resource.WithContainer(),    // 发现并提供容器信息。
	resource.WithHost(),         // 发现并提供主机信息。
	resource.WithAttributes(attribute.String("foo", "bar")), // 添加自定义资源属性。
	// resource.WithDetectors(thirdparty.Detector{}), // 也可以使用你自定义的外部 Detector 实现。
)
if errors.Is(err, resource.ErrPartialResource) || errors.Is(err, resource.ErrSchemaURLConflict) {
	log.Println(err) // 记录非致命错误。
} else if err != nil {
	log.Fatalln(err) // 遇到致命错误，终止程序。
}
```

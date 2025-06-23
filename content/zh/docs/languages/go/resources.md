---
title: 资源（Resources）
weight: 70
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
cSpell:ignore: sdktrace thirdparty
---

{{% docs/languages/resources-intro %}}

资源应在初始化追踪器（tracer）、指标采集器（meter）和日志记录器（logger）提供者时进行指定，其创建方式与属性（attribute）类似：

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

注意此处使用 `semconv` 包来提供
[conventional names](/docs/concepts/semantic-conventions/)，即语义约定名称，用于资源属性。这有助于确保使用这些语义约定生成的遥感数据更容易被下游系统识别和理解其含义。

资源还可以通过 `resource.Detector` 来实现自动检测。这些 `Detector` 可能会发现以下信息：

- 当前运行的进程信息；

- 所在操作系统；

- 托管当前系统的云服务商；

- 其他任意资源属性。

```go
res, err := resource.New(
	context.Background(),
	resource.WithFromEnv(),      // 从环境变量 OTEL_RESOURCE_ATTRIBUTES 和 OTEL_SERVICE_NAME 中发现并提供属性。
	resource.WithTelemetrySDK(), // 发现并提供所使用的 OpenTelemetry SDK 信息。
	resource.WithProcess(),      // 发现并提供当前进程信息。
	resource.WithOS(),           // 发现并提供操作系统信息。
	resource.WithContainer(),    // 发现并提供容器环境信息（如果运行在容器中）。
	resource.WithHost(),         // 发现并提供主机信息。
	resource.WithAttributes(attribute.String("foo", "bar")), // 添加自定义资源属性。
	// resource.WithDetectors(thirdparty.Detector{}), // 也可以使用自定义的外部 Detector 实现。
)
if errors.Is(err, resource.ErrPartialResource) || errors.Is(err, resource.ErrSchemaURLConflict) {
	log.Println(err) // 记录非致命错误。
} else if err != nil {
	log.Fatalln(err) // 遇到致命错误，终止程序。
}
```

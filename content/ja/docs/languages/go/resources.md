---
title: リソース
weight: 70
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22
cSpell:ignore: sdktrace thirdparty
---

{{% docs/languages/resources-intro %}}

リソースは、初期化時にトレーサー、メーター、ロガープロバイダーに割り当てる必要があり、属性と同じように作成されます。

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

リソース属性に[慣習的な名前](/docs/concepts/semantic-conventions/)を提供するための`semconv`パッケージの使用に注目してください。
これにより、これらのセマンティック規約で生成されたテレメトリーの消費者が関連する属性を簡単に発見し、その意味を理解できるようになります。

リソースは`resource.Detector`実装を通じて自動的に検出することもできます。
これらの`Detector`は、現在実行中のプロセス、それが実行されているオペレーティングシステム、そのオペレーティングシステムインスタンスをホストしているクラウドプロバイダー、またはその他の多数のリソース属性に関する情報を発見できます。

```go
res, err := resource.New(
	context.Background(),
	resource.WithFromEnv(),      // OTEL_RESOURCE_ATTRIBUTESとOTEL_SERVICE_NAME環境変数から属性を発見して提供します
	resource.WithTelemetrySDK(), // 使用されているOpenTelemetry SDKに関する情報を発見して提供します
	resource.WithProcess(),      // プロセス情報を発見して提供します
	resource.WithOS(),           // OS情報を発見して提供します
	resource.WithContainer(),    // コンテナ情報を発見して提供します
	resource.WithHost(),         // ホスト情報を発見して提供します
	resource.WithAttributes(attribute.String("foo", "bar")), // カスタムリソース属性を追加します
	// resource.WithDetectors(thirdparty.Detector{}), // 独自の外部Detector実装を持参します
)
if errors.Is(err, resource.ErrPartialResource) || errors.Is(err, resource.ErrSchemaURLConflict) {
	log.Println(err) // 致命的でない問題をログに記録します
} else if err != nil {
	log.Fatalln(err) // エラーは致命的である可能性があります
}
```

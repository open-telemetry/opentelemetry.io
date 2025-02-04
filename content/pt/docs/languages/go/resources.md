---
title: Recursos
weight: 70
default_lang_commit: 12f31f62fcc466532513f6ebccb060c9ea5b9fe4
cSpell:ignore: sdktrace thirdparty
---

{{% docs/languages/resources-intro %}}

Recursos devem ser adicionados a um `TracerProvider`, `MeterProvider` e
`LoggerProvider` durante a sua inicialização, e são criados de maneira
semelhante aos atributos:

```go
res := resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceNameKey.String("meuServico"),
    semconv.ServiceVersionKey.String("1.0.0"),
    semconv.ServiceInstanceIDKey.String("abcdef12345"),
)

provider := sdktrace.NewTracerProvider(
    ...
    sdktrace.WithResource(res),
)
```

Observe o uso do pacote `semconv` para fornecer
[nomes convencionais](/docs/concepts/semantic-conventions/) para os atributos do
recurso. Isso ajuda a garantir que os consumidores da telemetria produzida
utilizando as convenções semânticas possam identificar facilmente os atributos
relevantes e entender seu significado.

Os recursos também podem ser detectados automaticamente por meio das
implementações de `resource.Detector`. Esses `Detector`s podem descobrir
informações sobre o processo em execução, o sistema operacional em que ele está
sendo executado, o provedor de nuvem que hospeda a instância do sistema
operacional ou qualquer número de outros atributos de recurso.

```go
res, err := resource.New(
	context.Background(),
	resource.WithFromEnv(),      // Descobre e fornece atributos das variáveis de ambiente OTEL_RESOURCE_ATTRIBUTES e OTEL_SERVICE_NAME.
	resource.WithTelemetrySDK(), // Descobre e fornece informações sobre o SDK do OpenTelemetry que está sendo utilizado.
	resource.WithProcess(),      // Descobre e fornece informações do processo.
	resource.WithOS(),           // Descobre e fornece informações do Sistema Operacional.
	resource.WithContainer(),    // Descobre e fornece informações do contêiner.
	resource.WithHost(),         // Descobre e fornece informações da hospedagem.
	resource.WithAttributes(attribute.String("foo", "bar")), // Adicionar atributos de recurso personalizados.
	// resource.WithDetectors(thirdparty.Detector{}), // Inclua a sua própria implementação externa do Detector.
)
if errors.Is(err, resource.ErrPartialResource) || errors.Is(err, resource.ErrSchemaURLConflict) {
	log.Println(err) // Registre problemas não-fatais.
} else if err != nil {
	log.Fatalln(err) // O erro pode ser fatal.
}
```

---
title: Crear trazas y métricas personalizadas
linkTitle: Instrumentación personalizada
description:
  Trazas y métricas personalizadas mediante la instrumentación automática de
  .NET.
weight: 30
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
cSpell:ignore: meterprovider tracerprovider
---

La instrumentación automática configura un `TracerProvider` y un `MeterProvider`
para que puedas añadir tu propia instrumentación manual. Al usar tanto la
instrumentación automática como la manual, puedes instrumentar mejor la lógica y
la funcionalidad de tus aplicaciones, clientes y marcos de trabajo.

## Trazas

Para crear tus trazas personalizadas manualmente, sigue estos pasos:

1. Añade la dependencia `System.Diagnostics.DiagnosticSource` a tu proyecto:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Crea una instancia de `ActivitySource`:

   ```csharp
   private static readonly ActivitySource RegisteredActivity = new ActivitySource("Examples.ManualInstrumentations.Registered");
   ```

3. Crea una `Activity`. Opcionalmente, establece etiquetas:

   ```csharp
   using (var activity = RegisteredActivity.StartActivity("Main"))
   {
      activity?.SetTag("foo", "bar1");
      // your logic for Main activity
   }
   ```

4. Registra tu `ActivitySource` en OpenTelemetry.AutoInstrumentation
   configurando la variable de entorno
   `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`. Puedes establecer el valor en
   `Examples.ManualInstrumentations.Registered` o en
   `Examples.ManualInstrumentations.*`, que registra todo el prefijo.

{{% alert title="Nota" color="warning" %}} Una `Activity` creada para
`NonRegistered.ManualInstrumentations` `ActivitySource` no es gestionada por la
instrumentación automática de OpenTelemetry. {{% /alert %}}

## Métricas

Para crear tus métricas personalizadas manualmente, sigue estos pasos:

1. Añade la dependencia `System.Diagnostics.DiagnosticSource` a tu proyecto:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Crea una instancia de `Meter`:

   ```csharp
   using var meter = new Meter("Examples.Service", "1.0");
   ```

3. Crea un `Instrument`:

   ```csharp
   var successCounter = meter.CreateCounter<long>("srv.successes.count", description: "Number of successful responses");
   ```

4. Actualiza el valor `Instrument`. Opcionalmente, establece etiquetas:

   ```csharp
   successCounter.Add(1, new KeyValuePair<string, object?>("tagName", "tagValue"));
   ```

5. Registra su `Meter` con OpenTelemetry.AutoInstrumentation configurando la
   variable de entorno `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`:

   ```bash
   OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES=Examples.Service
   ```

   Puedes establecer el valor en `Examples.Service` o en `Examples.*`, lo que
   registra todo el prefijo.

## Más información

- [Documentación de OpenTelemetry.io para instrumentación manual de .NET](/docs/languages/dotnet/instrumentation#setting-up-an-activitysource)

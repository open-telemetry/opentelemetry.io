---
title: Créer des traces et métriques personnalisées
linkTitle: Instrumentation personnalisée
description:
  Traces et métriques personnalisées utilisant l'instrumentation Zero-code .NET.
weight: 30
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: meterprovider tracerprovider
---

L'instrumentation Zero-code configure un `TracerProvider` et un `MeterProvider`
afin que vous puissiez ajouter votre propre instrumentation manuelle. En
utilisant à la fois l'instrumentation automatique et manuelle, vous pouvez mieux
instrumenter la logique et les fonctionnalités de vos applications, clients et
frameworks.

## Traces {#traces}

Pour créer vos traces personnalisées manuellement, suivez ces étapes :

1. Ajoutez la dépendance `System.Diagnostics.DiagnosticSource` à votre projet :

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Créez une instance `ActivitySource` :

   ```csharp
   private static readonly ActivitySource RegisteredActivity = new ActivitySource("Examples.ManualInstrumentations.Registered");
   ```

3. Créez une `Activity`. Optionnellement, définissez des tags :

   ```csharp
   using (var activity = RegisteredActivity.StartActivity("Main"))
   {
      activity?.SetTag("foo", "bar1");
      // votre logique pour l'activité Main
   }
   ```

4. Enregistrez votre `ActivitySource` dans OpenTelemetry.AutoInstrumentation en
   définissant la variable d'environnement
   `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`. Vous pouvez définir la valeur
   soit à `Examples.ManualInstrumentations.Registered` soit à
   `Examples.ManualInstrumentations.*`, ce qui enregistre tout le préfixe.

{{% alert title="Note" color="warning" %}} Une `Activity` créée pour
l'`ActivitySource` `NonRegistered.ManualInstrumentations` n'est pas gérée par
l'instrumentation Zero-code OpenTelemetry. {{% /alert %}}

## Métriques {#metrics}

Pour créer vos métriques personnalisées manuellement, suivez ces étapes :

1. Ajoutez la dépendance `System.Diagnostics.DiagnosticSource` à votre projet :

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Créez une instance `Meter` :

   ```csharp
   using var meter = new Meter("Examples.Service", "1.0");
   ```

3. Créez un `Instrument` :

   ```csharp
   var successCounter = meter.CreateCounter<long>("srv.successes.count", description: "Number of successful responses");
   ```

4. Mettez à jour la valeur de l'`Instrument`. Optionnellement, définissez des
   tags :

   ```csharp
   successCounter.Add(1, new KeyValuePair<string, object?>("tagName", "tagValue"));
   ```

5. Enregistrez votre `Meter` avec OpenTelemetry.AutoInstrumentation en
   définissant la variable d'environnement
   `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES` :

   ```bash
   OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES=Examples.Service
   ```

   Vous pouvez définir la valeur soit à `Examples.Service` soit à `Examples.*`,
   ce qui enregistre tout le préfixe.

## Lectures complémentaires {#further-reading}

- [Documentation OpenTelemetry.io pour l'Instrumentation Manuelle .NET](/docs/languages/dotnet/instrumentation#setting-up-an-activitysource)

---
title: Створення власних трейсів та метрик
linkTitle: Власна інструменталізація
description: Власні трейси та метрики за допомогою автоматичної інструменталізації .NET.
weight: 30
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: meterprovider tracerprovider
---

Автоматична інструменталізація налаштовує `TracerProvider` та `MeterProvider`, щоб ви могли додати власну ручну інструменталізацію. Використовуючи як автоматичну, так і ручну інструменталізацію, ви можете краще інструментувати логіку та функціональність ваших застосунків, клієнтів та фреймворків.

## Трейси {#traces}

Щоб створити власні трейси вручну, виконайте наступні кроки:

1. Додайте залежність `System.Diagnostics.DiagnosticSource` до вашого проєкту:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Створіть екземпляр `ActivitySource`:

   ```csharp
   private static readonly ActivitySource RegisteredActivity = new ActivitySource("Examples.ManualInstrumentations.Registered");
   ```

3. Створіть `Activity`. За бажанням, встановіть теґи:

   ```csharp
   using (var activity = RegisteredActivity.StartActivity("Main"))
   {
      activity?.SetTag("foo", "bar1");
      // ваша логіка для Main activity
   }
   ```

4. Зареєструйте ваш `ActivitySource` в OpenTelemetry.AutoInstrumentation, встановивши змінну середовища `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`. Ви можете встановити значення як `Examples.ManualInstrumentations.Registered`, так і `Examples.ManualInstrumentations.*`, що реєструє весь префікс.

> [!WARNING]
>
> `Activity`, створений для `NonRegistered.ManualInstrumentations` `ActivitySource`, не обробляється автоматичною інструменталізацією OpenTelemetry.

## Метрики {#metrics}

Щоб створити власні метрики вручну, виконайте наступні кроки:

1. Додайте залежність `System.Diagnostics.DiagnosticSource` до вашого проєкту:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="8.0.0" />
   ```

2. Створіть екземпляр `Meter`:

   ```csharp
   using var meter = new Meter("Examples.Service", "1.0");
   ```

3. Створіть `Instrument`:

   ```csharp
   var successCounter = meter.CreateCounter<long>("srv.successes.count", description: "Number of successful responses");
   ```

4. Оновіть значення `Instrument`. За бажанням, встановіть теґи:

   ```csharp
   successCounter.Add(1, new KeyValuePair<string, object?>("tagName", "tagValue"));
   ```

5. Зареєструйте ваш `Meter` в OpenTelemetry.AutoInstrumentation, встановивши змінну середовища `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`:

   ```bash
   OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES=Examples.Service
   ```

   Ви можете встановити значення як `Examples.Service`, так і `Examples.*`, що реєструє весь префікс.

## Додаткові матеріали {#further-reading}

- [Документація OpenTelemetry.io для ручної інструменталізації .NET](/docs/languages/dotnet/instrumentation#setting-up-an-activitysource)

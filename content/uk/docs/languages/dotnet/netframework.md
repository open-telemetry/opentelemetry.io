---
title: Конфігурація інструментування .NET Framework
linkTitle: .NET Framework
weight: 100
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: asax LINQ
---

OpenTelemetry підтримує як [.NET](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet), так і [.NET Framework](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet-framework) (старіша реалізація .NET для Windows).

Якщо ви вже використовуєте сучасну, кросплатформну реалізацію .NET, ви можете пропустити цю статтю.

## Ініціалізація ASP.NET {#aspnet-initialization}

Ініціалізація для ASP.NET трохи відрізняється від ASP.NET Core.

Спочатку встановіть наступні пакунки NuGet:

- [OpenTelemetry.Instrumentation.AspNet](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNet)
- [OpenTelemetry.Exporter.Console](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console)

Далі, змініть ваш файл `Web.Config`, щоб додати необхідний HttpModule:

```xml
<system.webServer>
    <modules>
        <add
            name="TelemetryHttpModule"
            type="OpenTelemetry.Instrumentation.AspNet.TelemetryHttpModule,
                OpenTelemetry.Instrumentation.AspNet.TelemetryHttpModule"
            preCondition="integratedMode,managedHandler" />
    </modules>
</system.webServer>
```

Нарешті, ініціалізуйте інструментування ASP.NET у вашому файлі `Global.asax.cs` разом з іншою ініціалізацією OpenTelemetry:

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

public class WebApiApplication : HttpApplication
{
    private TracerProvider _tracerProvider;

    protected void Application_Start()
    {
        _tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddAspNetInstrumentation()

            // Інша конфігурація, як додавання експортера та налаштування ресурсів
            .AddConsoleExporter()
            .AddSource("my-service-name")
            .SetResourceBuilder(
                ResourceBuilder.CreateDefault()
                    .AddService(serviceName: "my-service-name", serviceVersion: "1.0.0"))

            .Build();
    }

    protected void Application_End()
    {
        _tracerProvider?.Dispose();
    }
}
```

## Розширена конфігурація ASP.NET {#advanced-aspnet-configuration}

Інструментування ASP.NET можна налаштувати для зміни стандартної поведінки.

### Фільтр {#filter}

Інструментування ASP.NET стандартно збирає всі вхідні HTTP-запити. Однак, ви можете фільтрувати вхідні запити за допомогою методу `Filter` в `AspNetInstrumentationOptions`. Це працює подібно до `Where` в LINQ, де будуть зібрані лише запити, що відповідають умові.

Наступний фрагмент коду показує, як використовувати `Filter`, щоб дозволити лише GET-запити.

```csharp
this.tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddAspNetInstrumentation(
        (options) => options.Filter =
            (httpContext) =>
            {
                // збирати телеметрію лише про HTTP GET-запити
                return httpContext.Request.HttpMethod.Equals("GET");
            })
    .Build();
```

Фільтрація відбувається на ранній стадії і відрізняється від [семплінгу](/docs/specs/otel/trace/sdk/#sampling), який відбувається після збору даних. Фільтрація обмежує те, що збирається спочатку.

### Збагачення {#enrich}

Якщо у вас є дані, які ви хочете додати до кожної `Activity`, створеної OpenTelemetry, ви можете використовувати метод `Enrich`.

Дія `Enrich` викликається лише тоді, коли `activity.IsAllDataRequested` дорівнює `true`. Вона містить створену `Activity`, назву події та необроблений обʼєкт.

Наступний фрагмент коду показує, як додати додаткові теґи за допомогою `Enrich`.

```csharp
this.tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddAspNetInstrumentation((options) => options.Enrich
        = (activity, eventName, rawObject) =>
    {
        if (eventName.Equals("OnStartActivity"))
        {
            if (rawObject is HttpRequest httpRequest)
            {
                activity?.SetTag("physicalPath", httpRequest.PhysicalPath);
            }
        }
        else if (eventName.Equals("OnStopActivity"))
        {
            if (rawObject is HttpResponse httpResponse)
            {
                activity?.SetTag("responseType", httpResponse.ContentType);
            }
        }
    })
    .Build();
```

Дивіться [Додавання теґів до Activity](../instrumentation/#activity-tags) для анотування даних трасування більш загально.

### RecordException

Інструментування ASP.NET автоматично встановлює статус `Activity` як `Error`, якщо виникає необроблена помилка.

Ви також можете встановити властивість `RecordException` в `true`, що дозволить зберігати помилку у самій `Activity` як `ActivityEvent`.

## Наступні кроки {#next-steps}

Після того, як ви автоматично згенеруєте спостережуваність за допомогою інструментальних бібліотек, ви можете додати [ручне інструментування](/docs/languages/dotnet/instrumentation) для збору користувацьких телеметричних даних.

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/dotnet/exporters) до одного або декількох бекендів телеметрії.

Ви також можете перевірити [автоматичне інструментування для .NET](/docs/zero-code/dotnet), яке наразі
знаходиться в бета-версії.

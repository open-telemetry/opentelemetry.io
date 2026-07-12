---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

{{% docs/languages/libraries-intro "dotnet" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не постачається з OpenTelemetry з коробки, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації телеметричних даних для бібліотеки або фреймворку.

Наприклад, [бібліотека інструментування для ASP.NET Core](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore) автоматично створюватиме [відрізки](/docs/concepts/signals/traces/#spans) та [метрики](/docs/concepts/signals/metrics) на основі вхідних HTTP-запитів.

## Налаштування {#setup}

Кожна бібліотека інструментування є пакунком NuGet, і їх встановлення зазвичай виконується так:

```sh
dotnet add package OpenTelemetry.Instrumentation.{library-name-or-type}
```

Зазвичай вони реєструються під час запуску програми, наприклад, при створенні [TracerProvider](/docs/concepts/signals/traces/#tracer-provider).

## Примітка щодо версій {#note-on-versioning}

Семантичні домовленості (стандарти) для імен атрибутів наразі не є стабільними, тому бібліотека інструментування наразі не знаходиться в випущеному стані. Це не означає, що сама функціональність не є стабільною, лише те, що імена деяких атрибутів можуть змінюватися в майбутньому, деякі можуть бути додані, деякі можуть бути видалені. Це означає, що вам потрібно використовувати прапорець `--prerelease`, або встановити конкретну версію пакунка.

## Приклад з ASP.NET Core та HttpClient {#example-with-aspnet-core-and-httpclient}

Наприклад, ось як ви можете інструментувати вхідні та вихідні запити з ASP.NET Core застосунку.

Спочатку отримайте відповідні пакунки OpenTelemetry Core:

```sh
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Exporter.Console
```

Потім ви можете встановити бібліотеки інструментування:

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
```

Далі налаштуйте кожну бібліотеку інструментування під час запуску та використовуйте їх!

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
      b
      .AddHttpClientInstrumentation()
      .AddAspNetCoreInstrumentation();
  });

var app = builder.Build();

var httpClient = new HttpClient();

app.MapGet("/hello", async () =>
{
    var html = await httpClient.GetStringAsync("https://example.com/");
    if (string.IsNullOrWhiteSpace(html))
    {
        return "Hello, World!";
    }
    else
    {
        return "Hello, World!";
    }
});

app.Run();
```

Коли ви запустите цей код і звернетеся до точки доступу `/hello`, бібліотеки інструментування:

- Почнуть нове трасування
- Згенерують відрізок, що представляє запит до точки доступу
- Згенерують дочірній відрізок, що представляє HTTP GET запит до `https://example.com/`

Якщо ви додасте більше бібліотек інструментування, ви отримаєте більше відрізків для кожної з них.

## Доступні бібліотеки інструментування {#available-instrumentation-libraries}

Повний список бібліотек інструментування, створених OpenTelemetry, доступний в репозиторії [opentelemetry-dotnet][].

Ви також можете знайти більше інструментів в [реєстрі](/ecosystem/registry/?language=dotnet&component=instrumentation).

## Наступні кроки {#next-steps}

Після налаштування бібліотек інструментування, ви можете додати власне [інструментування](/docs/languages/dotnet/instrumentation) до вашого коду, щоб збирати користувацькі телеметричні дані.

Якщо ви використовуєте .NET Framework 4.x замість сучасного .NET, зверніться до [документації .NET Framework](/docs/languages/dotnet/netframework) для налаштування OpenTelemetry та бібліотек інструментування на .NET Framework.

Вам також потрібно налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/dotnet/exporters) до одного або більше бекендів телеметрії.

Ви також можете перевірити [автоматичне інструментування для .NET](/docs/zero-code/dotnet), яке наразі знаходиться в бета-версії.

[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet

---
title: Початок роботи
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 8
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: ASPNETCORE rolldice
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у .NET.

Якщо ви шукаєте спосіб автоматично інструментувати ваш застосунок, перегляньте [цей посібник](/docs/zero-code/dotnet/getting-started/).

Ви дізнаєтеся, як інструментувати простий .NET застосунок таким чином, щоб [трейси][], [метрики][] та [логи][] виводилися в консоль.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 8+

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий [Мінімальний API з ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api) застосунок. Якщо ви не використовуєте мінімальний API з ASP.NET Core, це не проблема — ви можете використовувати OpenTelemetry .NET з іншими фреймворками. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=dotnet).

Для складніших прикладів дивіться [приклади](/docs/languages/dotnet/examples/).

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Для початку налаштуйте середовище в новій теці з назвою `dotnet-simple`. У цій теці виконайте наступну команду:

```sh
dotnet new web
```

У тій же теці замініть вміст `Program.cs` наступним кодом:

```csharp
using System.Globalization;

using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string HandleRollDice([FromServices]ILogger<Program> logger, string? player)
{
    var result = RollDice();

    if (string.IsNullOrEmpty(player))
    {
        logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
    }
    else
    {
        logger.LogInformation("{player} is rolling the dice: {result}", player, result);
    }

    return result.ToString(CultureInfo.InvariantCulture);
}

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

app.MapGet("/rolldice/{player?}", HandleRollDice);

app.Run();
```

У вкладеній теці `Properties` замініть вміст `launchSettings.json` на наступний:

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:8080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

Зберіть і запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```sh
dotnet build
dotnet run
```

## Інструментування {#instrumentation}

Далі ми встановимо інструментальні [пакунки NuGet від OpenTelemetry](https://www.nuget.org/profiles/OpenTelemetry), які генеруватимуть телеметрію, і налаштуємо їх.

1. Додайте пакунки

   ```sh
   dotnet add package OpenTelemetry.Extensions.Hosting
   dotnet add package OpenTelemetry.Instrumentation.AspNetCore
   dotnet add package OpenTelemetry.Exporter.Console
   ```

2. Налаштуйте код OpenTelemetry

   У Program.cs замініть наступні рядки:

   ```csharp
   var builder = WebApplication.CreateBuilder(args);
   var app = builder.Build();
   ```

   На:

   ```csharp
   using OpenTelemetry.Logs;
   using OpenTelemetry.Metrics;
   using OpenTelemetry.Resources;
   using OpenTelemetry.Trace;

   var builder = WebApplication.CreateBuilder(args);

   const string serviceName = "roll-dice";

   builder.Logging.AddOpenTelemetry(options =>
   {
       options
           .SetResourceBuilder(
               ResourceBuilder.CreateDefault()
                   .AddService(serviceName))
           .AddConsoleExporter();
   });
   builder.Services.AddOpenTelemetry()
         .ConfigureResource(resource => resource.AddService(serviceName))
         .WithTracing(tracing => tracing
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter())
         .WithMetrics(metrics => metrics
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter());

   var app = builder.Build();
   ```

3. Запустіть ваш **застосунок** знову:

   ```sh
   dotnet run
   ```

   Зверніть увагу на вивід з `dotnet run`.

4. З _іншого_ терміналу надішліть запит за допомогою `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

5. Через приблизно 30 секунд зупиніть процес сервера.

На цьому етапі ви повинні побачити вивід трейсів та логів з сервера та клієнта, який виглядає приблизно так (вивід розбитий на рядки для зручності читання):

<details>
<summary>Трейси та Логи</summary>

```log
LogRecord.Timestamp:               2023-10-23T12:13:30.2704325Z
LogRecord.TraceId:                 324333ec3bbca04ba7f4be4bf3618cb1
LogRecord.SpanId:                  e7d3814e31e504eb
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            Program
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Anonymous player is rolling the dice: {result}
LogRecord.Attributes (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: roll-dice
service.instance.id: f20134f3-293f-4cb2-ace3-724b5571ca9a
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.6.0

Activity.TraceId:            324333ec3bbca04ba7f4be4bf3618cb1
Activity.SpanId:             e7d3814e31e504eb
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-10-23T12:13:30.2163005Z
Activity.Duration:           00:00:00.0585187
Activity.Tags:
    net.host.name: 127.0.0.1
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://127.0.0.1:8080/rolldice
    http.flavor: 1.1
    http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
    http.status_code: 200
Resource associated with Activity:
    service.name: roll-dice
    service.instance.id: 36bfe322-51b8-4976-90fc-9186376d6ad0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.6.0
```

</details>

Також при зупинці сервера ви повинні побачити вивід усіх зібраних метрик (приклад уривку):

<details>
<summary>Метрики</summary>

```log
Export http.client.duration, Measures the duration of outbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.Http/1.0.0.0
(2023-08-14T06:12:06.2661140Z, 2023-08-14T06:12:23.7750388Z] http.flavor: 1.1 http.method: POST http.scheme: https http.status_code: 200 net.peer.name: dc.services.visualstudio.com Histogram
Value: Sum: 1330.4766000000002 Count: 5 Min: 50.0333 Max: 465.7936
(-Infinity,0]:0
(0,5]:0
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:2
(75,100]:0
(100,250]:0
(250,500]:3
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

</details>

## Що далі? {#whats-next}

Для більшого:

- Запустіть цей приклад з іншим [експортером][експортер] для даних телеметрії.
- Спробуйте [автоматичне інструментування](/docs/zero-code/dotnet/) на одному з ваших застосунків.
- Дізнайтеся про [ручне інструментування][] та спробуйте більше [прикладів](/docs/languages/dotnet/examples/).
- Ознайомтеся з [демо OpenTelemetry](/docs/demo/), яке включає основний на .NET [Cart Service](/docs/demo/services/cart/).

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
[експортер]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#exporters
[ручне інструментування]: ../instrumentation

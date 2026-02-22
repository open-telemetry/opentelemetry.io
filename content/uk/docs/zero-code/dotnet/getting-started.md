---
title: Початок роботи
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 5
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: ASPNETCORE rolldice
---

Ця сторінка покаже вам, як почати роботу з автоматичним інструментуванням OpenTelemetry .NET.

Якщо ви шукаєте спосіб вручну інструментувати ваш застосунок, перегляньте [цей посібник](/docs/languages/dotnet/getting-started).

Ви дізнаєтеся, як можна автоматично інструментувати простий .NET застосунок, так, щоб [трейси][], [метрики][] та [логи][] виводилися в консоль.

## Попередні вимоги {#prerequisites}

Переконайтеся, що у вас встановлено:

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

## Демонстраційний застосунок {#example-application}

Наступний приклад використовує базовий [Мінімальний API з ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api) застосунок. Якщо ви не використовуєте ASP.NET Core, це не проблема — ви все одно можете використовувати автоматичне інструментування OpenTelemetry .NET.

Для складніших випадків дивіться [приклади](/docs/languages/net/examples/).

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Для початку створіть нову теку з назвою `dotnet-simple`. У цій теці виконайте наступну команду:

```sh
dotnet new web
```

У тій же теці замініть вміст файлу `Program.cs` наступним кодом:

```csharp
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var logger = app.Logger;

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

string HandleRollDice(string? player)
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

app.MapGet("/rolldice/{player?}", HandleRollDice);

app.Run();
```

У вкладеній теці `Properties` замініть вміст файлу `launchSettings.json` на наступний:

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

Зберіть та запустіть застосунок за допомогою наступної команди, потім відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```sh
dotnet build
dotnet run
```

## Інструментування {#instrumentation}

Далі ви будете використовувати [автоматичне інструментування OpenTelemetry .NET](../) застосунку під час запуску. Хоча ви можете [налаштувати автоматичне інструментування .NET][configure .NET Automatic Instrumentation] різними способами, нижче наведені кроки для Unix-shell або PowerShell скриптів.

> **Примітка**: Команди PowerShell вимагають підвищених (адміністративних) привілеїв.

1. Завантажте скрипти встановлення з [Releases][] репозиторію `opentelemetry-dotnet-instrumentation`:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
   $download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
   Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Виконайте наступний скрипт для завантаження автоматичного інструментування для вашого середовища розробки:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   ./otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   Import-Module $download_path
   Install-OpenTelemetryCore
   ```

   {{% /tab %}} {{< /tabpane >}}

3. Встановіть та експортуйте змінні, що вказують на [консольний експортер][], потім виконайте скрипт, що налаштовує інші необхідні змінні середовища, використовуючи нотацію, відповідну для вашого shell/терміналу &mdash; ми ілюструємо нотацію для bash-подібних shell та PowerShell:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   export OTEL_TRACES_EXPORTER=console \
     OTEL_METRICS_EXPORTER=console \
     OTEL_LOGS_EXPORTER=console
     OTEL_SERVICE_NAME=RollDiceService
   . $HOME/.otel-dotnet-auto/instrument.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $env:OTEL_TRACES_EXPORTER="console"
   $env:OTEL_METRICS_EXPORTER="console"
   $env:OTEL_LOGS_EXPORTER="console"
   Register-OpenTelemetryForCurrentSession -OTelServiceName "RollDiceService"
   ```

   {{% /tab %}} {{< /tabpane >}}

4. Запустіть ваш **застосунок** ще раз:

   ```sh
   dotnet run
   ```

   Зверніть увагу на вивід з `dotnet run`.

5. З _іншого_ терміналу, надішліть запит за допомогою `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

6. Через приблизно 30 секунд зупиніть процес сервера.

На цьому етапі ви повинні побачити вивід трейсів та логів з сервера та клієнта, який виглядає приблизно так (вивід перенесено для зручності читання):

<details>
<summary>Трейси та Логи</summary>

```log
LogRecord.Timestamp:               2023-08-14T06:44:53.9279186Z
LogRecord.TraceId:                 3961d22b5f90bf7662ad4933318743fe
LogRecord.SpanId:                  93d5fcea422ff0ac
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            simple-dotnet
LogRecord.LogLevel:                Information
LogRecord.StateValues (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: simple-dotnet
telemetry.auto.version: 0.7.0
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.4.0.802

info: simple-dotnet[0]
      Anonymous player is rolling the dice: 1
Activity.TraceId:            3961d22b5f90bf7662ad4933318743fe
Activity.SpanId:             93d5fcea422ff0ac
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-08-14T06:44:53.9278162Z
Activity.Duration:           00:00:00.0049754
Activity.Tags:
    net.host.name: localhost
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://localhost:8080/rolldice
    http.flavor: 1.1
    http.user_agent: curl/8.0.1
    http.status_code: 200
Resource associated with Activity:
    service.name: simple-dotnet
    telemetry.auto.version: 0.7.0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.4.0.802
```

</details>

Також при зупинці сервера ви повинні побачити вивід всіх зібраних метрик (приклад уривка показано):

<details>
<summary>Метрики</summary>

```log
Export process.runtime.dotnet.gc.collections.count, Number of garbage collections that have occurred since process start., Meter: OpenTelemetry.Instrumentation.Runtime/1.1.0.2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen2 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen1 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen0 LongSum
Value: 6

...

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

Докладніше:

- Щоб налаштувати експортери, семплери, ресурси та інше, дивіться [Конфігурація та налаштування](../configuration)
- Дивіться список [доступного інструментування](../instrumentations)
- Якщо ви хочете поєднати автоматичне та ручне інструментування, дізнайтеся, як ви [можете створювати власні трейси та метрики](../custom)
- Якщо у вас виникли проблеми, перегляньте [Посібник з усунення несправностей](../troubleshooting)

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
[configure .NET Automatic Instrumentation]: ../configuration
[консольний експортер]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#internal-logs
[releases]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases

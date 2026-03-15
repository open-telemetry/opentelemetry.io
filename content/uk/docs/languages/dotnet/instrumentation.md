---
title: Інструментування
weight: 36
aliases: [manual]
description: Інструментування для OpenTelemetry .NET
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: activitysource dicelib rolldice
---

{{% include instrumentation-intro %}}

> [!NOTE]
>
> На цій сторінці ви дізнаєтесь, як можна додати трасування, метрики та логи до вашого коду вручну. Ви не обмежені використанням одного виду інструментування: ви також можете використовувати [автоматичне інструментування](/docs/zero-code/dotnet/), щоб почати, а потім збагачувати свій код ручним інструментуванням за потреби.
>
> Також, для бібліотек, від яких залежить ваш код, вам не потрібно писати код інструментування самостійно, оскільки вони можуть бути вже інструментовані або існують [бібліотеки інструментування](/docs/languages/dotnet/libraries/) для них.

## Примітка щодо термінології {#a-note-on-terminology}

.NET відрізняється від інших мов/середовищ виконання, які підтримують OpenTelemetry. [API трасування](/docs/concepts/signals/traces/) реалізовано за допомогою API [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics), перепрофілюючи наявні конструкції, такі як `ActivitySource` та `Activity`, щоб вони відповідали OpenTelemetry під капотом.

Однак, є частини API та термінології OpenTelemetry, які розробники .NET все ще повинні знати, щоб мати змогу інструментувати свої застосунки, які розглядаються тут, а також API `System.Diagnostics`.

Якщо ви віддаєте перевагу використанню API OpenTelemetry замість API `System.Diagnostics`, ви можете звернутися до [документації OpenTelemetry API Shim для трасування](../shim).

## Підготовка демонстраційного застосунку {#example-app}

Ця сторінка використовує модифіковану версію демонстраційного застосунку з розділу [Початок роботи](/docs/languages/dotnet/getting-started/), щоб допомогти вам навчитися ручному інструментуванню.

Вам не обовʼязково використовувати демонстраційний застосунок: якщо ви хочете інструментувати свій власний застосунок або бібліотеку, дотримуйтесь інструкцій тут, щоб адаптувати процес до свого коду.

### Передумови {#example-app-prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Для початку налаштуйте середовище в новій теці з назвою `dotnet-otel-example`. У цій теці виконайте наступну команду:

```shell
dotnet new web
```

Щоб підкреслити різницю між інструментуванням бібліотеки та самостійного застосунку, винесіть кидання кубиків у файл бібліотеки, який потім буде імпортовано як залежність файлом застосунку.

Створіть файл бібліотеки з назвою `Dice.cs` та додайте до нього наступний код:

```csharp
/*Dice.cs*/

public class Dice
{
    private int min;
    private int max;

    public Dice(int min, int max)
    {
        this.min = min;
        this.max = max;
    }

    public List<int> rollTheDice(int rolls)
    {
        List<int> results = new List<int>();

        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }

        return results;
    }

    private int rollOnce()
    {
        return Random.Shared.Next(min, max + 1);
    }
}
```

Створіть файл застосунку `DiceController.cs` та додайте до нього наступний код:

```csharp
/*DiceController.cs*/

using Microsoft.AspNetCore.Mvc;
using System.Net;

public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    public DiceController(ILogger<DiceController> logger)
    {
        this.logger = logger;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        if(!rolls.HasValue)
        {
            logger.LogError("Відсутній параметр rolls");
            throw new HttpRequestException("Відсутній параметр rolls", null, HttpStatusCode.BadRequest);
        }

        var result = new Dice(1, 6).rollTheDice(rolls.Value);

        if (string.IsNullOrEmpty(player))
        {
            logger.LogInformation("Анонімний гравець кидає кубики: {result}", result);
        }
        else
        {
            logger.LogInformation("{player} кидає кубики: {result}", player, result);
        }

        return result;
    }
}
```

Замініть вміст файлу `Program.cs` наступним кодом:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

У вкладеній теці `Properties` замініть вміст `launchSettings.json` наступним:

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

Щоб переконатися, що все працює, запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice?rolls=12> у вашому вебоглядачі:

```sh
dotnet run
```

Ви повинні побачити список з 12 чисел у вікні оглядача, наприклад:

```text
[5,6,5,3,6,1,2,5,4,4,2,4]
```

## Налаштування ручного інструментування {#manual-instrumentation-setup}

### Залежності {#dependencies}

Встановіть наступні пакунки NuGet OpenTelemetry:

[OpenTelemetry.Exporter.Console](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console)

[OpenTelemetry.Extensions.Hosting](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)

```sh
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

Для застосунків на основі ASP.NET Core також встановіть пакунок інструментування AspNetCore

[OpenTelemetry.Instrumentation.AspNetCore](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

### Ініціалізація SDK {#initialize-the-sdk}

> [!NOTE]
>
> Якщо ви інструментуєте бібліотеку, вам не потрібно ініціалізувати SDK.

Важливо налаштувати екземпляр OpenTelemetry SDK якомога раніше у вашому застосунку.

Щоб ініціалізувати OpenTelemetry SDK для застосунку ASP.NET Core, як у випадку з демонстраційним застосунком, оновіть вміст файлу `Program.cs` наступним кодом:

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Ідеально, якщо це імʼя буде взято з конфігураційного файлу, файлу констант тощо.
var serviceName = "dice-server";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .WithTracing(tracing => tracing
        .AddSource(serviceName)
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter())
    .WithMetrics(metrics => metrics
        .AddMeter(serviceName)
        .AddConsoleExporter());

builder.Logging.AddOpenTelemetry(options => options
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .AddConsoleExporter());

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

Якщо ініціалізувати OpenTelemetry SDK для консольного застосунку, додайте наступний код на початку вашої програми, під час будь-яких важливих операцій запуску.

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

//...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .ConfigureResource(resource =>
        resource.AddService(
          serviceName: serviceName,
          serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(serviceName)
    .AddConsoleExporter()
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter();
    });
});

//...

tracerProvider.Dispose();
meterProvider.Dispose();
loggerFactory.Dispose();
```

Для цілей налагодження та локальної розробки приклад експортує телеметрію до консолі. Після того, як ви закінчите налаштування ручного інструментування, вам потрібно налаштувати відповідний експортер, щоб [експортувати дані телеметрії застосунку](/docs/languages/dotnet/exporters/) до одного або більше бекендів телеметрії.

Приклад також налаштовує обовʼязковий стандартний атрибут SDK `service.name`, який містить логічне імʼя сервісу, та необовʼязковий, але дуже рекомендований атрибут `service.version`, який містить версію API або реалізації сервісу. Існують альтернативні методи налаштування атрибутів ресурсу. Для отримання додаткової інформації дивіться [Ресурси](/docs/languages/dotnet/resources/).

Щоб перевірити ваш код, зберіть та запустіть застосунок:

```sh
dotnet build
dotnet run
```

## Трасування {#tracing}

### Ініціалізація трасування {#initialize-tracing}

> [!NOTE]
>
> Якщо ви інструментуєте бібліотеку, вам не потрібно ініціалізувати TracerProvider.

Щоб увімкнути [трасування](/docs/concepts/signals/traces/) у вашому застосунку, вам потрібно мати ініціалізований [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider), який дозволить вам створювати [`Tracer`](/docs/concepts/signals/traces/#tracer).

Якщо `TracerProvider` не створено, API OpenTelemetry для трасування використовуватимуть реалізацію no-op і не генеруватимуть дані.

Якщо ви дотримувалися інструкцій щодо [ініціалізації SDK](#initialize-the-sdk) вище, у вас вже налаштовано `TracerProvider`. Ви можете продовжити з [налаштуванням ActivitySource](#setting-up-an-activitysource).

### Налаштування ActivitySource {#setting-up-an-activitysource}

У будь-якому місці вашого застосунку, де ви пишете код ручного трасування, слід налаштувати [`ActivitySource`](/docs/concepts/signals/traces/#tracer), який буде використовуватися для трасування операцій з елементами [`Activity`](/docs/concepts/signals/traces/#spans).

Зазвичай рекомендується визначати `ActivitySource` один раз на застосунок/сервіс, який інструментується, але ви можете створити кілька `ActivitySource`, якщо це підходить для вашого сценарію.

У випадку з демонстраційним застосунком ми створимо новий файл `Instrumentation.cs` як користувацький тип для зберігання посилань на ActivitySource.

```csharp
using System.Diagnostics;

/// <summary>
/// Рекомендується використовувати користувацький тип для зберігання посилань на ActivitySource.
/// Це дозволяє уникнути можливих конфліктів типів з іншими компонентами в DI контейнері.
/// </summary>
public class Instrumentation : IDisposable
{
    internal const string ActivitySourceName = "dice-server";
    internal const string ActivitySourceVersion = "1.0.0";

    public Instrumentation()
    {
        this.ActivitySource = new ActivitySource(ActivitySourceName, ActivitySourceVersion);
    }

    public ActivitySource ActivitySource { get; }

    public void Dispose()
    {
        this.ActivitySource.Dispose();
    }
}
```

Потім ми оновимо `Program.cs`, щоб додати обʼєкт Instrument як залежність:

```csharp
//...

// Зареєструйте клас Instrumentation як синглтон у DI контейнері.
builder.Services.AddSingleton<Instrumentation>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

У файлі застосунку `DiceController.cs` ми будемо посилатися на цей екземпляр activitySource, і той самий екземпляр activitySource також буде передано до файлу бібліотеки `Dice.cs`

```csharp
/*DiceController.cs*/

using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;

public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    private ActivitySource activitySource;

    public DiceController(ILogger<DiceController> logger, Instrumentation instrumentation)
    {
        this.logger = logger;
        this.activitySource = instrumentation.ActivitySource;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        List<int> result = new List<int>();

        if (!rolls.HasValue)
        {
            logger.LogError("Відсутній параметр rolls");
            throw new HttpRequestException("Відсутній параметр rolls", null, HttpStatusCode.BadRequest);
        }

        result = new Dice(1, 6, activitySource).rollTheDice(rolls.Value);

        if (string.IsNullOrEmpty(player))
        {
            logger.LogInformation("Анонімний гравець кидає кубики: {result}", result);
        }
        else
        {
            logger.LogInformation("{player} кидає кубики: {result}", player, result);
        }

        return result;
    }
}
```

```csharp
/*Dice.cs*/

using System.Diagnostics;

public class Dice
{
    public ActivitySource activitySource;
    private int min;
    private int max;

    public Dice(int min, int max, ActivitySource activitySource)
    {
        this.min = min;
        this.max = max;
        this.activitySource = activitySource;
    }

    //...
}
```

### Створення Activities {#create-activities}

Тепер, коли ви ініціалізували [activitySources](/docs/concepts/signals/traces/#tracer), ви можете створювати [activities](/docs/concepts/signals/traces/#spans).

Код нижче ілюструє, як створити activity.

```csharp
public List<int> rollTheDice(int rolls)
{
    List<int> results = new List<int>();

    // Рекомендується створювати activities, лише коли виконуються операції, які варто вимірювати окремо.
    // Занадто багато activities ускладнює візуалізацію в інструментах, таких як Jaeger.
    using (var myActivity = activitySource.StartActivity("rollTheDice"))
    {
        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }

        return results;
    }
}
```

Якщо ви дотримувалися інструкцій, використовуючи [демонстраційний застосунок](#example-app) до цього моменту, ви можете скопіювати код вище у ваш файл бібліотеки `Dice.cs`. Тепер ви повинні побачити activities/spans, що генеруються вашим застосунком.

Запустіть свій застосунок наступним чином, а потім надішліть йому запити, відвідавши <http://localhost:8080/rolldice?rolls=12> за допомогою вашого оглядача або curl.

```sh
dotnet run
```

Через деякий час ви повинні побачити spans, виведені в консолі експортером `ConsoleExporter`, щось на кшталт цього:

```json
Activity.TraceId:            841d70616c883db82b4ae4e11c728636
Activity.SpanId:             9edfe4d69b0d6d8b
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       39fcd105cf958377
Activity.ActivitySourceName: dice-server
Activity.DisplayName:        rollTheDice
Activity.Kind:               Internal
Activity.StartTime:          2024-04-10T15:24:00.3620354Z
Activity.Duration:           00:00:00.0144329
Resource associated with Activity:
    service.name: dice-server
    service.version: 1.0.0
    service.instance.id: 7a7a134f-3178-4ac6-9625-96df77cff8b4
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.7.0
```

### Створення вкладених Activities {#create-nested-activities}

Вкладені [відрізки](/docs/concepts/signals/traces/#spans) дозволяють відстежувати роботу, яка має вкладену природу. Наприклад, функція `rollOnce()` нижче представляє вкладену операцію. Наступний приклад створює вкладений відрізок, який відстежує `rollOnce()`:

```csharp
private int rollOnce()
{
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);

      return result;
    }
}
```

Коли ви переглядаєте відрізки в інструменті візуалізації трасування, `rollOnce` childActivity буде відстежуватися як вкладена операція в activity `rollTheDice`.

### Отримання поточного Activity {#get-the-current-activity}

Іноді корисно зробити щось з поточним/активним Activity/Span у певний момент виконання програми.

```csharp
var activity = Activity.Current;
```

### Теґи Activity {#activity-tags}

Теґи (еквівалент [Attributes](/docs/concepts/signals/traces/#attributes)) дозволяють прикріплювати пари ключ/значення до [`Activity`](/docs/concepts/signals/traces/#spans), щоб він містив більше інформації про поточну операцію, яку він відстежує.

```csharp
private int rollOnce()
{
  using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);
      childActivity?.SetTag("dicelib.rolled", result);

      return result;
    }
}
```

### Додавання подій до Activities {#add-events-to-activities}

[Відрізки](/docs/concepts/signals/traces/#spans) можуть бути анотовані іменованими подіями (називаються [Span Events](/docs/concepts/signals/traces/#span-events)), які можуть містити нуль або більше [Span Attributes](#activity-tags), кожен з яких сам по собі є парою ключ:значення, автоматично поєднаною з часовою міткою.

```csharp
myActivity?.AddEvent(new("Init"));
...
myActivity?.AddEvent(new("End"));
```

```csharp
var eventTags = new ActivityTagsCollection
{
    { "operation", "calculate-pi" },
    { "result", 3.14159 }
};

activity?.AddEvent(new("End Computation", DateTimeOffset.Now, eventTags));
```

### Створення Activities з посиланнями {#create-activities-with-links}

[Відрізок](/docs/concepts/signals/traces/#spans) може бути повʼязаний з нулем або більше інших Відрізків, які є повʼязаними через [Span Link](/docs/concepts/signals/traces/#span-links). Посилання можуть використовуватися для представлення пакетних операцій, де Відрізок був ініційований кількома ініціюючими Відрізками, кожен з яких представляє один вхідний елемент, що обробляється в пакеті.

```csharp
var links = new List<ActivityLink>
{
    new ActivityLink(activityContext1),
    new ActivityLink(activityContext2),
    new ActivityLink(activityContext3)
};

var activity = MyActivitySource.StartActivity(
    ActivityKind.Internal,
    name: "activity-with-links",
    links: links);
```

### Встановлення статусу Activity {#set-activity-status}

{{% include "span-status-preamble" %}}

Статус може бути встановлений у будь-який час до завершення відрізка.

Може бути гарною ідеєю записувати помилки, коли вони трапляються. Рекомендується робити це разом з [встановленням статусу відрізка](/docs/specs/otel/trace/api/#set-status).

```csharp
private int rollOnce()
{
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
        int result;

        try
        {
            result = Random.Shared.Next(min, max + 1);
            childActivity?.SetTag("dicelib.rolled", result);
        }
        catch (Exception ex)
        {
            childActivity?.SetStatus(ActivityStatusCode.Error, "Щось пішло не так!");
            childActivity?.AddException(ex);
            throw;
        }

        return result;
    }
}
```

## Наступні кроки {#next-steps}

Після того, як ви налаштували ручне інструментування, ви можете скористатися [бібліотеками інструментування](../libraries/). Як випливає з назви, вони будуть інструментувати відповідні бібліотеки, які ви використовуєте, і генерувати відрізки (activities) для таких речей, як вхідні та вихідні HTTP-запити та інше.

Вам також потрібно налаштувати відповідний експортер, щоб [експортувати ваші дані телеметрії](../exporters/) до одного або більше бекендів телеметрії.

Ви також можете подивитись [автоматичне інструментування для .NET](/docs/zero-code/dotnet/), яке наразі перебуває в бета-версії.

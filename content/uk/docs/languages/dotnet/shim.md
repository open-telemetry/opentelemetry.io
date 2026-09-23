---
title: OpenTelemetry shim трасування
linkTitle: Shim трасування
CSpell:ignore: tracerprovider
weight: 110
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

.NET відрізняється від інших мов/середовищ виконання, які підтримують OpenTelemetry. Трасування реалізовано за допомогою [System.Diagnostics](https://docs.microsoft.com/dotnet/api/system.diagnostics) API, перепрофілюючи старі конструкції, такі як `ActivitySource` та `Activity`, щоб вони відповідали OpenTelemetry під капотом.

OpenTelemetry для .NET також надає API shim поверх реалізації на основі [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics). Цей shim корисний, якщо ви працюєте з іншими мовами та OpenTelemetry в одному кодовій базі, або якщо ви віддаєте перевагу використовувати термінологію, що відповідає специфікації OpenTelemetry.

## Ініціалізація трасування {#initializing-tracing}

Існує два основних способи ініціалізації [трасування](/docs/concepts/signals/traces/), залежно від того, чи використовуєте ви консольний застосунок або щось на основі ASP.NET Core.

### Консольний застосунок {#console-app}

Щоб почати [трасування](/docs/concepts/signals/traces/) у консольному застосунку, вам потрібно створити постачальника трасувальників.

Спочатку переконайтеся, що у вас є правильні пакунки:

```sh
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

А потім використовуйте такий код на початку вашої програми, під час будь-яких важливих операцій запуску.

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// ...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

//...
```

Тут ви також можете налаштувати бібліотеки інструментування.

Зверніть увагу, що цей приклад використовує Console Exporter. Якщо ви експортуєте до іншого
кінцевого пункту, вам доведеться використовувати інший експортер.

### ASP.NET Core

Щоб почати [трасування](/docs/concepts/signals/traces/) у застосунку на основі ASP.NET Core, використовуйте розширення OpenTelemetry для налаштування ASP.NET Core.

Спочатку переконайтеся, що у вас є правильні пакунки:

```sh
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

А потім налаштуйте це у вашій процедурі запуску ASP.NET Core, де у вас є доступ до `IServiceCollection`.

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Ці значення можуть надходити з конфігураційного файлу, файлу констант тощо.
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Налаштуйте важливі параметри OpenTelemetry, консольний експортер та бібліотеку інструментування
builder.Services.AddOpenTelemetry().WithTracing(tcb =>
{
    tcb
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddAspNetCoreInstrumentation()
    .AddConsoleExporter();
});
```

У наведеному вище прикладі [`Tracer`](/docs/concepts/signals/traces/#tracer) відповідний до сервісу впроваджується під час налаштування. Це дозволяє отримати доступ до екземпляра у вашому зіставленні точок доступу (або контролерах, якщо ви використовуєте старішу версію .NET).

Не обовʼязково робити інʼєкцію трасувальника на рівні сервісу, і це також не покращує продуктивність. Вам потрібно вирішити, де ви хочете, щоб ваш екземпляр трасувальника існував.

Тут ви також можете налаштувати бібліотеки інструментування.

Зверніть увагу, що цей приклад використовує Console Exporter. Якщо ви експортуєте до іншої точки доступу, вам доведеться використовувати інший експортер.

## Налаштування трасувальника {#setting-up-a-tracer}

Після ініціалізації трасування ви можете налаштувати [`Tracer`](/docs/concepts/signals/traces/#tracer), який буде використовуватися для трасування операцій з [`Span`](/docs/concepts/signals/traces/#spans).

Зазвичай `Tracer` створюється один раз на застосунок/сервіс, який інструментується, тому краще створити його один раз у спільному місці. Зазвичай він також називається так само як і назва сервісу.

### Інʼєкція трасувальника з ASP.NET Core {#injecting-tracer-with-aspnet-core}

ASP.NET Core зазвичай заохочує інʼєкцію екземплярів довготривалих обʼєктів, таких як `Tracer`, під час налаштування.

```csharp
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// ...

builder.Services.AddSingleton(TracerProvider.Default.GetTracer(serviceName));

// ...

var app = builder.Build();

// ...

app.MapGet("/hello", (Tracer tracer) =>
{
    using var span = tracer.StartActiveSpan("hello-span");

    // щось робить
});
```

### Отримання трасувальника від TracerProvider {#acquiring-a-tracer-from-a-tracerprovider}

Якщо ви не використовуєте ASP.NET Core або не хочете впроваджувати екземпляр `Tracer`, створіть його з вашого екземпляра [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider):

```csharp
// ...

var tracer = tracerProvider.GetTracer(serviceName);

// Призначте його десь глобально

//...
```

Ви, ймовірно, захочете призначити цей екземпляр `Tracer` змінній у центральному місці, щоб мати доступ до нього протягом усього сервісу.

Ви можете створити стільки `Tracer`, скільки вам потрібно на сервіс, хоча зазвичай достатньо мати один визначений на сервіс.

## Створення Відрізків {#creating-spans}

Щоб створити [відрізок](/docs/concepts/signals/traces/#spans), дайте йому імʼя та створіть його з вашого `Tracer`.

```csharp
using var span = MyTracer.StartActiveSpan("SayHello");

// виконуйте роботу, яку тепер відстежуватиме 'span'
```

## Створення вкладених Відрізків {#creating-nested-spans}

Якщо у вас є окрема під-операція, яку ви хочете відстежувати як частину іншої, ви можете створити відрізки, щоб представити це відношення.

```csharp
public static void ParentOperation(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // Виконуйте роботу, яку відстежує parentSpan

    ChildOperation(tracer);

    // Завершіть роботу, яку знову відстежує parentSpan
}

public static void ChildOperation(Tracer tracer)
{
    using var childSpan = tracer.StartActiveSpan("child-span");

    // Відстежуйте роботу в ChildOperation за допомогою childSpan
}
```

Коли ви переглядаєте відрізки в інструменті візуалізації трасування, `child-span` буде відстежуватися як вкладена операція під `parent-span`.

### Вкладені Відрізки в тій же області дії {#nested-spans-in-the-same-scope}

Ви можете створити відношення пращур-нащадок в отій же області дії. Хоча це можливо, це зазвичай не рекомендується, оскільки вам потрібно бути обережним, щоб завершити будь-який вкладений `TelemetrySpan`, коли ви очікуєте, що він завершиться.

```csharp
public static void DoWork(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // Виконуйте роботу, яку відстежує parentSpan

    using (var childSpan = tracer.StartActiveSpan("child-span"))
    {
        // Виконуйте "дитячу" роботу в тій же функції
    }

    // Завершіть роботу, яку знову відстежує parentSpan
}
```

У наведеному вище прикладі `childSpan` завершується, оскільки обсяг блоку `using` явно визначений, а не обмежений `DoWork` як `parentSpan`.

## Створення незалежних Відрізків {#creating-independent-spans}

Попередні приклади показали, як створювати [Відрізки](/docs/concepts/signals/traces/#spans), які слідують вкладеній ієрархії. У деяких випадках ви захочете створити незалежні Відрізки, які є братами та сестрами одного кореня, а не вкладеними.

```csharp
public static void DoWork(Tracer tracer)
{
    using var parent = tracer.StartSpan("parent");
    // 'parent' буде спільним батьком для обох 'child1' та 'child2'

    using (var child1 = tracer.StartSpan("child1"))
    {
        // виконуйте роботу, яку відстежує 'child1'
    }

    using (var child2 = tracer.StartSpan("child2"))
    {
        // виконуйте роботу, яку відстежує 'child2'
    }
}
```

## Створення нових кореневих Відрізків {#creating-new-root-spans}

Ви також можете створити нові кореневі [відрізки](/docs/concepts/signals/traces/#spans), які повністю відокремлені від поточного трасування.

```csharp
public static void DoWork(Tracer tracer)
{
    using var newRoot = tracer.StartRootSpan("newRoot");
}
```

## Отримання поточного Відрізка {#getting-the-current-span}

Іноді корисно отримати доступ до поточного `TelemetrySpan` у певний момент часу, щоб ви могли збагатити його додатковою інформацією.

```csharp
var span = Tracer.CurrentSpan;
// щось круте!
```

Зверніть увагу, що у попередньому прикладі не використовується `using`. Використання цього завершить поточний `TelemetrySpan`, коли він вийде з області дії, що, ймовірно, не є бажаною
поведінкою.

## Додавання атрибутів до Відрізків {#adding-attributes-to-spans}

[Атрибути](/docs/concepts/signals/traces/#attributes) дозволяють прикріплювати пари ключ/значення до `TelemetrySpan`, щоб він містив більше інформації про поточну операцію, яку він відстежує.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

span.SetAttribute("operation.value", 1);
span.SetAttribute("operation.name", "Saying hello!");
span.SetAttribute("operation.other-stuff", new int[] { 1, 2, 3 });
```

## Додавання подій {#adding-events}

[Подія](/docs/concepts/signals/traces/#span-events) — це повідомлення, яке легко читається людиною, на `TelemetrySpan`, що представляє "щось, що відбувається" під час його життєвого циклу. Ви можете думати про це як про примітивний лог.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("Doing something...");

// ...

span.AddEvent("Dit it!");
```

Події також можуть бути створені з часовою міткою та колекцією [атрибутів](/docs/concepts/signals/traces/#attributes).

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("event-message");
span.AddEvent("event-message2", DateTimeOffset.Now);

// ...

var attributeData = new Dictionary<string, object>
{
    {"foo", 1 },
    { "bar", "Hello, World!" },
    { "baz", new int[] { 1, 2, 3 } }
};

span.AddEvent("asdf", DateTimeOffset.Now, new(attributeData));
```

## Додавання посилань {#adding-links}

`TelemetrySpan` може бути створений з нульовою або більше [`Link`ʼів](/docs/concepts/signals/traces/#span-links), які є повʼязаними.

```csharp
// Отримайте контекст звідкись, можливо, він передається як параметр
var ctx = span.Context;

var links = new List<Link>
{
    new(ctx)
};

using var span = tracer.StartActiveSpan("another-span", links: links);

// виконуйте роботу
```

## Встановлення статусу відрізка {#set-span-status}

[Статус](/docs/concepts/signals/traces/#span-status) може бути встановлений на відрізок, зазвичай використовується для вказівки, що відрізок не завершився успішно — `StatusCode.Error`. У рідкісних випадках ви можете перевизначити статус `Error` на `Ok`, але не встановлюйте `Ok` на успішно завершених відрізках.

Статус може бути встановлений у будь-який час до завершення відрізка:

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// робить щось
}
catch (Exception ex)
{
    span.SetStatus(new(StatusCode.Error, "Щось пішло не так!"));
}
```

## Запис помилок у відрізки {#record-exceptions-in-spans}

Може бути гарною ідеєю записувати помилки, коли вони трапляються. Рекомендується робити це разом з встановленням [статусу відрізка](#set-span-status).

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// робить щось
}
catch (Exception ex)
{
    span.SetStatus(new(StatusCode.Error, "Щось пішло не так!"));
    span.RecordException(ex)
}
```

Це захопить такі речі, як поточний стек викликів, як атрибути у відрізок.

## Наступні кроки {#next-steps}

Після налаштування ручного інструментування, ви можете захотіти використовувати [бібліотеки інструментування](/docs/languages/dotnet/libraries). Бібліотеки інструментування інструментуватимуть відповідні бібліотеки, які ви використовуєте, і генеруватимуть дані для таких речей, як вхідні та вихідні HTTP-запити та інше.

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/dotnet/exporters) до одного або більше бекендів телеметрії.

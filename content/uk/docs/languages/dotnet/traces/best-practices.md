---
title: Поради
linkTitle: Поради
description: Дізнайтеся про найкращі практики використання OpenTelemetry .NET для трасування
weight: 120
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: tracerprovider
---

Дотримуйтесь цих порад, щоб отримати максимальну вигоду від OpenTelemetry .NET для трасування.

## Версії пакунків {#package-version}

Використовуйте API [System.Diagnostics.Activity](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity) з останньої стабільної версії пакунка [System.Diagnostics.DiagnosticSource](https://www.nuget.org/packages/System.Diagnostics.DiagnosticSource/), незалежно від версії середовища виконання .NET, що використовується:

- Якщо ви використовуєте останню стабільну версію [OpenTelemetry .NET SDK](/docs/languages/dotnet/), вам не потрібно турбуватися про версію пакунка `System.Diagnostics.DiagnosticSource`, оскільки це вже зроблено за вас через залежність пакунка.
- Команда .NET runtime ставить високі вимоги до зворотної сумісності `System.Diagnostics.DiagnosticSource` навіть під час значних оновлень версій, тому сумісність тут не є проблемою.

## Tracing API

### ActivitySource

Уникайте надто частого створення [`System.Diagnostics.ActivitySource`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource). `ActivitySource` є досить дорогим і призначений для повторного використання в усьому застосунку. Для більшості застосунків його можна моделювати як статичне поле тільки для читання або синглтон за допомогою інʼєкції залежностей.

Використовуйте розділене крапками [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) як [`ActivitySource.Name`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource.name). У багатьох випадках використання повного імені класу може бути хорошим варіантом. Наприклад:

```csharp
static readonly ActivitySource MyActivitySource = new("MyCompany.MyProduct.MyLibrary");
```

### Activity

Для кращої продуктивності перевірте [`Activity.IsAllDataRequested`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.isalldatarequested) перед [встановленням теґів](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag).

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    if (activity != null && activity.IsAllDataRequested == true)
    {
        activity.SetTag("http.url", "http://www.mywebsite.com");
    }
}
```

Використовуйте [Activity.SetTag](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag) для [встановлення атрибутів](/docs/specs/otel/trace/api/#set-attributes).

Завершіть або зупиніть активність належним чином. Це можна зробити неявно за допомогою оператора `using`, що є рекомендованим. Ви також можете явно викликати [Activity.Dispose](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.dispose) або [Activity.Stop](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.stop).

> [!NOTE]
>
> Активності, які ще не завершені/не зупинені, не будуть експортовані.

Уникайте виклику [Activity.AddEvent](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.addevent) у циклі. Дії не призначені для обробки сотень або тисяч подій, кращим варіантом є використання [корельованих логів](/docs/languages/dotnet/logs/correlation/) або [Activity.Links](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.links). Наприклад:

> [!WARNING]
>
> Наступний код не моделює `Activity.Events` правильно і, швидше за все, матиме проблеми з зручністю використання та продуктивністю.

```csharp
private static async Task Test()
{
    Activity activity = Activity.Current;

    while (true)
    {
        activity.AddEvent(new ActivityEvent("Processing background task."));
        await Task.Delay(1000);
    }
}
```

## Управління TracerProvider {#tracerprovider-management}

Уникайте частого створення екземплярів `TracerProvider`. `TracerProvider` є досить витратним і призначений для повторного використання в усьому застосунку. Для більшості застосунків достатньо одного екземпляра `TracerProvider` на процес.

Керуйте життєвим циклом екземплярів `TracerProvider`, якщо вони створюються вами.

Як загальне правило:

- Якщо ви створюєте застосунок з [інʼєкцією залежностей (DI, dependency injection)](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection) (наприклад, [ASP.NET Core](https://learn.microsoft.com/aspnet/core) та [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)), у більшості випадків ви повинні створити екземпляр `TracerProvider` і дозволити DI керувати його життєвим циклом. Ознайомтеся з [Початок роботи з OpenTelemetry .NET Traces за 5 хвилин — застосунок ASP.NET Core](/docs/languages/dotnet/traces/getting-started-aspnetcore/) для отримання додаткової інформації.
- Якщо ви створюєте застосунок без DI, створіть екземпляр `TracerProvider` і керуйте його життєвим циклом явно. Ознайомтеся з [Початок роботи з OpenTelemetry .NET Traces за 5 хвилин - консольний застосунок](/docs/languages/dotnet/traces/getting-started-console/) для отримання додаткової інформації.
- Якщо ви забудете звільнити екземпляр `TracerProvider` перед завершенням застосунку, активності можуть бути втрачені через відсутність належного скидання.
- Якщо ви звільните екземпляр `TracerProvider` занадто рано, будь-які подальші активності не будуть зібрані.

## Кореляція {#correlation}

У OpenTelemetry трасування автоматично [корелюються з логами](/docs/languages/dotnet/logs/best-practices/#log-correlation) і можуть бути [корелюються з метриками](/docs/languages/dotnet/metrics/best-practices/#metrics-correlation) через [екземпляри](/docs/languages/dotnet/metrics/exemplars/).

### Створення Activities вручну {#manually-creating-activities}

Як показано в [посібнику з початку роботи](/docs/languages/dotnet/traces/getting-started-console/), дуже легко вручну створити `Activity`. Через це може виникнути спокуса створити занадто багато активностей (наприклад, для кожного виклику методу). На додачу до того, що це дорого, надмірні активності також можуть ускладнити візуалізацію трейсів. Замість того, щоб вручну створювати `Activity`, перевірте, чи можете ви скористатися бібліотеками інструментування, такими як [ASP.NET Core](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.AspNetCore/README.md), [HttpClient](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.Http/README.md), які не тільки створять і заповнять `Activity` теґами (атрибутами), але й подбають про поширення/відновлення контексту за межі процесів.

Якщо `Activity`, створена бібліотекою інструментування, не містить деякої інформації, яка вам потрібна, зазвичай рекомендується збагачувати наявну `Activity` цією інформацією, а не створювати нову.

### Створення статичних теґів як Resource {#modelling-static-tags-as-resource}

Теґи, такі як `MachineName`, `Environment` тощо, які є статичними протягом життєвого циклу процесу, повинні бути змодельовані як `Resource`, замість того, щоб додавати їх до кожної `Activity`.

## Загальні проблеми, які призводять до відсутності трейсів {#common-issues-that-lead-to-missing-traces}

Наступні проблеми є поширеними причинами відсутності трейсів:

- `ActivitySource`, що використовується для створення `Activity`, не додано до `TracerProvider`. Використовуйте метод `AddSource`, щоб увімкнути активність з даного `ActivitySource`.
- `TracerProvider` звільнено занадто рано. Ви повинні переконатися, що екземпляр `TracerProvider` залишається активним для збору трейсів. У типовому застосунку один `TracerProvider` створюється під час запуску застосунку і звільняється під час завершення роботи застосунку. Для застосунку ASP.NET Core використовуйте методи `AddOpenTelemetry` та `WithTraces` з пакету `OpenTelemetry.Extensions.Hosting`, щоб правильно налаштувати `TracerProvider`.

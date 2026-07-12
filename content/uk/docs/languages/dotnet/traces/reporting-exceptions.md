---
title: Повідомлення про помилки
linkTitle: Помилки
description: Дізнайтеся, як повідомляти про помилки в трасуваннях OpenTelemetry .NET
weight: 40
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: AppDomain seterrorstatusonexception
---

Цей посібник описує, як повідомляти про помилки в трасуваннях OpenTelemetry, коли ви вручну створюєте активності (відрізки). Якщо ви використовуєте одну з [бібліотек інструментації](/docs/languages/dotnet/instrumentation/), вона може автоматично надавати ці функції.

## Обробка помилок в трейсах {#understanding-exception-handling-in-traces}

У OpenTelemetry важливо повідомляти про помилки у ваших трейсах, щоб надати контекст про помилки, які виникають у вашому застосунку. Існує кілька способів обробки цього, від базового звіту про статус до повних деталей помилок.

## Помилки, що обробляються користувачем {#user-handled-exceptions}

Помилки, що обробляються користувачем, — це помилки, які перехоплюються та обробляються застосунком:

```csharp
try
{
    Func();
}
catch (SomeException ex)
{
    DoSomething();
}
catch (Exception ex)
{
    DoSomethingElse();
    throw;
}
```

OpenTelemetry .NET надає кілька варіантів для повідомлення про ці помилки у ваших трейсах.

### Варіант 1: Встановити статус активності вручну{#option-1-set-activity-status-manually}

Найбільш базовий варіант — це встановити статус активності в Error, щоб вказати, що сталася помилка:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        DoSomething();
    }
    catch (Exception ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        throw;
    }
}
```

### Варіант 2: Використання функції SetErrorStatusOnException{#option-2-use-seterrorstatusonexception-feature}

Якщо у вас є глибоко вкладені активності або активності, створені в сторонніх бібліотеках, ручне встановлення статусу може бути складним. Замість цього ви можете налаштувати SDK для автоматичного виявлення помилок і встановлення статусу активності:

```csharp
Sdk.CreateTracerProviderBuilder()
    .SetErrorStatusOnException()
    // інша конфігурація...
    .Build();
```

З цією конфігурацією будь-яка помилка, що виникає під час активності, автоматично встановить статус цієї активності на Error.

> [!NOTE]
>
> Ця функція залежить від платформи, оскільки вона покладається на `System.Runtime.InteropServices.Marshal.GetExceptionPointers`.

### Варіант 3: Включення опису помилки {#option-3-include-error-description}

Ви можете включити повідомлення про помилку як опис статусу для більшого контексту:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    }
}
```

### Варіант 4: Записати повну помилку {#option-4-record-the-full-exception}

Для найкращого досвіду налагодження використовуйте `Activity.RecordException()`, щоб зберегти помилку в активності як подію:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
        activity?.RecordException(ex);
    }
}
```

Цей код захопить тип помилки, повідомлення та трасування стеку в активності, що зробить їх доступними у вашій системі трасування.

## Необроблені помилки {#unhandled-exceptions}

Необроблені помилки — це помилки, які не перехоплюються та не обробляються застосунком. Вони зазвичай призводять до аварійного завершення процесу або завершення потоку.

Ви можете захопити необроблені помилки та записати їх у своїх активних активностях, використовуючи обробник подій `AppDomain.UnhandledException`:

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

public class Program
{
    private static readonly ActivitySource MyActivitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

    public static void Main()
    {
        AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionHandler;

        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddSource("MyCompany.MyProduct.MyLibrary")
            .SetSampler(new AlwaysOnSampler())
            .SetErrorStatusOnException()
            .AddConsoleExporter()
            .Build();

        using (MyActivitySource.StartActivity("Foo"))
        {
            using (MyActivitySource.StartActivity("Bar"))
            {
                throw new Exception("Oops!");
            }
        }
    }

    private static void UnhandledExceptionHandler(object source, UnhandledExceptionEventArgs args)
    {
        var ex = (Exception)args.ExceptionObject;

        var activity = Activity.Current;

        while (activity != null)
        {
            activity.RecordException(ex);
            activity.Dispose();
            activity = activity.Parent;
        }
    }
}
```

> [!CAUTION]
>
> Використовуйте `AppDomain.UnhandledException` з обережністю. Викидання винятку в цьому обробнику ставить процес у стан, з якого неможливо відновитися.

## Поради {#best-practices}

При звітуванні про помилки в трейсах OpenTelemetry:

1. **Завжди встановлюйте статус в Error**: Щонайменше, встановіть статус активності в Error, коли виникає помилка.

2. **Включайте деталі помилок**: Використовуйте `RecordException()`, щоб захопити повну інформацію про помилку, коли це можливо.

3. **Обробляйте необроблені помилки**: Розгляньте можливість налаштування глобального обробника для необроблених помилок, щоб забезпечити їх захоплення у ваших трейсах.

4. **Розгляньте можливість автоматизації**: Використовуйте параметр SDK `SetErrorStatusOnException()`, щоб автоматизувати встановлення статусу для помилок.

5. **Слідкуйте за кардинальністю**: Будьте обережні при включенні змінних повідомлень про помилки безпосередньо в описах статусу, оскільки це може збільшити кардинальність ваших відрізків.

## Досліджуйте більше {#learn-more}

- [Activity API Reference](https://learn.microsoft.com/dotnet/core/diagnostics/distributed-tracing-concepts)

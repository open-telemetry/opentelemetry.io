---
title: Створення звʼязків між трейсами
linkTitle: Звʼязки
description: Дізнайтеся, як створювати звʼязки між трасуваннями за допомогою OpenTelemetry .NET
weight: 50
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
# prettier-ignore
cSpell:ignore: activitycontext nestedActivity батьківсько-дочірнього
---

Цей посібник пояснює, як створювати звʼязки між трейсами в OpenTelemetry .NET, що може бути корисно для операцій розгалуження, пакетної обробки або кореляції повʼязаних активностей у різних трейсах.

## Що таке звʼязки між трейсами? {#what-are-trace-links}

В OpenTelemetry звʼязки дозволяють встановлювати звʼязки між відрізками (або активностями в .NET), які повʼязані, але можуть не мати прямого батьківсько-дочірнього звʼязку. Це особливо корисно в розподілених системах, де потрібно корелювати кілька операцій, які можуть бути частинами різних трейсів.

Звичайні сценарії використання звʼязків включають:

- **Операції розгалуження**: Коли один запит викликає кілька паралельних операцій
- **Пакетна обробка**: Коли кілька вхідних запитів обробляються в одному пакеті
- **Асинхронна обробка**: Коли операції обробляються асинхронно в різних трейсах
- **Крос-сервісна кореляція**: Коли потрібно зʼєднати повʼязані операції між різними сервісами

## Створення звʼязків до наявних активностей {#creating-links-to-existing-activities}

Наступний приклад демонструє, як створити нові кореневі активності, які посилаються на наявну активність:

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

// Створити джерело активності
var activitySource = new ActivitySource("MyCompany.MyApplication");

// Налаштувати OpenTelemetry
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyApplication")
    .AddConsoleExporter()
    .Build();

// Запустити батьківську активність
using (var orchestratingActivity = activitySource.StartActivity("OrchestratingActivity"))
{
    orchestratingActivity?.SetTag("operation", "main-process");

    // Розгалуження на кілька операцій з повʼязаними активностями
    await DoFanoutAsync(activitySource, 3);

    // Продовжити з оригінальною активністю
    using (var nestedActivity = activitySource.StartActivity("WrapUp"))
    {
        nestedActivity?.SetTag("status", "completed");
    }
}

// Метод, який створює нові кореневі активності зі звʼязками
async Task DoFanoutAsync(ActivitySource source, int operationCount)
{
    // Зберегти поточну активність, щоб відновити її пізніше
    var previous = Activity.Current;

    // Отримати контекст поточної активності для звʼязування
    var activityContext = Activity.Current!.Context;
    var links = new List<ActivityLink>
    {
        new ActivityLink(activityContext),
    };

    var tasks = new List<Task>();

    // Створити кілька нових кореневих активностей, які посилаються на оригінальну активність
    for (int i = 0; i < operationCount; i++)
    {
        int operationIndex = i;

        var task = Task.Run(() =>
        {
            // Встановити поточну активність в null, щоб створити нову кореневу активність
            Activity.Current = null;

            // Створити нову кореневу активність зі звʼязком на оригінальну активність
            using var newRootActivity = source.StartActivity(
                ActivityKind.Internal,
                name: $"FannedOutActivity {operationIndex + 1}",
                links: links);

            // Виконати роботу для цієї операції...
        });

        tasks.Add(task);
    }

    // Дочекатися завершення всіх розгалужених операцій
    await Task.WhenAll(tasks);

    // Відновити оригінальний контекст активності
    Activity.Current = previous;
}
```

## Розуміння результату {#understanding-the-output}

Коли ви запустите цей код, у вихідних даних ви побачите кілька активностей:

1. Один трейс для `OrchestratingActivity` (оригінальна активність)
2. Кілька незалежних трейсів, по одному для кожного `FannedOutActivity`
3. Кожен `FannedOutActivity` має посилання на `OrchestratingActivity`

Вихідні дані будуть виглядати приблизно так:

```text
Activity.TraceId:            5ce4d8ad4926ecdd0084681f46fa38d9
Activity.SpanId:             8f9e9441f0789f6e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyApplication
Activity.DisplayName:        FannedOutActivity 1
Activity.Kind:               Internal
Activity.StartTime:          2023-10-17T01:24:40.4957326Z
Activity.Duration:           00:00:00.0008656
Activity.Links:
    2890476acefb53b93af64a0d91939051 16b83c1517629363
```

Зверніть увагу, що ця активність має:

- Новий ідентифікатор трейсу (`5ce4d8ad4926ecdd0084681f46fa38d9`)
- Посилання на оригінальний ідентифікатор трейсу та ідентифікатор відрізку активності (`2890476acefb53b93af64a0d91939051 16b83c1517629363`)

## Коли використовувати звʼязки {#when-to-use-links}

Розгляньте можливість використання звʼязків у таких сценаріях:

1. **Операції з високою кардинальністю**: Коли одна операція генерує тисячі відрізків, створення окремих трейсів із звʼязками може спростити візуалізацію та аналіз.

2. **Паралельна обробка**: Коли ви обробляєте елементи паралельно і хочете відстежувати обробку кожного елемента незалежно, зберігаючи звʼязок з оригінальним запитом.

3. **Асинхронні робочі процеси**: Коли операції відбуваються асинхронно і можуть не завершитися в межах одного життєвого циклу трейса.

## Компроміси використання звʼязків {#tradeoffs-of-using-links}

Хоча звʼязки забезпечують гнучкість, є кілька моментів, які слід враховувати:

- **Кілька трейсів**: Замість одного єдиного трейса, ви отримаєте кілька повʼязаних трейсів.
- **Складність візуалізації**: Деякі інструменти спостереження можуть мати обмежену підтримку візуалізації звʼязаних трейсів.
- **Складність аналізу**: Аналіз даних через звʼязані трейси вимагає більш складних запитів.

## Поради {#best-practices}

1. **Використовуйте змістовні назви активностей**: Вибирайте чіткі назви, які вказують на мету кожної звʼязаної активності.
2. **Додавайте контекстуальні теґи**: Включайте теґи, які допомагають визначити, чому активності повʼязані.
3. **Відновлюйте оригінальний контекст**: Завжди відновлюйте оригінальний Activity.Current після створення звʼязаних активностей.
4. **Використовуйте обережно**: Створюйте нові кореневі активності лише за необхідності, щоб уникнути фрагментації ваших даних трасування.

## Дізнайтесь більше {#learn-more}

- [OpenTelemetry Specification: Звʼязки між відрізками](/docs/specs/otel/overview/#links-between-spans)
- [Activity Creation Options](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#activity-creation-options)

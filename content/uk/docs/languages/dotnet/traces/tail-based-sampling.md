---
title: Вибірка наприкінці
linkTitle: Вибірка наприкінці
description: Дізнайтеся, як реалізувати вибірку наприкінці для захоплення всіх невдалих відрізків у OpenTelemetry .NET
weight: 29
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

У цьому посібнику описується один із можливих способів досягнення форми вибірки наприкінці, щоб включити всі невдалі активності (відрізки) на додачу до вибірки на початку в OpenTelemetry .NET.

## Що таке вибірка наприкінці? {#what-is-tail-based-sampling}

Вибірка наприкінці приймає рішення про вибірку після завершення трасування, що дозволяє приймати більш обґрунтовані рішення на основі повного контексту трасування. Вона на відрізняється від вибірки на початку, яка приймає рішення на початку трасування.

Ця реалізація використовує комбінацію власного семплера та `ActivityProcessor` (процесора відрізків), щоб досягти гібридного підходу:

- Вибірка на початку (ймовірнісна/неупереджена вибірка)
- Вибірка наприкінці (не ймовірнісна/упереджена вибірка)

## Підхід до реалізації {#implementation-approach}

SDK використовує гібридний підхід, де ми виконуємо вибірку на початку, щоб отримати ймовірнісний підмножину всіх активностей, яка включає як успішні активності, так і невдалі активності. Крім того, він захоплює всі невдалі активності.

Щоб досягти цього:

1. Якщо батьківський семплер вирішує відмовитися від активності, SDK повертає результат семплінгу «Record-Only» (Тільки запис). Це гарантує, що процесор активності отримає цю активність.
2. У процесорі активності, наприкінці активності, SDK перевіряє, чи є вона невдалою. Якщо так, SDK змінює рішення з «Record-Only» на встановлення прапорця вибірки, щоб експортер отримав активність.

У цьому прикладі кожна активність фільтрується окремо, без урахування інших видів активності.

## Коли використовувати вибірку наприкінці {#when-to-use-tail-based-sampling}

Це хороший варіант, якщо ви хочете отримати всі невдалі активності на додачу до вибірки на початку. З цим підходом ви отримуєте базову вибірку на рівні активності наприкінці на рівні SDK без необхідності встановлювати будь-які додаткові компоненти.

## Компроміси {#tradeoffs}

Вибірка наприкінці в такий спосіб включає кілька компромісів:

1. **Додаткові витрати на продуктивність**: На відміну від вибірки на початку, де рішення про вибірку приймається під час створення активності, у вибірці наприкінці рішення приймається лише в кінці, тому є додаткові витрати на памʼять/обробку.

2. **Часткові трейси**: Оскільки ця вибірка здійснюється на рівні активності, згенерований трейс буде частковим. Наприклад, якщо інша частина дерева викликів є успішною, ці активності можуть не бути експортовані, що призведе до неповного трейсу.

3. **Кілька експортерів**: Якщо використовується кілька експортерів, це рішення вплине на всіх.

## Приклад коду {#example-code}

Реалізація складається з двох основних компонентів:

### 1. Настроюваний семплер на основі батьківського елемента, що дозволяє приймати рішення «Record-Only»:{#1-a-custom-parent-based-sampler-that-allows-record-only-decisions}

```csharp
public class ParentBasedElseAlwaysRecordSampler : Sampler
{
    private readonly Sampler _rootSampler;

    public ParentBasedElseAlwaysRecordSampler(Sampler rootSampler)
        : base()
    {
        _rootSampler = rootSampler ?? throw new ArgumentNullException(nameof(rootSampler));
    }

    public override SamplingResult ShouldSample(in SamplingParameters samplingParameters)
    {
        // Якщо є батьківський контекст, використовуйте його рішення про вибірку
        if (samplingParameters.ParentContext.TraceId != default)
        {
            if (samplingParameters.ParentContext.TraceFlags.HasFlag(ActivityTraceFlags.Recorded))
            {
                return new SamplingResult(SamplingDecision.RecordAndSample);
            }
            else
            {
                // Замість того, щоб відкидати, ми записуємо цю активність, щоб мати змогу обробити її в нашому
                // процесорі
                return new SamplingResult(SamplingDecision.RecordOnly);
            }
        }

        // Це коренева активність. Використовуйте кореневий семплер для прийняття рішення.
        return _rootSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"ParentBasedElseAlwaysRecordSampler({_rootSampler.Description})";
}
```

### 2. Процесор вибірки наприкінці, який вибірково відбирає дані про невдалі дії: {#2-a-tail-sampling-processor-that-selectively-samples-failed-activities}

```csharp
public class TailSamplingProcessor : BaseProcessor<Activity>
{
    private readonly string _statusTagName;

    public TailSamplingProcessor(string statusTagName = "otel.status_code")
    {
        _statusTagName = statusTagName;
    }

    public override void OnEnd(Activity activity)
    {
        // Якщо активність вже вибрана, нічого не потрібно робити
        if (activity.ActivityTraceFlags.HasFlag(ActivityTraceFlags.Recorded))
        {
            return;
        }

        // Перевірка, чи є це помилковою активністю
        bool isError = false;

        if (activity.Status == ActivityStatusCode.Error)
        {
            isError = true;
        }
        else if (activity.TagObjects != null)
        {
            foreach (var tag in activity.TagObjects)
            {
                if (tag.Key == _statusTagName)
                {
                    if (tag.Value?.ToString() == "ERROR")
                    {
                        isError = true;
                        break;
                    }
                }
            }
        }

        if (isError)
        {
            Console.WriteLine($"Including error activity with id {activity.Id} and status {activity.Status}");
            activity.ActivityTraceFlags |= ActivityTraceFlags.Recorded;
        }
        else
        {
            Console.WriteLine($"Dropping activity with id {activity.Id} and status {activity.Status}");
        }
    }
}
```

## Приклад виводу {#example-output}

Коли ви запускаєте програму, використовуючи цей семплер і процесор, ви повинні побачити вихідні дані, схожі на такі:

```text
Including error activity with id
00-404ddff248b8f9a9b21e347d68d2640e-035858bc3c168885-01 and status Error
Activity.TraceId:            404ddff248b8f9a9b21e347d68d2640e
Activity.SpanId:             035858bc3c168885
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.5563112Z
Activity.Duration:           00:00:00.0028144
Activity.Tags:
    foo: bar
StatusCode: Error
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel

Dropping activity with id 00-ea861bda268c58d328ab7cbe49851499-daba29055de80a53-00
and status Ok

Including head-sampled activity with id
00-f3c88010615e285c8f3cb3e2bcd70c7f-f9316215f12437c3-01 and status Ok
Activity.TraceId:            f3c88010615e285c8f3cb3e2bcd70c7f
Activity.SpanId:             f9316215f12437c3
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.8519346Z
Activity.Duration:           00:00:00.0000034
Activity.Tags:
    foo: bar
StatusCode: Ok
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel
```

Це показує, що:

1. Помилкові активності завжди включаються (через вибірку наприкінці)
2. Деякі активності з кодом статусу OK відкидаються (якщо не вибрані на початку)
3. Деякі активності з кодом статусу OK включаються (через вибірку на початку)

## Повний приклад {#complete-example}

Для повного прикладу, включаючи робочий застосунок, дивіться [репозиторій OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples).

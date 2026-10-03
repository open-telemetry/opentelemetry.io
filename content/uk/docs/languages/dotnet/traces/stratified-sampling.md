---
title: Стратифікована вибірка
linkTitle: Стратифікована вибірка
description: Дізнайтеся, як реалізувати стратифіковану вибірку для трасувань OpenTelemetry у .NET
weight: 28
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: userinitiated підпопуляції
---

Цей посібник демонструє один із можливих способів досягнення стратифікованої вибірки в OpenTelemetry .NET.

## Що таке стратифікована вибірка? {#what-is-stratified-sampling}

Стратифікована вибірка — це спосіб поділу популяції на взаємно виключні підпопуляції або "страти" (strata). Наприклад, страти для популяції "запитів" можуть бути "запити, ініційовані користувачем", і "програмні запити". Кожна страта потім вибирається за допомогою ймовірнісного методу вибірки. Це забезпечує те, що всі підпопуляції представлені.

## Підхід до реалізації {#implementation-approach}

SDK досягає цього, використовуючи власний `Sampler`, який внутрішньо містить два вибірники. В залежності від страти викликається відповідний вибірник.

Однією з необхідних умов для цього є те, що теґ (наприклад, `queryType`), який використовується для прийняття рішення про стратифіковану вибірку, повинен бути вказаний під час створення активності.

SDK використовує непропорційну стратифіковану вибірку, також відому як "вибірка з нерівними ймовірностями". Наприклад, розмір вибірки кожної підпопуляції не пропорційний їхньому виникненню в загальній популяції. У цьому прикладі ми хочемо забезпечити представлення всіх запитів, ініційованих користувачем, тому ми використовуємо 100% рівень вибірки для них, тоді як рівень вибірки, обраний для програмних запитів, набагато нижчий.

## Приклад коду {#example-code}

Ключовим компонентом є клас `StratifiedSampler`:

```csharp
public class StratifiedSampler : Sampler
{
    private readonly string _stratifyByTagName;
    private readonly Dictionary<string, Sampler> _samplersByStratum;
    private readonly Sampler _defaultSampler;

    public StratifiedSampler(
        string stratifyByTagName,
        Dictionary<string, Sampler> samplersByStratum,
        Sampler defaultSampler)
        : base()
    {
        _stratifyByTagName = stratifyByTagName;
        _samplersByStratum = samplersByStratum;
        _defaultSampler = defaultSampler;
    }

    public override SamplingResult ShouldSample(
        in SamplingParameters samplingParameters)
    {
        ReadOnlySpan<KeyValuePair<string, object>> attributes =
            samplingParameters.Tags;

        for (int i = 0; i < attributes.Length; i++)
        {
            if (attributes[i].Key.Equals(_stratifyByTagName,
                StringComparison.OrdinalIgnoreCase))
            {
                string stratum = attributes[i].Value.ToString().ToLowerInvariant();
                if (_samplersByStratum.TryGetValue(stratum, out Sampler sampler))
                {
                    Console.WriteLine($"StratifiedSampler handling {stratum} query");
                    return sampler.ShouldSample(samplingParameters);
                }

                break;
            }
        }

        return _defaultSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"StratifiedSampler: {_stratifyByTagName}";
}
```

## Приклад виводу {#output-example}

Коли ви запускаєте застосунок, що використовує цей вибірник, ви повинні побачити вихідні дані, подібні до наведених нижче:

```text
StratifiedSampler handling userinitiated query
Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             83bdc6bbebea1df8
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       1ddd00d845ad645e
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8156879Z
Activity.Duration:           00:00:00.0008656
Activity.Tags:
    queryType: userInitiated
    foo: child
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType

Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             1ddd00d845ad645e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8115186Z
Activity.Duration:           00:00:00.0424036
Activity.Tags:
    queryType: userInitiated
    foo: bar
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType
```

Це показує, що дві підгрупи популяції (страти) відбираються незалежно одна від одної, причому до кожної страти застосовуються різні коефіцієнти вибірки.

## Повний приклад {#full-example}

Для повного прикладу, включаючи робочий застосунок, дивіться [репозиторій OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples).

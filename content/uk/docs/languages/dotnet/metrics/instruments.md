---
title: Інструменти метрик
linkTitle: Інструменти
description: Дізнайтеся про різні типи інструментів метрик, доступних у
  OpenTelemetry .NET
weight: 50
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: updowncounter кібібайти мебібайти
---

У цьому посібнику пояснюються різні типи інструментів метрик, доступних в OpenTelemetry .NET, та способи їх ефективного використання.

## Розуміння інструментів метрик {#understanding-metric-instruments}

OpenTelemetry надає кілька типів інструментів для вимірювання різних видів даних:

| Тип інструмента | Поведінка                                           | Типовий приклад використання           |
| --------------- | --------------------------------------------------- | -------------------------------------- |
| Counter         | Значення, яке зростає монотонно                     | Кількість запитів, кількість помилок   |
| UpDownCounter   | Значення, яке може зростати або зменшуватися        | Розмір черги, активні зʼєднання        |
| Histogram       | Розподіл зафіксованих значень                       | Тривалість запитів, розміри відповідей |
| Gauge           | Спостереження за значенням у конкретний момент часу | Використання ЦП, використання памʼяті  |

## Counter

Лічильник реєструє значення, яке підсумовується з часом і ніколи не зменшується. Він ідеально підходить для показників, які тільки збільшуються, таких як кількість запитів, виконаних операцій або кількість помилок.

### Створення лічильника {#creating-a-counter}

```csharp
using System.Diagnostics.Metrics;

// Створити вимірювач
var meter = new Meter("MyCompany.MyProduct", "1.0.0");

// Створити лічильник
var requestCounter = meter.CreateCounter<long>("request_counter", "requests", "Counts the number of requests");
```

### Запис вимірювань {#recording-measurements}

```csharp
// Збільшити на 1
requestCounter.Add(1);

// Збільшити з атрибутами
requestCounter.Add(1, new("endpoint", "/api/users"), new("method", "GET"));
```

## UpDownCounter

UpDownCounter реєструє значення, яке може як зростати, так і зменшуватися, представляючи собою поточне значення в даний момент часу. Він корисний для відстеження таких значень, як розміри черг, активні зʼєднання або використання пулу ресурсів.

### Створення UpDownCounter {#creating-an-updowncounter}

```csharp
// Створити лічильник UpDown
var activeConnectionsCounter = meter.CreateUpDownCounter<int>("active_connections", "connections", "Number of active connections");
```

### Запис вимірювань UpDownCounter {#recording-updowncounter-measurements}

```csharp
// Збільшити на 1
activeConnectionsCounter.Add(1);

// Зменшити на 1
activeConnectionsCounter.Add(-1);

// З атрибутами
activeConnectionsCounter.Add(1, new("pool", "worker"), new("region", "west"));
```

## Histogram

Гістограма реєструє розподіл значень, захоплюючи статистику, таку як кількість, сума, мінімум, максимум і процентилі. Вона ідеально підходить для вимірювання тривалостей, розмірів та інших розподілених значень.

### Створення гістограми {#creating-a-histogram}

```csharp
// Створити гістограму
var requestDurationHistogram = meter.CreateHistogram<double>("request_duration", "ms", "Тривалість запиту в мілісекундах");
```

### Запис вимірювань гістограми {#recording-histogram-measurements}

```csharp
// Записати тривалість
requestDurationHistogram.Record(213.5);

// З атрибутами
requestDurationHistogram.Record(42.3, new("endpoint", "/api/users"), new("method", "GET"));
```

## Спостережувані інструменти {#observable-instruments}

Спостережувані інструменти дозволяють збирати вимірювання за запитом, коли метрики збираються, а не реєструються безпосередньо у вашому коді. Це корисно для метрик, які краще підходять для періодичного вибіркового контролю.

### Спостережуваний лічильник {#observable-counter}

```csharp
// Створити спостережуваний лічильник
meter.CreateObservableCounter("processed_items_total", () =>
{
    // Повернути поточну кількість з деякого внутрішнього стану
    return new Measurement<long>(GetCurrentProcessedCount(), new("queue", "default"));
}, "items", "Загальна кількість оброблених елементів");
```

### Спостережуваний UpDownCounter {#observable-updowncounter}

```csharp
// Створити спостережуваний UpDownCounter
meter.CreateObservableUpDownCounter("active_tasks", () =>
{
    // Повернути поточні значення з внутрішнього стану
    return new[]
    {
        new Measurement<int>(GetHighPriorityTaskCount(), new("priority", "high")),
        new Measurement<int>(GetLowPriorityTaskCount(), new("priority", "low"))
    };
}, "tasks", "Current number of active tasks");
```

### Спостережуваний gauge {#observable-gauge}

```csharp
// Створити спостережуваний gauge
meter.CreateObservableGauge("cpu_usage", () =>
{
    // Отримати поточний відсоток використання ЦП
    return new Measurement<double>(GetCurrentCpuUsage());
}, "%", "Поточний відсоток використання ЦП");
```

## Групування спостережуваних вимірювань {#batching-observable-measurements}

Ви також можете зареєструвати зворотний виклик, який повертає кілька вимірювань для декількох інструментів:

```csharp
// Зареєструйте один зворотний виклик для декількох спостережуваних інструментів
var observableCounter = meter.CreateObservableCounter<long>("my_observable_counter", "items");
var observableGauge = meter.CreateObservableGauge<double>("my_observable_gauge", "%");

meter.RegisterObservableCallback(observableInstruments =>
{
    // Записати значення для лічильника
    observableInstruments.Observe(observableCounter, 42, new("type", "product_a"));

    // Записати значення для gauge
    observableInstruments.Observe(observableGauge, 12.3, new("resource", "cpu"));
}, observableCounter, observableGauge);
```

## Одиниця виміру та опис {#unit-and-description}

При створенні інструментів рекомендується вказувати одиницю виміру та опис:

```csharp
// Вказати одиницю виміру та опис
var requestSizeHistogram = meter.CreateHistogram<long>(
    name: "http.request.size",
    unit: "By",  // байти
    description: "Розмір HTTP запиту в байтах"
);
```

Загальні одиниці виміру включають:

- Час: `ms` (мілісекунди), `s` (секунди), `min` (хвилини)
- Байти: `By` (байти), `KiBy` (кібібайти), `MiBy` (мебібайти)
- Кількість: зазвичай без одиниць виміру або з використанням конкретних одиниць, таких як `requests`

## Поради {#best-practices}

1. **Виберіть правильний інструмент** — Виберіть тип інструмента, який найкраще відповідає поведінці метрики, яку ви вимірюєте
2. **Використовуйте змістовні назви** — Дотримуйтесь [семантичних домовленостей](/docs/specs/semconv/) для назв метрик
3. **Додайте описові атрибути** — Використовуйте атрибути, щоб розрізняти різні аспекти того, що ви вимірюєте
4. **Уважно ставтеся до кардинальності** — Занадто багато унікальних комбінацій атрибутів може спричинити проблеми з продуктивністю
5. **Повторно використовуйте інструменти** — Створюйте інструменти один раз і повторно використовуйте їх у всьому вашому застосунку
6. **Вказати одиницю виміру та опис** — Завжди вказуйте одиниці виміру та описи для кращої спостережуваності

## Дізнайтеся більше {#learn-more}

- [Специфікація інструментів вимірювання OpenTelemetry](/docs/specs/otel/metrics/api/#instrument)
- [.NET Metrics API](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)

---
title: Початок роботи з метриками — Консоль
linkTitle: Консоль
description: Дізнайтеся, як використовувати OpenTelemetry Metrics у .NET Console застосунку
weight: 10
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: DiagnosticSource LongSum meterprovider MyFruitCounter
---

Цей посібник покаже вам, як почати роботу з OpenTelemetry .NET Metrics у консольному застосунку всього за кілька хвилин.

## Попередні вимоги {#prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download) встановлений на вашому компʼютері

## Створення консольного застосунку {#creating-a-console-application}

Створіть новий консольний застосунок і запустіть його:

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

Ви повинні побачити наступний результат:

```text
Hello World!
```

## Додавання метрик OpenTelemetry {#adding-opentelemetry-metrics}

Встановіть пакунок OpenTelemetry Console Exporter:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Оновіть файл `Program.cs` наступним кодом:

```csharp
using System;
using System.Diagnostics.Metrics;
using OpenTelemetry;
using OpenTelemetry.Metrics;

// Визначити вимірювач
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");

// Створити лічильник
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter", "fruit", "Counts fruit by name and color");

// Налаштувати OpenTelemetry MeterProvider
using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();

// Записати деякі вимірювання
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(2, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(1, new("name", "lemon"), new("color", "yellow"));
MyFruitCounter.Add(2, new("name", "apple"), new("color", "green"));
MyFruitCounter.Add(5, new("name", "apple"), new("color", "red"));
MyFruitCounter.Add(4, new("name", "lemon"), new("color", "yellow"));

Console.WriteLine("Press any key to exit");
Console.ReadKey();
```

Запустіть застосунок знову (за допомогою `dotnet run`) і ви побачите вихідні дані метрик з консолі (метрики будуть відображатися після завершення застосунку), як показано нижче:

```text
Export MyFruitCounter, Meter: MyCompany.MyProduct.MyLibrary/1.0
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:red name:apple LongSum
Value: 6
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:yellow name:lemon LongSum
Value: 7
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z) color:green name:apple LongSum
Value: 2
```

Вітаємо! Тепер ви збираєте метрики за допомогою OpenTelemetry.

## Як це працює {#how-it-works}

### Вимірювач {#meter}

Застосунок створює екземпляр [Вимірювача](/docs/specs/otel/metrics/api/#meter) з імʼям "MyCompany.MyProduct.MyLibrary". Вимірювач є точкою входу для створення інструментів метрик.

```csharp
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
```

```csharp
private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
```

### Інструмент Лічильник {#counter-instrument}

Він потім створює [Лічильник](/docs/specs/otel/metrics/api/#counter) з Вимірювача. Лічильник використовується для вимірювання значення, яке невпинно зростає.

```csharp
private static readonly Counter<long> MyFruitCounter = MyMeter.CreateCounter<long>("MyFruitCounter");
```

### Запис вимірювань {#recording-measurements}

Лічильник використовується для звітування про кілька вимірювань метрик з різними комбінаціями атрибутів:

```csharp
MyFruitCounter.Add(1, new("name", "apple"), new("color", "red"));
```

### Конфігурація MeterProvider {#meterprovider-configuration}

OpenTelemetry MeterProvider налаштований на:

1. Підписку на інструменти з вказаного лічильника
2. Експорт метрик на консоль

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

MeterProvider агрегує вимірювання в памʼяті з обмеженням кардинальності стандартно у 2000 комбінацій атрибутів.

## Обробка метрик з високою кардинальністю {#handling-high-cardinality-metrics}

Якщо вам потрібно збирати метрики з кардинальністю, що перевищує стандартний ліміт у 2000, ви можете налаштувати ліміт кардинальності:

```csharp
var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .AddView(instrumentName: "MyFruitCounter", new MetricStreamConfiguration { CardinalityLimit = 10 })
    .AddConsoleExporter()
    .Build();
```

## Потік метрик {#metrics-pipeline}

Потік метрик в OpenTelemetry .NET відбувається за таким алгоритмом:

1. Інструменти записують вимірювання
2. MeterProvider отримує та агрегує вимірювання
3. MetricReader зчитує агреговані метрики
4. Exporter експортує метрики до бекенду

## Особлива примітка щодо OpenTelemetry .NET {#special-note-about-opentelemetry-net}

Метрики в OpenTelemetry .NET є дещо унікальною реалізацією, оскільки більшість [Metrics API](/docs/specs/otel/metrics/api/) реалізовано самим середовищем виконання .NET. На вищому рівні це означає, що ви можете інструментувати свій застосунок, просто використовуючи пакунок `System.Diagnostics.DiagnosticSource`.

## Дізнайтеся більше {#learn-more}

- [Початок роботи з Prometheus та Grafana](/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/)
- [Додаткова інформація про інструменти](/docs/languages/dotnet/metrics/instruments/)
- [Використання екземплярів](/docs/languages/dotnet/metrics/exemplars/)

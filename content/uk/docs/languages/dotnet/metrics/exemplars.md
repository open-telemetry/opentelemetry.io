---
title: Використання екземплярів
linkTitle: Екземпляри
description: Дізнайтеся, як використовувати екземпляри для звʼязування метрик з трейсами в OpenTelemetry .NET
weight: 40
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: зв’язування
---

[«Екземпляри»](/docs/specs/otel/metrics/sdk/#exemplar) — це приклади точок даних для агрегованих даних. Вони надають конкретний контекст для загальних агрегацій. Одним із поширених випадків використання є можливість кореляції метрик із трейсами (та логами). У цьому посібнику показано, як використовувати екземпляри з OpenTelemetry .NET для зв’язування метрик і трейсів за допомогою Prometheus, Jaeger та Grafana.

## Що таке екземпляри? {#what-are-exemplars}

Екземпляри представляють собою окремі вимірювання, які є частиною агрегованої метрики. Вони дозволяють вам:

- Звʼязувати метрики з трейсами, які були активні під час зняття вимірювання
- Визначати викиди або цікаві точки даних у межах агрегованих метрик
- Краще розуміти причини змін метрик, досліджуючи асоційовані трейс

## Компоненти, що використовуються в цьому посібнику {#components-used-in-this-guide}

- **OpenTelemetry .NET SDK**: Інструментування для вашого застосунку
- **Prometheus**: Система зберігання метрик, яка підтримує екземпляри
- **Jaeger**: Система розподіленого трейсингу
- **Grafana**: Інтерфейс для запитів до метрик і трейсів, а також для навігації між ними за допомогою екземплярів

## Налаштування {#setup}

### Встановлення та запуск Jaeger {#installing-and-running-jaeger}

1. Завантажте [останній бінарний дистрибутив](https://www.jaegertracing.io/download/) Jaeger
2. Розпакуйте його в локальну теку
3. Запустіть виконуваний файл `jaeger-all-in-one(.exe)`:

```shell
./jaeger-all-in-one --collector.otlp.enabled
```

### Встановлення та запуск Prometheus {#installing-and-running-prometheus}

1. Завантажте [останній реліз](https://prometheus.io/download/) Prometheus
2. Розпакуйте його в локальну теку
3. Запустіть Prometheus з необхідними параметрами:

```shell
./prometheus --enable-feature=exemplar-storage --web.enable-otlp-receiver
```

### Встановлення та налаштування Grafana {#installing-and-configuring-grafana}

1. Дотримуйтесь
   [інструкцій, специфічних для операційної системи](https://grafana.com/docs/grafana/latest/setup-grafana/installation/#supported-operating-systems) для встановлення Grafana
2. Запустіть сервер Grafana
3. Відкрийте [http://localhost:3000/](http://localhost:3000/) у вашому вебоглядачі
4. Увійдіть за допомогою облікових типових даних (admin/admin)
5. Налаштуйте джерела даних:

#### Джерело даних Jaeger {#jaeger-data-source}

1. Перейдіть до Налаштування > Джерела даних
2. Додайте джерело даних Jaeger
3. Встановіть "URL" на `http://localhost:16686/`
4. Натисніть "Зберегти та протестувати"

#### Джерело даних Prometheus {#prometheus-data-source}

1. Перейдіть до Налаштування > Джерела даних
2. Додайте джерело даних Prometheus
3. Встановіть "URL" на `http://localhost:9090`
4. У розділі "Екземпляри" увімкніть "Внутрішнє посилання"
5. Встановіть "Джерело даних" на `Jaeger` і "Імʼя мітки" на `trace_id`
6. Натисніть "Зберегти та протестувати"

## Інструментуйте свій застосунок {#instrument-your-application}

Ось приклад того, як інструментувати .NET застосунок за допомогою OpenTelemetry, увімкнувши екземпляри:

```csharp
using System;
using System.Diagnostics;
using System.Threading;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Створити ресурс з інформацією про сервіс
var resource = ResourceBuilder.CreateDefault()
    .AddService(serviceName: "exemplars-demo", serviceVersion: "1.0.0");

// Створити постачальника трасувальника
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetResourceBuilder(resource)
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:4317"))
    .Build();

// Створити постачальника метричних даних з підтримкою екземплярів
using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .SetResourceBuilder(resource)
    .AddMeter("MyCompany.MyProduct.MyLibrary")
    .SetExemplarFilter(ExemplarFilterType.TraceBased)  // Увімкнути екземпляри на основі трейсів
    .AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:9090/api/v1/otlp"))
    .Build();

// Створити джерело активності та вимірювач
var activitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");
var meter = new Meter("MyCompany.MyProduct.MyLibrary");

// Створити інструмент гістограми для запису вимірювань
var histogram = meter.CreateHistogram<double>("MyHistogram", unit: "ms", description: "Example histogram");

var random = new Random();

// Створити зразкові дані
for (int i = 0; i < 100; i++)
{
    // Почати діяльність (відрізок)
    using (var activity = activitySource.StartActivity("ProcessData"))
    {
        // Додати деякі атрибути до діяльності
        activity?.SetTag("iteration", i);

        // Симуляція роботи
        var value = random.NextDouble() * 100;
        Thread.Sleep((int)value);

        // Записати вимірювання - це включатиме екземпляр з контекстом трейсування
        // тому що ми встановили ExemplarFilterType.TraceBased і маємо активну діяльність
        histogram.Record(value);
    }

    // Очікування між ітераціями
    Thread.Sleep(100);
}

Console.WriteLine("Application running and sending data. Press any key to exit.");
Console.ReadKey();
```

## Перегляд екземплярів в Grafana {#viewing-exemplars-in-grafana}

1. Відкрийте Grafana та перейдіть до розділу "Explore"
2. Виберіть Prometheus як джерело даних
3. Запросіть метрику `MyHistogram_bucket`
4. Увімкніть опцію "Exemplars" та оновіть запит

Екземпляри будуть показані у вигляді ромбоподібних точок на графіку метрики. При натисканні на екземпляр ви побачите такі деталі:

- Часовий відбиток, коли було записано вимірювання
- Необроблене значення
- Контекст трасування (trace_id)

Ви можете натиснути на «Query with Jaeger» поруч із trace_id, щоб переглянути повʼязане трасування, яке дасть вам уявлення про те, що відбувалося під час конкретного вимірювання.

## Як працюють екземпляри в OpenTelemetry .NET {#how-exemplars-work-in-opentelemetry-net}

Коли ви налаштовуєте SDK за допомогою `SetExemplarFilter(ExemplarFilterType.TraceBased)`, SDK прикріплює інформацію про трасування (trace ID, span ID) до вимірювань метрик, які відбуваються в контексті активного відрізка. Це дозволяє бекенду метрик зберігати ці екземпляри та повʼязувати їх з відповідними трасуваннями.

Стандартно не всі вимірювання зберігаються як екземпляри (це було б неефективно). Бекенд зазвичай використовує стратегії вибірки, щоб вирішити, які вимірювання зберігати як екземпляри.

## Дізнатись більше {#learn-more}

- [Специфікація OpenTelemetry Exemplar](/docs/specs/otel/metrics/sdk/#exemplar)
- [Prometheus Exemplars](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage)
- [Jaeger Tracing](https://www.jaegertracing.io/)
- [Grafana Exemplars Documentation](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/)

---
title: Сервіс Кошика
linkTitle: Кошик
aliases: [cartservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Цей сервіс підтримує товари, додані користувачами до кошика. Він взаємодіє з сервісом кешування Valkey для швидкого доступу до даних кошика.

[Сирці сервісу Кошика](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cart/)

> **Примітка** OpenTelemetry для .NET використовує бібліотеку `System.Diagnostic.DiagnosticSource` як свій API замість стандартного API OpenTelemetry для Трейсів та Метрик. Бібліотека `Microsoft.Extensions.Logging.Abstractions` використовується для Логів.

## Трейси {#traces}

### Ініціалізація Трасування {#initializing-tracing}

OpenTelemetry налаштовується в контейнері впровадження залежностей .NET. Метод `AddOpenTelemetry()` використовується для налаштування бажаних бібліотек інструментування, додавання експортерів та встановлення інших параметрів. Налаштування експортера та атрибутів ресурсу виконується через змінні середовища.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddSource("OpenTelemetry.Demo.Cart")
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### Додавання атрибутів до автоматично інструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоматично інструментованого коду ви можете отримати поточний відрізок (активність) з контексту.

```cs
var activity = Activity.Current;
```

Додавання атрибутів (тегів у .NET) до відрізка (активності) здійснюється за допомогою методу `SetTag` на обʼєкті активності. У функції `AddItem` з `services/CartService.cs` кілька атрибутів додаються до автоматично інструментованого відрізка.

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### Додавання подій до відрізків {#add-span-events}

Додавання подій до відрізків (активностей) здійснюється за допомогою методу `AddEvent` на обʼєкті активності. У функції `GetCart` з `services/CartService.cs` додається подія відрізка.

```cs
activity?.AddEvent(new("Fetch cart"));
```

## Метрики {#metrics}

### Ініціалізація Метрик {#initializing-metrics}

Подібно до налаштування Трейсів OpenTelemetry, контейнер впровадження залежностей .NET вимагає виклику `AddOpenTelemetry()`. Цей будівельник налаштовує бажані бібліотеки інструментування, експортери тощо.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddMeter("OpenTelemetry.Demo.Cart")
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .SetExemplarFilter(ExemplarFilterType.TraceBased)
        .AddOtlpExporter());
```

### Екземпляри {#exemplars}

[Екземпляри](/docs/specs/otel/metrics/data-model/#exemplars) налаштовуються в сервісі Кошика з фільтром екземплярів на основі трейсів, що дозволяє SDK OpenTelemetry прикріплювати екземпляри до метрик.

Спочатку створюється `CartActivitySource`, `Meter` та дві `Histograms`. Гістограма відстежує затримку методів `AddItem` та `GetCart`, оскільки це два важливі методи в сервісі Кошика.

Ці два методи є критичними для сервісу Кошика, оскільки користувачі не повинні чекати занадто довго при додаванні товару до кошика або при перегляді свого кошика перед переходом до процесу оформлення замовлення.

```cs
private static readonly ActivitySource CartActivitySource = new("OpenTelemetry.Demo.Cart");
private static readonly Meter CartMeter = new Meter("OpenTelemetry.Demo.Cart");
private static readonly Histogram<long> addItemHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.add_item.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 500000, 600000, 700000, 800000, 900000, 1000000, 1100000 ]
    });
private static readonly Histogram<long> getCartHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.get_cart.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 300000, 400000, 500000, 600000, 700000, 800000, 900000 ]
    });
```

Зверніть увагу, що також визначено власні межі кошика, оскільки стандартні значення не підходять для результатів у мікросекундах, які має сервіс Кошика.

Після визначення змінних затримка виконання кожного методу відстежується за допомогою `StopWatch` наступним чином:

```cs
var stopwatch = Stopwatch.StartNew();

(логіка методу)

addItemHistogram.Record(stopwatch.ElapsedTicks);
```

Щоб все це зʼєднати, у конвеєрі Трейсів потрібно додати створене джерело. (Вже присутнє у фрагменті вище, але додано тут для посилання):

```cs
.AddSource("OpenTelemetry.Demo.Cart")
```

І, у конвеєрі Метрик, `Meter` та `ExemplarFilter`:

```cs
.AddMeter("OpenTelemetry.Demo.Cart")
.SetExemplarFilter(ExemplarFilterType.TraceBased)
```

Щоб візуалізувати Екземпляри, перейдіть до Grafana <http://localhost:8080/grafana> > Dashboards > Demo > Cart Service Exemplars.

Екземпляри зʼявляються як спеціальні "ромбоподібні точки" на графіку 95-го процентиля або як маленькі квадрати на графіку теплової мапи. Виберіть будь-який екземпляр, щоб переглянути його дані, які включають часову мітку вимірювання, сире значення та контекст трейсу на момент запису. `trace_id` дозволяє перейти до бекенду трасування (у цьому випадку Jaeger).

![Екземпляри Сервісу Кошика](exemplars.png)

## Логи {#logs}

Логи налаштовуються в контейнері впровадження залежностей .NET на рівні `LoggingBuilder` шляхом виклику `AddOpenTelemetry()`. Цей будівельник налаштовує бажані параметри, експортери тощо.

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```

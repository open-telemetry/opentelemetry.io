---
title: Інструментування
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: Ручне інструментування для OpenTelemetry в Go
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: fatalf logr logrus otlplog otlploghttp sdktrace sighup обчислювально
---

{{% include instrumentation-intro %}}

## Налаштування {#setup}

## Трейси {#traces}

### Отримання Tracer {#getting-a-tracer}

Щоб створювати відрізки, спочатку потрібно отримати або ініціалізувати tracer.

Переконайтеся, що у вас встановлені правильні пакунки:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

Потім ініціалізуйте експортер, ресурси, провайдера tracer і, нарешті, tracer.

```go
package app

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context)  /* (someExporter.Exporter, error) */ {
	// Ваш улюблений експортер: console, jaeger, zipkin, OTLP тощо.
}

func newTracerProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Переконайтеся, що встановлені стандартні ресурси SDK і необхідне імʼя сервісу.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ExampleService"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)
}

func main() {
	ctx := context.Background()

	exp, err := newExporter(ctx)
	if err != nil {
		log.Fatalf("не вдалося ініціалізувати експортер: %v", err)
	}

	// Створіть нового провайдера tracer з процесором пакетних відрізків і вказаним експортером.
	tp := newTracerProvider(exp)

	// Правильно обробляйте завершення роботи, щоб нічого не витікало.
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// Нарешті, встановіть tracer, який можна використовувати для цього пакунку.
	tracer = tp.Tracer("example.io/package/name")
}
```

Тепер ви можете отримати доступ до `tracer`, щоб вручну інструментувати ваш код.

> [!WARNING]
>
> Якщо ви додаєте ручні відрізки у поєднанні з інструментуванням на основі eBPF [Go zero-code instrumentation](/docs/zero-code/go), такими як [OBI](/docs/zero-code/obi), не встановлюйте глобальний Tracer Provider. Докладнішу інформацію див. у документації [Auto SDK](/docs/zero-code/go/autosdk).

### Створення відрізків {#creating-spans}

Відрізки створюються за допомогою tracers. Якщо у вас немає ініціалізованого tracer, вам потрібно це зробити.

Щоб створити відрізок за допомогою tracer, вам також знадобиться обʼєкт `context.Context`. Вони зазвичай надходять з таких речей, як обʼєкт запиту, і можуть вже містити батьківський відрізок з [бібліотеки інструментування][бібліотека інструментування].

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// виконайте деяку роботу, щоб відстежити її за допомогою hello-span
}
```

У Go пакунок `context` використовується для зберігання активного відрізка. Коли ви починаєте відрізок, ви отримуєте не тільки сам відрізок, але й змінений контекст, який його містить.

Після завершення відрізка він стає незмінним і більше не може бути змінений.

### Отримання поточного відрізка {#getting-the-current-span}

Щоб отримати поточний відрізок, вам потрібно витягти його з `context.Context`, який у вас є:

```go
// Цей контекст повинен містити активний відрізок, який ви плануєте витягти.
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// Зробіть щось з поточним відрізком, за бажанням викликаючи `span.End()`, якщо ви хочете його завершити
```

Це може бути корисно, якщо ви хочете додати інформацію до поточного відрізка в певний момент часу.

### Створення вкладених відрізків {#creating-nested-spans}

Ви можете створити вкладений відрізок, щоб відстежувати роботу у вкладеній операції.

Якщо поточний `context.Context`, який у вас є, вже містить відрізок, створення нового відрізка робить його вкладеним відрізком. Наприклад:

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// викличте дочірню функцію і почніть вкладений відрізок там
	childFunction(ctx)

	// виконайте більше роботи - коли ця функція завершиться, parentSpan завершиться.
}

func childFunction(ctx context.Context) {
	// Створіть відрізок для відстеження `childFunction()` - це вкладений відрізок, батьком якого є `parentSpan`
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// виконайте роботу тут, коли ця функція повернеться, childSpan завершиться.
}
```

Після завершення відрізка він стає незмінним і більше не може бути змінений.

### Атрибути відрізка {#span-attributes}

Атрибути — це ключі та значення, які застосовуються як метадані до ваших відрізків і корисні для агрегування, фільтрації та групування трейсів. Атрибути можна додати під час створення відрізка або в будь-який інший час протягом життєвого циклу відрізка до його завершення.

```go
// встановлення атрибутів під час створення...
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// ... і після створення
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

Ключі атрибутів також можуть бути попередньо обчислені:

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### Семантичні атрибути {#semantic-attributes}

Семантичні атрибути — це атрибути, визначені [Специфікацією OpenTelemetry][специфікація opentelemetry], щоб забезпечити спільний набір ключів атрибутів для кількох мов, фреймворків та середовищ виконання для загальних концепцій, таких як HTTP методи, коди стану, агенти користувача тощо. Ці атрибути доступні в пакунку `go.opentelemetry.io/otel/semconv/v1.37.0`.

Для деталей дивіться [Семантичні конвенції трейсів][].

### Події {#events}

Подія — це повідомлення, зрозуміле людині, на відрізку, яке представляє "щось, що відбувається" протягом його життя. Наприклад, уявіть функцію, яка вимагає ексклюзивного доступу до ресурсу, що знаходиться у mutex. Подію можна створити в двох точках — один раз, коли ми намагаємося отримати доступ до ресурсу, і ще один раз, коли ми отримуємо mutex.

```go
span.AddEvent("Отримання блокування")
mutex.Lock()
span.AddEvent("Отримано блокування, виконується робота...")
// виконайте роботу
span.AddEvent("Розблокування")
mutex.Unlock()
```

Корисною характеристикою подій є те, що їхні часові мітки відображаються як зсуви від початку відрізка, що дозволяє легко побачити, скільки часу пройшло між ними.

Події також можуть мати власні атрибути -

```go
span.AddEvent("Скасовано очікування через зовнішній сигнал", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### Встановлення статусу відрізка {#setting-span-status}

{{% include "span-status-preamble" %}}

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail не вдалося")
}
```

### Запис помилок {#record-errors}

Якщо у вас є операція, яка не вдалася, і ви хочете зафіксувати помилку, яку вона спричинила, ви можете записати цю помилку.

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail не вдалося")
	span.RecordError(err)
}
```

Наполегливо рекомендується також встановити статус відрізка в `Error`, коли ви використовуєте `RecordError`, якщо ви не хочете вважати відрізок, що відстежує невдалу операцію, відрізком з помилкою. Функція `RecordError` **не** встановлює статус відрізка автоматично при виклику.

### Поширювачі та контекст {#propagators-and-context}

Трейси можуть поширюватися за межі одного процесу. Це вимагає _поширення контексту_, механізму, за допомогою якого ідентифікатори для трейсу надсилаються до віддалених процесів.

Щоб поширювати контекст трейсу через мережу, поширювач повинен бути зареєстрований в API OpenTelemetry.

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> OpenTelemetry також підтримує формат заголовків B3 для сумісності з наявними системами трасування (`go.opentelemetry.io/contrib/propagators/b3`), які не підтримують стандарт W3C TraceContext.

Після налаштування поширення контексту, ви, швидше за все, захочете використовувати автоматичне інструментування для обробки роботи за лаштунками з фактичного управління серіалізацією контексту.

## Метрики {#metrics}

Щоб почати створювати [метрики](/docs/concepts/signals/metrics), вам потрібно мати ініціалізований `MeterProvider`, який дозволить вам створювати `Meter`. Вимірювачі дозволяють створювати інструменти, які ви можете використовувати для створення різних видів метрик. OpenTelemetry Go наразі підтримує наступні інструменти:

- Counter, синхронний інструмент, який підтримує не-негативні інкременти
- Asynchronous Counter, асинхронний інструмент, який підтримує не-негативні інкременти
- Histogram, синхронний інструмент, який підтримує довільні значення, що мають статистичне значення, такі як гістограми, підсумки або процентилі
- Synchronous Gauge, синхронний інструмент, який підтримує не-адитивні значення, такі як температура в кімнаті
- Asynchronous Gauge, асинхронний інструмент, який підтримує не-адитивні значення, такі як температура в кімнаті
- UpDownCounter, синхронний інструмент, який підтримує інкременти та декременти, такі як кількість активних запитів
- Asynchronous UpDownCounter, асинхронний інструмент, який підтримує інкременти та декременти

Для отримання додаткової інформації про синхронні та асинхронні інструменти та який тип найкраще підходить для вашого випадку використання, дивіться [Додаткові рекомендації](/docs/specs/otel/metrics/supplementary-guidelines/).

Якщо `MeterProvider` не створений або бібліотекою інструментування, або вручну, API метрик OpenTelemetry використовуватиме реалізацію no-op і не зможе генерувати дані.

Тут ви можете знайти більш детальну документацію пакунка для:

- API метрик: [`go.opentelemetry.io/otel/metric`][]
- SDK метрик: [`go.opentelemetry.io/otel/sdk/metric`][]

### Ініціалізація метрик {#initialize-metrics}

> [!NB] Якщо ви інструментуєте бібліотеку, **пропустіть цей крок.**

Щоб увімкнути [метрики](/docs/concepts/signals/metrics/) у вашому застосунку, вам потрібно мати ініціалізований [`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider), який дозволить вам створювати [`Meter`](/docs/concepts/signals/metrics/#meter).

Якщо `MeterProvider` не створений, API OpenTelemetry для метрик використовуватимуть реалізацію no-op і не зможуть генерувати дані. Тому вам потрібно змінити вихідний код, щоб включити код ініціалізації SDK, використовуючи наступні пакунки:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

Переконайтеся, що у вас встановлені правильні модулі Go:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

Потім ініціалізуйте ресурси, експортер метрик та провайдер метрик:

```go
package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func main() {
	// Створіть ресурс.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Створіть провайдера метрик.
	// Ви можете передати цей екземпляр безпосередньо до вашого інструментованого коду, якщо він приймає екземпляр MeterProvider.
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// Правильно обробляйте завершення роботи, щоб нічого не витікало.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// Зареєструйте як глобального провайдера метрик, щоб його можна було використовувати через otel.Meter
	// і отримати доступ за допомогою otel.GetMeterProvider.
	// Більшість бібліотек інструментування використовують стандартного глобального провайдера метрик.
	// Якщо глобальний провайдер метрик не встановлений, використовується реалізація no-op,
	// яка не генерує дані.
	otel.SetMeterProvider(meterProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(
    resource.Default(),
		resource.NewWithAttributes(
      semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		),
  )
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// Стандартно 1m. Встановлено на 3s для демонстраційних цілей.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

Тепер, коли `MeterProvider` налаштований, ви можете отримати `Meter`.

### Отримання Meter {#acquiring-a-meter}

У будь-якому місці вашого застосунку, де у вас є вручну інструментований код, ви можете викликати [`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter), щоб отримати meter. Наприклад:

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### Синхронні та асинхронні інструменти {#synchronous-and-asynchronous-instruments}

Інструменти OpenTelemetry можуть бути синхронними або асинхронними (спостережуваними).

Синхронні інструменти роблять вимірювання, коли вони викликаються. Вимірювання виконується як ще один виклик під час виконання програми, як і будь-який інший виклик функції. Періодично агрегування цих вимірювань експортується налаштованим експортером. Оскільки вимірювання відокремлені від експорту значень, цикл експорту може містити нуль або кілька агрегованих вимірювань.

Асинхронні інструменти, з іншого боку, надають вимірювання на запит SDK. Коли SDK експортує, викликається зворотний виклик, який був наданий інструменту під час створення. Цей зворотний виклик надає SDK вимірювання, яке негайно експортується. Усі вимірювання на асинхронних інструментах виконуються один раз за цикл експорту.

Асинхронні інструменти корисні в кількох випадках, таких як:

- Коли оновлення лічильника не є обчислювально дешевим, і ви не хочете, щоб поточний виконуваний потік чекав на вимірювання
- Спостереження повинні відбуватися з частотою, не повʼязаною з виконанням програми (тобто вони не можуть бути точно виміряні, коли привʼязані до життєвого циклу запиту)
- Немає відомої часової мітки для значення вимірювання

У таких випадках часто краще спостерігати за кумулятивним значенням безпосередньо, а не агрегувати серію дельт у постобробці (синхронний приклад).

### Використання Counters {#using-counters}

Лічильники можна використовувати для вимірювання не-негативного, значення, що зростає.

Наприклад, ось як ви повідомляєте кількість викликів для обробника HTTP:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	apiCounter, err := meter.Int64Counter(
		"api.counter",
		metric.WithDescription("Кількість викликів API."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		apiCounter.Add(r.Context(), 1)

		 // виконайте деяку роботу в виклику API
	})
}
```

### Використання UpDown Counters {#using-updown-counters}

Лічильники UpDown можуть інкрементувати та декрементувати, дозволяючи вам спостерігати за кумулятивним значенням, яке збільшується або зменшується.

Наприклад, ось як ви повідомляєте кількість елементів у деякій колекції:

```go
import (
	"context"

	"go.opentelemetry.io/otel/metric"
)

var itemsCounter metric.Int64UpDownCounter

func init() {
	var err error
	itemsCounter, err = meter.Int64UpDownCounter(
		"items.counter",
		metric.WithDescription("Кількість елементів."),
		metric.WithUnit("{item}"),
	)
	if err != nil {
		panic(err)
	}
}

func addItem() {
	// код, який додає елемент до колекції

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// код, який видаляє елемент з колекції

	itemsCounter.Add(context.Background(), -1)
}
```

### Використання Gauges {#using-gauges}

Датчики використовуються для вимірювання неадитивних значень, коли відбуваються зміни.

Наприклад, ось як ви можете повідомити поточну швидкість вентилятора ЦП:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

var (
  fanSpeedSubscription chan int64
  speedGauge metric.Int64Gauge
)

func init() {
	speedGauge, err = meter.Int64Gauge(
		"cpu.fan.speed",
		metric.WithDescription("Швидкість вентилятора ЦП"),
		metric.WithUnit("RPM"),
	)
	if err != nil {
		panic(err)
	}

	getCPUFanSpeed := func() int64 {
		// Генерує випадкову швидкість вентилятора для демонстраційних цілей.
		// У реальних застосунках замініть це, щоб отримати фактичну швидкість вентилятора.
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// Синхронні датчики використовуються, коли цикл вимірювання
			// синхронізований із зовнішньою зміною.
			time.Sleep(time.Duration(rand.Intn(3)) * time.Second)
			fanSpeed := getCPUFanSpeed()
			fanSpeedSubscription <- fanSpeed
		}
	}()
}

func recordFanSpeed() {
	ctx := context.Background()
	for fanSpeed := range fanSpeedSubscription {
		speedGauge.Record(ctx, fanSpeed)
	}
}
```

### Використання Histograms {#using-histograms}

Гістограми використовуються для вимірювання розподілу значень з часом.

Наприклад, ось як ви повідомляєте розподіл часу відповіді для обробника HTTP:

```go
import (
	"net/http"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	histogram, err := meter.Float64Histogram(
		"task.duration",
		metric.WithDescription("Тривалість виконання завдання."),
		metric.WithUnit("s"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// виконайте деяку роботу в виклику API

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### Використання спостережуваних (асинхронних) Counters {#using-observable-async-counters}

Спостережувані лічильники можна використовувати для вимірювання адитивного, не-негативного, значення, яке зростає монотонно.

Наприклад, ось як ви повідомляєте час з моменту запуску застосунку:

```go
import (
	"context"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	start := time.Now()
	if _, err := meter.Float64ObservableCounter(
		"uptime",
		metric.WithDescription("Тривалість з моменту запуску застосунку."),
		metric.WithUnit("s"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(float64(time.Since(start).Seconds()))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### Використання спостережуваних (асинхронних) UpDown Counters {#using-observable-async-updown-counters}

Спостережувані лічильники UpDown можуть інкрементувати та декрементувати, дозволяючи вам вимірювати адитивне, не-негативне, кумулятивне значення, зростає не-монотонно.

Наприклад, ось як ви повідомляєте деякі метрики бази даних:

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics реєструє асинхронні метрики для наданої бази даних.
// Переконайтеся, що ви скасували реєстрацію metric.Registration перед закриттям наданої бази даних.
func registerDBMetrics(db *sql.DB, meter metric.Meter, poolName string) (metric.Registration, error) {
	max, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.max",
		metric.WithDescription("Максимальна кількість дозволених відкритих зʼєднань."),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	waitTime, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.wait_time",
		metric.WithDescription("Час, витрачений на отримання відкритого зʼєднання з пулу."),
		metric.WithUnit("ms"),
	)
	if err != nil {
		return nil, err
	}

	reg, err := meter.RegisterCallback(
		func(_ context.Context, o metric.Observer) error {
			stats := db.Stats()
			o.ObserveInt64(max, int64(stats.MaxOpenConnections))
			o.ObserveInt64(waitTime, int64(stats.WaitDuration))
			return nil
		},
		max,
		waitTime,
	)
	if err != nil {
		return nil, err
	}
	return reg, nil
}
```

### Використання спостережуваних (асинхронних) Gauges {#using-observable-async-gauges}

Спостережувані датчики слід використовувати для вимірювання неадитивних значень.

Наприклад, ось як ви повідомляєте використання памʼяті обʼєктів купи, що використовуються в застосунку:

```go
import (
	"context"
	"runtime"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	if _, err := meter.Int64ObservableGauge(
		"memory.heap",
		metric.WithDescription(
			"Використання памʼяті обʼєктів купи.",
		),
		metric.WithUnit("By"),
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			o.Observe(int64(m.HeapAlloc))
			return nil
		}),
	); err != nil {
		panic(err)
	}
}
```

### Додавання атрибутів {#adding-attributes}

Ви можете додати атрибути, використовуючи опції [`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet) або [`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes).

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.finished.counter",
		metric.WithDescription("Кількість завершених викликів API."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// виконайте деяку роботу в виклику API та встановіть код стану HTTP відповіді

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### Реєстрація представлень {#registering-views}

Представлення надає користувачам SDK гнучкість для налаштування вихідних даних метрик, що генеруються SDK. Ви можете налаштувати, які інструменти метрик повинні оброблятися або ігноруватися. Ви також можете налаштувати агрегування та які атрибути ви хочете повідомляти про метрики.

Кожен інструмент має стандартне представлення, яке зберігає оригінальну назву, опис та атрибути, і має стандартне агрегування, яке базується на типі інструменту. Коли зареєстроване представлення відповідає інструменту, стандартне представлення замінюється зареєстрованим представленням. Додаткові зареєстровані представлення, які відповідають інструменту, є адитивними і призводять до кількох експортованих метрик для інструменту.

Ви можете використовувати функцію [`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView) для створення представлення та реєстрації його за допомогою опції
[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView).

Наприклад, ось як ви створюєте представлення, яке перейменовує інструмент `latency` з версії `v0.34.0` бібліотеки інструментування `http` на `request.latency`:

```go
view := metric.NewView(metric.Instrument{
	Name: "latency",
	Scope: instrumentation.Scope{
		Name:    "http",
		Version: "0.34.0",
	},
}, metric.Stream{Name: "request.latency"})

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

Наприклад, ось як ви створюєте представлення, яке робить інструмент `latency` з бібліотеки інструментування `http` звітувати як експоненціальну гістограму:

```go
view := metric.NewView(
	metric.Instrument{
		Name:  "latency",
		Scope: instrumentation.Scope{Name: "http"},
	},
	metric.Stream{
		Aggregation: metric.AggregationBase2ExponentialHistogram{
			MaxSize:  160,
			MaxScale: 20,
		},
	},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

SDK фільтрує метрики та атрибути перед експортом метрик. Наприклад, ви можете використовувати представлення для зменшення використання памʼяті високої кардинальності метрик або видалення атрибутів, які можуть містити конфіденційні дані.

Ось як ви створюєте представлення, яке видаляє інструмент `latency` з бібліотеки інструментування `http`:

```go
view := metric.NewView(
  metric.Instrument{
    Name:  "latency",
    Scope: instrumentation.Scope{Name: "http"},
  },
  metric.Stream{Aggregation: metric.AggregationDrop{}},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

Ось як ви створюєте представлення, яке видаляє атрибут `http.request.method`, записаний інструментом `latency` з бібліотеки інструментування `http`:

```go
view := metric.NewView(
  metric.Instrument{
    Name:  "latency",
    Scope: instrumentation.Scope{Name: "http"},
  },
  metric.Stream{AttributeFilter: attribute.NewDenyKeysFilter("http.request.method")},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

Поле `Name` критеріїв підтримує шаблонне зіставлення з використанням символів підстановки. Символ підстановки `*` розпізнається як такий, що відповідає нулю або більше символам, а `?` розпізнається як такий, що відповідає точно одному символу. Наприклад, шаблон `*` відповідає всім назвам інструментів.

Наступний приклад показує, як ви створюєте представлення, яке встановлює одиницю вимірювання в мілісекундах для будь-якого інструменту з суфіксом назви `.ms`:

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

Функція `NewView` надає зручний спосіб створення представлень. Якщо `NewView` не може надати необхідні функціональні можливості, ви можете створити власне [`View`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View) безпосередньо.

Наприклад, ось як ви створюєте представлення, яке використовує регулярні вирази для забезпечення того, щоб усі назви потоків даних мали суфікс одиниць, які вони використовують:

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// У власній функції View вам потрібно явно скопіювати
	// назву, опис та одиницю вимірювання.
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// Будь-який інструмент, який не має визначеного суфікса одиниці вимірювання, але має
	// визначену розмірну одиницю, оновлює назву з суфіксом одиниці вимірювання.
	if re.MatchString(i.Name) {
		return s, false
	}
	switch i.Unit {
	case "ms":
		s.Name += ".ms"
	case "By":
		s.Name += ".byte"
	default:
		return s, false
	}
	return s, true
}

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

## Логи {#logs}

Логи відрізняються від метрик і трейсів тим, що **немає API логів OpenTelemetry, орієнтованого на користувача**. Натомість є інструменти для інтеграції логів з наявних популярних пакунків логування (таких як slog, logrus, zap, logr) в екосистему OpenTelemetry. Для обґрунтування цього рішення дивіться [Специфікацію логування](/docs/specs/otel/logs/).

Два типові робочі процеси, описані нижче, кожен з яких відповідає різним вимогам застосунків.

### Direct-to-Collector

**Статус**: [Експериментальний](/docs/specs/otel/document-status/)

У робочому процесі "direct-to-Collector" логи надсилаються безпосередньо з застосунку до колектора, використовуючи мережевий протокол (наприклад, OTLP). Цей робочий процес простий у налаштуванні, оскільки не вимагає додаткових компонентів для пересилання логів, і дозволяє застосунку легко надсилати структуровані логи, які відповідають [моделі даних логів][модель даних логів]. Однак, накладні витрати, необхідні для черги та експорту логів до мережевого місця, можуть бути неприйнятними для всіх застосунків.

Щоб використовувати цей робочий процес:

- Налаштуйте [SDK логів](#logs-sdk) OpenTelemetry для експорту записів логів до бажаного місця призначення ([колектора][opentelemetry collector] або іншого).
- Використовуйте відповідний [Міст логів](#log-bridge).

#### SDK логів {#logs-sdk}

SDK логів визначає, як обробляються логи при використанні робочого процесу [прямо до колектора](#direct-to-collector). Ніякий SDK логів не потрібен при використанні робочого процесу [через файл або stdout](#via-file-or-stdout).

Типова конфігурація SDK логів встановлює процесор записів логів з пакетною обробкою з експортером OTLP.

Щоб увімкнути [логи](/docs/concepts/signals/logs/) у вашому застосунку, вам потрібно мати ініціалізований [`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider), який дозволить вам використовувати [Міст логів](#log-bridge).

Якщо `LoggerProvider` не створений, API OpenTelemetry для логів використовуватимуть реалізацію no-op і не зможуть генерувати дані. Тому вам потрібно змінити вихідний код, щоб включити код ініціалізації SDK, використовуючи наступні пакунки:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

Переконайтеся, що у вас встановлені правильні модулі Go:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

Потім ініціалізуйте провайдера логів:

```go
package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func main() {
	ctx := context.Background()

	// Створіть ресурс.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Створіть провайдера логів.
	// Ви можете передати цей екземпляр безпосередньо при створенні мостів.
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// Правильно обробляйте завершення роботи, щоб нічого не витікало.
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// Зареєструйте як глобального провайдера логів, щоб його можна було використовувати через global.LoggerProvider.
	// Більшість мостів логів використовують стандартного глобального провайдера логів.
	// Якщо глобальний провайдер логів не встановлений, використовується реалізація no-op,
	// яка не генерує дані.
	global.SetLoggerProvider(loggerProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(
    resource.Default(),
		resource.NewWithAttributes(
      semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		),
  )
}

func newLoggerProvider(ctx context.Context, res *resource.Resource) (*log.LoggerProvider, error) {
	exporter, err := otlploghttp.New(ctx)
	if err != nil {
		return nil, err
	}
	processor := log.NewBatchProcessor(exporter)
	provider := log.NewLoggerProvider(
		log.WithResource(res),
		log.WithProcessor(processor),
	)
	return provider, nil
}
```

Тепер, коли `LoggerProvider` налаштований, ви можете використовувати його для налаштування [Мосту логів](#log-bridge).

#### Міст логів {#log-bridge}

Міст логів — це компонент, який інтегрує логи з наявного пакунка логування в [SDK логів](#logs-sdk) OpenTelemetry, використовуючи [API мосту логів][].

Повний список доступних мостів логів можна знайти в [реєстрі OpenTelemetry](/ecosystem/registry/?language=go&component=log-bridge).

Кожна документація пакунка мосту логів повинна мати приклад використання.

### Через файл або stdout {#via-file-or-stdout}

У робочому процесі "через файл або stdout" логи записуються у файли або стандартний вивід. Інший компонент (наприклад, FluentBit) відповідає за читання / відстеження логів, їх парсинг у більш структурований формат і пересилання їх до цільового місця, такого як колектор. Цей робочий процес може бути кращим у ситуаціях, коли вимоги до застосунку не дозволяють додаткових накладних витрат від [direct-to-Collector](#direct-to-collector). Однак, він вимагає, щоб усі поля логів, необхідні далі по потоку, були закодовані в логах, і щоб компонент, який читає логи, перетворював дані в [модель даних логів][]. Встановлення та налаштування компонентів пересилання логів виходить за рамки цього документа.

## Наступні кроки {#next-steps}

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/go/exporters) до одного або кількох телеметричних бекендів.

[специфікація opentelemetry]: /docs/specs/otel/
[семантичні конвенції трейсів]: /docs/specs/semconv/general/trace/
[бібліотека інструментування]: ../libraries/
[opentelemetry collector]: https://github.com/open-telemetry/opentelemetry-collector
[API мосту логів]: /docs/specs/otel/logs/api/
[модель даних логів]: /docs/specs/otel/logs/data-model
[`go.opentelemetry.io/otel`]: https://pkg.go.dev/go.opentelemetry.io/otel
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`]: https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric
[`go.opentelemetry.io/otel/metric`]: https://pkg.go.dev/go.opentelemetry.io/otel/metric
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`]: https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp
[`go.opentelemetry.io/otel/sdk/log`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/log
[`go.opentelemetry.io/otel/sdk/metric`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric
[`go.opentelemetry.io/otel/sdk/resource`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/resource

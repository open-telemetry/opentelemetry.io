---
title: 手动插桩
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: 在 OpenTelemetry Go 中实现手动插桩
default_lang_commit: 369126d9f754c248c11e82046cbcb633c17e594c
drifted_from_default: true
cSpell:ignore: fatalf logr logrus otlplog otlploghttp sdktrace sighup
---

{{% include instrumentation-intro.md %}}

## 配置{#setup}

## 链路追踪{#traces}

### 获取一个 Tracer{#getting-a-tracer}

要创建 span（跨度），你需要先获取或初始化一个 tracer（追踪器）。

确保你已经安装了相关包：

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

然后你需要初始化导出器（exporter）、资源（resource）、追踪器提供者（tracer provider），最后初始化一个 tracer 实例。

```go
package app

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.32.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context)  /* (someExporter.Exporter, error) */ {
	// 这里根据你的导出方式返回对应的 exporter，如 console，jaeger，zipkin，OTLP 等等
}

func newTracerProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// 确保设置了默认的 SDK 资源和所需的服务名称。
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
		log.Fatalf("failed to initialize exporter: %v", err)
	}

	// 使用 span 批处理器和指定的导出器（exporter）创建新的 tracer provider
	tp := newTracerProvider(exp)

	// 确保程序结束前正确关闭 trace provider，避免资源泄露。
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// 最后，设置可用于当前包的 tracer。
	tracer = tp.Tracer("example.io/package/name")
}
```

你现在可以通过 `tracer` 来手动插桩你的代码了。

### 创建 span{#creating-spans}

Span 是由 tracer 创建的，所以在此之前，你需要先初始化 tracer。

创建一个 span 时，还需要一个 `context.Context` 实例的句柄。
在实际应用中，这个上下文对象通常来自比如请求的对象之类的地方，并且可能已经包含了来自[插桩库][]所创建的父
span。

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// 执行需要被 hello-span 跟踪的逻辑。
}
```

在 Go 里面，`context` 包用于存储活跃的 span。当你启动一个新的 span 时，你不仅会获得新创建的 span 的句柄，
还会返回一个包含它的新的 context 的句柄。

需要注意的是，一旦一个 span 已经完成，他就是不可变的，不能再被修改。

### 获取当前 Span{#get-the-current-span}

想要获取当前的 Span，你需要从已有的 `context.Context` 中获取：

```go
// 这个上下文包含你想要提取的活跃 span
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// 这里可以使用获取的当前 span 做一些操作，如果想要关闭它，可以调用 `span.End()`。
```

这对于你希望在某个时刻向当前 span 添加信息非常有用。

### 创建嵌套 Span{#create-nested-spans}

你可以创建嵌套的 span 来追踪某个嵌套操作中的工作。

如果当前你已经有包含一个 span 的 `context.Context` 的句柄，那么使用这个句柄新创建的
span 会自动变成嵌套 span，比如说：

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// 调用子函数，并在其中创建一个嵌套 span
	childFunction(ctx)

	// 继续执行 - 当此函数结束时，parentSpan 也会结束。
}

func childFunction(ctx context.Context) {
	// 创建一个新的 span 来追踪 `childFunction()` - 它会自动成为 `parentSpan` 的子 Span。
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// 继续执行 - 当此函数结束时，childSpan 也会结束。
}
```

一旦一个 span 结束，它就是不可变的，不能再被修改。

### Span 属性{#span-attributes}

属性（Attributes）是附加在 Span 上的键值对元数据，通常用于对追踪数据进行聚合，过滤和分组。你可以在创建 Span 时添加属性，也可以在其任意生命周期内添加属性，只要这个 Span 还没有结束。

```go
// 创建 Span 时设置属性
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// 创建后再添加属性
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

属性键（Attribute Key）也可以预先定义，例如：

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### 语义属性（Semantic Attributes）{#semantic-attributes}

语义属性是由 [OpenTelemetry 规范][]
定义的一组标准属性键，是用于统一多个语言，框架和运行时对常见概念（比如 HTTP 方法，状态码，User-agent
等）的表达，这些属性都在`go.opentelemetry.io/otel/semconv/v1.32.0` 包中实现。

详见 [Trace 语义约定][].

### 事件（Events）{#events}

事件是附加在 Span 上的可读信息，用于表示其在生命周期中“某件事情发生了”。例如，如果某个函数需要对互斥资源进行独占访问，可以在尝试获取锁以及成功获取锁这两个时间点上添加事件：

```go
span.AddEvent("Acquiring lock")
mutex.Lock()
span.AddEvent("Got lock, doing work...")
// do stuff
span.AddEvent("Unlocking")
mutex.Unlock()
```

事件的一个有用特性是：它们的时间戳会以相对于该 Span 开始时间的偏移量显示，从而方便你直观地查看各事件之间的时间间隔。

事件也可以具有自己的属性，比如：

```go
span.AddEvent("Cancelled wait due to external signal", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### 为 Span 设置状态{#set-span-status}

{{% include "span-status-preamble.md" %}}

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
}
```

### 记录错误{#record-errors}

如果你希望在某个操作失败的时候去记录它所产生的错误，可以使用 `RecordError` 方法将该错误附加到当前的 span 上。

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operationThatCouldFail()
if err != nil {
	span.SetStatus(codes.Error, "operationThatCouldFail failed")
	span.RecordError(err)
}
```

强烈建议在使用 `RecordError` 时，也将 Span 的状态设置为 `Error`，除非你有意不将这个 span 视为错误的追踪单元。需要注意的是，调用 `RecordError` 方法**不会**自动设置 span 的状态，因此你必须手动调用 SetStatus。

### 上下文传播（Propagators and Context）{#propagators-and-context}

Trace（链路）可以跨越多个进程执行。要实现这一点，就需要 **上下文传播（context propagation）**，也就是将 Trace 的标识符传递给远程进程的机制。

为了在网络中传播 Trace 上下文，必须要在 OpenTelemetry API 中注册一个传播器（Propagator）。

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> OpenTelemetry 也支持 B3 Header 格式，以兼容那些尚未支持 W3C TraceContext
> 标准的链路追踪系统（可通过 `go.opentelemetry.io/contrib/propagators/b3` 引入）。

在配置好上下文传播之后，你很可能会希望使用自动插桩来处理上下文序列化等背后细节，无需手动管理。

## 指标（Metrics）{#metrics}

要开始产出 [指标](/docs/concepts/signals/metrics)，你需要初始化一个 `MeterProvider`，然后通过它创建 `Meter`。 Meter 用来创建各种类型的指标的仪器（instrument）。OpenTelemetry Go 当前支持以下几种仪器：

- Counter：同步计数器，仅支持非负递增。
- Asynchronous Counter：异步计数器，同样仅支持非负递增。
- Histogram：一种同步仪器，可记录任意具有统计意义的数值（如分布、摘要、百分位）。
- Synchronous Gauge：一种同步仪器，适用于非累加性数值（如房间温度）。
- Asynchronous Gauge：一种异步仪器，同样适用于非累加性数值。
- UpDownCounter：同步增减计数器，支持正向和负向的增量（如活跃请求数）。
- Asynchronous UpDownCounter：异步版的增减计数器。

更多关于同步和异步指标仪器的区别，以及如何为你的场景选择合适的类型，
请参阅[补充指南](/docs/specs/otel/metrics/supplementary-guidelines/)。

如果既没有自动插桩库创建 `MeterProvider`，也没有手动初始化，OpenTelemetry 的 Metrics API 会退化为 no-op（空操作），无法产出任何数据。

你可以在这里找到更详细的关于这个包的文档：

- Metrics API：[`go.opentelemetry.io/otel/metric`][]
- Metrics SDK：[`go.opentelemetry.io/otel/sdk/metric`][]

### 初始化指标（Metrics）{#initialize-metrics}

{{% alert %}} 如果你是在为某个库添加插桩，可以跳过此步骤。 {{% /alert %}}

要在应用程序中启用[指标](/docs/concepts/signals/metrics/)，你需要先初始化一个
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider)，它可以让你创建一个
[`Meter`](/docs/concepts/signals/metrics/#meter).

如果 `MeterProvider` 还没有创建，OpenTelemetry 的指标 API 会使用空操作（no-op）实现，无法产出任何数据。因此，你需要在源码里加入以下 SDK 初始化代码，并确保引入这些包：

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

先安装对应的 Go 模块：

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

然后初始化资源（resource），指标导出器（exporter）和指标提供者（provider）：

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
	semconv "go.opentelemetry.io/otel/semconv/v1.32.0"
)

func main() {
	// 创建资源
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// 创建 meterProvider
	// 如果自己的代码接受 meterProvider，可以直接传这个实例过去
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// 在程序退出前正确关闭 meterProvider，避免资源泄露
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// 将其注册为全局 MeterProvider，以便通过 otel.Meter 和 otel.GetMeterProvider 获取
	// 大多数自动插桩库都默认使用全局 MeterProvider，若未设置则会退化为 no-op 实现，
	// 此时，不会产生任何数据。
	otel.SetMeterProvider(meterProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		))
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// 默认间隔 1 分钟，此处为了演示设置为 3 秒
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

现在配置好 `MeterProvider` 之后, 你就可以获取一个 `Meter` 实例了。

### 获取一个 Meter{#acquiring-a-meter}

在应用程序中，只要你需要对代码进行手动插桩，都可以通过调用
[`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter)
来获取一个 meter 实例。示例如下：

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### 同步与异步仪器{#synchronous-and-asynchronous-instruments}

OpenTelemetry 的仪器分为同步和异步（可观测）两类.

同步仪器在被调用时立即记录一次测量。该测量与程序中其他函数调用一样，在执行期间直接完成。配置好的导出器会按周期导出这些测量的聚合结果。由于测量与导出解耦，某一次导出周期内可能包含零次或多次聚合后的测量。

异步仪器则是根据 SDK 的请求进行测量的。每次 SDK 想要导出数据时，会调用在创建仪器时提供的回调函数。
这个回调函数会为 SDK 返回一个测量值，并进行导出。
所有的异步仪表测量都会在每次导出周期中执行一次，也就是说，每次导出时才会进行测量，而不是持续不断地进行测量。

异步仪器适用于以下场景：

- 更新计数器的开销较大，不希望当前执行线程因记录测量而阻塞。
- 观测程序的频率与程序执行无关，即当与请求生命周期相关联的时候，无法准确的去测量。
- 测量值没有已知的时间戳。

在这些情况下，通常直接观测累计值优于事后对一系列增量（同步场景）进行聚合，下面有具体的使用示例。

### 使用 Counter{#using-counters}

Counter 用来测量非负且单调递增的值。

下面的例子展示了如何统计 HTTP 的 handler 被调用的次数：

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	apiCounter, err := meter.Int64Counter(
		"api.counter",
		metric.WithDescription("Number of API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		apiCounter.Add(r.Context(), 1)

		// 在这里执行你的 API 调用逻辑。
	})
}
```

### 使用 UpDown Counter（可增可减计数器）{#using-updown-counters}

UpDown Counter 既能递增也能递减，你可以通过它来观察可增可减的累积值。

在下面的例子中，展示了如何统计集合中元素的个数：

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
		metric.WithDescription("Number of items."),
		metric.WithUnit("{item}"),
	)
	if err != nil {
		panic(err)
	}
}

func addItem() {
	// 向集合中增加元素的逻辑。

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// 从集合中移除元素的逻辑。

	itemsCounter.Add(context.Background(), -1)
}
```

### 使用 Gauge{#using-gauges}

Gauge 用于在数值发生变化时记录瞬时值，不会做累加。

下面的例子，展示了如何上报 CPU 风扇的转速：

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
	var err error
	speedGauge, err = meter.Int64Gauge(
		"cpu.fan.speed",
		metric.WithDescription("Speed of CPU fan"),
		metric.WithUnit("RPM"),
	)
	if err != nil {
		panic(err)
	}

	getCPUFanSpeed := func() int64 {
		// 这里仅作演示，随机生成一个转速
		// 生产环境替换为请获取真实的硬件数据
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// 当需要随时记录外部变化时，使用同步 Gauge
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

### 使用 Histograms{#using-histograms}

Histogram 用于记录随时间变化一系列数值的分布。

例如，下面的例子展示了如何为一个 HTTP 处理函数上报响应时间的分布：

```go
import (
	"net/http"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	histogram, err := meter.Float64Histogram(
		"task.duration",
		metric.WithDescription("The duration of task execution."),
		metric.WithUnit("s"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// 在这里写关于处理函数的逻辑。

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### 使用 Observable（Async） Counter{#using-observable-async-counters}

Observable counter 用于测量只增不减的累积值。

下面的示例展示了如何上报应用程序自启动以来经过的时间：

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
		metric.WithDescription("The duration since the application started."),
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

### 使用 Observable (Async) UpDown Counters{#using-observable-async-updown-counters}

Observable UpDown counters 可增可减，适合测量来回波动的累积值。

下面的示例，展示了如何上报数据库的一些指标：

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics 为给定的 db 注册异步指标。
// 在关闭给定的 db 之前，需要保证取消注册 metric.Registration。
func registerDBMetrics(db *sql.DB, meter metric.Meter, poolName string) (metric.Registration, error) {
	max, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.max",
		metric.WithDescription("The maximum number of open connections allowed."),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	waitTime, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.wait_time",
		metric.WithDescription("The time it took to obtain an open connection from the pool."),
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

### 使用 Observable (Async) Gauges{#using-observable-async-gauges}

Observable Gauges 用于记录非累加型的快照值（例如当前内存占用，CPU 使用率）

下面的例子展示了如何上报当前堆内存的占用情况：

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
			"Memory usage of the allocated heap objects.",
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

### 添加属性（Attributes）{#adding-attributes}

你可以使用
[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)
或者
[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes)
选项为指标添加属性。

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.32.0"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.finished.counter",
		metric.WithDescription("Number of finished API calls."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 此处运行你的 API 调用处理逻辑，并设置 HTTP 状态码。

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### 注册视图（Registering Views）{#registering-views}

视图让 SDK 的用户可以灵活地自定义输出的指标（metric）。你可以决定哪些指标仪器需要被处理或者忽略。
你还可以自定义聚合方式以及自定义在指标中上报哪些属性。

每个仪器都有一个默认视图，保持原有名称，描述和属性，并根据仪器类型使用默认聚合方式。
当注册的视图与某个仪器匹配时，默认视图就会被替换，如果由多个视图同时匹配，那么同一个仪器就会导出多个指标（metrics）。

你可以使用
[`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView)
方法创建一个视图，然后通过
[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView)
选项进行注册。

下面这个例子展示了创建一个视图，并将 `http` 插桩库 `v0.34.0` 版本中名叫 `latency` 的仪器重命名为 `request.latency`：

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

下面的例子中，如何创建一个视图，并将 HTTP 插桩库中的名叫 `latency` 的仪器测量结果上报为二进制指数直方图（histogram）聚合：

```go
view := metric.NewView(
	metric.Instrument{
		// 这里的 latency 是仪器的名称，
		Name:  "latency",
		Scope: instrumentation.Scope{Name: "http"},
	},
	metric.Stream{
		// 这里仅仅是修改了数据汇总方式，但是仪器类型并没有变化。
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

SDK 会在导出前对指标和属性做过滤。比如，你可以通过使用视图来降低高基数指标的内存占用或者删除可能包含敏感数据的属性。

下面的例子展示了如何创建一个视图，并删除 `http` 插桩库中名叫 `latency` 的仪器

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

下面的例子向你展示了如何创建一个视图，并去除由 `http` 插桩库中名叫 `latency` 的仪器记录的 `http.request.method` 属性：

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

`Name` 字段支持通配符模式匹配。`*` 表示匹配零个或多个字符，而 `?` 表示精确匹配一个字符。例如，`*` 会匹配所有仪器的名称。

下面的例子展示了如何创建一个视图，并将所有名称后缀为 `.ms` 的仪器的单位设置为毫秒：

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

`NewView` 方法为创建视图提供了一个便捷的方式。如果 `NewView` 无法满足你的需求，你可以直接自己实现一个
[`View`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View)。

下面的例子向你展示了如何创建一个视图，并使用正则表达式匹配来确保所有数据流名称都带有他们单位的后缀。

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// 在自定义 View 函数中，需要显示复制名称，描述和单位。
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// 如果仪器的名称已经包含单位后缀，则保持不变。
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

## 日志（Logs）{#logs}

日志与指标和链路追踪不同，**OpenTelemetry 没有面向用户的日志 API**。目前主流的做法是通过日志桥（Log Bridge）将主流日志库（如slog，logrus，zap，logr）接入到 OpenTelemetry 生态。
对于采取这样设计的原因，请参阅[日志规范](/docs/specs/otel/logs/).

下面介绍的两种典型工作流适用于不同的应用场景。

### 直接发送给 Colletcor{#direct-to-collector}

**状态**： [Experimental](/docs/specs/otel/document-status/)

在此工作流中，应用通过网络协议（如 OTLP）直接将日志从应用程序发送给
Collector，优点是部署简单，而无需额外的日志转发组件，还能天然生成符合[日志数据模型][log data model]
的结构化日志。缺点是应用需要承担将日志排队并将日志导出到网络位置的额外开销，对于一些性能敏感的场景可能并不适合。

使用步骤：

- 配置 OpenTelemetry [Log SDK](#logs-sdk) 将日志导出到
  [collector][opentelemetry collector] 或其他目标。
- 选取合适的[日志桥](#log-bridge)。

#### 日志 SDK{#logs-sdk}

仅在
[直接发送给 Collector](#direct-to-collector) 工作流中才需要日志 SDK。如果采取后文提到的
[日志转发](#via-file-or-stdout) 工作流则无需日志 SDK。

常见的日志 SDK 配置是安装日志批处理器和 OTLP 导出器（exporter）

想要在应用中启用[日志](/docs/concepts/signals/logs/)，你必须要初始化一个
[`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider)
从而可以使用 [日志桥](#log-bridge)。

如果没有创建 `LoggerProvider`，则日志的 OpenTelemetry API 会退化为 no-op，无法产生任何数据，因此，你需要使用以下包来修改源代码，来确保包含 SDK 初始化代码：

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

安装依赖：

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

初始化 `LoggerProvider`：

```go
package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.32.0"
)

func main() {
	ctx := context.Background()

	// 创建 Resource
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// 创建 LoggerProvider，可直接传入日志桥
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// 正确关闭，避免资源泄漏
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// 注册为全局的 logger provider，后续可以通过 global.LoggerProvider 访问。
	// 大多数日志桥默认采用全局的 LoggerProvider。
	// 如果未设置全局 LoggerProvider，将会退化为 no-op 实现，无法生成数据。
	global.SetLoggerProvider(loggerProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		))
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

现在 `LoggerProvider` 已经配置完毕，接下来你就可以用它来设置[日志桥](#log-bridge).

#### 日志桥（Log Bridge）{#log-bridge}

日志桥是一种组件，借助[日志桥 API][logs bridge API] 将现有日志包产生的日志接入到
OpenTelemetry 的[日志 SDK](#logs-sdk)。

可用日志桥的完整列表见
[OpenTelemetry 支持列表](/ecosystem/registry/?language=go&component=log-bridge).

每个日志桥包的文档都会提供一个具体的使用示例。

### 通过文件或 stdout 转发{#via-file-or-stdout}

在这种工作流中，应用将日志写入文件或标准输出（stdout）。另一个组件（如 FluentBit）负责读取/跟随这些日志，
将其解析为结构化格式转发给目标（例如 Collector）。如果当应用无法承担[直接发送给 Collector](#direct-to-collector)
带来的额外开销时，那么该方案更为合适。但是它要求所有下游需要的日志字段必须已被编码到日志中，
并且读取日志的组件必须把数据解析成[日志数据模型][log data model]，而日志转发组件的安装与配置超出了本文档的范围。

## 后续步骤{#next-steps}

你还需要配置一个合适的导出器（exporter）[将你的遥测数据导出](/docs/languages/go/exporters)到一个或多个后端。

[opentelemetry 规范]: /docs/specs/otel/
[trace 语义约定]: /docs/specs/semconv/general/trace/
[插桩库]: ../libraries/
[opentelemetry collector]: https://github.com/open-telemetry/opentelemetry-collector
[logs bridge API]: /docs/specs/otel/logs/api/
[log data model]: /docs/specs/otel/logs/data-model
[`go.opentelemetry.io/otel`]: https://pkg.go.dev/go.opentelemetry.io/otel
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`]: https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric
[`go.opentelemetry.io/otel/metric`]: https://pkg.go.dev/go.opentelemetry.io/otel/metric
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`]: https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp
[`go.opentelemetry.io/otel/sdk/log`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/log
[`go.opentelemetry.io/otel/sdk/metric`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric
[`go.opentelemetry.io/otel/sdk/resource`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/resource

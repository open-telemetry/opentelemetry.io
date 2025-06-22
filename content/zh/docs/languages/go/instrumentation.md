---
title: 手动埋点（Instrumentation）
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: 在 OpenTelemetry Go 中实现手动埋点
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

然后你需要初始化导出器（exporter）、资源（resource）、追踪器提供者（tracer provider），最后获取一个 tracer 实例。

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

	// 使用批处理 span 处理器和指定的导出器（exporter）创建新的 tracer provider
	tp := newTracerProvider(exp)

	// 确保程序结束前正确关闭 trace provider，避免资源泄露。
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// 最后，设置可用于当前包的 tracer。
	tracer = tp.Tracer("example.io/package/name")
}
```

你现在可以通过 `tracer` 来手动埋点你的代码了。

### 创建 span{#creating-spans}

Span 是由 tracer 创建的，如果你还没有初始化，就需要先完成这一步。

创建一个 span 时，还需要一个 `context.Context` 实例的句柄。在实际应用中，这个上下文对象通常来自请求的对象，并且可能已经包含了
[instrumentation library][] 所创建的父 span。

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// 执行需要被 hello-span 跟踪的逻辑。	
}
```

在 Go 里面，活跃的 span 存储在 `context` 中。当你启动一个新的 span 时，你不仅会获得新的 span 的句柄，还会返回一个包含它的新的 context。

需要注意的是，一旦一个 span 被关闭，他就是不可变的，不能再被修改。

### 获取当前 Span{#get-the-current-span}

想要获取当前的 Span，你需要从已有的 `context.Context` 中获取：

```go
// 这个上下文包含你想要提取的活跃 Span
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// 这里可以使用获取的当前 Span 做一些操作，如果想要关闭它，可以调用 `span.End()`。
```

这对于你希望在某个时刻向当前 Span 添加信息非常有用。

### 创建嵌套 Span{#create-nested-spans}

你可以创建嵌套的 Span 来追踪某个嵌套操作中的工作。

如果当前你已经有包含一个 Span 的 `context.Context`，创建一个新的 Span 会自动成为它的子 Span，比如说：

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// 调用子函数，并在其中创建一个嵌套 Span
	childFunction(ctx)

	// 继续执行 - 当此函数结束时，parentSpan 也会结束。
}

func childFunction(ctx context.Context) {
	// 创建一个新的 Span 来追踪 `childFunction()` - 它会自动成为 `parentSpan` 的子 Span。
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// 继续执行 - 当此函数结束时，childSpan 也会结束。
}
```

一旦一个 Span 结束，它就是不可变的，不能再被修改。

### Span 属性{#span-attributes}

属性（Attributes）是附加在 Span 上的键值对元数据，通常用于对追踪数据进行聚合，过滤和分组。你可以在创建 Span 时设置属性，也可以在其任意生命周期内添加属性，只要这个 Span 还没有结束。

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

语义属性是由
[OpenTelemetry
Specification][] 定义的一组标准属性键，用于统一多个语言，框架和运行时对常见概念（比如 HTTP 方法，状态码，User-agent 等）的表达，这些属性都在
`go.opentelemetry.io/otel/semconv/v1.32.0` 包中实现。

详见 [Trace semantic conventions][].

### 事件（Events）{#events}

事件是附加在 Span 上的可读信息，用于表示其生命周期中发生的某个事件。例如，如果某个函数需要对互斥资源进行独占访问，可以在尝试获取锁以及成功获取锁这两个时间点上添加事件：

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

Trace（链路）可以跨越多个进程执行。要实现这一点，就需要 _上下文传播（context propagation）_ 机制，即将 Trace 的表示信息传递给远程进程。

为了在网络中传播 Trace 上下文，必须要在 Opentelemetry API 中注册一个传播器（Propagator）。

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> OpenTelemetry 也支持 B3 Header 格式，以兼容那些尚未支持 W3C TraceContext 标准的现有追踪系统（可通过
> `go.opentelemetry.io/contrib/propagators/b3` 引入）。

在配置好上下文传播之后，通常建议使用自动埋点来处理上下文序列化等背后细节，无需手动管理。

## 指标（Metrics）{#metrics}

要开始产出 [metrics](/docs/concepts/signals/metrics)，你需要初始化一个 `MeterProvider`，然后通过它创建 `Meter`。 Meter 用来生成各种类型的指标的工具（instrument）。OpenTelemetry Go 当前支持以下几种工具：

- Counter：同步计数器，仅支持非负递增。
- 异步 Counter（Asynchronous Counter）：异步计数器，同样仅支持非负递增。
- Histogram：同步直方图，可记录任意具有统计意义的数值（如分布、摘要、百分位）。
- 同步 Gauge（Synchronous Gauge）：同步测量仪，适用于非累加性数值（如房间温度）。
- 异步 Gauge（Synchronous Gauge）：异步测量仪，同样适用于非累加性数值。
- UpDownCounter：同步增减计数器，支持正向和负向的增量（如活跃请求数）。
- 异步 UpDownCounter（Asynchronous UpDownCounter）：异步版的增减计数器。

更多关于同步和异步指标工具的区别，以及如何为你的场景选择合适的类型，请参阅
[Supplementary Guidelines](/docs/specs/otel/metrics/supplementary-guidelines/).

如果既没有自动埋点库创建  `MeterProvider`，也没有手动初始化，OpenTelemetry 的 Metrics API 会退化为 no-op（空操作），无法产出任何指标数据。

你可以在这里找到更详细的关于这个包的文档：

- Metrics API: [`go.opentelemetry.io/otel/metric`][]
- Metrics SDK: [`go.opentelemetry.io/otel/sdk/metric`][]

### 初始化指标（Metrics）{#initialize-metrics}

{{% alert %}} 如果你是在为某个库添加埋点，可以跳过此步骤。 {{% /alert %}}

要在应用程序中启用 [metrics](/docs/concepts/signals/metrics/) ，你需要先初始化一个
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
	// 大多数自动埋点库都默认使用全局 MeterProvider，若未设置则会退化为 no-op 实现，
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
			// 默认间隔 1 分钟，此处为演示设置为 3 秒
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

现在配置好 `MeterProvider` 之后, 你就可以获取一个 `Meter` 实例了。

### 获取一个仪表（Meter）{#acquiring-a-meter}

在应用程序中，只要你需要对代码进行手动埋点，都可以通过调用
[`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter)
来获取一个仪表实例。示例如下：

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### 同步与异步 Instrument{#synchronous-and-asynchronous-instruments}

> 注：Instrument 由 Meter 创建，在运行时捕获测量值。

OpenTelemetry 的 Instrument 分为同步和异步（可观测）两类.

同步 Instrument 在被调用时立即记录一次测量。该测量与程序中其他函数调用一样，在执行期间直接完成。配置好的导出器会按周期导出这些测量的聚合结果。由于测量与导出解耦，某一次导出周期内可能包含零次或多次聚合后的测量。

异步 Instrument 则在 SDK 的请求下提供测量值。当 SDK 进行导出时，会调用创建仪表时提供的回调函数。该回调返回的测量值会立刻被导出。异步仪表的所有测量都在每个导出周期内执行一次。

异步 Instrument 适用于以下场景:

- 更新计数器的开销较大，不希望当前执行线程因记录测量而阻塞。
- 观测频率与程序执行无关，即无法准确地与请求生命周期绑定来测量。
- 测量值没有明确时间戳

在这些情况下，直接观测累计值通常优于事后对一系列增量（同步场景）进行聚合。

### 使用 Counter{#using-counters}

Counter 用来度量非负且单调递增的值。

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

### 使用 Gauge（仪表盘式快照）{#using-gauges}

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

### Using Histograms

Histograms are used to measure a distribution of values over time.

For example, here's how you report a distribution of response times for an HTTP
handler:

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

		// do some work in an API call

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### Using Observable (Async) Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value.

For example, here's how you report time since the application started:

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

### Using Observable (Async) UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value.

For example, here's how you report some database metrics:

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics registers asynchronous metrics for the provided db.
// Make sure to unregister metric.Registration before closing the provided db.
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

### Using Observable (Async) Gauges

Observable Gauges should be used to measure non-additive values.

For example, here's how you report memory usage of the heap objects used in
application:

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

### Adding attributes

You can add Attributes by using the
[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)
or
[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes)
options.

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
		// do some work in an API call and set the response HTTP status code

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### Registering Views

A view provides SDK users with the flexibility to customize the metrics output
by the SDK. You can customize which metric instruments are to be processed or
ignored. You can also customize aggregation and what attributes you want to
report on metrics.

Every instrument has a default view, which retains the original name,
description, and attributes, and has a default aggregation that is based on the
type of instrument. When a registered view matches an instrument, the default
view is replaced by the registered view. Additional registered views that match
the instrument are additive, and result in multiple exported metrics for the
instrument.

You can use the
[`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView)
function to create a view and register it using the
[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView)
option.

For example, here's how you create a view that renames the `latency` instrument
from the `v0.34.0` version of the `http` instrumentation library to
`request.latency`:

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

For example, here's how you create a view that makes the `latency` instrument
from the `http` instrumentation library to be reported as an exponential
histogram:

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

The SDK filters metrics and attributes before exporting metrics. For example,
you can use views to reduce memory usage of high cardinality metrics or drop
attributes that might contain sensitive data.

Here's how you create a view that drops the `latency` instrument from the `http`
instrumentation library:

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

Here's how you create a view that removes the `http.request.method` attribute
recorded by the `latency` instrument from the `http` instrumentation library:

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

The `Name` field of criteria supports wildcard pattern matching. The `*`
wildcard is recognized as matching zero or more characters, and `?` is
recognized as matching exactly one character. For example, a pattern of `*`
matches all instrument names.

The following example shows how you create a view that sets unit to milliseconds
for any instrument with a name suffix of `.ms`:

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

The `NewView` function provides a convenient way of creating views. If `NewView`
can't provide the functionalities you need, you can create a custom
[`View`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View) directly.

For example, here's how you create a view that uses regular expression matching
to ensure all data stream names have a suffix of the units it uses:

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// In a custom View function, you need to explicitly copy
	// the name, description, and unit.
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// Any instrument that does not have a unit suffix defined, but has a
	// dimensional unit defined, update the name with a unit suffix.
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

## Logs

Logs are distinct from metrics and traces in that **there is no user-facing
OpenTelemetry logs API**. Instead, there is tooling to bridge logs from existing
popular log packages (such as slog, logrus, zap, logr) into the OpenTelemetry
ecosystem. For rationale behind this design decision, see
[Logging specification](/docs/specs/otel/logs/).

The two typical workflows discussed below each cater to different application
requirements.

### Direct-to-Collector

**Status**: [Experimental](/docs/specs/otel/document-status/)

In the direct-to-Collector workflow, logs are emitted directly from an
application to a collector using a network protocol (e.g. OTLP). This workflow
is simple to set up as it doesn't require any additional log forwarding
components, and allows an application to easily emit structured logs that
conform to the [log data model][log data model]. However, the overhead required
for applications to queue and export logs to a network location may not be
suitable for all applications.

To use this workflow:

- Configure the OpenTelemetry [Log SDK](#logs-sdk) to export log records to
  desired target destination (the [collector][opentelemetry collector] or
  other).
- Use an appropriate [Log Bridge](#log-bridge).

#### Logs SDK

The logs SDK dictates how logs are processed when using the
[direct-to-Collector](#direct-to-collector) workflow. No log SDK is needed when
using the [log forwarding](#via-file-or-stdout) workflow.

The typical log SDK configuration installs a batching log record processor with
an OTLP exporter.

To enable [logs](/docs/concepts/signals/logs/) in your app, you'll need to have
an initialized [`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider)
that will let you use a [Log Bridge](#log-bridge).

If a `LoggerProvider` is not created, the OpenTelemetry APIs for logs will use a
no-op implementation and fail to generate data. Therefore, you have to modify
the source code to include the SDK initialization code using the following
packages:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

Ensure you have the right Go modules installed:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

Then initialize a logger provider:

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

	// Create resource.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Create a logger provider.
	// You can pass this instance directly when creating bridges.
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// Handle shutdown properly so nothing leaks.
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// Register as global logger provider so that it can be accessed global.LoggerProvider.
	// Most log bridges use the global logger provider as default.
	// If the global logger provider is not set then a no-op implementation
	// is used, which fails to generate data.
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

Now that a `LoggerProvider` is configured, you can use it to set up a
[Log Bridge](#log-bridge).

#### Log Bridge

A log bridge is a component that bridges logs from an existing log package into
the OpenTelemetry [Log SDK](#logs-sdk) using the [Logs Bridge
API][logs bridge API].

A full list of log bridges available can be found in the
[OpenTelemetry registry](/ecosystem/registry/?language=go&component=log-bridge).

Each log bridge package documentation should have a usage example.

### Via file or stdout

In the file or stdout workflow, logs are written to files or standout output.
Another component (e.g. FluentBit) is responsible for reading / tailing the
logs, parsing them to more structured format, and forwarding them a target, such
as the collector. This workflow may be preferable in situations where
application requirements do not permit additional overhead from
[direct-to-Collector](#direct-to-collector). However, it requires that all log
fields required down stream are encoded into the logs, and that the component
reading the logs parse the data into the [log data model][log data model]. The
installation and configuration of log forwarding components is outside the scope
of this document.

## Next Steps

You’ll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/go/exporters) to one or more
telemetry backends.

[opentelemetry specification]: /docs/specs/otel/
[trace semantic conventions]: /docs/specs/semconv/general/trace/
[instrumentation library]: ../libraries/
[opentelemetry collector]:
  https://github.com/open-telemetry/opentelemetry-collector
[logs bridge API]: /docs/specs/otel/logs/api/
[log data model]: /docs/specs/otel/logs/data-model
[`go.opentelemetry.io/otel`]: https://pkg.go.dev/go.opentelemetry.io/otel
[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric
[`go.opentelemetry.io/otel/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/metric
[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp
[`go.opentelemetry.io/otel/sdk/log`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/log
[`go.opentelemetry.io/otel/sdk/metric`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric
[`go.opentelemetry.io/otel/sdk/resource`]:
  https://pkg.go.dev/go.opentelemetry.io/otel/sdk/resource

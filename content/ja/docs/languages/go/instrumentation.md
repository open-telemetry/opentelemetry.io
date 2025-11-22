---
title: 計装
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: OpenTelemetry Goのマニュアルインストルメンテーション
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
cSpell:ignore: fatalf logr logrus otlplog otlploghttp sdktrace sighup
---

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

## トレース {#traces}

### トレーサーの取得 {#getting-a-tracer}

スパンを作成するには、まずトレーサーを取得または初期化する必要があります。

適切なパッケージがインストールされていることを確認してください。

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

次に、エクスポーター、リソース、トレーサープロバイダー、最後にトレーサーを初期化します。

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
	// お好みのエクスポーター： console、jaeger、zipkin、OTLPなど
}

func newTracerProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// デフォルトのSDKリソースと必要なサービス名が設定されていることを確認します
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

	// バッチスパンプロセッサーと指定されたエクスポーターで新しいトレーサープロバイダーを作成します
	tp := newTracerProvider(exp)

	// 何もリークしないようにシャットダウンを適切に処理します
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// 最後に、このパッケージで使用できるトレーサーを設定します
	tracer = tp.Tracer("example.io/package/name")
}
```

これで`tracer`にアクセスして、コードを手動計装できます。

### スパンの作成 {#creating-spans}

スパンはトレーサーによって作成されます。初期化されていない場合は、それを行う必要があります。

トレーサーでスパンを作成するには、`context.Context`インスタンスのハンドルも必要です。
これらは通常、リクエストオブジェクトなどから取得され、[計装ライブラリ][instrumentation library]からの親スパンを既に含んでいる場合があります。

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// hello-spanで追跡する作業を行います
}
```

Goでは、`context`パッケージがアクティブなスパンを格納するために使用されます。
スパンを開始すると、作成されたスパンだけでなく、それを含む変更されたコンテキストのハンドルも取得できます。

スパンが完了すると、それは不変になり、もはや変更できません。

### 現在のスパンを取得 {#get-current-span}

現在のスパンを取得するには、ハンドルを持っている`context.Context`からそれを取り出す必要があります。

```go
// このコンテキストは、抽出予定のアクティブなスパンを含む必要があります
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// 現在のスパンで何かを行い、オプションで終了したい場合は`span.End()`を呼び出します
```

これは、特定のタイミングで現在のスパンに情報を追加したい場合に役立ちます。

### ネストしたスパンの作成 {#create-nested-spans}

ネストした操作で作業を追跡するために、ネストしたスパンを作成できます。

ハンドルを持っている現在の`context.Context`に既にスパンが含まれている場合、新しいスパンを作成するとそれがネストしたスパンになります。
例を挙げましょう。

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// 子関数を呼び出し、そこでネストしたスパンを開始します
	childFunction(ctx)

	// より多くの作業を行います - この関数が終了すると、parentSpanが完了します
}

func childFunction(ctx context.Context) {
	// `childFunction()`を追跡するスパンを作成します - これは親が`parentSpan`であるネストしたスパンです
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// ここで作業を行い、この関数が戻ると、childSpanが完了します
}
```

スパンが完了すると、それは不変になり、もはや変更できません。

### スパン属性 {#span-attributes}

属性は、スパンにメタデータとして適用されるキーと値であり、トレースの集約、フィルタリング、グループ化に便利です。
属性はスパン作成時、または完了前のスパンのライフサイクル中の他の任意の時点で追加できます。

```go
// 作成時に属性を設定...
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// ... そして作成後に
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

属性キーは事前に計算することもできます。

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### セマンティック属性 {#semantic-attributes}

セマンティック属性は、HTTPメソッド、ステータスコード、ユーザーエージェントなどの一般的な概念について、複数の言語、フレームワーク、ランタイム間で共有される属性キーのセットを提供するために[OpenTelemetry仕様][OpenTelemetry Specification]によって定義された属性です。
これらの属性は`go.opentelemetry.io/otel/semconv/v1.37.0`パッケージで利用できます。

詳細については、[トレースセマンティック規約][Trace semantic conventions]を参照してください。

### イベント {#events}

イベントは、スパン上の人間が読める形式のメッセージで、そのライフタイム中に「何かが起こった」ことを表します。
たとえば、ミューテックスの下にあるリソースへの排他的アクセスを必要とする関数を想像してください。
イベントは2つのポイントで作成できます。
1つはリソースへのアクセスを取得しようとするとき、もう1つはミューテックスを取得するときです。

```go
span.AddEvent("Acquiring lock")
mutex.Lock()
span.AddEvent("Got lock, doing work...")
// 作業を行います
span.AddEvent("Unlocking")
mutex.Unlock()
```

イベントの有用な特性は、そのタイムスタンプがスパンの開始からのオフセットとして表示されることで、それらの間に経過した時間を簡単に確認できることです。

イベントは独自の属性も持つことができます。

```go
span.AddEvent("Cancelled wait due to external signal", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### スパンステータスの設定 {#set-span-status}

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

### エラーの記録 {#record-errors}

失敗した操作があり、それが生成したエラーをキャプチャしたい場合は、そのエラーを記録できます。

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

`RecordError`を使用する場合は、失敗した操作を追跡するスパンをエラースパンと見なしたくない場合を除き、スパンのステータスを`Error`に設定することを強く推奨します。
`RecordError`関数は、呼び出されたときにスパンステータスを自動的に設定**しません**。

### プロパゲーターとコンテキスト {#propagators-and-context}

トレースは単一のプロセスを超えて拡張できます。
これには、トレースの識別子がリモートプロセスに送信されるメカニズムである _コンテキスト伝搬_ が必要です。

ワイヤー経由でトレースコンテキストを伝搬するために、プロパゲーターをOpenTelemetry APIに登録する必要があります。

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> OpenTelemetryはまた、W3C TraceContext標準をサポートしない既存のトレーシングシステム（`go.opentelemetry.io/contrib/propagators/b3`）との互換性のためにB3ヘッダー形式もサポートしています。

コンテキスト伝搬を設定した後は、実際にコンテキストのシリアル化を管理する舞台裏の作業を処理するために、自動計装を使用したくなるでしょう。

## メトリクス {#metrics}

[メトリクス](/docs/concepts/signals/metrics)の生成を開始するには、`Meter`を作成できる初期化済みの`MeterProvider`が必要です。
メーターを使用すると、さまざまな種類のメトリクスを作成するために使用できる計装を作成できます。
OpenTelemetry Goは現在、次の計装をサポートしています。

- Counter、非負の増分をサポートする同期計装
- Asynchronous Counter、非負の増分をサポートする非同期計装
- Histogram、ヒストグラム、サマリー、パーセンタイルなど、統計的に意味のある任意の値をサポートする同期計装
- Synchronous Gauge、室温など、非加算値をサポートする同期計装
- Asynchronous Gauge、室温など、非加算値をサポートする非同期計装
- UpDownCounter、アクティブなリクエスト数など、増分と減分をサポートする同期計装
- Asynchronous UpDownCounter、増分と減分をサポートする非同期計装

同期および非同期計装の詳細、およびユースケースに最適な種類については、[補助ガイドライン](/docs/specs/otel/metrics/supplementary-guidelines/)を参照してください。

`MeterProvider`が計装ライブラリまたは手動で作成されていない場合、OpenTelemetryメトリクスAPIはno-op実装を使用し、データの生成に失敗します。

ここでより詳細なパッケージドキュメントを見つけることができます。

- メトリクスAPI：[`go.opentelemetry.io/otel/metric`][]
- メトリクスSDK：[`go.opentelemetry.io/otel/sdk/metric`][]

### メトリクスの初期化 {#initialize-metrics}

{{% alert %}}

ライブラリを計装している場合は、この手順をスキップしてください。

{{% /alert %}}

アプリで[メトリクス](/docs/concepts/signals/metrics/)を有効にするには、[`Meter`](/docs/concepts/signals/metrics/#meter)を作成できる初期化済みの[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider)が必要です。

`MeterProvider`が作成されていない場合、メトリクス用のOpenTelemetry APIはno-op実装を使用し、データの生成に失敗します。
したがって、次のパッケージを使用してSDK初期化コードを含むようにソースコードを変更する必要があります。

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

適切なGoモジュールがインストールされていることを確認してください。

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

次に、リソース、メトリクスエクスポーター、メトリクスプロバイダーを初期化します。

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
	// リソースを作成します
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// メータープロバイダーを作成します
	// MeterProviderインスタンスを受け入れる場合は、このインスタンスを
	// 計装されたコードに直接渡すことができます
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// 何もリークしないようにシャットダウンを適切に処理します
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// otel.Meter経由で使用でき、otel.GetMeterProviderを使用して
	// アクセスできるように、グローバルメータープロバイダーとして登録します
	// ほとんどのインストルメンテーションライブラリは、デフォルトとして
	// グローバルメータープロバイダーを使用します
	// グローバルメータープロバイダーが設定されていない場合、
	// no-op実装が使用され、データの生成に失敗します
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
			// デフォルトは1mです。デモンストレーション目的で3sに設定します
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

これで`MeterProvider`が設定されたので、`Meter`を取得できます。

### メーターの取得 {#acquiring-a-meter}

手動で計装されたコードがあるアプリケーション内の任意の場所で、[`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter)を呼び出してメーターを取得できます。
例を挙げましょう。

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### 同期および非同期計装 {#synchronous-and-asynchronous-instruments}

OpenTelemetryの計装は、同期または非同期（観測可能）のいずれかです。

同期計装は、呼び出されたときに測定を行います。
測定は、他の関数呼び出しと同様に、プログラム実行中の別の呼び出しとして行われます。
定期的に、これらの測定の集約が設定されたエクスポーターによってエクスポートされます。
測定は値のエクスポートから切り離されているため、エクスポートサイクルには0または複数の集約された測定が含まれる場合があります。

一方、非同期計装は、SDKのリクエストで測定を提供します。
SDKがエクスポートするとき、作成時に計装に提供されたコールバックが呼び出されます。
このコールバックは、即座にエクスポートされる測定をSDKに提供します。
非同期計装でのすべての測定は、エクスポートサイクルごとに1回実行されます。

非同期計装は、次のようないくつかの状況で役立ちます。

- カウンターの更新が計算上安価でなく、現在実行中のスレッドが測定を待つことを望まない場合
- 観測がプログラム実行とは無関係な頻度で発生する必要がある場合（すなわち、リクエストライフサイクルに関連付けられているときに正確に測定できない場合）
- 測定値に既知のタイムスタンプがない場合

このような場合、後処理で一連のデルタを集約するのではなく、累積値を直接観測する方が良いことがよくあります（同期例）。

### カウンターの使用 {#using-counters}

カウンターは、非負の増加する値を測定するために使用できます。

たとえば、HTTPハンドラーの呼び出し数を報告する方法は次のとおりです。

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

		// API呼び出しで何らかの作業を行います
	})
}
```

### UpDownカウンターの使用 {#using-updown-counters}

UpDownカウンターは増分と減分ができ、上下する累積値を観測できます。

たとえば、あるコレクションのアイテム数を報告する方法は次のとおりです。

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
	// コレクションにアイテムを追加するコード

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// コレクションからアイテムを削除するコード

	itemsCounter.Add(context.Background(), -1)
}
```

### ゲージの使用 {#using-gauges}

ゲージは、変更が発生したときに非加算値を測定するために使用されます。

たとえば、CPUファンの現在の速度を報告する方法は次のとおりです。

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
		// デモンストレーション目的でランダムなファン速度を生成します
		// 実際のアプリケーションでは、これを実際のファン速度を取得するように置き換えてください
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// 同期ゲージは、測定サイクルが外部の変更と
			// 同期している場合に使用されます
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

### ヒストグラムの使用 {#using-histograms}

ヒストグラムは、時間の経過に伴う値の分布を測定するために使用されます。

たとえば、HTTPハンドラーの応答時間の分布を報告する方法は次のとおりです。

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

		// API呼び出しで何らかの作業を行います

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### 観測可能（非同期）カウンターの使用 {#using-observable-async-counters}

観測可能カウンターは、加算的で非負の単調増加する値を測定するために使用できます。

たとえば、アプリケーションが開始してからの時間を報告する方法は次のとおりです。

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

### 観測可能（非同期）UpDownカウンターの使用 {#using-observable-async-updown-counters}

観測可能UpDownカウンターは増分と減分ができ、加算的で非負の非単調増加累積値を測定できます。

たとえば、データベースメトリクスを報告する方法は次のとおりです。

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetricsは、提供されたdbの非同期メトリクスを登録します
// 提供されたdbを閉じる前に、metric.Registrationの登録を解除してください
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

### 観測可能（非同期）ゲージの使用 {#using-observable-async-gauges}

観測可能ゲージは、非加算値を測定するために使用する必要があります。

たとえば、アプリケーションで使用されるヒープオブジェクトのメモリ使用量を報告する方法は次のとおりです。

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

### 属性の追加 {#adding-attributes}

[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)または[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes)オプションを使用して属性を追加できます。

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
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
		// API呼び出しで何らかの作業を行い、応答HTTPステータスコードを設定します

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### ビューの登録 {#registering-views}

ビューは、SDKによって出力されるメトリクスをカスタマイズする柔軟性をSDKユーザーに提供します。
どのメトリクス計装を処理するか無視するかをカスタマイズできます。
また、集約とメトリクスで報告したい属性もカスタマイズできます。

すべての計装には、元の名前、説明、属性を保持し、計装のタイプに基づくデフォルトの集約を持つデフォルトビューがあります。
登録されたビューが計装と一致する場合、デフォルトビューは登録されたビューに置き換えられます。
計装と一致する追加の登録済みビューは累積的であり、計装に対して複数のエクスポートされたメトリクスが生成されます。

[`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView)関数を使用してビューを作成し、[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView)オプションを使用して登録できます。

たとえば、`http`計装ライブラリの`v0.34.0`バージョンからの`latency`計装を`request.latency`に名前を変更するビューを作成する方法は次のとおりです。

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

たとえば、`http`計装ライブラリからの`latency`計装を指数ヒストグラムとして報告するビューを作成する方法は次のとおりです。

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

SDKは、メトリクスをエクスポートする前にメトリクスと属性をフィルタリングします。たとえば、ビューを使用して高カーディナリティメトリクスのメモリ使用量を削減したり、機密データを含む可能性のある属性を削除したりできます。

`http`計装ライブラリからの`latency`計装を削除するビューを作成する方法は次のとおりです。

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

`http`計装ライブラリからの`latency`計装によって記録された`http.request.method`属性を削除するビューを作成する方法は次のとおりです。

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

条件の`Name`フィールドはワイルドカードパターンマッチングをサポートしています。`*`ワイルドカードは0個以上の文字に一致するものとして認識され、`?`はちょうど1文字に一致するものとして認識されます。たとえば、`*`のパターンはすべての計装名に一致します。

名前の接尾辞が`.ms`である任意の計装に対して単位をミリ秒に設定するビューを作成する方法の例を次に示します。

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

`NewView`関数は、ビューを作成する便利な方法を提供します。`NewView`が必要な機能を提供できない場合は、カスタム[`View`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View)を直接作成できます。

たとえば、正規表現マッチングを使用して、すべてのデータストリーム名が使用する単位の接尾辞を持つことを保証するビューを作成する方法は次のとおりです。

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// カスタムView関数では、名前、説明、単位を明示的にコピーする必要があります
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// 単位サフィックスが定義されていないが、次元単位が定義されている
	// 任意のインストルメントに対して、名前を単位サフィックスで更新します
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

## ログ {#logs}

ログは、**ユーザー向けのOpenTelemetryログAPIが存在しない**点で、メトリクスやトレースとは異なります。
かわりに、既存の人気のあるログパッケージ（slog、logrus、zap、logrなど）からOpenTelemetryエコシステムにログをブリッジするツールがあります。
この設計決定の根拠については、[ログ仕様](/docs/specs/otel/logs/)を参照してください。

以下で説明する2つの典型的なワークフローは、それぞれ異なるアプリケーション要件に対応しています。

### Direct-to-Collector {#direct-to-collector}

**ステータス**：　[Experimental](/docs/specs/otel/document-status/)

Direct-to-Collectorワークフローでは、ログはネットワークプロトコル（OTLPなど）を使用してアプリケーションからコレクターに直接送信されます。
このワークフローは、追加のログ転送コンポーネントを必要とせず、設定が簡単で、[ログデータモデル][log data model]に準拠した構造化ログをアプリケーションが簡単に送信できます。
ただし、アプリケーションがネットワークの場所にログをキューイングおよびエクスポートするために必要なオーバーヘッドは、すべてのアプリケーションに適しているとは限りません。

このワークフローを使用するには。下記に従ってください。

- 目的のターゲット宛先（[コレクター][opentelemetry collector]またはその他）にログレコードをエクスポートするように、OpenTelemetry [Log SDK](#logs-sdk)を設定します。
- 適切な[Log Bridge](#log-bridge)を使用します。

#### ログSDK {#logs-sdk}

ログSDKは、[direct-to-Collector](#direct-to-collector)ワークフローを使用する際のログの処理方法を決定します。
[ログ転送](#via-file-or-stdout)ワークフローを使用する場合、ログSDKは必要ありません。

典型的なログSDK設定では、OTLPエクスポーターを使用してバッチログレコードプロセッサーをインストールします。

アプリで[ログ](/docs/concepts/signals/logs/)を有効にするには、[Log Bridge](#log-bridge)を使用できる初期化済みの[`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider)が必要です。

`LoggerProvider`が作成されていない場合、ログ用のOpenTelemetry APIはno-op実装を使用し、データの生成に失敗します。
したがって、次のパッケージを使用してSDK初期化コードを含むようにソースコードを変更する必要があります。

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

適切なGoモジュールがインストールされていることを確認してください。

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

次に、ロガープロバイダーを初期化します。

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

	// リソースを作成します
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// ロガープロバイダーを作成します
	// ブリッジを作成するときに、このインスタンスを直接渡すことができます
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// 何もリークしないようにシャットダウンを適切に処理します
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// global.LoggerProviderにアクセスできるように、グローバルロガープロバイダーとして登録します
	// ほとんどのログブリッジは、デフォルトとしてグローバルロガープロバイダーを使用します
	// グローバルロガープロバイダーが設定されていない場合、no-op実装が使用され、
	// データの生成に失敗します
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

これで`LoggerProvider`が設定されたので、それを使用して[Log Bridge](#log-bridge)を設定できます。

#### ログブリッジ {#log-bridge}

ログブリッジは、[Logs Bridge API][logs bridge API]を使用して、既存のログパッケージからOpenTelemetry [Log SDK](#logs-sdk)にログをブリッジするコンポーネントです。

利用可能なログブリッジの完全なリストは、[OpenTelemetryレジストリ](/ecosystem/registry/?language=go&component=log-bridge)で見つけることができます。

各ログブリッジパッケージのドキュメントには、使用例が含まれているはずです。

### ファイルまたは標準出力経由 {#via-file-or-stdout}

ファイルまたは標準出力ワークフローでは、ログはファイルまたは標準出力に書き込まれます。別のコンポーネント（FluentBitなど）がログの読み取り/テーリング、より構造化された形式への解析、およびコレクターなどのターゲットへの転送を担当します。このワークフローは、アプリケーション要件が[direct-to-Collector](#direct-to-collector)からの追加のオーバーヘッドを許可しない状況で好まれる場合があります。ただし、下流で必要なすべてのログフィールドがログにエンコードされ、ログを読み取るコンポーネントがデータを[ログデータモデル][log data model]に解析することが必要です。ログ転送コンポーネントのインストールと設定は、このドキュメントの範囲外です。

## 次のステップ {#next-steps}

また、テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/go/exporters)するために、適切なエクスポーターを設定することもできます。

[opentelemetry specification]: /docs/specs/otel/
[trace semantic conventions]: /docs/specs/semconv/general/trace/
[instrumentation library]: ../libraries/
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

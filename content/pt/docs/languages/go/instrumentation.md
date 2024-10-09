---
title: Instrumentação
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: Instrumentação manual para OpenTelemetry Go
cSpell:ignore: fatalf logr logrus otelslog otlplog otlploghttp sdktrace sighup
---

{{% docs/languages/instrumentation-intro %}}

## Configuração {#setup}

## Rastros {#traces}

### Inicializando um Tracer {#getting-a-tracer}

Para criar trechos, você precisará obter ou inicializar um Tracer primeiro.

Certifique-se de ter os seguintes pacotes instalados:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

Em seguida, inicialize um Exporter, Resources, Tracer Provider e finalmente o
Tracer.

```go
package app

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context)  /* (someExporter.Exporter, error) */ {
	// Your preferred exporter: console, jaeger, zipkin, OTLP, etc.
}

func newTraceProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Ensure default SDK resources and the required service name are set.
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

	// Create a new tracer provider with a batch span processor and the given exporter.
	tp := newTraceProvider(exp)

	// Handle shutdown properly so nothing leaks.
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// Finally, set the tracer that can be used for this package.
	tracer = tp.Tracer("example.io/package/name")
}
```

Agora você pode acessar `tracer` para instrumentar manualmente o seu código.

### Criando Trechos {#creating-spans}

Os trechos são criados por Tracers. Se você não tiver um inicializado, precisará
fazer isso.

Para criar um evento com um Tracer, você também precisará de um _handler_ para a
instância do `context.Context`. Esses _handlers_ geralmente vêm de
implementações como por exemplo um objeto de requisição e podem já conter um
trecho parente inicializado por uma [biblioteca de
instrumentação][instrumentation library].

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// do some work to track with hello-span
}
```

Em Go, o pacote `context` é utilizado para armazenar o trecho ativo. Ao iniciar um trecho, você terá acesso não apenas ao trecho criado, mas também ao contexto modificado que o contém.

Uma vez que um trecho é concluído, ele se torna imutável e não pode mais ser modificado.

### Obter o trecho atual {#get-the-current-span}

Para obter o trecho atual, você precisará extraí-lo de um `context.Context` ao qual você tenha acesso:

```go
// This context needs contain the active span you plan to extract.
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// Do something with the current span, optionally calling `span.End()` if you want it to end
```

Isso pode ser útil se você quiser adicionar informações ao trecho atual em um determinado momento.

### Criar trechos aninhados {#create-nested-spans}

Você pode criar um trecho aninhado para rastrear a operação de maneira aninhada.

Se o `context.Context` atual que você possui já contiver um trecho, a criação de um novo trecho resultará em um aninhamento. Por exemplo:

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "parent")
	defer parentSpan.End()

	// call the child function and start a nested span in there
	childFunction(ctx)

	// do more work - when this function ends, parentSpan will complete.
}

func childFunction(ctx context.Context) {
	// Create a span to track `childFunction()` - this is a nested span whose parent is `parentSpan`
	ctx, childSpan := tracer.Start(ctx, "child")
	defer childSpan.End()

	// do work here, when this function returns, childSpan will complete.
}
```

Uma vez que o trecho é finalizado, ele se torna imutável e não pode mais ser modificado.

### Atributos de Trecho {#span-attributes}

Os atributos são pares de chaves e valor aplicados como metadados aos seus trechos e são úteis para agregar, filtrar e agrupar rastros. Os atributos podem ser adicionados durante a criação de um trecho ou a qualquer momento durante seu ciclo de vida, antes que ele seja concluído.

```go
// setting attributes at creation...
ctx, span = tracer.Start(ctx, "attributesAtCreation", trace.WithAttributes(attribute.String("hello", "world")))
// ... and after creation
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("stringAttr", "hi!"))
```

As chaves dos atributos também podem ser pré-computadas:

```go
var myKey = attribute.Key("myCoolAttribute")
span.SetAttributes(myKey.String("a value"))
```

#### Atributos Semânticos {#semantic-attributes}

Os Atributos Semânticos são atributos definidos pela [Especificação do OpenTelemetry][OpenTelemetry Specification] para fornecer um conjunto comum de chaves de atributos entre várias linguagens, frameworks e ambientes de execução. Eles representam conceitos como métodos HTTP, códigos de staus, user agents e outros. Estes atributos estão disponíveis no pacote  `go.opentelemetry.io/otel/semconv/v1.26.0`.

Para mais detalhes, consulte as [Convenções Semânticas de Rastros][Trace semantic conventions].

### Eventos {#events}

Um evento é uma mensagem legível para humanos em um trecho que representa "algo acontecendo" durante a sua duração. Por exemplo, imagine uma função que requer acesso exclusivo a um recurso que está sob um mutex. Um evento poderia ser criado em dois pontos: um quando tentamos obter acesso ao recurso e outro quando adquirimos o mutex.

```go
span.AddEvent("Acquiring lock")
mutex.Lock()
span.AddEvent("Got lock, doing work...")
// do stuff
span.AddEvent("Unlocking")
mutex.Unlock()
```

Uma característica útil dos eventos é que seus timestamps são exibidos como offsets a partir do início do span, permitindo ver facilmente quanto tempo se passou entre cada um.

Os Eventos também podem incluir seus próprios atributos -

```go
span.AddEvent("Cancelled wait due to external signal", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### Definir status do Trecho {#set-span-status}

{{% pt/docs/languages/span-status-preamble %}}

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

### Capturar erros {#record-errors}

Caso você tenha uma operação que falhou e deseja capturar o erro que foi produzido, você pode registrar este erro.

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

É altamente recomendável que você também defina o estado de um trecho como `Error` ao utilizar `RecordError`, a menos que você não queira considerar o trecho que faz rastreamento de uma operação que falhou como um trecho de erro. O método `RecordError` **não** define automaticamente o estado de um trecho ao ser invocado.

### Context e Propagators {#propagators-and-context}

Os Rastros podem se estender além de um único processo. Isso requer a _propagação de contexto_, um mecanismo onde os identificadores de um rastro são enviados para processos remotos.

Para propagar o contexto de um rastro pela rede, um propagador deve ser registrado com a API do OpenTelemetry.

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> O OpenTelemetry também suporta headers no formato B3, para compatibilidade com
> sistemas de rastreamento (`go.opentelemetry.io/contrib/propagators/b3`) que
> não suportam o padrão W3C TraceContext.

Após configurar a propagação de contexto, você provavelmente vai querer utilizar a instrumentação automática para lidar com todo o trabalho que acontece debaixo dos panos e gerenciar a serialização de contexto.

## Métricas {#metrics}

Para começar a produzir [métricas](/docs/concepts/signals/metrics), você precisará ter um `MeterProvider` inicializado que permita a criação de um `Meter`. Os Meters permitem que você crie instrumentos que podem ser utilizados para gerar diferentes tipos de métricas. O OpenTelemetry Go atualmente suporta os seguintes instrumentos:

- Counter, um instrumento síncrono que suporta ingrementos não-negativos
- Asynchronous Counter, um instrumento assíncrono que suporta incrementos não-negativos
- Histogram, um instrumento síncrono que suporta valores arbitrários e que são estatísticamente significativos, como histogramas, resumos ou percentis
- Synchronous Gauge, um instrumento síncrono que suporta valores não-aditivos, como a temperatura ambiente
- Asynchronous Gauge, um instrumento assíncrono que suporta valores não-aditivos, como a temperatura ambiente
- UpDownCounter, um instrumento síncrono que suporta incrementos e decrementos, como o número de requisições ativas
- Asynchronous UpDownCounter, um instrumento assíncrono que suporta incrementos e decrementos

Para mais informações sobre instrumentos síncronos e assíncronos, e qual tipo é mais adequado para o seu caso de uso, consulte as [Diretrizes Suplementares](/docs/specs/otel/metrics/supplementary-guidelines/).

Caso um `MeterProvider` não seja criado, tanto por uma biblioteca de instrumentação ou manualmente, a API de Métricas do OpenTelemetry usará uma implementação no-op e não irá gerar dados.

Aqui, você poderá encontrar uma documentação mais detalhada para os pacotes:

- Metrics API: [`go.opentelemetry.io/otel/metric`][]
- Metrics SDK: [`go.opentelemetry.io/otel/sdk/metric`][]

### Inicializar Métricas {#initialize-metrics}

{{% alert color="info" %}} Caso você esteja instrumentando uma biblioteca, pule esta etapa.
{{% /alert %}}

Para habilitar [métricas](/docs/concepts/signals/metrics/) em sua apicação, você precisará ter um [`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) inicializado, que permitirá que você crie um [`Meter`](/docs/concepts/signals/metrics/#meter).

Caso um `MeterProvider` não seja criado, as APIs de métricas do OpenTelemetry irão utilizar uma implementação no-op e falhará em gerar dados de métricas. Sendo assim, é necessário que o código fonte seja modificado para incluir a inicialização do SDK utilizando os seguintes pacotes:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

Certifique-se de haver instalado corretamente os seguintes módulos Go:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/stdout/stdoutmetric \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/metric
```

Em seguida, inicialize um `Resource`, `Metrics Exporter` e um `Meter Provider`:

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
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

func main() {
	// Crie um 'Resource'.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Inicialize um Meter Provider.
	// Você poderá passar a instância diretamente para o seu código instrumentado, caso
	// o mesmo aceite uma instância do MeterProvider.
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// Lidamos com a finalização corretamente, evitando leaks.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// Registre o MeterProvider globalmente, permitindo a utilização via otel.Meter
	// e acessando utilizando otel.GetMeterProvider.
	// A maioria das bibliotecas de instrumentação utilizam o MeterProvider global como padrão.
	// Caso o MeterProvider global não esteja definido, será utilizada uma implementação no-op
	// e não irá gerar dados de métricas.
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
			// O valor padrão é 1m. Definimos em 3s para propósitos de demonstração.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

Agora que o `MeterProvider` está configurado, podemos obter um `Meter`.

### Obtendo um Meter {#acquiring-a-meter}

Qualquer ponto da sua aplicação que possua código instrumentado poderá invocar o método  [`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter) to
para obter um `Meter`. Por exemplo:

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### Instrumentos síncronos e assíncronos {#synchronous-and-asynchronous-instruments}

Os instrumentos do OpenTelemetry podem ser síncronos ou assíncronos (observáveis).

Os instrumentos síncronos fazem uma medição quando são chamados. A medição é realizada como uma outra chamada durante a execução da aplicação, assim como qualquer outra chamada de função. Periodicamente, a agregação dessas medições é exportada por um `Exporter` configurado. Como as medições são desacopladas da exportação de valores, um ciclo de exportação pode conter zero ou várias medições agregadas.

Os instrumentos assíncronos, por outro lado, fornecem uma medição a partir de uma solicitação do SDK. Quando o SDK realiza a exportação, um callback que foi fornecido ao instrumento no momento de sua criação é invocado. Este callback fornece ao SDK uma medição, que é imediatamente exportada. Todas as medições em instrumentos assíncronos são realizadas uma vez por cada ciclo de exportação.

Os instrumentos assíncronos podem ser úteis em diversas circunstâncias, como:

- Quando a atualização de um computador não é computacionalmente barata e você não deseja que o thread em execução aguarde pela medição
- Quando observações precisam acontecer em ferquências não relacionadas à execução da aplicação (ou seja, não podem ser medidas com precisão quando vinculadas ao ciclo de vida de uma solicitação)
- Quando não há um timestamp conhecido para um valor de medição

Em casos como estes, muitas vezes é melhor observar um valor cumulativo diretamente, em vez de agregar uma série de deltas em um pós-processamento (da maneira em que ocorre no exemplo síncrono).

### Utilizando Counters {#using-counters}

Counters podem ser utilizados para medir valores incrementais e não-negativos.

Por exemplo, aqui está como seria possível reportar o número de chamadas HTTP em um handler:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	apiCounter, err := meter.Int64Counter(
		"api.counter",
		metric.WithDescription("Número de chamadas na API."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		apiCounter.Add(r.Context(), 1)

		// implementação da chamada da API
	})
}
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a
cumulative value that goes up or down.

For example, here's how you report the number of items of some collection:

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
	// code that adds an item to the collection

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// code that removes an item from the collection

	itemsCounter.Add(context.Background(), -1)
}
```

### Using Gauges

Gauges are used to measure non-additive values when changes occur.

For example, here's how you might report the current speed of a CPU fan:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

var fanSpeedSubscription chan int64

func init() {
	speedGauge, err := meter.Int64Gauge(
		"cpu.fan.speed",
		metric.WithDescription("Speed of CPU fan"),
		metric.WithUnit("RPM"),
	)
	if err != nil {
		panic(err)
	}

	getCPUFanSpeed := func() int64 {
		// Generates a random fan speed for demonstration purpose.
		// In real world applications, replace this to get the actual fan speed.
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// Synchronous gauges are used when the measurement cycle is
			// synchronous to an external change.
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
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
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
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
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
[logs bridge API]: /docs/specs/otel/logs/bridge-api
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

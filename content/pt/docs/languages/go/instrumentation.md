---
title: Instrumentação
aliases:
  - manual
  - manual_instrumentation
weight: 30
description: Instrumentação manual para OpenTelemetry Go
default_lang_commit: a025c25aaf1aef653caa34e49e8714472cbeddbd
# prettier-ignore
cSpell:ignore: fatalf logr logrus otelslog otlplog otlploghttp sdktrace sighup updown
---

{{% docs/languages/instrumentation-intro %}}

## Configuração {#setup}

## Rastros {#traces}

### Inicializando um Tracer {#getting-a-tracer}

Para criar trechos, você precisará obter ou inicializar um Tracer primeiro.

Certifique-se que os seguintes pacotes Go foram instalados corretamente:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
```

Em seguida, inicialize um exporter, recursos, tracer provider e finalmente o
rastreador.

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
	// Seu Exporter de preferência: console, jaeger, zipkin, OTLP, etc.
}

func newTraceProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Certifique-se de que os recursos padrão do SDK e o nome do serviço estão definidos.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ServicoExemplo"),
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
		log.Fatalf("falha ao inicializar o exporter: %v", err)
	}

	// Crie um novo TracerProvider com o Processor de Trechos e o Exporter criado.
	tp := newTraceProvider(exp)

	// Lidamos com a finalização corretamente, evitando leaks.
	defer func() { _ = tp.Shutdown(ctx) }()

	otel.SetTracerProvider(tp)

	// Finalmente, definimos o Tracer que será utilizado por este pacote.
	tracer = tp.Tracer("example.io/package/name")
}
```

Agora você pode acessar `tracer` para instrumentar manualmente o seu código.

### Criando Trechos {#creating-spans}

Os trechos são criados por rastreadores. Se você não tiver um inicializado,
precisará fazer isso.

Para criar um evento com um rastreador, você também precisará de um manipulador
para a instância do `context.Context`. Estes manipuladores vêm geralmente de um
objeto de requisição e podem já conter um trecho pai inicializado por uma
[biblioteca de instrumentação][instrumentation library].

```go
func httpHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "hello-span")
	defer span.End()

	// insira algum código para rastrear com o hello-span
}
```

Em Go, o pacote `context` é utilizado para armazenar o trecho ativo. Ao iniciar
um trecho, você terá acesso não apenas ao trecho criado, mas também ao contexto
modificado que o contém.

Uma vez que um trecho é concluído, ele se torna imutável e não pode mais ser
modificado.

### Obter o trecho atual {#get-the-current-span}

Para obter o trecho atual, você precisará extraí-lo de um `context.Context` ao
qual você tenha acesso:

```go
// Este contexto precisa conter o trecho ativo que você pretende extrair.
ctx := context.TODO()
span := trace.SpanFromContext(ctx)

// Insira o código para fazer algo com o trecho atual, chamando opcionalmente o método `span.End()` caso deseje finalizá-lo.
```

Isso pode ser útil se você quiser adicionar informações ao trecho atual em um
determinado momento.

### Criar trechos aninhados {#create-nested-spans}

Você pode criar um trecho aninhado para rastrear a operação aninhada.

Se o `context.Context` atual que você possui já contiver um trecho, a criação de
um novo trecho resultará em um aninhamento. Por exemplo:

```go
func parentFunction(ctx context.Context) {
	ctx, parentSpan := tracer.Start(ctx, "pai")
	defer parentSpan.End()

	// invoque a função filha e inicie um trecho aninhado dentro dela
	childFunction(ctx)

	// insira mais coisas no código - ao finalizar esta função, o trecho declarado em 'parentSpan' será finalizado.
}

func childFunction(ctx context.Context) {
	// Inicialize um trecho para rastrear a chamada `childFunction()` -
	// este é um trecho aninhado, cujo pai foi declarado no método anterior em `parentSpan`
	ctx, childSpan := tracer.Start(ctx, "filho")
	defer childSpan.End()

	// insira algum código aqui - ao finalizar esta função, o trecho declarado em 'childSpan' será finalizado.
}
```

Uma vez que o trecho é finalizado, ele se torna imutável e não pode mais ser
modificado.

### Atributos de Trecho {#span-attributes}

Os atributos são pares de chave e valor aplicados como metadados aos seus
trechos e são úteis para agregar, filtrar e agrupar rastros. Os atributos podem
ser adicionados durante a criação de um trecho ou a qualquer momento durante seu
ciclo de vida, antes que ele seja concluído.

```go
// definindo atributos na criação...
ctx, span = tracer.Start(ctx, "atributosNaCriacao", trace.WithAttributes(attribute.String("hello", "world")))
// ... e após a criação
span.SetAttributes(attribute.Bool("isTrue", true), attribute.String("atributoDeTexto", "oi!"))
```

As chaves dos atributos também podem ser pré-computadas:

```go
var myKey = attribute.Key("meuAtributoLegal")
span.SetAttributes(myKey.String("um valor em texto"))
```

#### Atributos Semânticos {#semantic-attributes}

Os Atributos Semânticos são atributos definidos pela [Especificação do
OpenTelemetry][opentelemetry specification] para fornecer um conjunto comum de
chaves de atributos entre várias linguagens, frameworks e ambientes de execução.
Esses atributos representam conceitos como métodos HTTP, códigos de estado, user
agents e outros. Estes atributos estão disponíveis no pacote
`go.opentelemetry.io/otel/semconv/v1.26.0`.

Para mais detalhes, consulte as [Convenções Semânticas de
Rastros][trace semantic conventions].

### Eventos {#events}

Um evento é uma mensagem legível para humanos em um trecho que representa "algo
acontecendo" durante a sua duração. Por exemplo, imagine uma função que requer
acesso exclusivo a um recurso que está sob um mutex. Um evento poderia ser
criado em dois pontos: um quando tentamos obter acesso ao recurso e outro quando
adquirimos o mutex.

```go
span.AddEvent("Obtendo o bloqueio")
mutex.Lock()
span.AddEvent("Bloqueio efetuado, realizando ações...")
// fazendo algo
span.AddEvent("Realizando o desbloqueio")
mutex.Unlock()
```

Uma característica útil dos eventos é que seus registros de data e hora são
exibidos como intervalos a partir do início do trecho, permitindo ver facilmente
quanto tempo se passou entre cada um.

Os eventos também podem incluir seus próprios atributos -

```go
span.AddEvent("Espera cancelada devido a um sinal externo", trace.WithAttributes(attribute.Int("pid", 4328), attribute.String("signal", "SIGHUP")))
```

### Definir status do trecho {#set-span-status}

{{% pt/docs/languages/span-status-preamble %}}

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operacaoQueDeveriaFalhar()
if err != nil {
	span.SetStatus(codes.Error, "operacaoQueDeveriaFalhar falhou")
}
```

### Capturar erros {#record-errors}

Caso você tenha uma operação que falhou e deseja capturar o erro produzido, você
pode salvar este erro.

```go
import (
	// ...
	"go.opentelemetry.io/otel/codes"
	// ...
)

// ...

result, err := operacaoQueDeveriaFalhar()
if err != nil {
	span.SetStatus(codes.Error, "operacaoQueDeveriaFalhar falhou")
	span.RecordError(err)
}
```

É altamente recomendável que você também defina o estado de um trecho como
`Error` ao utilizar `RecordError`, a menos que você não queira considerar o
trecho que faz rastreamento de uma operação que falhou como um trecho de erro. O
método `RecordError` **não** define automaticamente o estado de um trecho ao ser
invocado.

### Contexto e Propagadores {#propagators-and-context}

Os rastros podem se estender além de um único processo. Isso requer a
_propagação de contexto_, um mecanismo onde os identificadores de um rastro são
enviados para processos remotos.

Para propagar o contexto de um rastro pela rede, um propagador deve ser
registrado com a API do OpenTelemetry.

```go
import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/propagation"
)
...
otel.SetTextMapPropagator(propagation.TraceContext{})
```

> O OpenTelemetry também suporta cabeçalhos no formato B3, para compatibilidade
> com sistemas de rastreamento (`go.opentelemetry.io/contrib/propagators/b3`)
> que não suportam o padrão W3C TraceContext.

Após configurar a propagação de contexto, você provavelmente vai querer utilizar
a instrumentação automática para lidar com todo o trabalho que acontece debaixo
dos panos para gerenciar a serialização de contexto.

## Métricas {#metrics}

Para começar a produzir [métricas](/docs/concepts/signals/metrics), você
precisará ter um `MeterProvider` inicializado que permita a criação de um
`Meter`. Os _Meters_ permitem que você crie instrumentos que podem ser
utilizados para gerar diferentes tipos de métricas. O OpenTelemetry Go suporta
atualmente os seguintes instrumentos:

- Contador (Counter), um instrumento síncrono que suporta incrementos
  não-negativos.
- Contador Assíncrono (Asynchronous Counter), um instrumento assíncrono que
  suporta incrementos não-negativos.
- Histograma (Histogram), um instrumento síncrono que suporta valores
  arbitrários que são estatisticamente significativos, como histogramas, resumos
  ou percentis.
- Medidor Síncrono (Synchronous Gauge), um instrumento síncrono que suporta
  valores não-aditivos, como a medição de temperatura de um ambiente.
- Medidor Assíncrono (Asynchronous Gauge), um instrumento assíncrono que suporta
  valores não-aditivos, como a medição de temperatura de um ambiente.
- Contador UpDown (UpDownCounter), um instrumento síncrono que suporta
  incrementos e decrementos, como o número de requisições ativas.
- Contador UpDown Assíncrono (Asynchronous UpDownCounter), um instrumento
  assíncrono que suporta incrementos e decrementos.

- Para mais informações sobre instrumentos síncronos, assíncronos, e entender
  qual dos tipos melhor se encaixa no seu caso de uso, consulte as
  [Diretrizes Suplementares](/docs/specs/otel/metrics/supplementary-guidelines/).

Caso um `MeterProvider` não seja criado, tanto por uma biblioteca de
instrumentação ou manualmente, a API de Métricas do OpenTelemetry usará uma
implementação sem operação e não irá gerar dados.

A seguir, você poderá encontrar uma documentação mais detalhada para os pacotes:

- Metrics API: [`go.opentelemetry.io/otel/metric`][]
- Metrics SDK: [`go.opentelemetry.io/otel/sdk/metric`][]

### Inicializar Métricas {#initialize-metrics}

{{% alert color="info" %}} Caso você esteja instrumentando uma biblioteca, pule
esta etapa. {{% /alert %}}

Para habilitar [métricas](/docs/concepts/signals/metrics/) em sua aplicação,
você precisará de um
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) inicializado,
que permitirá que você crie um [`Meter`](/docs/concepts/signals/metrics/#meter).

Caso um `MeterProvider` não seja inicializado, a API de métricas do
OpenTelemetry irá utilizar uma implementação sem operação e não irá gerar dados
de métricas. Sendo assim, é necessário que o código-fonte da aplicação seja
modificado para incluir a inicialização do SDK utilizando os seguintes pacotes:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/metric`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`][]

Certifique-se que os seguintes pacotes Go foram instalados corretamente:

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

	// Lidamos com a finalização corretamente, evitando vazamentos.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// Registre o MeterProvider globalmente, permitindo a utilização via otel.Meter
	// e o acesso utilizando otel.GetMeterProvider.
	// A maioria das bibliotecas de instrumentação utilizam o MeterProvider global como padrão.
	// Caso o MeterProvider global não esteja definido, será utilizada uma implementação sem operação
	// e não irá gerar dados de métricas.
	otel.SetMeterProvider(meterProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("meu-servico"),
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

Qualquer ponto da sua aplicação que possua código instrumentado poderá invocar o
método [`otel.Meter`](https://pkg.go.dev/go.opentelemetry.io/otel#Meter) para
obter um `Meter`. Por exemplo:

```go
import "go.opentelemetry.io/otel"

var meter = otel.Meter("example.io/package/name")
```

### Instrumentos síncronos e assíncronos {#synchronous-and-asynchronous-instruments}

Os instrumentos do OpenTelemetry podem ser síncronos ou assíncronos
(observáveis).

Os instrumentos síncronos fazem uma medição quando são chamados. A medição é
realizada como uma chamada de método durante a execução da aplicação, assim como
qualquer outra chamada de método. Periodicamente, a agregação dessas medições é
exportada por um `Exporter` configurado. Como as medições são desacopladas da
exportação dos valores medidos, um ciclo de exportação pode conter zero ou
várias medições agregadas.

Os instrumentos assíncronos, por outro lado, fornecem uma medição a partir de
uma solicitação do SDK. Quando o SDK realiza a exportação, uma função de retorno
fornecida ao instrumento de medição no momento de sua criação é invocada. Esta
função de retorno fornece ao SDK uma medição, que é imediatamente exportada.
Todas as medições em instrumentos assíncronos são realizadas uma vez por cada
ciclo de exportação.

Os instrumentos assíncronos podem ser úteis em diversas circunstâncias, como:

- Quando a atualização de um contador não é computacionalmente barata e você não
  deseja que o processo em execução aguarde pela medição.
- Quando medições precisam acontecer em frequências não-relacionadas ao tempo de
  execução da aplicação (ou seja, não podem ser medidas com precisão ao serem
  vinculadas ao ciclo de vida de uma operação).
- Quando não há um registro de data/hora conhecidos para um valor de medição.

Em casos como estes, muitas vezes é melhor realizar a medição de um valor
cumulativo diretamente, em vez de agregar uma série de deltas no
pós-processamento (como ocorre no exemplo síncrono).

### Utilizando Contadores (Counters) {#using-counters}

Contadores (Counters) podem ser utilizados para medir valores incrementais e
não-negativos.

Por exemplo, aqui está como seria possível reportar o número de chamadas em um
servidor HTTP:

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

### Utilizando Contadores UpDown (UpDown Counters) {#using-updown-counters}

Os Contadores UpDown (UpDown Counters) podem incrementar e decrementar,
permitindo que você meça um valor cumulativo que aumenta ou diminui.

Por exemplo, aqui está como é possível reportar o número de itens de uma
coleção:

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
		metric.WithDescription("Número de itens."),
		metric.WithUnit("{item}"),
	)
	if err != nil {
		panic(err)
	}
}

func addItem() {
	// código que insere um item na coleção

	itemsCounter.Add(context.Background(), 1)
}

func removeItem() {
	// código que remove um item da coleção

	itemsCounter.Add(context.Background(), -1)
}
```

### Utilizando Medidores (Gauges) {#using-gauges}

Medidores (Gauges) são utilizados para medir quando ocorrem mudanças em valores
não-aditivos.

Por exemplo, veja como é possível relatar a velocidade atual de um ventilador de
CPU:

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
)

var fanSpeedSubscription chan int64

func init() {
	speedGauge, err := meter.Int64Gauge(
		"cpu.fan.speed",
		metric.WithDescription("Velocidade atual de um ventilador de CPU"),
		metric.WithUnit("RPM"),
	)
	if err != nil {
		panic(err)
	}

	getCPUFanSpeed := func() int64 {
		// Vamos gerar um valor aleatório para propósito de demonstração.
		// Em uma aplicação do mundo real, substitua esta implementação para obter o real valor do ventilador de CPU.
		return int64(1500 + rand.Intn(1000))
	}

	fanSpeedSubscription = make(chan int64, 1)
	go func() {
		defer close(fanSpeedSubscription)

		for idx := 0; idx < 5; idx++ {
			// Gauges síncronos são utilizados quando o ciclo de medição está
			// relacionado a uma mudança externa.
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

### Utilizando Histogramas (Histograms) {#using-histograms}

Histogramas (Histograms) são utilizados para medir a distribuição de valores ao
longo do tempo.

Por exemplo, veja como é possível reportar a distribuição de tempos de resposta
para um servidor HTTP:

```go
import (
	"net/http"
	"time"

	"go.opentelemetry.io/otel/metric"
)

func init() {
	histogram, err := meter.Float64Histogram(
		"task.duration",
		metric.WithDescription("Tempo de duração da execução da tarefa."),
		metric.WithUnit("s"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// insira algum código na chamada da API

		duration := time.Since(start)
		histogram.Record(r.Context(), duration.Seconds())
	})
}
```

### Utilizando Contadores (Assíncronos) Observáveis {#using-observable-async-counters}

Counters observáveis (Observable counters) podem ser utilizados para medir um
valor aditivo, não-negativo e monotonamente crescente.

Por exemplo, veja como é possível reportar o tempo de duração desde que a
aplicação foi iniciada:

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
		metric.WithDescription("Tempo de duração desde o início da aplicação."),
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

### Utilizando Contadores UpDown (Assíncronos) Observáveis {#using-observable-async-updown-counters}

Contadores UpDown (Counters UpDown) observáveis podem incrementar e decrementar,
permitindo que você meça um valor cumulativo aditivo, não-negativo e
não-monotonamente crescente.

Por exemplo, veja como é possível reportar algumas métricas de banco de dados:

```go
import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel/metric"
)

// registerDBMetrics registra métricas assíncronas para a base de dados fornecida.
// Certifique-se de desfazer o registro da métrica `metric.Registration` antes de encerrar a conexão com o banco de dados.
func registerDBMetrics(db *sql.DB, meter metric.Meter, poolName string) (metric.Registration, error) {
	max, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.max",
		metric.WithDescription("O número máximo de conexões abertas permitidas."),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	waitTime, err := meter.Int64ObservableUpDownCounter(
		"db.client.connections.wait_time",
		metric.WithDescription("O tempo que levou para obter uma conexão aberta da pool."),
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

### Utilizando Medidores (Assíncronos) Observáveis {#using-observable-async-gauges}

Medidores (Gauges) observáveis devem ser utilizados para medir valores
não-aditivos.

Por exemplo, veja como é possível reportar o uso de memória dos objetos _heap_
utilizados na aplicação:

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
			"Uso de memória dos objetos heap alocados.",
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

### Adicionando atributos {#adding-attributes}

É possível adicionar atributos utilizando as opções
[`WithAttributeSet`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributeSet)
ou
[`WithAttributes`](https://pkg.go.dev/go.opentelemetry.io/otel/metric#WithAttributes).

```go
import (
	"net/http"

	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

func init() {
	apiCounter, err := meter.Int64UpDownCounter(
		"api.finished.counter",
		metric.WithDescription("Número de chamadas da API finalizadas."),
		metric.WithUnit("{call}"),
	)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// insira algum código na chamada da API e defina o status HTTP de resposta

		apiCounter.Add(r.Context(), 1,
			metric.WithAttributes(semconv.HTTPResponseStatusCode(statusCode)))
	})
}
```

### Registrando Views {#registering-views}

Uma _view_ oferece aos usuários do SDK a flexibilidade de personalizar a emissão
das métricas pelo SDK. Você pode personalizar quais instrumentos de métricas
devem ser processados ou ignorados. Você também pode personalizar a agregação e
quais atributos você deseja relatar nas métricas.

Cada instrumento possui sua _view_ padrão, que mantém o nome, descrição e
atributos originais, e tem uma agregação padrão baseada no tipo do instrumento.
Quando uma _view_ registrada corresponde a um instrumento, a _view_ padrão é
substituída pela _view_ registrada. _Views_ registradas adicionais que
correspondem ao instrumento são aditivas, resultando em múltiplas métricas
exportadas para o instrumento.

É possível utilizar o método
[`NewView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#NewView) para
criar uma _view_ e registrá-la utilizando a opção
[`WithView`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#WithView).

Por exemplo, veja como é possível criar uma _view_ que renomeia o instrumento
`latency` da versão `v0.34.0` da biblioteca de instrumentação `http` para
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

Em outro exemplo, veja como é possível criar uma _view_ que faz com que o
instrumento `latency` da biblioteca de instrumentação `http` seja reportado como
um histograma exponencial:

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

O SDK filtra métricas e atributos antes de exportar as métricas. Você pode
utilizar _views_ para reduzir o uso de memória de métricas de alta cardinalidade
ou descartar atributos que possam conter dados sensíveis.

No exemplo a seguir, criamos uma _view_ que descarta o instrumento `latency` da
biblioteca de instrumentação `http`:

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

No exemplo a seguir, criamos uma _view_ que remove o atributo
`http.request.method` registrado pelo instrumento `latency` da biblioteca de
instrumentação `http`:

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

O atributo `Name` suporta correspondência de padrão curinga. O curinga `*` é
reconhecido como correspondendo a zero ou mais caracteres, e o curinga `?` é
reconhecido como correspondendo exatamente a um caractere. Por exemplo, um
padrão de `*` corresponde a todos os nomes de instrumentos.

No exemplo a seguir, mostramos como criar uma _view_ que define a unidade como
milissegundos para qualquer instrumento com um sufixo de nome `.ms`:

```go
view := metric.NewView(
  metric.Instrument{Name: "*.ms"},
  metric.Stream{Unit: "ms"},
)

meterProvider := metric.NewMeterProvider(
	metric.WithView(view),
)
```

O método `NewView` fornece uma maneira conveniente de criar _views_. Caso o
método `NewView` não forneça as funcionalidades que você precisa, é possível
criar uma _[View](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/metric#View)_
personalizada.

No exemplo a seguir, veja como criar uma _view_ que faz o uso de expressões
regulares para garantir que todos os nomes de fluxo de dados tenham um sufixo
das unidades que utiliza:

```go
re := regexp.MustCompile(`[._](ms|byte)$`)
var view metric.View = func(i metric.Instrument) (metric.Stream, bool) {
	// Em uma função de View personalizada, é necessário copiar de maneira explícita
	// o nome, descrição e unidade.
	s := metric.Stream{Name: i.Name, Description: i.Description, Unit: i.Unit}
	// Qualquer instrumento que não tenha um sufixo de unidade de medida definido, mas tenha
	// uma unidade dimensional definida, terá seu nome atualizado com um sufixo de unidade de medida.
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

Logs são distintos de métricas e rastros, pois **não há uma API de logs do
OpenTelemetry voltada para o usuário**. Em vez disso, existem ferramentas que
integram pacotes de logs populares existentes (como slog, logrus, zap, logr) aos
logs do ecossistema OpenTelemetry. Para a justificativa por trás dessa decisão
de design, consulte a [especificação de Logs](/docs/specs/otel/logs/).

Os dois _workflows_ discutidos abaixo atendem a diferentes requisitos de
aplicação.

### Direto para o Collector {#direct-to-collector}

**Estado**: [Experimental](/docs/specs/otel/document-status/)

No _workflow_ direto para o collector, os logs são emitidos diretamente da
aplicação para o Collector utilizando um protocolo de rede (por exemplo, OTLP).
Este _workflow_ é simples de configurar, pois não requer componentes adicionais
de encaminhamento de logs, permitindo que uma aplicação emita logs estruturados
e que estejam nos conformes do [modelo de dados de logs][log data model]. No
entanto, a sobrecarga necessária para que as aplicações enfileirem e exportem
logs para um local de rede pode não ser adequada para todas as aplicações.

Para utilizar este _workflow_:

- Configurar o [SDK de Logs](#logs-sdk) do OpenTelemetry para exportar registros
  de logs para o destino desejado (o [OpenTelemetry
  Collector][opentelemetry collector] ou outro).
- Utilizar um [Log Bridge](#log-bridge) apropriado.

#### SDK de Logs {#logs-sdk}

O SDK de Logs define como os logs são processados ao utilizar o _workflow_
[Direto para o Collector](#direct-to-collector). Nenhum SDK de logs é necessário
ao utilizar o _workflow_ de [encaminhamento de logs](#via-file-or-stdout).

Uma configuração típica do SDK de logs instala um Processor de logs em lote com
um Exporter OTLP.

Para habilitar [logs](/docs/concepts/signals/logs/) em sua aplicação, você
precisará ter um
[`LoggerProvider`](/docs/concepts/signals/logs/#logger-provider) inicializado,
que permitirá que você utilize um [Log Bridge](#log-bridge).

Caso um `LoggerProvider` não seja criado, a API de Logs do OpenTelemetry irá
utilizar uma implementação sem operação e dados de logs não serão gerados. Sendo
assim, é necessário que o código-fonte da aplicação seja modificado para incluir
a inicialização do SDK utilizando os seguintes pacotes:

- [`go.opentelemetry.io/otel`][]
- [`go.opentelemetry.io/otel/sdk/log`][]
- [`go.opentelemetry.io/otel/sdk/resource`][]
- [`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`][]

Certifique-se que os seguintes pacotes Go foram instalados corretamente:

```sh
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/otel/sdk/log
```

Em seguida, inicialize o `LoggerProvider`:

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

	// Crie um 'Resource'.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Crie um 'LoggerProvider'.
	// Você pode passar essa instância diretamente ao criar um Log Bridge.
	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		panic(err)
	}

	// Lidamos com a finalização corretamente, evitando vazamentos.
	defer func() {
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Println(err)
		}
	}()

	// Registre o LoggerProvider globalmente, permitindo que seja acessado via global.LoggerProvider.
	// A maioria dos Log Bridges utilizam o LoggerProvider global como padrão.
	// Caso o LoggerProvider global não esteja definido, será utilizada uma implementação sem operação
	// e dados de logs não serão gerados.
	global.SetLoggerProvider(loggerProvider)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("meu-servico"),
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

Agora que o `LoggerProvider` está configurado, é possível utilizá-lo para
configurar um [Log Bridge](#log-bridge).

#### Log Bridge {#log-bridge}

Um Log Bridge é um componente que conecta logs de um pacote existente ao
[SDK de Logs](#logs-sdk) do OpenTelemetry, utilizando a [Logs Bridge
API][logs bridge API].

Uma lista completa contendo os _log bridges_ disponíveis pode ser encontrada no
[registro do OpenTelemetry](/ecosystem/registry/?language=go&component=log-bridge).

Cada pacote do Log Bridge deve possuir uma documentação contendo as suas
instruções de instalação e configuração, e um exemplo.

### Através de arquivos ou stdout {#via-file-or-stdout}

No _workflow_ utilizado em arquivos ou _stdout_, os logs são gravados em
arquivos ou na saída padrão da aplicação. Outro componente (por exemplo,
FluentBit) é responsável por ler/acompanhar os logs, convertê-los para um
formato mais estruturado e encaminhá-los para um destino, como o Collector. Este
_workflow_ pode ser preferível em situações onde os requisitos da aplicação não
permitem a sobrecarga adicional do
[Direto para o Collector](#direct-to-collector). No entanto, é requisito que
todos os campos de log necessários sejam codificados nos logs, e que o
componente responsável pela leitura realize a conversão para o [modelo de dados
de logs][log data model]. A instalação e configuração dos componentes de
encaminhamento de logs está fora do escopo deste documento.

## Próximas Etapas (#next-steps)

Você também vai querer configurar um Exporter apropriado para
[exportar seus dados de telemetria](/docs/languages/go/exporters) para um ou
mais backends de telemetria.

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

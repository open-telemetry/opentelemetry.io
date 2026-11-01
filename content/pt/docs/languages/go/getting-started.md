---
title: Primeiros passos com exemplo
description: Obtenha telemetria para sua aplicação em menos de 5 minutos!
weight: 10
default_lang_commit: ddf2415df2c47195339aaaa6d4cfb5c12a00b759
# prettier-ignore
cSpell:ignore: autoexport chan fatalln funcs intn itoa otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="content-modules/opentelemetry-go-contrib/examples/dice/instrumented"?>

Esta página mostrará como começar a utilizar o OpenTelemetry em Go.

Você aprenderá como instrumentar manualmente uma aplicação simples, de modo que
os [rastros][traces], [métricas][metrics] e [logs][logs] sejam emitidos no
console.

> [!NOTE]
>
> Os sinais de logs ainda são experimentais. Alterações que quebrem a
> compatibilidade podem ser introduzidas em versões futuras.

## Pré-requisitos {#prerequisites}

Certifique-se de que você tenha a seguinte instalação localmente:

- [Go](https://go.dev/) versão 1.23 ou superior

## Aplicação de exemplo {#example-application}

O seguinte exemplo usa uma aplicação [`net/http`](https://pkg.go.dev/net/http)
básica. Caso você não esteja usando `net/http`, não há problema — você pode
utilizar OpenTelemetry Go com outros frameworks da web, como Gin e Echo. Para
uma lista completa de bibliotecas para frameworks suportados, consulte o
[registro](/ecosystem/registry/?component=instrumentation&language=go).

Para exemplos mais elaborados, consulte
[exemplos](/docs/languages/go/examples/).

### Configuração {#setup}

Para começar, configure um `go.mod` em um novo diretório:

```shell
go mod init dice
```

### Criar e iniciar um servidor HTTP {#create-and-launch-an-http-server}

Na mesma pasta, crie um arquivo chamado `main.go` e adicione o seguinte código
ao arquivo:

```go
package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() (err error) {
	// Lidamos com o SIGINT (CTRL+C) de maneira segura.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Inicializamos o servidor HTTP.
	srv := &http.Server{
		Addr:         ":8080",
		BaseContext:  func(net.Listener) context.Context { return ctx },
		ReadTimeout:  time.Second,
		WriteTimeout: 10 * time.Second,
		Handler:      newHTTPHandler(),
	}
	srvErr := make(chan error, 1)
	go func() {
		log.Println("Running HTTP server...")
		srvErr <- srv.ListenAndServe()
	}()

	// Aguardamos por uma interrupção.
	select {
	case err = <-srvErr:
		// Erro ao inicializar o servidor HTTP.
		return err
	case <-ctx.Done():
		// Aguardamos o primeiro CTRL+C.
		// Para de receber sinais o mais rápido possível.
		stop()
	}

	// Quando o método Shutdown é chamado, ListenAndServe retornará imediatamente ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Registra os handlers.
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

Crie outro arquivo chamado `rolldice.go` e adicione o seguinte código ao
arquivo:

```go
package main

import (
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"
)

func rolldice(w http.ResponseWriter, r *http.Request) {
	roll := 1 + rand.Intn(6)

	var msg string
	if player := r.PathValue("player"); player != "" {
		msg = player + " is rolling the dice"
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	log.Printf("%s, result: %d", msg, roll)

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v", err)
	}
}
```

Compile e execute a aplicação utilizando o seguinte comando:

```shell
go run .
```

Abra <http://localhost:8080/rolldice> no seu navegador para garantir que está
funcionando.

## Adicionar instrumentação do OpenTelemetry {#add-opentelemetry-instrumentation}

Agora, vamos mostrar como adicionar instrumentação do OpenTelemetry à aplicação
de exemplo. Se você estiver usando sua própria aplicação, também pode acompanhar
os passos a seguir. Apenas note que seu código pode ser um pouco diferente do
exemplo.

### Inicializar o SDK OpenTelemetry {#initialize-the-opentelemetry-sdk}

Primeiro, vamos inicializar o SDK OpenTelemetry. Isso é _obrigatório_ para
qualquer aplicação que exporte telemetria.

Crie um arquivo `otel.go` com o código de inicialização do SDK OpenTelemetry:

<!-- prettier-ignore-start -->
<!-- code-excerpt "otel.go" from="package main"?-->
```go
package main

import (
	"context"
	"errors"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutlog"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/trace"
)

// setupOTelSDK inicializa o pipeline do OpenTelemetry.
// Caso não retorne um erro, certifique-se de executar o método shutdown para realizar a finalização adequada.
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown chama as funções de finalização registradas via shutdownFuncs.
	// Os erros das chamadas são concatenados.
	// Cada função de finalização registrada será invocada uma única vez.
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErr chama a função shutdown para finalizar corretamente e garante que todos os erros serão retornados.
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// Inicializa o Propagator.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// Inicializa o Trace Provider.
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Inicializa o Meter Provider.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// Inicializa o Logger Provider.
	loggerProvider, err := newLoggerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
	global.SetLoggerProvider(loggerProvider)

	return shutdown, err
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

func newTracerProvider() (*trace.TracerProvider, error) {
	traceExporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	tracerProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			// O valor padrão é 5s. Definimos em 1s para propósito de demonstração.
			trace.WithBatchTimeout(time.Second)),
	)
	return tracerProvider, nil
}

func newMeterProvider() (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New(stdoutmetric.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// O valor padrão é 1m. Definimos em 3s para propósito de demonstração.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}

func newLoggerProvider() (*log.LoggerProvider, error) {
	logExporter, err := stdoutlog.New(stdoutlog.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	loggerProvider := log.NewLoggerProvider(
		log.WithProcessor(log.NewBatchProcessor(logExporter)),
	)
	return loggerProvider, nil
}
```
<!-- prettier-ignore-end -->

> [!TIP]
>
> O exemplo anterior utiliza Exporters de console (stdout) para fins de
> demonstração. É possível utilizar o pacote
> [`autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport)
> para configurar Exporters por meio de variáveis de ambiente como
> `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER` e
> `OTEL_EXPORTER_OTLP_ENDPOINT`. Consulte
> [Exporters](/docs/languages/go/exporters/) para mais detalhes.

Caso você esteja utilizando apenas rastros ou métricas, você pode omitir o
código de inicialização do TracerProvider ou MeterProvider correspondente.

### Instrumentação do servidor HTTP {#instrument-the-http-server}

Agora que temos o SDK do OpenTelemetry inicializado, podemos instrumentar o
servidor HTTP.

Modifique o arquivo `main.go` para incluir o código que configura o SDK do
OpenTelemetry e instrumenta o servidor HTTP utilizando a biblioteca de
instrumentação `otelhttp`:

<!-- prettier-ignore-start -->
<!--?code-excerpt "main.go" from="package main"?-->
```go
package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() error {
	// Lidamos com o SIGINT (CTRL+C) de maneira segura.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Configura o OpenTelemetry.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// Lidamos com a finalização corretamente, evitando leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Inicializamos o servidor HTTP.
	srv := &http.Server{
		Addr:         ":8080",
		BaseContext:  func(net.Listener) context.Context { return ctx },
		ReadTimeout:  time.Second,
		WriteTimeout: 10 * time.Second,
		Handler:      newHTTPHandler(),
	}
	srvErr := make(chan error, 1)
	go func() {
		srvErr <- srv.ListenAndServe()
	}()

	// Aguardamos por uma interrupção.
	select {
	case err = <-srvErr:
		// Erro ao inicializar o servidor HTTP.
		return err
	case <-ctx.Done():
		// Aguardamos o primeiro CTRL+C.
		// Para de receber sinais o mais rápido possível.
		stop()
	}

	// Quando o método Shutdown é chamado, ListenAndServe retornará imediatamente ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Registra os handlers.
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// Adiciona a instrumentação HTTP para todo o servidor.
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### Adicionar instrumentação personalizada {#add-custom-instrumentation}

As bibliotecas de instrumentação capturam telemetria nas bordas de seus
sistemas, como por exemplo requisições HTTP de entrada e saída, porém não
capturam o que está acontecendo dentro da sua aplicação. Para isso, você
precisará implementar uma [instrumentação manual](../instrumentation/)
personalizada.

Modifique o arquivo `rolldice.go` para incluir instrumentação personalizada
usando a API do OpenTelemetry:

<!-- prettier-ignore-start -->
<!--?code-excerpt "rolldice.go" from="package main"?-->
```go
package main

import (
	"io"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"

	"go.opentelemetry.io/contrib/bridges/otelslog"
)

const name = "go.opentelemetry.io/contrib/examples/dice"

var (
	tracer  = otel.Tracer(name)
	meter   = otel.Meter(name)
	logger  = otelslog.NewLogger(name)
	rollCnt metric.Int64Counter
)

func init() {
	var err error
	rollCnt, err = meter.Int64Counter("dice.rolls",
		metric.WithDescription("The number of rolls by roll value"),
		metric.WithUnit("{roll}"))
	if err != nil {
		panic(err)
	}
}

func rolldice(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "roll")
	defer span.End()

	roll := 1 + rand.Intn(6)

	var msg string
	if player := r.PathValue("player"); player != "" {
		msg = player + " is rolling the dice"
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	logger.InfoContext(ctx, msg, "result", roll)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		logger.ErrorContext(ctx, "Write failed", "error", err)
	}
}
```
<!-- prettier-ignore-end -->

Observe que caso você esteja utilizando apenas rastros ou métricas, poderá
omitir o código de instrumentação correspondente ao componente que não está
sendo utilizado.

### Executando a aplicação {#run-the-application}

Compile e execute a aplicação utilizando o seguinte comando:

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

Abra <http://localhost:8080/rolldice/Alice> no seu navegador. Ao enviar uma
solicitação para o servidor, você verá dois trechos no rastro emitido no
console. O trecho gerado pela biblioteca de instrumentação rastreia a duração da
solicitação para a rota `/rolldice/{player}`. O trecho chamado `roll` é criado
manualmente e é um filho do trecho mencionado anteriormente.

<details>
<summary>Visualizar exemplo de saída</summary>

```json
{
	"Name": "roll",
	"SpanContext": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "f641bd25400a1b70",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "a10f1d2ca2f685c9",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 1,
	"StartTime": "2026-01-28T09:58:44.298985982+01:00",
	"EndTime": "2026-01-28T09:58:44.299067482+01:00",
	"Attributes": [
		{
			"Key": "roll.value",
			"Value": {
				"Type": "INT64",
				"Value": 1
			}
		}
	],
	"Events": null,
	"Links": null,
	"Status": {
		"Code": "Unset",
		"Description": ""
	},
	"DroppedAttributes": 0,
	"DroppedEvents": 0,
	"DroppedLinks": 0,
	"ChildSpanCount": 0,
	"Resource": [
		{
			"Key": "service.name",
			"Value": {
				"Type": "STRING",
				"Value": "dice"
			}
		},
		{
			"Key": "service.version",
			"Value": {
				"Type": "STRING",
				"Value": "0.1.0"
			}
		},
		{
			"Key": "telemetry.sdk.language",
			"Value": {
				"Type": "STRING",
				"Value": "go"
			}
		},
		{
			"Key": "telemetry.sdk.name",
			"Value": {
				"Type": "STRING",
				"Value": "opentelemetry"
			}
		},
		{
			"Key": "telemetry.sdk.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.39.0"
			}
		}
	],
	"InstrumentationScope": {
		"Name": "go.opentelemetry.io/contrib/examples/dice",
		"Version": "",
		"SchemaURL": "",
		"Attributes": null
	},
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/examples/dice",
		"Version": "",
		"SchemaURL": "",
		"Attributes": null
	}
}
{
	"Name": "/",
	"SpanContext": {
		"TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
		"SpanID": "a10f1d2ca2f685c9",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "00000000000000000000000000000000",
		"SpanID": "0000000000000000",
		"TraceFlags": "00",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 2,
	"StartTime": "2026-01-28T09:58:44.298951202+01:00",
	"EndTime": "2026-01-28T09:58:44.299109293+01:00",
	"Attributes": [
		{
			"Key": "server.address",
			"Value": {
				"Type": "STRING",
				"Value": "localhost"
			}
		},
		{
			"Key": "http.request.method",
			"Value": {
				"Type": "STRING",
				"Value": "GET"
			}
		},
		{
			"Key": "url.scheme",
			"Value": {
				"Type": "STRING",
				"Value": "http"
			}
		},
		{
			"Key": "server.port",
			"Value": {
				"Type": "INT64",
				"Value": 8080
			}
		},
		{
			"Key": "network.peer.address",
			"Value": {
				"Type": "STRING",
				"Value": "127.0.0.1"
			}
		},
		{
			"Key": "network.peer.port",
			"Value": {
				"Type": "INT64",
				"Value": 43804
			}
		},
		{
			"Key": "user_agent.original",
			"Value": {
				"Type": "STRING",
				"Value": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0"
			}
		},
		{
			"Key": "client.address",
			"Value": {
				"Type": "STRING",
				"Value": "127.0.0.1"
			}
		},
		{
			"Key": "url.path",
			"Value": {
				"Type": "STRING",
				"Value": "/rolldice/Alice"
			}
		},
		{
			"Key": "network.protocol.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.1"
			}
		},
		{
			"Key": "http.response.body.size",
			"Value": {
				"Type": "INT64",
				"Value": 2
			}
		},
		{
			"Key": "http.response.status_code",
			"Value": {
				"Type": "INT64",
				"Value": 200
			}
		}
	],
	"Events": null,
	"Links": null,
	"Status": {
		"Code": "Unset",
		"Description": ""
	},
	"DroppedAttributes": 0,
	"DroppedEvents": 0,
	"DroppedLinks": 0,
	"ChildSpanCount": 1,
	"Resource": [
		{
			"Key": "service.name",
			"Value": {
				"Type": "STRING",
				"Value": "dice"
			}
		},
		{
			"Key": "service.version",
			"Value": {
				"Type": "STRING",
				"Value": "0.1.0"
			}
		},
		{
			"Key": "telemetry.sdk.language",
			"Value": {
				"Type": "STRING",
				"Value": "go"
			}
		},
		{
			"Key": "telemetry.sdk.name",
			"Value": {
				"Type": "STRING",
				"Value": "opentelemetry"
			}
		},
		{
			"Key": "telemetry.sdk.version",
			"Value": {
				"Type": "STRING",
				"Value": "1.39.0"
			}
		}
	],
	"InstrumentationScope": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.64.0",
		"SchemaURL": "",
		"Attributes": null
	},
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.64.0",
		"SchemaURL": "",
		"Attributes": null
	}
}
```

</details>

Junto com o rastro, mensagens de log são emitidas no console.

<details>
<summary>Visualizar exemplo de saída</summary>

```json
{
  "Timestamp": "2026-01-28T09:58:44.29900397+01:00",
  "ObservedTimestamp": "2026-01-28T09:58:44.299031783+01:00",
  "Severity": 9,
  "SeverityText": "INFO",
  "Body": {
    "Type": "String",
    "Value": "Alice is rolling the dice"
  },
  "Attributes": [
    {
      "Key": "result",
      "Value": {
        "Type": "Int64",
        "Value": 1
      }
    }
  ],
  "TraceID": "f00f8045a6c78b3aa5ecaca9f3b971b4",
  "SpanID": "f641bd25400a1b70",
  "TraceFlags": "01",
  "Resource": [
    {
      "Key": "service.name",
      "Value": {
        "Type": "STRING",
        "Value": "dice"
      }
    },
    {
      "Key": "service.version",
      "Value": {
        "Type": "STRING",
        "Value": "0.1.0"
      }
    },
    {
      "Key": "telemetry.sdk.language",
      "Value": {
        "Type": "STRING",
        "Value": "go"
      }
    },
    {
      "Key": "telemetry.sdk.name",
      "Value": {
        "Type": "STRING",
        "Value": "opentelemetry"
      }
    },
    {
      "Key": "telemetry.sdk.version",
      "Value": {
        "Type": "STRING",
        "Value": "1.39.0"
      }
    }
  ],
  "Scope": {
    "Name": "go.opentelemetry.io/contrib/examples/dice",
    "Version": "",
    "SchemaURL": "",
    "Attributes": {}
  },
  "DroppedAttributes": 0
}
```

</details>

Atualize a página <http://localhost:8080/rolldice/Alice> algumas vezes, e então
você pode esperar um pouco ou encerrar a execução da aplicação e verá as
métricas como na saída do console. Você verá a métrica `dice.rolls` emitida no
console, com contagens distintas para cada valor obtido, bem como as métricas
HTTP geradas pela biblioteca de instrumentação.

<details>
<summary>Visualizar exemplo de saída</summary>

```json
{
  "Resource": [
    {
      "Key": "service.name",
      "Value": {
        "Type": "STRING",
        "Value": "dice"
      }
    },
    {
      "Key": "service.version",
      "Value": {
        "Type": "STRING",
        "Value": "0.1.0"
      }
    },
    {
      "Key": "telemetry.sdk.language",
      "Value": {
        "Type": "STRING",
        "Value": "go"
      }
    },
    {
      "Key": "telemetry.sdk.name",
      "Value": {
        "Type": "STRING",
        "Value": "opentelemetry"
      }
    },
    {
      "Key": "telemetry.sdk.version",
      "Value": {
        "Type": "STRING",
        "Value": "1.39.0"
      }
    }
  ],
  "ScopeMetrics": [
    {
      "Scope": {
        "Name": "go.opentelemetry.io/contrib/examples/dice",
        "Version": "",
        "SchemaURL": "",
        "Attributes": null
      },
      "Metrics": [
        {
          "Name": "dice.rolls",
          "Description": "The number of rolls by roll value",
          "Unit": "{roll}",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 2
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 2,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310873844+01:00",
                    "Value": 1,
                    "SpanID": "MFfLVpcp2E8=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 3
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 1,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:48.446722639+01:00",
                    "Value": 1,
                    "SpanID": "Xa6wKaCre6k=",
                    "TraceID": "VncSsITnUTtWpMAFGRoLng=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 1
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 4,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:56.340332341+01:00",
                    "Value": 1,
                    "SpanID": "RAsXIMJQIcg=",
                    "TraceID": "NbZh738k1TlZ/I32RuLS/A=="
                  }
                ]
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 5
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297218201+01:00",
                "Time": "2026-01-28T09:59:04.826103626+01:00",
                "Value": 1,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:55.131367409+01:00",
                    "Value": 1,
                    "SpanID": "eVC0Kj4/vzw=",
                    "TraceID": "NVuservV50eLN7sNu9Sm4A=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        }
      ]
    },
    {
      "Scope": {
        "Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
        "Version": "0.64.0",
        "SchemaURL": "",
        "Attributes": null
      },
      "Metrics": [
        {
          "Name": "http.server.request.body.size",
          "Description": "Size of HTTP server request bodies.",
          "Unit": "By",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297829232+01:00",
                "Time": "2026-01-28T09:59:04.82612558+01:00",
                "Count": 8,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": 0,
                "Max": 0,
                "Sum": 0,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310903274+01:00",
                    "Value": 0,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        },
        {
          "Name": "http.server.response.body.size",
          "Description": "Size of HTTP server response bodies.",
          "Unit": "By",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297836516+01:00",
                "Time": "2026-01-28T09:59:04.826130841+01:00",
                "Count": 8,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": 2,
                "Max": 2,
                "Sum": 16,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310905174+01:00",
                    "Value": 2,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        },
        {
          "Name": "http.server.request.duration",
          "Description": "Duration of HTTP server requests.",
          "Unit": "s",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.request.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.response.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "network.protocol.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "network.protocol.version",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "server.address",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "server.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  },
                  {
                    "Key": "url.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  }
                ],
                "StartTime": "2026-01-28T09:58:36.297850485+01:00",
                "Time": "2026-01-28T09:59:04.826135353+01:00",
                "Count": 8,
                "Bounds": [
                  0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5,
                  5, 7.5, 10
                ],
                "BucketCounts": [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "Min": 0.000067593,
                "Max": 0.000635093,
                "Sum": 0.001617854,
                "Exemplars": [
                  {
                    "FilteredAttributes": null,
                    "Time": "2026-01-28T09:58:58.310908469+01:00",
                    "Value": 0.000197799,
                    "SpanID": "YQY4fyjDhiQ=",
                    "TraceID": "KGizZKX5cz9DqgG95WoBvQ=="
                  }
                ]
              }
            ],
            "Temporality": "CumulativeTemporality"
          }
        }
      ]
    }
  ]
}
```

</details>

## Próximos passos {#next-steps}

Para mais informações sobre como instrumentar seu código, consulte a
documentação de [instrumentação manual](/docs/languages/go/instrumentation/).

Você também vai querer configurar um Exporter apropriado para
[exportar os seus dados de telemetria](/docs/languages/go/exporters/) para um ou
mais backends de telemetria.

Caso queira explorar um exemplo mais complexo, dê uma olhada na
[demonstração do OpenTelemetry](/docs/demo/), que inclui o
[Serviço de Checkout](/docs/demo/services/checkout/), o
[Serviço de Catálogo de Produtos](/docs/demo/services/product-catalog/), e o
[Serviço de Contabilidade](/docs/demo/services/accounting/), baseados em Go

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/

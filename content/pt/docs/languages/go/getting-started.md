---
title: Primeiros Passos
weight: 10
default_lang_commit: a025c25aaf1aef653caa34e49e8714472cbeddbd
# prettier-ignore
cSpell:ignore: chan fatalln funcs intn itoa khtml otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice"?>

Esta página mostrará como começar a utilizar o OpenTelemetry em Go.

Você aprenderá como instrumentar manualmente uma aplicação simples, de modo que
os [rastros][traces], [métricas][metrics] e [logs][logs] sejam emitidos no
console.

{{% alert title="Note" %}}

Os sinais de logs ainda são experimentais. Alterações que quebrem a
compatibilidade podem ser introduzidas em versões futuras.

{{% /alert %}}

## Pré-requisitos {#prerequisites}

Certifique-se de que você tenha a seguinte instalação localmente:

- [Go](https://go.dev/) versão 1.22 ou superior

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
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/rolldice", rolldice)

	log.Fatal(http.ListenAndServe(":8080", nil))
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

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
	}
}
```

Compile e execute a aplicação utilizando o seguinte comando:

```shell
go run .
```

Abra <http://localhost:8080/rolldice> no seu navegador para garantir que está
funcionando.

## Adicionar instrumentação do OpenTelemetry {#add-open-telemetry-instrumentation}

Agora, vamos mostrar como adicionar instrumentação do OpenTelemetry à aplicação
de exemplo. Se você estiver usando sua própria aplicação, também pode acompanhar
os passos a seguir. Apenas note que seu código pode ser um pouco diferente do
exemplo.

### Adicionar Dependências {#add-dependencies}

Instale os seguintes pacotes:

```shell
go get "go.opentelemetry.io/otel" \
  "go.opentelemetry.io/otel/exporters/stdout/stdoutmetric" \
  "go.opentelemetry.io/otel/exporters/stdout/stdouttrace" \
  "go.opentelemetry.io/otel/exporters/stdout/stdoutlog" \
  "go.opentelemetry.io/otel/sdk/log" \
  "go.opentelemetry.io/otel/log/global" \
  "go.opentelemetry.io/otel/propagation" \
  "go.opentelemetry.io/otel/sdk/metric" \
  "go.opentelemetry.io/otel/sdk/resource" \
  "go.opentelemetry.io/otel/sdk/trace" \
  "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"\
  "go.opentelemetry.io/contrib/bridges/otelslog"
```

Este comando instala os componentes do SDK OpenTelemetry e a instrumentação do
`net/http`.

Se você estiver instrumentando uma biblioteca diferente para solicitações de
rede, precisará instalar a biblioteca de instrumentação apropriada. Consulte a
seção [bibliotecas](/docs/languages/go/libraries/) para mais informações.

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
func setupOTelSDK(ctx context.Context) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	// shutdown chama as funções de finalização registradas via shutdownFuncs.
	// Os erros das chamadas são concatenados.
	// Cada função de finalização registrada será invocada uma única vez.
	shutdown = func(ctx context.Context) error {
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
	tracerProvider, err := newTraceProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Inicializa o Meter Provider.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// Inicializa o Logger Provider.
	loggerProvider, err := newLoggerProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
	global.SetLoggerProvider(loggerProvider)

	return
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

func newTraceProvider() (*trace.TracerProvider, error) {
	traceExporter, err := stdouttrace.New(
		stdouttrace.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			// O valor padrão é 5s. Definimos em 1s para propósito de demonstração.
			trace.WithBatchTimeout(time.Second)),
	)
	return traceProvider, nil
}

func newMeterProvider() (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
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
	logExporter, err := stdoutlog.New()
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

Caso você esteja utilizando apenas rastros ou métricas, você pode omitir o
código de inicialização do TracerProvider ou MeterProvider correspondente.

### Instrumentação do servidor HTTP {#instrument-the-http-server}

Agora que temos o SDK do OpenTelemetry inicializado, podemos instrumentar o
servidor HTTP.

Modifique o arquivo `main.go` para incluir o código que configura o SDK do
OpenTelemetry e instrumenta o servidor HTTP utilizando a biblioteca de
instrumentação `otelhttp`:

<!-- prettier-ignore-start -->
<--?code-excerpt "main.go" from="package main"?-->
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

func run() (err error) {
	// Lidamos com o SIGINT (CTRL+C) de maneira segura.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Configura o OpenTelemetry.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return
	}
	// Lidamos com a finalização corretamente, evitando leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Inicializamos o servidor HTTP.
	srv := &http.Server{
		Addr:         ":8080",
		BaseContext:  func(_ net.Listener) context.Context { return ctx },
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
		return
	case <-ctx.Done():
		// Aguardamos o primeiro CTRL+C.
		// Para de receber sinais o mais rápido possível.
		stop()
	}

	// Quando o método Shutdown é chamado, ListenAndServe retornará imediatamente ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// handleFunc é uma substituição para mux.HandleFunc
	// enriquecendo ainda mais a instrumentação HTTP utilizando padrões como http.route.
	handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
		// Configura o "http.route" para a instrumentação HTTP.
		handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
		mux.Handle(pattern, handler)
	}

	// Registra os handlers.
	handleFunc("/rolldice/", rolldice)
	handleFunc("/rolldice/{player}", rolldice)

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
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

const name = "go.opentelemetry.io/otel/example/dice"

var (
	tracer = otel.Tracer(name)
	meter  = otel.Meter(name)
	logger = otelslog.NewLogger(name)
	rollCnt metric.Int64Counter
)

func init() {
	var err error
	rollCnt, err = meter.Int64Counter("dice.rolls",
		metric.WithDescription("O número de lançamentos por valor obtido"),
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
		msg = fmt.Sprintf("%s está lançando o dado", player)
	} else {
		msg = "Jogador anônimo está lançando o dado"
	}
	logger.InfoContext(ctx, msg, "result", roll)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Falha na escrita: %v\n", err)
	}
}
```
<!-- prettier-ignore-end -->

Observe que caso você esteja utilizando apenas rastros ou métricas, poderá
omitir o código de instrumentação correspondente ao componente que não está
sendo utilizado.

### Executando a Aplicação {#run-the-application}

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
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "8b6b408b6c1a35e5",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "612be4bbdf450de6",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 1,
	"StartTime": "2023-09-25T12:42:06.177119576+02:00",
	"EndTime": "2023-09-25T12:42:06.177136776+02:00",
	"Attributes": [
		{
			"Key": "roll.value",
			"Value": {
				"Type": "INT64",
				"Value": 6
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
				"Value": "1.19.0-rc.1"
			}
		}
	],
	"InstrumentationLibrary": {
		"Name": "rolldice",
		"Version": "",
		"SchemaURL": ""
	}
}
{
	"Name": "/",
	"SpanContext": {
		"TraceID": "829fb7ceb787403c96eac3caf285c965",
		"SpanID": "612be4bbdf450de6",
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
	"StartTime": "2023-09-25T12:42:06.177071077+02:00",
	"EndTime": "2023-09-25T12:42:06.177158076+02:00",
	"Attributes": [
		{
			"Key": "http.method",
			"Value": {
				"Type": "STRING",
				"Value": "GET"
			}
		},
		{
			"Key": "http.scheme",
			"Value": {
				"Type": "STRING",
				"Value": "http"
			}
		},
		{
			"Key": "http.flavor",
			"Value": {
				"Type": "STRING",
				"Value": "1.1"
			}
		},
		{
			"Key": "net.host.name",
			"Value": {
				"Type": "STRING",
				"Value": "localhost"
			}
		},
		{
			"Key": "net.host.port",
			"Value": {
				"Type": "INT64",
				"Value": 8080
			}
		},
		{
			"Key": "net.sock.peer.addr",
			"Value": {
				"Type": "STRING",
				"Value": "::1"
			}
		},
		{
			"Key": "net.sock.peer.port",
			"Value": {
				"Type": "INT64",
				"Value": 49046
			}
		},
		{
			"Key": "http.user_agent",
			"Value": {
				"Type": "STRING",
				"Value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
			}
		},
		{
			"Key": "http.route",
			"Value": {
				"Type": "STRING",
				"Value": "/rolldice/Alice"
			}
		},
		{
			"Key": "http.wrote_bytes",
			"Value": {
				"Type": "INT64",
				"Value": 2
			}
		},
		{
			"Key": "http.status_code",
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
				"Value": "1.19.0-rc.1"
			}
		}
	],
	"InstrumentationLibrary": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.44.0",
		"SchemaURL": ""
	}
}
```

</details>

Junto com o rastro, mensagens de log são emitidas no console.

<details>
<summary>Visualizar exemplo de saída</summary>

```json
{
  "Timestamp": "2023-09-25T12:42:05.177136776+02:00",
  "ObservedTimestamp": "2023-09-25T12:42:06.809396011+02:00",
  "Severity": 9,
  "SeverityText": "",
  "Body": {
    "Type": "String",
    "Value": "Alice está lançando o dado"
  },
  "Attributes": [
    {
      "Key": "result",
      "Value": {
        "Type": "Int64",
        "Value": 6
      }
    }
  ],
  "TraceID": "829fb7ceb787403c96eac3caf285c965",
  "SpanID": "8b6b408b6c1a35e5",
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
        "Value": "1.19.0-rc.1"
      }
    }
  ],
  "Scope": {
    "Name": "rolldice",
    "Version": "",
    "SchemaURL": ""
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
        "Value": "1.19.0-rc.1"
      }
    }
  ],
  "ScopeMetrics": [
    {
      "Scope": {
        "Name": "rolldice",
        "Version": "",
        "SchemaURL": ""
      },
      "Metrics": [
        {
          "Name": "dice.rolls",
          "Description": "Número de lançamentos por valor obtido",
          "Unit": "{roll}",
          "Data": {
            "DataPoints": [
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 4
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 3
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 4
              },
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
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 2
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 6
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 5
              },
              {
                "Attributes": [
                  {
                    "Key": "roll.value",
                    "Value": {
                      "Type": "INT64",
                      "Value": 4
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279204638+02:00",
                "Time": "2023-09-25T12:42:15.482694258+02:00",
                "Value": 9
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
        "Version": "0.44.0",
        "SchemaURL": ""
      },
      "Metrics": [
        {
          "Name": "http.server.request_content_length",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279212238+02:00",
                "Time": "2023-09-25T12:42:15.482695758+02:00",
                "Value": 0
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        },
        {
          "Name": "http.server.response_content_length",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279214438+02:00",
                "Time": "2023-09-25T12:42:15.482696158+02:00",
                "Value": 54
              }
            ],
            "Temporality": "CumulativeTemporality",
            "IsMonotonic": true
          }
        },
        {
          "Name": "http.server.duration",
          "Description": "",
          "Unit": "",
          "Data": {
            "DataPoints": [
              {
                "Attributes": [
                  {
                    "Key": "http.flavor",
                    "Value": {
                      "Type": "STRING",
                      "Value": "1.1"
                    }
                  },
                  {
                    "Key": "http.method",
                    "Value": {
                      "Type": "STRING",
                      "Value": "GET"
                    }
                  },
                  {
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/Alice"
                    }
                  },
                  {
                    "Key": "http.scheme",
                    "Value": {
                      "Type": "STRING",
                      "Value": "http"
                    }
                  },
                  {
                    "Key": "http.status_code",
                    "Value": {
                      "Type": "INT64",
                      "Value": 200
                    }
                  },
                  {
                    "Key": "net.host.name",
                    "Value": {
                      "Type": "STRING",
                      "Value": "localhost"
                    }
                  },
                  {
                    "Key": "net.host.port",
                    "Value": {
                      "Type": "INT64",
                      "Value": 8080
                    }
                  }
                ],
                "StartTime": "2023-09-25T12:42:04.279219438+02:00",
                "Time": "2023-09-25T12:42:15.482697158+02:00",
                "Count": 27,
                "Bounds": [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000
                ],
                "BucketCounts": [
                  0, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "Min": {},
                "Max": {},
                "Sum": 2.1752759999999993
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

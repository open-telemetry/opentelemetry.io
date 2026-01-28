---
title: Getting Started
weight: 10
# prettier-ignore
cSpell:ignore: chan fatalln funcs intn itoa khtml otelhttp rolldice stdouttrace strconv
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/go/dice"?>

This page will show you how to get started with OpenTelemetry in Go.

You will learn how you can instrument a simple application manually, in such a
way that [traces][], [metrics][], and [logs][] are emitted to the console.

> [!NOTE]
>
> The logs signal is still experimental. Breaking changes may be introduced in
> future versions.

## Prerequisites

Ensure that you have the following installed locally:

- [Go](https://go.dev/) 1.23 or greater

## Example application

The following example uses a basic [`net/http`](https://pkg.go.dev/net/http)
application. If you are not using `net/http`, that's OK — you can use
OpenTelemetry Go with other web frameworks as well, such as Gin and Echo. For a
complete list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=go).

For more elaborate examples, see [examples](/docs/languages/go/examples/).

### Setup

To begin, set up a `go.mod` in a new directory:

```shell
go mod init dice
```

### Create and launch an HTTP server

In that same folder, create a file called `main.go` and add the following code
to the file:

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
	// Handle SIGINT (CTRL+C) gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Start HTTP server.
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

	// Wait for interruption.
	select {
	case err = <-srvErr:
		// Error when starting HTTP server.
		return err
	case <-ctx.Done():
		// Wait for first CTRL+C.
		// Stop receiving signal notifications as soon as possible.
		stop()
	}

	// When Shutdown is called, ListenAndServe immediately returns ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Register handlers.
	mux.HandleFunc("/rolldice/", rolldice)
	mux.HandleFunc("/rolldice/{player}", rolldice)

	return mux
}
```

Create another file called `rolldice.go` and add the following code to the file:

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

Build and run the application with the following command:

```shell
go run .
```

Open <http://localhost:8080/rolldice> in your web browser to ensure it is
working.

## Add OpenTelemetry Instrumentation

Now we'll show how to add OpenTelemetry instrumentation to the sample app. If
you are using your own application, you can follow along, just note that your
code may be slightly different.

### Initialize the OpenTelemetry SDK

First, we'll initialize the OpenTelemetry SDK. This is _required_ for any
application that exports telemetry.

Create `otel.go` with OpenTelemetry SDK bootstrapping code:

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

// setupOTelSDK bootstraps the OpenTelemetry pipeline.
// If it does not return an error, make sure to call shutdown for proper cleanup.
func setupOTelSDK(ctx context.Context) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	// shutdown calls cleanup functions registered via shutdownFuncs.
	// The errors from the calls are joined.
	// Each registered cleanup will be invoked once.
	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// handleErr calls shutdown for cleanup and makes sure that all errors are returned.
	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	// Set up propagator.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// Set up trace provider.
	tracerProvider, err := newTracerProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Set up meter provider.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// Set up logger provider.
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
			// Default is 5s. Set to 1s for demonstrative purposes.
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
			// Default is 1m. Set to 3s for demonstrative purposes.
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

If you're only using tracing or metrics, you can omit the corresponding
TracerProvider or MeterProvider initialization code.

### Instrument the HTTP server

Now that we have the OpenTelemetry SDK initialized, we can instrument the HTTP
server.

Modify `main.go` to include code that sets up OpenTelemetry SDK and instruments
the HTTP server using the `otelhttp` instrumentation library:

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
	// Handle SIGINT (CTRL+C) gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return err
	}
	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Start HTTP server.
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

	// Wait for interruption.
	select {
	case err = <-srvErr:
		// Error when starting HTTP server.
		return err
	case <-ctx.Done():
		// Wait for first CTRL+C.
		// Stop receiving signal notifications as soon as possible.
		stop()
	}

	// When Shutdown is called, ListenAndServe immediately returns ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return err
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// Register handlers.
	mux.Handle("/rolldice", http.HandlerFunc(rolldice))
	mux.Handle("/rolldice/{player}", http.HandlerFunc(rolldice))

	// Add HTTP instrumentation for the whole server.
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```
<!-- prettier-ignore-end -->

### Add Custom Instrumentation

Instrumentation libraries capture telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but they don't capture what's going on in
your application. For that you'll need to write some custom
[manual instrumentation](../instrumentation/).

Modify `rolldice.go` to include custom instrumentation using OpenTelemetry API:

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

Note that if you're only using tracing or metrics, you can omit the
corresponding code that instruments the other telemetry type.

### Run the Application

Build and run the application with the following command:

```sh
go mod tidy
export OTEL_RESOURCE_ATTRIBUTES="service.name=dice,service.version=0.1.0"
go run .
```

Open <http://localhost:8080/rolldice/Alice> in your web browser. When you send a
request to the server, you'll see two spans in the trace emitted to the console.
The span generated by the instrumentation library tracks the lifetime of a
request to the `/rolldice/{player}` route. The span called `roll` is created
manually and it is a child of the previously mentioned span.

<details>
<summary>View example output</summary>

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

Along with the trace, log messages are emitted to the console.

<details>
<summary>View example output</summary>

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

Refresh the <http://localhost:8080/rolldice/Alice> page a few times, and then
either wait a little or terminate the app and you'll see metrics as in the
console output. You'll see the `dice.rolls` metric emitted to the console, with
separate counts for each roll value, as well as the HTTP metrics generated by
the instrumentation library.

<details>
<summary>View example output</summary>

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
									0,
									5,
									10,
									25,
									50,
									75,
									100,
									250,
									500,
									750,
									1000,
									2500,
									5000,
									7500,
									10000
								],
								"BucketCounts": [
									8,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0
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
									0,
									5,
									10,
									25,
									50,
									75,
									100,
									250,
									500,
									750,
									1000,
									2500,
									5000,
									7500,
									10000
								],
								"BucketCounts": [
									0,
									8,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0
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
									0.005,
									0.01,
									0.025,
									0.05,
									0.075,
									0.1,
									0.25,
									0.5,
									0.75,
									1,
									2.5,
									5,
									7.5,
									10
								],
								"BucketCounts": [
									8,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0
								],
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

## Next steps

For more information about instrumenting your code, refer the
[manual instrumentation](/docs/languages/go/instrumentation/) documentation.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/go/exporters/) to one or more
telemetry backends.

If you'd like to explore a more complex example, take a look at the
[OpenTelemetry Demo](/docs/demo/), which includes the Go based
[Checkout Service](/docs/demo/services/checkout/),
[Product Catalog Service](/docs/demo/services/product-catalog/), and
[Accounting Service](/docs/demo/services/accounting/)

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/

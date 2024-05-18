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

{{% alert title="Note" %}}

The logs signal is still experimental. Breaking changes may be introduced in
future versions.

{{% /alert %}}

## Prerequisites

Ensure that you have the following installed locally:

- [Go](https://go.dev/) 1.22 or greater

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
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/rolldice", rolldice)

	log.Fatal(http.ListenAndServe(":8080", nil))
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

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
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

### Add Dependencies

Install the following packages:

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
  "go.opentelemetry.io/otel/semconv/v1.24.0" \
  "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"\
  "go.opentelemetry.io/contrib/bridges/otelslog"
```

This installs OpenTelemetry SDK components and `net/http` instrumentation.

If you're instrumenting a different library for network requests, you'll need to
install the appropriate instrumentation library. See
[libraries](/docs/languages/go/libraries/) for more info.

### Initialize the OpenTelemetry SDK

First, we'll initialize the OpenTelemetry SDK. This is _required_ for any
application that exports telemetry.

Create `otel.go` with OpenTelemetry SDK bootstrapping code:

<!-- prettier-ignore-start -->
<?code-excerpt "otel.go" from="package main"?>
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
func setupOTelSDK(ctx context.Context) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	// shutdown calls cleanup functions registered via shutdownFuncs.
	// The errors from the calls are joined.
	// Each registered cleanup will be invoked once.
	shutdown = func(ctx context.Context) error {
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
	tracerProvider, err := newTraceProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Set up meter provider.
	meterProvider, err := newMeterProvider()
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	// Set up logger provider.
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
			// Default is 5s. Set to 1s for demonstrative purposes.
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
			// Default is 1m. Set to 3s for demonstrative purposes.
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

If you're only using tracing or metrics, you can omit the code the corresponding
TracerProvider or MeterProvider initialization code.

### Instrument the HTTP server

Now that we have the OpenTelemetry SDK initialized, we can instrument the HTTP
server.

Modify `main.go` to include code that sets up OpenTelemetry SDK and instruments
the HTTP server using the `otelhttp` instrumentation library:

<!-- prettier-ignore-start -->
<?code-excerpt "main.go" from="package main"?>
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
	// Handle SIGINT (CTRL+C) gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry.
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return
	}
	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Start HTTP server.
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

	// Wait for interruption.
	select {
	case err = <-srvErr:
		// Error when starting HTTP server.
		return
	case <-ctx.Done():
		// Wait for first CTRL+C.
		// Stop receiving signal notifications as soon as possible.
		stop()
	}

	// When Shutdown is called, ListenAndServe immediately returns ErrServerClosed.
	err = srv.Shutdown(context.Background())
	return
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	// handleFunc is a replacement for mux.HandleFunc
	// which enriches the handler's HTTP instrumentation with the pattern as the http.route.
	handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
		// Configure the "http.route" for the HTTP instrumentation.
		handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
		mux.Handle(pattern, handler)
	}

	// Register handlers.
	handleFunc("/rolldice/", rolldice)
	handleFunc("/rolldice/{player}", rolldice)

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
<?code-excerpt "rolldice.go" from="package main"?>
```go
package main

import (
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/sdk/instrumentation"
)

const name = "rolldice"

var (
	tracer = otel.Tracer(name)
	meter  = otel.Meter(name)
	logger = otelslog.NewLogger(
		otelslog.WithInstrumentationScope(instrumentation.Scope{
			Name: name,
		}),
	)
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
		msg = fmt.Sprintf("%s is rolling the dice", player)
	} else {
		msg = "Anonymous player is rolling the dice"
	}
	logger.InfoContext(ctx, msg, "result", roll)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
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

Along with the trace, log messages are emitted to the console.

<details>
<summary>View example output</summary>

```json
{
  "Timestamp": "2023-09-25T12:42:05.177136776+02:00",
  "ObservedTimestamp": "2023-09-25T12:42:06.809396011+02:00",
  "Severity": 9,
  "SeverityText": "",
  "Body": {
    "Type": "String",
    "Value": "Alice is rolling the dice"
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

---
title: Getting Started
weight: 10
cSpell:ignore: chan fatalln intn itoa otelconf otelhttp rolldice strconv
---

This page will show you how to get started with OpenTelemetry in Go.

You will learn how you can instrument a simple application, in such a way that
[traces][], [metrics][], and [logs][] are emitted to the console.

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

Create a file called `main.go` and add the following code:

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

Create another file called `rolldice.go`:

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

Build and run the application:

```shell
go run .
```

Open <http://localhost:8080/rolldice> in your web browser to ensure it is
working.

## Add OpenTelemetry Instrumentation

Now we'll add OpenTelemetry instrumentation to the sample app.

### Add Dependencies

Install the required packages:

```shell
go get "go.opentelemetry.io/otel" \
  "go.opentelemetry.io/contrib/otelconf/v0.3.0" \
  "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp" \
  "go.opentelemetry.io/contrib/bridges/otelslog"
```

This installs the OpenTelemetry configuration package and `net/http`
instrumentation. The `otelconf` package provides a declarative way to configure
the OpenTelemetry SDK using YAML.

### Configure the OpenTelemetry SDK

Create `otel.yaml` with the following configuration:

```yaml
file_format: '0.3'
disabled: false
resource:
  attributes:
    - name: service.name
      value: dice
    - name: service.version
      value: 0.1.0
propagator:
  composite: [tracecontext, baggage]
tracer_provider:
  processors:
    - batch:
        exporter:
          console:
            pretty_print: true
meter_provider:
  readers:
    - periodic:
        interval: 5000
        exporter:
          console: {}
logger_provider:
  processors:
    - batch:
        exporter:
          console: {}
```

This configuration sets up all three signals (traces, metrics, and logs) to
export to the console. The `otelconf` package supports many exporters including
OTLP, which you can use to send telemetry to an OpenTelemetry Collector or
directly to a backend.

### Instrument the HTTP server

Update `main.go` to initialize the OpenTelemetry SDK and instrument the HTTP
server:

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

	otelconf "go.opentelemetry.io/contrib/otelconf/v0.3.0"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/log/global"
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry SDK from configuration file.
	cfgBytes, err := os.ReadFile("otel.yaml")
	if err != nil {
		return err
	}
	cfg, err := otelconf.ParseYAML(cfgBytes)
	if err != nil {
		return err
	}
	sdk, err := otelconf.NewSDK(otelconf.WithOpenTelemetryConfiguration(*cfg))
	if err != nil {
		return err
	}
	defer sdk.Shutdown(ctx)

	// Register providers globally.
	otel.SetTracerProvider(sdk.TracerProvider())
	otel.SetMeterProvider(sdk.MeterProvider())
	global.SetLoggerProvider(sdk.LoggerProvider())

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

	select {
	case err = <-srvErr:
		return err
	case <-ctx.Done():
		stop()
	}

	return srv.Shutdown(context.Background())
}

func newHTTPHandler() http.Handler {
	mux := http.NewServeMux()

	handleFunc := func(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
		handler := otelhttp.WithRouteTag(pattern, http.HandlerFunc(handlerFunc))
		mux.Handle(pattern, handler)
	}

	handleFunc("/rolldice/", rolldice)
	handleFunc("/rolldice/{player}", rolldice)

	return otelhttp.NewHandler(mux, "/")
}
```

### Add Custom Instrumentation

Instrumentation libraries capture telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but they don't capture what's going on in
your application. For that you'll need to write some custom
[manual instrumentation](../instrumentation/).

Update `rolldice.go` to include custom instrumentation:

```go
package main

import (
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

const name = "dice"

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
		logger.ErrorContext(ctx, "Write failed", "error", err)
	}
}
```

### Run the Application

Build and run the application:

```sh
go mod tidy
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
		"TraceID": "f6fdb61a499561aa59cb5214e7625315",
		"SpanID": "dda1ffcc68702b48",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"Parent": {
		"TraceID": "f6fdb61a499561aa59cb5214e7625315",
		"SpanID": "d827515c60f36366",
		"TraceFlags": "01",
		"TraceState": "",
		"Remote": false
	},
	"SpanKind": 1,
	"StartTime": "2026-01-23T14:28:31.295282259+01:00",
	"EndTime": "2026-01-23T14:28:31.295513308+01:00",
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
		}
	],
	"InstrumentationScope": {
		"Name": "dice",
		"Version": "",
		"SchemaURL": ""
	}
}
{
	"Name": "/",
	"SpanContext": {
		"TraceID": "f6fdb61a499561aa59cb5214e7625315",
		"SpanID": "d827515c60f36366",
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
	"StartTime": "2026-01-23T14:28:31.295258398+01:00",
	"EndTime": "2026-01-23T14:28:31.295577593+01:00",
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
			"Key": "http.route",
			"Value": {
				"Type": "STRING",
				"Value": "/rolldice/{player}"
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
		}
	],
	"InstrumentationScope": {
		"Name": "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
		"Version": "0.64.0",
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
  "Timestamp": "2026-01-23T14:28:31.295299386+01:00",
  "ObservedTimestamp": "2026-01-23T14:28:31.295457425+01:00",
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
        "Value": 6
      }
    }
  ],
  "TraceID": "f6fdb61a499561aa59cb5214e7625315",
  "SpanID": "dda1ffcc68702b48",
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
    }
  ],
  "Scope": {
    "Name": "dice",
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
    }
  ],
  "ScopeMetrics": [
    {
      "Scope": {
        "Name": "dice",
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
                      "Value": 6
                    }
                  }
                ],
                "StartTime": "2026-01-23T14:28:29.294355634+01:00",
                "Time": "2026-01-23T14:28:34.294747626+01:00",
                "Value": 1
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
        "SchemaURL": ""
      },
      "Metrics": [
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
                    "Key": "http.route",
                    "Value": {
                      "Type": "STRING",
                      "Value": "/rolldice/{player}"
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
                  }
                ],
                "StartTime": "2026-01-23T14:28:29.294441802+01:00",
                "Time": "2026-01-23T14:28:34.294881389+01:00",
                "Count": 1,
                "Sum": 0.00028735
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

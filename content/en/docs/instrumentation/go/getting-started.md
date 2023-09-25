---
title: Getting Started
weight: 10
cSpell:ignore: funcs intn itoa rolldice stdouttrace strconv
---

This page will show you how to get started with OpenTelemetry in Go.

You will learn how you can instrument a simple application automatically, in
such a way that [traces][] and [metrics][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [Go](https://go.dev/)

## Example application

The following example uses a basic [`net/http`](https://pkg.go.dev/net/http)
application. If you are not using `net/http`, that's OK — you can use
OpenTelemetry Go with other web frameworks as well, such as Gin and Echo. For a
complete list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=go).

For more elaborate examples, see [examples](/docs/instrumentation/go/examples/).

## Installation

To begin, set up an `go.mod` in a new directory:

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

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
go run .
```

## Instrumentation

Create `otel.go` with OpenTelemetry SDK bootstrapping code:

```go
package main

import (
	"context"
	"errors"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutmetric"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

// setupOTelSDK bootstraps the OpenTelemetry pipeline.
// If it does not return an error, make sure to call shutdown for proper cleanup.
func setupOTelSDK(ctx context.Context, serviceName, serviceVersion string) (shutdown func(context.Context) error, err error) {
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

	// Setup resource.
	res, err := newResource(serviceName, serviceVersion)
	if err != nil {
		handleErr(err)
		return
	}

	// Setup trace provider.
	tracerProvider, err := newTraceProvider(res)
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Setup meter provider.
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		handleErr(err)
		return
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	return
}

func newResource(serviceName, serviceVersion string) (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(serviceVersion),
		))
}

func newTraceProvider(res *resource.Resource) (*trace.TracerProvider, error) {
	traceExporter, err := stdouttrace.New(
		stdouttrace.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			// Default is 5s. Set to 1s for demonstrative purposes.
			trace.WithBatchTimeout(time.Second)),
		trace.WithResource(res),
	)
	return traceProvider, nil
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := stdoutmetric.New()
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter,
			// Default is 1m. Set to 3s for demonstrative purposes.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
```

Modify `main.go` to include code that sets up OpenTelemetry SDK and instruments
the HTTP server using the `otelhttp` instrumentation library:

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
	serviceName := "dice"
	serviceVersion := "0.1.0"
	otelShutdown, err := setupOTelSDK(ctx, serviceName, serviceVersion)
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
	handleFunc("/rolldice", rolldice)

	// Add HTTP instrumentation for the whole server.
	handler := otelhttp.NewHandler(mux, "/")
	return handler
}
```

Build and run the application with the following command:

```sh
go mod tidy
go run .
```

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. After a while you should see the spans printed in the console, such
as the following:

<details>
<summary>View example output</summary>

```json
TODO
```

</details>

The generated span tracks the lifetime of a request to the `/rolldice` route.

Send a few more requests to the endpoint, and then either wait for a little bit
or terminate the app and you'll see metrics in the console output, such as the
following:

<details>
<summary>View example output</summary>

```json
TODO
```

</details>

## Add custom instrumentation

Instrumentation libraries captures telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but it doesn't capture what's going on in
your application. For that you'll need to write some custom
[manual instrumentation](../manual/).

Modify `rolldice.go` to include custom instrumentation using OpenTelemetry API:

```go
package main

import (
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	tracer  = otel.Tracer("rolldice")
	meter   = otel.Meter("rolldice")
	rollCnt metric.Int64Counter
)

func init() {
	var err error
	rollCnt, err = meter.Int64Counter("roll_counter",
		metric.WithDescription("The number of rolls by roll value"),
		metric.WithUnit("{roll}"))
	if err != nil {
		panic(err)
	}
}

func rolldice(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "do_roll")
	defer span.End()

	roll := 1 + rand.Intn(6)

	rollValueAttr := attribute.Int("roll.value", roll)
	span.SetAttributes(rollValueAttr)
	rollCnt.Add(ctx, 1, metric.WithAttributes(rollValueAttr))

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
	}
}
```

Build and run the application with the following command:

```sh
go mod tidy
go run .
```

When you send a request to the server, you'll see two spans in the trace emitted
to the console, and the one called `do_roll` registers its parent as the
automatically created one:

<details>
<summary>View example output</summary>

```json
TODO
```

</details>

The `parent_id` of `do_roll` is the same is the `span_id` for `/rolldice`,
indicating a parent-child relationship!

Moreover, you'll see the roll counter metric emitted to the console, with
separate counts for each roll value:

<details>
<summary>View example output</summary>

```json
TODO
```

## Next steps

For more information about instrumenting your code, refer to the
[manual instrumentation](/docs/instrumentation/go/manual/) documentation.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/go/exporters/) to one or more
telemetry backends.

If you'd like to explore a more complex example, take a look at the
[OpenTelemetry Demo](/docs/demo/), which includes the Go based
[Checkout Service](/docs/demo/services/feature-flag/),
[Product Catalog Service](/docs/demo/services/product-catalog/) and
[Accounting Service](/docs/demo/services/accounting/)

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/

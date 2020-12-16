---
title: "Getting Started"
weight: 2
---

Welcome to the OpenTelemetry for Go getting started guide! This guide will walk you the basic steps in installing, configuring, and exporting data from OpenTelemetry.

# Installation

OpenTelemetry packages for Go are available in the `go.opentelemetry.io/otel` namespace. You will need to add references to them in the `import` statement. We suggest using Go 1.13 or newer, for module support.

To get started with this guide, create a new directory and add a new file named `main.go` to it. In your terminal, run the command `go mod init main` in the same directory. This will create a `go.mod` file, which is used by Go to manage imports.

# Initialization and Configuration

To install the necessary prerequisites for OpenTelemetry, you'll want to run the following command in the directory with your `go.mod`:

`go get go.opentelemetry.io/otel go.opentelemetry.io/otel/sdk go.opentelemetry.io/otel/exporters/stdout`

In your `main.go` file, you'll need to import several packages:

```
package main

import (
	"context"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/baggage"
	"go.opentelemetry.io/otel/exporters/stdout"
	"go.opentelemetry.io/otel/label"
	"go.opentelemetry.io/otel/propagation"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)
```

These packages contain the basic requirements for OpenTelemetry Go - the API itself, the metrics and tracing SDK, and context propagation. The exact libraries and packages that you'll use in an application will vary depending on what features you need - for example, if you're writing a library that will be used by others, you don't need to require the SDK packages and will rely solely on the API. In general, you should configure the SDK in your code as close to program initialization as possible in order to capture telemetry at the earliest time it's available.

## Creating a Console Exporter

The SDK requires an exporter to be created. Exporters are packages that allow telemetry data to be emitted somewhere - either to the console (which is what we're doing here), or to a remote system or collector for further analysis and/or enrichment. OpenTelemetry supports a variety of exporters through its ecosystem including popular open source tools like Jaeger, Zipkin, and Prometheus. 

To initialize the console exporter, add the following code to the file your `main.go` file -

```
exporter, err := stdout.NewExporter([]stdout.Option{
		stdout.WithQuantiles([]float64{0.5, 0.9, 0.99}),
		stdout.WithPrettyPrint(),
	}...)
	if err != nil {
		log.Fatalf("failed to initialize stdout export pipeline: %v", err)
	}
```

This creates a new console exporter with a few options - `WithQuantiles` sets the quantile (a quantile represents a division in the range of a distribution of probabilities) values to write to the console, and `WithPrettyPrint` formats the text nicely when its printed, so that it's easier for humans to read.

## Creating a Tracer Provider

A trace is a type of telemetry that represents work being done by a service. In a distributed system, a trace can be thought of as a 'stack trace', showing the work being done by each service as well as the upstream and downstream calls that its making to other services.

OpenTelemetry requires a trace provider to be initialized in order to generate traces. A trace provider can have multiple span processors, which are components that allow for span data to be modified or exported after its created.

To create a trace provider, add the following code to your `main.go` file -

```
bsp := sdktrace.NewBatchSpanProcessor(exporter)
defer bsp.Shutdown(context.Background())
tp := sdktrace.NewTracerProvider(sdktrace.WithSpanProcessor(bsp))
```

This block of code will create a new batch span processor, a type of span processor that batches up multiple spans over a period of time, that writes to the exporter we created in the previous step. You can see examples of other uses for span processors in [this file](https://github.com/open-telemetry/opentelemetry-go/blob/master/sdk/trace/span_processor_example_test.go). Finally, we set up a propagator for baggage, which are attributes that we can set on our spans and metrics and share across multiple services.

## Creating a Metric Provider

Metrics documentation is not yet available for this language.

## Setting Global Options

When using OpenTelemetry, it's a good practice to set a global tracer provider. Doing so will make it easier for libraries and other dependencies that use the OpenTelemetry API will be able to easily discover the SDK, and emit telemetry data. In addition, you'll want to configure context propagation options. Context propagation allows for OpenTelemetry to share values across multiple services - this includes trace identifiers, which ensure that all spans for a single request are part of the same trace, as well as baggage, which are arbitrary key/value pairs that you can use to pass observability data between services (for example, sharing a customer ID from one service to the next).

Setting up global options uses the `otel` package - add these options to your `main.go` file as shown -

```
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.Baggage{})
```

It's important to note that if you do not set a propagator, the default is to use the `NoOp` option, which means that context will not be shared between multiple services.

# Quick Start

Let's put the concepts we've just covered together, and create a trace in a single process. In our main function, after the initialization code, add the following:

```
tracer := global.Tracer("ex.com/basic")
ctx := context.Background()
ctx = otel.ContextWithBaggageValues(ctx, fooKey.String("foo1"), barKey.String("bar1"))

err = func(ctx context.Context) error {
  var span trace.Span
  ctx, span = tracer.Start(ctx, "operation")
  defer span.End()

  span.AddEvent("Nice operation!", trace.WithAttributes(label.Int("bogons", 100)))
  span.SetAttributes(anotherKey.String("yes"))

  return func(ctx context.Context) error {
    var span trace.Span
    ctx, span = tracer.Start(ctx, "Sub operation...")
    defer span.End()

    span.SetAttributes(lemonsKey.String("five"))
    span.AddEvent("Sub span event")

    return nil
  }(ctx)
}(ctx)
if err != nil {
  panic(err)
}
```

In this snippet, we're doing a few things. First, we're asking the global trace provider for an instance of a tracer, which is the object that manages spans for our service. We provide a name (`"ex.com/basic"`) which acts as a way to namespace our spans and make them distinct from other spans in this process, or another. Finally, we get an instance of the Go `context`, which is used by OpenTelemetry to hold references to a span in order to propagate it between function calls inside a service.

Inside our function, we're creating a new span by calling `tracer.Start` with the context we just created, and a name. Passing the context will set our span as 'active' in it, which is used in our inner function to make a new child span. The name is important - every span needs a name, and these names are the primary method of indicating what a span represents.  Calling `defer span.End()` ensures that our span will complete once this function has finished its work. Spans can have attributes and events, which are metadata and log statements that help you interpret traces after-the-fact. Finally, in this code snippet we can see an example of creating a new function and propagating the span to it inside our code. When you run this program, you'll see that the 'Sub operation...' span has been created as a child of the 'operation' span.

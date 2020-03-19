---
title: "Tracing"
---

This page contains documentation for OpenTelemetry Go.

# Quick Start

**Please note** that this library is currently in *alpha*, and shouldn't be used in production environments.

First let's install the API and SDK packages

```bash
go get -u go.opentelemetry.io/otel
```

From there, you should be able to use opentelemetry as per the following:

```go
package main

import (
	"context"
	"log"

	"go.opentelemetry.io/otel/api/global"
	"go.opentelemetry.io/otel/exporter/trace/stdout"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

// initTracer creates and registers trace provider instance.
func initTracer() {
	var err error
	exp, err := stdout.NewExporter(stdout.Options{PrettyPrint: false})
	if err != nil {
		log.Panicf("failed to initialize stdout exporter %v\n", err)
		return
	}
	tp, err := sdktrace.NewProvider(sdktrace.WithSyncer(exp),
		sdktrace.WithConfig(sdktrace.Config{DefaultSampler: sdktrace.AlwaysSample()}))
	if err != nil {
		log.Panicf("failed to initialize trace provider %v\n", err)
	}
	global.SetTraceProvider(tp)
}

func main() {
	initTracer()
	tracer := global.TraceProvider().Tracer("ex.com/basic")

	ctx := context.Background()

	err := tracer.WithSpan(ctx, "foo", func(ctx context.Context) error {
		return tracer.WithSpan(ctx, "bar", func(ctx context.Context) error {
			return tracer.WithSpan(ctx, "baz", func(ctx context.Context) error {
				return nil
			})
		})
	})
	if err != nil {
		panic(err)
	}
}

```
Running the code will output trace information to the console:

```bash
go run tracer.go
{"SpanContext":{"TraceID":"04186bc51ac90591f5595f83f83657ce","SpanID":"01b7b5255b43f488","TraceFlags":1},"ParentSpanID":"0dee29eb8612c467","SpanKind":1,"Name":"ex.com/basic/baz","StartTime":"2019-11-14T19:57:41.339673-08:00","EndTime":"2019-11-14T19:57:41.339675819-08:00","Attributes":null,"MessageEvents":null,"Links":null,"Status":0,"HasRemoteParent":false,"DroppedAttributeCount":0,"DroppedMessageEventCount":0,"DroppedLinkCount":0,"ChildSpanCount":0}
{"SpanContext":{"TraceID":"04186bc51ac90591f5595f83f83657ce","SpanID":"0dee29eb8612c467","TraceFlags":1},"ParentSpanID":"42537c10ad93be38","SpanKind":1,"Name":"ex.com/basic/bar","StartTime":"2019-11-14T19:57:41.339671-08:00","EndTime":"2019-11-14T19:57:41.340046523-08:00","Attributes":null,"MessageEvents":null,"Links":null,"Status":0,"HasRemoteParent":false,"DroppedAttributeCount":0,"DroppedMessageEventCount":0,"DroppedLinkCount":0,"ChildSpanCount":1}
{"SpanContext":{"TraceID":"04186bc51ac90591f5595f83f83657ce","SpanID":"42537c10ad93be38","TraceFlags":1},"ParentSpanID":"0000000000000000","SpanKind":1,"Name":"ex.com/basic/foo","StartTime":"2019-11-14T19:57:41.339664-08:00","EndTime":"2019-11-14T19:57:41.340058439-08:00","Attributes":null,"MessageEvents":null,"Links":null,"Status":0,"HasRemoteParent":false,"DroppedAttributeCount":0,"DroppedMessageEventCount":0,"DroppedLinkCount":0,"ChildSpanCount":1}
```

# API Reference

See the [API documentation](https://go.opentelemetry.io/otel/) for more detail, and the [opentelemetry-go/examples](https://github.com/open-telemetry/opentelemetry-go/tree/master/example) folder for additional examples.

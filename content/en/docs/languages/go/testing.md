---
title: Testing Instrumentation
weight: 35
description: How to test OpenTelemetry Go instrumentation
---

When instrumenting a library or application, it is important to verify
that your instrumentation works as expected without needing a real backend
such as Jaeger or Prometheus. OpenTelemetry Go provides testing helper
packages for this purpose.

## Traces

Use the `tracetest` package to capture spans in memory during tests.

Ensure you have the right packages installed:

```bash
go get go.opentelemetry.io/otel/sdk/trace \
  go.opentelemetry.io/otel/sdk/trace/tracetest
```

The `SpanRecorder` acts as a `SpanProcessor` that records all started
and ended spans in memory. You can then assert on those spans in your
test.

```go
package yourpackage_test

import (
    "context"
    "testing"

    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/sdk/trace/tracetest"
)

func TestSpanRecorder(t *testing.T) {
    ctx := context.Background()

    // Set up an in-memory span recorder and tracer provider.
    sr := tracetest.NewSpanRecorder()
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithSpanProcessor(sr),
    )
    defer tp.Shutdown(ctx)

    tracer := tp.Tracer("example/simple")

    // Start and end a span.
    _, span := tracer.Start(ctx, "test-span")
    span.End()

    // Assert on the recorded spans.
    spans := sr.Ended()
    if len(spans) != 1 {
        t.Fatalf("expected 1 span, got %d", len(spans))
    }
    if spans[0].Name() != "test-span" {
        t.Errorf("expected span name 'test-span', got %s",
            spans[0].Name())
    }
}
```
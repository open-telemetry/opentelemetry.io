---
title: Go Instrumentation Auto SDK
linkTitle: Auto SDK
description: Integrate manual spans with zero-code eBPF spans with the Auto SDK.
weight: 16
---

The OpenTelemetry Go eBPF Instrumentation framework, used by tools like
[OBI](/docs/zero-code/obi), provides support for integrating with manually
instrumented OpenTelemetry spans through the Auto SDK.

## What is the Auto SDK?

The Auto SDK is a fully implemented, custom OpenTelemetry Go SDK that is
designed for compatibility with Go eBPF auto-instrumentation. This allows
automatically instrumented packages (like `net/http`, for example) to support
context propagation with manual spans.

## When should I use it?

OpenTelemetry Go eBPF instrumentation currently only supports a limited number
of packages. You may still want to extend this instrumentation and create custom
spans within your code. The Auto SDK enables this by instrumenting your custom
spans with a shared trace context that will also be used by automatic spans.

## How do I use it?

OBI v1.0.0 supports both the separate `go.opentelemetry.io/auto/sdk` module and
the Auto SDK embedded in supported versions of `go.opentelemetry.io/otel/trace`.
The embedded path does not require the separate Auto SDK module. Activation
depends on the module versions and checksums, executable symbols, architecture,
and permission to use `bpf_probe_write_user`. Check the
[OBI activation requirements](/docs/zero-code/obi/distributed-traces/#instrument-applications-that-use-the-go-trace-api)
before choosing module versions.

Creating manual spans using the Auto SDK is essentially the same as creating
spans using standard [Go instrumentation](/docs/languages/go/instrumentation/).

Create manual spans with `tracer.Start()`:

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/otel"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Get tracer
		tracer := otel.Tracer("example-server")

		// Start a manual span
		_, span := tracer.Start(r.Context(), "manual-span")
		defer span.End()

		span.AddEvent("Request handled")
	})

	log.Println("Server running at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

In this example, the eBPF framework automatically instruments incoming HTTP
requests, then links the manual span to the same trace instrumented from the
HTTP library. Note that there is no TracerProvider initialized in this sample.
OBI activates the Auto SDK only when the application meets the activation
requirements and has not registered a global `TracerProvider`.

> [!WARNING]
>
> Registering a global `TracerProvider`, including through
> `otel.SetTracerProvider(auto.TracerProvider())`, prevents OBI from activating
> the Auto SDK. When an SDK provider is already registered, OBI leaves that
> provider responsible for the application's manual spans.

## How does the Auto SDK work?

OBI inspects the application's OpenTelemetry modules, resolves the required
symbols and field layouts, and activates the supported Auto SDK path. It
captures manual spans alongside eBPF spans with a shared trace context.

Each encoded span payload must fit within 16 KiB in OBI v1.0.0. Oversized spans
are dropped without a metric or warning. If activation fails, OBI can sometimes
capture partial synthetic spans, which omit instrumentation scope, events, and
the requested span kind. See the
[OBI manual span limitations](/docs/zero-code/obi/distributed-traces/#instrument-applications-that-use-the-go-trace-api).

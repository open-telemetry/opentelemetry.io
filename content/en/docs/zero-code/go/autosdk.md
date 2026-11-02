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

OBI supports the Auto SDK embedded in `go.opentelemetry.io/otel/trace` and the
separate `go.opentelemetry.io/auto/sdk` module. When using the embedded SDK, you
don't need the separate module.

Check that OBI supports the versions of `go.opentelemetry.io/otel` and
`go.opentelemetry.io/otel/trace` used by your application. If you use the
separate Auto SDK module, its version must also be supported. See the
[OBI activation requirements](/docs/zero-code/obi/distributed-traces/#instrument-applications-that-use-the-go-trace-api)
for supported versions and runtime requirements.

Create manual spans with `tracer.Start()`, as you would with
[Go manual instrumentation](/docs/languages/go/instrumentation/):

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

OBI links the manual span in this example to the automatically captured HTTP
request span. Leave the global `TracerProvider` unset so OBI can enable the Auto
SDK.

> [!WARNING]
>
> Registering a global `TracerProvider`, including through
> `otel.SetTracerProvider(auto.TracerProvider())`, prevents OBI from activating
> the Auto SDK. If an SDK provider is already registered, that provider handles
> the application's manual spans.

## How does the Auto SDK work?

OBI locates the OpenTelemetry API and Auto SDK in the application executable,
enables the Auto SDK, and captures manual spans in the same traces as
automatically captured spans.

Each span's encoded payload must fit within 16 KiB. OBI drops larger spans
without reporting a metric or warning.

If OBI cannot enable the Auto SDK, it may still capture partial spans from calls
to the Trace API. These spans omit the instrumentation scope, events, and
requested span kind. See the
[OBI manual span limitations](/docs/zero-code/obi/distributed-traces/#instrument-applications-that-use-the-go-trace-api).

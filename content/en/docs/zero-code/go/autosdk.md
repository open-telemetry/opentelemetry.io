---
title: Go Instrumentation Auto SDK
linkTitle: Auto SDK
description: Integrate manual spans with zero-code eBPF spans with the Auto SDK.
weight: 16
---

OpenTelemetry Go provides an Auto SDK for use with eBPF instrumentation agents,
including [Go auto-instrumentation](../) and [OBI](/docs/zero-code/obi/).

## What is the Auto SDK?

The Auto SDK is a fully implemented, custom OpenTelemetry Go SDK that is
designed for compatibility with Go eBPF auto-instrumentation. This allows
automatically instrumented packages (like `net/http`, for example) to support
context propagation with manual spans.

## When should I use it?

Use the Auto SDK to add spans for operations your eBPF agent does not capture
automatically, such as application-specific business logic. These manual spans
share trace context with automatically captured spans.

## How do I use it?

Starting with
[OpenTelemetry Go v1.36.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.36.0),
the standard Go API includes `go.opentelemetry.io/auto/sdk` as a dependency.
Your application may already include it. To check, run the following command
from your application's module directory:

```sh
go list -m go.opentelemetry.io/auto/sdk
```

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

## How does the Auto SDK work?

An eBPF agent enables the Auto SDK in the application and collects manual spans
alongside automatically captured spans. Without an agent instrumenting it, the
Auto SDK does not generate telemetry.

## Using the Auto SDK with OBI

OBI supports the separate `go.opentelemetry.io/auto/sdk` module and the Auto SDK
embedded in `go.opentelemetry.io/otel/trace`. When using the embedded SDK, you
don't need the separate module.

Leave the global `TracerProvider` unset so OBI can enable the Auto SDK.
Registering one, including through
`otel.SetTracerProvider(auto.TracerProvider())`, prevents OBI from activating
the Auto SDK. If an SDK provider is already registered, that provider handles
the application's manual spans.

For supported dependency versions, runtime requirements, and span capture
limits, see
[OBI's Go Trace API integration](/docs/zero-code/obi/distributed-traces/#instrument-applications-that-use-the-go-trace-api).

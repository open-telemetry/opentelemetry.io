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

Since the release of
[OpenTelemetry Go v1.36.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.36.0),
the Auto SDK is automatically imported as an indirect dependency with the
standard Go API. You can confirm that your project has the Auto SDK by checking
your `go.mod` for `go.opentelemetry.io/auto/sdk`.

Creating manual spans using the Auto SDK is essentially the same as creating
spans using standard [Go instrumentation](/docs/languages/go/instrumentation/).

With the Auto SDK available, using it is as simple as creating manual spans with
`tracer.Start()`:

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

		// Add an attribute for demonstration
		span.SetAttributes()
		span.AddEvent("Request handled")
	})

	log.Println("Server running at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

In this example, the eBPF framework automatically instruments incoming HTTP
requests, then links the manual span to the same trace instrumented from the
HTTP library. Note that there is no TracerProvider initialized in this sample.
The Auto SDK registers its own TracerProvider that is crucial to enabling the
SDK.

Essentially, there is nothing you need to do to enable the Auto SDK except
create manual spans in an application instrumented by a Go zero-code agent. As
long as you don't manually register a global TracerProvider, the Auto SDK will
automatically be enabled.

{{% alert title="Important" color="warning" %}}

Manually setting a global TracerProvider will conflict with the Auto SDK and
prevent manual spans from properly correlating with eBPF-based spans. If you are
creating manual spans in a Go application that is also instrumented by eBPF, do
not initialize your own global TracerProvider.

{{% /alert %}}

### Auto SDK TracerProvider

In most use cases, it is unnecessary to manually interact with the Auto SDK's
built-in TracerProvider. However, for certain advanced use cases you may wish to
manually configure the Auto SDK's TracerProvider. You can access it with the
[`auto.TracerProvider()`](https://pkg.go.dev/go.opentelemetry.io/auto/sdk)
function:

```go
import (
	"go.opentelemetry.io/otel"
    autosdk "go.opentelemetry.io/auto/sdk"
)

func main() {
	tp := autosdk.TracerProvider()
	otel.SetTracerProvider(tp)
}
```

## How does the Auto SDK work?

When an application is instrumented by OpenTelemetry eBPF, the eBPF program will
look for the presence of the `go.opentelemetry.io/auto/sdk` dependency in the
application (remember, this dependency is included by default in
`go.opentelemetry.io/otel`; it does not need to be an explicit import). If it is
found, the eBPF program will enable a boolean value in the global OpenTelemetry
SDK to instruct OpenTelemetry to use the Auto SDK TracerProvider.

The Auto SDK then works very similarly to any other SDK, implementing all of the
specification-required functionality. The main difference is that it is also
auto-instrumented by eBPF to unify context propagation with other
eBPF-instrumented libraries.

Essentially the Auto SDK is how OpenTelemetry eBPF identifies and orchestrates
context propagation with the standard OpenTelemetry API, by instrumenting
OpenTelemetry function symbols much like it does for any other package.

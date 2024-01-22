---
title: Using instrumentation libraries
linkTitle: Libraries
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
---

{{% docs/languages/libraries-intro Go %}}

## Use instrumentation libraries

If a library does not come with OpenTelemetry out of the box, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.

For example, the
[instrumentation library for `net/http`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)
automatically creates [spans](/docs/concepts/signals/traces/#spans) and
[metrics](/docs/concepts/signals/metrics/) based on the HTTP requests.

## Setup

Each instrumentation library is a package. In general, this means you need to
`go get` the appropriate package. For example, to get the instrumentation
libraries maintained in the
[Contrib repository](https://github.com/open-telemetry/opentelemetry-go-contrib)
run the following:

```sh
go get go.opentelemetry.io/contrib/instrumentation/{import-path}/otel{package-name}
```

Then configure it in your code based on what the library requires to be
activated.

[Getting Started](../getting-started/) provides an example showing how to set up
instrumentation for a `net/http` server.

## Available packages

A full list of instrumentation libraries available can be found in the
[OpenTelemetry registry](/ecosystem/registry/?language=go&component=instrumentation).

## Next steps

Instrumentation libraries can do things like generate telemetry data for inbound
and outbound HTTP requests, but they don't instrument your actual application.

Enrich your telemetry data by integrating
[custom instrumentation](../instrumentation/) into your code. This supplements
the standard library telemetry, and can offer deeper insights into your running
application.

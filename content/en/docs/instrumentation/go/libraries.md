---
title: Using instrumentation libraries
linkTitle: Libraries
aliases:
  - /docs/instrumentation/go/using_instrumentation_libraries
  - /docs/instrumentation/go/automatic_instrumentation
weight: 40
---

Go does not support truly automatic instrumentation like other languages today.
Instead, you'll need to depend on
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
that generate telemetry data for a particular instrumented library. For example,
the instrumentation library for `net/http` will automatically create spans that
track inbound and outbound requests once you configure it in your code.

## Setup

Each instrumentation library is a package. In general, this means you need to
`go get` the appropriate package. For example, to get the instrumentation libraries
maintained in the
[Contrib repository](https://github.com/open-telemetry/opentelemetry-go-contrib)
run the following:

```sh
go get go.opentelemetry.io/contrib/instrumentation/{import-path}/otel{package-name}
```

Then configure it in your code based on what the library requires to be
activated.

[Getting Started](../manual/) provides an example showing how to set up
instrumentation for a `net/http` server.

## Available packages

A full list of instrumentation libraries available can be found in the
[OpenTelemetry registry](/ecosystem/registry/?language=go&component=instrumentation).

## Next steps

Instrumentation libraries can do things like generate telemetry data for inbound
and outbound HTTP requests, but they don't instrument your actual application.

To get richer telemetry data, use [manual instrumentation](../manual/) to enrich
your telemetry data from instrumentation libraries with instrumentation from
your running application.

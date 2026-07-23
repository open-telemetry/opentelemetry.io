---
title: Instrumentation
linkTitle: Instrumentation
weight: 30
description: Manual instrumentation for OpenTelemetry Rust
---

{{% include instrumentation-intro.md %}}

## Setup

To instrument a Rust application, add the OpenTelemetry API crate to your
`Cargo.toml`:

```toml
[dependencies]
opentelemetry = "{{% version-from-registry otel-rust %}}"
```

If you are instrumenting a library, depend on the API (i.e `opentelemetry`
crate) only and let the application provide the SDK.

For an end-to-end example that initializes the SDK and exports traces, see
[Getting Started](/docs/languages/rust/getting-started/).

## Traces

Use a tracer to create spans around the operations you want to observe. In a
Rust application, this usually means:

1. Acquiring a `Tracer` from the global `TracerProvider`
2. Starting spans around the work you want to measure

For setup details and related APIs, see the
[Rust API reference](/docs/languages/rust/api/).

## Metrics

Use a meter to create instruments and record measurements from your code. In a
Rust application, this usually means:

1. Initializing a `MeterProvider`
2. Acquiring a `Meter`
3. Creating instruments and recording measurements

For the current metrics APIs, see the
[metrics module documentation](https://docs.rs/opentelemetry/latest/opentelemetry/metrics/index.html).

## Logs

For logging, OpenTelemetry Rust recommends using existing logging crates
such as [`tracing`](https://docs.rs/tracing) or
[`log`](https://docs.rs/log) for instrumenting your code, rather than
using the OTel log APIs directly. The OTel log bridge APIs are available for
bridging these existing logging frameworks into OpenTelemetry data.

## Next steps

- Explore [Exporters](/docs/languages/rust/exporters/) to send telemetry to a
  backend.
- See [Using instrumentation libraries](/docs/languages/rust/libraries/) for
  libraries that already instrument common frameworks.
- Review [Examples](/docs/languages/rust/examples/) for more complete Rust
  setups.

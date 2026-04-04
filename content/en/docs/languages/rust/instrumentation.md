---
title: Instrumentation
linkTitle: Instrumentation
weight: 30
description: Instrumentation records telemetry using the API.
---

{{% docs/languages/instrumentation-intro rust %}}

## Setup

To instrument your Rust application, you need to include the OpenTelemetry API and SDK in your `Cargo.toml`.

```toml
[dependencies]
opentelemetry = "{{% version-from-registry otel-rust %}}"
opentelemetry_sdk = "{{% version-from-registry otel-rust-sdk %}}"
```

For more details on initial setup, see [Getting Started](../getting-started/).

## Traces

Traces record the path of a request through your application. To implement tracing in Rust:

1. Initialize a `TracerProvider`.
2. Create a `Tracer`.
3. Use the `Tracer` to create and start spans.

For detailed information, see [Traces](../api/).

## Metrics

Metrics record numerical data about your application's performance. To implement metrics in Rust:

1. Initialize a `MeterProvider`.
2. Create a `Meter`.
3. Use the `Meter` to create instruments.

For more information, see the [API documentation](https://docs.rs/opentelemetry/latest/opentelemetry/metrics/index.html).

## Logs

Logs provide a record of events that occur within your application. The OpenTelemetry Rust log bridge allows you to integrate with existing logging frameworks.

For more information, see the [API documentation](https://docs.rs/opentelemetry/latest/opentelemetry/logs/index.html).

## Next steps

- Explore [Exporters](../exporters/) to send your telemetry to a backend.
- Check out the [API reference](../api/) for deeper insights.
- Look at [Examples](../examples/) for more complex instrumentation scenarios.

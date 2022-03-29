---
title: Rust
description: A language-specific implementation of OpenTelemetry in Rust.
weight: 26
---

This is the OpenTelemetry for Rust documentation. OpenTelemetry is an
observability framework -- an API, SDK, and tools that are designed to aid in
the generation and collection of application telemetry data such as metrics,
logs, and traces. This documentation is designed to help you understand how to
get started using OpenTelemetry for Rust.

## Status and Releases

The current status of the major functional components for OpenTelemetry Rust is
as follows:

| Tracing | Metrics | Logging |
| ------- | ------- | ------- |
| Beta    | Alpha   | Not Yet Implemented |

{{% latest_release "rust" /%}}

## Crates

Opentelemetry for Rust publishes the following crates:
- [opentelemetry](https://crates.io/crates/opentelemetry)
- [opentelemetry-aws](https://crates.io/crates/opentelemetry-aws)
- [opentelemetry-contrib](https://crates.io/crates/opentelemetry-contrib)
- [opentelemetry-datadog](https://crates.io/crates/opentelemetry-datadog)
- [opentelemetry-dynatrace](https://crates.io/crates/opentelemetry-dynatrace)
- [opentelemetry-http](https://crates.io/crates/opentelemetry-http)
- [opentelemetry-jaeger](https://crates.io/crates/opentelemetry-jaeger)
- [opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp)
- [opentelemetry-prometheus](https://crates.io/crates/opentelemetry-prometheus)
- [opentelemetry-semantic-conventions](https://crates.io/crates/opentelemetry-semantic-conventions)
- [opentelemetry-stackdriver](https://crates.io/crates/opentelemetry-stackdriver)
- [opentelemetry-zipkin](https://crates.io/crates/opentelemetry-zipkin)

## Further Reading

- [Docs for Rust API & SDK](https://docs.rs/opentelemetry)
- [Examples](https://github.com/open-telemetry/opentelemetry-rust/tree/main/examples)
- [Ecosystem](https://github.com/open-telemetry/opentelemetry-rust#ecosystem)

---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
description: How to instrument libraries an app depends on
---

{{% docs/languages/libraries-intro Rust %}}

## Use Instrumentation Libraries

Each instrumentation library is a [crate](https://crates.io/).

For example,
[the instrumentation library for Actix Web](https://crates.io/crates/actix-web-opentelemetry)
will automatically create [spans](/docs/concepts/signals/traces/#spans) and [metrics](/docs/concepts/signals/metrics) based on
the inbound HTTP requests.

You can find a list of available instrumentation libraries in the
[registry](/ecosystem/registry/?language=js&component=instrumentation).
---
title: Benchmarks
description: >-
  Performance trend of critical OpenTelemetry JavaScript SDK operations, per
  commit
weight: 101
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-js/benchmarks/data.js
---

The OpenTelemetry JavaScript SDK runs benchmark tests on every commit to the
[opentelemetry-js][] repository. The intent of these tests is to track the
performance trend of critical operations over time. These tests are not a
replacement for end-to-end performance testing.

This page charts the benchmark [data][]. For the full dashboard, see [JavaScript
Benchmarks][].

> [!TIP]
>
> In a chart below, hover over a point for its value and commit; click it for a
> link to the commit.

{{< benchmarks data_url="param:otel-benchmarks.data_url" >}}

<!-- prettier-ignore-start -->
[data]: <{{% _param otel-benchmarks.data_url %}}>
[JavaScript Benchmarks]: https://open-telemetry.github.io/opentelemetry-js/benchmarks/
[opentelemetry-js]: https://github.com/open-telemetry/opentelemetry-js/
<!-- prettier-ignore-end -->

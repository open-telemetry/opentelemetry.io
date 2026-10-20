---
title: Benchmarks
description: >-
  Performance trend of critical OpenTelemetry Python SDK operations, per commit
weight: 190
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-python/benchmarks/data.js
---

The OpenTelemetry Python SDK runs benchmark tests on every commit to the
[opentelemetry-python][] repository. The intent of these tests is to track the
performance trend of critical operations over time. These tests are not a
replacement for end-to-end performance testing.

This page charts the benchmark [data][]. For the full dashboard, see [Python
Benchmarks][].

> [!TIP]
>
> In a chart below, hover over a point for its value and commit; click it for a
> link to the commit.

{{< benchmarks data_url="param:otel-benchmarks.data_url" >}}

<!-- prettier-ignore-start -->
[data]: <{{% _param otel-benchmarks.data_url %}}>
[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python/
[Python Benchmarks]: https://open-telemetry.github.io/opentelemetry-python/benchmarks/
<!-- prettier-ignore-end -->

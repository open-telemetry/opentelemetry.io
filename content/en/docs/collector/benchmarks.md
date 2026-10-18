---
title: Benchmarks
description: Load-test results of the Collector, charted per commit
weight: 99
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js
---

The OpenTelemetry Collector runs load tests on every commit to the
[opentelemetry-collector-contrib][] repository. These load tests run the binary
of collector with various configuration options per test and send traffic
through the collector. For more details about the testing environment, see
[Testbed][].

This page charts a subset of the benchmark [data][]. For the full dashboard, see
[Collector Benchmarks][].

> [!TIP]
>
> In a chart below, hover over a point for its value and commit; click it for a
> link to the commit.

{{< benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " >}}

<!-- prettier-ignore-start -->
[Collector Benchmarks]: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/
[opentelemetry-collector-contrib]: https://github.com/open-telemetry/opentelemetry-collector-contrib/
[data]: <{{% _param otel-benchmarks.data_url %}}>
[Testbed]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/testbed#opentelemetry-collector-testbed
<!-- prettier-ignore-end -->

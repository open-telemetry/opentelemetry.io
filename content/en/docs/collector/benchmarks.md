---
title: Benchmarks
weight: 99
params:
  benchmark_data_url: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js
---

The OpenTelemetry Collector runs load tests on every commit to the
[opentelemetry-collector-contrib][] repository. These load tests run the binary
of collector with various configuration options per test and send traffic
through the collector. For more details about the testing environment, see
[TestBed][].

A subset of the [results][] are shown below. For all the results, see [Collector
Benchmarks][].

{{< benchmarks >}}

<!-- prettier-ignore-start -->
[Collector Benchmarks]: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/
[opentelemetry-collector-contrib]: https://github.com/open-telemetry/opentelemetry-collector-contrib/
[results]: <{{% _param benchmark_data_url %}}>
[TestBed]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/testbed#opentelemetry-collector-testbed
<!-- prettier-ignore-end -->

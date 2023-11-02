---
title: OTel component performance benchmarks
linkTitle: Performance benchmarks
date: 2023-11-01
author: '[Martin Kuba](https://github.com/martinkuba) (Lightstep)'
cSpell:ignore: Kuba
---

As more and more users are looking to use OpenTelemetry instrumentation in their
production deployments, one important consideration is the impact that
OpenTelemetry will have on their application performance. In this blog post I
will discuss a few recent improvements in tooling around performance
benchmarking. Measuring performance overhead Instrumentation is not free - it
intercepts an application's operations and collects (often) a large amount of
data, which takes additional CPU and memory. This can have a direct effect on
throughput and response time, which can affect the end-user experience with the
application. It can also have an impact on operational cost, e.g. increasing the
number of instances a service runs on.

Providing general guidance about performance overhead is inherently difficult.
There are many factors that affect performance: the application throughput,
hardware the application runs on, what exactly is instrumented, how the
OpenTelemetry SDK is configured, sampling etc. Ultimately the best way to
measure performance is in the context of the specific application, e.g. by
running a load test.

With that said a number of OpenTelemetry components include performance tests
that help catch regressions and can be used to provide some idea of their
performance characteristics.

### OpenTelemetry Collector

The OpenTelemetry Collector runs
[end-to-end load tests](https://github.com/open-telemetry/opentelemetry-collector-contrib/actions/workflows/load-tests.yml)
on every merge to the main branch. There have been two recent updates to the CI
workflow.

First, it has been updated to run on community-owned bare metal machines. This
makes the test results more consistent.

Secondly, the test results are now published automatically. A subset of the load
test results is available on the
[OpenTelemetry docs site](https://opentelemetry.io/docs/collector/benchmarks/).
And all test results are available on
[GitHub pages](https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/)
of the Collector repository.

### Language SDKs

A number of OpenTelemetry SDKs already include existing micro-benchmark tests,
for example:

- [SpanBenchmark.java](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/jmh/java/io/opentelemetry/sdk/trace/SpanBenchmark.java)
- [test_benchmark_trace.py](https://github.com/open-telemetry/opentelemetry-python/blob/main/opentelemetry-sdk/tests/performance/benchmarks/trace/test_benchmark_trace.py)
- [benchmark_test.go](https://github.com/open-telemetry/opentelemetry-go/blob/main/sdk/trace/benchmark_test.go)
- [benchmark/span.js](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-base/test/performance/benchmark/span.js)

These tests were run only on demand in the past. With the recent tooling
improvements, Java and JavaScript tests are now run automatically on every merge
to the main branch, and the results are published for anyone to easily access.
The tests are also run on community-owned bare metal machines, so that the
results are as consistent as possible.

Published
[benchmark results for Java](https://open-telemetry.github.io/opentelemetry-java/benchmarks/)
![Java benchmark results](java-benchmark-results.png 'Java benchmark results')

Published
[benchmark results for JavaScript](https://open-telemetry.github.io/opentelemetry-js/benchmarks/)
![JavaScript benchmark results](js-benchmark-results.png 'JavaScript benchmark results')

There is work in progress to make the same updates for Python and Go.

### Conclusion

Performance optimization is often considered only as an afterthought, but it
does not have to be. We are making improvements to automated tooling and
documentation to provide project maintainers and the community with reliable
performance testing during development. Ultimately our focus as a community is
to give end users confidence when using our components, especially around the
impact of OpenTelemetry's instrumentation on their applications’ performance.

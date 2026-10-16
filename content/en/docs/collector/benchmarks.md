---
title: Benchmarks
weight: 99
---

<link rel="stylesheet" href="/css/benchmarks.css">

The OpenTelemetry Collector runs load tests on every commit to the
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/)
repository. These load tests run the binary of collector with various
configuration options per test and send traffic through the collector.
Additional information regarding the testing environment can be found in the
[repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/testbed#opentelemetry-collector-testbed).

A subset of the results are shown below. For all the results, see
[Collector Benchmarks](https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/).

<!-- markdownlint-disable -->

<div class="container">
  <main id="main"></main>
</div>

<footer>
  <button id="dl-button">Download data as JSON</button>
  <div class="spacer"></div>
  <div class="small">Powered by <a rel="noopener"
      href="https://github.com/marketplace/actions/continuous-benchmark">github-action-benchmark</a></div>
</footer>

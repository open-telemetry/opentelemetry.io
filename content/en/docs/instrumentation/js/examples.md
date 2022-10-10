---
title: Instrumentation Examples
title: Examples
aliases: [/docs/instrumentation/js/instrumentation_examples]
weight: 99
---

Here are some of the resources for Opentelemetry instrumentation examples.

## Core Examples

The repository of the [JavaScript version of OpenTelemetry][repo] holds some
[examples][] of how to run real application with OpenTelemetry JavaScript.

[repo]: https://github.com/open-telemetry/opentelemetry-js
[examples]: https://github.com/open-telemetry/opentelemetry-js/tree/main/examples

## Plugin & Package Examples

Many of the packages and plugins at the [contributions repository][] for
OpenTelemetry JavaScript come with an usage example. You can find them in the
[examples folder][].

[contributions repository]: https://github.com/open-telemetry/opentelemetry-js-contrib
[examples folder]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/examples

## Community Resources

The [nodejs-opentelemetry-tempo][tempo] project illustrates the use of OpenTelemetry
(through automatic and manual instrumentation) involving microservices with DB
interactions. It uses the following:

- [Prometheus](https://prometheus.io), for monitoring and alerting
- [Loki](https://grafana.com/oss/loki/), for distributed logging
- [Tempo](https://grafana.com/oss/tempo/), for distributed tracing
- [Grafana](https://grafana.com/grafana/) for visualization

For more details, visit the [project repository][tempo].

[tempo]: https://github.com/mnadeem/nodejs-opentelemetry-tempo

---
title: Integrations
description: OpenTelemetry integrations with other open-source projects
aliases: [/integrations]
---

OpenTelemetry integrates with or is integrated into various open source projects.

## Within OpenTelemetry

OpenTelemetry provides integration with the following open source projects.

| External Project*                                         | OpenTelemetry Supported Components                       |
| ----------------                                          | ----------------------------------                       |
| [Apache Kafka](https://kafka.apache.org/)                 | Collector                                                |
| [Elasticsearch](https://github.com/elastic/elasticsearch) | Collector, C++, Java, Python                             |
| [Fluent Bit](https://fluentbit.io/)                       | Collector                                                |
| [Graphite](https://graphiteapp.org/)                      | Collector                                                |
| [Jaeger](https://www.jaegertracing.io/)                   | Collector, DotNet, Go, Java, JS, PHP, Python, Ruby, Rust |
| [OpenCensus](https://opencensus.io/)                      | Collector, Python                                        |
| [OpenTracing](https://opentracing.io/)                    | DotNet, Go, Java, JS, Python, Ruby
| [OpenMetrics](https://openmetrics.io/) [^partial-support] | Collector                                                |
| [Prometheus](https://prometheus.io/) [^partial-support]   | Collector, C++, Go, Java, JS, Rust                       |
| [Zipkin](https://zipkin.io/)                              | Collector, DotNet, Go, Java, JS, PHP, Python, Rust       |
| [W3C trace-context](https://www.w3.org/TR/trace-context/) | DotNet, Go, Java, JS, Python, Ruby                       |

_Projects are listed alphabetically_

## Outside OpenTelemetry

The following open source projects use OpenTelemetry components.

| External Project                                                                               | Applicable OpenTelemetry Components |
| ----------------                                                                               | ----------------------------------- |
| [Jaeger](https://www.jaegertracing.io/docs/1.21/opentelemetry/) [^not-ga]                      | Collector                           |
| [Spring Sleuth](https://github.com/spring-cloud-incubator/spring-cloud-sleuth-otel/) [^not-ga] | Java                                |


\* _Projects are listed alphabetically_.
[^partial-support]: Projects only partially supported at this time. Full support coming soon!
[^not-ga]: Projects offering experimental or beta support. GA support coming soon!

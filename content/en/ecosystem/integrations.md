---
title: Integrations
description: OpenTelemetry integrations with other open-source projects
aliases: [/integrations]
---

OpenTelemetry integrates with or is integrated into various open source
projects.

## Within OpenTelemetry

OpenTelemetry provides integration with the following open source projects.

| External Project\*                                        | OpenTelemetry Supported Components                       |
| --------------------------------------------------------- | -------------------------------------------------------- |
| [Apache Kafka](https://kafka.apache.org/)                 | Collector                                                |
| [Elasticsearch](https://github.com/elastic/elasticsearch) | Collector, C++, Java, Python                             |
| [Fluent Bit](https://fluentbit.io/)                       | Collector                                                |
| [Graphite](https://graphiteapp.org/)                      | Collector                                                |
| [Jaeger](https://www.jaegertracing.io/)                   | Collector, DotNet, Go, Java, JS, PHP, Python, Ruby, Rust |
| [OpenCensus](https://opencensus.io/)                      | Collector, Python                                        |
| [OpenTracing](https://opentracing.io/)                    | DotNet, Go, Java, JS, Python, Ruby                       |
| [OpenMetrics](https://openmetrics.io/) [^partial-support] | Collector                                                |
| [Prometheus](https://prometheus.io/) [^partial-support]   | Collector, C++, Go, Java, JS, Rust                       |
| [Zipkin](https://zipkin.io/)                              | Collector, DotNet, Go, Java, JS, PHP, Python, Rust       |
| [W3C trace-context](https://www.w3.org/TR/trace-context/) | DotNet, Go, Java, JS, Python, Ruby                       |

_Projects are listed alphabetically_

## Outside OpenTelemetry

The following open source projects use OpenTelemetry components.

| External Project                                                                           | Applicable OpenTelemetry Components |
| ------------------------------------------------------------------------------------------ | ----------------------------------- |
| [Docker buildx](https://github.com/docker/buildx/blob/master/docs/guides/opentelemetry.md) | Go                                  |
| [Jaeger](https://www.jaegertracing.io/docs/latest/opentelemetry/)                          | Collector                           |
| [Micrometer](https://micrometer.io/docs/tracing#_micrometer_tracing_opentelemetry_setup)   | Java                                |
| [Quarkus](https://quarkus.io/guides/opentelemetry)                                         | Java                                |

\* _Projects are listed alphabetically_. [^partial-support]: Projects only
partially supported at this time. Full support coming soon!

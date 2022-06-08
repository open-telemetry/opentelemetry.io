---
title: Integrations
---

{{% blocks/lead color="primary" %}}
# {{% param title %}}

OpenTelemetry integrates with or is integrated into various open source projects.
{{% /blocks/lead %}}

{{< row >}}
{{< column >}}
{{% blocks/section type="section" color="white" %}}

## Within OpenTelemetry

OpenTelemetry provides integration with the following open source projects.
<br/>

| External Project                                          | OpenTelemetry Supported Components                       |
| ----------------                                          | ----------------------------------                       |
| [Apache Kafka](https://kafka.apache.org/)                 | Collector                                                |
| [Elasticsearch](https://github.com/elastic/elasticsearch) | Collector, C++, Java, Python                             |
| [Fluent Bit](https://fluentbit.io/)                       | Collector                                                |
| [Graphite](https://graphiteapp.org/)                      | Collector                                                |
| [Jaeger](https://www.jaegertracing.io/)                   | Collector, DotNet, Go, Java, JS, PHP, Python, Ruby, Rust |
| [OpenCensus](https://opencensus.io/)                      | Collector, Python                                        |
| [OpenTracing](https://opentracing.io/)                    | DotNet, Go, Java, JS, Python, Ruby
| [OpenMetrics](https://openmetrics.io/)\*                  | Collector                                                |
| [Prometheus](https://prometheus.io/)\*                    | Collector, C++, Go, Java, JS, Rust                       |
| [Zipkin](https://zipkin.io/)                              | Collector, DotNet, Go, Java, JS, PHP, Python, Rust       |
| [W3C trace-context](https://www.w3.org/TR/trace-context/) | DotNet, Go, Java, JS, Python, Ruby                       |

\* Projects only partially supported at this time. Full support coming soon!

_Projects are listed alphabetically_
{{% /blocks/section %}}
{{< /column >}}
{{< column >}}
{{% blocks/section type="section" color="white" %}}

## Outside OpenTelemetry

The following open source projects use OpenTelemetry components.
<br/>

| External Project                                                                       | Applicable OpenTelemetry Components |
| ----------------                                                                       | ----------------------------------- |
| [Jaeger](https://www.jaegertracing.io/docs/1.21/opentelemetry/)\*                      | Collector                           |
| [Spring Sleuth](https://github.com/spring-cloud-incubator/spring-cloud-sleuth-otel/)\* | Java                                |

\* Projects offering experimental or beta support. GA support coming soon!

_Projects are listed alphabetically_
{{% /blocks/section %}}
{{< /column >}}
{{< /row >}}

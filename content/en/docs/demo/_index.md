---
title: OpenTelemetry Demo Documentation
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
---

Welcome to the OpenTelemetry Demo! This folder contains overall documentation
for the project, how to install and run it, and some scenarios you can use to
view OpenTelemetry in action.

## Running the Demo

Want to deploy the demo and see it in action? Start here.

- [Docker]({{% relref "./docker_deployment.md" %}})
- [Kubernetes]({{% relref "./kubernetes_deployment.md" %}})

## Language Feature Reference

Want to understand how a particular language's instrumentation works? Start
here.

| Language      | Auto Instrumentation                                                                                                                                                       | Manual Instrumentation                                                                                              |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| .NET          | [Cart Service]({{% relref "services/cartservice/" %}})                                                                                                                                  | [Cart Service]({{% relref "services/cartservice/" %}})                                                                           |
| C++           |                                                                                                                                                                            | [Currency Service]({{% relref "services/currencyservice/" %}})                                                                   |
| Erlang/Elixir | [Feature Flag Service]({{% relref "services/featureflagservice/" %}})                                                                                                                   | [Feature Flag Service]({{% relref "services/featureflagservice/" %}})                                                            |
| Go            | [Accounting Service]({{% relref "services/accountingservice/" %}}), [Checkout Service]({{% relref "services/checkoutservice/" %}}), [Product Catalog Service]( services/productcatalogservice/ ) | [Checkout Service]({{% relref "services/checkoutservice/" %}}), [Product Catalog Service]( services/productcatalogservice/ ) |
| Java          | [Ad Service]({{% relref "services/adservice/" %}})                                                                                                                                      | [Ad Service]({{% relref "services/adservice/" %}})                                                                               |
| JavaScript    | [Frontend]( services/frontend/ )                                                                                                                                       | [Frontend]({{% relref "services/frontend/" %}}), [Payment Service]({{% relref "services/paymentservice/" %}})                                 |
| Kotlin        | [Fraud Detection Service]( services/frauddetectionservice/ )                                                                                                           |                                                                                                                     |
| PHP           | [Quote Service]({{% relref "services/quoteservice/" %}})                                                                                                                                | [Quote Service]({{% relref "services/quoteservice/" %}})                                                                         |
| Python        | [Recommendation Service]({{% relref "services/recommendationservice/" %}})                                                                                                              | [Recommendation Service]({{% relref "services/recommendationservice/" %}})                                                       |
| Ruby          | [Email Service]({{% relref "services/emailservice/" %}})                                                                                                                                | [Email Service]({{% relref "services/emailservice/" %}})                                                                         |
| Rust          | [Shipping Service]({{% relref "services/shippingservice/" %}})                                                                                                                          | [Shipping Service]({{% relref "services/shippingservice/" %}})                                                                   |

## Service Documentation

Specific information about how OpenTelemetry is deployed in each service can be
found here:

- [Ad Service]({{% relref "services/adservice/" %}})
- [Cart Service]({{% relref "services/cartservice/" %}})
- [Checkout Service]({{% relref "services/checkoutservice/" %}})
- [Email Service]({{% relref "services/emailservice/" %}})
- [Feature Flag Service]({{% relref "services/featureflagservice/" %}})
- [Frontend]({{% relref "services/frontend/" %}})
- [Load Generator]({{% relref "services/loadgenerator/" %}})
- [Payment Service]({{% relref "services/paymentservice/" %}})
- [Product Catalog Service]({{% relref "services/productcatalogservice/" %}})
- [Quote Service]({{% relref "services/quoteservice/" %}})
- [Recommendation Service]({{% relref "services/recommendationservice/" %}})
- [Shipping Service]({{% relref "services/shippingservice/" %}})

## Scenarios

How can you solve problems with OpenTelemetry? These scenarios walk you through
some pre-configured problems and show you how to interpret OpenTelemetry data to
solve them.

We'll be adding more scenarios over time.

- Generate a [Product Catalog error]({{% relref "feature_flags.md" %}}) for `GetProduct` requests
  with product id: `OLJCESPC7Z` using the Feature Flag service
- Discover a memory leak and diagnose it using metrics and traces. [Read more]({{% relref "./scenarios/recommendation_cache.md" %}})

## Reference

Project reference documentation, like requirements and feature matrices.

- [Architecture]({{% relref "./current_architecture.md" %}})
- [Development]({{% relref "./development.md" %}})
- [Feature Flags Reference]({{% relref "./feature_flags.md" %}})
- [Metric Feature Matrix]({{% relref "./metric_service_features.md" %}})
- [Requirements](./requirements/)
- [Screenshots]({{% relref "./demo_screenshots.md" %}})
- [Service Roles Table]({{% relref "./service_table.md" %}})
- [Span Attributes Reference]({{% relref "./manual_span_attributes.md" %}})
- [Tests]({{% relref "./tests.md" %}})
- [Trace Feature Matrix]({{% relref "./trace_service_features.md" %}})

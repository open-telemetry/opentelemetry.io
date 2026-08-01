---
title: How to Name Your Metrics
linkTitle: How to Name Your Metrics
date: 2025-09-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-metrics
# prettier-ignore
cSpell:ignore: Aggregable apiserver ecommerce jpkrohling kubelet mebibytes OllyGarden postgres scheduler UCUM
---

Metrics are the quantitative backbone of observability—the numbers that tell us
how our systems are performing. This is the third post in our OpenTelemetry
naming series, where we've already explored
[how to name spans](/blog/2025/how-to-name-your-spans/) and
[how to enrich them with meaningful attributes](/blog/2025/how-to-name-your-span-attributes/).
Now let's tackle the art of naming the measurements that matter.

Unlike spans that tell stories about what happened, metrics tell us about
quantities: how many, how fast, how much. But here's the thing—naming them well
is just as crucial as naming spans, and the principles we've learned apply here
too. The "who" still belongs in attributes, not names.

## Learning from traditional systems

Before diving into OpenTelemetry best practices, let's examine how traditional
monitoring systems handle metric naming. Take Kubernetes, for example. Its
metrics follow patterns like:

- `apiserver_request_total`
- `scheduler_schedule_attempts_total`
- `container_cpu_usage_seconds_total`
- `kubelet_volume_stats_used_bytes`

Notice the pattern? **Component name + resource + action + unit**. The service
or component name is baked right into the metric name. This approach made sense
in simpler data models where you had limited options for storing context.

But this creates several problems:

- **Cluttered observability backend**: Every component gets its own metric
  namespace, making it harder to find the right metric among dozens or hundreds
  of similarly-named metrics.
- **Inflexible aggregation**: It's difficult to sum metrics across different
  components.
- **Vendor lock-in**: Metric names become tied to specific implementations.
- **Maintenance overhead**: Adding new services requires new metric names.

## The core anti-pattern: Service names in metric names

Here's the most important principle for OpenTelemetry metrics: **Don't include
your service name in the metric name**.

Let's say you have a payment service. You might be tempted to create metrics
like:

- `payment.transaction.count`
- `payment.latency.p95`
- `payment.error.rate`

Don't do this. The service name is already available as context through the
`service.name` resource attribute. Instead, use:

- `transaction.count` with `service.name=payment`
- `http.server.request.duration` with `service.name=payment`
- `error.rate` with `service.name=payment`

Why is this better? Because now you can easily aggregate across all services:

```promql
sum(transaction.count)  // All transactions across all services
sum(transaction.count{service.name="payment"})  // Just payment transactions
```

If every service had its own metric name, you'd need to know every service name
to build meaningful dashboards. With clean names, one query works for
everything.

## OpenTelemetry's rich context model

OpenTelemetry metrics benefit from the same
[rich context model](/docs/specs/otel/common/#attribute) we discussed in our
span attributes article. Instead of forcing everything into the metric name, we
have multiple layers where context can live:

### Traditional approach (Prometheus style):

```promql
payment_service_transaction_total{method="credit_card",status="success"}
user_service_auth_latency_milliseconds{endpoint="/login",region="us-east"}
inventory_service_db_query_seconds{table="products",operation="select"}
```

### OpenTelemetry approach:

```yaml
transaction.count
- Resource: service.name=payment, service.version=1.2.3, deployment.environment.name=prod
- Scope: instrumentation.library.name=com.acme.payment, instrumentation.library.version=2.1.0
- Attributes: method=credit_card, status=success

auth.duration
- Resource: service.name=user, service.version=2.0.1, deployment.environment.name=prod
- Scope: instrumentation.library.name=express.middleware
- Attributes: endpoint=/login, region=us-east
- Unit: ms

db.client.operation.duration
- Resource: service.name=inventory, service.version=1.5.2
- Scope: instrumentation.library.name=postgres.client
- Attributes: db.sql.table=products, db.operation=select
- Unit: s
```

This three-layer separation follows the OpenTelemetry specification's **Events →
Metric Streams → Timeseries** model, where context flows through multiple
hierarchical levels rather than being crammed into names.

## Units: Keep them out of names too

Just like we learned that service names don't belong in metric names, **units
don't belong there either**.

Traditional systems often include units in the name because they lack proper
unit metadata:

- `response_time_milliseconds`
- `memory_usage_bytes`
- `throughput_requests_per_second`

OpenTelemetry treats units as metadata, separate from the name:

- `http.server.request.duration` with unit `ms`
- `system.memory.usage` with unit `By`
- `http.server.request.rate` with unit `{request}/s`

This approach has several benefits:

1. **Clean names**: No ugly suffixes cluttering your metric names.
2. **Standardized units**: Follow the
   [Unified Code for Units of Measure (UCUM)](/docs/specs/semconv/general/metrics/#instrument-units).
3. **Backend flexibility**: Systems can handle unit conversion automatically.
4. **Consistent conventions**: Aligns with OpenTelemetry
   [semantic conventions](/docs/specs/semconv/general/metrics/).

The specification recommends using non-prefixed units like `By` (bytes) rather
than `MiBy` (mebibytes) unless there are technical reasons to do otherwise.

## Practical naming guidelines

When creating metric names, apply the same `{verb} {object}` principle we
learned for spans, where it makes sense:

1. **Focus on the operation**: What is being measured?
2. **Not the operator**: Who is doing the measuring?
3. **Follow semantic conventions**: Use
   [established patterns](/docs/specs/semconv/general/metrics/) when available.
4. **Keep units as metadata**: Don't suffix names with units.

Here are examples following OpenTelemetry
[semantic conventions](/docs/specs/semconv/general/metrics/):

- `http.server.request.duration` (not `payment_http_requests_ms`)
- `db.client.operation.duration` (not `user_service_db_queries_seconds`)
- `messaging.client.sent.messages` (not `order_service_messages_sent_total`)
- `transaction.count` (not `payment_transaction_total`)

## Real-world migration examples

| Traditional (Context + units in name) | OpenTelemetry (Clean separation)                                             | Why it's better                               |
| :------------------------------------ | :--------------------------------------------------------------------------- | :-------------------------------------------- |
| `payment_transaction_total`           | `transaction.count` + `service.name=payment` + unit `1`                      | Aggregable across services                    |
| `user_service_auth_latency_ms`        | `auth.duration` + `service.name=user` + unit `ms`                            | Standard operation name, proper unit metadata |
| `inventory_db_query_seconds`          | `db.client.operation.duration` + `service.name=inventory` + unit `s`         | Follows semantic conventions                  |
| `api_gateway_requests_per_second`     | `http.server.request.rate` + `service.name=api-gateway` + unit `{request}/s` | Clean name, proper rate unit                  |
| `redis_cache_hit_ratio_percent`       | `cache.hit_ratio` + `service.name=redis` + unit `1`                          | Ratios are unitless                           |

## Benefits of clean naming

Separating context from metric names provides specific technical advantages that
improve both query performance and operational workflows. The first benefit is
cross-service aggregation. A query like `sum(transaction.count)` returns data
from all services without requiring you to know or maintain a list of service
names. In a system with 50 microservices, this means one query instead of 50,
and that query doesn't break when you add the 51st service.

This consistency makes dashboards reusable across services. A dashboard built
for monitoring HTTP requests in your authentication service works without
modification for your payment service, inventory service, or any other
HTTP-serving component. You write the query once—`http.server.request.duration`
filtered by `service.name`—and apply it everywhere. No more maintaining dozens
of nearly identical dashboards. Some observability vendors now take this
further, automatically generating dashboards based on semantic convention metric
names—when your services emit `http.server.request.duration`, the platform knows
exactly what visualizations and aggregations make sense for that metric.

Clean naming also reduces metric namespace clutter. Consider a platform with
dozens of services each defining their own metrics. With traditional naming,
your metric browser shows hundreds of service-specific variations:
`apiserver_request_total`, `payment_service_request_total`,
`user_service_request_total`, `inventory_service_request_total`, and so on.
Finding the right metric becomes an exercise in scrolling and searching through
redundant variations. With clean naming, you have one metric name
(`request.count`) with attributes capturing the context. This makes metric
discovery straightforward—you find the measurement you need, then filter by the
service you care about.

Unit handling becomes systematic when units are metadata rather than name
suffixes. Observability platforms can perform unit conversions
automatically—displaying the same duration metric as milliseconds in one graph
and seconds in another, based on what makes sense for the visualization. The
metric remains `request.duration` with unit metadata `ms`, not two separate
metrics `request_duration_ms` and `request_duration_seconds`.

The approach also ensures compatibility between manual and automatic
instrumentation. When you follow semantic conventions like
`http.server.request.duration`, your custom metrics align with those generated
by auto-instrumentation libraries. This creates a consistent data model where
queries work across both manually and automatically instrumented services, and
engineers don't need to remember which metrics come from which source.

## Common pitfalls to avoid

Engineers often embed deployment-specific information directly into metric
names, creating patterns like `user_service_v2_latency`. This breaks when
version 3 deploys—every dashboard, alert, and query that references the metric
name must be updated. The same problem occurs with instance-specific names like
`node_42_memory_usage`. In a cluster with dynamic scaling, you end up with
hundreds of distinct metric names that represent the same measurement, making it
impossible to write simple aggregation queries.

Environment-specific prefixes cause similar maintenance problems. With metrics
named `prod_payment_errors` and `staging_auth_count`, you can't write a single
query that works across environments. A dashboard that monitors production can't
be used for staging without modification. When you need to compare metrics
between environments—a common debugging task—you have to write complex queries
that explicitly reference each environment's metric names.

Technology stack details in metric names create future migration headaches. A
metric named `nodejs_payment_memory` becomes misleading when you rewrite the
service in Go. Similarly, `postgres_user_queries` requires renaming if you
migrate to something else. These technology-specific names also prevent you from
writing queries that work across services using different tech stacks, even when
they perform the same business function.

Mixing business domains with infrastructure metrics violates the separation
between what a system does and how it does it. A metric like
`ecommerce_cpu_usage` conflates the business purpose (e-commerce) with the
technical measurement (CPU usage). This makes it harder to reuse infrastructure
monitoring across different business domains and complicates multi-tenant
deployments where the same infrastructure serves multiple business functions.

The practice of including units in metric names—`latency_ms`, `memory_bytes`,
`count_total`—creates redundancy now that OpenTelemetry provides proper unit
metadata. It also prevents automatic unit conversion. With `request_duration_ms`
and `request_duration_seconds` as separate metrics, you need different queries
for different time scales. With a single `request.duration` metric that includes
unit metadata, the observability platform handles conversion automatically.

The pattern is clear: context that varies by deployment, instance, environment,
or version belongs in attributes, not in the metric name. The metric name should
identify what you're measuring. Everything else—who's measuring it, where it's
running, which version it is—goes in the attribute layer where it can be
filtered, grouped, and aggregated as needed.

## Cultivating better metrics

Just like the spans we covered earlier in this series, well-named metrics are a
gift to your future self and your team. They provide clarity during incidents,
enable powerful cross-service analysis, and make your observability data truly
useful rather than just voluminous.

The key insight is the same one we learned with spans: **separation of
concerns**. The metric name describes what you're measuring. The context—who's
measuring it, where, when, and how—lives in the rich attribute hierarchy that
OpenTelemetry provides.

In our next post, we'll dive deep into **metric attributes**—the context layer
that makes metrics truly powerful. We'll explore how to structure the rich
contextual information that doesn't belong in names, and how to balance
informativeness with cardinality concerns.

Until then, remember: a clean metric name is like a well-tended garden path—it
leads you exactly where you need to go.

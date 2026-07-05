---
title: 'Metric cardinality limits in OpenTelemetry: a practical guide'
linkTitle: Metric cardinality limits
date: 2026-06-29
author: >-
  [Cijo Thomas](https://github.com/cijothomas) (Microsoft)
issue: 9943
sig: Metrics
# canonical_url: https://...   # add if cross-posted from another blog
cSpell:ignore: Cijo cijothomas max
---

OpenTelemetry metrics are designed to be safe to use in production. One part of
that safety is the **cardinality limit** in the metrics SDK. The limit protects
your process from unbounded memory growth when a metric receives too many unique
attribute combinations.

That protection is useful, but it has a consequence many users do not expect:
when a metric stream overflows, the total value remains correct, while queries
that filter or group by attributes can undercount. This can affect dashboards,
service-level objectives (SLOs), and alerts that looked correct before overflow
started.

The metrics concept docs now have a
[Cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits) section
that explains the SDK behavior in detail. This post is the operational companion
to that documentation. It explains what the limit means in practice, why every
attribute on an overflowed measurement is affected, how to choose a reasonable
limit, how to check whether you already hit it, and how to monitor for it in
production.

## The basic model

When you record a metric measurement, you can attach attributes such as
`url.path=/checkout`, `http.request.method=GET`, or `success=false`. The SDK
aggregates measurements by the full set of attribute values. Each unique
attribute combination becomes a separate data point that the SDK tracks in
memory.

For example, this request counter has four unique combinations:

| `url.path` | `success` | Count |
| ---------- | --------- | ----- |
| `/home`    | `true`    | 130   |
| `/home`    | `false`   | 2     |
| `/cart`    | `true`    | 50    |
| `/cart`    | `false`   | 1     |

That is cardinality 4 for this metric stream. If you add a high-cardinality
attribute such as `user_id`, the number of combinations can grow very quickly.
That is why the SDK enforces a limit. The default aggregation cardinality limit
is 2000 combinations per metric stream.

When the limit is reached, additional combinations are not dropped. Their values
are folded into a single overflow data point marked with
`otel.metric.overflow=true`. The important detail is that the original
measurement attributes are removed from the overflow data point.

So if this measurement overflows:

```text
{url.path=/checkout, success=false} 1
```

the exported value becomes part of:

```text
{otel.metric.overflow=true} 1
```

The total count is still correct. A query for total requests still sees the
value. But a query for `success=false` does not, because the overflow data point
does not carry `success=false`.

This is the part worth remembering: overflow affects the **whole attribute
combination**, not only the attribute that caused high cardinality. Even a
low-cardinality attribute, such as a boolean `success`, becomes unreliable for
filtering and grouping once its measurements are folded into overflow.

## The production implications

The cardinality limit is a process memory protection mechanism. It is not a
general guarantee that all metric breakdowns remain queryable, and it is not a
backend cardinality limit.

Three implications matter most in production:

1. **Totals stay correct, but attribute breakdowns can undercount.** Any query
   that filters or groups by a measurement attribute can miss values that were
   folded into overflow.
2. **Every measurement attribute is affected.** If one combination overflows,
   all measurement attributes on that combination are removed from the exported
   data point.
3. **The SDK cap does not bound backend cardinality.** With delta temporality, a
   process can export different combinations in different collection cycles. A
   fleet of 1000 pods, each with a limit of 2000, can still produce many more
   than 2000 backend series over time.

Resource attributes and instrumentation scope attributes are different. They are
not part of the measurement attribute set that is replaced by overflow, so they
remain queryable on every data point, including the overflow data point. That is
not a workaround for high-cardinality measurement attributes. It is just another
reason to model attributes correctly: Resource attributes describe the entity
producing telemetry, instrumentation scope attributes describe the instrumenting
library, and measurement attributes describe the individual measurement.

## How to choose an appropriate limit

The right limit is large enough for the metric's intended dimensions, but small
enough that accidental high-cardinality attributes become visible before they
create a large memory or backend-cardinality problem.

Before raising a limit, first ask whether the attributes belong on the metric at
all:

- Raw URLs, user input, request IDs, session IDs, and unbounded error messages
  usually should not be metric attributes.
- Route templates, status codes, HTTP methods, and bounded error categories are
  usually safer metric attributes.
- If an attribute is useful for logs or traces but not for metric aggregation,
  remove it from the metric stream with a
  [View](/docs/concepts/signals/metrics/#views) or fix the instrumentation
  upstream.

If the attributes are intentional, size the limit based on the combinations you
expect the SDK to hold at the same time.

| Situation                                                      | How to estimate the limit                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Synchronous cumulative temporality**                         | Estimate the maximum number of combinations the process can see during its lifetime. For example, 100 known routes x 5 methods x 2 success values = 1000 combinations. Set the limit above that, with headroom.                                                        |
| **Synchronous delta temporality, bounded dimensions**          | Use the same estimate as cumulative. Delta collection does not help much when the total set is already small and bounded.                                                                                                                                              |
| **Synchronous delta temporality, high-cardinality dimensions** | Estimate the active combinations per collection cycle, not the total possible population. For example, 1 million possible tenants x 2 success values is too large as a lifetime set, but 5000 active tenants in a 60-second cycle is about 10,000 active combinations. |
| **Unknown active set**                                         | Use request rate as an upper bound: `max_requests_per_second x collection_interval_seconds`, then multiply by the bounded dimensions you keep. This is crude, but useful when you cannot estimate the active key set directly.                                         |

A limit that is too low causes overflow for valid dimensions, which makes
filtered queries unreliable. A limit that is too high weakens the safety net. A
cardinality leak can grow much larger before overflow appears, and some SDKs may
also allocate more memory as the configured limit increases.

### When high cardinality is intentional

The default advice is to avoid high-cardinality metric attributes. That advice
is correct for most metrics, but not all of them.

For example, a service with per-tenant SLOs (service-level objectives) may need
`tenant_id` on a metric to answer "what is tenant X's failure rate?" Removing
the tenant dimension would make the metric cheaper, but also less useful.

Delta temporality can make this case practical when the active set is bounded.
Suppose you have 1 million tenants, but only 5000 tenants are active in a
60-second collection cycle. If the metric records `tenant_id` and `success`, the
active set is about `5000 x 2 = 10,000` combinations per cycle. A limit slightly
above that, with burst headroom, can be reasonable for delta temporality.

The same setup with cumulative temporality is very different. The process keeps
aggregation state across cycles, so it accumulates tenants over time. A
high-cardinality tenant dimension that is safe under delta temporality can be a
guaranteed overflow path under cumulative temporality.

The rule of thumb: use high-cardinality metric attributes only when the
dimension is operationally necessary, the active set is bounded, the limit is
chosen deliberately, and overflow is monitored.

## How to check whether you already hit the limit

The overflow data point is marked with the attribute
`otel.metric.overflow=true`. Prometheus-compatible exporters commonly replace
dots in attribute names with underscores for label compatibility, so this is
usually exposed as the label `otel_metric_overflow="true"`.

To find metrics that emitted an overflow data point in the last 30 days:

```promql
count by (__name__, job) (
  last_over_time({otel_metric_overflow="true"}[30d])
)
```

This returns metric and service pairs where overflow occurred. For Prometheus
native OTLP ingestion, `service.name` is commonly represented by the `job`
label. If your setup promotes `service.name` as a resource attribute, use
`service_name` instead. Adjust the grouping labels to match your environment.
For example, add `cluster`, `namespace`, or `service_instance_id` if those
labels are present and useful.

For OTLP-native backends, write the equivalent query in the backend's query
language: filter on `otel.metric.overflow = true`, then group by metric name and
`service.name`.

For each result:

1. Identify the metric stream. The metric name tells you which metric
   overflowed, and the service labels tell you where it happened.
2. Inspect the metric's measurement attributes. Look for unbounded attributes
   such as raw paths, IDs, user input, or error messages.
3. Decide whether the dimensions are intentional.
4. If they are not intentional, drop or normalize the offending attribute.
5. If they are intentional, choose a limit using the sizing approach above.

If the query returns nothing, that is a useful baseline, but not a proof that
all metrics are safe. Your SDK may not implement cardinality limits, the
overflow may have happened outside your retention window, or your backend may
not expose the attribute in the way you expect. If your SDK does not support
cardinality limits, watch process memory carefully for high-cardinality metric
streams. The [spec compliance matrix][spec-compliance] can help you check SDK
support.

## How to monitor for this continuously

Overflow usually appears after a change: a route template stops being applied,
an instrumentation library adds an attribute, a new code path starts recording
user input, or traffic changes in a way that activates many more combinations
than usual.

A one-time audit is useful, but production systems need continuous monitoring.
At minimum, alert when any metric in any service emits an overflow data point:

```promql
count by (__name__, job) (
  last_over_time({otel_metric_overflow="true"}[5m])
) > 0
```

Tune the window and grouping labels for your environment. For a large fleet, you
may want separate severities:

- Page when overflow appears on metrics used for paging, SLOs, autoscaling, or
  critical dashboards.
- Ticket when overflow appears on exploratory or low-priority metrics.

Dashboards should also make overflow visible. If a chart filters or groups by a
measurement attribute, consider adding an overflow indicator beside the chart.
That tells readers whether the breakdown is complete or whether some values were
folded into overflow. [Aspire issue #7520][aspire-7520] shows one possible shape
for this in a developer dashboard.

## What to do when overflow appears

Treat overflow as a signal to inspect the metric, not as an automatic reason to
raise the limit.

Use this decision flow:

1. **Is the overflowing attribute unbounded or accidental?** Drop it with a
   View, normalize it, or fix the instrumentation. Examples include raw paths,
   request IDs, user input, and raw exception messages.
2. **Is the attribute bounded but the limit is too low?** Raise the configured
   limit enough to cover the expected combinations, with headroom. This usually
   requires a code or configuration change and a redeploy.
3. **Is the attribute high-cardinality but intentional?** Prefer delta
   temporality when possible, size for the active set, and keep the overflow
   alert in place.

The goal is not to avoid overflow at all costs. The goal is to make overflow
rare, visible, and meaningful.

## FAQ

**Does this only apply to counters?** No. Cardinality limits apply to metric
streams created from counters, histograms, gauges, and asynchronous instruments.
This post uses counters because they make the examples easier to read.

**Does overflow mean measurements were lost?** No. The values are still included
in the overflow data point. What is lost is the original measurement attribute
set, which is why filtered and grouped queries can undercount.

## Further reading

- [Cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits): full
  concept documentation, including what's exempt from the limit and how
  temporality affects it
- [OpenTelemetry Metrics SDK specification: Cardinality
  Limits][spec-cardinality]
- [Metrics That Lie: Understanding OpenTelemetry's Cardinality Capping and Its Implications](https://youtu.be/QTeA16I_hME),
  my KubeCon EU 2026 lightning talk

[aspire-7520]: https://github.com/microsoft/aspire/issues/7520
[spec-cardinality]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/specification/metrics/sdk.md#cardinality-limits
[spec-compliance]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/spec-compliance-matrix.md

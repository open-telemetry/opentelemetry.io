---
title: >-
  Cardinality Limits in OpenTelemetry — When Your Metrics Lie, and What to Do
  About It
linkTitle: Cardinality Limits in OpenTelemetry
date: 2026-06-29
author: >-
  [Cijo Thomas](https://github.com/cijothomas) (Microsoft)
issue: 9943
sig: Metrics
# canonical_url: https://...   # add if cross-posted from another blog
cSpell:ignore: Aspire cardinality Cijo cijothomas overflows
---

You query your metrics for error count — it says **zero**. The error rate panel
is flat. The dashboard looks fine.

But users are reporting failures. Logs confirm errors. Your application has been
instrumented with OpenTelemetry the whole time. So where did the errors go?

This post is about a deliberate piece of the OpenTelemetry metrics SDK design —
the **cardinality limit** — which may already be affecting one of your
dashboards without you noticing.

## The short version

Every metric measurement in OpenTelemetry can carry attributes — key-value pairs
like `url.path=/home` or `success=true`. The SDK tracks a separate data point in
memory for each unique combination of attribute values, so memory grows with the
number of combinations, not with request volume. To keep that memory bounded,
the SDK enforces a **cardinality limit** (default **2000** combinations per
metric stream). Once the limit is reached, any further combination is folded
into a single **overflow data point** marked `otel.metric.overflow=true`: the
value is preserved, so totals stay correct, but the original attributes are
gone.

That last part is what surprises people: overflow drops the **entire** attribute
combination, not just the high-cardinality part. If a request counter records
`url.path` (high cardinality) together with `success` (a boolean), once the
stream overflows, both are dropped together — so a query filtering on
`success=false` can return zero, even though `success` alone is about as
low-cardinality as an attribute can get. **An error-rate alert built on
`success=false` can silently stop firing.**

Two more things are worth knowing before you size or monitor this yourself: who
gets to keep their slot, and what the cap does and doesn't protect.

Most SDKs fill the limit **first-come, first-served**, so whatever hits the
instrument first — a startup burst, a security scanner probing routes — can
occupy every slot for the process lifetime under cumulative temporality.

The cap also only bounds what one process holds in memory; it doesn't bound what
reaches your backend. With delta temporality, each collection cycle can export a
_different_ set of combinations, so a fleet of 1000 pods with a 2000 cap can
still produce up to 2 million backend series. **The SDK cap protects your
application from OOM, not your backend from high cardinality.**

For the full mechanics — the overflow bucket, what's exempt from the limit
(Resource and instrumentation scope attributes), and how temporality changes how
forgiving the cap is — see
[Cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits) in the
metrics concept docs. The rest of this post is the operational playbook: how to
size the limit, an advanced technique for high-cardinality attributes, and what
to go do about it this week. If you just want to check whether you're already
affected, skip ahead to
[Action 1](#action-1-check-whether-youve-already-been-affected).

## Sizing the limit

The default of 2000 covers most well-designed instruments. If you need to
override it (via a [View](/docs/concepts/signals/metrics/#views), which lets you
customize how an instrument's measurements are aggregated), the costs run in
both directions:

- **Limit too high**: some SDKs (notably .NET and Rust) preallocate memory based
  on the limit, so the excess is allocated upfront and sits unused. Other SDKs
  grow on demand.
- **Limit too low**: measurements get folded into overflow, and filtered queries
  become unreliable.

A short heuristic, by temporality (synchronous instruments):

| Temporality                               | How to size                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cumulative**                            | Estimate the _theoretical maximum_ combinations across the lifetime of the process. For example, an HTTP counter with 100 known routes x 5 methods x 2 success values = 1000. Set the limit slightly above. If certain combinations are physically impossible, subtract them.                                                                           |
| **Delta** (low-cardinality attributes)    | Same as cumulative — per-cycle isolation doesn't help when the attribute set is already small.                                                                                                                                                                                                                                                          |
| **Delta** (high-cardinality attributes)   | Estimate the _active_ distinct combinations per cycle, not lifetime. Example: 1 million possible users x 2 success values gives 2 million possible combinations, but if only ~10,000 users are active per cycle the active set is ~20,000. Set the limit ~2x that for burst headroom (~40,000). This is where Delta makes a meaningful difference.      |
| **Delta** (request-rate-bounded fallback) | When you can't estimate active users, use `max_requests_per_second x collection_interval_seconds` (the OTel collection/export interval) as a guaranteed upper bound. 500 req/sec x 60 sec = 30,000. Shortening the collection interval directly shrinks the per-cycle working set, so a shorter interval lets you safely use a lower cardinality limit. |

## When high-cardinality attributes are actually the right answer

The conventional wisdom is "never put `user_id` or `tenant_id` in metric
attributes." Good default advice, but not universal: **per-tenant SLOs**
(service-level objectives) require tenant identity on the metric to answer
questions like "what is tenant X's failure rate?" Aggregating it away defeats
the purpose.

**Delta temporality makes this work.** Delta forgets state after each collection
cycle, so the cap covers "active combinations _per cycle_", not "ever seen". As
long as the concurrent active set stays below the limit, the total population
can be orders of magnitude larger.

Worked example: 1 million tenants, but only ~5,000 active per 60-second cycle.
Set the limit to roughly `5,000 x 2 = 10,000` (with headroom for bursts). The
backend sees the full long-tail over time, but the SDK process never stores more
than the per-cycle working set.

> **Rule of thumb:** with delta + a deliberate limit, you only overflow when the
> _concurrent_ active key-set exceeds the limit. The total population doesn't
> matter.

Three caveats:

1. **Cumulative temporality on the same instrument doesn't work.** Once a
   tenant's combination is tracked, it stays tracked for the process lifetime;
   you accumulate every tenant ever active. Cumulative + per-tenant is a
   guaranteed path to overflow.
2. **A traffic spike that activates many more tenants than usual will still
   cause overflow** for that cycle. Set the limit with headroom for realistic
   bursts, and treat sustained overflow on these instruments as a real
   operational signal.
3. **Shorter export intervals reduce the per-cycle working set** — halving the
   interval can roughly halve the active combinations per cycle. The tradeoff is
   increased CPU and network overhead from more frequent exports.

The general principle: **under delta temporality the cardinality limit is a
per-cycle working set; under cumulative temporality it accumulates until the
process restarts.**

## Two things to do this week

### Action 1: Check whether you've already been affected

The overflow attribute value is the boolean `true`. Prometheus represents it as
the string `"true"`; OTLP-native backends preserve the boolean type. Also note
that Prometheus sanitizes attribute names on ingestion, replacing dots with
underscores, so `otel.metric.overflow` becomes the label `otel_metric_overflow`
in PromQL — the queries below use the Prometheus form.

**Prometheus / PromQL** — find every metric in your fleet that emitted an
overflow data point within your retention window:

```promql
count by (__name__, service_name)(
  present_over_time({otel_metric_overflow="true"}[30d])
)
```

This returns the list of `(metric_name, service_name)` pairs where overflow has
occurred. Adjust the grouping labels to match your deployment (e.g., add
`cluster`, `namespace`).

**Other backends** — write the equivalent query in your backend's query
language: filter on the attribute `otel.metric.overflow = true` and group by
metric name and `service.name`.

**For each metric the query returns:**

1. **The metric name tells you what was affected.** For example,
   `http.server.duration` in the overflow list means that metric has been
   undercounting filtered queries.
2. **The `service.name` tells you which service is affected.** Cross-check
   against fleet topology: is it isolated to one service, or showing up across
   many? To narrow down to a specific replica, group by `service.instance.id` as
   well.
3. **Apply the fix.** Either drop the offending attribute via a
   [View](/docs/concepts/signals/metrics/#views) (cleanest if the attribute
   isn't worth its cardinality cost), raise the configured limit (a code or
   config change requiring a redeploy — not a runtime toggle; buys time while a
   fix is in flight), or fix the attribute upstream with templated routes,
   normalized error categories, etc. (the long-term fix). On cumulative
   temporality, the process keeps folding new combinations into overflow until
   it restarts — so a restart after the fix ships is what gets the named series
   back.

If the query returns nothing within your retention window, either no instrument
in your fleet has hit its cap in that window — a useful baseline — or your SDK
doesn't implement cardinality limits yet. At the time of writing, .NET, C++, Go,
Java, JavaScript, and Rust all implement the cap (default: 2000); check the
[spec compliance matrix][spec-compliance] for your SDK. If your SDK doesn't
support it, the process can hold unbounded state and OOM-kill under a
cardinality leak — watch process memory carefully.

### Action 2: Monitor for overflow continuously

Cardinality issues sneak in with deployments: a route template that wasn't
applied, an instrumentation library upgrade that adds a new attribute, an
attribute populated from new untrusted input. A one-time audit isn't enough —
you want to know when overflow first appears, not on the next quarterly review.

Set up an alert that fires when _any_ metric in any service emits the overflow
series. The PromQL form — adapt the time window, severity, and grouping labels
to your fleet:

```promql
sum by (service_name, __name__) (
  present_over_time({otel_metric_overflow="true"}[5m])
) > 0
```

For dashboards that filter or group by a measurement attribute, consider
surfacing an overflow indicator on the chart itself, so filtered breakdowns can
be trusted at a glance. [Aspire issue #7520][aspire-7520] discusses one shape
this can take in a developer dashboard.

Remember the dashboard that said zero errors? Now you know where those errors
went, how to surface them across the fleet, and how to catch the next deployment
that quietly makes the same mistake.

## FAQ

**Does the cardinality limit only apply to counters?** No — it applies to every
OpenTelemetry metric instrument: counters, histograms, gauges, and their
asynchronous variants. This post used counters throughout for simplicity, but
the overflow behavior is identical across all instrument types.

**Why first-come, first-served instead of LRU eviction?** The spec permits
either for synchronous delta instruments; FCFS is simply what implementations
have converged on, since it's simple and predictable. Either way, the cap is a
safety net — the real fix is not putting unbounded attributes on metrics in the
first place.

## Further reading

- [Cardinality limits](/docs/concepts/signals/metrics/#cardinality-limits) —
  full concept documentation, including what's exempt from the limit and how
  temporality affects it
- [OpenTelemetry Metrics SDK specification — Cardinality
  Limits][spec-cardinality]
- [opentelemetry-rust metrics guide — Cardinality Limits section](https://github.com/open-telemetry/opentelemetry-rust/blob/7214567041ac640a87608125470d0ad74703eaea/docs/metrics.md#cardinality-limits)
  (deeper coverage of temporality interactions and sizing heuristics)
- ["Metrics That Lie: OTel's Cardinality Capping Trap"](https://cijothomas.github.io/kubecon-eu-metriccardinality/)
  — KubeCon EU 2026 Observability Day Lightning Talk, slides
- [opentelemetry-rust PR #2901 — re-introducing configurable cardinality cap
  (v0.30)][rust-pr-2901]
- [Aspire dashboard issue #7520 — surfacing overflow to operators][aspire-7520]

[aspire-7520]: https://github.com/microsoft/aspire/issues/7520
[rust-pr-2901]: https://github.com/open-telemetry/opentelemetry-rust/pull/2901
[spec-cardinality]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/specification/metrics/sdk.md#cardinality-limits
[spec-compliance]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/spec-compliance-matrix.md

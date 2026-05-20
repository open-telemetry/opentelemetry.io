---
title:
  Cardinality Limits in OpenTelemetry — When Your Metrics Lie, and What to Do
  About It
linkTitle: Cardinality Limits in OpenTelemetry
date: 2026-05-15
author: >-
  [Cijo Thomas](https://github.com/cijothomas) (Microsoft)
issue: 9943
sig: Metrics
# canonical_url: https://...   # add if cross-posted from another blog
# prettier-ignore
cSpell:ignore: cijothomas Cijo MeterProvider OTLP overflows reservoir AlwaysOff preallocation Aspire cardinality undercount undercounting
---

You query your metrics for error count -- it says **zero**. The error rate panel
is flat. The dashboard looks fine.

But users are reporting failures. Logs confirm errors. Your application has been
instrumented with OpenTelemetry the whole time. So where did the errors go?

This post is about a deliberate piece of the OpenTelemetry metrics SDK design --
the **cardinality limit** -- which may already be affecting one of your
dashboards without you noticing. Let's start with the basics: what cardinality
is, and why it needs a limit at all.

## What "cardinality" actually means

Cardinality is the **number of unique attribute combinations** for a given
metric. Measurements with the same attribute combination aggregate into the same
data point. Take a counter `http.server.requests` with three attributes:
`url.path` (100 known paths), `http.request.method` (5 HTTP methods), and
`success` (boolean, so 2 possible values). The number of possible combinations
is `100 x 5 x 2 = 1000`, so even at millions of measurements per collection
cycle the counter produces at most 1000 data points -- memory and network cost
are bounded by that 1000, not by the request rate.

That bound matters because the SDK has to keep per-combination state -- the
running count, sum, bucket counts, and so on -- in memory for the duration of
each collection cycle. **Memory grows with cardinality, not with measurement
volume.** Whether the counter is incremented once per second or a million times
per second, those 1000 combinations cost the same amount of memory.

Now extend the example to 5 attributes with 30 possible values each: 30 x 30 x
30 x 30 x 30 -- about 24 million combinations. As cardinality grows unchecked,
the SDK's memory grows with it -- in the worst case, far enough to trigger an
out-of-memory (OOM) kill of the process. The same growth shows up downstream as
runaway observability bills, slow backend queries, and backend-side throttling
or drops -- but the SDK-level cap this post is about is what keeps the _process
itself_ safe.

## How OpenTelemetry handles unbounded cardinality

Faced with that risk, every metrics library has to answer a hard question: _what
do you do when your application records a measurement with an attribute
combination you've never seen before -- and you've already seen so many that
allocating one more aggregation slot would put your process at risk of running
out of memory?_

There are three options:

1. **Keep allocating.** Hope memory holds, and let the process get OOM-killed
   when it doesn't.
2. **Drop the measurement.** Refuse to record it. The application keeps running,
   but the metric is incomplete with no marker on the wire.
3. **Cap and signal.** Allocate up to a configured number of slots; once the
   limit is reached, fold every additional measurement into a single special
   "overflow" data point identified by a **standardized, well-known attribute
   marker**, and keep the application running.

OpenTelemetry's metrics specification mandates the third option. The
standardized marker is what makes it actionable: every SDK emits the same
`otel.metric.overflow=true` attribute, and it flows through to backends like any
other metric attribute. An operator can write **one** query against their fleet
and detect overflow regardless of the language or backend.

The trade-off is that **any query that filters or groups by an attribute on an
overflowed instrument will undercount** -- which is the part that surprises
people, and the part this post is about.

## How the cap works in practice

Each metric stream has a cardinality limit. The spec's default is **2000**, and
SDKs let you override it per stream when you need to.

When the limit is reached for a stream within a collection cycle, additional
attribute combinations are not individually tracked. They fold into the single
special data point identified by the attribute `otel.metric.overflow=true`. The
original attribute values are dropped on overflowing measurements; their
_magnitudes_ are preserved and rolled into the overflow time series.

So with the same `http.server.requests` counter, observed values
`{url.path=/home}=10`, `{url.path=/about}=5`, `{url.path=/login}=3`, and a limit
of 2, the SDK exports:

| Attributes                  | Value |
| --------------------------- | ----- |
| `url.path=/home`            | 10    |
| `url.path=/about`           | 5     |
| `otel.metric.overflow=true` | 3     |

The `/login` measurement is the one that arrived after the limit was reached, so
its `url.path` is dropped and its value (3) is folded into the overflow data
point. Bounded memory, no dropped measurements, and a clear signal in the data
that overflow happened.

## What's not capped, and why it matters

The cardinality limit applies **only to attributes provided when reporting
measurements via the metrics API**. It does _not_ apply to:

- **Resource attributes** -- `service.name`, `service.namespace`,
  `service.instance.id`, `host.name`, `cloud.region`, `k8s.cluster.name`, and
  friends. These live on the resource, not the metric data points.
- **Meter-level attributes** set at `Meter` construction time (`meter.name`,
  `meter.version`, scope/meter-level attributes).

This has an important consequence: **anything in Resource or Meter attributes
can be reliably queried, even when overflow is happening on the same
instrument.** An overflowing counter in `service.name="checkout"`,
`cloud.region="us-west-2"` still reports those Resource values intact on every
data point it emits, including the overflow one. Filters and groupings on
Resource or Meter attributes work under all conditions.

Practical guidance:

- **Push as much steady-state context as possible into Resource.** Service name,
  environment, region, cluster, pod, instance -- anything constant for the
  lifetime of the process belongs there. It's free of cardinality-cap risk and
  always queryable.
- **Reserve measurement-time attributes for things that genuinely vary per
  measurement** -- request route, status code class, customer or tenant identity
  (when per-tenant breakdowns are actually needed), error category.

The inverse trap is worth flagging too: a process that looks safely under the
cardinality limit inside the SDK can still produce a high-cardinality stream at
the backend, because Resource attributes multiply across the fleet. A 2000-cap
counter exported by 1000 pod replicas (each with a distinct
`service.instance.id`) can produce up to 2 million distinct backend series.
**The SDK's cardinality cap exists to protect your application, not your
backend.**

## Temporality changes how forgiving the cap is

The cap behavior is defined per **collection cycle** -- what the `MetricReader`
collects each time before exporting. For _synchronous_ instruments, this
interacts with temporality in opposite ways:

- With **delta temporality**, the SDK forgets state after each collection cycle.
  The cap is "up to N distinct combinations _per cycle_". Across cycles, a
  single process can export far more than N distinct combinations to the backend
  over its lifetime -- as long as no individual cycle exceeds the cap.

- With **cumulative temporality**, the SDK keeps state across cycles for the
  lifetime of the process. **Once you hit the limit, every subsequent new
  combination goes into the overflow bucket -- forever -- until the application
  restarts.** Even a brief traffic spike that pushes the active attribute set
  above the limit has a permanent effect: combinations tracked first stay
  tracked, and everything new (new routes, new customers, new error categories)
  is folded into overflow until restart.

## Three things that surprise people

### 1. Filtered queries silently lose data; totals stay correct

Consider a counter for the running example after a collection cycle in which 5
distinct attribute combinations were recorded but the cardinality limit was 3:

| Combination                                                       | Count | What the SDK exported |
| ----------------------------------------------------------------- | ----- | --------------------- |
| `{url.path=/home, http.request.method=GET, success=true}`         | 130   | tracked → 130         |
| `{url.path=/api/users, http.request.method=POST, success=true}`   | 50    | tracked → 50          |
| `{url.path=/checkout, http.request.method=POST, success=true}`    | 80    | tracked → 80          |
| `{url.path=/api/orders, http.request.method=POST, success=false}` | 15    | **overflow**          |
| `{url.path=/api/status, http.request.method=GET, success=true}`   | 20    | **overflow**          |

The SDK exports _four_ data points: three with their original attributes, plus
one overflow data point at value 35 (15 + 20 folded together) carrying only
`{otel.metric.overflow=true}`.

Now look at what happens when you query:

| Query                         | Expected | Actual | Status                      |
| ----------------------------- | -------- | ------ | --------------------------- |
| Total requests?               | 295      | 295    | OK                          |
| Requests to `/api/orders`?    | 15       | 0      | endpoint invisible          |
| How many `success=true`?      | 280      | 260    | off by 20                   |
| **How many `success=false`?** | **15**   | **0**  | **error alert never fires** |

The total stays correct, because for additive aggregations (counter sums,
histogram counts and sums) the overflow series carries the magnitudes -- the
labels are dropped, but the values are preserved. Sum including the overflow
point and you recover the true total.

Anything that _filters_ or _groups by_ a measurement attribute, however, loses
the data folded into overflow. The query "how many failures?" returns zero in
this scenario, because the only failure landed in the overflow bucket and the
overflow bucket carries no `success` attribute. **An error-rate alert built on
`success=false` would never fire.** In a more realistic case some failures are
tracked and others overflow, so the alert may fire but undercount -- the
dashboard still understates failures.

### 2. Even your safest attributes become unreliable when their _combination_ overflows

The example above already shows this. `success` is a boolean -- about as
low-cardinality as an attribute can get -- yet `success=false` returned zero,
because the _combination_ containing the failure is the one that overflowed. The
overflow bucket replaces the **entire measurement attribute combination** with
`{otel.metric.overflow: true}`; the boolean `success` is dropped alongside the
high-cardinality `url.path`.

Resource and Meter attributes are unaffected. "How many failures did the
`checkout` service in `us-west-2` produce in total?" -- filtered only on
Resource attributes -- remains accurate, provided the overflow series is summed
into the total.

### 3. A background scanner can lock out your real customers

Common SDK implementations use **first-come, first-served** for synchronous
instruments: the first N distinct attribute combinations get their own time
series; everything afterwards goes into overflow. (The spec permits any subset
for synchronous delta instruments, so the exact selection is SDK-dependent.)
There's no spec-mandated LRU eviction or statistical sampling.

The consequence shows up most starkly on **cumulative** temporality. If a
security scanner pings the service at startup with 2000 unique URL paths, every
named series in the table ends up belonging to the scanner. Those slots persist
for the lifetime of the process; real customer routes land in overflow, and the
dashboard shows zero for the traffic that actually matters until the process
restarts.

## Sizing the limit

The default of 2000 covers most well-designed instruments. If you need to
override it (via a View), the costs run in both directions:

- **Limit too high**: some SDKs (notably .NET and Rust) preallocate memory based
  on the limit, so the excess is allocated upfront and sits unused. Other SDKs
  grow on demand.
- **Limit too low**: measurements get folded into overflow, and filtered queries
  become unreliable.

A short heuristic, by temporality (synchronous instruments):

| Temporality                               | How to size                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cumulative**                            | Estimate the _theoretical maximum_ combinations across the lifetime of the process. For example, an HTTP counter with 100 known routes x 5 methods x 2 success values = 1000. Set the limit slightly above. If certain combinations are physically impossible, subtract them.                                                                           |
| **Delta** (low-cardinality attributes)    | Same as cumulative -- per-cycle isolation doesn't help when the attribute set is already small.                                                                                                                                                                                                                                                         |
| **Delta** (high-cardinality attributes)   | Estimate the _active_ distinct combinations per cycle, not lifetime. Example: 1 million possible users x 2 success values gives 2 million possible combinations, but if only ~10,000 users are active per cycle the active set is ~20,000. Set the limit ~2x that for burst headroom (~40,000). This is where Delta makes a meaningful difference.      |
| **Delta** (request-rate-bounded fallback) | When you can't estimate active users, use `max_requests_per_second x collection_interval_seconds` (the OTel collection/export interval) as a guaranteed upper bound. 500 req/sec x 60 sec = 30,000. Shortening the collection interval directly shrinks the per-cycle working set, so a shorter interval lets you safely use a lower cardinality limit. |

## When high-cardinality attributes are actually the right answer

The conventional wisdom is "never put `user_id` or `tenant_id` in metric
attributes." Good default advice, but not universal: **per-tenant SLOs** in
multi-tenant systems require tenant identity on the metric, because the point is
to answer questions like "what is tenant X's failure rate over the last hour?"
or "are we meeting the SLOs we contracted with our top 50 customers?"
Aggregating tenant identity away defeats the purpose.

**Delta temporality with a modest cardinality limit makes this work** (for
synchronous instruments). Delta forgets state after each collection cycle, so
the cap covers "active distinct combinations _per cycle_", not "distinct
combinations _ever seen_". As long as the concurrent active key-set within a
cycle stays below the limit, the total tenant population can be orders of
magnitude larger.

Worked example: 1 million tenants total, but only ~5,000 active in any given
60-second collection cycle. Use **delta temporality** and set the
`cardinalityLimit` from
`(active key set) x (cross-product of other measurement attributes) x ~2 for burst headroom`.
With just `tenant_id` on the metric that's `5,000 x 1 x 2 = 10,000`; if each
tenant also produces a `(route, success)` cross-product, scale up accordingly.
The backend will see the full long-tail of distinct tenant series over time --
intentionally -- but the SDK process never stores more than the per-cycle
working set.

> **Rule of thumb:** with delta + a deliberate limit, you only overflow when the
> _concurrent_ active key-set exceeds the limit. The total population doesn't
> matter.

Two caveats:

1. **Cumulative temporality on the same instrument doesn't work.** Once a
   tenant's combination is tracked, it stays tracked for the process lifetime;
   you accumulate every tenant ever active. Cumulative + per-tenant is a
   guaranteed path to overflow.
2. **A traffic spike that activates many more tenants than usual will still
   cause overflow** for that cycle. Set the limit with headroom for realistic
   bursts, and treat sustained overflow on these instruments as a real
   operational signal.

The general principle: **the cardinality limit is a per-cycle working set, not a
per-lifetime budget.**

## Two things to do this week

### Before you start: confirm your SDK implements the cap

Per the [spec compliance matrix][spec-compliance] at the time of writing, .NET,
C++, Go, Java, JavaScript, and Rust implement cardinality limits (default:
2000). If your SDK isn't on that list, the SDK can hold unbounded
per-combination state and the process can get OOM-killed under a cardinality
leak; watch process memory carefully, and treat the actions below as best-effort
until your SDK ships the cap.

### Action 1: Check whether you've already been affected

The on-the-wire attribute value is the boolean `true`. Prometheus represents all
label values as strings, so the PromQL match becomes `="true"`; in OTLP-native
backends that preserve the boolean type, query for the boolean directly.

**Prometheus / PromQL** -- find every metric in your fleet that has ever emitted
an overflow data point:

```promql
count by (__name__, service_name)({otel_metric_overflow="true"} > 0)
```

This returns the list of `(metric_name, service_name)` pairs where overflow has
occurred. Adjust the grouping labels to match your deployment (e.g., add
`cluster`, `namespace`).

**Other backends** -- write the equivalent query in your backend's query
language: filter on the attribute `otel.metric.overflow = true` and group by
metric name and `service.name`.

**For each metric the query returns:**

1. **The metric name tells you what was affected.** `http.server.duration` in
   your overflow list means that histogram has been undercounting filtered
   queries.
2. **The `service.name` tells you which service is affected.** Cross-check
   against fleet topology: is it isolated to one service, or showing up across
   many? To narrow down to a specific replica, group by `service.instance.id` as
   well.
3. **Apply the fix.** Either drop the offending attribute via a View (cleanest
   if the attribute isn't worth its cardinality cost), raise the limit
   temporarily (buys time while a fix is in flight), or fix the attribute
   upstream with templated routes, normalized error categories, etc. (the
   long-term fix). On cumulative temporality, the process keeps folding new
   combinations into overflow until it restarts -- so a restart after the fix
   ships is what gets the named series back.

If the query returns nothing, no instrument in your fleet has hit its cap so far
-- a useful baseline. If it returns anything, you know which instruments to
investigate.

### Action 2: Monitor for overflow continuously

Cardinality issues sneak in with deployments: a route template that wasn't
applied, an instrumentation library upgrade that adds a new attribute, an
attribute populated from new untrusted input. A one-time audit isn't enough --
you want to know when overflow first appears, not on the next quarterly review.

Set up an alert that fires when _any_ metric in any service emits the overflow
series. The PromQL form (adapt the time window, severity, and grouping labels to
your fleet):

```promql
sum by (service_name, __name__) (
  rate({otel_metric_overflow="true"}[5m])
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

**Why not just put `service.name` on every measurement -- it only has one value,
so cardinality is the same?**

Mathematically, yes -- one value times the rest of the cross-product is the same
number of combinations. But it still belongs in Resource, not on measurements.
Once an instrument overflows, the entire measurement attribute set is replaced
with `{otel.metric.overflow: true}` -- a `service.name` recorded on the
measurement would disappear from the overflow data point. The same value placed
in Resource is preserved on every data point, including the overflow one, and
queries that filter or group by `service.name` keep working. Anything constant
for the lifetime of the process belongs in Resource.

**Why first-come-first-served? Why not LRU eviction?** The spec doesn't mandate
FCFS -- it leaves the choice open and permits any subset for synchronous delta
instruments. FCFS is what current implementations have converged on because it's
simple and predictable: no per-combination timestamps, no per-cycle eviction
work. LRU and other strategies are possible future directions, but the cap is
best treated as a safety net regardless -- the right answer is to not put
unbounded attributes on metrics in the first place.

## Further reading

- [OpenTelemetry Metrics SDK specification -- Cardinality
  Limits][spec-cardinality]
- [opentelemetry-rust metrics guide -- Cardinality Limits section](https://github.com/open-telemetry/opentelemetry-rust/blob/7214567041ac640a87608125470d0ad74703eaea/docs/metrics.md#cardinality-limits)
  (deeper coverage of temporality interactions and sizing heuristics)
- ["Metrics That Lie: OTel's Cardinality Capping Trap"](https://cijothomas.github.io/kubecon-eu-metriccardinality/)
  -- KubeCon EU 2026 Observability Day Lightning Talk, slides
- [opentelemetry-rust PR #2901 -- re-introducing configurable cardinality cap
  (v0.30)][rust-pr-2901]
- [Aspire dashboard issue #7520 -- surfacing overflow to operators][aspire-7520]

[aspire-7520]: https://github.com/microsoft/aspire/issues/7520
[rust-pr-2901]: https://github.com/open-telemetry/opentelemetry-rust/pull/2901
[spec-cardinality]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/specification/metrics/sdk.md#cardinality-limits
[spec-compliance]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/6837311818b3cedcda4cad222804c4f98f1fe402/spec-compliance-matrix.md

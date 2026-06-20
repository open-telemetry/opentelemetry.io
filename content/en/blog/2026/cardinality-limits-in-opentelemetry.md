---
title: >-
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
cSpell:ignore: Aspire cardinality Cijo cijothomas OTLP overflows undercount undercounting
---

You query your metrics for error count — it says **zero**. The error rate panel
is flat. The dashboard looks fine.

But users are reporting failures. Logs confirm errors. Your application has been
instrumented with OpenTelemetry the whole time. So where did the errors go?

This post is about a deliberate piece of the OpenTelemetry metrics SDK design --
the **cardinality limit** — which may already be affecting one of your
dashboards without you noticing.

## What "cardinality" means, and why it matters

Every time you record a metric measurement in OpenTelemetry, you can attach
attributes — key-value pairs like `url.path=/home` or `success=true`. The SDK
groups measurements by their unique attribute combinations: all measurements
with the _same_ set of attribute values get aggregated into a single data point.

**Cardinality** is just the count of those unique combinations.

Think of it like a spreadsheet. Each unique row of attribute values is one data
point the SDK tracks in memory:

| `url.path` | `success` | Count |
| ---------- | --------- | ----- |
| `/home`    | `true`    | 130   |
| `/home`    | `false`   | 2     |
| `/about`   | `true`    | 50    |
| `/about`   | `false`   | 1     |

Four unique combinations, four rows — that's a cardinality of 4. Notice that the
total cardinality is the **product** of each attribute's possible values: 2
paths x 2 success values = 4. With 100 URL paths and a boolean `success`, the
table grows to `100 x 2 = 200` rows. Each row costs memory, but 200 is fine.

Now imagine you add a `user_id` attribute with 500,000 possible values. The
table explodes to `100 x 2 x 500,000 = 100 million` rows. Each new attribute
_multiplies_ the cardinality — that's what makes it dangerous.

**Memory grows with cardinality, not with request volume.** This is what makes
metrics fundamentally different from logs. With logs, sending 1 million requests
means storing and exporting 1 million log records — cost scales with traffic.
With metrics, those 1 million requests just increment existing counters in the
200-row table. The memory cost is fixed and predictable — _unless_ cardinality
grows unchecked. Then it's worse than logs, because 100 million rows of
in-memory state can OOM-kill the process before anything is even exported.

## How OpenTelemetry caps cardinality

To prevent this, the OpenTelemetry metrics SDK enforces a **cardinality limit**
-- a maximum number of unique attribute combinations per metric stream. The
default is **2000**, and SDKs let you override it when you need to.

Here's what happens when the limit is reached. Say your counter
`http.server.requests` has a limit of 2, and three distinct paths arrive in a
collection cycle: `/home` with 10 requests, `/about` with 5, and `/login`
with 3. The SDK exports:

| Attributes                  | Value |
| --------------------------- | ----- |
| `url.path=/home`            | 10    |
| `url.path=/about`           | 5     |
| `otel.metric.overflow=true` | 3     |

The first two combinations got tracked normally. `/login` arrived after the
limit was reached, so the SDK dropped its attributes and folded its value (3)
into a special **overflow data point** marked with `otel.metric.overflow=true`.

The key properties of this design:

- **No measurements are lost.** The value (3) is preserved — only the attribute
  labels are dropped. Totals stay correct.
- **No memory explosion.** The SDK never tracks more than the configured number
  of combinations.
- **Overflow is visible.** Every SDK uses the same `otel.metric.overflow=true`
  marker, so you can write one query across your fleet to detect it, regardless
  of language or backend.

The trade-off is that **any query that filters or groups by an attribute on an
overflowed metric will undercount** — which is the part that surprises people,
and the part this post is about.

## Three things that surprise people

### 1. Filtered queries silently lose data; totals stay correct

Let's make this concrete. Five distinct attribute combinations arrive in a
collection cycle, but the cardinality limit is 3:

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

The total stays correct because the overflow series preserves the values — just
not the labels. But anything that _filters_ or _groups by_ a measurement
attribute loses the data folded into overflow. The query "how many failures?"
returns zero here, because the only failure landed in the overflow bucket and
the overflow bucket carries no `success` attribute. **An error-rate alert built
on `success=false` would never fire.**

### 2. Even your safest attributes become unreliable when their _combination_ overflows

`success` is a boolean — about as low-cardinality as an attribute can get -- yet
`success=false` returned zero above. Why? Because the overflow bucket replaces
the **entire attribute combination**, not just the high-cardinality part. The
boolean `success` is dropped alongside `url.path`.

### 3. A background scanner can lock out your real customers

Most SDK implementations use **first-come, first-served**: the first N distinct
combinations get their own time series; everything after goes into overflow.

The consequence: if a security scanner pings the service at startup with 2000
unique URL paths, every named series slot belongs to the scanner. With
**cumulative** temporality those slots persist for the lifetime of the process.
Real customer routes land in overflow, and the dashboard shows zero for the
traffic that actually matters — until the process restarts.

## What's not capped, and why it matters

The cardinality limit applies **only to attributes provided when reporting
measurements via the metrics API**. It does _not_ apply to:

- **Resource attributes** — `service.name`, `cloud.region`,
  `service.instance.id`, and friends. These live on the resource, not on
  individual data points.
- **Meter-level attributes** set at `Meter` construction time.
- **The number of Meters or instruments** — you can create as many as needed
  without hitting the cardinality limit.

**Anything in Resource or Meter attributes can be reliably queried, even when
overflow is happening.** An overflowing counter in `service.name="checkout"`,
`cloud.region="us-west-2"` still reports those values intact on every data
point, including the overflow one.

Practical guidance:

- **Ensure steady-state context is in Resource where it belongs.** Service name,
  environment, region, cluster, instance — these describe the entity producing
  telemetry, not individual measurements, so they belong in Resource by design.
  As a bonus, they're always queryable regardless of overflow.
- **Reserve measurement-time attributes for things that genuinely vary per
  measurement** — route, status code, error category.

One caveat: the SDK cap only limits what a single process holds in memory at any
given time. It doesn't limit what reaches your backend. With delta temporality,
the same process can export _different_ 2000-combination sets each cycle --
accumulating far more distinct series over time. After a restart, the slate is
wiped and 2000 new combinations can appear. And across a fleet, a 2000-cap
counter exported by 1000 pods can produce up to 2 million backend series. **The
SDK cap protects your application from OOM, not your backend from high
cardinality.**

## Temporality changes how forgiving the cap is

The cap applies per **collection cycle**. For _synchronous_ instruments,
temporality changes how forgiving that is:

- With **delta temporality**, the SDK forgets state after each collection cycle.
  The cap is "up to N distinct combinations _per cycle_". Across cycles, a
  single process can export far more than N distinct combinations to the backend
  over its lifetime — as long as no individual cycle exceeds the cap.

- With **cumulative temporality**, the SDK keeps state across cycles for the
  lifetime of the process. **Once you hit the limit, every subsequent new
  combination goes into the overflow bucket — forever — until the application
  restarts.** Even a brief traffic spike that pushes the active attribute set
  above the limit has a permanent effect: combinations tracked first stay
  tracked, and everything new (new routes, new customers, new error categories)
  is folded into overflow until restart.

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
| **Delta** (low-cardinality attributes)    | Same as cumulative — per-cycle isolation doesn't help when the attribute set is already small.                                                                                                                                                                                                                                                          |
| **Delta** (high-cardinality attributes)   | Estimate the _active_ distinct combinations per cycle, not lifetime. Example: 1 million possible users x 2 success values gives 2 million possible combinations, but if only ~10,000 users are active per cycle the active set is ~20,000. Set the limit ~2x that for burst headroom (~40,000). This is where Delta makes a meaningful difference.      |
| **Delta** (request-rate-bounded fallback) | When you can't estimate active users, use `max_requests_per_second x collection_interval_seconds` (the OTel collection/export interval) as a guaranteed upper bound. 500 req/sec x 60 sec = 30,000. Shortening the collection interval directly shrinks the per-cycle working set, so a shorter interval lets you safely use a lower cardinality limit. |

## When high-cardinality attributes are actually the right answer

The conventional wisdom is "never put `user_id` or `tenant_id` in metric
attributes." Good default advice, but not universal: **per-tenant SLOs** require
tenant identity on the metric to answer questions like "what is tenant X's
failure rate?" Aggregating it away defeats the purpose.

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

Two caveats:

1. **Cumulative temporality on the same instrument doesn't work.** Once a
   tenant's combination is tracked, it stays tracked for the process lifetime;
   you accumulate every tenant ever active. Cumulative + per-tenant is a
   guaranteed path to overflow.
2. **A traffic spike that activates many more tenants than usual will still
   cause overflow** for that cycle. Set the limit with headroom for realistic
   bursts, and treat sustained overflow on these instruments as a real
   operational signal.

The general principle: **under delta temporality the cardinality limit is a
per-cycle working set; under cumulative temporality it accumulates until the
process restarts.**

## Two things to do this week

### Action 1: Check whether you've already been affected

The overflow attribute value is the boolean `true`. Prometheus represents it as
the string `"true"`; OTLP-native backends preserve the boolean type.

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
3. **Apply the fix.** Either drop the offending attribute via a View (cleanest
   if the attribute isn't worth its cardinality cost), raise the limit
   temporarily (buys time while a fix is in flight), or fix the attribute
   upstream with templated routes, normalized error categories, etc. (the
   long-term fix). On cumulative temporality, the process keeps folding new
   combinations into overflow until it restarts — so a restart after the fix
   ships is what gets the named series back.

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
attribute populated from new untrusted input. A one-time audit isn't enough --
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

**Why not just put `service.name` on every measurement — it only has one value,
so cardinality is the same?**

Mathematically, yes — one value times the rest of the cross-product is the same
number of combinations. But it still belongs in Resource, not on measurements.
Once an instrument overflows, the entire measurement attribute set is replaced
with `{otel.metric.overflow: true}` — a `service.name` recorded on the
measurement would disappear from the overflow data point. The same value placed
in Resource is preserved on every data point, including the overflow one, and
queries that filter or group by `service.name` keep working. Anything constant
for the lifetime of the process belongs in Resource.

**Why first-come-first-served? Why not LRU eviction?** The spec doesn't mandate
FCFS — it leaves the choice open and permits any subset for synchronous delta
instruments. FCFS is what current implementations have converged on because it's
simple and predictable: no per-combination timestamps, no per-cycle eviction
work. LRU and other strategies are possible future directions, but the cap is
best treated as a safety net regardless — the right answer is to not put
unbounded attributes on metrics in the first place.

**Does the cardinality limit only apply to counters?** No — it applies to every
OpenTelemetry metric instrument: counters, histograms, gauges, and their
asynchronous variants. This post used counters throughout for simplicity, but
the overflow behavior is identical across all instrument types.

## Further reading

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

---
title: Don't Wrap OpenTelemetry — You're Probably Hurting More Than Helping
linkTitle: Don't Wrap OpenTelemetry
date: 2026-06-18
author: >-
  [Cijo Thomas](https://github.com/cijothomas) (Microsoft)
issue: 10169
# sig:
canonical_url: https://medium.com/@cijo.thomas/dont-wrap-opentelemetry-you-re-probably-hurting-more-than-helping-96795803abeb
# prettier-ignore
cSpell:ignore: Cijo cijothomas ConcurrentDictionary GetOrAdd InMemoryExporter KeyValue KeyValuePair struct TagList Vec
---

There's a pattern I've seen across many teams adopting OpenTelemetry, and it's
well-intentioned every single time. An engineer wants to make things easier for
the team. They build a thin abstraction over the OTel API — an `IMetric`
interface, a `TelemetryHelper` class, a `MetricsWrapper` module — and ship it as
the team's standard. "Just use this," they say. "It's simpler."

The intention is genuine. The outcome is usually not good.

I'll use .NET and Rust metrics as concrete examples here, but the anti-patterns
apply across every OpenTelemetry language SDK and signal type.

To be clear: this post is about wrapping the
[OTel API](/docs/specs/otel/overview/) — the instrumentation surface your
application or library code calls to create logs, metrics, and traces. It's
perfectly reasonable for organizations to provide shared helpers that configure
the [SDK](/docs/specs/otel/glossary/#telemetry-sdk) — setting up exporters,
sampling policies, resource attributes, and so on. That's infrastructure setup,
not an API wrapper, and it doesn't interfere with how developers instrument
their code.

## What the wrapper looks like

The wrapper typically starts small and reasonable. In C#:

```csharp
public interface IMetric
{
    void RecordHistogram(long val, List<KeyValuePair<string, string>> attributes);
}
```

Or in Rust:

```rust
fn record_histogram(
    value: f64,
    attributes: Vec<(String, String)>,
) { /* ... */ }
```

Let's see why this is bad.

## Anti-pattern #1: The signature that forces allocation

`List<KeyValuePair<string, string>>` or `Vec<(String, String)>` — the same
problem applies to any collection type the wrapper forces callers to construct.
They all heap-allocate.

OTel .NET's `Histogram<T>.Record()` has dedicated overloads for 1, 2, and 3
attributes that are allocation-free by design:

```csharp
// Zero heap allocation — use these for 1-3 attributes
histogram.Record(value, new("status", "ok"));
histogram.Record(value, new("status", "ok"), new("tier", "premium"));
histogram.Record(value,
    new("status", "ok"),
    new("tier", "premium"),
    new("format", "json"));
```

For 4–8 attributes, `TagList` (a struct) avoids heap allocation:

```csharp
var tags = new TagList
{
    { "status", "ok" },
    { "tier", "premium" },
    { "format", "json" },
    { "version", "v2" },
};
histogram.Record(value, tags);
```

In Rust, the OTel API takes a borrowed slice of `KeyValue` — the examples below
use a stack-allocated array, no heap allocation needed:

```rust
histogram.record(value, &[KeyValue::new("status", "ok")]);

histogram.record(
    value,
    &[
        KeyValue::new("status", "ok"),
        KeyValue::new("tier", "premium"),
        KeyValue::new("format", "json"),
    ],
);
```

These are deliberate, carefully engineered designs. The moment your wrapper
signature requires any collection type, every caller heap-allocates on every
measurement. That zero-allocation design is silently gone — and developers using
your wrapper have no idea it ever existed.

## Anti-pattern #2: The lookup wrapper

This wrapper takes the instrument name as a parameter, maintains an internal
cache of instruments, and looks up — or creates — the instrument on every call.
The caller never holds a direct reference to the instrument. The appeal is
convenience: developers don't have to create or store instruments themselves.

In C#:

```csharp
public void RecordHistogram(
    string name,
    long val,
    List<KeyValuePair<string, string>> attributes)
{
    // Look up instrument by name, create if not exists, then record
    var histogram = _instruments.GetOrAdd(
        name, n => _meter.CreateHistogram<long>(n));
    histogram.Record(val, /* converted attributes */);
}
```

In Rust:

```rust
fn record_histogram(
    &self,
    name: &str,
    value: f64,
    attributes: Vec<(String, String)>,
) {
    let mut instruments = self.instruments.lock().unwrap();
    let histogram = instruments
        .entry(name.to_string())
        .or_insert_with(|| self.meter.f64_histogram(name).build());
    // ... record with converted attributes
}
```

Now you've moved the instrument lookup into every record call. In .NET this
typically takes the shape of a `ConcurrentDictionary` with a `GetOrAdd` pattern
— which still involves a dictionary lookup, hashing, and comparison on every
single measurement. In Rust, this pattern often ends up as a `Mutex`-protected
`HashMap`, meaning every record call acquires a lock. Under any meaningful
concurrency, that becomes a serialization point in your hot path.

OTel instruments are designed to be created once at startup and held as a
reference. The instrument _is_ the fast path. Wrapping the lookup into every
record call throws away the entire performance model that OTel is built around.

## The compounding problems beyond performance

**Developers learn the wrapper, not OTel.** When someone spends months calling
`RecordHistogram(name, val, attributes)`, they haven't learned OpenTelemetry —
they've learned your abstraction. When they change teams, work on a different
service, or read the official docs, they have to start over.

**Maintenance burden grows over time.** The OTel API doesn't change frequently,
but when new capabilities or conventions do land, they have to be re-exposed
through your wrapper before your team can use them. You're owning an API on top
of an API.

**Bugs become harder to diagnose.** The wrapper adds a layer of indirection
between symptom and cause. Is the issue in OTel? In the wrapper? In how the
wrapper converts types? The abstraction that was supposed to simplify things now
makes debugging harder.

## "But we needed an abstraction for testing"

OTel already solves this. Every language SDK ships an `InMemoryExporter` that
lets you collect and assert on exactly what was recorded, with full fidelity of
the real SDK — perfect for unit tests. If you want to visually inspect telemetry
during development, the stdout exporter prints everything to the console. You
don't need to hide OTel behind an interface to write good tests.

## What to do instead

Point your team at the [official OpenTelemetry documentation](/docs/). The
language-specific docs are thorough and cover best practices. If something is
unclear or missing, contributing upstream is far more valuable than building a
local wrapper — it helps everyone.

## When wrappers are genuinely needed

There are real cases — for example, migrating from a legacy metrics system where
you need to dual-write to both the old API and OTel during a transition period.
If you're in one of those situations and a wrapper is truly necessary, be very
deliberate about the API surface you expose. Make sure you're not silently
taking away the allocation-free paths that OTel worked hard to provide.

Another legitimate scenario is when your organization has strict governance
requirements — controlling which attributes are allowed, enforcing naming
conventions, or ensuring only approved metric definitions are used. Some teams
address this by declaring their metric definitions in a proprietary schema and
using code-generation tools to produce type-safe OTel API calls. The generated
code uses OTel directly, so there's no runtime wrapper — just a compile-time
safety net.

This is actually the direction the OpenTelemetry project itself is heading.
[OTel Weaver](https://github.com/open-telemetry/weaver) is a tool designed to
generate type-safe, idiomatic OTel instrumentation code from semantic convention
definitions. If you're building something like this today, keep an eye on Weaver
— it may eventually replace your custom tooling with an upstream solution.

## The bottom line

OpenTelemetry was designed to be the stable, user-facing abstraction. When you
wrap it, you're not simplifying it — you're building a proprietary layer on top
of an open standard, and paying for it in heap allocations, performance,
maintainability, and developer growth.

Skip the wrapper.

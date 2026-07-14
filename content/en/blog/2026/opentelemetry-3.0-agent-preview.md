---
title: The OpenTelemetry Java agent 3.0 is almost here — preview it today
linkTitle: Preview the OpenTelemetry Java agent 3.0
date: 2026-07-13
draft: true
author: >-
  [Jay DeLuca](https://github.com/jaydeluca) (Grafana Labs)
sig: SIG Java
---

The **`v2.30.0`** release of the
[OpenTelemetry Java agent](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
is out — the last v2 minor and effectively the release candidate for 3.0.
Everything that 3.0 will change is available right now, behind a preview flag.
The 3.0 release itself is scheduled for next month (August 2026).

Turn it on now and validate your telemetry against 3.0 behavior before it
becomes the default. If something looks off in your dashboards, alerts, or
downstream pipelines,
[open an issue](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues)
before 3.0 ships.

## What's changing in 3.0

3.0 is mostly about **semantic-convention stabilization**. Several conventions
that were still experimental in 2.x graduate to stable and become the default,
which means some widely-used attribute and metric names change. The headline
items:

- **Database** telemetry changes the most: attribute renames (`db.system` →
  `db.system.name`, `db.name` → `db.namespace`, `db.statement` →
  `db.query.text`), value remaps (`mssql` → `microsoft.sql_server`),
  connection-pool metrics move from `db.client.connections.*` to
  `db.client.connection.*` (including a `ms` → `s` unit change), and a new
  `db.client.operation.duration` histogram.
- **Code** attributes consolidate: `code.namespace` + `code.function` collapse
  into a single `code.function.name`.
- **A handful of non-telemetry defaults** flip under the 3.0 umbrella.

This is a high-level summary; a complete breakdown of every change will be
published closer to the 3.0 release.

## Preview 3.0 today

There are two ways to start previewing 3.0 behavior today:

The **umbrella** flag turns on all the upcoming 3.0 behavior at once, giving you
the closest thing to running 3.0 before the release:

```
OTEL_INSTRUMENTATION_COMMON_V3_PREVIEW=true
```

Or opt in **per domain** with a comma-separated list, so you can preview one
area at a time:

```
OTEL_SEMCONV_STABILITY_OPT_IN=database,code
```

If you configure the agent with [declarative configuration][decl-config], the
same two options live under `instrumentation/development`:

```yaml
instrumentation/development:
  java:
    common:
      v3_preview: true # the umbrella flag
  general:
    stability_opt_in_list: 'database,code' # the per-domain opt-in
```

## Run old and new in parallel with `/dup`

The safest way to validate is to emit **both** the old and new telemetry at the
same time, so your existing dashboards keep working while you build and check
the new ones side by side. Append `/dup` to any domain:

```
OTEL_SEMCONV_STABILITY_OPT_IN=database/dup,code/dup
```

or, in declarative configuration:

```yaml
instrumentation/development:
  general:
    stability_opt_in_list: 'database/dup,code/dup'
```

With `/dup` on, a JDBC client span carries both naming schemes at once:

```
# emitted today (2.x)              # emitted in 3.0 (stable)
db.system    = "postgresql"        db.system.name = "postgresql"
db.name      = "orders"            db.namespace   = "orders"
db.statement = "SELECT * FROM ..." db.query.text  = "SELECT * FROM ..."
```

Build and confirm your 3.0 dashboards against the new names, then drop `/dup` to
go stable-only when you're ready.

## Using agents in your observability workflows?

Most of this migration is mechanical: map old names to new, adjust a few units,
fix a value or two. That makes it a great fit for an AI agent, as long as it's
grounded in real metadata and your own telemetry rather than guessing. Two
sources make that work together:

- The [OpenTelemetry Ecosystem Explorer](https://explorer.opentelemetry.io/)
  publishes machine-readable, per-instrumentation telemetry metadata for each
  agent version, and records the **condition** under which each field is
  emitted, including the semantic-convention opt-ins. So even though 3.0 isn't
  out yet, the metadata already separates the telemetry you get by default today
  from the stabilized telemetry you get under an `otel.semconv-stability.opt-in`
  flag. That gives an agent an authoritative map of the **names, types, and
  units** that change — attribute and metric renames like `db.system` →
  `db.system.name` and `db.client.connections.*` → `db.client.connection.*`,
  plus the `ms` → `s` unit switch on the connection-pool metrics.
- Your **live `/dup` telemetry** fills in the rest. Because the old and new
  attributes ride the same span, an agent can read the concrete **value**
  changes straight from your data (`db.system=mssql` sitting next to
  `db.system.name=microsoft.sql_server`, or `code.namespace` + `code.function`
  next to `code.function.name`). Those value-level changes aren't something the
  metadata carries, so this is where you catch them.

Point an agent at both, alongside your dashboards and alert rules, and you can
get back a mapping scoped to _your_ stack plus a draft set of rewritten queries.

Here's an example prompt to get started. Swap in your own files:

```
I'm previewing the OpenTelemetry Java agent's upcoming 3.0 semantic conventions before
they become the default, and I need to update my dashboards and alerts. Do not guess at
attribute or metric names or values; ground every change in one of the two sources below.

Source 1 - the OpenTelemetry Ecosystem Explorer (https://explorer.opentelemetry.io/).
For each instrumentation it records the condition under which each telemetry field is
emitted. 3.0 isn't released, so there is no "3.0" version; instead, for a given
instrumentation compare:
  - telemetry emitted by default (today's 2.x behavior), against
  - telemetry emitted under an "otel.semconv-stability.opt-in" condition.
The opt-in form is what becomes the 3.0 default, so the difference between the two is the
migration. Read the actual opt-in token(s) per instrumentation from the Explorer; they
vary (database, rpc, service.peer, ...) and can be compound (e.g. database,service.peer),
so don't assume a single token. The Explorer records attribute/metric NAMES, TYPES, and
UNITS, not attribute values. If an instrumentation has no opt-in block, treat it as "no
semconv change here" and say so rather than inventing one.

Source 2 - my live dual-emitted telemetry. I'm running with
OTEL_SEMCONV_STABILITY_OPT_IN=database/dup,code/dup, so the old and new attributes appear
on the same span/metric. Use this to resolve the value-level changes the Explorer can't
carry: read the concrete value remaps (e.g. db.system vs db.system.name on the same span)
and the code.namespace + code.function -> code.function.name consolidation from my data.

My stack: <e.g. Spring Boot + HikariCP + JDBC/PostgreSQL + gRPC>.
My dashboards and alerts are in: <paths or pasted JSON/YAML>.
My captured dual-emit telemetry is in: <path or pasted sample>.

Please:
1. For each instrumentation my config touches, get the name/type/unit changes from the
   Explorer (default vs opt-in) and the value-level changes from my dual-emit sample.
   Note: connection-pool metrics come from the pool instrumentation (HikariCP, Tomcat
   JDBC, ...), not the jdbc instrumentation.
2. Produce a mapping table (old -> new) covering names, units, types, values, and any
   dropped attributes, with a column citing which source each row came from.
3. Rewrite my queries and alert conditions to the stabilized form, preserving intent.
   Watch for numeric comparisons that break when a value becomes a string, and thresholds
   baked in ms that must change with a ms->s unit switch. If my query language names
   attributes differently from the dotted OpenTelemetry form, treat that normalization as
   an assumption to verify, not something to guess.
4. For anything you can't ground in either source, output a VERIFY item instead of a guess.
```

Both sources speak dotted OpenTelemetry names, but your query language might
not. If you query through Prometheus, for example, dots become underscores and
metrics pick up unit suffixes (`db.client.connection.count` becomes
`db_client_connection_count`, and a seconds histogram gets a `_seconds` suffix).
If that applies to you, add a line to the prompt spelling out your naming
convention so the agent rewrites queries in the right form.

We're also building a
[release diff view](https://explorer.opentelemetry.io/java-agent/releases)
directly into the Explorer so you can see, per instrumentation, exactly what
changes.

Give the preview a try, validate your dashboards and alerts against it, and tell
us what you find before 3.0 ships in August.

[decl-config]:
  /docs/zero-code/java/agent/declarative-configuration/

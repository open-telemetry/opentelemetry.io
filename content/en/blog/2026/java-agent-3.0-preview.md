---
title: The OpenTelemetry Java agent 3.0 is almost here — preview it today
linkTitle: Preview the OpenTelemetry Java agent 3.0
date: 2026-10-06
author: >-
  [Jay DeLuca](https://github.com/jaydeluca) (Grafana Labs)
sig: SIG Java
cSpell:ignore: Dotel enduser Hystrix invokedynamic Twilio
---

The **[2.32.0 release][release-2.32.0]** of the [OpenTelemetry Java
agent][java-agent] is now out and serves as the release candidate for **3.0**,
which is targeted for **October 2026**. Some behavior may still change before
3.0, but you can preview the new behavior now, before it becomes the default.

3.0 changes telemetry, configuration, and instrumentation defaults. Database and
code conventions become stable defaults, messaging adopts newer conventions that
are still experimental, and some capture settings and instrumentation defaults
change. [What to check](#what-to-check) covers each area.

Try it against your dashboards, alerts, and downstream pipelines, and [let us
know of any issues][issues] before 3.0 is finalized.

## Try the preview

The examples below show environment variables and [declarative
configuration][decl-config]. Declarative configuration support in the Java agent
is experimental. If you choose to try it, the [configuration
converter][dc-converter] and the Ecosystem Explorer's [configuration
builder][explorer-builder] can help you get started. Pass the YAML file with
`-Dotel.config.file=/path/to/otel-config.yaml`.

Environment variables appear first, with declarative configuration in the second
tab. The YAML snippets are fragments to merge into your existing configuration
file; keep your resource, exporter, and other settings.

### Step 1: Compare old and new telemetry

Start in a test deployment and capture baseline telemetry before enabling any
preview settings. Then choose the domains relevant to your application. With the
umbrella preview flag off, append `/dup` to emit old and new attributes, and
metrics where dual emission is supported, together:

{{< tabpane text=true >}}

{{% tab header="Environment variables" %}}

```text
OTEL_INSTRUMENTATION_COMMON_V3_PREVIEW=false
OTEL_SEMCONV_STABILITY_OPT_IN=database/dup,code/dup
OTEL_SEMCONV_STABILITY_PREVIEW=messaging/dup
```

{{% /tab %}} {{% tab header="Declarative configuration" %}}

```yaml
instrumentation/development:
  general:
    stability_opt_in_list: 'database/dup,code/dup'
  java:
    common:
      v3_preview: false
      semconv_stability:
        preview: [messaging/dup]
```

{{% /tab %}} {{< /tabpane >}}

For example, consider a PostgreSQL JDBC connection to database `orders`,
configured to use the `public` schema. With dual emission, a span can carry both
naming schemes:

| Legacy attribute                       | Stable attribute                        |
| -------------------------------------- | --------------------------------------- |
| `db.system: "postgresql"`              | `db.system.name: "postgresql"`          |
| `db.name: "orders"`                    | `db.namespace: "orders\|public"`        |
| `db.statement: "SELECT * FROM orders"` | `db.query.text: "SELECT * FROM orders"` |

Here, `db.namespace` combines the database and schema as `orders|public`, while
`db.name` contains only `orders`. Check values as well as keys when updating
your queries. Keep your existing database and schema settings when trying the
preview; `public` is simply the schema chosen for this example.

> [!NOTE]
>
> **Dual emission does not preserve every legacy metric or both trace shapes.**
> Database connection-pool metrics switch to the new names and units even with
> `database/dup`. A span still has only one name and kind, and `/dup` uses the
> newer convention for those. Use your baseline capture to compare metrics and
> trace structure as well as the attributes emitted together.

### Step 2: Test the combined preview

Next, turn on the umbrella flag to test the conventions and defaults together:

{{< tabpane text=true >}}

{{% tab header="Environment variables" %}}

```text
OTEL_INSTRUMENTATION_COMMON_V3_PREVIEW=true
```

{{% /tab %}} {{% tab header="Declarative configuration" %}}

```yaml
instrumentation/development:
  java:
    common:
      v3_preview: true
```

{{% /tab %}} {{< /tabpane >}}

The umbrella enables the newer database, code, and messaging conventions and
**disables `/dup` for those domains**.

Check application startup, captured fields, and missing spans and metrics.
Confirm that dashboards and alerts work without the legacy fields, checking
values and units as well as names: a threshold expressed in milliseconds needs
conversion when its metric moves to seconds.

If something breaks and you can't tell whether a convention or a default change
caused it, turn the umbrella off and remove `/dup` from the step 1 settings to
test the new conventions alone.

## What to check

### Names, values, types, and units

The JDBC example above shows attribute renames, but a key rename alone will not
fix every query:

- **Names:** `db.client.connections.max` becomes `db.client.connection.limit`;
  replacing `connections` with `connection` alone is not enough.
- **Values:** `db.system: "mssql"` becomes
  `db.system.name: "microsoft.sql_server"`.
- **Units:** database connection-pool duration metrics move from milliseconds to
  seconds.
- **Consolidation:** `code.namespace` and `code.function` consolidate into
  `code.function.name`.

### Database endpoint identity

For database migration details, start with the [database semantic convention
stability migration guide][db-migration].

For supported database clients, `server.address` describes the configured
target, while `network.peer.address` identifies the endpoint actually contacted,
where available. For a cluster, the configured target can be a list of endpoints
instead of a single host. Review service graphs and dashboards grouped by
`server.address`: their grouping may change even though the attribute name has
not.

### Messaging trace structure

Messaging moves from semantic conventions [v1.24][messaging-1.24] to
[v1.43][messaging-1.43]. This affects both queries and the way a producer's work
connects to a consumer's work in a trace. For Kafka, the naming changes look
like this:

| Operation | Legacy span name | Preview span name |
| --------- | ---------------- | ----------------- |
| Send      | `orders publish` | `send orders`     |
| Receive   | `orders receive` | `poll orders`     |
| Process   | `orders process` | `process orders`  |

The operation now comes first, and its name reflects the client API. The old
`messaging.operation` attribute also splits into `messaging.operation.name` and
`messaging.operation.type`: for a Kafka poll, the name is `poll` and the type is
`receive`.

**Parent relationships change in some setups.** For Kafka processing one message
at a time, with the producer context propagated in the message, the parent
depends on how your consumer runs:

| Your setup                                                | Legacy                                                           | Preview                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Receive spans off (the default), no active span           | Process span is a child of the send span                         | Unchanged, plus a link to the send span                                    |
| Receive spans off, messages processed inside another span | Process span is a child of the send span                         | Process span is a child of the active span and only links to the send span |
| Receive spans on, no active span                          | Process span is a child of the receive span, in a separate trace | Process span is a child of the send span, in the same trace                |

When message processing runs inside an active application span, such as a
scheduled job span or a method span created by `@WithSpan`, the preview makes
that span the parent of the process span. The process span links to the
producer's span instead of using it as its parent. This also applies when
receive spans are enabled. Batch process spans can link to multiple messages and
do not follow this single-message parent model.

With receive spans on and no active consumer-side span, the single-message
example looks like this:

```text
Legacy                                   Preview
trace A                                  trace A
  orders publish        PRODUCER           send orders            PRODUCER
                                             └─ process orders    CONSUMER
trace B                                  trace B
  orders receive        CONSUMER           poll orders            CLIENT
    └─ orders process   CONSUMER             (link → send orders)
         (link → orders publish)
```

In the preview, the process span also links to the send span, even when that
span is its parent. The poll span now represents the client operation on its
own, and its kind changes from `CONSUMER` to `CLIENT`.

Receive spans remain opt-in. For Kafka in 2.32.0, enabling receive telemetry
also enables poll-duration metrics. With it disabled, the preview still records
consumed-message counts during processing, along with process duration. Where
legacy messaging metrics were emitted, as in Pulsar, the convention changes are:

| Legacy metric                | Preview metric                        |
| ---------------------------- | ------------------------------------- |
| `messaging.publish.duration` | `messaging.client.operation.duration` |
| `messaging.receive.duration` | `messaging.client.operation.duration` |
| `messaging.receive.messages` | `messaging.client.consumed.messages`  |
| _(none)_                     | `messaging.client.sent.messages`      |
| _(none)_                     | `messaging.process.duration`          |

Kafka gains the preview instruments in this table; it did not emit the legacy
instruments listed here. Do not expect `messaging/dup` to produce both sets for
Kafka.

### Capture settings and instrumentation defaults

The preview can add or remove telemetry as well as rename it. Suppose your
application already attaches `order.id` and `customer.tier` as structured fields
to a log message, using SLF4J key-value pairs. After enabling the umbrella
preview, those fields can appear in exported logs without enabling capture
separately. MDC remains separately configured and opt-in.

To capture only `order.id` from those structured fields:

{{< tabpane text=true >}}

{{% tab header="Environment variables" %}}

```text
OTEL_INSTRUMENTATION_COMMON_LOGGING_STRUCTURED_ATTRIBUTES_INCLUDED=order.id
```

{{% /tab %}} {{% tab header="Declarative configuration" %}}

```yaml
instrumentation/development:
  java:
    common:
      logging:
        structured_attributes:
          included: [order.id]
```

{{% /tab %}} {{< /tabpane >}}

The common `.included` / `.excluded` selectors replace the old source-specific
structured-field capture settings, which are ignored in preview mode. Review the
emitted fields when migrating: the new selectors support glob patterns, so `*`
means "include everything." When migrating other capture settings that used
literal-name lists, such as messaging `capture-headers`, copying `*` into the
corresponding `.included` selector can broaden capture.

Other default changes may be visible in your telemetry or at startup:

| What you may notice after enabling the preview                | What to check                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Additional structured log attributes                          | Review the common `.included` / `.excluded` selectors                      |
| Missing Hibernate, Hystrix, or Twilio spans                   | These instrumentations default to off; explicitly re-enable those you need |
| Agent/SDK initialization fails when using the Zipkin exporter | Zipkin exporter support is removed in preview mode; switch to OTLP         |

### Identity capture

If you capture user identity attributes, update the capture settings as well as
queries. The umbrella preview ignores the old
`otel.instrumentation.common.enduser.*.enabled` settings. Capture remains
opt-in: use `otel.instrumentation.common.user.name.enabled=true` and
`otel.instrumentation.common.user.roles.enabled=true` for the fields you need.

- `enduser.id` becomes `user.name`.
- `enduser.role`, a comma-separated string, becomes `user.roles`, a string
  array.
- `enduser.scope` has no replacement and is no longer captured.

### For extension and distribution maintainers

Extension and distribution maintainers should also test the preview:
invokedynamic instrumentation becomes the default, changing how instrumentation
and helper classes are loaded.

## Using AI to help with the migration

The [OpenTelemetry Ecosystem Explorer][explorer] provides version-specific
instrumentation metadata that can help an AI agent identify changes to names,
types, and units. Pair it with your captured `/dup` telemetry to confirm value
changes, then ask the agent to draft updates to your dashboards and alerts.

<details>
<summary>Example prompt to adapt to your stack</summary>

```text
Help migrate my dashboards and alerts to the Java agent 3.0 preview.

Agent version, libraries, and preview settings: <details>
Queries and backend naming conventions: <files or examples>
Baseline and preview telemetry: <files or samples>

Use the OpenTelemetry Ecosystem Explorer (https://explorer.opentelemetry.io/)
metadata for my version and my telemetry. Check the emission conditions against
my settings; use upstream sources to verify mappings the metadata cannot prove.

Return a cited old-to-new mapping and draft query changes. Check names, types,
values, and units; flag trace-shape or capture changes separately. Mark missing
or conflicting evidence VERIFY, including unavailable version metadata. Do not
assume missing metadata means no change. Preserve query intent and flag any
backend naming assumptions. Do not apply changes.
```

</details>

Review the proposed changes against real data before applying them.

## Tell us what you find

[Open an issue][issues] with your agent version, configuration, affected library
versions, and a small example of the unexpected behavior. Testing now gives us
time to address problems before 3.0 becomes the default.

[release-2.32.0]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v2.32.0
[java-agent]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation
[issues]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues
[decl-config]: /docs/zero-code/java/agent/declarative-configuration/
[explorer]: https://explorer.opentelemetry.io/
[dc-converter]:
  /docs/zero-code/java/agent/declarative-configuration/#convert-your-existing-configuration
[explorer-builder]:
  https://explorer.opentelemetry.io/java-agent/configuration/builder
[messaging-1.24]:
  https://github.com/open-telemetry/semantic-conventions/blob/v1.24.0/docs/messaging/messaging-spans.md
[messaging-1.43]:
  https://github.com/open-telemetry/semantic-conventions/blob/v1.43.0/docs/messaging/messaging-spans.md
[db-migration]: /docs/specs/semconv/non-normative/db-migration/

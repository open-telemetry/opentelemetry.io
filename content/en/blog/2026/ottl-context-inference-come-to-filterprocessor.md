---
title: OTTL context inference comes to the Filter Processor
linkTitle: OTTL context comes to Filter Processor
date: 2026-02-17
author: '[Kaise Cheng](https://github.com/kaisecheng) (Elastic)'
issue: 9190
sig: Collector SIG
cSpell:ignore: Kaise OTTL spanevent
---

Last year, the OpenTelemetry project introduced
[OTTL context inference for the transform processor](https://opentelemetry.io/blog/2025/ottl-contexts-just-got-easier/).
The goal was to allow users to write OTTL statements without worrying about
internal telemetry contexts.

Starting with **collector-contrib v0.146.0**, context inference is now available
in the
[Filter Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor)
through four new top-level config fields: `trace_conditions`,
`metric_conditions`, `log_conditions`, and `profile_conditions`.

In this post, we’ll look at what context inference means specifically for
filtering: how it simplifies configuration, how evaluation works under the hood,
and the few edge cases you should know about.

## The problem: context confusion

In the legacy configuration, writing filters requires understanding the
collector’s internal telemetry hierarchy. Conditions must be placed inside
specific context blocks such as `resource`, `span`, or `spanevent`.

The confusion becomes clearer with instrumentation scope filtering, for example:
`scope.name == "com.example.gateway"`

There is no dedicated `scope` block, so the condition has to be placed inside
one of the existing blocks:

```yaml
filter:
  traces:
    resource:
      - attributes["deployment.environment"] == "staging"
      # - scope.name == "com.example.gateway" # Fail
    span:
      - attributes["http.route"] == "/healthz"
      # - scope.name == "com.example.gateway" # Good
    spanevent:
      - name == "debug-log"
      # - scope.name == "com.example.gateway" # Only filters span events
```

Where the condition is placed changes how it behaves:

- Under `resource`: parsing fails, because `scope.name` is not a valid path in
  the resource context.
- Under `span`: this works. Spans from the matching scope are dropped.
- Under `spanevent`: this partially works. Only span events are filtered, and
  spans without events are never checked. The condition is evaluated in the span
  event context, so it only filters out span events from the matching scope.
  Spans that have no child span events are never evaluated against this
  condition, meaning they pass through the filter even if they belong to the
  matching scope.

Even though these rules describe one logical filtering intent, they must be
split across three different context blocks. From a user perspective, this feels
arbitrary. You just want to drop telemetry matching a condition, not reason
about collector internals. Writing filters becomes an exercise in remembering
where each field is allowed rather than simply stating what should be dropped.

## The new approach: conditions with context inference

### Basic configuration

Context inference removes this complexity. Instead of organizing rules by
context blocks, you write them as a flat list:

```yaml
filter:
  trace_conditions:
    - resource.attributes["deployment.environment"] == "staging" # inferred as resource context
    - scope.name == "com.example.gateway" # inferred as scope context
    - span.attributes["http.route"] == "/healthz" # inferred as span context
    - spanevent.name == "debug-log" # inferred as spanevent context
```

Each condition includes a simple prefix (`resource`, `scope`, `span`,
`spanevent`), and the processor automatically infers its execution context from
that prefix.

No guessing. No hidden placement rules.

All conditions are combined using logical OR: if any condition matches, the
telemetry is dropped.

### Advanced configuration

For more complex filtering logic, conditions can be grouped and given their own
settings such as `error_mode`:

```yaml
filter:
  error_mode: ignore
  log_conditions:
    - error_mode: propagate
      conditions:
        - log.severity_number < SEVERITY_NUMBER_WARN
    - error_mode: silent
      conditions:
        - resource.attributes["service.name"] == "noisy-service"
```

This allows different condition groups to fail differently. For example, one can
propagate errors while another ignores them.

## How the Filter Processor evaluates conditions

Context inference in the Filter Processor does more than simplify configuration.
It also changes how conditions are evaluated. Understanding this helps you write
more efficient filters.

### Hierarchical execution

Conditions are grouped by their inferred context and executed from higher levels
to lower ones:

- **Traces**: resource → scope → span → spanevent
- **Metrics**: resource → scope → metric → datapoint
- **Logs**: resource → scope → log
- **Profiles**: resource → scope → profile

If a higher-level condition matches, the processor immediately drops that
subtree and skips evaluating lower levels.

For example, once a resource matches a drop rule, its spans and span events are
never inspected. This short-circuit behavior avoids unnecessary work and
improves performance.

### Cross-context conditions

A single condition can reference paths from different contexts:

```yaml
trace_conditions:
  - resource.attributes["host.name"] == "localhost" or spanevent.name ==
    "grpc.timeout"
```

When this happens, the processor evaluates the condition in the **lowest** (most
specific) context. In this case, that's `spanevent`.

In practice, the condition is evaluated once for each span event. During that
evaluation, the span event can still access fields from its parent span and
resource. So for every span event, the processor checks whether the parent
resource’s `host.name` is `localhost` **or** whether the span event’s own name
is `grpc.timeout`. Matching span events are dropped, while the parent span
itself is not removed.

If your intention is to drop entire resources, split the rules:

```yaml
trace_conditions:
  - resource.attributes["host.name"] == "localhost"
  - spanevent.name == "grpc.timeout"
```

Now the resource rule removes the full subtree, while the span-event rule
removes only matching events.

## When inference needs explicit context

Most of the time, inference works automatically. But some combinations of paths,
functions, and enums cannot be evaluated in a single condition. For example:

```yaml
trace_conditions:
  - IsRootSpan() or spanevent.name == "bar"
```

This fails because:

- `IsRootSpan()` is valid only in the span context
- `spanevent.name` requires the span event context

Since no single context supports both, the condition must be split:

```yaml
trace_conditions:
  - context: span
    conditions:
      - IsRootSpan()
  - conditions:
      - spanevent.name == "bar"
```

Because `IsRootSpan()` has no path prefix, you must explicitly specify its
context.

Quick rule:

- Path prefixes → inference works automatically
- Functions/enums without prefixes → specify context manually

## Migration and compatibility

The legacy configuration format (`traces.resource`, `traces.span`, and similar
fields) remains fully supported and backwards compatible.

However, the new `*_conditions` fields offer a simpler, clearer, and more
flexible way to configure filtering when you’re ready to adopt them.

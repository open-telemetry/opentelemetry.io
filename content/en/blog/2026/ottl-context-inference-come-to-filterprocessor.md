---
title: OTTL context inference comes to the Filter Processor
linkTitle: Context inference for filtering
date: 2026-03-02
author: '[Kaise Cheng](https://github.com/kaisecheng) (Elastic)'
issue: 9190
sig: Collector SIG
cSpell:ignore: Kaise OTTL spanevent
---

Last year, the OpenTelemetry project introduced
[OTTL context inference for the transform processor](/blog/2025/ottl-contexts-just-got-easier/).
The goal was to allow users to write OTTL statements without worrying about
internal telemetry contexts.

Starting with **collector-contrib v0.146.0**, context inference is available in
the
[Filter Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor)
through four new top-level config fields: `trace_conditions`,
`metric_conditions`, `log_conditions`, and `profile_conditions`.

In this post, we’ll look at what context inference means specifically for
filtering: how it simplifies configuration and how evaluation works.

## The issue: OTTL context confusion

In the legacy configuration, writing filters required understanding the OTel
Collector’s internal telemetry hierarchy. Conditions must be placed inside
specific OTTL context blocks such as `resource`, `span`, or `spanevent`.

```yaml
filter:
  traces:
    span:
      - resource.attributes["host.name"] == "localhost"
      - attributes["container.name"] == "app_container_1"
      - name == "app_3"
    spanevent:
      - attributes["grpc"] == true
      - IsMatch(name, ".*grpc.*")
```

Even though these rules describe one logical filtering intent, they are required
to be split across distinct context blocks. This requirement shifts attention
toward Collector internals instead of the filtering logic itself.

## The new approach: Conditions with OTTL context inference

### Basic configuration

Context inference removes this complexity. Instead of organizing conditions by
context blocks, they are written as a flat list using the
[basic configuration](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor/README.md#basic-config)
style:

```yaml
filter:
  trace_conditions:
    - resource.attributes["host.name"] == "localhost" # inferred as resource context
    - span.attributes["container.name"] == "app_container_1" # inferred as span context
    - span.name == "app_3" # inferred as span context
    - spanevent.attributes["grpc"] == true # inferred as spanevent context
    - IsMatch(spanevent.name, ".*grpc.*") # inferred as spanevent context
```

Each path includes a simple prefix (`resource`, `scope`, `span`, `spanevent`),
and the processor automatically infers its execution context from that prefix.

This greatly simplifies configuration by combining all conditions with a logical
OR: if any condition matches, the telemetry is dropped.

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

This allows different condition groups to fail differently. For example, one
condition can propagate errors while another ignores them.

### Cross-context conditions

A single condition can reference paths from different contexts:

```yaml
trace_conditions:
  - resource.attributes["host.name"] == "localhost" or spanevent.name ==
    "grpc.timeout" # inferred as spanevent context
```

In this example, the condition is evaluated for each span event.

As a result:

- span events whose name is `grpc.timeout` are dropped
- span events belonging to resources with `host.name` set to `localhost` are
  also dropped
- the parent spans themselves are not removed, only the matching span events

### Hierarchical execution

Conditions are grouped by their inferred context and executed from higher levels
to lower levels:

- **Traces**: resource → scope → span → spanevent
- **Metrics**: resource → scope → metric → datapoint
- **Logs**: resource → scope → log
- **Profiles**: resource → scope → profile

If a higher-level condition matches, the processor immediately drops that
subtree and skips evaluating lower levels.

For example, once a resource matches a drop rule, its spans and span events are
never inspected. This short-circuit behavior avoids unnecessary work and
improves performance.

For more information about how context inference is evaluated, see the
[Filter Processor context inference documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9c4165139f101a43895d9273192ddb9ae3204844/processor/filterprocessor#context-inference).

## Migration and compatibility

The legacy configuration format (`traces.resource`, `traces.span`, and similar
fields) remains fully supported and backwards compatible for the foreseeable
future.

## Try it out

The new `*_conditions` fields provide a simpler way to express filtering rules
by removing the need to manually select execution contexts. This makes filter
configuration easier to read, easier to maintain, and closer to the intent of
the rule itself.

We welcome your feedback, and we’d love to hear about your experience using it.
You can reach us in the
[#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) channel
in the [CNCF Slack](https://slack.cncf.io/) workspace.

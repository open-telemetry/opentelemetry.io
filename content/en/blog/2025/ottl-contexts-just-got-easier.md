---
title: OTTL contexts just got easier with context inference
linkTitle: OTTL contexts just got easier
date: 2025-02-17
author: '[Edmo Vamerlatti Costa](https://github.com/edmocosta) (Elastic)'
draft: true # TODO: remove this line once your post is ready to be published
issue: 6289
sig: Collector SIG
cSpell:ignore: OTTL Vamerlatti
---

Selecting the right context for running OTTL statements can be challenging, even
for experienced users. Choosing the correct context impacts both accuracy and
efficiency, as using higher-level contexts can avoid unnecessary iterations
through nested lower-level contexts.

To simplify this process, the OpenTelemetry community is excited to announce
OTTL
[context inference](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md#context-inference)
support for the
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor).
This feature removes the need to manually specify contexts, improving statement
processing efficiency by automatically selecting the most appropriate one. This
optimization ensures that data transformations are both accurate and performant.

## How does it work?

Starting with version `0.120.0`, the transform processor supports two new
[context-inferred configuration](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md#context-inferred-configurations)
styles. The first one closely resembles the existing configuration format, while
the second offers a simpler and flatter approach.

### Structured configuration

The context-inferred structured configuration style closely resembles the
existing format. For example, consider the following configuration:

```yaml
metric_statements:
  - context: datapoint
    statements:
      - set(metric.description, "counter") where attributes["my.attr"] == "some"
```

It can now be written as:

<!-- prettier-ignore-start -->
```yaml
metric_statements:
  - statements:
      - set(metric.description, "counter") where datapoint.attributes["my.attr"] == "some"
```
<!-- prettier-ignore-end -->

In this example, the `context` value is omitted and is automatically inferred
to `datapoint`, as it is the only context present in the statements that
supports parsing both`datapoint` and `metric` data.

To omit the `context` value, all paths in the statements must be prefixed with their respective contexts.
These prefixes are required for context-inferred configurations and serve as
hints for selecting the best match. It also makes statements unambiguous and
portable between components.

If we update the above configuration removing the `where` condition:

```yaml
metric_statements:
  - statements:
      - set(metric.description, "counter")
```

The context inferrer would select the `metric` context instead, since
no data points are accessed. Although it would be possible to run the
statements using the`datapoint` context, `metric` is the most efficient option.

### Flat configuration

The flat configuration style simplifies configuration by allowing users to
list all statements together, without worrying about contexts or extra
configuration structures. This style support statements from multiple contexts
and does not require grouping them separately.

To illustrate this, compare the following configuration:

```yaml
metric_statements:
  - context: resource
    statements:
      - keep_keys(attributes, ["host.name"])
  - context: metric
    statements:
      - set(description, "Sum") where type == "Sum"
      - convert_sum_to_gauge() where name == "system.processes.count"
  - context: datapoint
    statements:
      - limit(attributes, 100, ["host.name"])
```

With the new flat configuration style, the same logic is expressed more
concisely:

```yaml
metric_statements:
  - keep_keys(resource.attributes, ["host.name"])
  - set(metric.description, "Sum") where metric.type == "Sum"
  - convert_sum_to_gauge() where metric.name == "system.processes.count"
  - limit(datapoint.attributes, 100, ["host.name"])
```

This streamlined approach enhances readability and makes configuration more
intuitive.

## Try it out

As we wrap up, we encourage users to explore this new functionality and take
advantage of its benefits in their telemetry pipelines!

If you have any questions or suggestions, we’d love to hear from you! Join the
conversation in the `#otel-collector` channel on the
[CNCF Slack workspace](https://slack.cncf.io/).

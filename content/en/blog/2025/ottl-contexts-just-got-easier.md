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

Selecting the right OTTL context for running statements can be challenging, even
for experienced users. Choosing the correct option impacts both accuracy and
efficiency, as using higher-level OTTL contexts can avoid unnecessary iterations
through nested lower-level contexts.

To simplify this process, the OpenTelemetry community is excited to announce
OTTL
[context inference](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md#context-inference)
support for the
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor).
This feature removes the need for users to understand the underlying context
concept of OTTL, allowing them to focus solely on their data. It also improves
statement processing efficiency by automatically selecting the most appropriate
OTTL context. This optimization ensures that data transformations are both
accurate and performant.

## How does it work?

Starting with version `0.120.0`, the transform processor supports two new
[context-inferred configuration](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md#context-inferred-configurations)
styles. The first one offers a simpler and flatter approach, while the second
closely resembles the existing configuration format.

### Flat configuration

The flat configuration style simplifies configuration by allowing users to list
all statements together, without worrying about OTTL contexts or extra
configuration structures. This style support statements from multiple OTTL
contexts and does not require grouping them separately.

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
concisely by simply providing a list of statements:

```yaml
metric_statements:
  - keep_keys(resource.attributes, ["host.name"])
  - set(metric.description, "Sum") where metric.type == "Sum"
  - convert_sum_to_gauge() where metric.name == "system.processes.count"
  - limit(datapoint.attributes, 100, ["host.name"])
```

This streamlined approach enhances readability and makes configuration more
intuitive. To use this flat configuration, all paths in the statements must be
prefixed with their respective OTTL contexts. These prefixes are required for
all context-inferred configurations and serve as hints for selecting the best
match. It also makes statements unambiguous and portable between components
using OTTL.

### Structured configuration

The context-inferred structured configuration style closely resembles the
existing format and allows users to leverage the benefits of context inference
while providing granular control over statement configurations, such as
`error_mode` and `conditions`. For example, consider the following
configuration:

<!-- prettier-ignore-start -->
```yaml
metric_statements:
  - context: datapoint
    conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter") where attributes["my.attr"] == "some"
```
<!-- prettier-ignore-end -->

The above can now be written as:

<!-- prettier-ignore-start -->
```yaml
metric_statements:
  - conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter") where datapoint.attributes["my.attr"] == "some"
```
<!-- prettier-ignore-end -->

In this example, the `context` value is omitted and is automatically inferred to
`datapoint`, as it is the only OTTL context present in the statements that
supports parsing both `datapoint` and `metric` data.

If we update the above configuration removing the `datapoint` usage:

<!-- prettier-ignore-start -->
```yaml
metric_statements:
  - conditions:
      - resource.attributes["service.name"] == "my.service"
    statements:
      - set(metric.description, "counter")
```
<!-- prettier-ignore-end -->

The context inferrer would select the `metric` OTTL context instead, since no
data points are accessed. Although it would be possible to run the statements
using the `datapoint` OTTL context, `metric` is the most efficient option.

### Which configuration style should I choose?

The [flat configuration](#flat-configuration) style is best suited for scenarios
where simplicity and ease of use are paramount. It is ideal for simple use cases
where your configuration needs are straightforward and do not require the use of
additional configurations keys, allowing you to quickly set up your statements
with minimal effort and without needing to understand the underlying concept of
OTTL contexts.

The [structured configuration](#structured-configuration) style is more detailed
and allows the use of additional configuration keys such as `error_mode` and
`conditions`. It supports statements from multiple OTTL contexts. However,
unlike the flat configuration style, it may require splitting them into separate
configuration groups (see
[context inference](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor#context-inference)).
In terms of performance, the structured configuration is slightly faster than
the flat configuration, making it a better choice for complex scenarios or
configurations with a high number of statements.

## Try it out

As we wrap up, we encourage users to explore this new functionality and take
advantage of its benefits in their telemetry pipelines!

If you have any questions or suggestions, we’d love to hear from you! Join the
conversation in the `#otel-collector` channel on the
[CNCF Slack workspace](https://slack.cncf.io/).

---
title:
  'Versioned metrics: Shipping the first Release Candidate metrics in
  hostmetrics'
linkTitle: Versioned metrics in hostmetrics
date: 2026-10-13
author: >-
  [Dónal O'Sullivan](https://github.com/osullivandonal)(Elastic)
issue: 11728
sig: System
# prettier-ignore
cSpell:ignore: Dónal hostmetrics iowait mdatagen otelcontribcol processscraper
---

OpenTelemetry Collector Contrib v0.160.0 adds the ability to emit release
candidate (RC) process semantic conventions metrics to the hostmetrics
receiver’s process scraper, the last stage before a stable v1. The System SIG
has worked on this for the better part of a year, and we think that the process
metrics are in a good shape – but RC exists so the community can prove that. If
you collect process metrics, we'd like you to try the new versioned output and
tell us what breaks.

## Why stabilizing the hostmetrics receiver was blocked

The process scraper’s metrics have changed in OpenTelemetry semantic
conventions. Aligning with those conventions means changing metric names, types,
and attributes that users already depend on, so we could not simply edit the
definitions in place and create a release.

The usual tool for behaviour changes in the Collector is a feature gate, but a
gate only switches between code paths that already exist. What we needed was for
both the legacy and RC definitions of a metric to exist in the code at once,
selectable per metric, so that end users could opt in to using the new metrics.
Ideally this would be done without affecting the user's configuration schema.

That requirement runs into the configuration schema `metadata.yaml`. This file
defines which metrics and attributes are emitted by a receiver and how they are
emitted. Each scraper in the hostmetrics receiver has one of these files, and
[mdatagen](https://github.com/open-telemetry/opentelemetry-collector/tree/62cdad2ea133239380b44d20d84eb26e114779b6/cmd/mdatagen?from_branch=main)
generates the emission code from it. Two definitions of `<metric>` cannot live
in one file when they share a name but differ in type or attributes.

The System SIG landed on two distinct paths to solve this problem, as discussed
in
[the GitHub issue for versioned metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/45592).

1. Use two different configuration schemas for legacy and RC metrics.
2. Use the one configuration schema with both legacy and RC metrics.

The first was to keep the legacy and RC metrics in separate schemas. This
sidestepped the naming conflict, but the `metrics:` block in `metadata.yaml` is
what generates the `metrics:` block end users use to write their collector
configuration, so two schema files means two user config blocks, and every
existing user has to edit their config at some point, either on upgrade or when
the legacy block is eventually removed.

The second was to let both definitions live in one file and update mdatagen to
handle name conflicts. That costs users nothing and gives component maintainers
a single `metadata.yaml` file to work with, but it meant changing mdatagen
itself in the collector core repository before the scraper work could begin.

The System SIG chose the second: versioned metrics, with feature gates driving
the migration. The rest of this post is what it looks like for a component
codeowner doing one of these migrations.

## Adding versioned metrics to mdatagen

To version a metric, we added suffix support to mdatagen, using `@` to mark the
version, for example `<metric-name>@<version-number>`. We chose `@` because it
is not valid in an OTel metric name, so it cannot collide with anything real.
The suffix exists only as a key in `metadata.yaml`; it is stripped at emission
time, so the metric a backend receives is named `process.cpu.utilization`, not
`process.cpu.utilization@v1`.

Next we updated mdatagen’s schema `metadata-schema.yaml`, which defines the
fields a component’s `metadata.yaml` may use. We added a `migration` field to
the metrics section to describe the path from a legacy metric to its versioned
replacement.

```yaml
metrics:
  # Optional: migration/aliasing information to support dual-schema emission.
  # When present, generated code will emit this metric and the target metric
  # according to the gates specified below.
  migration:
    # Required: target metric key in this metadata file to emit to during migration.
    to: string
    # Required: feature gates controlling emission. The referenced gates must be
    # declared under feature_gates below in this file.
    through_gates:
      # Required: when enabled, emission of the old (current) metric is disabled.
      disable_old: string
      # Required: when enabled, emission of the new (target) metric is enabled.
      enable_new: string
```

The migration path provides the `through_gates` which define the feature gates
used for the migration: `disable_old` disables the old legacy metrics when
enabled, and `enable_new` enables the RC metrics when enabled. Below we can see
a snippet taken from the process scraper's
[`metadata.yaml`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/47fd6d863a675e4e653418084645cccbc16aeb8b/receiver/hostmetricsreceiver/internal/scraper/processscraper/metadata.yaml?plain=1#L187)
file, which demonstrates the approach.

```yaml
process.cpu.utilization:
  enabled: false
  description: >-
    Percentage of total CPU time used by the process since last scrape,
    expressed as a value between 0 and 1. On the first scrape, no data point is
    emitted for this metric.
  unit: '1'
  stability: development
  gauge:
    value_type: double
  attributes: [state]
  migration:
    to: process.cpu.utilization@v1
    through_gates:
      disable_old: scraper.process.DontEmitV0SystemConventions
      enable_new: scraper.process.EmitV1SystemConventions

process.cpu.utilization@v1:
  enabled: false
  description: >-
    Difference in process.cpu.time since the last measurement, divided by the
    elapsed time and number of CPUs available to the process. On the first
    scrape, no data point is emitted for this metric.
  unit: '1'
  stability: beta
  gauge:
    value_type: double
  attributes: [cpu.mode]
```

> [!NOTE]
>
> You may notice the example here uses `stability: beta`. This is due to
> mdatagen not defining a stability level for RC, so here we are using beta
> since the next stability level after beta is stable.

Next we updated the templates to handle versioned metrics. Templates are used in
mdatagen to define what the generated Go code looks like. This was to ensure
that naming clashes wouldn't happen when you have two metrics of the same name,
for example, `process.cpu.utilization` vs `process.cpu.utilization@v1`. The
update allows mdatagen to generate code for the two different metrics without
any clashes. This work was done in the Collector core repository; see
[the mdatagen versioned metrics PR](https://github.com/open-telemetry/opentelemetry-collector/pull/15309).

Finally, the System SIG defined rules that we must follow for versioned metrics.
This boiled down to handling conflicts during double publishing, meaning if we
emit metrics of the same name. This would occur when emitting both legacy and RC
metrics. To handle this, an RFC was published with the following rules; see
[the semantic conventions feature gates RFC](https://github.com/open-telemetry/opentelemetry-collector/blob/71f0462d5460ad3055201fd0f17658e56362d63a/docs/rfcs/semconv-feature-gates.md#handling-conflicts-during-double-publishing).

- **Different attributes**: If a metric name stays the same but an attribute is
  renamed, emit a single metric with both the v0 and v1 attributes present. For
  instance, if `process.cpu.time` uses `process.owner` in v0 and
  `process.owner.name` in v1, emit one metric with both attributes.
- **Different metric type**: If a metric name stays the same but the type
  changes (e.g., Gauge to UpDownCounter), emit a single metric with the v1 type,
  effectively prioritizing the new convention. For instance, if
  `system.memory.usage` changes from Gauge to UpDownCounter, emit it as an
  UpDownCounter.

These rules trigger when you leave the `disable_old` gate off and enable the RC
metrics with `enable_new`, since this allows emitting both legacy and RC
metrics. To follow these rules, mdatagen was also updated so the generated code
handles them. In this scenario we log a warning to inform the end user that the
legacy metric was disabled and that both attributes will be emitted under the RC
metric. This happens because we cannot double write both legacy and latest
metrics if their name is the same. An example of this is shown in the YAML
above, where `process.cpu.utilization` is versioned but the attribute has
changed.

Next, if the metric's type has changed and its name in legacy and RC is the
same, we also disable the legacy metric and only emit the RC metric; again this
is logged as a warning.

Handling the RFC rules in the generated code moves the burden of following them
off component maintainers and into the generated code, making the migration from
legacy to RC semantic conventions seamless.

## The process scraper at RC

The process scraper in the hostmetrics receiver is the first component to adopt
this versioned metrics approach. First the process semantic conventions were
promoted to release candidate, this was done in
[this PR](https://github.com/open-telemetry/semantic-conventions/pull/3758).

We use the migration path defined in the process scraper's `metadata.yaml` file
to define legacy and RC feature gates. Once the schema was updated with the new
release candidate metrics and attributes, the new code was generated with the
updated mdatagen tooling. This provided the correct migration path.

The following metrics and attributes were updated and versioned:

| Legacy metric                   | RC metric                               | Unit change                     | Attribute change                                      |
| ------------------------------- | --------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `process.context_switches`      | `process.context_switches@v1`           | `{count}` → `{context_switch}`  | `context_switch_type` → `process.context_switch.type` |
| `process.cpu.time`              | `process.cpu.time@v1`                   | none                            | `state` → `cpu.mode`                                  |
| `process.cpu.utilization`       | `process.cpu.utilization@v1`            | none                            | `state` → `cpu.mode`                                  |
| `process.disk.io`               | `process.disk.io@v1`                    | none                            | `direction` → `disk.io.direction`                     |
| `process.handles`               | `process.windows.handle.count@v1`       | `{count}` → `{handle}`          | none                                                  |
| `process.open_file_descriptors` | `process.unix.file_descriptor.count@v1` | `{count}` → `{file_descriptor}` | none                                                  |
| `process.paging.faults`         | `process.paging.faults@v1`              | `{faults}` → `{fault}`          | `paging_fault_type` → `system.paging.fault.type`      |
| `process.threads`               | `process.thread.count@v1`               | `{threads}` → `{thread}`        | none                                                  |

Here is a simple guide on how to emit the legacy or the RC metrics from the
process scraper. First we need a simple collector configuration for the process
scraper. In this example we are also enabling `process.cpu.utilization` to
demonstrate that the user's configuration doesn’t need to mention the RC metrics
for them to be emitted, if the legacy metric was enabled:

```yaml
receivers:
  hostmetrics:
    collection_interval: 5s
    scrapers:
      process:
        metrics:
          process.cpu.utilization:
            enabled: true

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      exporters: [debug]
```

Next, to use the RC process scraper we must provide the feature gate to emit the
RC metrics. As of v0.160.0 this is required, as the feature gates are in alpha,
meaning they are turned off by default:

```sh
./otelcontribcol<your-local-system-image> --config=<your-config>.yaml --feature-gates=scraper.process.EmitV1SystemConventions
```

Once the scraper is running, notice the log output:

```text
[WARNING] Legacy metric `process.cpu.time` disabled: same emitted name as `process.cpu.time@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.cpu.utilization` disabled: same emitted name as `process.cpu.utilization@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["state"], "latest_attributes": ["cpu.mode"]}
...
[WARNING] Legacy metric `process.disk.io` disabled: same emitted name as `process.disk.io@v1` with different attributes; only latest will be emitted with combined attributes    {"resource": {"service.instance.id": "60c55fb8-c66b-4345-aef5-abb193e79a0d", "service.name": "otelcontribcol", "service.version": "0.161.0-dev"}, "otelcol.component.id": "hostmetrics", "otelcol.component.kind": "receiver", "otelcol.signal": "metrics", "scraper": "process", "legacy_attributes": ["direction"], "latest_attributes": ["disk.io.direction"]}
```

We can see that we are logging three warnings: one for the `process.cpu.time`
metric, one for `process.cpu.utilization`, and one for `process.disk.io`. This
is because the v1 versions of these metrics have different attributes compared
to the legacy versions. The generated code logs a warning to show that
internally we are only emitting the RC metric here and not the legacy metric,
due to the double publishing issue described in the RFC above.

And here we can see the actual metrics with their attributes. Notice that the
user's configuration didn’t need to mention the RC metric
`process.cpu.utilization@v1`, but we are only emitting the RC metric here since
both the legacy and RC metric share the same name but their attributes differ.
In this case the legacy metric's attribute is `state` and the RC metric's
attribute is `cpu.mode`.

```text
Metric #1
Descriptor:
     -> Name: process.cpu.utilization
     -> Description: Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process. On the first scrape, no data point is emitted for this metric.
     -> Unit: 1
     -> DataType: Gauge
NumberDataPoints #0
Data point attributes:
     -> cpu.mode: Str(user)
     -> state: Str(user)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001253
NumberDataPoints #1
Data point attributes:
     -> cpu.mode: Str(system)
     -> state: Str(system)
StartTimestamp: 2026-09-16 09:27:59.35 +0000 UTC
Timestamp: 2026-09-16 09:28:06.413091903 +0000 UTC
Value: 0.001003
NumberDataPoints #2
Data point attributes:
     -> cpu.mode: Str(iowait)
     -> state: Str(wait)
```

The versioned metrics approach allows us to not break the user's configuration.
If you were emitting `process.cpu.utilization` in your configuration, to emit
the latest RC version of that metric you just have to use the feature gate
`scraper.process.EmitV1SystemConventions`.

## From RC to stable

The next step toward stability in the process scraper is to wait six months. The
System SIG wants the community to try the process scraper at RC, which gives end
users time to find out whether the RC metrics and attributes break their
dashboards. If they emit the RC metrics only, do their queries return what they
expect, and do their dashboards still render? Where they don't, the RC period is
the window to update them. You can report any feedback you have to the System
SIG Slack channel
[#otel-system-metrics](https://cloud-native.slack.com/archives/C05CTFE9U4A?link-check=no&last-validated=2026-10-05)
on the [CNCF Slack](https://slack.cncf.io/).

Once the six months have passed, we can move the process scraper to stable. That
means verifying it satisfies the
['stable' stability criteria](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable),
which covers testing, benchmarking, documentation, and telemetry stability.
Moving the scraper to stable means promoting the migration feature gates to
beta, meaning that both will be on by default, which will remove the legacy
metrics. Users can still emit legacy metrics if needed by disabling both gates.
See
[the feature gates guide](https://github.com/open-telemetry/opentelemetry-collector/blob/ac085a4d9f1bdaf3eb90aaebc9a3815f4e00954d/featuregate/README.md?plain=1#L1).

## Future stability of hostmetrics

Being able to version metrics and give them a migration path unblocks the
broader plan to stabilise the hostmetrics receiver. The process scraper is the
first component to use it, but the mechanism lives in mdatagen in the Collector
core repository, so any component facing a semantic convention change can now
follow the same path.

The System SIG is working towards promoting the system namespace to RC in
semantic conventions – the `system.*` metrics covering CPU, memory, disk,
network, and filesystem, which is most of what is left in hostmetrics. That work
has already begun. Once those conventions reach RC, we can start promoting the
system metrics and attributes in the hostmetrics receiver, scraper by scraper,
using the same versioned metrics approach.

---
title: OBI Config v2 reference
linkTitle: Config v2 reference
description:
  Learn how to configure standalone OBI or the OBI Collector receiver with
  Config v2.
weight: 3
# prettier-ignore
cSpell:ignore: Aerospike jsonrpc ollama openai qwen rerank sattributes SIGUSR sqlpp
---

Config v2 is available in OBI v0.11.0 and later. It uses the OpenTelemetry
declarative configuration structure. Common settings such as resources,
sampling, and exporters remain at the root of the document, while OBI-specific
settings are grouped under `extensions.obi`.

If you already have a Config v1 file, use the
[Config v1 to v2 migration guide](../migrate-to-config-v2/) instead of rewriting
it by hand.

## Choose a configuration structure

How you structure the configuration depends on how you run OBI:

- **Standalone OBI**: Use a complete OpenTelemetry declarative configuration
  document. Define common OpenTelemetry settings at the root of the document and
  OBI settings under `extensions.obi`.
- **OBI Collector receiver**: Define OBI capture settings directly under
  `receivers.obi`. Use the Collector pipeline to configure resource enrichment,
  processing, and export.

## Configure standalone OBI

The following example instruments one executable and writes traces to standard
output. Before you use this configuration in production, replace the executable
path and configure an exporter.

```yaml
file_format: '1.0'

extensions:
  obi:
    version: '2.0'
    capture:
      policy:
        default_action: exclude
      rules:
        - action: include
          match:
            process:
              exe_path_glob: ['/path/to/your/application']
    daemon:
      logging:
        debug_trace_output: text
```

Before you start OBI, validate the configuration file:

```sh
obi config validate ./obi-v2.yaml
```

### Configuration structure

```yaml
file_format: '1.0'
log_level: info

resource: {}
tracer_provider: {}
meter_provider: {}

extensions:
  obi:
    version: '2.0'
    capture: {}
    enrich: {}
    correlation: {}
    daemon: {}
```

Both version fields are required, but they identify different schemas:

- `file_format: "1.0"` identifies the OpenTelemetry declarative configuration
  schema.
- `extensions.obi.version: "2.0"` identifies the OBI configuration schema.
  Currently, `"2.0"` is the only supported value.

Do not set either field to the OBI release version.

### Supported top-level fields

OBI v0.11.0 supports the following OpenTelemetry declarative configuration
fields:

| Field                        | Support                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `file_format`                | Required. The supported value is `"1.0"`.                                                                                   |
| `log_level`                  | Sets OBI logging. Trace and debug levels map to `DEBUG`; info to `INFO`; warning to `WARN`; and error and fatal to `ERROR`. |
| `resource`                   | Supports string attributes named `host.name`, `host.id`, `service.name`, and `service.namespace`.                           |
| `tracer_provider.sampler`    | Supports always-on, always-off, trace-ID-ratio, and simple parent-based forms of those samplers.                            |
| `tracer_provider.processors` | Supports one batch processor with one OTLP exporter.                                                                        |
| `meter_provider.readers`     | Supports at most one periodic OTLP reader and one Prometheus development pull reader.                                       |

For example, set a fixed service identity with string resource attributes:

```yaml
resource:
  attributes:
    - name: service.name
      value: checkout
    - name: service.namespace
      value: shop
```

When you validate a standalone configuration, OBI reports an error for
unsupported pipeline fields instead of ignoring them. In v0.11.0, do not use
`attribute_limits`, `instrumentation/development`, or `logger_provider`. It also
rejects `disabled: true`, a nonempty `distribution`, and a nonempty
`propagator`.

For Config v2 OTLP/gRPC and OTLP/HTTP exporter examples, see
[Configure exporters](../migrate-to-config-v2/#configure-exporters). For general
information about how OBI exports telemetry, see
[Configure data export](../export-data/).

## Select workloads

Use `capture.policy` and `capture.rules` to specify which workloads OBI
instruments. OBI evaluates the rules in the order that you define them.

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      policy:
        default_action: exclude
        match_order: first_match_wins
        min_process_age: 5s
      rules:
        - action: exclude
          name: exclude-system-namespaces
          match:
            kubernetes:
              namespace_glob: ['kube-system', 'monitoring']
        - action: include
          name: checkout-service
          match:
            process:
              open_ports: '8080,9090-9091'
              exe_path_glob: ['/srv/checkout-*']
```

If you omit `default_action`, OBI includes workloads by default. To instrument
only the workloads that match your rules, set `default_action` to `exclude` and
add one or more include rules.

Set `match_order` to `first_match_wins` or `last_match_wins`. Exclusions always
take precedence at runtime. With `first_match_wins`, place exclude rules before
include rules. With `last_match_wins`, place exclude rules after include rules.

When you set `rules`, the list replaces OBI's built-in exclusions for OBI and
Collector binaries, common system namespaces, and services that already export
OTLP. This also applies to `rules: []`, which removes every built-in exclusion.
Preserve any exclusions that you still need. The migration command writes these
exclusions into the generated list; keep them unless you intend to replace them.

### Process match fields

| Field                             | Value                                                              |
| --------------------------------- | ------------------------------------------------------------------ |
| `open_ports`                      | Comma-separated ports and ranges, such as `"8080,9090-9091"`       |
| `target_pids`                     | Array of process IDs                                               |
| `language_glob`, `language_regex` | Programming language match                                         |
| `cmd_args_glob`, `cmd_args_regex` | Command-line argument match                                        |
| `exe_path_glob`, `exe_path_regex` | Executable path match                                              |
| `containers_only`                 | Match only container workloads                                     |
| `exports_otlp`                    | Match a process that exports OTLP on a given `port` and `protocol` |

Provide an array of values for glob fields and one expression for regular
expression fields.

### Kubernetes match fields

| Field                                      | Value                                        |
| ------------------------------------------ | -------------------------------------------- |
| `namespace_glob`, `namespace_regex`        | Kubernetes namespace match                   |
| `metadata_glob`, `metadata_regex`          | Map of Kubernetes metadata fields to matches |
| `pod_labels`, `pod_labels_regex`           | Map of pod labels to matches                 |
| `pod_annotations`, `pod_annotations_regex` | Map of pod annotations to matches            |

Supported metadata keys include pod, deployment, ReplicaSet, DaemonSet,
StatefulSet, Job, CronJob, owner, and container names.

### Refine a matched workload

Use the `refine` block in an include rule to override signal export and HTTP
route settings for matching workloads:

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      rules:
        - action: include
          name: staging
          match:
            kubernetes:
              namespace_glob: ['staging-*']
          refine:
            exports:
              traces: false
              metrics: true
        - action: include
          name: orders
          match:
            kubernetes:
              namespace_glob: ['orders']
          refine:
            http:
              routes:
                incoming:
                  patterns: ['/orders/{id}']
                  ignored_patterns: ['/health']
                  unmatched: path
```

In v0.11.0, `refine` supports `exports` and `http.routes`. It does not support a
nonempty `http.filters` field or per-workload sampling. Configure sampling for
all workloads with `tracer_provider.sampler`.

When multiple rules match a workload, a rule does not inherit refinements that
you omit from an earlier rule. If rules can overlap, specify each refinement
explicitly and test the resulting behavior.

## Configure capture

Use `extensions.obi.capture` to configure how OBI selects workloads and captures
telemetry. You can use the following settings with standalone OBI and the OBI
Collector receiver:

| Section           | Purpose                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `policy`, `rules` | Select workloads and apply per-workload refinements.                                         |
| `instrumentation` | Enable and tune application protocols.                                                       |
| `runtimes`        | Control Go, Node.js, and Java runtime instrumentation.                                       |
| `network`         | Configure network flow and TCP statistics capture.                                           |
| `limits`          | Set cardinality and memory guardrails.                                                       |
| `engine`          | Tune batching, PID filtering, context propagation, traffic control, and other eBPF behavior. |
| `safety`          | Enforce required system capabilities.                                                        |
| `channels`        | Tune internal buffering and backpressure.                                                    |
| `telemetry`       | Tune OBI reporter caches and metric retention.                                               |

### Protocol instrumentation

Under `instrumentation`, you can configure HTTP, gRPC, SQL, Redis, Kafka,
MongoDB, Couchbase, DNS, GPU, and Aerospike instrumentation. Enable traces and
metrics separately for each protocol:

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      instrumentation:
        http:
          enabled:
            traces: true
            metrics: true
        dns:
          enabled:
            traces: false
            metrics: true
```

Configure HTTP routes separately for incoming and outgoing requests. The
`incoming` and `outgoing` sections both accept `patterns`, `ignored_patterns`,
`ignore_mode`, `unmatched`, `wildcard_char`, and `max_path_segment_cardinality`.
See [Configure routes](../routes-decorator/) for the behavior of these settings.

Config v2 provides separate application filters for each protocol and signal.
However, OBI v0.11.0 applies a single application filter at runtime. Use the
same filter map for every application trace and metric filter. Also use the same
trace and metric filter maps for network flows, and the same trace and metric
filter maps for TCP statistics.

To enable HTTP payload extraction, add extractors to
`payload_extraction.enabled`. Supported values are `graphql`, `elasticsearch`,
`aws`, `sqlpp`, `openai`, `anthropic`, `gemini`, `qwen`, `bedrock`, `mcp`,
`embedding`, `rerank`, `retrieval`, `ollama`, `openai_compatible`, `jsonrpc`,
and `enrichment`. Use the corresponding nested block to configure an enabled
extractor. A nested block does not enable the extractor.

### Runtime instrumentation

Use `capture.runtimes` to enable or disable Go probes, Node.js `SIGUSR1`
injection, and Java agent attachment. You can also configure Java debug settings
and an attachment timeout. OBI v0.11.0 does not support nonempty runtime
`filter` fields. Use capture rules to select workloads instead.

### Network observability

Use `capture.network.capture` to configure network flow telemetry and
`capture.network.stats` to configure TCP statistics. The `features` list for TCP
statistics supports `tcp_rtt`, `tcp_failed_connections`, `tcp_retransmits`, and
`tcp_io`.

Enable `tcp_io` only when you need per-send and per-receive statistics because
it can produce substantially more events than the other features. See
[Network observability](../../network/) for deployment and metric details.

## Configure standalone-only features

When you run OBI as a standalone process, you can also use the following
sections under `extensions.obi`:

- Use `enrich` to configure Kubernetes metadata, service naming, and attribute
  enrichment. Set its Kubernetes mode to `autodetect`, `enabled`, or `disabled`.
- Use `correlation` to configure trace context annotation in application logs.
  See [Correlate traces with logs](../../trace-log-correlation/).
- Use `daemon` to configure logging output, profiling, graceful shutdown,
  internal metrics, and standalone Prometheus metric shaping. Set logging
  verbosity with the top-level `log_level` field.

## Collector receiver configuration

In a Collector receiver configuration, place the fields that are under
`extensions.obi.capture` in a standalone configuration directly under
`receivers.obi`, next to `version`. Do not include the `capture` level. For
example, the following YAML is an OBI receiver component body:

```yaml
version: '2.0'
policy:
  default_action: exclude
rules:
  - action: include
    match:
      process:
        open_ports: '8080'
instrumentation:
  http:
    enabled:
      traces: true
      metrics: true
```

Save the receiver component body in a separate file and validate it:

```sh
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

After validation succeeds, copy the component body under `receivers.obi` in your
Collector configuration. Then add `obi` to the appropriate trace and metric
pipelines.

Do not add the standalone-only `enrich`, `correlation`, or `daemon` sections to
the receiver configuration. Use Collector processors such as `k8sattributes` for
enrichment, Collector service telemetry for operational settings, and Collector
exporters for data export. For a complete setup, see
[Run OBI as a Collector receiver](../collector-receiver/).

## Environment variables

When OBI reads a configuration file, it expands the following environment
variable expressions before it parses the YAML:

- `${VAR}` and `${env:VAR}`
- `${VAR:-fallback}` and `${env:VAR:-fallback}`

You can also use the equivalent `$()` forms. To preserve an expression as
literal text, prefix it with an extra `$`.

OBI does not automatically map Config v1 environment variable names to Config v2
fields. To preserve an environment override, add a substitution expression at
the corresponding Config v2 field as described in
[Migrate environment overrides](../migrate-to-config-v2/#migrate-environment-overrides).

## Validate a configuration

Use the validation mode that matches your deployment. The command reports
unsupported fields and conflicting settings:

```sh
# Standalone document
obi config validate ./obi-v2.yaml

# Receiver component body
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

The validation command does not start OBI, attach eBPF programs, contact an
exporter, or check the running kernel. After validation succeeds, test the
configuration in a canary deployment.

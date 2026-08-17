---
title: OBI Config v2 reference
linkTitle: Config v2 reference
description:
  Configure standalone OBI or the OBI Collector receiver with Config v2.
weight: 3
cSpell:ignore: jsonrpc rerank SIGUSR sqlpp
---

Config v2 is available in OBI v0.11.0 and later. It organizes configuration by
user intent and separates OpenTelemetry pipeline settings from OBI-specific
capture settings. Config v1 remains supported.

If you already have a Config v1 file, use the
[Config v1 to v2 migration guide](../migrate-to-config-v2/) instead of rewriting
it by hand.

## Choose the document shape

Config v2 has a different shape for each OBI deployment mode:

| Deployment             | Configuration shape                                                              | Who owns the telemetry pipeline? |
| ---------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| Standalone OBI         | OpenTelemetry declarative configuration with OBI settings under `extensions.obi` | OBI                              |
| OBI Collector receiver | Receiver component body with the capture fields next to `version`                | OpenTelemetry Collector          |

In standalone mode, standard OpenTelemetry settings such as resources, sampling,
and exporters are top-level fields. OBI-specific settings are under
`extensions.obi`.

In receiver mode, configure only how OBI selects workloads and captures
telemetry. Configure enrichment, processing, and export in the Collector
pipeline.

## Standalone configuration

The following minimal configuration instruments one executable and writes traces
to standard output. Replace the executable path and configure an exporter before
using it in production.

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

Validate a standalone file before starting OBI:

```sh
obi config validate ./obi-v2.yaml
```

### Standalone document structure

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

`file_format` and `extensions.obi.version` describe different schemas:

- `file_format: "1.0"` is the supported OpenTelemetry declarative configuration
  version. It is required.
- `extensions.obi.version: "2.0"` is the OBI extension version. It is also
  required and currently accepts only `"2.0"`.

Do not set either field to the OBI release version.

### Supported top-level fields

OBI v0.11.0 supports a defined subset of the OpenTelemetry declarative
configuration:

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

The standalone loader rejects unsupported pipeline fields rather than silently
ignoring them. In v0.11.0, do not configure `attribute_limits`,
`instrumentation/development`, or `logger_provider`. It also rejects
`disabled: true`, a nonempty `distribution`, and a nonempty `propagator`.

For OTLP export examples, see [Configure data export](../export-data/). The
[migration guide](../migrate-to-config-v2/#configure-exporters) shows the Config
v2 gRPC and HTTP exporter shapes.

## Select workloads

Use `capture.policy` and the ordered `capture.rules` list to decide which
workloads OBI instruments.

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

`default_action` is `include` when omitted. To target only named workloads, set
it to `exclude` and add include rules.

`match_order` accepts `first_match_wins` or `last_match_wins`. Runtime
exclusions always take precedence, so place exclude rules before include rules
with `first_match_wins`, or after include rules with `last_match_wins`.

Writing `rules: []` explicitly removes the built-in workload exclusions. Keep
the exclusions generated by `obi config migrate` unless you intend to replace
them.

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

Glob fields contain arrays; regular-expression fields contain one expression.

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

An include rule can override signal export and HTTP route settings for the
matched workload:

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

`refine` supports `exports` and `http.routes`. Nonempty `http.filters` and
per-workload sampling aren't supported in v0.11.0. Configure global sampling
with `tracer_provider.sampler`.

When rules overlap, omitted refinements don't inherit values from an earlier
matching rule. Make refinements explicit and test the result when more than one
rule can match a workload.

## Configure capture

`extensions.obi.capture` contains settings that work in both standalone and
receiver deployments:

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

The `instrumentation` section supports HTTP, gRPC, SQL, Redis, Kafka, MongoDB,
Couchbase, DNS, GPU, and Aerospike. Each protocol uses signal-specific
enablement:

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

HTTP routes have separate `incoming` and `outgoing` policies. Both accept
`patterns`, `ignored_patterns`, `ignore_mode`, `unmatched`, `wildcard_char`, and
`max_path_segment_cardinality`. See [Configure routes](../routes-decorator/) for
the behavior of these settings.

Application filters are represented for each protocol and signal, but OBI
v0.11.0 uses one application filter internally. All application trace and metric
filter maps must therefore be identical. Network flow filters must also match
each other, as must TCP statistics filters.

HTTP payload extraction uses `payload_extraction.enabled`. Supported values are
`graphql`, `elasticsearch`, `aws`, `sqlpp`, `openai`, `anthropic`, `gemini`,
`qwen`, `bedrock`, `mcp`, `embedding`, `rerank`, `retrieval`, `ollama`,
`openai_compatible`, `jsonrpc`, and `enrichment`. Nested blocks tune an enabled
extractor; they don't enable it.

### Runtime instrumentation

Use `capture.runtimes` to enable or disable Go probes, Node.js `SIGUSR1`
injection, and Java agent attachment. Java also supports debug settings and an
attachment timeout. Nonempty runtime `filter` fields aren't supported in
v0.11.0; use capture rules to select workloads.

### Network observability

`capture.network.capture` controls network flows. `capture.network.stats`
controls TCP statistics. The statistics `features` list supports `tcp_rtt`,
`tcp_failed_connections`, `tcp_retransmits`, and `tcp_io`.

Enable `tcp_io` only when you need per-send and per-receive statistics because
it can produce substantially more events than the other features. See
[Network observability](../../network/) for deployment and metric details.

## Configure standalone-only features

The following sections are valid only under `extensions.obi` in a standalone
configuration:

- `enrich` configures Kubernetes metadata, service naming, and attribute
  enrichment. Its Kubernetes mode is `autodetect`, `enabled`, or `disabled`.
- `correlation` configures trace context annotation in application logs. See
  [Correlate traces with logs](../../trace-log-correlation/).
- `daemon` configures logging output, profiling, graceful shutdown, internal
  metrics, and standalone Prometheus metric shaping. Use top-level `log_level`
  for logging verbosity.

## Collector receiver configuration

The receiver uses the fields inside standalone `capture`, flattened next to
`version`. It doesn't include a `capture` wrapper. For example, the following is
a receiver component body:

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

Validate this component body, not the complete Collector file:

```sh
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

After validation, place the body under `receivers.obi` and connect `obi` to the
Collector trace and metric pipelines.

Receiver configuration rejects standalone-only `enrich`, `correlation`, and
`daemon` settings. Use Collector processors such as `k8sattributes` for
enrichment, Collector service telemetry for operational settings, and Collector
exporters for data export. For the complete setup, see
[Run OBI as a Collector receiver](../collector-receiver/).

## Environment variables

The OBI command-line loader expands these forms before decoding YAML:

- `${VAR}` and `${env:VAR}`
- `${VAR:-fallback}` and `${env:VAR:-fallback}`

The equivalent `$()` forms are also supported. Prefix an extra `$` to keep a
substitution expression literal.

Environment variables that used Config v1 field names aren't automatically
remapped. Add substitutions at the corresponding Config v2 paths as described in
[Migrate environment overrides](../migrate-to-config-v2/#migrate-environment-overrides).

## Validate a configuration

Validation parses the selected document shape and reports unsupported or
conflicting fields:

```sh
# Standalone document
obi config validate ./obi-v2.yaml

# Receiver component body
obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

Validation doesn't start OBI, attach eBPF programs, contact an exporter, or
check the running kernel. After validation succeeds, verify the configuration
with a canary deployment.

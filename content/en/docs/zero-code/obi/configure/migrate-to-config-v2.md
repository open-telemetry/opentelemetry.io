---
title: Migrate from OBI Config v1 to Config v2
linkTitle: Migrate to Config v2
description: Learn how to safely migrate an OBI Config v1 file to Config v2.
weight: 4
---

OBI v0.11.0 and later include commands to migrate and validate configuration.
Migrate one deployment at a time, validate the generated Config v2 file, and
test it before continuing the rollout.

This guide explains how to migrate standalone OBI and OBI Collector receiver
configurations. For the Config v2 structure and supported fields, see the
[Config v2 reference](../config-v2/).

## Before you migrate

Prepare a rollback plan before you migrate:

1. Save the current Config v1 file. Record the exact OBI binary version, image
   tag, or image digest used by the deployment.
2. List any settings supplied through environment variables, command-line flags,
   Helm values, Kubernetes manifests, or secret injection. The migration command
   reads only the file you provide.
3. Install the target OBI v0.12.1 or later binary.
4. Select one representative instance or workload for a canary deployment.

The migration command resolves substitution expressions in the source file.
Therefore, the generated file can contain secret values. Write the output to a
private temporary directory, review it carefully, and do not commit secrets.

## Migrate a standalone configuration

The `obi config migrate` command accepts one Config v1 file. It writes the
generated Config v2 YAML to standard output and the migration report to standard
error.

```sh
umask 077
migration_dir="$(mktemp -d)"

obi config migrate ./obi-v1.yaml \
  > "${migration_dir}/obi-v2.yaml" \
  2> "${migration_dir}/migration-report.txt"
```

Check the exit status before you use the generated file. An exit status of 0
indicates success. A successful report starts with
`migrated v1 config to OBI config v2`. An error starts with `migration failed:`.

Then validate the generated file:

```sh
obi config validate "${migration_dir}/obi-v2.yaml"
```

The migration and validation commands use the following exit statuses:

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| `0`    | The command succeeded.                       |
| `1`    | Parsing, validation, or migration failed.    |
| `2`    | The command syntax or arguments are invalid. |

## Understand the generated structure

The migration command moves Config v1 settings to the following Config v2
sections:

| Config v1 settings                                         | Config v2 location                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Discovery selectors                                        | `extensions.obi.capture.policy` and `extensions.obi.capture.rules` |
| Application protocols                                      | `extensions.obi.capture.instrumentation`                           |
| Runtime instrumentation                                    | `extensions.obi.capture.runtimes`                                  |
| Network capture and statistics                             | `extensions.obi.capture.network`                                   |
| eBPF and batching controls                                 | `extensions.obi.capture.engine`                                    |
| Kubernetes and service-name enrichment                     | `extensions.obi.enrich`                                            |
| Trace-log correlation                                      | `extensions.obi.correlation`                                       |
| Process logging, profiling, shutdown, and internal metrics | `extensions.obi.daemon`                                            |
| Trace sampling and export                                  | Top-level `tracer_provider`                                        |
| Metric export                                              | Top-level `meter_provider`                                         |
| Resource attributes                                        | Top-level `resource`                                               |

The generated file includes explicit defaults when they are necessary to
preserve Config v1 behavior. Keep these values unchanged until you have tested
the configuration in a canary deployment.

## Review behavior changes

### Capture defaults and rule order

A Config v1 file without selection fields disables application capture. By
contrast, a Config v2 file includes workloads by default. To preserve the Config
v1 behavior, the migration command sets `default_action` to `exclude` when the
source file does not select a workload.

The migration command also writes built-in exclusions and might reverse the
order of Config v1 include selectors. The generated order preserves Config v1
precedence in the Config v2 rule model. Do not reorder the rules until you have
tested overlapping rules and workloads that match only one rule.

If you explicitly set `rules: []`, OBI removes the built-in exclusions.

### Filters

Config v1 provides one filter each for application telemetry, network telemetry,
and TCP statistics. The migration command copies each Config v1 filter to every
corresponding Config v2 field so that the generated configuration preserves the
original behavior.

After you establish that baseline, Config v2 lets you adjust application filters
independently for each protocol and signal. For example, an HTTP trace filter no
longer needs to match the HTTP metric or SQL filters. Make these changes in a
canary deployment and compare telemetry volume and cardinality before rolling
them out.

Network flow and TCP statistics filters remain shared between traces and metrics
in v0.12.1. Keep the two maps identical within each group. Validation reports an
error when they differ.

### HTTP routes

Global Config v1 route settings apply to incoming and outgoing traffic. The
migration command copies them to both directions under
`capture.instrumentation.http.routes`.

Per-service route patterns move to `rules[].refine.http.routes`. For a given
direction, an explicit per-service list replaces the global list, and an empty
list clears it. Migration fails when a combination of global and per-service
patterns cannot preserve the Config v1 inheritance behavior.

### Workload refinements

Config v1 selectors can include export and route refinements. In Config v2, an
include rule does not inherit an omitted refinement from an earlier matching
rule. When this difference would change behavior, migration fails for selector
lists that mix explicit and omitted `exports` or `routes` fields.

To migrate these selectors, make each refinement explicit on every applicable
selector. Restructure selectors that depend on conditional inheritance so that
each Config v2 rule is self-contained, then test any overlapping rules.

## Configure exporters

Config v2 defines telemetry pipelines in the top-level OpenTelemetry sections.
The migration command can generate OTLP/gRPC exporters. Migration fails if the
command cannot determine an endpoint or protocol without changing its meaning.

Use the following configuration for an OTLP/gRPC trace exporter:

```yaml
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_grpc:
            endpoint: http://collector:4317
            tls:
              insecure: true
```

Use the following configuration for an OTLP/gRPC metric exporter:

```yaml
meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_grpc:
            endpoint: http://collector:4317
            tls:
              insecure: true
        interval: 60000
```

If the Config v1 file uses OTLP over HTTP, migrate the other settings first.
Then add the HTTP exporters manually:

```yaml
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://collector:4318/v1/traces
            encoding: protobuf

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: http://collector:4318/v1/metrics
            encoding: protobuf
```

For OTLP over HTTP, you can also set `encoding` to `json`. Config v2 also
supports declarative exporter headers. Exporter authentication environment
variables remain runtime inputs; the migration command does not copy their
values into the generated file.

## Handle settings that need manual changes

If the migration command cannot preserve a setting, it fails and identifies the
Config v1 field in the error message. Replace or retire the unsupported behavior
before you rerun the command. The following settings commonly require manual
changes:

| Config v1 setting                                                           | What to do                                                                                                                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service_name`, `service_namespace`                                         | For standalone OBI, set `service.name` or `service.namespace` as top-level `resource` attributes. For the OBI Collector receiver, use a Collector resource processor. |
| `prometheus_export.path`                                                    | Use the path supported by the selected Collector or Prometheus exporter. Config v2 has no portable field for it.                                                      |
| Custom or empty `discovery.excluded_linux_system_paths`                     | Replace path-based exclusions with workload exclusions in `capture.rules`. Remove the setting if no corresponding workload exclusion is needed.                       |
| `health_check.*`                                                            | Use deployment health checks or Collector health-check facilities.                                                                                                    |
| `jvm_runtime_metrics.sampling_interval`                                     | Remove the custom interval and test the Config v2 JVM sampling behavior.                                                                                              |
| `attributes.instance_id.dns`                                                | Set `service.instance.id` as a top-level resource attribute or move instance identity enrichment to a Collector processor.                                            |
| `ebpf.stats_wakeup_data_bytes`                                              | Remove the custom wakeup threshold and test performance with the Config v2 defaults.                                                                                  |
| Selector `name`, `namespace`, per-selector metrics, or per-selector sampler | Redesign the selector with supported match and `refine` fields. Split it into explicit rules when the refinements differ.                                             |
| Selector `exports.logs`                                                     | Remove the per-selector log export refinement. Use capture rules to select the workloads eligible for log correlation.                                                |
| `ebpf.log_enricher.services`                                                | Replace the separate log-annotation selector with capture rules that select the eligible workloads.                                                                   |
| `sensitive_query_params`                                                    | Redesign the privacy policy before migration. Config v2 has no equivalent field.                                                                                      |
| Debug exporter or unsupported sampler                                       | Configure a supported OTLP exporter or sampler.                                                                                                                       |
| Differing active OTLP and Prometheus instrumentation lists                  | Make protocol metric enablement consistent before migrating.                                                                                                          |

The command reports other unsupported metric features and histogram, exporter,
or Prometheus settings individually. Review and resolve every reported field
before you rerun the migration. When a field has no direct equivalent, choose a
supported Config v2 or Collector behavior and verify the change in the canary
deployment.

The command also rejects unknown Config v1 fields, files that already use Config
v2, and files that contain multiple YAML documents.

For example, map a deliberate standalone service identity to resource
attributes:

```yaml
resource:
  attributes:
    - name: service.name
      value: checkout
    - name: service.namespace
      value: shop
```

Add this fragment only at the root of a standalone configuration. For an OBI
Collector receiver, use a Collector resource processor instead.

## Migrate environment overrides

The migration command reads the source file but does not apply OBI runtime
environment overrides. OBI also does not automatically map Config v1 environment
variable names to Config v2 fields.

For example, if your deployment sets `OTEL_EBPF_BPF_WAKEUP_LEN=999`, add an
explicit substitution expression at the corresponding Config v2 field:

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      engine:
        batching:
          wakeup_len: ${OTEL_EBPF_BPF_WAKEUP_LEN:-500}
```

You can use `${VAR}`, `${env:VAR}`, or their `:-fallback` forms in a
configuration file. You can also use the equivalent `$()` forms. To preserve an
expression as literal text, prefix it with an extra `$`.

Review command-line and deployment-level overrides in the same way. Move each
value to the corresponding Config v2 field or Collector pipeline setting.

## Migrate a Collector receiver

Pass the OBI receiver component body to the migration command, not the complete
Collector configuration:

```sh
obi config migrate --mode=receiver ./obi-receiver-v1.yaml \
  > ./obi-receiver-v2.yaml \
  2> ./migration-report.txt

obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

The command generates a Config v2 receiver component body. In this format,
capture fields appear next to `version` without a `capture` level:

```yaml
version: '2.0'
policy:
  default_action: exclude
rules:
  - action: include
    match:
      process:
        open_ports: '8080'
```

After validation succeeds, copy the component body under `receivers.obi` in the
Collector configuration.

Receiver migration does not accept standalone exporter, enrichment, correlation,
daemon, or internal telemetry fields. Configure the equivalent behavior with
Collector exporters, processors, extensions, and service telemetry. See
[Run OBI as a Collector receiver](../collector-receiver/) for a complete
pipeline example.

## Validate and test the migration

`obi config validate` verifies the YAML structure and checks that OBI supports
the specified Config v2 fields. The command does not start OBI, contact
exporters, attach eBPF programs, or check kernel capabilities.

After validation succeeds, deploy Config v2 to one instance and compare it with
the Config v1 deployment:

- Confirm the same workloads are included and excluded.
- Confirm traces, metrics, routes, attributes, and sampling behavior.
- Confirm exporter connectivity and authentication.
- Compare telemetry volume and cardinality.
- Check OBI logs and internal metrics for errors or backpressure.
- Exercise workloads that match overlapping selection rules.

Keep the Config v1 file and previous OBI binary or image available during the
canary test. If behavior differs, roll back the configuration and OBI version.
Resolve the mismatch before you continue the rollout.

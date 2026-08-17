---
title: Migrate OBI Config v1 to Config v2
linkTitle: Migrate to Config v2
description: Safely migrate an OBI Config v1 file to Config v2.
weight: 4
---

OBI v0.11.0 and later include commands to migrate and validate configuration.
Config v1 remains supported, so you can test Config v2 and roll back without
converting every deployment at once.

This guide covers standalone OBI and the OBI Collector receiver. For the new
document structure and supported fields, see the
[Config v2 reference](../config-v2/).

## Before you migrate

Prepare a reversible rollout:

1. Save the current Config v1 file and the exact OBI binary, image tag, or image
   digest used by the deployment.
2. Inventory settings supplied through environment variables, command-line
   flags, Helm values, Kubernetes manifests, and secret injection. The migration
   command reads only the file you pass to it.
3. Install the target OBI v0.11.0 or later binary.
4. Choose one instance or workload for a canary deployment.

The migrator resolves substitution expressions in the source file. The output
can therefore contain secret values. Write it to a private temporary directory,
review it carefully, and don't commit secrets.

## Migrate a standalone configuration

Run `obi config migrate` with exactly one Config v1 file. The generated Config
v2 YAML goes to standard output and the migration report goes to standard error.

```sh
umask 077
migration_dir="$(mktemp -d)"

obi config migrate ./obi-v1.yaml \
  > "${migration_dir}/obi-v2.yaml" \
  2> "${migration_dir}/migration-report.txt"
```

Continue only if the command exits with status 0. A successful report starts
with `migrated v1 config to OBI config v2`; an error starts with
`migration failed:`.

Then validate the generated file:

```sh
obi config validate "${migration_dir}/obi-v2.yaml"
```

Migration and validation exit with status 0 for success, 1 for a parsing,
validation, or migration failure, and 2 for incorrect command usage.

## Understand the generated structure

The migrator reorganizes Config v1 by ownership:

| Config v1 concern                                          | Config v2 location                                                 |
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

The generated file includes explicit defaults where necessary to preserve Config
v1 behavior. Don't remove or minimize those values before the canary.

## Review behavior changes

### Capture defaults and rule order

A Config v1 file with no selection fields disables application capture. A newly
authored Config v2 file defaults to including workloads. To preserve behavior,
the migrator writes `default_action: exclude` when the Config v1 file doesn't
select a workload.

The migrator also emits built-in exclusions and may reverse effective Config v1
include-selector order. This preserves Config v1 precedence under Config v2's
ordered rule model. Don't reorder the generated rules without testing
overlapping rules and workloads that match only one rule.

An explicit Config v2 `rules: []` removes the built-in exclusions.

### Filters

Config v1 has one application filter, one network filter, and one TCP statistics
filter. Config v2 represents filters per signal and protocol, but OBI v0.11.0
still applies one runtime filter for each of those three groups.

The migrator copies each Config v1 filter to every corresponding Config v2
location. Keep the generated application trace and metric filters identical.
Also keep the two network-flow filters identical and the two TCP-statistics
filters identical. Validation rejects differences.

### HTTP routes

Config v1 global route settings apply to both incoming and outgoing traffic. The
migrator copies them to both directions under
`capture.instrumentation.http.routes`.

Per-service route patterns become `rules[].refine.http.routes`. An explicitly
configured per-service list replaces the global list for that direction; an
empty list clears it. Migration rejects combinations of global and per-service
patterns that can't retain Config v1 inheritance exactly.

### Workload refinements

Config v1 selectors can carry export and route refinements. In Config v2, an
include rule that omits a refinement resets that concern instead of inheriting
it from an earlier matching rule. The migrator rejects selector lists that mix
explicit and omitted `exports`, or explicit and omitted `routes`, when it can't
preserve the result.

Make each refinement explicit on every relevant selector, test overlaps, or
continue using Config v1 if the deployment depends on conditional inheritance.

## Configure exporters

Config v2 puts telemetry pipelines in the top-level OpenTelemetry sections.
Automatic migration supports the OTLP/gRPC subset. It rejects endpoints or
protocols whose meaning can't be inferred safely.

An OTLP/gRPC trace exporter has this shape:

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

An OTLP/gRPC metric exporter has this shape:

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

If Config v1 used OTLP over HTTP, migrate the rest of the file first and add an
HTTP exporter manually:

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

Config v2 also accepts `json` as the OTLP HTTP encoding and accepts declarative
exporter headers. Exporter authentication environment variables remain runtime
inputs; the migrator doesn't copy their values into the file.

## Handle settings that need manual changes

The migrator fails rather than silently dropping a setting it can't preserve.
The error identifies the source field. The most common cases are:

| Config v1 setting                                                           | What to do                                                                                                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service_name`, `service_namespace`                                         | Set `service.name` or `service.namespace` as top-level `resource` attributes in standalone mode. In receiver mode, use a Collector resource processor.      |
| `prometheus_export.path`                                                    | Use the path supported by the selected Collector or Prometheus exporter. Config v2 has no portable field for it.                                            |
| Custom or empty `discovery.excluded_linux_system_paths`                     | Keep Config v1, or express an actual workload exclusion with `capture.rules` if that is the intended behavior.                                              |
| `health_check`                                                              | Use deployment health checks or Collector health-check facilities.                                                                                          |
| JVM runtime sampling interval                                               | Keep Config v1 if this tuning is required.                                                                                                                  |
| `attributes.instance_id.dns`                                                | Keep Config v1 or move the enrichment to a Collector processor.                                                                                             |
| `stats_wakeup_data_bytes`                                                   | Keep Config v1 if this tuning is required.                                                                                                                  |
| Selector `name`, `namespace`, per-selector metrics, or per-selector sampler | Redesign the selector using supported match and `refine` fields, or keep Config v1.                                                                         |
| Selector `exports.logs`                                                     | Remove it; Config v2 workload export refinements support traces and metrics only.                                                                           |
| `ebpf.log_enricher.services`                                                | Config v2 doesn't support a separate log-annotation selector. Capture rules determine eligible workloads. Keep Config v1 if the two selections must differ. |
| `sensitive_query_params`                                                    | Redesign the privacy policy before migration. Config v2 has no equivalent field.                                                                            |
| Debug exporter or unsupported sampler                                       | Configure a supported OTLP exporter or sampler, or keep Config v1.                                                                                          |
| Differing active OTLP and Prometheus instrumentation lists                  | Make protocol metric enablement consistent before migrating.                                                                                                |

Other unsupported metric feature, histogram, exporter, and Prometheus tuning
fields are reported individually. Resolve every reported field and rerun the
migration; don't delete a field solely to make the command pass unless you have
confirmed the behavior isn't needed.

Unknown Config v1 fields, already-Config-v2 documents, and input containing
multiple YAML documents are also rejected.

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

This fragment is valid only at the top level of a standalone configuration. In
receiver mode, use a Collector resource processor instead.

## Migrate environment overrides

The migration command doesn't read runtime environment overrides. Config v1
environment variables also use Config v1 names and aren't automatically rewired.

For example, replace a Config v1 override such as `OTEL_EBPF_BPF_WAKEUP_LEN=999`
with an explicit substitution at the Config v2 path:

```yaml
extensions:
  obi:
    version: '2.0'
    capture:
      engine:
        batching:
          wakeup_len: ${OTEL_EBPF_BPF_WAKEUP_LEN:-500}
```

Config files support `${VAR}`, `${env:VAR}`, and their `:-fallback` forms. The
equivalent `$()` forms are also supported. Prefix an extra `$` to preserve a
literal substitution expression.

Audit command-line and deployment-level overrides the same way. Move each value
to its Config v2 field or to the Collector pipeline that now owns it.

## Migrate a Collector receiver

Pass only the OBI receiver's Config v1 component body to the migration command:

```sh
obi config migrate --mode=receiver ./obi-receiver-v1.yaml \
  > ./obi-receiver-v2.yaml \
  2> ./migration-report.txt

obi config validate --mode=receiver ./obi-receiver-v2.yaml
```

The output is a Config v2 receiver component body. It places capture fields next
to `version` and doesn't include a `capture` wrapper:

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

Embed that body under `receivers.obi` in the Collector configuration.

Receiver migration rejects standalone exporter, enrichment, correlation, daemon,
and internal telemetry fields. Recreate those concerns with Collector exporters,
processors, extensions, and service telemetry. See
[Run OBI as a Collector receiver](../collector-receiver/) for a complete
pipeline example.

## Validate and canary

`obi config validate` verifies the YAML structure and the supported Config v2
subset. It doesn't start OBI, contact exporters, attach eBPF programs, or check
kernel capabilities.

After validation succeeds, deploy Config v2 to one instance and compare it with
the Config v1 deployment:

- Confirm the same workloads are included and excluded.
- Confirm traces, metrics, routes, attributes, and sampling behavior.
- Confirm exporter connectivity and authentication.
- Compare telemetry volume and cardinality.
- Check OBI logs and internal metrics for errors or backpressure.
- Exercise workloads that match overlapping selection rules.

Keep the Config v1 file and previous OBI binary or image available throughout
the canary. If behavior differs, roll back both the configuration and OBI
version, then resolve the mismatch before expanding the rollout.

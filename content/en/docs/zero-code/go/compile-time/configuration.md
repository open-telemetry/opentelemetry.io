---
title: Configuration
description:
  Configure the otelc tool and the telemetry produced by instrumented
  applications.
weight: 20
cSpell:ignore: nethttp otelc
---

Configuration happens at two points: build time, where you control how the
`otelc` tool instruments your application, and runtime, where the standard
OpenTelemetry environment variables control the telemetry the instrumented
application produces.

## The otelc command

`otelc` wraps the Go toolchain. Its subcommands:

| Command         | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `otelc go …`    | Run a `go` command (such as `go build`) with instrumentation applied |
| `otelc setup`   | Set up the environment for instrumentation                           |
| `otelc cleanup` | Remove all artifacts created by the setup and build phases           |
| `otelc version` | Print the tool version                                               |

Flags are passed before the subcommand:

| Flag               | Environment variable | Purpose                                              |
| ------------------ | -------------------- | ---------------------------------------------------- |
| `--rules <file>`   |                      | Use a custom instrumentation rules file              |
| `--debug`, `-d`    | `OTELC_DEBUG=1`      | Enable debug logging for the build                   |
| `--work-dir`, `-w` |                      | Directory for working files written during the build |

For example, to build with a custom rules file and debug output:

```sh
otelc --rules my-rules.yaml --debug go build -o myapp .
```

## Runtime environment variables

Instrumented applications respect the standard OpenTelemetry
[SDK environment variables](/docs/languages/sdk-configuration/) for exporters,
resources, and service identity, for example:

- `OTEL_SERVICE_NAME`: service name reported with telemetry
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP endpoint to export to
- `OTEL_RESOURCE_ATTRIBUTES`: additional resource attributes

In addition, the following variables control which injected instrumentations are
active at runtime:

| Variable                            | Purpose                                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_GO_ENABLED_INSTRUMENTATIONS`  | Comma-separated list of instrumentations to enable, for example `nethttp,grpc`. When set, only the listed instrumentations are active. |
| `OTEL_GO_DISABLED_INSTRUMENTATIONS` | Comma-separated list of instrumentations to disable.                                                                                   |

## Custom instrumentation rules

Which code gets instrumented is driven by declarative YAML rules. Each rule
names a target package, optionally narrows the match with selectors, and
declares what to inject. For example, the following rule calls hook functions at
the entry and exit of `(*sql.DB).Exec`:

```yaml
instrument_sql_exec:
  target: database/sql
  where:
    func: Exec
    recv: '*DB'
  do:
    - inject_hooks:
        before: BeforeExec
        after: AfterExec
        path: github.com/example/sqlinstr
```

Pass a custom rules file to the build with `--rules`. Rules support several
injection mechanisms beyond function hooks, including struct field injection,
call-site wrapping, and file addition. For the complete schema and rule type
reference, see the
[instrumentation rules documentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/main/docs/rules.md)
in the repository.

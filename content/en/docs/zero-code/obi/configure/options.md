---
title: OBI global configuration properties
linkTitle: Global properties
description: Configure global configuration properties that apply to OBI core.
weight: 2
---

OBI can be configured via environment variables or via a YAML configuration file
passed either with the `-config` command-line argument or the
`OTEL_EBPF_CONFIG_PATH` environment variable. Environment variables have
priority over the properties in the configuration file. For example, in the
following command line, the `OTEL_EBPF_LOG_LEVEL` option overrides any
`log_level` settings inside config.yaml:

**Config argument:**

```sh
OTEL_EBPF_LOG_LEVEL=debug obi -config /path/to/config.yaml
```

**Config environment variable:**

```sh
OTEL_EBPF_LOG_LEVEL=debug OTEL_EBPF_CONFIG_PATH=/path/to/config.yaml obi
```

Refer to the [example YAML configuration file](../example/) for a configuration
file template.

OBI consists of a pipeline of components that generate, transform, and export
traces from HTTP and gRPC applications. In the YAML configuration, each
component has its own first-level section.

Optionally, OBI also provides network-level metrics, refer to the
[network metrics documentation](../../network/) for more information.

The following sections explain the global configuration properties that apply to
the entire OBI configuration.

For example:

```yaml
trace_printer: json
shutdown_timeout: 30s
channel_buffer_len: 33
```

| YAML<br>environment variable                       | Description                                                                                                                                | Type    | Default    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- |
| _(No YAML)_<br>`OTEL_EBPF_AUTO_TARGET_EXE`         | Selects the process to instrument by [Glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) matching against the full executable path. | string  | unset      |
| `open_port`<br>`OTEL_EBPF_OPEN_PORT`               | Selects a process to instrument by open ports. Accepts comma-separated lists of ports and port ranges.                                     | string  | unset      |
| `shutdown_timeout`<br>`OTEL_EBPF_SHUTDOWN_TIMEOUT` | Sets the timeout for a graceful shutdown                                                                                                   | string  | "10s"      |
| `log_level`<br>`OTEL_EBPF_LOG_LEVEL`               | Sets process logger verbosity. Valid values: `DEBUG`, `INFO`, `WARN`, `ERROR`.                                                             | string  | `INFO`     |
| `trace_printer`<br>`OTEL_EBPF_TRACE_PRINTER`       | Prints instrumented traces to stdout in a specified format, refer to [trace printer formats](#trace-printer-formats).                      | string  | `disabled` |
| `enforce_sys_caps`<br>`OTEL_EBPF_ENFORCE_SYS_CAPS` | Controls how OBI handles missing system capabilities at startup.                                                                           | boolean | `false`    |

## Executable name matching

This property accepts a
[glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) matched against the
full executable command line, including the directory where the executable
resides on the file system. OBI selects one process, or multiple processes with
similar characteristics. For more detailed process selection and grouping, refer
to the [service discovery documentation](../service-discovery/).

When you instrument by executable name, choose a non-ambiguous name that matches
one executable on the target system. For example, if you set
`OTEL_EBPF_AUTO_TARGET_EXE=*/server` and have two processes that match the Glob,
OBI selects both. Instead use the full application path for exact matches, for
example `OTEL_EBPF_AUTO_TARGET_EXE=/opt/app/server` or
`OTEL_EBPF_AUTO_TARGET_EXE=/server`.

If you set both `OTEL_EBPF_AUTO_TARGET_EXE` and `OTEL_EBPF_OPEN_PORT`
properties, OBI selects only executables matching both selection criteria.

## Open port matching

This property accepts a comma-separated list of ports or port ranges. If an
executable matches any of the ports OBI selects it. For example:

```shell
OTEL_EBPF_OPEN_PORT=80,443,8000-8999
```

In this example, OBI selects any executable that opens port `80`, `443`, or any
port between `8000` and `8999`. It can select one process or multiple processes
with similar characteristics. For more detailed process selection and grouping,
follow the instructions in the
[service discovery documentation](../service-discovery/).

If an executable opens multiple ports, specifying one of those ports is enough
for OBI to instrument all HTTP/S and gRPC requests on all application ports.
Currently, there's no way to limit instrumentation to requests on a specific
port.

If the specified port range is wide, for example `1-65535`, OBI tries to execute
all processes that own one of the ports in that range.

If you set both `OTEL_EBPF_AUTO_TARGET_EXE` and `OTEL_EBPF_OPEN_PORT`
properties, OBI selects only executables matching both selection criteria.

## Trace printer formats

This option prints any instrumented trace on the standard output using one of
the following formats:

- **`disabled`**: Disables the printer
- **`text`**: Prints a concise line of text
- **`json`**: Prints a compact JSON object
- **`json_indent`**: Prints an indented JSON object

## System capabilities

If you set `enforce_sys_caps` to true and the required system capabilities are
missing, OBI aborts startup and logs the missing capabilities. If you set this
option to `false`, OBI only logs the missing capabilities.

---
title: Troubleshooting
description: Diagnose issues with Go compile-time instrumentation.
weight: 50
cSpell:ignore: otelc
---

## Enable debug logging

To see what the tool does during a build, enable debug mode:

```sh
otelc --debug go build -o myapp .
```

Debug output, including a `debug.log` file, is written to the tool's working
directory (by default a `.otelc-build` directory in your module). Inspect it to
see which rules matched and what instrumentation was injected.

## No telemetry is produced

1. Confirm the binary was built through `otelc` and not plain `go build`.
2. Confirm your application actually uses a
   [supported library](../supported-libraries), and that the version you depend
   on is within the supported range declared by the instrumentation rules.
3. Check the exporter configuration: with `OTEL_EXPORTER_OTLP_ENDPOINT` unset or
   wrong, telemetry has nowhere to go. Set `OTEL_LOG_LEVEL=debug` to surface
   export errors.
4. Check that the instrumentation wasn't disabled through
   `OTEL_GO_ENABLED_INSTRUMENTATIONS` or `OTEL_GO_DISABLED_INSTRUMENTATIONS`.

## Clean up build artifacts

If a build behaves unexpectedly, remove the artifacts created by previous setup
and build phases and rebuild from a clean state:

```sh
otelc cleanup
```

## Getting help

- [GitHub issues](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues)
  for bugs
- [GitHub discussions](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/discussions)
  for questions
- The
  [#otel-go-compt-instr-sig](https://cloud-native.slack.com/archives/C088D8GSSSF)
  channel on the CNCF Slack

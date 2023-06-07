---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 20
---

You can use
[automatic instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation)
to initialize [signal](/docs/specs/otel/glossary/#signals) providers and
generate telemetry data for supported
[instrumented libraries](/docs/specs/otel/glossary/#instrumented-library)
without modifying the application's source code.

[Here][release] you can find the latest release of OpenTelemetry .NET Automatic
Instrumentation.

You can find the documentation in the [project's repository][repo].

## Next steps

After you have set up the automatic instrumentation, you may want to add
[manual instrumentation](/docs/instrumentation/net/manual) to collect custom
telemetry data.

If you do not want to rely on automatic instrumentation, which is currently in
beta, you may want to use
[instrumentation libraries](/docs/instrumentation/net/libraries) explicitly
instead.

[release]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest
[repo]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation

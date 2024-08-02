---
title: Configuration
linkTitle: Configuration
weight: 10
aliases: [config]
# prettier-ignore
cSpell:ignore: authservice blrp Dotel ignore LOWMEMORY myservice ottrace PKCS retryable tracepropagators
---

The OpenTelemetry SDK provides a working implementation of the API, and can be
set up and configured in a number of ways. The Java SDK supports most of the
available [configuration options](/docs/languages/sdk-configuration/). For
conformance details, see the
[compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

The following configuration options apply to the
[Java agent](/docs/zero-code/java/agent/) and all other uses of the SDK.


## General

The
[autoconfigure module](/docs/languages/java/instrumentation/#automatic-configuration)
(`opentelemetry-sdk-extension-autoconfigure`) allows you to automatically
configure the OpenTelemetry SDK based on a standard set of supported environment
variables and system properties. Start your SDK configurations from it.

{{% alert color="info" %}} The autoconfigure module registers Java shutdown
hooks to shut down the SDK when appropriate. Because OpenTelemetry Java uses
`java.util.logging` for its logging, some of that logging may be suppressed
during shutdown hooks. This is a bug in the JDK itself, and not something under
the control of OpenTelemetry Java. If you require logging during shutdown hooks,
consider using `System.out` rather than a logging framework that might shut
itself down in a shutdown hook, thus suppressing your log messages. See this
[JDK bug](https://bugs.openjdk.java.net/browse/JDK-8161253) for more details.
{{% /alert %}}

{{% alert title="Signal configuration" color="primary" %}}

The text placeholder `{signal}` refers to the supported
[OpenTelemetry Signal](/docs/concepts/signals/). Valid values include `traces`,
`metrics`, and `logs`.

Signal specific configurations take priority over the generic versions.

For example, if you set both `otel.exporter.otlp.endpoint` and
`otel.exporter.otlp.traces.endpoint`, the latter will take precedence.

{{% /alert %}}

## File Configuration

**Status**: [Experimental](/docs/specs/otel/versioning-and-stability)

{{% alert title="Note" color="warning" %}} When a config file is specified,
other environment variables described in this document along with SPI
[customizations](#customizing-the-opentelemetry-sdk) are ignored. The contents
of the file alone dictate SDK configuration. {{% /alert %}}

File configuration allows for configuration via a YAML as described in
[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
and [file configuration](/docs/specs/otel/configuration/file-configuration/).

To use, include
`io.opentelemetry:opentelemetry-sdk-extension:incubator:<version>` and specify
the path to the config file as described in the table below.

| System property                 | Purpose                                 | Default |
| ------------------------------- | --------------------------------------- | ------- |
| `otel.experimental.config.file` | The path to the SDK configuration file. | Unset   |

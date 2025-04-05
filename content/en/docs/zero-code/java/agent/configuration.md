---
title: Configuration
weight: 10
aliases: [agent-config]
cSpell:ignore: classloaders customizer logback
---

{{% alert title="For more information" %}}
This page describes the various ways in which configuration can be supplied to the java agent.
For information on the configuration options themselves,
see [Configure the SDK](/docs/languages/java/configuration).
{{% /alert %}}

## Agent Configuration

The agent can consume configuration from one or more of the following sources
(ordered from highest to lowest priority):

- System properties
- [Environment variables](#configuring-with-environment-variables)
- [Configuration file](#configuration-file)
- Properties provided by the
  [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  function; using the
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)
  SPI

## Configuring with Environment Variables

In certain environments, configuring settings through environment variables is
often preferred. Any setting that can be configured using a system property can
also be set using an environment variable. While many of the settings below
provide examples for both formats, for those that do not, use the following
steps to determine the correct name mapping for the desired system property:

- Convert the system property name to uppercase.
- Replace all `.` and `-` characters with `_`.

For example `otel.instrumentation.common.default-enabled` would convert to
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`.

## Configuration file

You can provide a path to an agent configuration file by setting the following
property:

{{% config_option name="otel.javaagent.configuration-file" %}} Path to a valid
Java properties file which contains the agent configuration.
{{% /config_option %}}

## Extensions

You can enable [extensions][] by setting the following property:

{{% config_option name="otel.javaagent.extensions" %}}

Path to an extension jar file or folder, containing jar files. If pointing to a
folder, every jar file in that folder will be treated as separate, independent
extension.

{{% /config_option %}}

## Java agent logging output

The agent's logging output can be configured by setting the following property:

{{% config_option name="otel.javaagent.logging" %}}

The Java agent logging mode. The following 3 modes are supported:

- `simple`: The agent will print out its logs using the standard error stream.
  Only `INFO` or higher logs will be printed. This is the default Java agent
  logging mode.
- `none`: The agent will not log anything - not even its own version.
- `application`: The agent will attempt to redirect its own logs to the
  instrumented application's slf4j logger. This works the best for simple
  one-jar applications that do not use multiple classloaders; Spring Boot apps
  are supported as well. The Java agent output logs can be further configured
  using the instrumented application's logging configuration (e.g. `logback.xml`
  or `log4j2.xml`). **Make sure to test that this mode works for your
  application before running it in a production environment.**

{{% /config_option %}}

## SDK Configuration

The SDK's autoconfiguration module is used for basic configuration of the agent.
Read the [docs](/docs/languages/java/configuration) to find settings such as
configuring export or sampling.

{{% alert title="Important" color="warning" %}}

Unlike the SDK autoconfiguration, versions 2.0+ of the Java agent and
OpenTelemetry Spring Boot starter use `http/protobuf` as the default protocol,
not `grpc`.

{{% /alert %}}

## Enable Resource Providers that are disabled by default

In addition to the resource configuration from the SDK autoconfiguration, you
can enable additional resource providers that are disabled by default:

{{% config_option
name="otel.resource.providers.aws.enabled"
default=false
%}} Enables the
[AWS Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources).
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.gcp.enabled"
default=false
%}} Enables the
[GCP Resource Provider](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources).
{{% /config_option %}}

[extensions]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme

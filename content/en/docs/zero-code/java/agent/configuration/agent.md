---
title: Agent configuration
linkTitle: Agent
weight: 40
---

The agent can consume configuration from one or more of the following sources
(ordered from highest to lowest priority):

- system properties
- [environment variables](#configuring-with-environment-variables)
- the [configuration file](#configuration-file)
- properties provided by the
  [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  function; using the
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)
  SPI

## Configuring with Environment Variables

In some environments, configuring via Environment Variables is more preferred.
Any setting configurable with a System Property can also be configured with an
Environment Variable. Many settings below include both options, but where they
don't apply the following steps to determine the correct name mapping of the
desired System Property:

- Convert the System Property to uppercase.
- Replace all `.` and `-` characters with `_`.

For example `otel.instrumentation.common.default-enabled` would convert to
`OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`.

## Configuration file

You can provide a path to agent configuration file by setting the following
property:

{{% config_option name="otel.javaagent.configuration-file" %}} Path to valid
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


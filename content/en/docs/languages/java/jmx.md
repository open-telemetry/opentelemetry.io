---
title: JMX Metrics
weight: 14
description: Collect metrics from JMX MBeans using OpenTelemetry
cSpell:ignore: jconsole jmxremote mbean mbeans visualvm
---

This page describes how to collect metrics from
[JMX](https://docs.oracle.com/javase/8/docs/technotes/guides/management/agent.html)
(Java Management Extensions) MBeans and export them to OpenTelemetry.

## Overview

JMX (Java Management Extensions) is a Java technology that provides tools for
managing and monitoring applications, system objects, devices, and
service-oriented networks. JMX MBeans (Managed Beans) expose management
attributes and operations that can be monitored.

The OpenTelemetry JMX Metric Insight module allows you to bridge JMX metrics
into OpenTelemetry, enabling you to:

- Monitor JVM metrics (memory, garbage collection, threads, etc.)
- Collect metrics from application-specific MBeans
- Export JMX data alongside other OpenTelemetry telemetry signals
- Use predefined metric mappings for popular target systems (Tomcat, Jetty,
  Wildfly, ...)

## Installation

### Using the Java agent

The easiest way to collect JMX metrics is using the OpenTelemetry Java agent
with the JMX metrics extension:

1. Download the OpenTelemetry Java agent (if not already installed):

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

2. Run your application with the agent and enable JMX metrics:

   ```sh
   java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.jmx.target.system=tomcat \
     -Dotel.jmx.config=/path/to/custom-metrics.yaml \
     -jar myapp.jar
   ```

JMX metrics collection is enabled by setting either (or both) of the following
configuration options:

- `otel.jmx.target.system` to select predefined metric sets to enable
- `otel.jmx.config` to provide path to custom JMX rules

When using the Java agent, the JVM runtime metrics (cpu, memory, ...) are
captured through the `runtime-telemetry` module and are enabled by default
without further configuration needed.

## Configuration

JMX metrics can be collected in two ways:

- **From within the JVM** using the internal JMX interface with the Java agent
- **From outside the JVM** using the remote JMX interface with the JMX Scraper

### Java agent Configuration

When using the OpenTelemetry Java agent, configure JMX metrics using these
properties:

| System Property          | Environment Variable     | Description                                           | Default |
| ------------------------ | ------------------------ | ----------------------------------------------------- | ------- |
| `otel.jmx.enabled`       | `OTEL_JMX_ENABLED`       | Enable JMX metric collection                          | `true`  |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | Comma-separated list of predefined metric sets to use | none    |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | Path to custom YAML for metric mapping                | none    |

### JMX Scraper Configuration

When using the standalone JMX Scraper to collect metrics from a remote JVM,
configure using these properties (note: `otel.jmx.enabled` is not needed).

| System Property          | Environment Variable     | Description                                           | Default    |
| ------------------------ | ------------------------ | ----------------------------------------------------- | ---------- |
| `otel.jmx.service.url`   | `OTEL_JMX_SERVICE_URL`   | JMX service URL for remote JVM connection             | (required) |
| `otel.jmx.target.system` | `OTEL_JMX_TARGET_SYSTEM` | Comma-separated list of predefined metric sets to use | none       |
| `otel.jmx.config`        | `OTEL_JMX_CONFIG`        | Path to custom YAML for metric mapping                | none       |

For complete configuration reference, see the
[JMX Scraper documentation](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#configuration-reference).

Please note that the remote JVM must be configured to accept remote JMX
connections, being able to connect using `jconsole` or `visualvm` tools is a
recommended first step to ensure configuration and optional authentication is
working as expected.

### Predefined Target Systems

OpenTelemetry provides predefined metric mappings for popular Java frameworks
and application servers. Use the `otel.jmx.target.system` property to enable
them (available with both Java agent and JMX Scraper):

**Example - Monitoring Tomcat (Java agent):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.target.system=tomcat \
  -jar myapp.jar
```

For a complete list of available target systems, see:

- [Java agent predefined target systems](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md#predefined-metric-sets)
- [JMX Scraper predefined target systems](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets)

You can specify multiple target systems by separating them with commas.

### Remote JMX Connections

To collect metrics from a remote JVM, you need to use the JMX Scraper. This
involves two separate JVMs:

1. **Target JVM** - The application being monitored
2. **Scraper JVM** - The JMX metric scraper

#### Step 1: Configure the Target JVM

First, start your target application with JMX remote enabled:

```sh
java -Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.port=9999 \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false \
  -jar myapp.jar
```

{{% alert title="Warning" color="warning" %}}

The example above disables authentication and SSL for simplicity. In production
environments, always enable authentication and SSL for JMX connections.

{{% /alert %}}

#### Step 2: Run the JMX Scraper

Download the JMX Scraper from the
[OpenTelemetry Java Contrib releases](https://github.com/open-telemetry/opentelemetry-java-contrib/releases)
page (look for `opentelemetry-jmx-scraper-<version>-all.jar`).

Then run the scraper, pointing it to your target JVM:

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://tomcat.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -jar opentelemetry-jmx-scraper.jar
```

You can configure the scraper using the same properties as the Java agent
(target system, collection interval, etc.).

For more details, see the
[JMX Scraper documentation](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper).

{{% alert title="Note" color="info" %}}

If you're migrating from the deprecated JMX Metric Gatherer, see the
[migration guide](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer).

{{% /alert %}}

## Custom Metric Mappings

For application-specific MBeans or custom monitoring requirements, you can
create custom metric mappings using a YAML configuration file.

### Creating a Custom YAML Configuration

Create a YAML file that defines how to map JMX attributes to OpenTelemetry
metrics:

**Example - `custom-jmx-metrics.yaml`:**

```yaml
rules:
  - bean: com.myapp:type=CustomMetrics
    mapping:
      RequestCount:
        metric: myapp.requests.count
        type: counter
        description: Total request count
        unit: '1'
      ResponseTime:
        metric: myapp.response.time
        type: gauge
        description: Average response time
        unit: ms
      ActiveSessions:
        metric: myapp.sessions.active
        type: updowncounter
        description: Active sessions
        unit: '1'
```

Use the file with your application:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.config=/path/to/custom-jmx-metrics.yaml \
  -jar myapp.jar
```

For a complete reference of the YAML syntax, see the
[JMX Metrics configuration documentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics).

## Verification

To verify that JMX metrics are being collected:

1. **Check the logs** - Look for messages indicating JMX metric collection has
   started
2. **Use the logging exporter** - Configure the logging exporter to see metrics
   in the console without needing a backend
3. **Use a metrics backend** - Configure an OTLP exporter and view the metrics
   in your observability platform
4. **Use JConsole** - Connect to your application with JConsole to verify MBeans
   are accessible

**Example with logging exporter (Java agent):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=logging \
  -jar myapp.jar
```

**Example with OTLP exporter (Java agent):**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar myapp.jar
```

**Example with OTLP exporter (JMX Scraper):**

```sh
java -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://myapp.example.com:9999/jmxrmi \
  -Dotel.jmx.target.system=tomcat \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar opentelemetry-jmx-scraper.jar
```

## Additional Resources

- [JMX Scraper Documentation](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper) -
  Complete configuration reference and examples
- [JMX Scraper Migration Guide](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#migrating-from-jmx-metric-gatherer) -
  Migrating from the deprecated JMX Metric Gatherer
- [JMX Metrics (Java agent)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md) -
  Java agent JMX metrics documentation
- [Predefined Target Systems](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-scraper#predefined-metric-sets) -
  Built-in metric sets for popular frameworks
- [Java agent Documentation](/docs/zero-code/java/agent/) - General Java agent
  configuration
- [Configuration Guide](../configuration/) - OpenTelemetry SDK configuration
  options

## Related Topics

- [Instrumentation ecosystem](../instrumentation/) - Other instrumentation
  options
- [Shims](../instrumentation/#shims) - Bridging other observability libraries
- [Metrics API](../api/#meterprovider) - Creating custom metrics

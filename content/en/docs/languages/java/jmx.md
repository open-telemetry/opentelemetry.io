---
title: JMX Metrics
weight: 14
description: Collect metrics from JMX MBeans using OpenTelemetry
cSpell:ignore: mbean mbeans jmxremote jconsole
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
- Use predefined metric mappings for popular frameworks

## Installation

### Using the Java Agent

The easiest way to collect JMX metrics is using the OpenTelemetry Java Agent
with the JMX metrics extension:

1. Download the OpenTelemetry Java Agent (if not already installed):

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```

2. Run your application with the agent and enable JMX metrics:

   ```sh
   java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.jmx.enabled=true \
     -jar myapp.jar
   ```

### As a Standalone Library

You can also use the JMX metrics library as a standalone dependency:

Add the following dependency to your project:

**Maven (`pom.xml`):**

```xml
<dependency>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-jmx-metrics</artifactId>
  <version>{{% param vers.instrumentation %}}-alpha</version>
</dependency>
```

**Gradle (`build.gradle`):**

```groovy
dependencies {
  implementation("io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha")
}
```

## Configuration

### Basic Configuration

The JMX metrics collection can be configured using system properties or
environment variables:

| System Property                | Environment Variable            | Description                                      | Default |
| ------------------------------ | ------------------------------- | ------------------------------------------------ | ------- |
| `otel.jmx.enabled`             | `OTEL_JMX_ENABLED`              | Enable JMX metric collection                     | `false` |
| `otel.jmx.target.system`       | `OTEL_JMX_TARGET_SYSTEM`        | Predefined metric set to use                     | none    |
| `otel.jmx.interval.milliseconds` | `OTEL_JMX_INTERVAL_MILLISECONDS` | Collection interval in milliseconds              | `10000` |
| `otel.jmx.service.url`         | `OTEL_JMX_SERVICE_URL`          | JMX service URL for remote connections           | none    |
| `otel.jmx.groovy.script`       | `OTEL_JMX_GROOVY_SCRIPT`        | Path to custom Groovy script for metric mapping  | none    |

### Predefined Target Systems

OpenTelemetry provides predefined metric mappings for popular Java frameworks
and application servers. Use the `otel.jmx.target.system` property to enable
them:

**Available target systems:**

- `activemq` - Apache ActiveMQ
- `cassandra` - Apache Cassandra
- `hbase` - Apache HBase
- `hadoop` - Apache Hadoop
- `jetty` - Eclipse Jetty
- `kafka` - Apache Kafka
- `kafka-consumer` - Apache Kafka Consumer
- `kafka-producer` - Apache Kafka Producer
- `solr` - Apache Solr
- `tomcat` - Apache Tomcat
- `wildfly` - WildFly Application Server

**Example - Monitoring Tomcat:**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.target.system=tomcat \
  -jar myapp.jar
```

**Example - Monitoring Kafka:**

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.target.system=kafka,kafka-producer,kafka-consumer \
  -jar myapp.jar
```

{{% alert title="Note" color="info" %}}

You can specify multiple target systems by separating them with commas.

{{% /alert %}}

### Remote JMX Connections

To collect metrics from a remote JVM, configure the JMX service URL:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
  -jar myapp.jar
```

The remote JVM must be started with JMX remote enabled:

```sh
java -Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.port=9999 \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false \
  -jar target-app.jar
```

{{% alert title="Warning" color="warning" %}}

The example above disables authentication and SSL for simplicity. In production
environments, always enable authentication and SSL for JMX connections.

{{% /alert %}}

## Custom Metric Mappings

For application-specific MBeans or custom monitoring requirements, you can
create custom metric mappings using Groovy scripts.

### Creating a Custom Groovy Script

Create a Groovy script that defines how to map JMX attributes to OpenTelemetry
metrics:

**Example - `custom-jmx-metrics.groovy`:**

```groovy
def beanName = "com.myapp:type=CustomMetrics"

otel.mbean(beanName) {
  attributes {
    "RequestCount" { instrument("myapp.requests.count", "Total request count", "1") }
    "ResponseTime" { instrument("myapp.response.time", "Average response time", "ms") }
    "ActiveSessions" { instrument("myapp.sessions.active", "Active sessions", "1") }
  }
}
```

Use the script with your application:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.groovy.script=/path/to/custom-jmx-metrics.groovy \
  -jar myapp.jar
```

## Common Use Cases

### Monitoring JVM Metrics

Enable JMX metrics to collect standard JVM metrics:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -jar myapp.jar
```

This collects metrics such as:

- Heap and non-heap memory usage
- Garbage collection statistics
- Thread counts and states
- Class loading metrics

### Monitoring Application Servers

For Tomcat, Jetty, or WildFly applications:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.target.system=tomcat \
  -jar myapp.jar
```

### Monitoring Message Brokers

For Kafka or ActiveMQ:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.target.system=kafka \
  -jar myapp.jar
```

### Monitoring Databases

For Cassandra or HBase:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.jmx.target.system=cassandra \
  -jar myapp.jar
```

## Verification

To verify that JMX metrics are being collected:

1. **Check the logs** - Look for messages indicating JMX metric collection has
   started
2. **Use a metrics backend** - Configure an OTLP exporter and view the metrics
   in your observability platform
3. **Use JConsole** - Connect to your application with JConsole to verify MBeans
   are accessible

Example with OTLP exporter:

```sh
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.jmx.enabled=true \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -jar myapp.jar
```

## Additional Resources

- [JMX Metrics README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md) -
  Detailed documentation and examples
- [Predefined Metric Mappings](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent/src/main/resources/jmx/rules) -
  Built-in rules for popular frameworks
- [Java Agent Documentation](/docs/zero-code/java/agent/) - General Java Agent
  configuration
- [Configuration Guide](../configuration/) - OpenTelemetry SDK configuration
  options

## Related Topics

- [Instrumentation ecosystem](../instrumentation/) - Other instrumentation
  options
- [Shims](../instrumentation/#shims) - Bridging other observability libraries
- [Metrics API](../api/#meterprovider) - Creating custom metrics

---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 20
---

To learn how to manually instrument your
service or app code, see [Manual instrumentation](../manual).

## Setup

1.  Download [opentelemetry-javaagent.jar][] from [Releases][] of the
    `opentelemetry-java-instrumentation` repository and place the JAR in your
    preferred directory. The JAR file contains the agent and instrumentation
    libraries.
2.  Add `-javaagent:path/to/opentelemetry-javaagent.jar` and other config to
    your JVM startup arguments and launch your app:

    - Directly on the startup command:

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - Via the `JAVA_TOOL_OPTIONS` and other environment variables:

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## Configuring the agent

The agent is highly configurable.

One option is to pass configuration properties via the `-D` flag. In this
example, a service name and Zipkin exporter for traces are configured:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

You can also use environment variables to configure the agent:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

You can also supply a Java properties file and load configuration values from
there:

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

or

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

To see the full range of configuration options, see [Agent Configuration][].

## Supported libraries, frameworks, application services, and JVMs

The Java agent ships with instrumentation libraries for many popular components.
For the full list, see [Supported libraries, frameworks, application services,
and JVMs][support].

## Troubleshooting

You can pass the `-Dotel.javaagent.debug=true` parameter to the agent to see
debug logs. Note that these are quite verbose.

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to [annotate](annotations) selected methods or add
[manual instrumentation](../manual) to collect custom telemetry data.

[agent configuration]: agent-config
[opentelemetry-javaagent.jar]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md

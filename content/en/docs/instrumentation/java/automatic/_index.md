---
title: Automatic Instrumentation
linkTitle: Automatic
aliases:
  - /docs/java/automatic_instrumentation
  - /docs/instrumentation/java/automatic_instrumentation
spelling: cSpell:ignore javaagent myapp zipkin Dotel
weight: 3
---

Automatic instrumentation with Java uses a Java agent JAR that can be attached
to any Java 8+ application. It dynamically injects bytecode to capture telemetry
from many popular libraries and frameworks. It can be used to capture telemetry
data at the "edges" of an app or service, such as inbound requests, outbound
HTTP calls, database calls, and so on. To learn how to manually instrument your
service or app code, see [Manual instrumentation](../manual).

## Setup

 1. Download [opentelemetry-javaagent.jar][] from [Releases][] of the
    `opentelemetry-java-instrumentation` repo. The JAR file contains the agent
    and all automatic instrumentation packages.
 2. Place the JAR in your preferred directory and launch it with your app:

    ```console
    $ java -javaagent:path/to/opentelemetry-javaagent.jar -jar myapp.jar
    ```

## Configuring the agent

The agent is highly configurable.

One option is to pass configuration properties via the `-D` flag. In this
example, a service name and zipkin exporter for traces are configured:

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

You can also supply a Java properties file and load configuration values from there:

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

Many popular components support automatic instrumentation. For the full list,
see [Supported libraries, frameworks, application services, and JVMs][support].

## Troubleshooting

You can pass the `-Dotel.javaagent.debug=true` parameter to the agent to see
debug logs. Note that these are quite verbose.

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to [annotate](annotations) selected methods or add [manual
instrumentation](../manual) to collect custom telemetry data.

[Agent Configuration]: agent-config
[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md

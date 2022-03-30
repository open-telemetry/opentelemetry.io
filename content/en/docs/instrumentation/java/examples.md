---
title: Examples
description: Java instrumentation examples
aliases:
  - /docs/java/instrumentation_examples
  - /docs/instrumentation/java/instrumentation_examples
weight: 6
---

## Manual instrumentation

For fully-functional examples of manual instrumentation, see [Java OpenTelemetry
Examples][].

## Community Resources

### boot-opentelemetry-tempo

Project demonstrating Complete Observability Stack utilizing
[Prometheus](https://prometheus.io/), [Loki](https://grafana.com/oss/loki/)
(_For distributed logging_), [Tempo](https://grafana.com/oss/tempo/) (_For
Distributed tracing, this basically uses Jaeger Internally_),
[Grafana](https://grafana.com/grafana/) for **Java/spring** based applications
(_With OpenTelemetry auto / manual Instrumentation_) involving multiple
microservices with DB interactions

Checkout
[boot-opentelemetry-tempo](https://github.com/mnadeem/boot-opentelemetry-tempo)
and get started

```console
$ mvn clean package docker:build
$ docker-compose up
```

### Automatic instrumentation with multiple exporters

This [cookbook](https://github.com/Aternity/Tech-Community/blob/main/106-opentelemetry-autoinstrumentation-java-app) shows a simple Java application that is built in a Docker container and then runs with OpenTelemetry automatic instrumentation. The OpenTelemetry instrumentation is configured with multiple telemetry exporters using environment variable. In parallel the app will be logging telemetry on the console, exporting to a local [jaeger-all-in-one container](https://hub.docker.com/r/jaegertracing/all-in-one), and also exporting to the Aternity APM SaaS backend with the [Aternity APM OpenTelemetry collector container](https://hub.docker.com/r/aternity/apm-collector).

If the collectors are already running and exposed locally you can run your app (myapp.jar) with OpenTelemetry automatic instrumentation and multiple exporters like this:

```bash
# Configure OpenTelemetry instrumentation (OTEL_TRACES_EXPORTER default is "OTLP")
OTEL_SERVICE_NAME="myapp"
OTEL_TRACES_EXPORTER=logging,otlp,jaeger

## OTLP-gRPC
OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"

## Jaeger
OTEL_EXPORTER_JAEGER_ENDPOINT="http://localhost:14250"

# Inject OpenTelemetry automatic instrumentation
curl -OL https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v1.12.1/opentelemetry-javaagent.jar
JAVA_TOOL_OPTIONS="-javaagent:./opentelemetry-javaagent.jar"

# Run the app
java -jar myapp.jar
```


[Java OpenTelemetry Examples]: https://github.com/open-telemetry/opentelemetry-java-docs#java-opentelemetry-examples

---
title: Fraud Detection Service
linkTitle: Fraud Detection
aliases: [frauddetectionservice]
---

This service analyses incoming orders and detects malicious customers. This is
only mocked and received orders are printed out.

[Fraud Detection service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## Auto-instrumentation

This service relies on the OpenTelemetry Java agent to automatically instrument
libraries such as Kafka, and to configure the OpenTelemetry SDK. The agent is
passed into the process using the `-javaagent` command line argument. Command
line arguments are added through the `JAVA_TOOL_OPTIONS` in the `Dockerfile`,
and leveraged during the automatically generated Gradle startup script.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

---
title: Java Agent
aliases:
  - /docs/java/automatic_instrumentation
  - /docs/languages/java/automatic_instrumentation
redirects: [{ from: /docs/languages/java/automatic/*, to: ':splat' }]
---

Zero-code instrumentation with Java uses a Java agent JAR attached to any Java
8+ application. It dynamically injects bytecode to capture telemetry from many
popular libraries and frameworks. It can be used to capture telemetry data at
the "edges" of an app or service, such as inbound requests, outbound HTTP calls,
database calls, and so on. To learn how to manually instrument your service or
app code, see [Manual instrumentation](/docs/languages/java/instrumentation/).

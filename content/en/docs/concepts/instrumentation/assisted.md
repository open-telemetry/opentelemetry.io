---
title: Assisted
description: >-
  Learn about ways to simplify the process of instrumenting your code.
weight: 30
---

Different to
[Automatic Instrumentation](/docs/concepts/instrumentation/automatic/) an
**Assisted Instrumentation** requires configuration or code changes, yet they
provide a convenient way to quickly add OpenTelemetry to your application.

An example for a technology that assists instrumentation are
[**Instrumention Libraries**](/docs/concepts/instrumentation/libaries), which
are added by a developer to their application to extract telemetry from their
dependencies. By using them, they are no longer required to write a wrapper
themselves. Although they are an intermediate solution, until the libraries
provide out of the box support for OpenTelemetry.

Another example are language or framework specific packages, that simplify the
setup and usage of OpenTelemetry:

- For Spring Boot you can use the **Spring Boot Starter**, which will allow you
  to instrument **Spring Boot Native images** and has less overhead compared to
  the Java agent.
- For Go you can use the **compile-time** instrumentation, which will inject
  OpenTelemetry instrumentation while your application is built.

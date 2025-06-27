---
title: Assisted
description: >-
  Learn about ways to simplify the process of instrumenting your code.
weight: 30
---

Different from
[Automatic Instrumentation](/docs/concepts/instrumentation/automatic/), an
**Assisted Instrumentation** requires configuration or code changes, yet they
provide a convenient way to quickly add OpenTelemetry to your application.

An example of a technology that assists instrumentation is an
[**Instrumentation Library**](/docs/concepts/instrumentation/libraries), which
is added by a developer to their application to extract telemetry from their
dependencies. By using libraries, developers are no longer required to write a wrapper
themselves. Instrumentation libraries are an intermediate solution until the libraries
provide out-of-the-box support for OpenTelemetry.

Language- or framework-specific packages are another example of assisted instrumentation. They simplify the
setup and usage of OpenTelemetry:

- For Spring Boot, you can use the **Spring Boot Starter**, which allows you
  to instrument **Spring Boot Native images** and has less overhead compared to
  the Java agent.
- For Go, you can use the **compile-time** instrumentation, which injects
  OpenTelemetry instrumentation while your application is built.

---
title: Automatic
description: >-
  Learn how Automatic Instrumentation can add observability to your application
  without the need to touch your code
weight: 30
---

If applicable a language specific implementation of OpenTelemetry will provide a
way to instrument your application without touching your source code. While the
underlying mechanism depends on the language, at a minimum this will add the
OpenTelemetry API and SDK capabilities to your application. Additionally they
may add a set of Instrumentation Libraries and exporter dependencies.

Configuration is available via environment variables and possibly language
specific means such as system properties in Java. At a minimum, a service name
must be configured to identify the service being instrumented. A variety of
other configuration options are available and may include:

- Data source specific configuration
- Exporter configuration
- Propagator configuration
- Resource configuration

Automatic instrumentation is available for the following languages:

- [.NET](/docs/instrumentation/net/automatic/)
- [Java](/docs/instrumentation/java/automatic/)
- [JavaScript](/docs/instrumentation/js/automatic/)
- [PHP](/docs/instrumentation/php/automatic/)
- [Python](/docs/instrumentation/python/automatic/)

---
title: Zero-Code
description: >-
  Learn how to add observability to an application without the need to touch the
  code
weight: 10
aliases: [automatic]
---

As [ops](/docs/getting-started/ops/) you may want to add observability to an
application (or to many applications!) without being able to add instrumentation
to the code base. Or, you may be looking for a way to quickly gain some basic
observability for an application, before diving into learning how to use the
OpenTelemetry API & SDK for
[code-based instrumentation](/docs/concepts/instrumentation/code-based).

In those cases you will be able to leverage language specific zero-code
solutions, that use mechanisms like byte-code instrumentation, monkey patching
or eBPF, to inject calls to the OpenTelemetry API & SDK into your application.

While the underlying mechanism depends on the language, at a minimum this will
add the OpenTelemetry API and SDK capabilities to your application. Additionally
they may add a set of
[Instrumentation Libraries](/docs/concepts/instrumentation/libraries) and
[exporter](/docs/concepts/components/#exporters) dependencies.

Configuration is available via environment variables and possibly language
specific means such as system properties in Java. At a minimum, a service name
must be configured to identify the service being instrumented. A variety of
other configuration options are available and may include:

- Data source specific configuration
- Exporter configuration
- Propagator configuration
- Resource configuration

Automatic instrumentation is available for the following languages:

- [.NET](/docs/languages/net/automatic/)
- [Java](/docs/languages/java/automatic/)
- [JavaScript](/docs/languages/js/automatic/)
- [PHP](/docs/languages/php/automatic/)
- [Python](/docs/languages/python/automatic/)

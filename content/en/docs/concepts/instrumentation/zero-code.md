---
title: Zero-Code
description: >-
  Learn how to add observability to an application without the need to write
  more code
weight: 10
aliases: [automatic]
---

As [ops](/docs/getting-started/ops/) you might want to add observability to one
or more applications without having to edit the source, probably because you
can't or you're not allowed to. In other cases, you might be looking for a way
to quickly gain some OTel observability for a service before diving into
learning how to use the OpenTelemetry API & SDK for
[code-based instrumentation](/docs/concepts/instrumentation/code-based).

In all the previous cases, you can leverage language specific zero-code
solutions, which use mechanisms like bytecode instrumentation, monkey patching,
or eBPF to inject calls to the OpenTelemetry API and SDK into your application.

While the underlying mechanism depends on the language, zero-code
instrumentation adds the OpenTelemetry API and SDK capabilities to your
application with almost no effort. In addition, you can use the same process to
add a set of
[Instrumentation Libraries](/docs/concepts/instrumentation/libraries) and
[exporter](/docs/concepts/components/#exporters) dependencies.

You can configure zero-code instrumentation through environment variables and
other language-specific mechanisms, such as system properties or arguments
passed to initialization methods. To get started, you only need a service name
configured so that you can identify the service in the observability backend of
your choice.

Other configuration options are available, including:

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

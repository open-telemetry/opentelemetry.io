---
title: Extend the Collector
linkTitle: Extend
description:
  Learn how to extend the OpenTelemetry Collector with custom components
weight: 90
---

The OpenTelemetry Collector is designed to be extensible. While the core
Collector comes with a wide variety of receivers, processors, and exporters, you
may find that you need to support a custom protocol, process data in a specific
way, or send data to a proprietary backend.

This section guides you through extending the Collector using the
[OpenTelemetry Collector Builder (OCB)](./ocb/) and creating custom components.

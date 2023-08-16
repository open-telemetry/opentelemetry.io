---
title: Extensions
aliases: [/docs/instrumentation/java/extensions]
description: >-
  Extensions add capabilities to the agent without having to create a separate
  distribution.
weight: 30
---

## Introduction

Extensions are designed to override or customize the instrumentation provided by
the upstream agent without having to create a new OpenTelemetry distribution or
alter the agent code in any way.

Consider an instrumented database client that creates a span per database call
and extracts data from the database connection to provide span attributes. The
following are sample use cases for that scenario that can be solved by using
extensions:

- _"I don't want this span at all"_:

  Create an extension to disable selected instrumentation by providing new
  default settings.

- _"I want to edit some attributes that don't depend on any db connection
  instance"_:

  Create an extension that provide a custom `SpanProcessor`.

- _"I want to edit some attributes and their values depend on a specific db
  connection instance"_:

  Create an extension with new instrumentation which injects its own advice into
  the same method as the original one. You can use the `order` method to ensure
  it runs after the original instrumentation and augment the current span with
  new information.

- _"I want to remove some attributes"_:

  Create an extension with a custom exporter or use the attribute filtering
  functionality in the OpenTelemetry Collector.

- _"I don't like the OTel spans. I want to modify them and their lifecycle"_:

  Create an extension that disables existing instrumentation and replace it with
  new one that injects `Advice` into the same (or a better) method as the
  original instrumentation. You can write your `Advice` for this and use the
  existing `Tracer` directly or extend it. As you have your own `Advice`, you
  can control which `Tracer` you use.

## Extension examples

To get a demonstration how to create an extension for the OpenTelemetry Java
instrumentation agent,
[build and run the extension project](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension).

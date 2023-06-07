---
title: Instrumentation
description: >-
  How OpenTelemetry facilitates automatic and manual instrumentation of
  applications.
aliases: [/docs/concepts/instrumenting]
weight: 15
---

In order to make a system observable, it must be **instrumented**: That is, code
from the system's components must emit
[traces](/docs/concepts/observability-primer/#distributed-traces),
[metrics](/docs/concepts/observability-primer/#reliability--metrics), and
[logs](/docs/concepts/observability-primer/#logs).

Without being required to modify the source code you can collect telemetry from
an application using [automatic instrumentation](automatic/). If you previously
used an APM agent to extract telemetry from your application, Automatic
Instrumentation will give you a similar out of the box experience.

To facilitate the instrumentation of applications even more, you can
[manually instrument](manual/) your applications by coding against the
OpenTelemetry APIs.

For that you don't need to instrument all the dependencies used in your
application:

- some of your libraries will be observable out of the box by calling the
  OpenTelemetry API themselves directly. Those libraries are sometimes called
  **natively instrumented**.
- for libraries without such an integration the OpenTelemetry projects provide
  language specific [Instrumentation Libraries][]

Note, that for most languages it is possible to use both manual and automatic
instrumentation at the same time: Automatic Instrumentation will allow you to
gain insights into your application quickly and manual instrumentation will
enable you to embed granular observability into your code.

The exact installation mechanism for [manual](manual/) and
[automatic](automatic/) instrumentation varies based on the language you’re
developing in, but there are some similarities covered in the sections below.

[instrumentation libraries]:
  /docs/specs/otel/overview/#instrumentation-libraries

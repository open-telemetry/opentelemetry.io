---
title: Instrumentation
description: >-
  How OpenTelemetry facilitates automatic and manual instrumentation of
  applications.
aliases: [instrumenting]
weight: 15
---

In order to make a system observable, it must be **instrumented**: That is, code
from the system's components must emit [traces](/docs/concepts/signals/traces/),
[metrics](/docs/concepts/signals/metrics/), and
[logs](/docs/concepts/signals/logs/).

OpenTelemetry provides APIs and SDKs for eleven languages to facilitate the process
of instrumenting your code:

- 



You can accomplish this by either coding against the OpenTelemetry APIs, or by
leveraging a language-specific zero-code solution that will add instrumentation
to your code automatically. Depending on your [role](https://opentelemetry.io/docs/getting-started/)
you may prefer the one way of instrumentation over the other: if you are writing
the code of an application or library, you may prefer code-based instrumentation,
and if you run an application you don't created yourself, the zero-code approach
is for you.

Note, that for most languages it is possible to use both approaches at the same time,
so you can start with an automatic approach to gain insights quickly and then update
your code with embedded more granular observability.




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

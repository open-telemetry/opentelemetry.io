---
title: Instrumentation
description: >-
  How OpenTelemetry facilitates the instrumentation of libraries and
  applications.
aliases: [instrumenting]
weight: 15
---

In order to make a system observable, it must be **instrumented**: That is, code
from the system's components must emit [traces](/docs/concepts/signals/traces/),
[metrics](/docs/concepts/signals/metrics/), and
[logs](/docs/concepts/signals/logs/).

OpenTelemetry provides [APIs and SDKs for eleven languages](/docs/languages) to
facilitate the process of instrumenting your code. Among others it provides the
following benefits:

- Each language-specific implementation of the API and SDK follows the
  requirements and expectations of the
  [OpenTelemetry specification](/docs/specs/otel/)
- Libraries can leverage the OpenTelemetry API as a dependency, which will have
  no impact on applications using that library, unless the OpenTelemetry SDK is
  imported.
- For each [signal](/docs/concepts/signals) (traces, metrics, logs) you will
  find methods to create them, process them and export them.
- With [context propagation](/docs/concepts/context-propagation) being built
  into the implementations, you can correlate signals, regardless of where they
  are generated
- [Resources](/docs/concepts/resources) and
  [Instrumentation Scopes](/docs/concepts/instrumentation-scope) allow grouping
  of signals, by different entities.
- [Semantic Conventions](/docs/concepts/semantic-conventions) provide a common
  naming schema that can be used for standardization across code bases and
  platforms.

As a [developer](/docs/getting-started/dev/) you are able to code against the
OpenTelemetry API, to enrich your application (or library) with granular
observability. For that, you only need to instrument your code, as your
dependencies will either integrate OpenTelemetry themselves directly, or you can
leverage
[Instrumentation Libraries](/docs/specs/otel/overview/#instrumentation-libraries)
for those without such an integration.

As [ops](/docs/getting-started/ops/) you will find
[zero-code](/docs/concepts/instrumentation/zero-code) solutions for many
languages, that will add instrumentation to an application without you knowing
about the inner workings of that application.

For most languages it is possible to use both approaches at the same time, so
you can start with a zero-code approach to gain insights quickly and then update
your code with embedded more granular observability.

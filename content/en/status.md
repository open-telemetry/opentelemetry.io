---
title: Status
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: Maturity-level of the main OpenTelemetry components
---

{{% blocks/section color="white" %}}

## {{% param title %}}

OpenTelemetry is made up of [several components][main-comp], some
language-specific and others language-agnostic. When looking for a status, make
sure to look for the status from the right component page. For example, the
status of a signal in the specification may not be the same as the signal status
in a particular language SDK.

For the development status, or maturity level, of a
[language SDK](/docs/instrumentation/), see the status section of that language:

<div class="l-status-secondary mt-0">

- [C++](/docs/instrumentation/cpp/#status-and-releases)
- [.NET](/docs/instrumentation/net/#status-and-releases)
- [Erlang/Elixir](/docs/instrumentation/erlang/#status-and-releases)
- [Go](/docs/instrumentation/go/#status-and-releases)
- [Java](/docs/instrumentation/java/#status-and-releases)
- [JavaScript](/docs/instrumentation/js/#status-and-releases)
- [PHP](/docs/instrumentation/php/#status-and-releases)
- [Python](/docs/instrumentation/python/#status-and-releases)
- [Ruby](/docs/instrumentation/ruby/#status-and-releases)
- [Rust](/docs/instrumentation/rust/#status-and-releases)
- [Swift](/docs/instrumentation/swift/#status-and-releases)

</div>

For the development status, or maturity level, of the
[collector](/docs/collector/) and [specification](/docs/specs/otel/), see the
following:

<div class="l-status-primary mt-0">

- [Specification status](/docs/specs/otel/status/)
- [Collector status](/docs/collector/#status-and-releases)

</div>

[main-comp]: /docs/concepts/components/

{{% /blocks/section %}}

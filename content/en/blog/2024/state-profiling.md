---
title: The State of Profiling
linkTitle: Profiling state
date: 2024-10-25
author: >-
  [Damien Mathieu](https://github.com/dmathieu) (Elastic), [Pablo
  Baeyens](https://github.com/mx-psi) (Datadog), [Felix
  Geisendörfer](https://github.com/felixge) (Datadog), [Christos
  Kalkanis](https://github.com/christos68k) (Elastic), [Morgan
  McLean](https://github.com/mtwo) (Splunk), [Florian
  Lehner](https://github.com/florianl) (Elastic), [Tim
  Rühsen](https://github.com/rockdaboot) (Elastic)
issue: https://github.com/open-telemetry/opentelemetry.io/issues/5477
sig: Profiling SIG
cSpell:ignore: Baeyens Florian Geisendörfer Kalkanis Lehner Mathieu Rühsen
---

A little over six months ago, OpenTelemetry announced
[support for the profiling signal](/blog/2024/profiling/). While the signal is
still in development and isn’t yet recommended for production use, the Profiling
SIG has made substantial progress on many fronts.

This post provides a summary of the progress the Profiling SIG has made over the
past six months.

## OTLP improvements

Profiles were added as a new signal type to OTLP in
[v1.3.0](https://github.com/open-telemetry/opentelemetry-proto/releases/tag/v1.3.0),
though this area is still marked as unstable as we continue to make changes to
it.

While our original intent was to keep wire compatibility with
[pprof](https://github.com/google/pprof), that goal proved impractical, so the
Profiling SIG
[has decided](https://github.com/open-telemetry/opentelemetry-proto/issues/567#issuecomment-2286565449)
to refactor the protocol and not aim for strict compatibility with pprof.
Instead, we will aim for convertibility, similarly to what we already do for
other signals. This shift is still a work in progress, and is causing several
breaking changes to the profiling section of the protocol. Note that this has no
impact on the stable sections that make up the majority of the OTLP protocol,
like metrics, spans, logs, resources, etc.

## eBPF agent improvements

Back in June, the
[donation of the Elastic Continuous Profiling Agent](/blog/2024/elastic-contributes-continuous-profiling-agent/)
was finalized. Since then, the
[opentelemetry-ebpf-profiler](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)
repository has been buzzing with improvements.

Our next goal for the eBPF agent is for it to run as a Collector receiver. Once
this is complete, the Collector can be run on every node as an agent, which
collects profiles for that host and forwards them using OTLP. This architecture
will allow us to extract some specific parts of the agent that aren’t strictly
profiling, such as retrieving host metadata and system metrics, and move them to
processors, making the agent lighter and more modular.

## Collector support

Since
[v0.112.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.112.0),
the OpenTelemetry Collector is able to receive, process and export profiling
data, and has support for profile ingestion and export using OTLP.

You can try it out by enabling the `service.profilesSupport`
[feature gate](https://github.com/open-telemetry/opentelemetry-collector/blob/main/featuregate/README.md#controlling-gates)
in your collector, followed by a configuration similar to the following, which
ingests and exports data using OTLP:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
exporters:
  otlp:
    endpoint: 'localhost:4317'
service:
  pipelines:
    profiles:
      receivers: [otlp]
      exporters: [otlp]
```

While this feature can be used now on the Collector, we do not yet recommend
doing so in production: it is still under heavy development and is expected to
have breaking changes, such as the ones mentioned above with OTLP.

However, this support in the Collector means that any receiver, processor or
exporter of the Collector can now start adding profiles support, which we highly
encourage to do, as a way to allow a smoother integration in the future, as well
as to find potential issues early. If you wish to report a bug or contribute on
this effort, you can
[view them on the contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+label%3Adata%3Aprofiles).

## Semantic Conventions and Specification

To improve interoperability, the Profiling SIG worked also on
[OpenTelemetry Semantic Conventions for profiling](/docs/specs/semconv/registry/attributes/profile/).
There is also ongoing work to introduce a
[profiling OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/pull/4197).
This work will continue and should enable wide adoption across different
platforms, tools and other OTel signals.

## What’s next ?

Support for profiles in OpenTelemetry is moving very quickly, and while we’re
still far from being able to provide a stable signal, we are happy to report
that folks can start hacking with it, and integrate it within their modules.

If you’re interested in helping profiling move forward, or face issues when
integrating with it, the Profiling SIG is always happy to get or provide help.

You can find us on
[#otel-profiles](https://cloud-native.slack.com/archives/C03J794L0BV) in the
CNCF slack.

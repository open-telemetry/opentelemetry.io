---
title: Erlang/Elixir
weight: 130
description: >
  <img width="35" class="img-initial otel-icon"
  src="/img/logos/32x32/Erlang_SDK.svg" alt="Erlang/Elixir"> A language-specific
  implementation of OpenTelemetry in Erlang/Elixir.
cascade:
  versions:
    otelSdk: 1.5
    otelApi: 1.4
    otelSemconv: 1.27
    otelApiExperimental: 0.6
    otelSdkExperimental: 0.6
    otelExporter: 1.8
    otelPhoenix: 2.0
    otelCowboy: 1.0
    otelEcto: 1.2
cSpell:ignore: ecto
---

{{% docs/languages/index-intro erlang %}}

Packages of the API, SDK and OTLP exporter are published to
[`hex.pm`](https://hex.pm) as
[`opentelemetry_api`](https://hex.pm/packages/opentelemetry_api),
[`opentelemetry`](https://hex.pm/packages/opentelemetry) and
[`opentelemetry_exporter`](https://hex.pm/packages/opentelemetry_exporter).

## Version support

OpenTelemetry Erlang supports Erlang 23+ and Elixir 1.13+.

## Repositories

- [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang):
  Main repository containing the API, SDK and OTLP Exporter.
- [opentelemetry-erlang-contrib](https://github.com/open-telemetry/opentelemetry-erlang-contrib):
  Helpful libraries and instrumentation libraries for Erlang/Elixir projects
  like [Phoenix](https://www.phoenixframework.org/) and
  [Ecto](https://hexdocs.pm/ecto/Ecto.html)

{{% /docs/languages/index-intro %}}

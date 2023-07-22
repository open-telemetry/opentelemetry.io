---
title: Erlang/Elixir
weight: 14
description: >
  <img width="35" class="img-initial" src="/img/logos/32x32/Erlang_SDK.svg"
  alt="Erlang/Elixir"> A language-specific implementation of OpenTelemetry in
  Erlang/Elixir.
spelling: cSpell:ignore ecto
cascade:
  versions:
    otelSdk: 1.3
    otelApi: 1.2
    otelExporter: 1.6
    otelPhoenix: 1.1
    otelCowboy: 0.2
---

{{% docs/instrumentation/index-intro erlang %}}

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

{{% /docs/instrumentation/index-intro %}}

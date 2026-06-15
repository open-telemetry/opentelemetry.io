---
title: Erlang/Elixir
weight: 130
description: >
  <img width="35" class="img-initial otel-icon" src="/img/logos/32x32/Erlang_SDK.svg" alt="Erlang/Elixir"> Специфічна для мови реалізація OpenTelemetry в Erlang/Elixir.
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
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: ecto
---

{{% docs/languages/index-intro erlang /%}}

Пакунки API, SDK та OTLP експортера публікуються на [`hex.pm`](https://hex.pm) як [`opentelemetry_api`](https://hex.pm/packages/opentelemetry_api), [`opentelemetry`](https://hex.pm/packages/opentelemetry) та [`opentelemetry_exporter`](https://hex.pm/packages/opentelemetry_exporter).

## Підтримка версій {#version-support}

OpenTelemetry Erlang підтримує Erlang 23+ та Elixir 1.13+.

## Репозиторії {#repositories}

- [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang): Основний репозиторій, що містить API, SDK та OTLP експортер.
- [opentelemetry-erlang-contrib](https://github.com/open-telemetry/opentelemetry-erlang-contrib): Корисні бібліотеки та бібліотеки інструментування для проектів на Erlang/Elixir таких як [Phoenix](https://www.phoenixframework.org/) та [Ecto](https://hexdocs.pm/ecto/Ecto.html)

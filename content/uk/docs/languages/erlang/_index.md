---
title: Erlang/Elixir
weight: 14
description: >
  <img width="35" class="img-initial otel-icon" src="/img/logos/32x32/Erlang_SDK.svg" alt="Erlang/Elixir"> Специфічна для мови реалізація OpenTelemetry в Erlang/Elixir.
cascade:
  versions:
    otelSdk: 1.3
    otelApi: 1.2
    otelExporter: 1.6
    otelPhoenix: 1.1
    otelCowboy: 0.2
    otelEcto: 1.2
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
cSpell:ignore: ecto
---

{{% docs/languages/index-intro erlang /%}}

Пакунки API, SDK та OTLP експортера публікуються на [`hex.pm`](https://hex.pm) як [`opentelemetry_api`](https://hex.pm/packages/opentelemetry_api), [`opentelemetry`](https://hex.pm/packages/opentelemetry) та [`opentelemetry_exporter`](https://hex.pm/packages/opentelemetry_exporter).

## Підтримка версій {#version-support}

OpenTelemetry Erlang підтримує Erlang 23+ та Elixir 1.13+.

## Репозиторії {#repositories}

- [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang): Основний репозиторій, що містить API, SDK та OTLP експортер.
- [opentelemetry-erlang-contrib](https://github.com/open-telemetry/opentelemetry-erlang-contrib): Корисні бібліотеки та бібліотеки інструментування для проектів на Erlang/Elixir таких як [Phoenix](https://www.phoenixframework.org/) та [Ecto](https://hexdocs.pm/ecto/Ecto.html)

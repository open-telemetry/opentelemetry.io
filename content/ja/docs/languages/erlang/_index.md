---
title: Erlang/Elixir
weight: 130
description: >
  <img width="35" class="img-initial otel-icon"
  src="/img/logos/32x32/Erlang_SDK.svg" alt="Erlang/Elixir"> Erlang/Elixir における OpenTelemetry の言語固有の実装。
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
default_lang_commit: 055e4933b5a29eb283300a071158d7caa0542b1c
cSpell:ignore: ecto
---

{{% docs/languages/index-intro erlang %}}

API、SDK、OTLP エクスポーターのパッケージは [`hex.pm`](https://hex.pm) で [`opentelemetry_api`](https://hex.pm/packages/opentelemetry_api)、[`opentelemetry`](https://hex.pm/packages/opentelemetry)、[`opentelemetry_exporter`](https://hex.pm/packages/opentelemetry_exporter) として公開されています。

## バージョンサポート {#version-support}

OpenTelemetry Erlang は Erlang 23 以降および Elixir 1.13 以降をサポートしています。

## リポジトリ {#repositories}

- [opentelemetry-erlang](https://github.com/open-telemetry/opentelemetry-erlang):
  API、SDK、OTLP エクスポーターを含むメインリポジトリ。
- [opentelemetry-erlang-contrib](https://github.com/open-telemetry/opentelemetry-erlang-contrib):
  [Phoenix](https://www.phoenixframework.org/) や [Ecto](https://hexdocs.pm/ecto/Ecto.html) などの Erlang/Elixir プロジェクト向けの便利なライブラリと計装ライブラリ。

{{% /docs/languages/index-intro %}}

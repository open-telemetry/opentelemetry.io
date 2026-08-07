---
title: Flagd-UI サービス
linkTitle: Flagd-UI
aliases: [flagd-uiservice]
default_lang_commit: c5406fb091b81c0d8e55aa36d0215c3f987e2aef
cSpell:ignore: uiservice
---

このサービスは、ユーザーがフィーチャーフラグを切り替えたり編集したりして、デモ環境の動作を変更できるフロントエンドとして機能します。

[Flagd-UI サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/)

## トレーシングの初期化 {#initializing-tracing}

Phoenix エンドポイントとリクエストの自動計装に必要な依存関係をインストールした後、[公式ドキュメント](/docs/languages/erlang/getting-started/)に従って `config/runtime.exs` ファイルを編集し、設定を行います。

```elixir
otel_endpoint =
  System.get_env("OTEL_EXPORTER_OTLP_ENDPOINT") ||
    raise """
    environment variable OTEL_EXPORTER_OTLP_ENDPOINT is missing.
    """

config :opentelemetry, :processors,
    otel_batch_processor: %{
      exporter: {:opentelemetry_exporter, %{endpoints: [otel_endpoint]}}
    }
```

また、[`lib/flagd_ui/application.ex`](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/lib/flagd_ui/application.ex) 内で OpenTelemetry Bandit アダプターと Phoenix ライブラリも初期化します。

```elixir
OpentelemetryBandit.setup()
OpentelemetryPhoenix.setup(adapter: :bandit)
```

## トレース {#traces}

Phoenix と Bandit は専用のライブラリを通じて自動計装されます。

## メトリクス {#metrics}

TBD

## ログ {#logs}

TBD

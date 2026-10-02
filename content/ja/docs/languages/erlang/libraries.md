---
title: 計装ライブラリを使用する
linkTitle: ライブラリ
weight: 40
default_lang_commit: 13eed4c86de528f6824a9a2010fa7ad3f63743fc
cSpell:ignore: Ecto Hex
---

{{% docs/languages/libraries-intro "erlang" %}}

## 計装ライブラリを使用する {#use-instrumentation-libraries}

ライブラリに OpenTelemetry のサポートが含まれていない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリやフレームワークのテレメトリーデータを生成できます。

たとえば、[Ecto 用の計装ライブラリ](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_ecto)は、クエリに基づいて自動的に[スパン](/docs/concepts/signals/traces/#spans)を作成します。

## セットアップ {#setup}

各計装ライブラリは Hex パッケージとして配布されています。
計装をインストールするには、`mix.exs` ファイルに依存関係を追加します。
たとえば、次のようにします。

```elixir
def deps do
  [
    {:opentelemetry_{package}, "~> 1.0"}
  ]
end
```

`{package}` は計装の名前です。

一部の計装ライブラリには前提条件がある場合があります。
詳細な手順については、各計装ライブラリのドキュメントを確認してください。

## 利用可能な計装ライブラリ {#available-instrumentation-libraries}

計装ライブラリの完全なリストについては、[Hex パッケージの一覧](https://hex.pm/packages?search=opentelemetry&sort=recent_downloads)を参照してください。

また、[レジストリ](/ecosystem/registry/?language=erlang&component=instrumentation)でも追加の計装を見つけることができます。

## 次のステップ {#next-steps}

計装ライブラリをセットアップした後は、カスタムテレメトリーデータを収集するために、コードに独自の[計装](/docs/languages/erlang/instrumentation)を追加することを検討してください。

また、テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/erlang/exporters)するために、適切なエクスポーターを設定することも検討してください。

---
title: 伝搬
weight: 60
default_lang_commit: 5ec6f9be2f6645aca56794b24524a6f5316613b6
cSpell:ignore: elli
---

{{% docs/languages/propagation %}}

## 自動コンテキスト伝搬 {#automatic-context-propagation}

分散トレースは単一のサービスを超えて広がるため、スパン間の親子関係を作成するためにサービス間でコンテキストを伝搬する必要があります。
これにはサービス間の[_コンテキスト伝搬_](/docs/specs/otel/overview/#context-propagation)が必要であり、トレースの識別子がリモートプロセスに送信されるメカニズムです。

[Phoenix](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_phoenix)、[Cowboy](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_cowboy)、[Elli](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_elli) などの HTTP フレームワークおよびサーバーの計装ライブラリや、[Tesla](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_tesla) などのクライアントは、グローバルに登録されたプロパゲーターを使用してコンテキストを自動的に注入または抽出します。
デフォルトで使用されるグローバルプロパゲーターは、W3C [Trace Context](https://w3c.github.io/trace-context/) と [Baggage](https://www.w3.org/TR/baggage/) フォーマットです。

OTP アプリケーション環境変数 `text_map_propagators` を使用して、グローバルプロパゲーターを設定できます。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% sys.config
...
{text_map_propagators, [baggage,
                        trace_context]},
...
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
## runtime.exs
...
text_map_propagators: [:baggage, :trace_context],
...
```

{{% /tab %}} {{< /tabpane >}}

環境変数 `OTEL_PROPAGATORS` を使用して、カンマ区切りのリストを渡すこともできます。
どちらの設定方法でも、`trace_context`、`baggage`、[`b3`](https://github.com/openzipkin/b3-propagation)、`b3multi` の値を受け付けます。

## 手動コンテキスト伝搬 {#manual-context-propagation}

コンテキストを手動で注入または抽出するには、`otel_propagator_text_map` モジュールを使用します。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% プロセスディクショナリのコンテキストを使用して、空のヘッダーリストに追加する
Headers = otel_propagator_text_map:inject([]),

%% ヘッダーからプロセスディクショナリにコンテキストを作成する
otel_propagator_text_map:extract(Headers),
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# プロセスディクショナリのコンテキストを使用して、空のヘッダーリストに追加する
headers = :otel_propagator_text_map.inject([])

# ヘッダーからプロセスディクショナリにコンテキストを作成する
:otel_propagator_text_map.extract(headers)
```

{{% /tab %}} {{< /tabpane >}}

`otel_propagator_text_map:inject/1` と `otel_propagator_text_map:extract/1` は、グローバルに登録されたプロパゲーターを使用します。
特定のプロパゲーターを使用するには、`otel_propagator_text_map:inject/2` と `otel_propagator_text_map:extract/2` を使用し、第一引数に呼び出すプロパゲーターモジュールの名前を指定します。

## 次のステップ {#next-steps}

伝搬について詳しくは、[Propagators API 仕様](/docs/specs/otel/context/api-propagators/)を参照してください。

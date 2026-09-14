---
title: テスト
weight: 100
default_lang_commit: ef74cd393090313b5ad970e74d499a97505fffb8
cSpell:ignore: defmodule defrecordp stdlib testcase
---

オブザーバビリティのために OpenTelemetry を利用している場合、特定のスパンが作成され、属性が正しく設定されていることをテストすることが重要になることがあります。
たとえば、最終的に SLO を支えるデータに正しいメタデータを付与していると確信できるでしょうか。
このドキュメントでは、そのような検証のアプローチを説明します。

## セットアップ {#setup}

Elixir/Erlang でのテストには `opentelemetry` と `opentelemetry_api` ライブラリのみが必要です。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
```

{{% /tab %}} {{< /tabpane >}}

`exporter` を `:none` に、スパンプロセッサーを `:otel_simple_processor` に設定します。
これにより、テストが実際にデータを送信先にエクスポートしなくなり、スパンが処理された後に解析できるようになります。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
{opentelemetry,
  [{traces_exporter, none},
   {processors,
     [{otel_simple_processor, #{}}]}]}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/test.exs
import Config

config :opentelemetry,
    traces_exporter: :none

config :opentelemetry, :processors, [
  {:otel_simple_processor, %{}}
]
```

{{% /tab %}} {{< /tabpane >}}

[はじめに](/docs/languages/erlang/getting-started/)ガイドの `hello` 関数を修正したものをテストケースとして使います。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% アクティブスパンを開始し、ローカル関数を実行する
    ?with_span(<<"operation">>, #{}, fun nice_operation/1).

nice_operation(_SpanCtx) ->
    ?set_attributes([{a_key, <<"a value">>}]),
    world
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# lib/otel_getting_started.ex
defmodule OtelGettingStarted do
  require OpenTelemetry.Tracer, as: Tracer

  def hello do
    Tracer.with_span "operation" do
      Tracer.set_attributes([{:a_key, "a value"}])
      :world
    end
  end
end
```

{{% /tab %}} {{< /tabpane >}}

## テスト {#testing}

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-module(otel_getting_started_SUITE).

-compile(export_all).

-include_lib("stdlib/include/assert.hrl").
-include_lib("common_test/include/ct.hrl").

-include_lib("opentelemetry/include/otel_span.hrl").

-define(assertReceive(SpanName),
        receive
            {span, Span=#span{name=SpanName}} ->
                Span
        after
            1000 ->
                ct:fail("Did not receive the span after 1s")
        end).

all() ->
    [greets_the_world].

init_per_suite(Config) ->
    application:load(opentelemetry),
    application:set_env(opentelemetry, processors, [{otel_simple_processor, #{}}]),
    {ok, _} = application:ensure_all_started(opentelemetry),
    Config.

end_per_suite(_Config) ->
    _ = application:stop(opentelemetry),
    _ = application:unload(opentelemetry),
    ok.

init_per_testcase(greets_the_world, Config) ->
    otel_simple_processor:set_exporter(otel_exporter_pid, self()),
    Config.

end_per_testcase(greets_the_world, _Config) ->
    otel_simple_processor:set_exporter(none),
    ok.

greets_the_world(_Config) ->
    otel_getting_started:hello(),

    ExpectedAttributes = otel_attributes:new(#{a_key => <<"a_value">>}, 128, infinity),
    #span{attributes=ReceivedAttributes} = ?assertReceive(<<"operation">>),

    %% `receive` の中でマッチングする代わりに assertMatch を使うことで、
    %% 失敗時にわかりやすいエラーメッセージを得られる
    ?assertMatch(ReceivedAttributes, ExpectedAttributes),

    ok.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
defmodule OtelGettingStartedTest do
  use ExUnit.Case

  # Record モジュールを使って opentelemetry 依存関係の Span レコードのフィールドを抽出する。
  require Record
  @fields Record.extract(:span, from: "deps/opentelemetry/include/otel_span.hrl")
  # `Span` のマクロを定義する。
  Record.defrecordp(:span, @fields)

  test "greets the world" do
    # エクスポーターを :otel_exporter_pid に設定する。
    # これにより、スパンが指定したプロセス（この場合は self()）に {:span, span} の形式で送信される。
    :otel_simple_processor.set_exporter(:otel_exporter_pid, self())

    # テスト対象の関数を呼び出す。
    OtelGettingStarted.hello()

    # Erlang の `:otel_attributes` モジュールを使って、マッチング用の属性を作成する。
    # イベントのテストには `:otel_events` モジュールを参照。
    attributes = :otel_attributes.new([a_key: "a value"], 128, :infinity)

    # OtelGettingStarted.hello/0 が出力したスパンを受信し、期待する属性を含むことを検証する。
    assert_receive {:span,
                    span(
                      name: "operation",
                      attributes: ^attributes
                    )}
  end
end
```

{{% /tab %}} {{< /tabpane >}}

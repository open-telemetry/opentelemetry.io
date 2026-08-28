---
title: サンプリング
weight: 80
# For the writing of behaviour, see
# https://www.erlang.org/doc/reference_manual/modules.html#behaviour-module-attribute
default_lang_commit: 055e4933b5a29eb283300a071158d7caa0542b1c
cSpell:ignore: behaviour defmodule healthcheck
---

<!-- markdownlint-disable no-duplicate-heading -->

[サンプリング](/docs/concepts/sampling/)は、システムによって生成されるトレースの量を制限するプロセスです。
Erlang SDK はいくつかの[ヘッドサンプラー](/docs/concepts/sampling#head-sampling)を提供しています。

## デフォルトの動作 {#default-behavior}

デフォルトでは、すべてのスパンがサンプリングされ、トレースの 100% がサンプリングされます。
データ量を管理する必要がない場合は、サンプラーを設定する必要はありません。

## ParentBasedSampler {#parentbasedsampler}

サンプリングにおいて、`ParentBasedSampler` は[ヘッドサンプリング](/docs/concepts/sampling/#head-sampling)で最もよく使用されます。
スパンの親のサンプリング決定、または親が存在しないという事実を使用して、どの二次サンプラーを使用するかを判断します。

サンプラーは環境変数 `OTEL_TRACES_SAMPLER` と `OTEL_TRACES_SAMPLER_ARG` で設定できます。
また、アプリケーション設定を使用すると、スパンの親の5つの潜在的な状態それぞれを設定できます。

- `root` - 親なし
- `remote_parent_sampled` - 親はサンプリングされたリモートスパン
- `remote_parent_not_sampled` - 親はサンプリングされていないリモートスパン
- `local_parent_sampled` - 親はサンプリングされたローカルスパン
- `local_parent_not_sampled` - 親はサンプリングされていないローカルスパン

### TraceIdRatioBasedSampler {#traceidratiobasedsampler}

`ParentBasedSampler` 内で最もよく使われるのは `TraceIdRatioBasedSampler` です。
パラメーターとして渡したパーセンテージのトレースを決定論的にサンプリングします。

#### 環境変数 {#environment-variables}

環境変数で `TraceIdRatioBasedSampler` を設定できます。

```shell
export OTEL_TRACES_SAMPLER="parentbased_traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

これにより、トレースの 10% のみが作成されるようにスパンをサンプリングするよう SDK に指示します。

#### アプリケーション設定 {#application-configuration}

アプリケーション設定の例です。
ルートサンプラーでトレースの 10% をサンプリングし、その他のケースでは親の決定を使用します。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
{opentelemetry, {sampler, {parent_based, #{root => {trace_id_ratio_based, 0.10},
                                          remote_parent_sampled => always_on,
                                          remote_parent_not_sampled => always_off,
                                          local_parent_sampled => always_on,
                                          local_parent_not_sampled => always_off}}}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/runtime.exs
config :opentelemetry, sampler: {:parent_based, %{root: {:trace_id_ratio_based, 0.10},
                                                  remote_parent_sampled: :always_on,
                                                  remote_parent_not_sampled: :always_off,
                                                  local_parent_sampled: :always_on,
                                                  local_parent_not_sampled: :always_off}}
```

{{% /tab %}} {{< /tabpane >}}

### AlwaysOn と AlwaysOff サンプラー {#alwayson-and-alwaysoff-sampler}

その他の2つの組み込みサンプラーは `AlwaysOnSampler` と `AlwaysOffSampler` です。

#### 環境変数 {#environment-variables-1}

環境変数 `OTEL_TRACES_SAMPLER` を使って、`ParentBasedSampler` で `AlwaysOnSampler` または `AlwaysOffSampler` を使用するように設定できます。

```shell
export OTEL_TRACES_SAMPLER="parentbased_always_on"
```

`AlwaysOffSampler` の場合は以下のとおりです。

```shell
export OTEL_TRACES_SAMPLER="parentbased_always_off"
```

#### アプリケーション設定 {#application-configuration-1}

アプリケーション設定の例です。
ルートサンプラーで常にサンプリングし、その他のケースでは親の決定を使用します。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% config/sys.config.src
{opentelemetry, {sampler, {parent_based, #{root => always_on,
                                          remote_parent_sampled => always_on,
                                          remote_parent_not_sampled => always_off,
                                          local_parent_sampled => always_on,
                                          local_parent_not_sampled => always_off}}}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
# config/runtime.exs
config :opentelemetry, sampler: {:parent_based, %{root: :always_on,
                                                  remote_parent_sampled: :always_on,
                                                  remote_parent_not_sampled: :always_off,
                                                  local_parent_sampled: :always_on,
                                                  local_parent_not_sampled: :always_off}}
```

{{% /tab %}} {{< /tabpane >}}

## カスタムサンプラー {#custom-sampler}

カスタムサンプラーは [`otel_sampler` ビヘイビア](https://hexdocs.pm/opentelemetry/1.3.0/otel_sampler.html#callbacks)を実装することで作成できます。
このサンプラーの例を示します。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
-module(attribute_sampler).

-behavior(otel_sampler).

-export([description/1,
         setup/1,
         should_sample/7]).

-include("otel_sampler.hrl").

setup(Attributes) when is_map(Attributes) ->
    Attributes;
setup(_) ->
    #{}.

description(_) ->
    <<"AttributeSampler">>.

should_sample(_Ctx, _TraceId, _Links, _SpanName, _SpanKind, Attributes, ConfigAttributes) ->
    AttributesSet = sets:from_list(maps:to_list(Attributes)),
    ConfigSet = sets:from_list(maps:to_list(ConfigAttributes)),
    case sets:is_disjoint(AttributesSet, ConfigSet) of
        true -> {?RECORD_AND_SAMPLE, [], []};
        _ -> {?DROP, [], []}
end.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
defmodule AttributesSampler do
  def setup(attributes) when is_map(attributes) do
    attributes
  end

  def setup(_) do
    %{}
  end

  def description(_) do
    "ExampleSampler"
  end

  def should_sample(_ctx, _trace_id, _links, _span_name, _span_kind, attributes, config_attributes) do
    no_match =
      Enum.into(attributes, %MapSet{})
      |> MapSet.disjoint?(Enum.into(config_attributes, %MapSet{}))

    if no_match, do: {:record_and_sample, [], []}, else: {:drop, [], []}
  end
end
```

{{% /tab %}} {{< /tabpane >}}

このサンプラーは、サンプラーの設定として渡された属性と一致する属性を持たないスパンをサンプリングします。

リクエストされた URL が `/healthcheck` であることを指定する属性を持つスパンをサンプリングしない設定の例です。

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{opentelemetry, {sampler, {attributes_sampler, #{'http.target' => <<"/healthcheck">>}}}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
config :opentelemetry, sampler: {AttributesSampler, %{"http.target": "/healthcheck"}}
```

{{% /tab %}} {{< /tabpane >}}

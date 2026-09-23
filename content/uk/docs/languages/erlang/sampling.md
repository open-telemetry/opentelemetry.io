---
title: Вибірка
weight: 80
# For the writing of behaviour, see
# https://www.erlang.org/doc/reference_manual/modules.html#behaviour-module-attribute
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: alwaysoff alwayson behaviour defmodule healthcheck
---

<!-- markdownlint-disable no-duplicate-heading -->

[Вибірка](/docs/concepts/sampling/) — це процес, який обмежує кількість трейсів, що генеруються системою. SDK Erlang пропонує кілька [головних вибірників](/docs/concepts/sampling#head-sampling).

## Стандартна поведінка {#default-behavior}

Стандартно всі відрізки вибираються, і таким чином, 100% трейсів вибираються. Якщо вам не потрібно керувати обсягом даних, вам не потрібно налаштовувати механізм вибірки.

## ParentBasedSampler

При вибірці найчастіше використовується `ParentBasedSampler` для [головної вибірки](/docs/concepts/sampling/#head-sampling). Він використовує рішення про вибірку від батьківського відрізка або факт відсутності батька, щоб знати, який вторинний вибірник використовувати.

Вибірник можна налаштувати за допомогою змінних середовища `OTEL_TRACES_SAMPLER` та `OTEL_TRACES_SAMPLER_ARG` або за допомогою конфігурації застосунку, що дозволяє налаштувати кожен з 5 потенційних станів батьківського відрізка:

- `root` - Немає батька
- `remote_parent_sampled` - Батько з віддаленого відрізка, який вибирається
- `remote_parent_not_sampled` - Батько з віддаленого відрізка, який не вибирається
- `local_parent_sampled` - Батько з локального відрізка, який вибирається
- `local_parent_not_sampled` - Батько з локального відрізка, який не вибирається

### TraceIdRatioBasedSampler

У межах `ParentBasedSampler` найпоширенішим є `TraceIdRatioBasedSampler`. Він детерміновано вибирає відсоток трейсів, який ви передаєте як параметр.

#### Змінні середовища {#environment-variables}

Ви можете налаштувати `TraceIdRatioBasedSampler` за допомогою змінних середовища:

```shell
export OTEL_TRACES_SAMPLER="parentbased_traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

Це вказує SDK вибирати відрізки так, щоб створювалися лише 10% трасувань.

#### Конфігурація застосунків {#application-configuration}

Приклад у конфігурації застосунку з кореневим механізмом вибірки для вибірки 10% трейсів і використанням рішення батька в інших випадках:

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

### AlwaysOn і AlwaysOff Sampler {#alwayson-and-alwaysoff-sampler}

Інші два вбудовані механізми вибірки — це `AlwaysOnSampler` та `AlwaysOffSampler`.

#### Змінні середовища {#environment-variables}

Ви можете налаштувати `ParentBasedSampler` для використання або `AlwaysOnSampler`, або AlwaysOffSampler`за допомогою змінної середовища`OTEL_TRACES_SAMPLER`:

```shell
export OTEL_TRACES_SAMPLER="parentbased_always_on"
```

І для `AlwaysOffSampler`:

```shell
export OTEL_TRACES_SAMPLER="parentbased_always_off"
```

#### Конфігурація застосунку {#application-configuration}

Ось приклад у конфігурації застосунком з кореневим механізмом вибірки, який завжди вибирає, і використанням рішення батька в інших випадках:

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

## Користувацький механізм вибірки {#custom-sampler}

Користувацькі механізми вибірки можна створити, реалізувавши [`otel_sampler` поведінку](https://hexdocs.pm/opentelemetry/1.3.0/otel_sampler.html#callbacks). Цей приклад механізму вибірки:

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

Вибірка відрізків, які не мають жодних атрибутів, що збігаються з атрибутами, переданими як конфігурація механізму вибірки.

Приклад конфігурації, щоб не вибирати жодного відрізка з атрибутом, що вказує на запитаний URL `/healthcheck`:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
{opentelemetry, {sampler, {attributes_sampler, #{'http.target' => <<"/healthcheck">>}}}}
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
config :opentelemetry, sampler: {AttributesSampler, %{"http.target": "/healthcheck"}}
```

{{% /tab %}} {{< /tabpane >}}

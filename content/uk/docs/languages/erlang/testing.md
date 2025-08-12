---
title: Тестування
weight: 100
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: defmodule defrecordp stdlib testcase
---

Коли ви покладаєтесь на OpenTelemetry для ваших потреб в спостережуваності, важливо тестувати, що певні відрізки створюються та атрибути встановлюються правильно. Наприклад, чи можете ви бути впевнені, що додаєте правильні метадані до даних, які в кінцевому підсумку підтримують SLO? Цей документ охоплює підхід до такого виду валідації.

## Налаштування {#setup}

Тільки бібліотеки `opentelemetry` та `opentelemetry_api` потрібні для тестування в Elixir/Erlang:

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

Встановіть ваш `exporter` на `:none` і процесор відрізків на `:otel_simple_processor`. Це забезпечить, що ваші тести фактично не експортують дані до призначення, і що відрізки можуть бути проаналізовані після їх обробки.

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

Модифікована версія функції `hello` з розділу [Початок роботи](/docs/languages/erlang/getting-started/) посібника буде служити нашим тестовим випадком:

{{< tabpane text=true >}} {{% tab Erlang %}}

```erlang
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% почати активний відрізок і виконати локальну функцію
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

## Тестування {#testing}

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
                ct:fail("Не отримано відрізок після 1с")
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

    %% використовуйте assertMatch замість співпадіння в `receive`
    %% щоб отримати гарне повідомлення про помилку, якщо це не вдасться
    ?assertMatch(ReceivedAttributes, ExpectedAttributes),

    ok.
```

{{% /tab %}} {{% tab Elixir %}}

```elixir
defmodule OtelGettingStartedTest do
  use ExUnit.Case

  # Використовуйте модуль Record для вилучення полів запису Span з залежності opentelemetry.
  require Record
  @fields Record.extract(:span, from: "deps/opentelemetry/include/otel_span.hrl")
  # Визначте макроси для `Span`.
  Record.defrecordp(:span, @fields)

  test "greets the world" do
    # Встановіть експортер на :otel_exporter_pid, який надсилає відрізки
    # до вказаного процесу - в цьому випадку self() - у форматі {:span, span}
    :otel_simple_processor.set_exporter(:otel_exporter_pid, self())

    # Викличте функцію для тестування.
    OtelGettingStarted.hello()

    # Використовуйте модуль Erlang `:otel_attributes` для створення атрибутів для збігу.
    # Дивіться модуль `:otel_events` для тестування подій.
    attributes = :otel_attributes.new([a_key: "a value"], 128, :infinity)

    # Переконайтеся, що відрізок, випущений OtelGettingStarted.hello/0, був отриманий і містить бажані атрибути.
    assert_receive {:span,
                    span(
                      name: "operation",
                      attributes: ^attributes
                    )}
  end
end
```

{{% /tab %}} {{< /tabpane >}}

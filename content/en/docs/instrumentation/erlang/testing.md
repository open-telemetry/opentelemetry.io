---
title: "Testing"
draft: true
---

When relying on OpenTelemetry for alerts, pages, or SLIs/SLOs, it can be important to test that certain spans are created and attributes correctly set.

## Setup
Only the `opentelemetry` and `opentelemetry_api` libraries are required for testing in Elixir/Erlang:

{{< tabs Erlang Elixir >}}

{{< tab >}}
{deps, [{opentelemetry_api, "~> 1.0"},
        {opentelemetry, "~> 1.0"}]}.
{{< /tab >}}

{{< tab >}}
def deps do
  [
    {:opentelemetry_api, "~> 1.0"},
    {:opentelemetry, "~> 1.0"}
  ]
end
{{< /tab >}}

{{< /tabs >}}

The test configuration should set the `exporter` to `:none` and the span processor to `:otel_simple_processor`.

{{< tabs Erlang Elixir >}}

{{< tab >}}
{opentelemetry,
  [{traces_exporter, none},
   {processors,
     [{otel_simple_processor, #{}}]}]}
{{< /tab >}}

{{< tab >}}
# config/test.exs
import Config

config :opentelemetry,
    traces_exporter: :none

config :opentelemetry, :processors, [
  {:otel_simple_processor, %{}}
]
{{< /tab >}}

{{< /tabs >}}

A modified version of the `hello` function from the Getting Started guide will serve as our test case:

{{< tabs Erlang Elixir >}}

{{< tab >}}
%% apps/otel_getting_started/src/otel_getting_started.erl
-module(otel_getting_started).

-export([hello/0]).

-include_lib("opentelemetry_api/include/otel_tracer.hrl").

hello() ->
    %% start an active span and run a local function
    ?with_span(<<"operation">>, #{}, fun nice_operation/1).

nice_operation(_SpanCtx) ->
    ?set_attributes([{a_key, <<"a value">>}]),
    world
{{< /tab >}}

{{< tab >}}
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
{{< /tab >}}

{{< /tabs >}}

## Testing

{{< tabs Erlang Elixir >}}

{{< tab >}}
TODO
{{< /tab >}}

{{< tab >}}
defmodule OtelGettingStartedTest do
  use ExUnit.Case

  # Use Record module to extract fields of the Span record from the opentelemetry dependency.
  require Record
  @fields Record.extract(:span, from: "deps/opentelemetry/include/otel_span.hrl")
  # Define macros for `Span`.
  Record.defrecordp(:span, @fields)

  test "greets the world" do
    # Set exporter to :otel_exporter_pid, which sends spans
    # to the given process - in this case self() - in the format {:span, span}
    :otel_batch_processor.set_exporter(:otel_exporter_pid, self())
    OpenTelemetry.get_tracer(:test_tracer)

    # Call the function to be tested.
    OtelGettingStarted.hello()

    # Use Erlang's `:otel_attributes` module to create attributes to match against.
    # See the `:otel_events` module for testing events.
    attributes = :otel_attributes.new([a_key: "a_value"], 128, :infinity)

    # Assert that the span emitted by OtelGettingStarted.hello/0 was received and contains the desired attributes.
    assert_receive {:span, span(
      name: "operation",
      attributes: ^attributes
      )}
  end
end
{{< /tab >}}

{{< /tabs >}}

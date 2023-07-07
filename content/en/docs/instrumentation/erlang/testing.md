---
title: Testing
weight: 100
spelling: cSpell:ignore defmodule stdlib defrecordp testcase
versions: 
    otelSdk: 1.3
    otelApi: 1.2
---

When relying on OpenTelemetry for your Observability needs, it can be important
to test that certain spans are created and attributes correctly set. For
example, can you be sure that you attaching the right metadata to data that
ultimately powers an SLO? This document covers an approach to that kind of
validation.

## Setup

Only the `opentelemetry` and `opentelemetry_api` libraries are required for
testing in Elixir/Erlang:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
{deps, [{opentelemetry_api, "~> {{% param versions.otelApi %}}"},
        {opentelemetry, "~> {{% param versions.otelSdk %}}"}]}.
{{< /tab >}}

{{< tab Elixir >}}
def deps do
  [
    {:opentelemetry_api, "~> {{% param versions.otelApi %}}"},
    {:opentelemetry, "~> {{% param versions.otelSdk %}}"}
  ]
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Set your `exporter` to `:none` and the span processor to
`:otel_simple_processor`. This ensure that your tests don't actually export data
to a destination, and that spans can be analyzed after they are processed.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
%% config/sys.config.src
{opentelemetry,
  [{traces_exporter, none},
   {processors,
     [{otel_simple_processor, #{}}]}]}
{{< /tab >}}

{{< tab Elixir >}}
# config/test.exs
import Config

config :opentelemetry,
    traces_exporter: :none

config :opentelemetry, :processors, [
  {:otel_simple_processor, %{}}
]
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

A modified version of the `hello` function from the
[Getting Started](/docs/instrumentation/erlang/getting-started/) guide will
serve as our test case:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
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

{{< tab Elixir >}}
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

{{< /tabpane >}}
<!-- prettier-ignore-end -->

## Testing

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab Erlang >}}
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

    %% use an assertMatch instead of matching in the `receive'
    %% so we get a nice error message if it fails
    ?assertMatch(ReceivedAttributes, ExpectedAttributes),

    ok.
{{< /tab >}}

{{< tab Elixir >}}
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
    :otel_simple_processor.set_exporter(:otel_exporter_pid, self())

    # Call the function to be tested.
    OtelGettingStarted.hello()

    # Use Erlang's `:otel_attributes` module to create attributes to match against.
    # See the `:otel_events` module for testing events.
    attributes = :otel_attributes.new([a_key: "a value"], 128, :infinity)

    # Assert that the span emitted by OtelGettingStarted.hello/0 was received and contains the desired attributes.
    assert_receive {:span,
                    span(
                      name: "operation",
                      attributes: ^attributes
                    )}
  end
end
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

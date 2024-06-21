---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
cSpell:ignore: Ecto Hex
---

{{% docs/languages/libraries-intro "Erlang" %}}

## Use instrumentation libraries

If a library doesn't include OpenTelemetry support, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.

For example,
[the instrumentation library for Ecto](https://github.com/open-telemetry/opentelemetry-erlang-contrib/tree/main/instrumentation/opentelemetry_ecto)
automatically creates [spans](/docs/concepts/signals/traces/#spans) based on
queries.

## Setup

Each instrumentation library is distributed as a Hex package. To install an
instrumentation, add the dependency to your `mix.exs` file. For example:

```elixir
def deps do
  [
    {:opentelemetry_{package}, "~> 1.0"}
  ]
end
```

Where `{package}` is the name of the instrumentation.

Note that some instrumentation libraries might have prerequisites. Check the
documentation of each instrumentation library for further instructions.

## Available instrumentation libraries

For a full list of instrumentation libraries, see the
[list of Hex packages](https://hex.pm/packages?search=opentelemetry&sort=recent_downloads).

You can also find more instrumentations available in the
[registry](/ecosystem/registry/?language=erlang&component=instrumentation).

## Next steps

After you have set up instrumentation libraries, you might want to add your own
[instrumentation](/docs/languages/erlang/instrumentation) to your code, to
collect custom telemetry data.

You might also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/erlang/exporters) to one or more
telemetry backends.

---
title: Flagd-UI Service
linkTitle: Flagd-UI
aliases: [flagd-uiservice]
cSpell:ignore: sinatra
---

This service acts as a frontend where users can toggle and edit feature flags to alter the behavior of the
demo environment.

[Email service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/flagd-ui/)

## Initializing Tracing

Once installed the necessary dependencies for auto-instrumentation of Phoenix endpoints and requests, we
configure them according to the [official documentation](https://opentelemetry.io/docs/languages/erlang/getting-started/),
editing the `config/runtime.exs` file:

```elixir
otel_endpoint =
  System.get_env("OTEL_EXPORTER_OTLP_ENDPOINT") ||
    raise """
    environment variable OTEL_EXPORTER_OTLP_ENDPOINT is missing.
    """

config :opentelemetry,
  span_processor: :batch,
  traces_exporter: :otlp

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: otel_endpoint
```

And we initialize the OpenTelemetry Bandit adapter and the Phoenix library as well inside `application.ex`:

```elixir
OpentelemetryBandit.setup()
OpentelemetryPhoenix.setup(adapter: :bandit)
```

## Traces

### Create new spans

New spans can be created requiring the Tracer module and using it.


```elixir
require OpenTelemetry.Tracer, as: Tracer

def some_business_logic do
  Tracer.with_span :business_logic do
    # business logic goes here
  end
end
```

## Metrics

TBD

## Logs

TBD

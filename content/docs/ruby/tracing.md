---
title: "Tracing"
---

This page contains documentation for OpenTelemetry Ruby.

# Quick Start

**Please note** that this library is currently in *alpha*, and shouldn't be used in production environments.

The API and SDK packages are available on [rubygems.org](https://rubygems.org/), and can installed via `bundler`:

```bash
bundle install opentelemetry-api
bundle install opentelemetry-sdk
```

From there, you should be able to use opentelemetry as per the following:

```ruby
require 'opentelemetry/sdk'

# Set preferred tracer implementation:
SDK = OpenTelemetry::SDK

factory = OpenTelemetry.tracer_factory = SDK::Trace::TracerFactory.new
factory.add_span_processor(
  SDK::Trace::Export::SimpleSpanProcessor.new(
    SDK::Trace::Export::ConsoleSpanExporter.new
  )
)

tracer = factory.tracer('my_app_or_gem', Gem.loaded_specs['my_app_or_gem']&.version.to_s)
tracer.in_span('foo') do |foo_span|
  tracer.in_span('bar') do |bar_span|
    tracer.in_span('baz') do |baz_span|
      pp baz_span
    end
  end
end
```

# API Reference

See the [API documentation](https://github.com/open-telemetry/opentelemetry-ruby) for more detail, and the [opentelemetry-example-app](https://github.com/open-telemetry/opentelemetry-ruby/tree/master/examples/http) for a complete example.
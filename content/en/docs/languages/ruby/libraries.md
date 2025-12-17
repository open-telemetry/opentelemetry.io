---
title: Using instrumentation libraries
linkTitle: Libraries
aliases: [configuring_automatic_instrumentation, automatic]
weight: 30
cSpell:ignore: faraday metapackage sinatra
---

{{% docs/languages/libraries-intro ruby %}}

## Use Instrumentation Libraries

If a library does not come with OpenTelemetry out of the box, you can use
[instrumentation libraries](/docs/specs/otel/glossary/#instrumentation-library)
in order to generate telemetry data for a library or framework.

For example, if you are using Rails and enable
[`opentelemetry-instrumentation-rails`](https://rubygems.org/gems/opentelemetry-instrumentation-rails/),
your running Rails app will automatically generate telemetry data for inbound
requests to your controllers.

### Configuring all instrumentation libraries

OpenTelemetry Ruby provides the metapackage
[`opentelemetry-instrumentation-all`](https://rubygems.org/gems/opentelemetry-instrumentation-all)
that bundles all ruby-based instrumentation libraries into a single package.
It’s a convenient way to add telemetry for all your libraries with minimal
effort:

```sh
gem 'opentelemetry-sdk'
gem 'opentelemetry-exporter-otlp'
gem 'opentelemetry-instrumentation-all'
```

and configure it early in your application lifecycle. See the example below
using a Rails initializer:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
  c.use_all() # enables all instrumentation!
end
```

This will install all instrumentation libraries and enable the ones that match
up to libraries you're using in your app.

### Overriding configuration for specific instrumentation libraries

If you are enabling all instrumentation but want to override the configuration
for a specific one, call `use_all` with a configuration map parameter, where the
key represents the library, and the value is its specific configuration
parameter.

For example, here's how you can install all instrumentations _except_ the
`Redis` instrumentation into your app:

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

OpenTelemetry::SDK.configure do |c|
  config = {'OpenTelemetry::Instrumentation::Redis' => { enabled: false }}
  c.use_all(config)
end
```

To override more instrumentation, add another entry in the `config` map.

#### Overriding configuration for specific instrumentation libraries with environment variables

You can also disable specific instrumentation libraries using environment
variables. An instrumentation disabled by an environment variable takes
precedence over local config. The convention for environment variable names is
the library name, upcased with `::` replaced by underscores, `OPENTELEMETRY`
shortened to `OTEL_LANG`, and `_ENABLED` appended.

For example, the environment variable name for
`OpenTelemetry::Instrumentation::Sinatra` is
`OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED`.

```bash
export OTEL_RUBY_INSTRUMENTATION_SINATRA_ENABLED=false
```

### Configuring specific instrumentation libraries

If you prefer more selectively installing and using only specific
instrumentation libraries, you can do that too. For example, here's how to use
only `Sinatra` and `Faraday`, with `Faraday` being configured with an additional
configuration parameter.

First, install the specific instrumentation libraries you know you want to use:

```sh
gem install opentelemetry-instrumentation-sinatra
gem install opentelemetry-instrumentation-faraday
```

Then configure them:

```ruby
require 'opentelemetry/sdk'

# install all compatible instrumentation with default configuration
OpenTelemetry::SDK.configure do |c|
  c.use 'OpenTelemetry::Instrumentation::Sinatra'
  c.use 'OpenTelemetry::Instrumentation::Faraday', { opt: 'value' }
end
```

#### Configuring specific instrumentation libraries with environment variables

You can also define the option for specific instrumentation libraries using
environment variables. By convention, the environment variable will be the name
of the instrumentation, upcased with `::` replaced by underscores,
`OPENTELEMETRY` shortened to `OTEL_{LANG}`, and `_CONFIG_OPTS` appended.

For example, the environment variable name for
`OpenTelemetry::Instrumentation::Faraday` is
`OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS`. A value of
`peer_service=new_service;span_kind=client` overrides the options set from
[previous section](#configuring-specific-instrumentation-libraries) for Faraday.

```bash
export OTEL_RUBY_INSTRUMENTATION_FARADAY_CONFIG_OPTS="peer_service=new_service;span_kind=client"
```

The following table lists the acceptable format for values according to the
option data type:

| Data Type | Value                      | Example          |
| --------- | -------------------------- | ---------------- |
| Array     | string with `,` separation | `option=a,b,c,d` |
| Boolean   | true/false                 | `option=true`    |
| Integer   | string                     | `option=string`  |
| String    | string                     | `option=string`  |
| Enum      | string                     | `option=string`  |
| Callable  | not allowed                | N\A              |

### Next steps

Instrumentation libraries are the easiest way to generate lots of useful
telemetry data about your Ruby apps. But they don't generate data specific to
your application's logic! To do that, you'll need to enrich the instrumentation
from instrumentation libraries with your own
[instrumentation code](../instrumentation).

---
title: Getting Started
description: Get telemetry from your app in less than 5 minutes!
aliases: [/docs/instrumentation/ruby/getting_started]
spelling: cSpell:ignore truffleruby sinatra rolldice struct darwin Tracestate
spelling: cSpell:ignore tracestate
weight: 1
---

This page will show you how to get started with OpenTelemetry in Ruby.

You will learn how you can instrument a simple application automatically, in
such a way that [traces][], [metrics][] and [logs][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- MRI Ruby >= `3.0`, jruby >= `9.3.2.0`, or truffleruby >= 22.1
- [Bundler](https://bundler.io/)

{{% alert  title="Warning" color="warning" %}} `jruby` only targets compatibility with MRI Ruby
2.6.8, which is EOL. This project does not officially support MRI Ruby 2.6.8,
and provides `jruby` support on a best-effort basis until the `jruby` project
supports compatibility with more modern Ruby runtimes.

While tested, support for `truffleruby` is on a best-effort basis at this time. {{% /alert %}}

## Example Application

The following example uses a basic [Rails](https://rubyonrails.org/)
application. If you are not using Sinatra, that's ok — you can use OpenTelemetry
Ruby with other web frameworks as well, such as Sinatra and Rack. For a complete
list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=ruby).

For more elaborate examples, see
[examples](/docs/instrumentation/ruby/examples/).

### Dependencies

To begin, install rails:

```sh
gem install rails
```

### Create the application

Create a new api-only application called `dice-ruby` and change into the newly
created folder `dice-ruby`

```sh
rails new --api dice-ruby
cd dice-ruby
```

Create a controller for rolling a dice:

```sh
rails generate controller dice
```

This will create a file called `app/controllers/dice_controller.rb`. Open that
file in your preferred editor and update it with the following code:

```ruby
class DiceController < ApplicationController
    def roll
        render json: (rand(6) + 1).to_s
    end
end
```

Next, open the `config/routes.rb` file and add the following code:

```ruby
Rails.application.routes.draw do
  get 'rolldice', to: 'dice#roll'
end
```

Run the application with the following command and open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
rails server -p 8080
```

If everything works fine you should see a number between 1 and 6 returned to
you. You can now stop the application and instrument it using OpenTelemetry.

### Instrumentation

Install the `opentelemetry-sdk` and `opentelemetry-instrumentation-all`
packages:

```sh
bundle add opentelemetry-sdk opentelemetry-instrumentation-all
```

The inclusion of `opentelemetry-instrumentation-all` provides
[instrumentations][auto] for Rails, Sinatra, several HTTP libraries, and more.

For Rails applications, the usual way to initialize OpenTelemetry is in a Rails
initializer. For other Ruby services, perform this initialization as early as
possible in the start-up process.

Create a file named `config/initializers/opentelemetry.rb` with the following
code:

```ruby
# config/initializers/opentelemetry.rb
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dice-ruby'
  c.use_all() # enables all instrumentation!
end
```

The call `c.use_all()` enables all instrumentations in the `instrumentation/all`
package. If you have more advanced configuration needs, see [configuring
specific instrumentation libraries][config].

### Run the instrumented app

You can now run your instrumented app and have it print to the console for now:

```sh
env OTEL_TRACES_EXPORTER=console rails server -p 8080
```

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. You should see the spans printed in the console, such as the
following:

```ruby
#<struct OpenTelemetry::SDK::Trace::SpanData
 name="DiceController#roll",
 kind=:server,
 status=#<OpenTelemetry::Trace::Status:0x000000010587fc48 @code=1, @description="">,
 parent_span_id="\x00\x00\x00\x00\x00\x00\x00\x00",
 total_recorded_attributes=8,
 total_recorded_events=0,
 total_recorded_links=0,
 start_timestamp=1683555544407294000,
 end_timestamp=1683555544464308000,
 attributes=
  {"http.method"=>"GET",
   "http.host"=>"localhost:8080",
   "http.scheme"=>"http",
   "http.target"=>"/rolldice",
   "http.user_agent"=>"curl/7.87.0",
   "code.namespace"=>"DiceController",
   "code.function"=>"roll",
   "http.status_code"=>200},
 links=nil,
 events=nil,
 resource=
  #<OpenTelemetry::SDK::Resources::Resource:0x000000010511d1f8
   @attributes=
    {"service.name"=>"<YOUR_SERVICE_NAME>",
     "process.pid"=>83900,
     "process.command"=>"bin/rails",
     "process.runtime.name"=>"ruby",
     "process.runtime.version"=>"3.2.2",
     "process.runtime.description"=>"ruby 3.2.2 (2023-03-30 revision e51014f9c0) [arm64-darwin22]",
     "telemetry.sdk.name"=>"opentelemetry",
     "telemetry.sdk.language"=>"ruby",
     "telemetry.sdk.version"=>"1.2.0"}>,
 instrumentation_scope=#<struct OpenTelemetry::SDK::InstrumentationScope name="OpenTelemetry::Instrumentation::Rack", version="0.23.0">,
 span_id="\xA7\xF0\x9B#\b[\xE4I",
 trace_id="\xF3\xDC\b8\x91h\xB0\xDF\xDEn*CH\x9Blf",
 trace_flags=#<OpenTelemetry::Trace::TraceFlags:0x00000001057b7b08 @flags=1>,
 tracestate=#<OpenTelemetry::Trace::Tracestate:0x00000001057b67f8 @hash={}>>
```

## What next?

Adding tracing to a single service is a great first step. OpenTelemetry provides
a few more features that will allow you gain even deeper insights!

- [Exporters][] allow you to export your data to a preferred backend.
- [Context propagation][] is perhaps one of the most powerful concepts in
  OpenTelemetry because it will upgrade your single service trace into a
  _distributed trace_, which makes it possible for OpenTelemetry vendors to
  visualize a request from end-to-end across process and network boundaries.
- [Span events][] allow you to add a human-readable message on a span that
  represents "something happening" during its lifetime.
- [Manual instrumentation][manual] will give provide you the ability to enrich
  your traces with domain specific data.

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[auto]:
  https://github.com/open-telemetry/opentelemetry-ruby#instrumentation-libraries
[config]: ../automatic/#configuring-specific-instrumentation-libraries
[exporters]: ../exporters/
[context propagation]: ../manual/#context-propagation
[manual]: ../manual/
[span events]: ../manual/#add-span-events

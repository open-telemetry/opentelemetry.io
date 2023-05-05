---
title: Getting Started
description: Get telemetry from your app in less than 5 minutes!
aliases: [/docs/instrumentation/ruby/getting_started]
spelling: cSpell:ignore truffleruby sinatra
weight: 1
---

This page will show you how to get started with OpenTelemetry in Ruby.

You will learn how you can instrument a simple application automatically, in
such a way that [traces][], [metrics][] and [logs][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- MRI Ruby >= `3.0`, jruby >= `9.3.2.0`, or truffleruby >= 22.1
- [Bundler](https://bundler.io/)

{{% alert color="warning" %}} jruby only targets compatibility with MRI Ruby
2.6.8; which is EOL. This project does not officially support MRI Ruby 2.6.8,
and provides jruby support on a best-effort basis until the jruby project
supports compatibility with more modern Ruby runtimes.

truffleruby is tested, but support is best-effort at this time. {{% /alert %}}

## Example Application

The following example uses a basic [Sinatra](https://sinatrarb.com/)
application. If you are not using Sinatra, that's ok — you can use OpenTelemetry
Ruby with other web frameworks as well, such as Rails and Rack. For a complete
list of libraries for supported frameworks, see the
[regsitry](/ecosystem/registry/?component=instrumentation&language=ruby).

For more elaborate examples, see
[examples](/docs/instrumentation/ruby/examples/).

### Dependencies

To begin, set up a new Gemfile in a new directory:

```sh
bundle init
```

Now install Sinatra and Puma:

```sh
bundle add sinatra puma
```

## Create the sample HTTP Server

Create a file `app.rb` and add the following code to it:

```ruby
require 'rubygems'
require 'bundler/setup'
require 'sinatra/base'

class App < Sinatra::Base
  set :bind, '0.0.0.0'
  set :port, 8080

  get '/rolldice' do
    (rand(6) + 1).to_s
  end

  run! if app_file == $0
end
```

Run the application with the following command and open
<http://localhost:80800/rolldice> in your web browser to ensure it is working.

```sh
ruby app.rb
```

## Instrumentation

Install the `opentelemetry-sdk` and `opentelemetry-instrumentation-all`
packages:

```sh
bundle add opentelemetry-sdk opentelemetry-instrumentation-all
```

The inclusion of `opentelemetry-instrumentation-all` provides
[instrumentations][auto] for Rails, Sinatra, several HTTP libraries, and more.

The OpenTelemetry initialization needs to happen early in your application
lifecycle. Perform this initialization as early as possible in the start-up
process.

Update the `app.rb` to contain the initialization of the OpenTelemetry SDK:

```ruby
require 'rubygems'
require 'bundler/setup'
require 'sinatra/base'
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'

OpenTelemetry::SDK.configure do |c|
  c.service_name = 'roll-the-dice'
  c.use_all() # enables all instrumentation!
end

class App < Sinatra::Base
  set :bind, '0.0.0.0'
  set :port, 8080

  get '/rolldice' do
    (rand(6) + 1).to_s
  end

  run! if app_file == $0
end
```

The call `c.use_all()` enables all instrumentations in the `instrumentation/all`
package. If you have more advanced configuration needs, see [configuring
specific instrumentation libraries][config].

## Run the instrumented app

You can now run your instrumented app and have it print to the console for now:

```sh
env OTEL_TRACES_EXPORTER="console" ruby app.rb
```

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. You should see the spans printed in the console, such as the
following:

```ruby
#<struct OpenTelemetry::SDK::Trace::SpanData
 name="GET /rolldice",
 kind=:server,
 status=
  #<OpenTelemetry::Trace::Status:0x000000013eb22160 @code=1, @description="">,
 parent_span_id="\x00\x00\x00\x00\x00\x00\x00\x00",
 total_recorded_attributes=7,
 total_recorded_events=0,
 total_recorded_links=0,
 start_timestamp=1683144794318648000,
 end_timestamp=1683144794319924000,
 attributes=
  {"http.method"=>"GET",
   "http.host"=>"localhost:8080",
   "http.scheme"=>"http",
   "http.target"=>"/rolldice",
   "http.user_agent"=>"curl/7.87.0",
   "http.route"=>"/rolldice",
   "http.status_code"=>200},
 links=nil,
 events=nil,
 resource=
  #<OpenTelemetry::SDK::Resources::Resource:0x000000013eb49e68
   @attributes=
    {"service.name"=>"roll-the-dice",
     "process.pid"=>11471,
     "process.command"=>"app.rb",
     "process.runtime.name"=>"ruby",
     "process.runtime.version"=>"2.6.10",
     "process.runtime.description"=>
      "ruby 2.6.10p210 (2022-04-12 revision 67958) [universal.arm64e-darwin22]",
     "telemetry.sdk.name"=>"opentelemetry",
     "telemetry.sdk.language"=>"ruby",
     "telemetry.sdk.version"=>"1.2.0"}>,
 instrumentation_scope=
  #<struct OpenTelemetry::SDK::InstrumentationScope
   name="OpenTelemetry::Instrumentation::Rack",
   version="0.22.1">,
 span_id="s\x91\xFB\xF3\xB9-\xEB\xF6",
 trace_id="\xEFHi7\xC0Qc6}D^\xE7\a\xF3\xF8i",
 trace_flags=#<OpenTelemetry::Trace::TraceFlags:0x000000013ea80720 @flags=1>,
 tracestate=#<OpenTelemetry::Trace::Tracestate:0x000000013ea905a8 @hash={}>>
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

---
title: Exporters
weight: 5
---

In order to visualize and analyze your traces, you will need to export them to a
backend such as [Jaeger](https://www.jaegertracing.io/) or
[Zipkin](https://zipkin.io/). OpenTelemetry Ruby provides exporters for some
common open source backends.

Below you will find some introductions on how to set up backends and the
matching exporters.

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter package, such as
`opentelemetry-exporter-otlp`:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}
{{< tab bundle >}}
$ bundle add opentelemetry-exporter-otlp
{{< /tab >}}

{{< tab gem >}}
$ gem install opentelemetry-exporter-otlp
{{< /tab >}}

{{< /tabpane>}}
<!-- prettier-ignore-end -->

Next, configure the exporter to point at an OTLP endpoint. For example you can
update `app.rb` from the [Getting Started](../getting-started/) like the
following:

```ruby
require 'rubygems'
require 'bundler/setup'
require 'sinatra/base'
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'

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

If you now run your application it will use OTLP to export traces:

```ruby
$ ruby app.rb
```

By default traces are sent to an OTLP endpoint listening on localhost:4318. You
can change the endpoint by setting the `OTEL_EXPORTER_OTLP_ENDPOINT`
accordingly:

```ruby
$ env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces" ruby app.rb
```

To try out the OTLP exporter quickly and see your traces visualized at the
receiving end, you can run Jaeger in a docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Zipkin

To set up Zipkin as quickly as possible, run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}
{{< tab bundle >}}
$ bundle add opentelemetry-exporter-zipkin
{{< /tab >}}

{{< tab gem >}}
$ gem install opentelemetry-exporter-zipkin
{{< /tab >}}

{{< /tabpane>}}
<!-- prettier-ignore-end -->

Update your opentelemetry configuration to use the exporter and to send data to
your zipkin backend:

```ruby
require 'rubygems'
require 'bundler/setup'
require 'sinatra/base'
require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-zipkin'

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

If you now run your application, set the environment variable
`OTEL_TRACES_EXPORTER` to zipkin:

```ruby
env OTEL_TRACES_EXPORTER="zipkin" ruby app.rb
```

By default traces are sent to a Zipkin endpoint listening on port
localhost:9411. You can change the endpoint by setting the
`OTEL_EXPORTER_ZIPKIN_ENDPOINT` accordingly:

```ruby
$ env OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:9411" ruby app.rb
```

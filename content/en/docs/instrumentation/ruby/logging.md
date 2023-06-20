---
title: Adding Trace Info to Logs
linkTitle: Logging
aliases: [/docs/instrumentation/ruby/logging]
spelling: cSpell:ignore faraday sinatra
weight: 20
---

You can added Trace and Span IDs to logging. This will allow easy connection between a trace and the corrisponding logs. This feature is frequently supported by viewing tools such as [Tempo](https://grafana.com/oss/tempo/) or [Signoz](https://signoz.io). How you configure your logging will depend on the logging library your Ruby application uses. 

### Rails Default Logger

By default Rails uses the TaggedLogger. Span and Trace IDs can be added like this:

```ruby
      config.log_tags = [ 
        :trace_id,
        proc { span = OpenTelemetry::Trace.current_span rescue nil; span&.context&.hex_trace_id },
        :span_id,
        proc { span = OpenTelemetry::Trace.current_span rescue nil; span&.context&.hex_span_id }
      ]
```

### Lograge Logger

Adding information to the [lograge](https://github.com/roidrage/lograge) logger is pretty straight forward

```ruby
     config.lograge.custom_options = lambda do |event|
       span = OpenTelemetry::Trace.current_span rescue nil
       options = {}
       options[:trace_id] = span.context.hex_trace_id if span
       options[:span_id] = span.context.hex_span_id if span
       options
     end
```

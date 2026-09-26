---
title: Servicio de Correo 
linkTitle: Correo 
aliases: [emailservice]
default_lang_commit:
---

# Servicio de Correo

---

Este servicio manda una confirmacion via correo cuando una orden es realizada.

[Fuente servicio de correo](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## Inicializando las Trazas

Vas a requerir el OpenTelemetry core SDK y un exportador para Ruby, tambien una gema para auto instrumentar las librerias (ejemplo: Sinatra).

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

El SDK de Ruby usa las variables de entorno de OpenTelemetry para configurar el exportador OTLP, los atributes de los recursos y el nombre del servicio de manera automatica. Cuando se inicializa el OpenTelemetry SDK tendras que especificar que librerias que contengan instrumentacion automatica vas a utilizar (ejemplo: Sinatra).

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## Trazas 

### Agrega attributes a las trazas auto instrumentadas

Dentro de la ejecucion del codigo auto instrumentado puedes acceder a la traza actual por el contexto

```ruby
current_span = OpenTelemetry::Trace.current_span
```

Agregar multiples attributes a una traza es posible usando `add_attributes` en el objecto de la traza.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

Agregar un unico atribute es posible usando `set_attribute` en el objeto de la traza

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### Crear nuevas trazas

Nuevas trazas pueden ser creadas y colocadas en el contexto activo utilizando `in_span` desde un objeto de OpenTelemetry Tracer. Cuando se usan en conjunto con un bloque `do..end`, las trazas automaticamente terminaran junto con la ejecucion del bloque.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # logic in context of span here
end
```

## Metricas

### Inicializando Metricas

The OpenTelemetry Metrics SDK and OTLP metrics exporter are initialized at root
level in the `email_server.rb` file. You first need the `require` statements to
access them.

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

The Ruby SDK uses OpenTelemetry standard environment variables to configure OTLP
export, resource attributes, and service name automatically. When initializing
the OpenTelemetry Metrics SDK, you also need to configure a meter provider and a
metric reader.

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

With the meter provider you now have access to the meter, which can be used to
create a global metric (ie: `counter`).

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```


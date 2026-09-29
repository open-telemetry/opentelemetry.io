---
title: Servicio de Correo
linkTitle: Correo
aliases: [emailservice]
default_lang_commit: 1c87256b0c7b72f3040249ab65eaefc7eb066280
cSpell:ignore: autoinstrumentado autoinstrumentados autoinstrumentar sinatra
---

Este servicio envía una confirmación por correo cuando se realiza una orden.

[Código fuente del servicio de correo](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## Inicializando las trazas

Necesitarás el SDK core de OpenTelemetry y un exportador para Ruby, además de
una gema para autoinstrumentar las librerías (ej.: Sinatra).

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

El SDK de Ruby usa las variables de entorno de OpenTelemetry para configurar el
exportador OTLP, los atributos de los recursos y el nombre del servicio de
manera automática. Cuando se inicializa el SDK de OpenTelemetry, tendrás que
especificar qué librerías con instrumentación automática vas a utilizar (ej.:
Sinatra).

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## Trazas

### Agregar atributos a los spans autoinstrumentados

Dentro de la ejecución del código autoinstrumentado puedes acceder al span
actual desde el contexto.

```ruby
current_span = OpenTelemetry::Trace.current_span
```

Agregar múltiples atributos a un span es posible usando `add_attributes` en el
objeto del span.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

Agregar un único atributo es posible usando `set_attribute` en el objeto del
span.

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### Crear nuevos spans

Se pueden crear nuevos spans y colocarlos en el contexto activo utilizando
`in_span` desde un objeto `Tracer` de OpenTelemetry. Cuando se usa junto con un
bloque `do..end`, los spans terminan automáticamente junto con la ejecución del
bloque.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # logic in context of span here
end
```

## Métricas

### Inicializando métricas

Los exportadores del SDK de métricas de OpenTelemetry y OTLP se inicializan en
la raíz del demo con el archivo `email_server.rb`. Primero necesitas incluir las
librerías usando `require` para hacer uso de ellas.

```ruby
require "opentelemetry-metrics-sdk"
require "opentelemetry-exporter-otlp-metrics"
```

El SDK para Ruby de OpenTelemetry hace uso de las variables de entorno para
configurar los exportadores OTLP, los atributos de recursos y los nombres de
servicios de manera automática. Cuando se inicializa el SDK, también deberás
configurar dos cosas: un proveedor de métricas y un lector de métricas.

```ruby
otlp_metric_exporter = OpenTelemetry::Exporter::OTLP::Metrics::MetricsExporter.new
OpenTelemetry.meter_provider.add_metric_reader(otlp_metric_exporter)
meter = OpenTelemetry.meter_provider.meter("email")
```

Con el proveedor de métricas tendrás acceso al medidor, que te permitirá crear
una métrica global (ej.: `counter` o contador).

```ruby
$confirmation_counter = meter.create_counter("app.confirmation.counter", unit: "1", description: "Counts the number of order confirmation emails sent")
```

### Métricas personalizadas

En el demo podrás encontrar la métrica:

- `app.confirmation.counter`: Contador acumulativo del número de órdenes
  confirmadas con un correo enviado

## Logs

### Inicializando logs

Los exportadores del SDK de logs de OpenTelemetry y OTLP se inicializan en la
raíz del demo con el archivo `email_server.rb`. Primero necesitas incluir las
librerías usando `require` para hacer uso de ellas.

```ruby
require "opentelemetry-logs-sdk"
require "opentelemetry-exporter-otlp-logs"
```

El SDK para Ruby de OpenTelemetry hace uso de las variables de entorno para
configurar los exportadores OTLP, los atributos de recursos y los nombres de
servicios de manera automática. Cuando se inicializa el SDK, también deberás
configurar un proveedor global para tus logs.

```ruby
$logger = OpenTelemetry.logger_provider.logger(name: "email")
```

### Generar logs con estructura

Puedes usar el método `on_emit` para escribir logs con estructura. Incluye los
atributos `severity_text` (ej.: `INFO`, `ERROR`), un `body` claro y un atributo
como `app.email.recipient`; estos te pueden ayudar a buscar logs más adelante.

```ruby
$logger.on_emit(
  timestamp: Time.now,
  severity_text: "INFO",
  body: "Order confirmation email sent",
  attributes: { "app.email.recipient" => data.email }
)
```

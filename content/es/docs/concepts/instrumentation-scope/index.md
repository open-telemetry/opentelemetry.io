---
title: Ámbito de instrumentación
weight: 80
default_lang_commit: e9a74ead9ff9ee7c1df04241e916bdb606ba5e24
---

El [ámbito de instrumentación](/docs/specs/otel/common/instrumentation-scope/)
representa una unidad lógica dentro del código de la aplicación con la que se
puede asociar la telemetría emitida.

Los desarrolladores pueden decidir qué denota un ámbito de instrumentación
razonable. Por ejemplo, pueden seleccionar un módulo, un paquete o una clase
como ámbito de instrumentación. En el caso de una librería o framework, un
enfoque común es usar un identificador único para la librería o framework como
ámbito, como un nombre completo y la versión de la librería o framework. Si la
librería en sí misma no tiene instrumentación de OpenTelemetry integrada y se
usa una librería de instrumentación en su lugar, usa el nombre y la versión de
la librería de instrumentación como ámbito de instrumentación.

El ámbito de instrumentación se define por un par nombre y versión cuando se
obtiene una instancia de `tracer`, `meter` o `logger` de un `Provider`. Cada
span, métrica o registro de log creado por la instancia se asocia entonces al
ámbito de instrumentación proporcionado.

En tu backend de observabilidad, el ámbito te permite segmentar y analizar tus
datos de telemetría por ámbito, por ejemplo, para ver qué usuarios están usando
qué versión de una librería y cuál es el rendimiento de esa versión, o para
identificar un problema en un módulo específico de tu aplicación.

El siguiente diagrama ilustra una traza con múltiples ámbitos de
instrumentación. Los diferentes ámbitos se representan con distintos colores:

- En la parte superior, el span `/api/placeOrder` es generado por el framework
  HTTP utilizado.
- Los spans en verde (`CheckoutService::placeOrder`, `prepareOrderItems` y
  `checkout`) son código de la aplicación, agrupados por la clase
  `CheckoutService`.
- Los spans para `CartService::getCart` y `ProductService::getProduct`también
  son código de la aplicación, agrupados por las clases `CartService` y
  `ProductService`.
- Los spans en naranja (`Cache::find`) y azul claro (`DB::query`) son código de
  la librería, agrupados por el nombre y la versión de la librería.

![Esta imagen ilustra una traza con múltiples ámbitos de instrumentación](spans-with-instrumentation-scope.svg)

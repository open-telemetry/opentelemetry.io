---
title: Trazas
weight: 1
description: La ruta de una solicitud a través de tu aplicación
default_lang_commit: 860f51415c48bf7d743d4280398de0631702c335
drifted_from_default: true
---

Las **trazas** nos dan una visión general de lo que ocurre cuando se hace una
solicitud a una aplicación. Ya sea que tu aplicación sea un monolito con una
sola base de datos o una sofisticada malla de servicios, las trazas son
esenciales para entender la "ruta" completa que una solicitud toma en tu
aplicación.

Exploremos esto con tres unidades de trabajo, representadas como
[Spans](#spans):

{{% alert title="Note" %}}

Los siguientes ejemplos en JSON no representan un formato específico, y
especialmente no representan
[OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding), que es más verboso.

{{% /alert %}}

Span `hello`:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este es el span raíz, que denota el principio y el final de toda la operación.
Observa que tiene un campo `trace_id` que indica la traza, pero no tiene un
`parent_id`. Así es como sabes que es el span raíz.

Span `hello-greetings`:

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este span encapsula tareas específicas, como saludar, y su padre es el span
`hello`. Ten en cuenta que comparte el mismo `trace_id` que el span raíz, lo que
indica que es parte de la misma traza. Además, tiene un `parent_id` que coincide
con el `span_id` del span `hello`.

Span `hello-salutations`:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Este span representa la tercera operación en esta traza y, al igual que el
anterior, es un hijo del span `hello`. Eso también lo convierte en un span
hermano del span `hello-greetings`.

Estos tres bloques de JSON comparten el mismo `trace_id`, y el campo `parent_id`
representa una jerarquía. ¡Eso lo convierte en una traza!

Otra cosa que notarás es que cada span parece un log estructurado. ¡Eso es
porque, en cierto modo, lo es! Una forma de pensar en las trazas es que son una
colección de logs estructurados con contexto, correlación, jerarquía y mucho más
incorporado. Sin embargo, estos "logs estructurados" pueden provenir de
diferentes procesos, servicios, máquinas virtuales, centros de datos, etc. Esto
es lo que permite que el trazado represente una vista de extremo a extremo de
cualquier sistema.

Para entender cómo funciona el trazado en OpenTelemetry, veamos una lista de los
componentes que desempeñarán un papel en la instrumentación de nuestro código.

## Proveedores de Trazas {#tracer-provider}

Un Proveedor de Trazas (a veces llamado `TracerProvider`) es una factoría para
`Tracers`. En la mayoría de las aplicaciones, un `TracerProvider` se inicializa
una vez y su ciclo de vida coincide con el ciclo de vida de la aplicación. La
inicialización del `TracerProvider` también incluye la inicialización de
`Resource` y `Exporter`. Suele ser el primer paso en el trazado con
OpenTelemetry. En algunos SDK de lenguaje, ya se inicializa un Tracer Provider
global para ti.

## Tracer

Un `Tracer` crea spans que contienen más información sobre lo que está
sucediendo en una operación dada, como una solicitud en un servicio. Los
`Tracers` se crean a partir de los Proveedor de Trazas.

## Exportadores de trazas {#trace-exporters}

Los exportadores de trazas envían trazas a un consumidor. Este consumidor puede
ser la salida estándar para la depuración en tiempo de desarrollo, el
OpenTelemetry Collector, o cualquier backend de código abierto o de proveedores
de tu elección.

## Propagación de contexto {#context-propagation}

La propagación de contexto es el concepto central que habilita el trazado
distribuido. Con la propagación de contexto, los spans pueden correlacionarse
entre sí y ensamblarse en una traza, independientemente de dónde se generen.
Para saber más sobre este tema, consulta la página sobre
[Context Propagation](../../context-propagation).

## Spans

Un **span** representa una unidad de trabajo u operación. Los spans son los
bloques de construcción de las trazas. En OpenTelemetry, incluyen la siguiente
información:

- Nombre
- ID del span padre (vacío para los spans raíz)
- `Timestamp` (marca de tiempo) de inicio y finalización
- [Contexto de span](#span-context)
- [Atributos](#attributes)
- [Eventos de span](#span-events)
- [Links de span](#span-links)
- [Estado del span](#span-status)

Ejemplo de span:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Los spans pueden anidarse, como se insinúa por la presencia de un ID de span
padre: los spans hijos representan sub-operaciones. Esto permite que los spans
capturen de forma más precisa el trabajo realizado en una aplicación.

### Contexto de span {#span-context}

El contexto de span es un objeto inmutable en cada span que contiene lo
siguiente:

- El ID de traza (`Trace ID`) que representa la traza de la que el span forma
  parte
- El ID de span (`Span ID`) del propio span
- `Trace Flags`, una codificación binaria que contiene información sobre la
  traza
- `Trace State`, una lista de pares clave-valor que pueden llevar información de
  trazas específica del proveedor

El contexto de span es la parte de un span que se serializa y propaga junto con
el [Contexto Distribuido](#context-propagation) y el [Baggage](../baggage).

Debido a que el contexto de span contiene el ID de traza, se usa al crear
[Links de Span](#span-links).

### Atributos {#attributes}

Los atributos son pares clave-valor que contienen metadatos que puedes usar para
anotar un span y llevar información sobre la operación que está rastreando.

Por ejemplo, si un span rastrea una operación que añade un artículo al carrito
de compras de un usuario en un sistema de eCommerce, puedes capturar el ID del
usuario, el ID del artículo a añadir al carrito y el ID del carrito.

Puedes añadir atributos a los spans durante o después de su creación. Es
preferible añadir atributos al crear el span para que estén disponibles para el
muestreo del SDK. Si tienes que añadir un valor después de la creación del span,
actualiza el span con el valor.

Los atributos tienen las siguientes reglas que cada SDK de lenguaje implementa:

- Las claves deben ser valores de cadena no nulos
- Los valores deben ser una cadena no nula, un valor booleano, un valor de punto
  flotante, un entero o un array de estos valores

Además, existen [Atributos Semánticos](/docs/specs/semconv/general/trace/), que
son convenciones conocidas de nomenclatura para los metadatos que suelen estar
presentes en operaciones comunes. Es útil usar la nomenclatura de atributos
semánticos siempre que sea posible para que los tipos comunes de metadatos estén
estandarizados en todos los sistemas.

### Eventos de span {#span-events}

Un evento de span puede considerarse como un mensaje de log estructurado (o
anotación) en un span, que se usa típicamente para denotar un punto
significativo y singular en el tiempo durante la duración del span.

Por ejemplo, considera dos escenarios en un navegador web:

1. Rastrear la carga de una página
2. Marcar cuándo una página se vuelve interactiva

Un span es la mejor opción para el primer escenario porque es una operación con
un inicio y un final.

Un evento de span es la mejor opción para rastrear el segundo escenario, ya que
representa un punto significativo y singular en el tiempo.

#### Cuándo usar eventos de span en lugar de atributos de span {#when-to-use-span-events-versus-span-attributes}

Dado que los eventos de span también contienen atributos, la pregunta de cuándo
usar eventos en lugar de atributos podría no tener siempre una respuesta obvia.
Para ayudarte a decidir, considera si una marca de tiempo específica es
significativa.

Por ejemplo, cuando estás rastreando una operación con un span y la operación se
completa, es posible que quieras añadir datos de la operación a tu telemetría.

- Si el `timestamp` en el que se completa la operación es significativo o
  relevante, adjunta los datos a un evento de span.
- Si el `timestamp` no es significativo, adjunta los datos como atributos de
  span.

### Links de span {#span-links}

Los links existen para que puedas asociar un span con uno o más spans, lo que
implica una relación causal. Por ejemplo, digamos que tenemos un sistema
distribuido donde algunas operaciones son rastreadas por una traza.

En respuesta a algunas de estas operaciones, se pone en cola una operación
adicional para ser ejecutada, pero su ejecución es asíncrona. Podemos rastrear
esta operación subsiguiente con una traza también.

Nos gustaría asociar la traza de las operaciones subsiguientes con la primera
traza, pero no podemos predecir cuándo comenzarán las operaciones subsiguientes.
Necesitamos asociar estas dos trazas, así que usaremos un link de span.

Puedes enlazar el último span de la primera traza con el primer span de la
segunda traza. Ahora, están asociados causalmente entre sí.

Los links son opcionales pero sirven como una buena manera de asociar spans de
traza entre sí. Para más información, consulta
[Links de span](/docs/specs/otel/trace/api/#link).

### Estado del span {#span-status}

Cada span tiene un estado. Los tres valores posibles son:

- `Unset`
- `Error`
- `Ok`

El valor por defecto es `Unset`. Un estado de span `Unset` indica que la
operación que rastreó se completó con éxito y sin un error.

Cuando un estado de span es `Error`, significa que ocurrió un error en la
operación que rastrea. Por ejemplo, esto podría deberse a un error HTTP 500 en
un servidor que maneja una solicitud.

Cuando un estado de span es `Ok`, significa que el span fue marcado
explícitamente como libre de errores por el desarrollador de una aplicación.
Aunque esto no es intuitivo, no es obligatorio establecer un estado de span como
`Ok` cuando se sabe que un span se ha completado sin error, ya que esto está
cubierto por `Unset`. Lo que `Ok` hace es representar una "llamada final"
inequívoca sobre el estado de un span que ha sido explícitamente establecido por
un usuario. Esto es útil en cualquier situación en la que un desarrollador desee
que no haya otra interpretación de un span que no sea "exitoso".

Para reiterar: `Unset` representa un span que se completó sin un error. `Ok`
representa cuando un desarrollador marca explícitamente un span como exitoso. En
la mayoría de los casos, no es necesario marcar explícitamente un span como
`Ok`.

### Tipo de span {#span-kind}

Cuando se crea un span, este es uno de los siguientes: `Client`, `Server`,
`Internal`, `Producer` o `Consumer`. Este tipo de span proporciona una pista al
backend de trazado sobre cómo se debe ensamblar la traza. Según la
especificación de OpenTelemetry, el padre de un span `Server` es a menudo un
span `Client` remoto, y el hijo de un span `Client` suele ser un span `Server`.
De manera similar, el padre de un span `Consumer` es siempre un `Producer` y el
hijo de un span `Producer` es siempre un `Consumer`. Si no se proporciona, se
asume que el tipo de span es `Internal`.

Para más información sobre tipos de span, consulta
[SpanKind](/docs/specs/otel/trace/api/#spankind).

#### Client {#client}

Un span `Client` representa una llamada remota saliente síncrona, como una
solicitud HTTP saliente o una llamada a base de datos. Ten en cuenta que en este
contexto, "síncrona" no se refiere a `async/await`, sino al hecho de que no se
pone en cola para su posterior procesamiento.

#### Server {#server}

Un span `Server` representa una llamada remota entrante síncrona, como una
solicitud HTTP entrante o una llamada a un procedimiento remoto.

#### Internal {#internal}

Los spans `Internal` representan operaciones que no cruzan un límite de proceso.
Cosas como instrumentar una llamada a función o un middleware de Express pueden
usar spans `Internal`.

#### Producer {#producer}

Los spans `Producer` representan la creación de un trabajo que puede ser
procesado de forma asíncrona más tarde. Puede ser un trabajo remoto, como uno
insertado en una cola de trabajos, o un trabajo local manejado por un
`event listener`.

#### Consumer {#consumer}

Los spans `Consumer` representan el procesamiento de un trabajo creado por un
`Producer` y pueden comenzar mucho después de que el span `Producer` ya haya
terminado.

## Especificación {#specification}

Para más información, consulta la
[especificación de trazas](/docs/specs/otel/overview/#tracing-signal).

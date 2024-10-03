---

title: Instrumentación
aliases: [manual]
weight: 20
description: Instrumentación manual para OpenTelemetry Python
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/instrumentation-intro %}}

## Configuración

Primero, asegúrate de tener los paquetes API y SDK:

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## Trazas

### Adquirir el Tracer

Para comenzar a realizar trazas, necesitarás inicializar un
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) y
opcionalmente configurarlo como el proveedor global predeterminado.

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)

# Establece el proveedor de tracer global predeterminado
trace.set_tracer_provider(provider)

# Crea un tracer a partir del proveedor de tracer global
tracer = trace.get_tracer("my.tracer.name")
```

### Crear spans

Para crear un [span](/docs/concepts/signals/traces/#spans), normalmente querrás
iniciarlo como el span actual.

```python
def do_work():
    with tracer.start_as_current_span("span-name") as span:
        # realiza algún trabajo que 'span' rastreará
        print("haciendo algún trabajo...")
        # Cuando el bloque 'with' sale del contexto, 'span' se cierra automáticamente
```

También puedes usar `start_span` para crear un span sin hacerlo el span actual. Esto se suele hacer para rastrear operaciones concurrentes o asíncronas.

### Crear spans anidados

Si tienes una sub-operación distinta que deseas rastrear como parte de otra,
puedes crear [spans](/docs/concepts/signals/traces/#spans) para representar la relación:

```python
def do_work():
    with tracer.start_as_current_span("parent") as parent:
        # realiza algún trabajo que 'parent' rastreará
        print("haciendo algún trabajo...")
        # Crea un span anidado para rastrear el trabajo anidado
        with tracer.start_as_current_span("child") as child:
            # realiza algún trabajo que 'child' rastreará
            print("haciendo trabajo anidado...")
            # el span anidado se cierra cuando sale del contexto

        # Este span también se cierra cuando sale del contexto
```

Cuando veas spans en una herramienta de visualización de trazas, `child` se rastreará como un span anidado bajo `parent`.

### Crear spans con decoradores

Es común que un único [span](/docs/concepts/signals/traces/#spans) rastree la ejecución de una función completa. En ese caso, hay un decorador que puedes usar para reducir el código:

```python
@tracer.start_as_current_span("do_work")
def do_work():
    print("haciendo algún trabajo...")
```

El uso del decorador es equivalente a crear el span dentro de `do_work()` y finalizarlo cuando `do_work()` termine.

Para usar el decorador, debes tener una instancia de `tracer` disponible globalmente para la declaración de tu función.

### Obtener el span actual

A veces es útil acceder al span actual
en un momento dado para poder enriquecerlo con más información.

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# enriquecer 'current_span' con más información
```

### Agregar atributos a un span

Los [atributos](/docs/concepts/signals/traces/#attributes) te permiten adjuntar pares clave/valor a un [span](/docs/concepts/signals/traces/#spans) para que contenga más información sobre la operación actual que está rastreando.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "¡Diciendo hola!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

### Agregar atributos semánticos

Los [Atributos Semánticos](/docs/specs/semconv/general/trace/) son [atributos](/docs/concepts/signals/traces/#attributes) predefinidos que son convenciones de nombres bien conocidas para tipos comunes de datos. Usar Atributos Semánticos te permite normalizar este tipo de información en tus sistemas.

Para usar los Atributos Semánticos en Python, asegúrate de tener instalado el paquete de convenciones semánticas:

```shell
pip install opentelemetry-semantic-conventions
```

Luego puedes usarlos en el código:

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### Agregar eventos

Un [evento](/docs/concepts/signals/traces/#span-events) es un mensaje legible en un [span](/docs/concepts/signals/traces/#spans) que representa "algo que sucede" durante su vida útil. Puedes pensarlo como un registro primitivo.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("¡Voy a intentarlo!")

# Haz la cosa

current_span.add_event("¡Lo hice!")
```

### Agregar enlaces

Un [span](/docs/concepts/signals/traces/#spans) se puede crear con uno o más [enlaces](/docs/concepts/signals/traces/#span-links) que lo vinculen causalmente con otro span. Un enlace necesita un contexto de span para ser creado.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("span-1"):
    # Hacer algo que 'span-1' rastrea.
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("span-2", links=[link_from_span_1]):
    # Hacer algo que 'span-2' rastrea.
    # El enlace en 'span-2' está causalmente asociado con 'span-1',
    # pero no es un span hijo.
    pass
```

### Establecer el estado del span

{{% docs/languages/span-status-preamble %}}

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # algo que podría fallar
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### Registrar excepciones en spans

Puede ser una buena idea registrar excepciones cuando ocurren. Se recomienda hacerlo a la vez que se establece el [estado del span](#set-span-status).

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # algo que podría fallar

# Considera capturar una excepción más específica en tu código
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### Cambiar el formato de propagación predeterminado

Por defecto, OpenTelemetry Python usará los siguientes formatos de propagación:

- W3C Trace Context
- W3C Baggage

Si necesitas cambiar los valores predeterminados, puedes hacerlo a través de variables de entorno o en el código:

#### Usando Variables de Entorno

Puedes establecer la variable de entorno `OTEL_PROPAGATORS` con una lista separada por comas. Los valores aceptados son:

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray (tercero)
- `"ottrace"`: OT Trace (tercero)
- `"none"`: Sin propagador configurado automáticamente.

La configuración predeterminada es equivalente a `OTEL_PROPAGATORS="tracecontext,baggage"`.

#### Usando APIs del SDK

Alternativamente, puedes cambiar el formato en el código.

Por ejemplo, si necesitas usar el formato de propagación B3 de Zipkin, puedes instalar el paquete B3:

```shell
pip install opentelemetry-propagator-b3
```

Luego configura el propagador B3 en tu código de inicialización de trazado:

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

Nota que las variables de entorno anularán lo que esté configurado en el código.

### Lectura adicional

- [Conceptos de Trazas](/docs/concepts/signals/traces/)
- [Especificación de Trazas](/docs/specs/otel/overview/#tracing-signal)
- [Documentación de la API de Trazas de Python](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Documentación del SDK de Trazas de Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## Métricas

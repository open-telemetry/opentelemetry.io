---
title: Librerías
description: Aprende a añadir instrumentación nativa a tu librería
aliases: [../instrumenting-library]
weight: 40
default_lang_commit: d8e58463c6e7c324b01115ab4f88d1f2bcf802c2
Spell:ignore: cardinalidad definirlos serialización desactívalos muestreados
---

OpenTelemetry proporciona [librerías de
instrumentación][instrumentation libraries] para muchas librerías, lo que
normalmente se hace a través de hooks o monkey-patching en el código de la
librería.

La instrumentación nativa de librerías con OpenTelemetry ofrece una mejor
observabilidad y experiencia de desarrollo para usuarios, eliminando la
necesidad de que las librerías expongan y documenten hooks. Otras ventajas de la
instrumentación nativa incluyen:

- Los hooks de logging personalizados pueden ser reemplazados por APIs comunes y
  fáciles de usar de OpenTelemetry, por lo que los usuarios solo interactuarán
  con OpenTelemetry.
- Las trazas, logs y métricas del código de las librerías y de la aplicación
  están correlacionados y son coherentes.
- Las convenciones comunes permiten a los usuarios obtener telemetría similar y
  consistente dentro de la misma tecnología y entre librerías y lenguajes.
- Las señales de telemetría se pueden ajustar con precisión (filtrar, procesar,
  agregar) para varios escenarios de consumo utilizando una amplia variedad de
  puntos de extensibilidad de OpenTelemetry bien documentados.

![Instrumentación nativa vs. librerías de instrumentación](../native-vs-libraries.svg)

## Convenciones Semánticas {#semantic-conventions}

Las [convenciones semánticas](/docs/specs/semconv/general/trace/) son la
principal fuente de verdad sobre qué información se incluye en los spans
producidos por frameworks web, clientes RPC, bases de datos, clientes de
mensajería, infraestructura y más. Las convenciones hacen que la instrumentación
sea consistente: los usuarios que trabajan con telemetría no tienen que aprender
los detalles específicos de cada librería y los proveedores de observabilidad
pueden crear experiencias para una amplia variedad de tecnologías, por ejemplo,
bases de datos o sistemas de mensajería. Cuando las librerías siguen las
convenciones, muchos escenarios se pueden habilitar sin necesidad de
intervención o configuración por parte del usuario.

Las convenciones semánticas están siempre evolucionando y se añaden nuevas
constantemente. Si no existen algunas para tu librería, considera
[añadirlas](https://github.com/open-telemetry/semantic-conventions/issues).
Presta especial atención a los nombres de los spans: esfuérzate por usar nombres
significativos y considera la cardinalidad al definirlos. También establece el
atributo [`schema_url`](/docs/specs/otel/schemas/#schema-url), que puedes usar
para registrar qué versión de las convenciones semánticas estás utilizando.

Si tienes algún comentario o quieres añadir una nueva convención, contribuye
uniéndote al
[Slack de instrumentación](https://cloud-native.slack.com/archives/C01QZFGMLQ7)
o abriendo un issue o pull request en el
[repositorio de la especificación](https://github.com/open-telemetry/opentelemetry-specification).

### Definir spans {#defining-spans}

Piensa en tu librería desde la perspectiva de un usuario de la librería y en qué
podría querer saber sobre el comportamiento y la actividad de la misma. Como
mantenedor de la librería, conoces el funcionamiento interno, pero lo más
probable es que el usuario esté menos interesado en los entresijos de la
librería y más en la funcionalidad de su aplicación. Piensa en qué información
puede ser útil para analizar el uso de tu librería, y luego en una forma
apropiada de modelar esos datos. Algunos aspectos a considerar incluyen:

- Spans y jerarquías de spans
- Atributos numéricos en los spans, como alternativa a las métricas agregadas
- Eventos de span
- Métricas agregadas

Por ejemplo, si tu librería está haciendo solicitudes a una base de datos, crea
spans solo para la solicitud lógica a la base de datos. Las solicitudes físicas
a través de la red deberían ser instrumentadas dentro de las librerías que
implementan esa funcionalidad. También deberías priorizar la captura de otras
actividades, como la serialización de objetos/datos, como eventos de span, en
lugar de como spans adicionales.

Sigue las convenciones semánticas al establecer los atributos de span.

## Cuándo no instrumentar {#when-not-to-instrument}

Algunas librerías son clientes ligeros que envuelven llamadas de red. Lo más
probable es que OpenTelemetry tenga una librería de instrumentación para el
cliente RPC subyacente. Consulta el [registro](/ecosystem/registry/) para
encontrar las librerías existentes. Si ya existe una librería, instrumentar la
librería `wrapper` podría no ser necesario.

Como pauta general, instrumenta tu librería solo a su propio nivel. No
instrumentes si se cumplen todos los siguientes casos:

- Tu librería es un `proxy` ligero sobre APIs documentadas o autoexplicativas.
- OpenTelemetry tiene instrumentación para las llamadas de red subyacentes.
- No hay convenciones que tu librería deba seguir para enriquecer la telemetría.

Si tienes dudas, no instrumentes. Si decides no instrumentar, aún puede ser útil
proporcionar una forma de configurar los `handlers` de OpenTelemetry para tu
instancia de cliente RPC interno. Esto es esencial en lenguajes que no soportan
la instrumentación totalmente automática y sigue siendo útil en otros.

El resto de este documento proporciona una guía sobre qué y cómo instrumentar tu
aplicación.

## API de OpenTelemetry {#opentelemetry-api}

El primer paso al instrumentar una aplicación es incluir el paquete de la API de
OpenTelemetry como una dependencia.

OpenTelemetry tiene [dos módulos principales](/docs/specs/otel/overview/): la
API y el SDK. La API de OpenTelemetry es un conjunto de abstracciones e
implementaciones no operativas. A menos que tu aplicación importe el SDK de
OpenTelemetry, tu instrumentación no hace nada y no afecta al rendimiento de la
aplicación.

### Las librerías solo deben usar la API de OpenTelemetry {#libraries-should-only-use-the-openTelemetry-api}

Si te preocupa añadir nuevas dependencias, aquí tienes algunas consideraciones
para ayudarte a decidir cómo minimizar los conflictos de dependencias:

- La API de trazas de OpenTelemetry alcanzó la estabilidad a principios de 2021.
  Sigue el
  [Versionado Semántico 2.0](/docs/specs/otel/versioning-and-stability/).
- Utiliza la API de OpenTelemetry estable más temprana (1.0.\*) y evita
  actualizarla a menos que necesites usar nuevas funcionalidades.
- Mientras tu instrumentación se estabiliza, considera distribuirla como un
  paquete separado para que nunca cause problemas a los usuarios que no la
  utilicen. Puedes mantenerla en tu repositorio, o
  [añadirla a OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0155-external-modules.md#contrib-components)
  para que se distribuya con otras librerías de instrumentación.
- Las convenciones semánticas son [estables, pero están sujetas a
  evolución][stable, but subject to evolution]: aunque esto no causa problemas
  funcionales, es posible que necesites actualizar tu instrumentación de vez en
  cuando. Tenerla en un plugin de vista previa o en el repositorio contrib de
  OpenTelemetry puede ayudar a mantener las convenciones actualizadas sin
  generar cambios que rompen la compatibilidad para tus usuarios.

  [stable, but subject to evolution]:
    /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### Obtener un `tracer` {#getting-a-tracer}

Toda la configuración de la aplicación está oculta para tu librería a través de
la API de Tracer. Las librerías pueden permitir a las aplicaciones pasar
instancias de `TracerProvider` para facilitar la inyección de dependencias y las
pruebas, u obtenerlas del
[`TracerProvider` global](/docs/specs/otel/trace/api/#get-a-tracer). Las
implementaciones de OpenTelemetry en los distintos lenguajes pueden tener
diferentes preferencias para pasar instancias o acceder al global, basándose en
lo que es idiomático en cada lenguaje de programación.

Al obtener el `tracer`, proporciona el nombre y la versión de tu librería (o
plugin de trazas): estos datos aparecen en la telemetría y ayudan a los usuarios
a procesar y filtrar la telemetría, a entender de dónde proviene y a depurar o
informar de problemas de instrumentación.

## Qué instrumentar {#what-to-instrument}

### APIs públicas {#public-apis}

Las APIs públicas son buenas candidatas para el `tracing`: los spans creados
para las llamadas a la API pública permiten a los usuarios correlacionar la
telemetría con el código de la aplicación, y entender la duración y el resultado
de las llamadas a la librería. Las llamadas a trazar incluyen:

- Métodos públicos que hacen llamadas de red internamente u operaciones locales
  que consumen mucho tiempo y pueden fallar, por ejemplo, E/S.
- `Handlers` que procesan solicitudes o mensajes.

#### Ejemplo de instrumentación {#instrumentation-example}

El siguiente ejemplo muestra cómo instrumentar una aplicación Java:

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // check out conventions for guidance on span names and attributes
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // makes span active and allows correlating logs and nest spans
    try (Scope unused = span.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            span.setStatus(StatusCode.OK);
        }

        if (span.isRecording()) {
           // populate response attributes for response codes and other information
        }
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        span.end();
    }
}
```

Sigue las convenciones para poblar los atributos. Si no hay ninguna aplicable,
consulta las [convenciones generales](/docs/specs/semconv/general/attributes/).

### Spans anidados de red y otros spans {#nested-network-and-other-spans}

Las llamadas de red se suelen rastrear con auto-instrumentaciones de
OpenTelemetry a través de la implementación del cliente correspondiente.

![Spans anidados de base de datos y HTTP en la interfaz de usuario de Jaeger](../nested-spans.svg)

Si OpenTelemetry no soporta el rastreo de tu cliente de red, aquí tienes algunas
consideraciones que te ayudarán a decidir el mejor camino:

- ¿El rastrear las llamadas de red mejoraría la observabilidad para los usuarios
  o tu capacidad para darles soporte?
- ¿Es tu librería un `wrapper` sobre una API RPC pública y documentada?
  ¿Necesitarían los usuarios obtener soporte del servicio subyacente en caso de
  problemas?
  - Instrumenta la librería y asegúrate de rastrear los intentos de red
    individuales.
- ¿Sería muy verboso rastrear esas llamadas con spans? ¿O impactaría
  notablemente en el rendimiento?
  - Usa logs con verbosidad o eventos de span: los logs pueden correlacionarse
    con el padre (llamadas a la API pública), mientras que los eventos de span
    deben establecerse en el span de la API pública.
  - Si tienen que ser spans (para transportar y propagar un contexto de traza
    único), ponlos detrás de una opción de configuración y desactívalos por
    defecto.

Si OpenTelemetry ya soporta el rastreo de tus llamadas de red, probablemente no
quieras duplicarlo. Podría haber algunas excepciones:

- Para dar soporte a usuarios sin auto-instrumentación, que podría no funcionar
  en ciertos entornos o cuando los usuarios tienen problemas con el
  monkey-patching.
- Para habilitar protocolos de correlación y propagación de contexto
  personalizados o heredados con el servicio subyacente.
- Para enriquecer los spans RPC con información esencial de la librería o del
  servicio que no está cubierta por la auto-instrumentación.

Una solución genérica para evitar la duplicación está en construcción.

### Eventos {#events}

Las trazas son un tipo de señal que tus aplicaciones pueden emitir. Los eventos
(o logs) y las trazas se complementan, no se duplican. Cuando tengas algo que
deba tener un cierto nivel de verbosidad, los logs son una mejor opción que las
trazas.

Si tu aplicación usa un módulo de logging o similar, este módulo podría ya tener
integración con OpenTelemetry. Para averiguarlo, consulta el
[registro](/ecosystem/registry/). Las integraciones suelen estampar el contexto
de traza activo en todos los logs, para que los usuarios los puedan
correlacionar.

Si tu lenguaje y ecosistema no tienen soporte de logging común, usa los [eventos
de span][span events] para compartir detalles adicionales de la aplicación. Los
eventos pueden ser más convenientes si también quieres añadir atributos.

Como regla general, usa eventos o logs para datos verbosos en lugar de spans.
Adjunta siempre los eventos a la instancia de span que tu instrumentación creó.
Evita usar el span activo si puedes, ya que no controlas a qué se refiere.

## Propagación de contexto {#context-propagation}

### Extraer contexto {#extracting-context}

Si trabajas en una librería o un servicio que recibe llamadas upstream, como un
framework web o un consumidor de mensajería, extrae el contexto de la solicitud
o mensaje entrante. OpenTelemetry proporciona la API de `Propagator`, que oculta
los estándares de propagación específicos y lee el `Context` de la traza de la
conexión. En el caso de una única respuesta, solo hay un contexto en la
conexión, que se convierte en el padre del nuevo span que la librería crea.

Después de crear un span, pasa el nuevo contexto de traza al código de la
aplicación (`callback` o `handler`), haciendo que el span esté activo; si es
posible, hazlo explícitamente. El siguiente ejemplo de Java muestra cómo añadir
contexto de traza y activar un span. Para más ejemplos, consulta la
[extracción de contexto en Java](/docs/languages/java/api/#contextpropagators).

```java
// extract the context
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
Span span = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// make span active so any nested telemetry is correlated
try (Scope unused = span.makeCurrent()) {
  userCode();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

En el caso de un sistema de mensajería, es posible que recibas más de un mensaje
a la vez. Los mensajes recibidos se convierten en enlaces en el span que creas.
Consulta las
[convenciones de mensajería](/docs/specs/semconv/messaging/messaging-spans/)
para más detalles.

### Inyectar contexto {#injecting-context}

Cuando haces una llamada saliente, normalmente quieres propagar el contexto al
servicio downstream. En este caso, crea un nuevo span para rastrear la llamada
saliente y usa la API de `Propagator` para inyectar contexto en el mensaje.
Puede haber otros casos en los que quieras inyectar contexto, por ejemplo, al
crear mensajes para un procesamiento asíncrono. El siguiente ejemplo de Java
muestra cómo propagar el contexto. Para más ejemplos, consulta la
[inyección de contexto en Java](/docs/languages/java/instrumentation/#context-propagation).

```java
Span span = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// make span active so any nested telemetry is correlated
// even network calls might have nested layers of spans, logs or events
try (Scope unused = span.makeCurrent()) {
  // inject the context
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

Puede haber algunas excepciones en las que no necesites propagar el contexto:

- El servicio dependiente o `downstream` no soporta metadatos o prohíbe campos
  desconocidos.
- El servicio `downstream` no define protocolos de correlación. Considera añadir
  soporte para la propagación de contexto en una versión futura.
- El servicio `downstream` soporta un propagator personalizado.
  - En la medida de lo posible, usa el contexto de traza de OpenTelemetry si es
    compatible o genera y marca un ID de correlación personalizados en el span.

### En-proceso {#in-process}

- Haz que tus spans sean los activos o actuales, ya que esto permite
  correlacionar spans con los logs y cualquier auto-instrumentación anidada.
- Si la librería tiene una noción de contexto, soporta opcionalmente la
  propagación explícita del contexto de traza además de los spans activos.
  - Pon los spans (contexto de traza) creados por la librería en el contexto
    explícitamente, y documenta cómo acceder a él.
  - Permite a los usuarios pasar el contexto de traza en tu contexto.
- Dentro de la librería, propaga el contexto de traza de forma explícita. Los
  spans activos pueden cambiar durante los `callbacks`.
  - Captura el contexto activo de los usuarios en la superficie de la API
    pública tan pronto como puedas, y úsalo como un contexto padre para tus
    spans.
  - Pasa el contexto y marca atributos, excepciones, eventos en instancias
    propagadas explícitamente.
  - Esto es esencial si inicias hilos explícitamente, haces procesamiento en
    segundo plano u otras cosas que pueden romperse debido a las limitaciones de
    flujo de contexto asíncrono en tu lenguaje.

## Consideraciones adicionales {#additional-considerations}

### Registro de instrumentación {#instrumentation-registry}

Añade tu librería de instrumentación al
[registro de OpenTelemetry](/ecosystem/registry/) para que los usuarios puedan
encontrarla.

### Rendimiento {#performance}

La API de OpenTelemetry no realiza ninguna operación y es muy eficiente cuando
no hay un SDK en la aplicación. Cuando el SDK de OpenTelemetry está configurado,
[consume recursos limitados](/docs/specs/otel/performance/).

Las aplicaciones reales, especialmente a gran escala, suelen tener configurado
el muestreo `head-based`. Los spans muestreados son asequibles y puedes
comprobar si el span está registrando para evitar asignaciones adicionales y
cálculos potencialmente costosos al poblar los atributos. El siguiente ejemplo
de Java muestra cómo proporcionar atributos para el muestreo y cómo comprobar el
registro de un span.

```java
// some attributes are important for sampling, they should be provided at creation time
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// other attributes, especially those that are expensive to calculate
// should be added if span is recording
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### Manejo de errores {#error-handling}

La API de OpenTelemetry no falla con argumentos no válidos, nunca lanza ni se
traga excepciones, lo que significa que es
[permisiva en tiempo de ejecución](/docs/specs/otel/error-handling/#basic-error-handling-principles).
De esta manera, los problemas de instrumentación no afectan a la lógica de la
aplicación. Prueba la instrumentación para detectar los problemas que
OpenTelemetry oculta en tiempo de ejecución.

### Pruebas {#testing}

Dado que OpenTelemetry tiene una variedad de auto-instrumentaciones, prueba cómo
tu instrumentación interactúa con otra telemetría: solicitudes entrantes,
solicitudes salientes, logs, etc. Usa una aplicación típica, con frameworks y
librerías populares y con todo el tracing habilitado, cuando pruebes tu
instrumentación. Comprueba cómo se ven las librerías similares a la tuya.

Para las pruebas unitarias, normalmente puedes simular o falsear el
`SpanProcessor` y el `SpanExporter`, como en el siguiente ejemplo de Java:

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // run test ...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    exportedSpans.addAll(spans);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[instrumentation libraries]:
  /docs/specs/otel/overview/#instrumentation-libraries
[span events]: /docs/specs/otel/trace/api/#add-events

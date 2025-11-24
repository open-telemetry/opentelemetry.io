---
title: Glosario
description:
  Definiciones y convenciones para términos de telemetría tal como se usan en
  OpenTelemetry.
weight: 200
default_lang_commit: 530c8fd130c93dd95e9638c8919518dbbc9c6b0a
drifted_from_default: true
---

Este glosario define términos y [conceptos](/docs/concepts/) que son nuevos para
el proyecto OpenTelemetry y aclara los usos específicos de OpenTelemetry para
términos comunes en el campo de la observabilidad.

También comentamos sobre la ortografía y la capitalización cuando es útil. Por
ejemplo, ver [OpenTelemetry](#opentelemetry) y [OTel](#otel).

## Términos

### Agregación {#aggregation}

El proceso de combinar múltiples mediciones en estadísticas exactas o estimadas
sobre las mediciones que tuvieron lugar durante un intervalo de tiempo, durante
la ejecución de un programa. Usado por la [Métrica](#metric)
[Fuente de datos](#data-source).

### API

Interfaz de Programación de Aplicaciones (_Application Programming Interface_).
En el proyecto OpenTelemetry, se utiliza para definir cómo se generan los datos
de telemetría por cada [Fuente de datos](#data-source).

### Aplicación {#application}

Uno o más [Servicios](#service) diseñados para usuarios finales u otras
aplicaciones.

### Aplicación cliente {#client-side-app}

Un componente de una [Aplicación](#application) que no se ejecuta dentro de una
infraestructura privada y que es típicamente utilizada directamente por los
usuarios finales. Ejemplos de aplicaciones cliente son aplicaciones de
navegador, aplicaciones móviles y aplicaciones que se ejecutan en dispositivos
IoT.

### APM

Monitoreo de Rendimiento de Aplicaciones (_Application Performance Monitoring_)
se trata de monitorear aplicaciones de software, su rendimiento (velocidad,
confiabilidad, disponibilidad, etc.) para detectar problemas, generar alertas y
proporcionar herramientas para encontrar la causa raíz.

### Atributo {#attribute}

Término de OpenTelemetry para [Metadatos](#metadata). Añade información
clave-valor a la entidad que produce telemetría. Se utiliza en
[Señales](#signal) y [Recursos](#resource). Ver [especificación de
atributos][attribute].

### Backend de observabilidad {#observability-backend}

El componente de una plataforma de observabilidad que es responsable de recibir,
procesar, almacenar y consultar datos de telemetría. Ejemplos incluyen
herramientas de código abierto herramientas de código abierto como [Jaeger] y
[Prometheus], así como ofertas comerciales. OpenTelemetry no es un backend de
observabilidad.

### Baggage

Un mecanismo para propagar [Metadatos](#metadata) para ayudar a establecer una
relación causal entre eventos y servicios. Ver [especificación de
baggage][baggage].

### Biblioteca {#library}

Una colección de comportamiento específica de un lenguaje invocada por una
interfaz.

### Biblioteca cliente {#client-library}

Ver [Biblioteca instrumentada](#instrumented-library).

### Biblioteca de instrumentación {#instrumentation-library}

Se refiere a la [Biblioteca](#library) que proporciona la instrumentación para
una [Biblioteca instrumentada](#instrumented-library).
[Biblioteca instrumentada](#instrumented-library) y
[Biblioteca de instrumentación](#instrumentation-library) pueden ser la misma
[Biblioteca](#library) si tiene instrumentación OpenTelemetry incorporada. Ver
la [especificación de la biblioteca][spec-instrumentation-lib].

### Biblioteca instrumentada {#instrumented-library}

Se refiere a la [Biblioteca](#library) para la cual se recopilan las señales de
telemetría ([Trazas](#trace), [Métricas](#metric), [Logs](#log)). Ver
[Biblioteca instrumentada][instrumented library].

### Campo {#field}

Un término utilizado específicamente por [Registros de Log](#log-record).
[Metadatos](#metadata) pueden ser añadidos a través de campos definidos,
incluyendo [Atributos](#attribute) y [Recursos](#resource). Otros campos también
pueden ser considerados `Metadatos`, incluyendo información de severidad y
traza. Ver la [especificación de campos][field].

### Cardinalidad {#cardinality}

El número de valores únicos para un [Atributo](#attribute) o conjunto de
atributos. Alta cardinalidad significa muchos valores únicos, lo que puede
afectar el rendimiento y los requisitos de almacenamiento de los _backends_ de
telemetría. Por ejemplo, un atributo `user_id` tendría alta cardinalidad,
mientras que un atributo `status_code` con valores como "200", "404", "500"
tendría baja cardinalidad.

### Collector

El [OpenTelemetry Collector], o Collector para abreviar, es una implementación
independiente de proveedores de cómo recibir, procesar y exportar datos de
telemetría. Un binario que puede ser desplegado como un agente o gateway.

> **Ortografía**: Cuando se refiere al [OpenTelemetry Collector], siempre
> capitalizar Collector. Use just "Collector" si se está usando Collector como
> un adjetivo &mdash; por ejemplo, "Collector configuration".

[OpenTelemetry Collector]: /docs/collector/

### Contrib

Varias [Bibliotecas de instrumentación](#instrumentation-library) y el
[Collector](#collector) ofrecen un conjunto de capacidades básicas, así como un
repositorio dedicado para capacidades no incluidas en el núcleo, incluyendo
_Exporters_ de proveedores.

### Convenciones semánticas {#semantic-conventions}

Define nombres y valores estándar de [Metadatos](#metadata) para proporcionar
datos de telemetría independientes del proveedor.

### DAG

[_Directed Acyclic Graph_][dag].

### Dimensión {#dimension}

Un término utilizado específicamente por [Métricas](#metric). Ver
[Atributo](#attribute).

### Distribución {#distribution}

Una distribución es un contenedor alrededor de un repositorio OpenTelemetry
superior con algunas personalizaciones. Ver [Distribuciones][distributions].

### Enlace de Span {#span-link}

Un enlace de span es un enlace entre spans causalmente relacionados. Para más
detalles, ver
[Enlaces entre spans](/docs/specs/otel/overview#links-between-spans) y
[Especificar Enlaces](/docs/specs/otel/trace/api#specifying-links).

### Especificación {#specification}

Describe los requisitos y expectativas cruzados de todos los implementaciones.
Ver [Especificación][specification].

### Estado {#status}

El resultado de la operación. Normalmente se utiliza para indicar si ocurrió un
error. Ver [Estado][status].

### Evento {#event}

Un Evento es un [Registro de Log](#log-record) con un nombre de evento y una
estructura bien conocida. Por ejemplo, los eventos de navegador en OpenTelemetry
siguen una convención de nomenclatura particular y llevan datos particulares en
una estructura común.

### Exporter

Proporciona funcionalidad para emitir telemetría a consumidores. Los _Exporters_
pueden ser push- o pull-based.

### Frontend de observabilidad {#observability-frontend}

El componente de una plataforma de observabilidad que proporciona interfaces de
usuario para visualizar y analizar datos de telemetría. A menudo es parte de un
backend de observabilidad, particularmente cuando se consideran ofertas
comerciales.

### Fuente de datos {#data-source}

Ver [Señal](#signal)

### gRPC

Un framework universal de [RPC](#rpc) de código abierto de alto rendimiento. Ver
[gRPC](https://grpc.io).

### HTTP

Abreviatura para [Hypertext Transfer Protocol][http].

### Instrumentación automática {#automatic-instrumentation}

Se refiere a métodos de recopilación de telemetría que no requieren que el
usuario final modifique el código fuente de la aplicación. Los métodos varían
según el lenguaje de programación, e incluyen ejemplos como inyección de
_bytecode_ o _monkey patching_.

### JSON

Abreviatura para [JavaScript Object Notation][json].

### Label

Un término utilizado específicamente por [Métricas](#metric). Ver
[Metadatos](#metadata).

### Lenguaje {#language}

Lenguaje de programación.

### Log

A veces se utiliza para referirse a una colección de
[Registros de Log](#log-record). Puede ser ambiguo ya que a veces se utiliza
[Log](#log) para referirse a un solo [Registro de Log](#log-record). Donde la
ambigüedad es posible, se utilizan cuantificadores adicionales, por ejemplo,
`Registro de Log`. Ver [Log].

### Metadatos {#metadata}

Un par clave-valor, por ejemplo `foo="bar"`, añadido a una entidad que produce
telemetría. OpenTelemetry llama a estos pares [Atributos](#attribute). Además,
[Métricas](#metric) tienen [Dimensiones](#dimension) y [Etiquetas](#label),
mientras que [Logs](#log) tienen [Campos](#field).

### Métrica {#metric}

Registra un punto de datos, ya sea mediciones sin procesar o agregación
predefinida, como una serie de tiempo con [Metadatos](#metadata). Ver
[Métrica][metric].

### Muestreo {#sampling}

Un mecanismo para controlar la cantidad de datos exportados. Más comúnmente
utilizado con la [Traza](#trace) [Fuente de datos](#data-source). Ver
[Muestreo][sampling].

### OC

Abreviatura para [OpenCensus](#opencensus).

### OpAMP

Abreviatura para el
[Open Agent Management Protocol](/docs/collector/management/#opamp).

> **Ortografía**: Escribe OpAMP, no `OPAMP` ni `opamp` en descripciones o
> instrucciones.

### OpenCensus

Precursor a OpenTelemetry. Para más detalles, ver
[Historia](/docs/what-is-opentelemetry/#history).

### OpenTelemetry

Formado a través de un [merger] de los proyectos [OpenTracing](#opentracing) y
[OpenCensus](#opencensus), OpenTelemetry &mdash; el tema de este sitio web
&mdash; es una colección de [APIs](#api), [SDKs](#sdk), y herramientas que
puedes usar para [instrumentar](/docs/concepts/instrumentation/), generar,
[recopilar](/docs/concepts/components/#collector), y
[exportar](/docs/concepts/components/#exporters)
[datos de telemetría](/docs/concepts/signals/) como [métricas](#metric),
[logs](#log), y [trazas](#trace).

> **Ortografía**: OpenTelemetry siempre debe ser una sola palabra sin guión y
> capitalizada como se muestra.

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing

Precursor a OpenTelemetry. Para más detalles, ver
[Historia](/docs/what-is-opentelemetry/#history).

### OT

Abreviatura para [OpenTracing](#opentracing).

### OTel

Abreviatura para [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Ortografía**: Escribe OTel, no `OTEL` ni `otel` en descripciones o
> instrucciones.

### OTelCol

Abreviatura para [OpenTelemetry Collector](#collector).

### OTEP

Abreviatura para [OpenTelemetry Enhancement Proposal].

> **Ortografía**: Escribe "OTEPs" como forma plural. No escribas `OTep` ni
> `otep` en descriptions.

[OpenTelemetry Enhancement Proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

Abreviatura para [OpenTelemetry Protocol](/docs/specs/otlp/).

### Propagación de contexto {#context-propagation}

Permite que todas las [Fuentes de datos](#data-source) compartan un mecanismo de
contexto subyacente para almacenar estado y acceder a datos durante la vida útil
de una [Transacción](#transaction). Ver [especificación de propagación de
contexto][context propagation].

### Propagadores {#propagators}

Usado para serializar y deserializar partes específicas de datos de telemetría
como contexto de span y [Baggage](#baggage) en [Spans](#span). Ver
[Propagadores][propagators].

### Proto

Tipos de interfaz independientes del lenguaje. Ver [opentelemetry-proto].

### Receptor {#receiver}

El término utilizado por el
[Collector](/docs/collector/configuration/#receivers) para definir cómo se
reciben los datos de telemetría. Los receptores pueden ser push- o pull-based.
Ver [Receptor][receiver].

### Recurso {#resource}

Captura información sobre la entidad que produce telemetría como
[Atributos](#attribute). Por ejemplo, un proceso que produce telemetría que se
está ejecutando en un contenedor en Kubernetes tiene un nombre de proceso, un
nombre de pod, un espacio de nombres y posiblemente un nombre de despliegue.
Todos estos atributos pueden ser incluidos en el `Recurso`.

### Registro de Log {#log-record}

Un registro de datos con una marca de tiempo y una severidad. También puede
tener un [ID de Traza](#trace) y un [ID de Span](#span) cuando está
correlacionado con una traza. Ver [Registro de Log][log record].

### REST

Abreviatura para [Representational State Transfer][rest].

### RPC

Abreviatura para [Remote Procedure Call][rpc].

### SDK

Abreviatura para Software Development Kit. Se refiere a un SDK de telemetría que
denota una [Biblioteca](#library) que implementa la [API](#api) de
OpenTelemetry.

### Servicio {#service}

Un componente de una [Aplicación](#application). Múltiples instancias de un
[Servicio](#service) son típicamente desplegadas para alta disponibilidad y
escalabilidad. Un [Servicio](#service) puede ser desplegado en múltiples
ubicaciones.

### Señal {#signal}

Uno de [Trazas](#trace), [Métricas](#metric) o [Logs](#log). Ver
[Señales][signals].

### Solicitud {#request}

Ver [Trazas distribuídas](#distributed-tracing).

### Span

Representa una sola operación dentro de una [Traza](#trace). Ver [Span][span].

### Tag

Ver [Metadatos](#metadata).

### Tracer

Responsable de crear [Spans](#span). Ver [Tracer][tracer].

### Transacción {#transaction}

Ver [Trazas distribuídas](#distributed-tracing).

### Traza {#trace}

Un [DAG](#dag) de [Spans](#span), donde los bordes entre [Spans](#span) están
definidos como relación padre-hijo. Ver [Trazas][traces].

### Trazas distribuídas {#distributed-tracing}

Rastrea el progreso de una sola [Solicitud](#request), llamada [Traza](#trace),
a medida que es manejada por [Servicios](#service) que forman parte de una
[Aplicación](#application). Una [Traza distribuída](#distributed-tracing)
atraviesa límites de proceso, red y seguridad.

Ver [Trazas distribuídas][distributed tracing].

### zPages

Una alternativa en proceso a los exportadores externos. Cuando se incluyen,
recopilan y agregan información de trazas y métricas en segundo plano; estos
datos se sirven en páginas web cuando se solicitan. Ver [zPages][zpages].

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md

---
title: >-
  Diseño nativo con OTel: construir productos que exporten a cualquier stack de
  observabilidad
linkTitle: Diseño nativo con OTel
date: 2026-10-08
author: >-
  [Nityananda Gohain](https://github.com/nityanandagohain) (SigNoz), [Dhruv
  Ahuja](https://github.com/dhruv-ahuja) (SigNoz)
body_class: otel-with-contributions-from
issue: 10300
sig: SIG End User
default_lang_commit: c6df13913b1b0133aa46fdf9183c3a3f9ba64092
# prettier-ignore
cSpell:ignore: Ahuja correlacionarlos Dhruv enrutadores Gohain Nityananda paginación
---

Con contribuciones de [Dan Gomez Blanco](https://github.com/danielgblanco) (New
Relic).

Si estás construyendo un producto self-hosted o SaaS, tus usuarios tarde o
temprano van a pedir enviar **logs, trazas y métricas** a su propio stack de
observabilidad, ya sea para cumplir requisitos normativos, gestionar costos o
centralizar todos sus datos de observabilidad en un solo lugar.

Encerrar a los usuarios en tus dashboards integrados o limitar la exportación a
ciertos proveedores crea fricción innecesaria. En cambio, permitir la
exportación a cualquier backend compatible con OpenTelemetry (OTel) es una
práctica independiente al proveedor y lista para el futuro, que les da la
libertad de escoger su stack de observabilidad.

Esta publicación describe cómo puedes diseñar tu producto para que los usuarios
puedan exportar sus logs, trazas y métricas a un backend OTel cuando quieran.

![Exportar telemetría mediante el estándar OTLP permite a los usuarios controlar y analizar sus datos en las plataformas que elijan.](cover.png)

## Las cuatro señales de observabilidad {#the-four-observability-signals}

OpenTelemetry define cuatro tipos de señales, todas transportadas mediante el
estándar [OpenTelemetry Protocol (OTLP)](/docs/specs/otlp/):

- **[Logs](/docs/concepts/signals/logs/):** Registros de eventos y logs de
  solicitudes, accesos y aplicaciones, con marcas de tiempo y metadatos.
- **[Trazas](/docs/concepts/signals/traces/):** Trazas distribuidas y spans que
  permiten a los usuarios ver los flujos de solicitudes entre servicios y
  correlacionarlos con logs.
- **[Métricas](/docs/concepts/signals/metrics/):** Contadores, medidores e
  histogramas (por ejemplo, tasa de solicitudes, latencia y tasa de errores).
- **[Perfiles](/docs/concepts/signals/profiles/):** Muestras que muestran dónde
  consumen recursos las aplicaciones durante su ejecución.

> [!NOTE] Los perfiles están en fase alfa pública
>
> Los perfiles entraron en [fase alfa pública](/blog/2026/profiles-alpha/) el 26
> de marzo de 2026. Como señal, OpenTelemetry busca que los perfiles acompañen a
> las tres señales principales de observabilidad y ayuden a los usuarios a
> resolver incidentes de producción mediante la captura de patrones de uso de
> recursos en su código.
>
> Aunque en esta publicación nos enfocamos exclusivamente en logs, trazas y
> métricas, nos entusiasma ver cómo evolucionan los perfiles y cómo los utiliza
> la comunidad en sus sistemas de observabilidad.

El mismo modelo de exportación aplica a las tres señales (logs, trazas y
métricas): permitir que los usuarios configuren un endpoint OTLP y **enviar**
telemetría a él. Puedes añadir soporte para una, dos o las tres señales, según
lo que genere tu producto.

Muchas plataformas que permiten exportar mediante OTel incluyen al menos trazas
y logs, y cada vez más incorporan métricas. Diseñar para las tres señales desde
el inicio evita tener que adaptar el sistema más adelante.

## Cómo es un buen sistema de telemetría {#what-a-good-telemetry-system-looks-like}

Un modelo de exportación sólido tiene algunas propiedades claras para cada señal
que soporta:

- **Independencia del proveedor:** Los usuarios pueden elegir cualquier endpoint
  compatible con OTel, ya sea una [instancia del Collector](/docs/collector/) o
  uno de los muchos
  [backends que soportan OTLP directamente](/ecosystem/vendors/), sin construir
  integraciones personalizadas para cada uno.
- **Sin desarrollo personalizado complejo:** Las plataformas externas o las
  herramientas de tus usuarios pueden integrarse mediante los
  [SDK de OTel](/docs/languages/) estándar y el protocolo OTLP, en lugar de API
  propietarias.
- **Preservación del contexto:** Los datos exportados deben incluir metadatos,
  marcas de tiempo y correlación con trazas y spans cuando esté disponible (por
  ejemplo, registros de logs vinculados a ID de trazas), para que los usuarios
  puedan depurar y analizar los datos en su propio backend sin perder contexto.
- **Soporte para convenciones semánticas:** Seguir las
  [convenciones semánticas](/docs/specs/semconv/) asegura que la telemetría se
  mantenga estandarizada y sea fácil de interpretar en cualquier backend
  compatible. También reduce la carga cognitiva del usuario al comprender cómo
  funciona el sistema, ya sea propio o de terceros.

Si tu diseño sigue estos principios para las señales que emite, está alineado
con la forma en que las plataformas modernas abordan la exportación de datos de
observabilidad.

## Dos contextos: ¿dónde se ejecuta tu producto? {#two-contexts-where-does-your-product-run}

La manera de añadir la exportación mediante OTel depende de **quién controla el
sistema** que produce la telemetría. Definir esto correctamente te ayuda a
elegir el enfoque adecuado.

### Software self-hosted {#self-hosted-software}

Tu producto es una aplicación o sistema (por ejemplo, un servidor de identidad,
una red de servicios o una base de datos) que los clientes instalan y ejecutan
en _su_ entorno: su centro de datos, su nube o su clúster de Kubernetes.

Aquí, tú **instrumentas tu producto** con OpenTelemetry. Cuando un cliente
configura el endpoint (por ejemplo, mediante
[variables de entorno](/docs/specs/otel/configuration/sdk-environment-variables/)
o un archivo de configuración), tu aplicación exporta la telemetría desde el
proceso que ejecuta el cliente.

Como OpenTelemetry proporciona
[opciones de configuración estándar](/docs/specs/otel/configuration/), tus
usuarios pueden esperar la misma experiencia de configuración que ya conocen de
otros sistemas instrumentados con OTel.

La exportación sucede en el entorno del cliente; este controla el binario y el
destino. _Ejemplos: Keycloak y Kuma._

### Plataformas en la nube {#cloud-platforms}

Tu producto es una plataforma donde los clientes despliegan sus _propias_
aplicaciones o utilizan tus servicios gestionados (por ejemplo, PaaS, serverless
o una puerta de enlace de API). La carga de trabajo se ejecuta en _tu_
infraestructura.

Aquí, añades una **funcionalidad de la plataforma**, como "Telemetry Drains" u
"Observability Destinations", que permite a los clientes configurar _dónde_
enviar la telemetría. Tu plataforma recopila la telemetría de sus cargas de
trabajo y de tus propios servicios, como los enrutadores, y la envía al endpoint
OTLP que configure el cliente.

La exportación se realiza desde tu infraestructura, no desde un binario que
ejecuta el cliente. _Ejemplos: Heroku y Cloudflare._

En resumen, **software que despliega el usuario** → enfoque en **instrumentación
integrada** y configuración de un endpoint. Una **plataforma que tú operas** →
enfoque en **destinos de exportación configurables** a los que tu
infraestructura envía los datos.

## Cómo lo hacen otros {#how-others-do-it}

Esta publicación se enfoca en cuatro integraciones (Kuma, Keycloak, Cloudflare y
Heroku) como ejemplos representativos de los dos contextos anteriores, pero no
son las únicas que exportan telemetría nativamente mediante OTLP. En
[OpenTelemetry Integrations](/ecosystem/integrations/) puedes encontrar
bibliotecas y servicios con instrumentación nativa o plugins de primera clase.

A continuación, se muestra cómo estas cuatro integraciones manejan **las tres
señales** o un subconjunto de ellas, y qué podemos aprender de sus enfoques.

| Plataforma         | Logs | Trazas | Métricas | Modo de despliegue                | Notas                                                  |
| ------------------ | ---- | ------ | -------- | --------------------------------- | ------------------------------------------------------ |
| Kuma               | Sí   | Sí     | Sí       | Software que el usuario despliega | Políticas separadas por señal, todas con OTel          |
| Keycloak           | Sí†  | Sí     | Sí       | Software que el usuario despliega | †Logs en versión preliminar; mismo endpoint para todas |
| Cloudflare Workers | Sí   | Sí     | No\*     | Plataforma                        | \*Exportación de métricas aún no disponible            |
| Heroku             | Sí   | Sí     | Sí       | Plataforma                        | El usuario escoge las señales con `--signals`          |

### El enfoque self-hosted: Kuma y Keycloak {#the-self-hosted-approach-kuma-and-keycloak}

Si tus usuarios despliegan tu software en sus propios entornos, la mejor
práctica es entregar la aplicación ya instrumentada con OpenTelemetry y exponer
opciones de configuración para sus endpoints OTLP.

#### Kuma {#kuma}

Tanto si los clientes ejecutan los planos de control y de datos de Kuma en sus
propios clústeres de Kubernetes como en máquinas virtuales, Kuma viene
preconfigurado para emitir logs, trazas y métricas a un backend OTel.

Los usuarios configuran la exportación desde sus despliegues de Kuma mediante
las políticas de la malla:

- **MeshAccessLog:** Envía los logs de acceso a un Collector de OTel, con un
  endpoint y atributos como el nombre de la malla y la hora de inicio.
- **MeshTrace:** Gestiona las trazas distribuidas con muestreo y etiquetado
  configurables.
- **MeshMetric:** Expone métricas de los planos de control y de datos. Se
  integra con OpenTelemetry y Prometheus.

Por ejemplo, enviar trazas a un backend OTel se ve así:

```yaml
# MeshTrace policy
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
```

Enviar logs de acceso sigue el mismo patrón con una política diferente:

```yaml
# MeshAccessLog policy
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
body:
  kvlistValue:
    values:
      - key: mesh
        value:
          stringValue: '%KUMA_MESH%'
attributes:
  - key: start_time
    value:
      stringValue: '%START_TIME%'
```

Para más detalles:

- [Kuma MeshAccessLog: OpenTelemetry](https://kuma.io/docs/2.13.x/policies/meshaccesslog/#opentelemetry)
- [Kuma MeshTrace](https://kuma.io/docs/latest/policies/meshtrace/) (backend
  OpenTelemetry)
- [Observabilidad en Kuma](https://kuma.io/docs/2.13.x/explore/observability/)

#### Keycloak {#keycloak}

Keycloak es otro ejemplo de software self-hosted que permite exportar
telemetría.

En lugar de requerir un sidecar independiente o una funcionalidad de plataforma,
los usuarios pasan una opción al iniciar el proceso para apuntar al endpoint de
su Collector, y el propio proceso de Keycloak se encarga de exportar los datos.

Utiliza un único endpoint de telemetría, pero ofrece opciones específicas para
activar o desactivar cada señal:

- **Trazas:** `tracing-enabled=true` (incluye solicitudes HTTP, bases de datos,
  LDAP y solicitudes HTTP salientes a proveedores de identidad).
- **Métricas:** Expone métricas detalladas mediante la misma integración con
  OTel.
- **Logs:** Actualmente en versión preliminar y deshabilitados por defecto
  (`--features=opentelemetry-logs --telemetry-logs-enabled=true`, con
  `--telemetry-logs-level` para filtrar por nivel).

La configuración del endpoint, con soporte para cabeceras opcionales y elección
del protocolo (gRPC o HTTP), se ve así:

```bash
bin/kc.sh start --telemetry-endpoint=http://my-otel-endpoint:4317 --telemetry-protocol=grpc
```

Para más detalles:

- [Observabilidad y telemetría en Keycloak](https://www.keycloak.org/observability/telemetry)

> [!NOTE] Un patrón de diseño común
>
> Ambos modos de despliegue comparten un patrón recurrente.
>
> **La exportación mediante envío activo de datos con OTel/OTLP es el enfoque
> práctico y preferido.** Algunos productos exponen un único endpoint para las
> tres señales, como Keycloak, mientras que otros permiten al usuario escoger
> qué señales enviar, como Heroku con `--signals`.
>
> Soportar nativamente todas las señales de telemetría da a los usuarios más
> flexibilidad para construir una imagen completa en el backend de su
> preferencia.

### El enfoque de plataforma: Cloudflare y Heroku {#the-platform-approach-cloudflare-and-heroku}

Cuando controlas la infraestructura, una experiencia de usuario sencilla
consiste en gestionar la exportación desde la plataforma, recopilando datos de
las cargas de trabajo del usuario y enviándolos a su destino.

#### Cloudflare Workers {#cloudflare-workers}

Como los usuarios ejecutan su código directamente en la infraestructura de
Cloudflare, la plataforma gestiona la exportación mediante **Observability
Destinations**. Los usuarios pueden configurar un endpoint OTLP en su dashboard.
Desde ahí, Cloudflare envía automáticamente las trazas y los logs de Workers a
ese destino.

Aunque la exportación de métricas aún no está disponible, las trazas ofrecen
visibilidad de extremo a extremo al registrar las llamadas a los manejadores,
los enlaces a recursos (bindings), las solicitudes salientes y más. Los usuarios
también pueden configurar la tasa de muestreo en `wrangler.toml`.

Para más detalles:

- [Exportación de datos de OpenTelemetry desde Workers](https://developers.cloudflare.com/workers/observability/exporting-opentelemetry-data/)
- [Cloudflare Workers y trazas](https://developers.cloudflare.com/workers/observability/traces/)

#### Heroku {#heroku}

Heroku adopta un enfoque algo diferente y muy configurable con **Telemetry
Drains**. Los usuarios añaden un destino especificando el endpoint, el protocolo
de transporte y las cabeceras, y luego escogen explícitamente _qué señales
exportar_.

La plataforma de Heroku recopila los datos de la aplicación del usuario
(mediante el SDK de OTel) y de sus propios servicios, como Router, y los envía
al destino.

```bash
heroku telemetry:add <endpoint> --app <app-name> --signals traces,metrics,logs --transport http --headers '{"Authorization": "ingestion key"}'
```

Dar a los usuarios control granular sobre las señales que exportan es un patrón
de diseño práctico, especialmente para equipos que buscan gestionar el volumen
de datos y los costos de ingesta.

Para más detalles:

- [Telemetría en Heroku](https://devcenter.heroku.com/articles/heroku-telemetry)
- [Señales y atributos de OpenTelemetry en Heroku](https://devcenter.heroku.com/articles/heroku-opentelemetry-signals-and-attributes-reference)
- [Uso de Telemetry Drains en Heroku](https://devcenter.heroku.com/articles/working-with-heroku-telemetry-drains)

## Diseñar tu modelo de exportación {#designing-your-export-model}

Para las tres señales esenciales de telemetría, la pregunta fundamental de
arquitectura es la misma: ¿tu plataforma requerirá que el usuario **consulte una
API periódicamente para obtener los datos**, o **entregará la telemetría
directamente** al endpoint que el usuario defina?

### El modelo clásico: consultar API personalizadas {#the-classic-approach-custom-polling-apis}

Tradicionalmente, las plataformas han expuesto telemetría mediante API. El
usuario debe consultarlas a intervalos regulares, gestionar la paginación e
ingerir los resultados en sus propios backends.

Es un punto de partida razonable si ya cuentas con una API madura y probada para
logs o métricas, ya que extenderla suele ser más fácil que construir un nuevo
mecanismo de envío. Sin embargo, tiene costos reales:

- Trasladas una parte importante de la responsabilidad operativa al usuario.
  Este debe construir un sistema de consultas escalable que gestione los
  intervalos de consulta, la paginación de respuestas de la API, los reintentos
  ante fallos y la recuperación de datos faltantes.
- Los usuarios pueden construir soluciones personalizadas que no escalen, no
  sigan tus estándares y requieran mantenimiento significativo a medida que el
  esquema de la API evolucione junto con tu plataforma.
- Entregar datos casi en tiempo real se vuelve mucho más difícil, aunque suele
  ser un requisito para señales sensibles a la latencia, como trazas y métricas.

Para logs, una implementación basada en consultas suele tener este aspecto (por
ejemplo,
[al estilo de CloudWatch Logs](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/8bee89f9928b4b1f81700f9ab0e5886d428bfae6/receiver/awscloudwatchreceiver/logs.go#L293)):

```text
state: last_end_time
every poll_interval:
  start_time = last_end_time
  end_time   = now()
  next_token = null
  do:
    response = FilterLogEvents(log_groups, start_time, end_time, next_token)
    emit(response.events)
    next_token = response.nextToken
  while next_token != null
```

Necesitarías una lógica similar de seguimiento del estado para las API de
métricas o trazas.

Aunque obliga a los usuarios a escribir código personalizado para convertir las
respuestas de tu API a formatos estándar, este modelo de consultas es viable
para todas las señales que soportes cuando no puedas utilizar un enfoque más
estandarizado, como Prometheus.

Sin embargo, para diseños nuevos, este **no debería ser el enfoque
predeterminado**.

### El enfoque basado en estándares: OTLP {#the-standards-oriented-approach-otlp}

Para la telemetría en tiempo real orientada a desarrolladores, el envío mediante
OTLP se ha convertido en el patrón dominante.

En lugar de esperar una consulta, tu servicio o un Collector de OpenTelemetry
que tú gestionas exporta activamente logs, trazas y métricas al endpoint que
configure el usuario, mediante OTLP sobre HTTP o gRPC.

Utiliza un único protocolo estándar e independiente del proveedor para toda la
telemetría, lo que evita tener que reimplementar la lógica de entrega para cada
señal que soportes.

Además, OTLP ofrece soporte nativo para datos estructurados y metadatos, lo que
ayuda a preservar el contexto, por ejemplo, al vincular registros de logs
específicos con los ID de sus trazas.

Desde la perspectiva del usuario, es prácticamente conectar y usar. Cualquier
backend compatible con OTel puede ingerir los datos casi en tiempo real sin
requerir lógica de consultas personalizada.

### Construir la experiencia de exportación {#building-the-export-experience}

Al implementar el modelo de exportación en tu producto, busca maximizar la
flexibilidad con una configuración mínima.

#### Permite que los usuarios configuren un endpoint OTLP {#let-users-configure-an-otlp-endpoint}

Empieza dejando que los usuarios proporcionen su propio endpoint OTLP y las
cabeceras de autenticación necesarias, como una clave de ingesta.

_¡Pero no te detengas aquí!_

Para que los usuarios puedan controlar el volumen de exportación, simplificar la
gestión de datos y reducir costos, permite que activen o desactiven
explícitamente las señales que desean exportar, siguiendo el ejemplo de Heroku.

#### Estandariza la arquitectura {#standardize-the-architecture}

Internamente, tienes dos opciones principales: usar el SDK de OpenTelemetry
directamente en tus servicios para emitir datos, o ejecutar un Collector de OTel
interno que recopile la telemetría de tu sistema y la exporte al endpoint del
usuario.

Usar las variables de entorno estándar de OpenTelemetry, como
[`OTEL_EXPORTER_OTLP_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint),
hace que el funcionamiento interno sea confiable y fácil de documentar y
comprender.

#### Mantén una semántica consistente {#keep-semantics-consistent}

Además de usar variables de entorno basadas en OTel, mantén una semántica
consistente en todas tus señales. Las
[convenciones semánticas](/docs/specs/semconv/) son la referencia para nombrar
atributos y esquemas de forma consistente, y para relacionar los logs y las
métricas con los ID de trazas y spans.

[Weaver](/blog/2025/otel-weaver/) se basa en las convenciones semánticas y te
permite definir tus propios nombres de atributos y esquemas, mantenerlos
sincronizados con la evolución de tu código e infraestructura y gestionar
registros federados de convenciones semánticas.

Cuando un usuario ingiere tu telemetría en su backend de observabilidad, todo
debería conectarse de extremo a extremo para mostrar la historia completa.

Un beneficio de este enfoque es que evitas construir integraciones diferentes
para cada proveedor. Al exportar la telemetría mediante OTLP, permites que los
usuarios la transformen e ingieran en los formatos que necesiten.

Por ejemplo, un usuario podría querer enviar logs tanto a su backend como a un
almacenamiento de objetos, como S3, para cumplir requisitos normativos.

### Enrutar la telemetría al usuario {#routing-telemetry-to-the-user}

Al diseñar la interfaz de configuración, necesitas decidir qué tan granular será
el enrutamiento de la telemetría. Generalmente tienes dos opciones, cada una
para necesidades diferentes.

#### Un solo endpoint {#single-endpoint}

Para la gran mayoría de los usuarios, configurar un único endpoint es lo ideal.
En este caso, el usuario configura una URL base y el exportador agrega
internamente las rutas OTLP estándar (`v1/traces`, `v1/metrics` y `v1/logs`)
cuando se usa OTLP sobre HTTP.

#### Endpoints por señal {#per-signal-endpoints}

Los clientes de gran escala o aquellos con sistemas de observabilidad complejos
pueden querer enviar señales a diferentes plataformas.

OTLP soporta este modelo mediante variables de entorno específicas para cada
señal, con el patrón `OTEL_EXPORTER_OTLP_<SIGNAL>_ENDPOINT`, junto con las
[configuraciones de cabeceras](/docs/languages/sdk-configuration/otlp-exporter/#header-configuration)
correspondientes. Por ejemplo, para configurar un endpoint específico para logs,
puedes usar
[`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_logs_endpoint).

Exponer este control por señal en tu aplicación es técnicamente opcional, pero
aporta valor para los usuarios avanzados.

### Ejecutar Collectors para gestionar múltiples inquilinos {#running-collectors-to-manage-multi-tenancy}

Una vez que envías telemetría mediante OTLP, con cualquier combinación de logs,
métricas o trazas, debes decidir cómo ejecutar los Collectors para gestionar
múltiples inquilinos.

La arquitectura del Collector necesita [escalar](/docs/collector/scaling/) en
dos dimensiones: la incorporación de más usuarios y el volumen de telemetría que
se genera al añadir funcionalidades.

#### Un Collector por inquilino {#one-collector-per-tenant}

Si tu arquitectura ya aísla a los inquilinos en la infraestructura, puedes
desplegar una instancia del Collector dedicada a cada cliente. En este caso,
cada instancia tiene una configuración propia que apunta directamente al
endpoint de exportación de ese cliente.

Este modelo ofrece garantías sólidas de aislamiento lógico. La lentitud o los
errores de configuración en el pipeline de un cliente no afectan a los demás.

Aunque puedes
[construir un binario personalizado del Collector](/docs/collector/extend/ocb/)
que solo incluya los componentes necesarios, desplegar cientos o miles de
instancias consumirá muchos recursos.

Por este compromiso entre aislamiento y consumo de recursos, la arquitectura
suele ser más adecuada para productos SaaS empresariales donde el aislamiento
entre inquilinos es un requisito estricto y los clientes pueden tener
configuraciones de endpoints complejas.

![La arquitectura con un Collector por inquilino ofrece garantías sólidas de aislamiento a costa de un mayor uso de recursos.](collector-per-tenant.png)

#### Un Collector compartido con pipelines estáticos por inquilino {#shared-collector-with-static-pipelines-per-tenant}

Aquí, "estático" significa que el pipeline y las reglas de enrutamiento de cada
inquilino se definen de antemano en el archivo de configuración del Collector,
en lugar de crearse dinámicamente durante la ejecución.

Este enfoque se parece al
[patrón de despliegue como gateway](/docs/collector/deploy/gateway/): toda la
telemetría de tu plataforma pasa por un Collector centralizado. Dentro de él,
defines pipelines separados por inquilino. El
[conector de enrutamiento](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.158.0/connector/routingconnector#readme)
encaja de forma natural aquí, dirigiendo los datos al pipeline correcto y, por
lo tanto, al endpoint externo correspondiente, según atributos de recursos como
el ID del inquilino.

Este patrón funciona bien para equipos en etapas iniciales o de escala moderada,
donde operar un único despliegue es más sencillo que gestionar instancias por
inquilino. Solo tienes que supervisar y escalar un despliegue, y todo el
enrutamiento se configura en un solo lugar.

Sin embargo, debes estar preparado para gestionar un archivo de configuración
dinámico que crecerá a medida que aumente tu base de clientes.

![El patrón de Collector compartido es más fácil de supervisar y mantener porque todas las exportaciones pasan por una única instancia.](shared-collector.png)

### Consultas a API personalizadas frente a OTLP: el veredicto {#custom-polling-apis-vs-otlp-the-verdict}

Cuando la elección es entre hacer que tus usuarios consulten API personalizadas
o permitirles ingerir datos mediante un estándar compartido, la mayoría de las
plataformas modernas orientadas a desarrolladores deberían escoger la segunda
opción. Las API de consulta personalizadas son viables si la estandarización no
es una opción.

El protocolo unificado de OpenTelemetry preserva el contexto, entrega datos casi
en tiempo real y ha demostrado funcionar a escala en despliegues en la nube y
self-hosted, como los de Cloudflare, Heroku, Kuma y Keycloak. Además, la
independencia del proveedor permite a los usuarios cambiar de backend de
observabilidad según las necesidades del negocio sin rehacer por completo sus
pipelines de telemetría.

La adopción de OpenTelemetry tampoco es gratuita: tu equipo debe invertir tiempo
en aprender a implementarlo y construir la documentación necesaria para guiar a
los usuarios y equipos internos en las mejores prácticas.

Dada la creciente adopción de OTel en observabilidad, con su reciente
[graduación en la CNCF](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/),
esta inversión inicial dará resultados al integrar en tu plataforma herramientas
que dependan de OpenTelemetry para exportar su propia telemetría.

## Ponerlo todo junto {#putting-it-all-together}

En conclusión, no necesitas construir integraciones a medida para que tus
usuarios exporten telemetría a sus propios backends.

Si ya estás listo para implementar la exportación nativa con OTel en tu
aplicación, estos son los puntos clave de arquitectura y diseño:

- Decide qué señales de telemetría vas a soportar: logs, trazas y métricas.
  Idealmente, soporta las tres, pero empieza con las que genere tu producto.
- Usa OTLP para exportarlas mediante el SDK de OTel o un Collector. La misma
  arquitectura de envío activo funciona para las tres señales.
- Permite que el usuario configure un endpoint de destino y cabeceras de
  autenticación opcionales. Considera endpoints por señal para equipos con
  configuraciones complejas.
- Permite al usuario habilitar o deshabilitar señales individuales para
  controlar el volumen de datos y los costos.
- Documenta el formato del endpoint (gRPC/HTTP), las cabeceras requeridas y la
  semántica de los atributos y esquemas de cada señal, para que los usuarios
  puedan confiar en los datos que reciben en sus backends.
- Escoge una topología para el Collector: uno por inquilino para ofrecer
  aislamiento, o uno compartido con pipelines por inquilino para reducir la
  carga operativa.
- Proporciona ejemplos de configuración o variables de entorno para que los
  usuarios puedan empezar rápidamente.

Estos puntos también resumen las reglas de oro que siguen Cloudflare (excepto
para métricas), Heroku, Kuma y Keycloak: **enviar datos por defecto, mantener la
independencia del proveedor y documentar el contrato**.

Diseñar para las tres señales con estándares abiertos desde el inicio elimina
fricción, reduce el trabajo de ingeniería y permite a los clientes aprovechar
sus datos en sus propios términos.

> [!NOTE]
>
> **Si estás leyendo esto como usuario final y no como desarrollador de un
> producto:** no necesitas esperar a que tu proveedor SaaS adopte este enfoque.
>
> Pídele que permita exportar mediante OTLP directamente. Es una petición
> razonable y cada vez más común, y ahora puedes usar esta publicación como
> referencia.

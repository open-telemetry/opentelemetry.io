---
title: >-
  Diseño Nativo con OTel - Construyendo Productos que Exporten a Cualquier
  Stack
linkTitle: Diseño Nativo con OTel
date: 2026-10-08
author: >-
  [Nityananda Gohain](https://github.com/nityanandagohain) (SigNoz), [Dhruv
  Ahuja](https://github.com/dhruv-ahuja) (SigNoz)
body_class: otel-with-contributions-from
issue: 10300
sig: SIG End User
cSpell:ignore: Ahuja Dhruv Gohain Nityananda
---
Con contribuciones de [Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic).

Si estás construyendo un producto self-hosted o SaaS, tus usuarios eventualmente van a pedir mandar **logs, trazas y métricas** a su stack de observabilidad, ya sea para satisfacer algún requisito, manejo de costos o centralizar toda su observabilidad en un solo lugar.

Encerrar a los usuarios en tus dashboards prefabricados o limitar a dónde se exportan los datos crea fricción innecesaria. Al contrario, dar el soporte para poder exportar a cualquier backend compatible con OpenTelemetry (OTel) que sea agnóstico al proveedor, diseñado para adaptarse al futuro le permite al usuario la libertad de escoger su stack de observabilidad.

Esta publicación describe cómo puedes diseñar tu producto para que los usuarios puedan exportar sus logs, trazas y métricas a un backend OTel cuando quieran.

![Enabling telemetry export via the OTLP standard allows users to own and
analyze their data on the platforms of their
choosing.](cover.png)

## Las cuatro señales de observabilidad {#four-signals}

OpenTelemetry define cuatro tipos de señales, todas usan el estándar [OpenTelemetry Protocol (OTLP)](/docs/specs/otlp/):

- **[Logs](/docs/concepts/signals/logs/):** Registros de eventos, logs de solicitudes/accesos, y aplicaciones con timestamp y metadatos.
- **[Traces](/docs/concepts/signals/traces/):** Trazas distribuidas con spans permitiendo a los usuarios ver los flujos entre servicios para correlacionar con logs.
- **[Metrics](/docs/concepts/signals/metrics/):** Contadores, medidores e histogramas (ej. tasa de solicitudes, latencia, tasa de errores).
- **[Profiles](/docs/concepts/signals/profiles/):**  Muestras que demuestran dónde las aplicaciones consumen recursos durante su ejecución.

> [!NOTE] Profiles están en public alpha
>
> Profiles entraron a [public alpha](/blog/2026/profiles-alpha/) en Marzo 26, 2026.
> Como señal, OpenTelemetry pretende que los perfiles se encuentren junto a las tres señales mayores de observabilidad, ayudando a los usuarios a solucionar incidentes de producción capturando los patrones de uso en su código.

> Aunque exclusivamente nos enfocaremos en logs, trazas, y métricas en esta publicación, estamos emocionados de ver cómo los profiles toman forma, y cómo la comunidad los utiliza en sus sistemas de observabilidad.

La misma historia de exportar aplica a las tres (logs, trazas, y métricas): Permitiendo a los usuarios configurar su OTLP endpoint y **enviando** telemetría. Puedes añadir soporte a una, dos, o las tres señales dependiendo de tu producto.

Muchas plataformas que soportan exportar vía OTel incluyen al menos trazas y logs, y con un gran número en aumento incluyendo métricas. Diseñando con las tres señales desde un inicio evita adaptar más tarde.
## Como un "buen" sistema de telemetria se ve

Una historia solida para exportar cada senal tiene pocas propiedades que debes de considerar:

- **Proovedor Agnóstico:** Los usuarios pueden cambiar a cualquier endpoint compatible con OTel, un [Collector instance](/docs/collector/), uno de los muchos
  [backends que soportal OTLP directamente](/ecosystem/vendors/) — sin construir integraciones personalizandas.
- **No desarrollo personalizado:** Plataforms external (o utilerias) se pueden integrar usando estandares [OTel SDKs ] y el protocolo OTLP en lugar de API exclusivas.
- **Preservacion de contenido rico:** Los datos exportadores deben incluir metadatos, timestamps y trazas/spans que se puedan correlacionar cuando se permita (ej. logs con un vinculo a IDs de trazas), para que los usuarios puedan analizar los datos en su propio backend sin perder contexto.
- **Soporte a convenciones semanticas:** Adherise a las [Semantic Conventions] asegura que la telemetria se mantenga estandarizada y facil de interpretar con cualquier backend compatible. Tambien reduce la carga cognitiva para el usuario al no tener que racionalizar como funciona el systema, ya sea un sistema primaria o terciario.

Si tu diseno se alinea con estos principales para las senales que se emiten, estas alineado con como las plataformas modernas utilizan y adoptan la observabilidad.

## Dos contextos: en donde corre tu producto?

La manera en que OTel exporta depende de **quien es dueno del sistema** que produce la telemetria. Definir esto de manera correct te ayuda a elegir el enfoque adecuado.

### Software self-hosted

Tu producto es una aplicacion o systema (ej., un servidor de identidad, un servicio de redes, una base de datos) que los clientes instalan y corrent en __su__ ambient (su centro de datos, su nube, su cluster de Kubernetes).

Aqui, tu **instrumentas tu producto** con OpenTelemetry. Cuando un cliente configura el endpoint (ej., via [environment variables]()), tu aplicaion exporta la telemetria desde el proceso donde corre.

Ya que OpenTelemetry proporciona [configuraciones estándar](), tus usuarios pueden esperar la misma experiencia de configuracion que ya tienen con cualquier otro backend de OTel.

La exportacion sucede en el ambiente del cliente; ellos controlar el binario y el destino. __Ejemplo: Keycloak, Kuma.__

### Plataformas de nube

Tu product es una plataforma donde los clientes despliegan sus __propias__ apps y utilizan tus servicios (ej., PaaS, serverless, API gateway). La aplicacion corre en __tu__ infraestructura.

Aqui, tu agregas una **la funcionalidad de la plataforma**, como "Telemetry Drains" o "Observability Destinations" que permiten a los clientes configurar __donde__ enviar telemetria. Tu plataforma recolecta la telemetria desde sus cargas de trabajo (incluyendo de tus propios servicios, como enrutadores) y se envian al endpoint OTLP que el cliente configure.

La exportacion se realiza por tu infraestructura, no con una aplicacion o binario que el cliente ejecuta. __Ejemplos: Heroku, Cloudflare.__

En resumen, **software que el usuario despliega** -> se enfoca en **instrumentar** y configurar un endpoint. Una **plataforma que tu operas** -> se enfoca en **configurar el destino de los datos** que tu infraestructura envia.

## Como otros hacen

Este punto se enfoca en cuantro integraciones - Kuma, Keycloak, Cloudflare y Heroku - como ejemplos representativos de los ejemplos que mencionamos anteriormente, vale la pena mencionar que no son los unicos que exportan telemetria nativamente mediante OTLP. En [OpenTelemetry Integrations] podemos encontrar librerias y servicios que proveen instrumentacion nativa o plugins de primer nivel.

A continuacion, se muestra como estos 4 manejan las **tres senales** (o la mayoria) y que podemos aprender de ellos.


| Platform           | Logs | Trazas | Metricas | Modo Despliege       | Notas                                   |
| ------------------ | ---- | ------ | ------- | --------------------- | --------------------------------------- |
| Kuma               | Si | Si| Si| Desplegado por el usuario| Politicas separadas por senals, todo en OTel |
| Keycloak           | Si† | Si| Si| Desplegado por el usuario| †Logs en beta; mismo endpoint para todas|
| Cloudflare Workers | Si| Si| No\*    | Plataforma| \*Exportar metricas no es soportado aún |
| Heroku             | Si| Si| Si| Plataforma| usuarios escoge la senal con `--signals`    |

### El modo self-hosted: Kuma y Keycloak

Si tus usuarios despliegan tu software en sus ambientes, el mejor modelo a seguir es ofrecer tu aplicacion con instrumentacion con OpenTelemetry ya aplicada y exponer las banderas de configuracion para los endpoints OTLP.

#### Kuma

Ya sea que los usuarios ejecuten ambos paneles de control y datos en su cluster de Kubernetes o VMs, los logs, trazas y metricas ya vienen pre-configurados para usar un backend de OTel.

El usuario configura la exportacion, que corre en su despliegue de Kuma con politicas definidas:

- **MeshAccessLog:** Enruta los logs a un colector OTel (endpoint y atributos).
- **MeshTrace:** Maneja la distribucion y recoleccion de trazas, asi como tambien el etiquetado.
- **MeshMetric:** Exporta paneles de control y datos de la plataforma. Se integra con OpenTelemetry y Prometheus.

Por ejemplo, mandar trazas a un backend de OTel se vera asi:

```yaml
# MeshTrace policy
backends:
  - type: OpenTelemetry
    openTelemetry:
      endpoint: otel-collector:4317
```

Mandar logs sigue el mismo patron con una politica diferente:

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

Para mas detailles:

- [Kuma MeshAccessLog – OpenTelemetry](https://kuma.io/docs/2.13.x/policies/meshaccesslog/#opentelemetry)
- [Kuma MeshTrace](https://kuma.io/docs/latest/policies/meshtrace/)
  (OpenTelemetry backend)
- [Kuma observability](https://kuma.io/docs/2.13.x/explore/observability/)

#### Keycloak

Keycloak es otro ejemplo de software self-hosted que puede exportar telemetria.

En lugar de requerir un aditamento extra o una capacidad de plataforma, los usuarios unicamente utilizan una configuracion apuntando a un endpoint de un Collector, y Keycloak se encarga de exportar los datos.

Utiliza un punto unico para la telemetria pero provee banderas granular para poder decidir y especificar las señales:

- **Trazas**: `tracing-enabled=true` (contiene peticiones HTTP, Base de datos, LDAP, HTTP/IdP).
- **Metricas:** Expone metricas detalladas con integracion OTel.
- **Logs:** Se encuentra en prueba y esta deshabilitado por defecto (`--features=opentelemetry-logs --telemtry-logs-enabled=true`, con `--telemetry-logs-level` para filtrar el nivel).

Definir el endpoint, headers y protocolo (gRPC o HTTP) se ve asi:

```bash
bin/kc.sh start --telemetry-endpoint=http://my-otel-endpoint:4317 --telemetry-protocol=grpc
```

Para mas detalles:

- [Keycloak Observability / Telemetry](https://www.keycloak.org/observability/telemetry)

> [!NOTE] Un patron comun de diseno 
>
> Ambos despliegues tienen un tema en comun.
> **Exportar datos usando OTel/OTLP es el metodo practico y preferido**
> Algunos productos exponen un endpoint para las tres senales (Keycloak por ejemplo),
> mientras que otros permiten al usuario escoger que senal mandar (Heroku `--signals`).

> Soportar nativamente todas las senales de telemetria le da la flexibilidad a los usuarios
> de construir una imagen completa usando el backend de su preferencia.

### Como plataforma: Cloudflare y Heroku

Cuando tu controlas la infraestrctura, la experiencia mas directa es controlar la exportacion de datos a nivel plataforma, extrayendo datos de la carga de trabajo del usuario y mandarla a su destino.

#### Cloudflare Workers

Cuando los usuarios corren su codigo directamente en la infraestrctura de Cloudflare, este maneja la exportacion de datos atravez **Destinos de Observabilidad**. Ofrece a los usuarios una manera sencilla donde pueden configurar su endpoint OTLP en un dashboard. Desde ahi, Cloudflare automaticanete envia las trazas y logs de los trabajadores a su destino.

A pesar de que las metricas aun no cuentan con suporte, las trazas proveen informacion profunda y visibilidad completa ya que registra todas las llamadas, vinculos, llamadas salientes y mas. Los usuarios tambien pueden configurar el muestreo en el `wrangler.toml`.

Para mas detailles:

- [Exporting OpenTelemetry data from Workers](https://developers.cloudflare.com/workers/observability/exporting-opentelemetry-data/)
- [Cloudflare Workers and Traces](https://developers.cloudflare.com/workers/observability/traces/)

#### Heroku

Heroku toma un enfoque un poco diferente, configuracion de alto nivel con **Telemetry Drains**. Permite a los usuarios especificar el endpoint de destino, los protocoles de transport y headers, despues permite explicitamente escoger __que senales se exportan**.

La plataforma de Heroku recolecta los datos de la aplicacion del usuarios (via OTel SDK) y de su servicios de primer clase (como su Router) y envia estos a su destino.

```bash
heroku telemetry:add <endpoint> --app <app-name> --signals traces,metrics,logs --transport http --headers '{"Authorization": "ingestion key"}'
```


Dandole a los usuarios un control mas granular sobre las senales a exportar, este es un diseno prgamatico, especialmente para equipos que buscan manejar volumenes de datos y manejo de costos.

Para mas detalles:

- [Heroku Telemetry](https://devcenter.heroku.com/articles/heroku-telemetry)
- [Heroku OpenTelemetry signals and attributes](https://devcenter.heroku.com/articles/heroku-opentelemetry-signals-and-attributes-reference)
- [Working with Heroku Telemetry Drains](https://devcenter.heroku.com/articles/working-with-heroku-telemetry-drains)


---
title:
  'Adobe: un pipeline de OpenTelemetry diseñado para la simplicidad a escala'
linkTitle: Adobe
author: >-
  [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs), [Juliano
  Costa](https://github.com/julianocosta89) (Datadog), [Tristan
  Sloughter](https://github.com/tsloughter) (community), [Damien
  Mathieu](https://github.com/dmathieu) (Elastic), [Bogdan
  Stancu](https://github.com/bogdan-st) (Adobe)
sig: End-User
default_lang_commit: 6751402db060c25800bb41c270dcaebb48aa7acb
drifted_from_default: true
# prettier-ignore
cSpell:ignore: autoescalado contrapresión reinicios Sloughter sénior Öjeling
---

Por [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs),
[Juliano Costa](https://github.com/julianocosta89) (Datadog),
[Tristan Sloughter](https://github.com/tsloughter) (community),
[Damien Mathieu](https://github.com/dmathieu) (Elastic),
[Bogdan Stancu](https://github.com/bogdan-st) (Adobe) | 8 de abril de 2026

Esta implementación de referencia presenta a
[Adobe](https://www.adobe.com/?link-check=no), una empresa de software global.
El equipo de observabilidad de Adobe ha construido un pipeline de telemetría
basado en OpenTelemetry y diseñado para la simplicidad a escala masiva, con
miles de Collectors ejecutándose por cada tipo de señal a lo largo de la
infraestructura de la empresa.

## Estructura organizativa {#organizational-structure}

El equipo central de observabilidad de Adobe es responsable de proporcionar la
infraestructura de observabilidad en toda la empresa. Sin embargo, como explicó
[Bogdan Stancu](https://github.com/bogdan-st), ingeniero de software sénior, el
historial de adquisiciones de Adobe hace que el panorama no esté del todo
consolidado. Algunos grandes grupos de producto tienen sus propios equipos de
observabilidad dedicados, mientras que el equipo central actúa como el proveedor
principal.

El pipeline basado en OpenTelemetry se introdujo como una nueva opción junto a
las soluciones de monitorización existentes, diseñada principalmente para nuevas
aplicaciones y despliegues. La adopción es voluntaria, no obligatoria. Las
aplicaciones existentes con monitorización establecida no se han migrado.

## Adopción de OpenTelemetry {#opentelemetry-adoption}

La decisión de adoptar OpenTelemetry vino impulsada por la alineación entre las
capacidades del proyecto y los objetivos del equipo. El equipo de observabilidad
necesitaba una solución que pudiera dar servicio al diverso panorama tecnológico
de Adobe, admitir múltiples backends y seguir siendo sencilla de adoptar para
los equipos de servicio.

> «Encajaba con todo lo que queríamos», dijo Bogdan.

El [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/), el modelo de
componentes del Collector y los Helm charts de la comunidad proporcionaron los
bloques de construcción para una oferta de observabilidad a nivel de plataforma
que podía escalar sin requerir un profundo conocimiento de OpenTelemetry por
parte de los equipos de servicio individuales.

## Arquitectura: un pipeline de collectors de tres niveles {#architecture-a-three-tier-collector-pipeline}

La arquitectura de collectors de Adobe sigue un diseño de tres niveles: un Helm
chart de cara al usuario que contiene dos collectors, un namespace gestionado y
centralizado con despliegues de collector por señal, y los backends de
observabilidad.

![Diagrama de arquitectura de Adobe](adobe-architecture.png)

### Nivel 1: el Helm chart del usuario {#tier-1-the-user-helm-chart}

El equipo de observabilidad proporciona un Helm chart que los equipos de
servicio despliegan en sus propios namespaces. Este chart crea dos collectors:

**Collector sidecar (en el pod de la aplicación)**: se ejecuta junto al
contenedor de la aplicación y está intencionadamente aislado. Los equipos de
servicio no pueden modificar su configuración. Recopila toda la telemetría:
métricas, logs y trazas, con independencia de lo que el equipo haya elegido
exportar aguas abajo. La configuración es inmutable para evitar reinicios de la
aplicación provocados por cambios de configuración.

**Collector de despliegue (independiente)**: recibe la telemetría del sidecar a
través de OTLP y se encarga del enrutamiento y la exportación. A diferencia del
sidecar, este collector _sí_ es configurable a través de los valores de Helm. El
equipo de observabilidad proporciona valores predeterminados razonables, pero
los equipos de servicio pueden personalizar los exportadores y añadir nuevos
destinos. Cuando cambia la configuración, solo se reinicia el collector de
despliegue. El pod de la aplicación y su sidecar permanecen intactos.

### Nivel 2: el namespace gestionado {#tier-2-the-managed-namespace}

Los collectors de despliegue reenvían la telemetría a un namespace centralizado
gestionado en su totalidad por el equipo de observabilidad. Una decisión
arquitectónica clave aquí es el aislamiento a nivel de señal: el namespace
gestionado ejecuta un despliegue de collector independiente para cada tipo de
telemetría: uno para métricas, uno para logs y uno para trazas.

Si un backend queda limitado por la tasa (rate-limited) o empieza a rechazar
datos de un tipo de señal, los demás siguen fluyendo sin interrupción. A pesar
de manejar el tráfico aguas arriba equivalente a miles de collectors, estos
despliegues gestionados han operado por lo general con los recuentos de réplicas
predeterminados, sin necesidad de un autoescalado agresivo.

Los equipos de servicio configuran el backend que desean a través de los valores
de Helm, lo que establece una cabecera HTTP en las exportaciones OTLP. Los
collectors del namespace gestionado usan esta cabecera con el
[routing connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/6aff35ab5351482a4664f29a7d5428cedcf61a92/connector/routingconnector?from_branch=main)
para dirigir la telemetría al exportador correcto.

### Nivel 3: los backends de observabilidad {#tier-3-the-observability-backends}

Los collectors del namespace gestionado exportan la telemetría a los destinos de
backend gestionados por el equipo de observabilidad. Se admiten múltiples
backends, y los equipos seleccionan su destino a través del archivo de valores
del Helm chart.

## Auto-instrumentación: dos líneas y funciona {#auto-instrumentation-two-lines-and-it-works}

Adobe aprovecha el OpenTelemetry Operator para la auto-instrumentación en los
lenguajes que admite OpenTelemetry. El Operator se despliega en cada clúster, y
los equipos de servicio habilitan la instrumentación añadiendo dos anotaciones a
los manifiestos de despliegue de Kubernetes:

```yaml
instrumentation.opentelemetry.io/inject-java: 'true'
sidecar.opentelemetry.io/inject: 'true'
```

> «La gente añade dos líneas en su despliegue. Y simplemente funciona», dijo
> Bogdan.

Los equipos seleccionan su lenguaje en los valores de Helm, y el Operator se
encarga del resto. Aunque los equipos son libres de añadir instrumentación
manual con el SDK —el sidecar acepta todos los datos OTLP—, la vía soportada por
el equipo de observabilidad se centra en la experiencia de auto-instrumentación.
El Operator ha gestionado la escala de administrar sidecars y
auto-instrumentación en toda la flota de despliegues sin problemas.

Esta filosofía de diseño recorre toda la plataforma: hacer que la vía
predeterminada requiera el menor esfuerzo posible, dejando al mismo tiempo la
puerta abierta a casos de uso avanzados.

## Distribución y componentes personalizados {#custom-distribution-and-components}

Adobe crea su propia distribución del OpenTelemetry Collector para incluir solo
los componentes que utiliza, evitando dependencias innecesarias de Contrib. Esta
distribución personalizada es la predeterminada en el Helm chart que se
proporciona a los equipos de servicio. No obstante, los equipos pueden cambiar
manualmente a la distribución de Contrib si necesitan componentes no incluidos
en la compilación personalizada.

Adobe también mantiene componentes personalizados, en especial una extensión que
aborda un reto fundamental de su arquitectura de collectors encadenados.

### El problema de los collectors encadenados {#the-chain-collector-problem}

Cuando los collectors se encadenan, la visibilidad de los errores se convierte
en un problema. La transacción OTLP entre el collector de despliegue del usuario
y el collector del namespace gestionado se completa con una respuesta 200
_antes_ de que el collector del namespace gestionado intente exportar al
backend. Si el backend rechaza los datos, el error solo es visible en los logs
del collector del namespace gestionado.

> «El usuario solo vería 200. Métricas exportadas, todo bien», explicó Bogdan.
> «Lo cual no era lo que queríamos».

Para abordar esto, Bogdan construyó una extensión personalizada que actúa como
un cortacircuitos (circuit breaker) para la autenticación del backend. La
extensión se ejecuta en el receptor del collector del namespace gestionado,
enviando de forma proactiva solicitudes de autenticación simuladas al backend y
almacenando los resultados en caché. Si la autenticación falla, devuelve un 401
al collector aguas arriba antes de que se complete la transacción OTLP,
propagando el error de vuelta hasta donde los usuarios pueden verlo.

Construir esta extensión fue uno de los primeros proyectos en Go de Bogdan. La
experiencia de intentar contribuir aguas arriba despertó una implicación más
profunda con la comunidad de OpenTelemetry. De cara al futuro, a Bogdan le
gustaría que el Collector incorporara un mecanismo de contrapresión
(back-pressure) más general, en el que los fallos de los exportadores se
propaguen aguas arriba a través de los collectors encadenados.

## Despliegue y gestión del ciclo de vida {#deployment-and-lifecycle-management}

El equipo de observabilidad actualiza su distribución del collector y el
OpenTelemetry Operator con una cadencia trimestral. Los problemas en las
actualizaciones han sido escasos.

Cuando se actualiza el Helm chart, los equipos de servicio adoptan la nueva
versión del collector en su siguiente despliegue. Sin embargo, el equipo de
observabilidad se ha encontrado con un reto de compatibilidad entre el Operator
y versiones antiguas del collector: cuando se actualiza el Operator, este puede
modificar el recurso personalizado `OpenTelemetryCollector` para ajustarlo a las
nuevas expectativas de configuración. Si un equipo de servicio ejecuta una
versión del collector significativamente más antigua, estos cambios pueden ser
incompatibles e impedir que los collectors arranquen.

La solución es sencilla —actualizar el collector resuelve el problema—, pero ha
causado confusión a los equipos cuyos collectors se rompían de repente sin
ningún cambio por su parte.

### Cómo gestionar las deprecaciones de componentes {#navigating-component-deprecations}

El despliegue de Adobe también ha tenido que sortear deprecaciones de
componentes a medida que OpenTelemetry evoluciona. El equipo usaba originalmente
el routing processor para dirigir la telemetría a distintos backends en función
de las cabeceras HTTP, pero migró al routing connector cuando el processor quedó
deprecado.

Aunque la migración requirió trabajo, el equipo lo considera una parte esperable
de trabajar con un proyecto en rápida evolución.

> «Este es un riesgo que conocíamos; todo el panorama de OpenTelemetry cambia
> constantemente y los beneficios superan a los "problemas", si es que se puede
> llamar problema a un desarrollo rápido», explicó Bogdan.

## Lo que funciona bien {#what-works-well}

La experiencia general ha sido positiva. El modelo de componentes del Collector,
la experiencia de auto-instrumentación a través del Operator y el modelo de
despliegue basado en Helm chart han funcionado todos de forma fiable. La
naturaleza plug-and-play de la plataforma, en la que los equipos pasan de cero a
una observabilidad completa con una configuración mínima, ha sido bien recibida
por los equipos que la adoptan.

## Consejos para otros {#advice-for-others}

A partir de la experiencia de Adobe construyendo un pipeline de observabilidad a
nivel de plataforma:

- **Trata a OpenTelemetry como una plataforma sobre la que construir**: no
  esperes que resuelva todos tus problemas de fábrica. Está diseñado para
  extenderse y personalizarse según tus necesidades específicas.
- **No tengas miedo de construir componentes personalizados**: la arquitectura
  del Collector facilita la creación de extensiones adaptadas a tus necesidades.
- **Diseña para la simplicidad del usuario**: haz que la vía predeterminada
  requiera el mínimo esfuerzo. Los equipos que consumen tu plataforma no son
  expertos en observabilidad.
- **Planifica la visibilidad de errores en collectors encadenados**: el éxito de
  una transacción OTLP no garantiza la entrega de extremo a extremo. Ten en
  cuenta cómo aparecerán los errores ante los usuarios.

## Conclusiones {#takeaways}

La historia de Adobe ilustra cómo un equipo central de observabilidad puede
ofrecer un pipeline de OpenTelemetry escalable y de autoservicio a lo largo de
una organización grande y diversa. Al combinar el Operator, los Helm charts, los
sidecars y los despliegues de collector por señal, han creado una plataforma en
la que los equipos de servicio obtienen observabilidad con un esfuerzo mínimo,
mientras que el equipo de observabilidad conserva el control sobre la
infraestructura centralizada.

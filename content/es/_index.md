---
title: OpenTelemetry
description: El estándar abierto para telemetría
developer_note:
  La macro para los bloques/portada usa como imagen de fondo cualquier archivo
  de imagen que contenga la palabra "background" en su nombre.
default_lang_commit: 3aa0f7a25cd2f7878cad1665e67937c5e9c70694
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    Aprende más
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    Prueba la demo
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="Buscar en la documentación de OpenTelemetry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="Descripción general de OpenTelemetry" %}}

**OpenTelemetry** es un framework de observabilidad de código abierto para
software nativo de la nube. Proporciona un conjunto único de APIs, bibliotecas,
agentes y servicios de recolección para capturar trazas distribuidas y métricas
de aplicaciones.

Construido con base en años de experiencia de los proyectos OpenTracing y
OpenCensus, OpenTelemetry combina las mejores ideas y prácticas de la comunidad.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="Instrumentación independiente de proveedor"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

Instrumenta el código una sola vez usando las APIs y SDKs de OpenTelemetry.
Exporta datos de telemetría a cualquier backend de observabilidad — Jaeger,
Prometheus, proveedores comerciales o una solución propia. Cambia de backend sin
modificar el código de la aplicación.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Señales de observabilidad unificadas"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

Correlaciona trazas, métricas y logs con contexto compartido que fluye a través
de toda la ruta de la solicitud. Obtén una visión completa del comportamiento de
la aplicación en todos los componentes y servicios.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Ejecución en cualquier lugar"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry es 100% código abierto y independiente de proveedor. Permite
desplegar de forma local, en entornos híbridos o en múltiples nubes con total
flexibilidad y sin dependencia de proveedor. Las cargas de trabajo se mueven a
donde sea más conveniente.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="Señales de Observabilidad" >}}
{{< homepage/signal name="Trazas" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Trazas distribuidas {{< /homepage/signal >}}
{{< homepage/signal name="Métricas" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
Mediciones a lo largo del tiempo {{< /homepage/signal >}}
{{< homepage/signal name="Logs" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
Registros con marca temporal {{< /homepage/signal >}}
{{< homepage/signal name="Baggage" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
Metadados contextuales {{< /homepage/signal >}}
{{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="Funcionalidades de OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="Auto-instrumentación" url="/docs/concepts/instrumentation/zero-code/" >}}
Comienza en minutos con instrumentación sin código para frameworks y bibliotecas
populares. Los agentes de instrumentación automática capturan trazas, métricas y
logs sin modificar el código fuente.{{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="Pipeline del Collector" url="/docs/collector/" >}}
Procesa, filtra y enruta datos de telemetría con el OpenTelemetry Collector.
Despliega como agente o gateway para recibir, procesar y exportar telemetría a
escala con más de 200 componentes. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="Propagación de contexto" url="/docs/concepts/context-propagation/" >}}
Correlaciona trazas automáticamente a través de los límites entre servicios. El
contexto distribuido fluye por toda la ruta de la solicitud, conectando logs,
métricas y trazas en una vista unificada. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="Soporte multilenguaje" url="/docs/languages/" >}}
SDKs nativos para 12+ lenguajes, incluyendo Java, Kotlin, Python, Go,
JavaScript, .NET, Ruby, PHP, Rust, C++, Swift, and Erlang. Permite usar el
lenguaje preferido con soporte de primera clase para OpenTelemetry.
{{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="Estable y listo para producción" url="/status/" >}}
Las APIs de trazado y métricas son estables en todos los lenguajes principales.
Miles de organizaciones ejecutan OpenTelemetry en producción. Respaldado por
CNCF y los principales proveedores de nube. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="Especificaciones abiertas" url="/docs/specs/status/" >}}
Construido sobre especificaciones abiertas e independientes de proveedor para
APIs, SDKs y el protocolo de comunicación (OTLP). La gobernanza transparente
bajo CNCF garantiza estabilidad a largo plazo y evolución impulsada por la
comunidad. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="El ecosistema de OpenTelemetry" >}}
{{< homepage/stat type="languages" label="Lenguajes" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="Componentes del Collector" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="Integraciones" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Proveedores" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="Adoptado por líderes de la industria"
    limit="10"
    ctaText="Ver todos los adoptantes"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry es un proyecto [graduado][] de la [CNCF][]**.<br> Se formó a
partir de la fusión de los proyectos OpenTracing y OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduado]: https://www.cncf.io/projects/

{{% /blocks/section %}}

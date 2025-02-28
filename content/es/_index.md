---
title: OpenTelemetry
description: >-
  Telemetría portable, ubicua, y de alta calidad para una observabilidad eficaz
developer_note:
  La macro para los bloques/portada usa como imagen de fondo cualquier archivo
  de imagen que contenga la palabra "background" en su nombre.
show_banner: true
default_lang_commit: 7ac35d6b429165bbe6c28bdd91feeae83fd35142
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{% blocks/cover image_anchor="top" height="max" color="primary" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<div class="l-primary-buttons mt-5">

- [Aprende más](docs/what-is-opentelemetry/)
- [Prueba la demo](docs/demo/)
- [Explora las integraciones](/ecosystem/integrations/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="docs/getting-started/">Tutorial de inicio rápido</a> basado en tu rol
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{% /blocks/cover %}}

{{% blocks/lead color="white" %}}

OpenTelemetry es un conjunto de API, SDK y herramientas. Úsalo para
instrumentar, generar, recopilar y exportar datos de telemetría (métricas, logs
y trazas) para que te ayuden a analizar el rendimiento y comportamiento de tu
aplicación.

> OpenTelemetry está actualmente disponible para
> [varios lenguajes de programación](docs/languages) y puede usarse en entornos
> de producción.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Trazas, métricas y logs"%}}

Genera y recopila datos de telemetría desde tus servicios y aplicaciones y
reenvía los datos a una amplia variedad de herramientas de análisis.
{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Instrumentación fácil de desplegar"%}}

OpenTelemetry se integra con librerías y frameworks populares, tales como
[Spring](https://spring.io),
[ASP.NET Core](https://docs.microsoft.com/aspnet/core),
[Express](https://expressjs.com), [Quarkus](https://quarkus.io) y muchos más.
Instalar e integrar OpenTelemetry puede ser tan sencillo como añadir unas pocas
líneas de código.

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Código abierto, Independiente de proveedores" %}}

100% gratuito y de código abierto, OpenTelemetry es usado y respaldado por
[empresas líderes](/ecosystem/vendors/) en el sector de la observabilidad.

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry es un proyecto [CNCF][] [en incubación][]**.<br> Se formó a
partir de la fusión de los proyectos OpenTracing y OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[en incubación]: https://www.cncf.io/projects/

{{% /blocks/section %}}

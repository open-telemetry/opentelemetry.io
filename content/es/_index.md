---
title: OpenTelemetry
description: >-
  Telemetría portable, ubicua, y de alta calidad para una observabilidad eficaz
developer_note:
  La macro para los bloques/portada usa como imagen de fondo cualquier archivo
  de imagen que contenga la palabra "background" en su nombre.
show_banner: true
default_lang_commit: c0a5eea5d720b0e075efa87f99dcf58c89106268
drifted_from_default: true
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<div class="l-primary-buttons mt-5">

- [Aprende más](docs/what-is-opentelemetry/)
- [Prueba la demo](docs/demo/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="docs/getting-started/">Tutorial de inicio rápido</a> basado en tu rol
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry es un conjunto de API, SDK y herramientas. Úsalo para
instrumentar, generar, recopilar y exportar datos de telemetría (métricas, logs
y trazas) para que te ayuden a analizar el rendimiento y comportamiento de tu
aplicación.

> OpenTelemetry está actualmente [disponible](/status/) para
> [varios lenguajes de programación](docs/languages) y puede usarse en entornos
> de producción.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Trazas, métricas y logs" url="docs/concepts/observability-primer/" %}}

Genera y recopila datos de telemetría desde tus servicios y aplicaciones y
reenvía los datos a una amplia variedad de herramientas de análisis.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Instrumentación & Integraciones listas para usar"%}}

OpenTelemetry [se integra] con muchas librerías y frameworks populares, y admite
la [instrumentación] _manual y sin código_.

[instrumentación]: /docs/concepts/instrumentation/
[se integra]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Código abierto, Independiente de proveedores" %}}

100% gratuito y de código abierto, OpenTelemetry es [adoptado] y respaldado por
[empresas líderes] en el sector de la observabilidad.

[adoptado]: /ecosystem/adopters/
[empresas líderes]: /ecosystem/vendors/

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

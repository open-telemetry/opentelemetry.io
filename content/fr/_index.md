---
title: OpenTelemetry
description: >-
  Une télémétrie de qualité, universelle et portable pour une observabilité efficace
outputs:
  - HTML
  - REDIRECTS # Include this `content/fr` ONLY
developer_note:
  La macro "blocks/cover" définie ci-dessous permet d'utiliser comme image de fond tout visuel contenant "background" dans son nom. 
show_banner: true
default_lang_commit: 90dcedd7f692a505eb86145734b1e323ec988820
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

- [En savoir plus](docs/what-is-opentelemetry/)
- [Tester la démo](docs/demo/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="docs/getting-started/">Découvrez OpenTelemetry</a> en tant que:
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry met à votre disposition un ensemble d'APIs, de SDKs et d'outils vous permettant d'instrumenter, de générer, de collecter et d'exporter des métriques, des logs et des traces (les "données de télémétrie") pour analyser la performance et le comportement de vos logiciels.

>  OpenTelemetry [supporte](/status/) de nombreux [langages](docs/languages/) et peut être utilisé en production.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs" url="docs/concepts/observability-primer/" %}}

Créez et collectez des données de télémétrie pour vos services et vos logiciels, transmettez-les à une multitude d'outils d'analyse.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title=" Instrumentation & Intégrations clé en main" %}}

OpenTelemetry [s'intègre] avec de nombreux librairies et frameworks et propose une [instrumentation] _code et no-code_ .

[instrumentation]: /docs/concepts/instrumentation/
[s'intègre]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Indépendant" %}}

Entièrement gratuit et open source, OpenTelemetry est [utilisé] et supporté par les [leaders] sur le marché de l'observabilité.

[utilisé]: /ecosystem/adopters/
[leaders]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry est un projet [CNCF][] en phase d'[incubation]**.<br> Né de la fusion des projets OpenTracing et OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubation]: https://www.cncf.io/projects/

{{% /blocks/section %}}

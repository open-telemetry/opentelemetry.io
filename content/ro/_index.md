---
title: OpenTelemetry
description: >-
  High-quality, ubiquitous, and portable telemetry to enable effective
  observability
outputs:
  - HTML
  # Include the following for `content/en` ONLY
  - REDIRECTS
  - RSS
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
show_banner: true
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

- [Află mai multe] [Learn more](docs/what-is-opentelemetry/)
- [Încearcă demo-ul] [Try the demo](docs/demo/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="docs/getting-started/">Începe</a> în funcție de rolul tău
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry este o colecție de API-uri, SDK-uri și instrumente. Folosește-o pentru a instrumenta,
genera, colecta și exporta date de telemetrie (metrici, jurnale și urme) pentru a te ajuta
să analizezi performanța și comportamentul software-ului tău.


> OpenTelemetry este [disponibil în general] [generally available](/status/) în
> [mai multe limbi] [several languages](docs/languages/) și este potrivit pentru a fi utilizat în producție.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs" url="docs/concepts/observability-primer/" %}}

Crează și colectează date telemetrice de la serviciile tale și de la software-ul tău, apoi transmite-le către o varietate de instrumente de analiză.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-in Instrumentation & Integrations" %}}

OpenTelemetry se [integrează] [integrates] cu multe biblioteci și framework-uri, și
suportă [instrumentarea] [instrumentation] _bazată pe cod și zero-code_ .

[instrumentare] [instrumentation]: /docs/concepts/instrumentation/
[integrează] [integrates]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Vendor Neutral" %}}

100% gratuit și open source, OpenTelemetry este [adoptat] [adopted] și susținut de [lideri din industrie] [industry
leaders] din domeniul observabilității.

[adoptat] [adopted]: /ecosystem/adopters/
[lideri din industrie] [industry leaders]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry este un proiect [CNCF][] de [incubare] [incubating][]**.<br> Format printr-o
fuziune alte proiectelor OpenTracing și OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}

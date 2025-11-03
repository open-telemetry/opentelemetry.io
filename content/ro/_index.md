---
title: OpenTelemetry
description: >-
  Telemetrie de înaltă calitate, omniprezentă și portabilă pentru a permite o
  observabilitate eficientă
outputs:
  - HTML
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
show_banner: true
default_lang_commit: 493a530efd3c2a058cc4aa055d7c8aadb5348beb
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

- [Află mai multe](docs/what-is-opentelemetry/)
- [Încearcă demo-ul](docs/demo/)

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

OpenTelemetry este o colecție de API-uri, SDK-uri și instrumente. Folosește-o
pentru a instrumenta, genera, colecta și exporta date de telemetrie (metrici,
jurnale și urme) pentru a te ajuta să analizezi performanța și comportamentul
software-ului tău.

> OpenTelemetry este [disponibil în general](/status/) în
> [mai multe limbi](docs/languages/) și este potrivit pentru a fi utilizat în
> producție.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs" url="docs/concepts/observability-primer/" %}}

Creează și colectează date telemetrice de la serviciile tale și de la
software-ul tău, apoi transmite-le către o varietate de instrumente de analiză.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-in Instrumentation & Integrations" %}}

OpenTelemetry [se integrează] cu multe biblioteci și framework-uri, și suportă
[instrumentarea] _bazată pe cod și zero-code_ .

[instrumentarea]: /docs/concepts/instrumentation/
[se integrează]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Vendor Neutral" %}}

100% gratuit și open source, OpenTelemetry este [adoptat] și susținut de [lideri
din industrie] din domeniul observabilității.

[adoptat]: /ecosystem/adopters/
[lideri din industrie]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry este un proiect [CNCF][] de [incubare][]**.<br> Format printr-o
fuziune alte proiectelor OpenTracing și OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubare]: https://www.cncf.io/projects/

{{% /blocks/section %}}

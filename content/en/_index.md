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

- [Learn more](docs/what-is-opentelemetry/)
- [Try the demo](docs/demo/)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="docs/getting-started/">Get started</a> based on your role
</div>
<div class="l-get-started-buttons">

- [Dev](docs/getting-started/dev/)
- [Ops](docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry is a collection of APIs, SDKs, and tools. Use it to instrument,
generate, collect, and export telemetry data (metrics, logs, and traces) to help
you analyze your software's performance and behavior.

> OpenTelemetry is [generally available](/status/) across
> [several languages](docs/languages/) and is suitable for production use.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs" url="docs/concepts/observability-primer/" %}}

Create and collect telemetry from your services and software, then forward it to
a variety of analysis tools.

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-in Instrumentation & Integrations" %}}

OpenTelemetry [integrates] with many popular libraries and frameworks, and
supports _code-based and zero-code_ [instrumentation].

[instrumentation]: /docs/concepts/instrumentation/
[integrates]: /ecosystem/integrations/

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Vendor Neutral" %}}

100% free and open source, OpenTelemetry is [adopted] and supported by [industry
leaders] in the observability space.

[adopted]: /ecosystem/adopters/
[industry leaders]: /ecosystem/vendors/

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry is a [CNCF][] [incubating][] project**.<br> Formed through a
merger of the OpenTracing and OpenCensus projects.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}

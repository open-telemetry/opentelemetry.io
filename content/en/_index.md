---
title: OpenTelemetry
description: >-
  High-quality, ubiquitous, and portable telemetry to enable effective
  observability
outputs:
  - HTML
  - REDIRECTS # Include this `content/en` ONLY
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
show_banner: true
limit_banner: 2 # Default to 2, adjust as needed
banners:
  - message:
      '<i class="fas fa-bullhorn"></i> Join us for [**OTel Community Day** on
      June
      25th](https://events.linuxfoundation.org/open-telemetry-community-day/)!'
    to: 2024-06-25
  - message:
      '<i class="fas fa-bullhorn"></i> Help improve OTel and Prometheus
      interoperability: [complete our
      survey](https://forms.gle/bZAG9f7udoJsjZUG9) by May 31'
    to: 2024-05-31
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

- [Learn more](/docs/what-is-opentelemetry/)
- [Try the demo](/docs/demo/)
- [Explore integrations](/ecosystem/integrations)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="/docs/getting-started/">Get started</a> based on your role
</div>
<div class="l-get-started-buttons">

- [Dev](/docs/getting-started/dev/)
- [Ops](/docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry is a collection of APIs, SDKs, and tools. Use it to instrument,
generate, collect, and export telemetry data (metrics, logs, and traces) to help
you analyze your software's performance and behavior.

> OpenTelemetry is **generally available** across
> [several languages](/docs/languages/) and is suitable for use.

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs"%}}

Create and collect telemetry data from your services and software, then forward
them to a variety of analysis tools. {{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-In Instrumentation"%}}

OpenTelemetry integrates with popular libraries and frameworks such as
[Spring](https://spring.io),
[ASP.NET Core](https://docs.microsoft.com/aspnet/core),
[Express](https://expressjs.com), [Quarkus](https://quarkus.io), and more!
Installation and integration can be as simple as a few lines of code.

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Vendor Neutral" %}}

100% Free and Open Source, OpenTelemetry is adopted and supported by
[industry leaders](/ecosystem/vendors/) in the observability space.

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

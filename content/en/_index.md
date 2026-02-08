---
NOTE_TO_LOCALE_AUTHORS: |
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
title: OpenTelemetry
description: >-
  The open standard for software telemetry
outputs:
  - HTML
  # Include the following for `content/en` ONLY
  - REDIRECTS
  - RSS
developer_note: >
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
show_banner: true
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< homepage/hero color="white" useLogo="true" background="/img/homepage/highlight.png" tagline="The open standard for software telemetry" >}}

<div class="l-primary-buttons">

- [Learn more](docs/what-is-opentelemetry/)
- [Try the demo](docs/demo/)

</div>

{{< /homepage/hero >}}

{{< homepage/hero-search color="light" placeholder="Search OpenTelemetry docs..." >}}
{{< /homepage/hero-search >}}

{{< homepage/intro-section color="white" >}}

<div class="intro-text">

Understanding how software behaves in production requires consistent, reliable
telemetry. **OpenTelemetry** is the open standard that provides it.

It gives you instrumentation tools (APIs, SDKs, and auto-instrumentation
agents) to generate traces, metrics, and logs; semantic conventions that ensure
your telemetry has a consistent, well-defined shape; a wire protocol (OTLP) for
interoperability across tools; and the Collector, a pipeline for processing and
routing telemetry to any modern backend.

</div>

<div class="intro-image">
  <img src="/img/homepage/collector-pipeline.svg" alt="OpenTelemetry overview" class="img-fluid">
</div>

{{< /homepage/intro-section >}}

{{< homepage/main-features color="light" >}}

{{< homepage/main-feature
      title="Stable instrumentation, flexible destinations"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" >}} OpenTelemetry gives your applications a stable
instrumentation layer built on open standards. Where the data goes is a
configuration choice, not a code change. Today's backend doesn't have to be
tomorrow's. {{< /homepage/main-feature >}}

{{< homepage/main-feature
      title="Signals that make sense together"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" >}} Traces, metrics, and logs are designed to work
together. Shared context connects them, so a latency spike in a metric leads
you to the trace that pinpoints the slow query and the log that explains why.
{{< /homepage/main-feature >}}

{{< homepage/main-feature
      title="Open source, community-driven"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" >}} OpenTelemetry is 100% open source, hosted by the
CNCF, and built by contributors from across the industry. No single company
controls the roadmap. The community does. {{< /homepage/main-feature >}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="Telemetry Signals" >}}
{{< homepage/signal name="Traces" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Distributed traces {{< /homepage/signal >}}
{{< homepage/signal name="Metrics" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
Measurements over time {{< /homepage/signal >}}
{{< homepage/signal name="Logs" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
Timestamped records {{< /homepage/signal >}}
{{< homepage/signal name="Profiles" image="/img/homepage/signal-profiles.svg" url="/docs/concepts/signals/profiles/" >}}
Continuous profiling (coming soon) {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{% blocks/section color="yellow" %}}

<div class="text-center">

<h2>Ready to instrument your first application?</h2>

<div class="l-primary-buttons">

- [Get started](/docs/getting-started/)

</div>

</div>

{{% /blocks/section %}}

{{< homepage/otel-features color="white" title="Standards" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="Semantic conventions" url="/docs/specs/semconv/" >}}
A shared vocabulary that defines how telemetry data is structured. Attribute
names, units, and signal shapes are consistent across languages, frameworks, and
teams. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="OTLP" url="/docs/specs/otlp/" >}}
The OpenTelemetry Protocol is the standard wire format for transmitting
telemetry. Any tool that speaks OTLP can interoperate with any other, no
adapters needed. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/otel-features color="white" title="Instrumentation" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="APIs and SDKs" url="/docs/languages/" >}}
Instrument your applications using stable, well-documented APIs available in 11+
languages. Add traces, metrics, and logs with fine-grained control over what you
capture. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="Auto-instrumentation" url="/docs/concepts/instrumentation/zero-code/" >}}
Get started in minutes with zero-code instrumentation for popular frameworks and
libraries. Automatic agents capture telemetry without modifying your source
code. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/otel-features color="white" title="Collection" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="Collector" url="/docs/collector/" >}}
A standalone pipeline for receiving, processing, and exporting telemetry data.
Deploy as an agent or gateway, with hundreds of components for routing data
wherever it needs to go. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats color="light" title="The OpenTelemetry Ecosystem" >}}
{{< homepage/stat type="languages" label="Languages" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="Collector Components" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="Integrations" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Vendors" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    color="white"
    title="Trusted by Industry Leaders"
    limit="10"
    ctaText="View all adopters"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg

{{% /blocks/section %}}

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
developer_note: >
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
show_banner: true
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< blocks/hero-split color="primary" image="/img/homepage/Highlight.svg" imageAlt="OpenTelemetry illustration" title="OpenTelemetry" tagline="High-quality, ubiquitous, and portable telemetry to enable effective observability" >}}

<div class="l-primary-buttons">

- [Learn more](docs/what-is-opentelemetry/)
- [Try the demo](docs/demo/)

</div>

{{< /blocks/hero-split >}}

{{< blocks/hero-search color="white" placeholder="Search docs or ask AI..." >}}
Try: "How do I instrument a Python app?" or "What is the Collector?"
{{< /blocks/hero-search >}}

{{< blocks/intro-section color="white" >}}

<div class="intro-text">

**[OpenTelemetry](/docs/what-is-opentelemetry/)**, also known as OTel, is an
open source observability framework for cloud native software. It provides a
single set of APIs, libraries, agents, and collector services to capture
distributed traces and metrics from your application.

OpenTelemetry builds upon years of experience from the OpenTracing and
OpenCensus projects, combined with best-of-breed ideas and practices from the
community.

</div>

<div class="intro-image">
  <img src="/img/homepage/Img-01.svg" alt="OpenTelemetry overview" class="img-fluid">
</div>

{{< /blocks/intro-section >}}

{{< blocks/main-features color="light" >}}

{{< blocks/main-feature
      title="Vendor-neutral instrumentation"
      image="/img/homepage/Img-02.svg"
      imagePosition="left" >}} Instrument your code once using OpenTelemetry
APIs and SDKs. Export telemetry data to any observability backend—Jaeger,
Prometheus, commercial vendors, or your own solution. Switch backends without
touching your application code. {{< /blocks/main-feature >}}

{{< blocks/main-feature
      title="Unified observability signals"
      image="/img/homepage/Img-03.svg"
      imagePosition="right" >}} Correlate traces, metrics, and logs with shared
context that flows through your entire request path. Get a complete picture of
your application's behavior across all components and services.
{{< /blocks/main-feature >}}

{{< blocks/main-feature
      title="Run OTel anywhere"
      image="/img/homepage/Img-04.svg"
      imagePosition="left" >}} OpenTelemetry is 100% open source and
vendor-neutral. Deploy on-premises, in hybrid environments, or across multiple
clouds with full flexibility and zero lock-in. Move workloads wherever they
matter to you. {{< /blocks/main-feature >}}

{{< /blocks/main-features >}}

{{< blocks/signals-showcase title="Observability Signals" >}}
{{< blocks/signal name="Traces" icon="project-diagram" url="/docs/concepts/signals/traces/" >}}
Distributed traces {{< /blocks/signal >}}
{{< blocks/signal name="Metrics" icon="chart-bar" url="/docs/concepts/signals/metrics/" >}}
Measurements over time {{< /blocks/signal >}}
{{< blocks/signal name="Logs" icon="file-alt" url="/docs/concepts/signals/logs/" >}}
Timestamped records {{< /blocks/signal >}}
{{< blocks/signal name="Baggage" icon="suitcase" url="/docs/concepts/signals/baggage/" >}}
Contextual metadata {{< /blocks/signal >}} {{< /blocks/signals-showcase >}}

{{< blocks/otel-features color="white" title="OpenTelemetry Features" columns="2" >}}

{{< blocks/otel-feature icon="magic" title="Auto-instrumentation" url="/docs/concepts/instrumentation/zero-code/" >}}
Get started in minutes with zero-code instrumentation for popular frameworks and
libraries. Automatic instrumentation agents capture traces, metrics, and logs
without modifying your source code. {{< /blocks/otel-feature >}}

{{< blocks/otel-feature icon="timeline" title="Collector pipeline" url="/docs/collector/" >}}
Process, filter, and route telemetry data with the OpenTelemetry Collector.
Deploy as an agent or gateway to receive, process, and export telemetry at scale
with 200+ components. {{< /blocks/otel-feature >}}

{{< blocks/otel-feature icon="link" title="Context propagation" url="/docs/concepts/context-propagation/" >}}
Automatically correlate traces across service boundaries. Distributed context
flows through your entire request path, connecting logs, metrics, and traces
into a unified view. {{< /blocks/otel-feature >}}

{{< blocks/otel-feature icon="code" title="Multi-language support" url="/docs/languages/" >}}
Native SDKs for 11+ languages including Java, Python, Go, JavaScript, .NET,
Ruby, PHP, Rust, C++, Swift, and Erlang. Use your preferred language with
first-class OpenTelemetry support. {{< /blocks/otel-feature >}}

{{< blocks/otel-feature icon="shield-alt" title="Stable and production-ready" url="/status/" >}}
Tracing and metrics APIs are stable across all major languages. Thousands of
organizations run OpenTelemetry in production. Backed by the CNCF and major
cloud providers. {{< /blocks/otel-feature >}}

{{< blocks/otel-feature icon="book" title="Open specifications" url="/docs/specs/status/" >}}
Built on open, vendor-neutral specifications for APIs, SDKs, and the wire
protocol (OTLP). Transparent governance under the CNCF ensures long-term
stability and community-driven evolution. {{< /blocks/otel-feature >}}

{{< /blocks/otel-features >}}

{{< blocks/ecosystem-stats color="dark" title="The OpenTelemetry Ecosystem" >}}
{{< blocks/stat type="languages" label="Languages" url="/docs/languages/" >}}
{{< blocks/stat type="collector" label="Collector Components" url="/docs/collector/" >}}
{{< blocks/stat type="registry" label="Integrations" url="/ecosystem/registry/" >}}
{{< blocks/stat type="vendors" label="Vendors" url="/ecosystem/vendors/" >}}
{{< /blocks/ecosystem-stats >}}

{{< blocks/adopters-showcase
    color="light"
    title="Trusted by Industry Leaders"
    limit="12"
    ctaText="View all adopters"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry is a [CNCF][] [incubating][] project**.<br> Formed through a
merger of the OpenTracing and OpenCensus projects.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}

---
NOTE_TO_LOCALE_AUTHORS: |
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
  DO NOT PORT THE CHANGES TO THIS PAGE UNTIL EN MAINTAINERS REMOVE THIS COMMENT
title: OpenTelemetry
description: The open standard for telemetry
outputs:
  - HTML
  # Include the following for `content/en` ONLY
  - REDIRECTS
  - RSS
developer_note: >
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
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
    Learn More
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    Try the demo
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="Search OpenTelemetry docs..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="OpenTelemetry overview" %}}

**OpenTelemetry** is an open source observability framework for cloud native
software. It provides a single set of APIs, libraries, agents, and collector
services to capture distributed traces and metrics from your application.

OpenTelemetry builds upon years of experience from the OpenTracing and
OpenCensus projects, combined with best-of-breed ideas and practices from the
community.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="Vendor-neutral instrumentation"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

Instrument your code once using OpenTelemetry APIs and SDKs. Export telemetry
data to any observability backend—Jaeger, Prometheus, commercial vendors, or
your own solution. Switch backends without touching your application code.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Unified observability signals"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

Correlate traces, metrics, and logs with shared context that flows through your
entire request path. Get a complete picture of your application's behavior
across all components and services.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Run anywhere"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry is 100% open source and vendor-neutral. Deploy on-premises, in
hybrid environments, or across multiple clouds with full flexibility and zero
lock-in. Move workloads wherever they matter to you.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="Observability Signals" >}}
{{< homepage/signal name="Traces" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Distributed traces {{< /homepage/signal >}}
{{< homepage/signal name="Metrics" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
Measurements over time {{< /homepage/signal >}}
{{< homepage/signal name="Logs" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
Timestamped records {{< /homepage/signal >}}
{{< homepage/signal name="Baggage" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
Contextual metadata {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="OpenTelemetry Features" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="Auto-instrumentation" url="/docs/concepts/instrumentation/zero-code/" >}}
Get started in minutes with zero-code instrumentation for popular frameworks and
libraries. Automatic instrumentation agents capture traces, metrics, and logs
without modifying your source code. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="Collector pipeline" url="/docs/collector/" >}}
Process, filter, and route telemetry data with the OpenTelemetry Collector.
Deploy as an agent or gateway to receive, process, and export telemetry at scale
with 200+ components. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="Context propagation" url="/docs/concepts/context-propagation/" >}}
Automatically correlate traces across service boundaries. Distributed context
flows through your entire request path, connecting logs, metrics, and traces
into a unified view. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="Multi-language support" url="/docs/languages/" >}}
Native SDKs for 12+ languages including Java, Kotlin, Python, Go, JavaScript,
.NET, Ruby, PHP, Rust, C++, Swift, and Erlang. Use your preferred language with
first-class OpenTelemetry support. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="Stable and production-ready" url="/status/" >}}
Tracing and metrics APIs are stable across all major languages. Thousands of
organizations run OpenTelemetry in production. Backed by the CNCF and major
cloud providers. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="Open specifications" url="/docs/specs/status/" >}}
Built on open, vendor-neutral specifications for APIs, SDKs, and the wire
protocol (OTLP). Transparent governance under the CNCF ensures long-term
stability and community-driven evolution. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="The OpenTelemetry Ecosystem" >}}
{{< homepage/stat type="languages" label="Languages" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="Collector Components" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="Integrations" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Vendors" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="Trusted by Industry Leaders"
    limit="10"
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

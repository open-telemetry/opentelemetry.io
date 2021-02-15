---
Title: "Releases"
menu:
  main:
    weight: 30
---

<a class="td-offset-anchor"></a>
<section class="row td-box td-box--1 position-relative td-box--gradient td-box--height-auto">
  <div class="container text-center td-arrow-down">
    <h1>OpenTelemetry Tracing Specification now 1.0!</h1>
    <span class="h4 mb-0">
      <p>Our goal is to provide a generally available, production quality
      release for the tracing data source across most OpenTelemetry components
      in the first half of 2021. Several components have already reached this
      milestone! We expect metrics to reach the same status in the second half
      of 2021 and are targeting logs in 2022.</p>
    </span>
  </div>
</section>

{{% blocks/section type="section" color="dark" %}}
## Project Status
The OpenTelemetry project consists of multiple
[components](../docs/concepts/components/) that support multiple [data
sources](../docs/concepts/data-sources/). Each component defines its own
versioning and stability guarantees. These guarantees may be data source
specific.

- The OpenTelemetry project provides [language independent interface
types](https://github.com/open-telemetry/opentelemetry-proto). [Maturity
levels](https://github.com/open-telemetry/opentelemetry-proto#maturity-level)
are defined and specified for the available encodings.
- The OpenTelemetry
[specification](https://github.com/open-telemetry/opentelemetry-specification)
defines [versioning and
stability](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)
guarantees.
- Instrumentation libraries are language-specific implementations that each
  release at their own cadence while adhering to the OpenTelemetry
  specification and [versioning
  schema](https://github.com/open-telemetry/opentelemetry-specification/blob/9047c91412d3d4b7f28b0f7346d8c5034b509849/specification/versioning-and-stability.md#version-numbers).
- The OpenTelemetry Collector also adheres to the OpenTelemetry specification and
versioning schema.

{{% /blocks/section %}}

<section class="row td-box">
  <div class="col">
    <div class="row section">
      <h2>Latest Releases</h2>
      {{< release_notes >}}
    </div>
  </div>
</section>
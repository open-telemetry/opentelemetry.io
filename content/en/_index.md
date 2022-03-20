---
title: OpenTelemetry
show_banner: true
mission_url: https://github.com/open-telemetry/community/blob/main/mission-vision-values.md#otel-mission-vision-and-values
---

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}
<img src="/img/logos/opentelemetry-horizontal-color.svg" class="otel-logo" alt="OpenTelemetry"/>
<h1>High-quality, ubiquitous, and portable telemetry to enable effective observability</h1>

<div class="l-primary-buttons mt-5">

- [Learn more]({{< relref "/docs/concepts" >}})
- <a href="{{<param mission_url >}}" target="_blank" rel="noopener">Mission and vision</a>
</div>

<div class="h3 mt-4">Get started!</div>
<div class="l-get-started-buttons">

- [Collector]({{< relref "/docs/collector/getting-started" >}})
- [Java]({{< relref "/docs/instrumentation/java/" >}})
- [Go]({{< relref "/docs/instrumentation/go/getting-started" >}})
- [.NET]({{< relref "/docs/instrumentation/net/getting-started" >}})
- [JavaScript]({{< relref "/docs/instrumentation/js/getting-started" >}})
- [<i class="fas fa-ellipsis-h"></i>]({{< relref "/docs/instrumentation" >}})
</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}
OpenTelemetry is a collection of tools, APIs, and SDKs. Use it to instrument,
generate, collect, and export telemetry data (metrics, logs, and traces) to
help you analyze your software's performance and behavior.

> OpenTelemetry is in **beta** across several languages and is suitable for use.
We anticipate general availability soon.
{{% /blocks/lead %}}

{{% blocks/section color="dark" %}}

{{% blocks/feature icon="fas fa-chart-line" title="Traces, Metrics, Logs"%}}
Create and collect telemetry data from your services and software, then forward them to a variety of analysis tools.
{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="Drop-In Instrumentation"%}}
OpenTelemetry integrates with popular libraries and frameworks such as [Spring](https://spring.io/), [ASP.NET Core](https://docs.microsoft.com/aspnet/core), [Express](https://expressjs.com/), [Quarkus](https://quarkus.io/), and more! Installation and integration can be as simple as a few lines of code.
{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="Open Source, Vendor Neutral" url="https://github.com/open-telemetry"%}}
100% Free and Open Source, OpenTelemetry is adopted and supported by [industry leaders](/vendors) in the observability space.
{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" %}}
<div id="cncf">

**OpenTelemetry is a [CNCF][] [incubating][] project**.

Formed through a merger of the OpenTracing and OpenCensus projects.

[![CNCF logo][]][CNCF]

[CNCF]: https://cncf.io/
[CNCF logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/
</div>
{{% /blocks/section %}}

---
title: OpenTelemetry
show_banner: true
---

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}
<img src="/img/logos/opentelemetry-horizontal-color.svg" class="otel-logo" />
<h1>High-quality, ubiquitous, and portable telemetry to enable effective observability</h1>
<a
	class="btn btn-lg btn-primary font-weight-bold mt-5 my-4"
	href="https://github.com/open-telemetry/community/blob/main/mission-vision-values.md#readme"
>
Our Mission and Vision
</a>
<div class="h3 mt-2">Get started!</div>

<div class="l-get-started-buttons">

- [Key Concepts]({{< relref "/docs/concepts" >}})
- [Collector]({{< relref "/docs/collector/getting-started" >}})
- [Go]({{< relref "/docs/go/getting-started" >}})
- [.NET]({{< relref "/docs/net/getting-started" >}})
- [JavaScript]({{< relref "/docs/js/getting-started" >}})
- [<i class="fas fa-ellipsis-h"></i>]({{< relref "docs" >}})
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

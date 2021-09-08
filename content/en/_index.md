---
title: "OpenTelemetry"
---

{{< blocks/cover title="" image_anchor="center" height="min" color="dark" >}}
<div class="mx-auto">
    <div class="col-sm-5 offset-sm-7 card bg-transparent border-0">
      <img class="card-img-top mx-auto" src="/img/logos/opentelemetry-stacked-color.png">
      <div class="card-body">
        <h3 class="card-title text-left">An observability framework for cloud-native software.</h3>
        <p class="card-text text-left"><small>OpenTelemetry is a collection of tools, APIs, and SDKs. You can use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) for analysis in order to understand your software's performance and behavior.</small></p>
      </div>
    </div>
  <br/>
  <div class="card-group">
    <div class="card bg-primary">
      <div class="card-body">
        <h4 class="card-title">Broad Language Support</h4>
        <p>Java | C# | Go | JavaScript | Python | Rust | C++ | Erlang/Elixir</p>
      </div>
      <div class="card-footer bg-transparent">
        <a class="btn btn-lg btn-primary" href="{{< relref "/docs" >}}">
          Get Started <i class="fas fa-arrow-alt-circle-right ml-2"></i>
        </a>
      </div>
    </div>
    <div class="card bg-secondary">
      <div class="card-body">
        <h4 class="card-title">Integrates With Popular Frameworks and Libraries</h4>
        <p>MySQL | Redis | Django | Kafka | Jetty | Akka | RabbitMQ | Spring | Quarkus | Flask | net/http | gorilla/mux | WSGI | JDBC | PostgreSQL</p>
      </div>
      <div class="card-footer bg-transparent">
        <a class="btn btn-lg btn-secondary" href="https://github.com/open-telemetry">
          Find Projects <i class="fab fa-github ml-2"></i>
        </a>
      </div>
    </div>
  </div>
  <div class="mx-auto mt-5">
    {{< blocks/link-down color="primary" >}}
  </div>
</div>
{{< /blocks/cover >}}

{{% blocks/lead color="primary" %}}
OpenTelemetry is in **beta** across several languages and is suitable for use. We anticipate general availability soon.
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

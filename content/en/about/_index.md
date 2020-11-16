---
Title: "About"
linkTitle: About
menu:
  main:
    weight: 10
layout: docs
---

{{% blocks/cover title="About OpenTelemetry" height="auto" %}}

OpenTelemetry is an observability framework - software and tools that assist in generating and capturing telemetry data from cloud-native software.

{{% /blocks/cover %}}

{{% blocks/section type="section" color="primary" %}}
## What is an Observability Framework?
OpenTelemetry provides the libraries, agents, and other components that you need to capture telemetry from your services so that you can better observe, manage, and debug them. 
Specifically, OpenTelemetry captures metrics, distributed traces, resource metadata, and logs (logging support is incubating now) from your backend and client applications and then sends this data to backends like Prometheus, Jaeger, Zipkin, [and others](https://opentelemetry.io/registry/?s=exporter) for processing. OpenTelemetry is composed of the following:

- One API and SDK per language, which include the interfaces and implementations that  define and create distributed traces and metrics, manage sampling and context propagation, etc.
- Language-specific integrations for popular web frameworks, storage clients, RPC libraries, etc. that (when enabled) automatically capture relevant traces and metrics and handle context propagation
- Automatic instrumentation agents that can collect telemetry from some applications without requiring code changes
- Language-specific exporters that allow SDKs to send captured traces and metrics to any supported backends
- The OpenTelemetry Collector, which can collect data from OpenTelemetry SDKs and other sources, and then export this telemetry to any supported backend

OpenTelemetry is a [CNCF Sandbox](https://www.cncf.io/sandbox-projects/) member, formed through a merger of the [OpenTracing](https://www.opentracing.io) and [OpenCensus](https://www.opencensus.io) projects.

{{% /blocks/section %}}

{{% blocks/section type="section" color="white" %}}

## Status
Most OpenTelemetry components are already in [beta](/project-status) and are proceeding to GA release candidates.

## FAQ
### What is Observability?
In software, observability typically refers to telemetry produced by **services** and is often divided into three major verticals:

* [**Tracing**](/docs/concepts/data-sources/#traces), aka **distributed tracing**, provides insight into the full lifecycles, aka *traces*, of requests to the system, allowing you to pinpoint failures and performance issues.  
* [**Metrics**](/docs/concepts/data-sources/#metrics) provide quantitative information about processes running inside the system, including counters, gauges, and histograms.
* [**Logging**](https://en.wikipedia.org/wiki/Log_file) provides insight into application-specific messages emitted by processes.

These verticals are tightly interconnected. **Metrics** can be used to pinpoint, for example, a subset of misbehaving **traces**. **Logs** associated with those traces could help to find the root cause of this behavior. And then new **metrics** can be configured, based on this discovery, to catch this issue earlier next time. Other verticals exist (continuous profiling, production debugging, etc.), however traces, metrics, and logs are the three most well adopted across the industry.

OpenTelemetry will not initially support logging, though we aim to incorporate this over time.

### Where can I read the OpenTelemetry specification?
The spec is available in the [open-telemetry/specification](https://github.com/open-telemetry/specification) repo on GitHub.

### I want to help influence the future direction of cloud-native telemetry. What should I do?
Excellent! We list the best ways to get involved on our [community GitHub page](https://github.com/open-telemetry/community#get-involved), including mailing lists, our Gitter channels, the community calendar, and the monthly community meeting.

### Can I reuse the content on this site for training or educational purposes?

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

{{% /blocks/section %}}


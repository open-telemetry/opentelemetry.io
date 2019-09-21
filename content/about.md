---
Title: "About"
---

OpenTelemetry is an open source observability framework. It is a [CNCF Sandbox](https://www.cncf.io/sandbox-projects/) member, formed through a merger of the [OpenTracing](https://www.opentracing.io) and [OpenCensus](https://www.opencensus.io) projects. The goal of OpenTelemetry is to provide a general-purpose API, SDK, and related tools required for the instrumentation of cloud-native software, frameworks, and libraries. 

## What is Observability?
The term [**observability**](https://en.wikipedia.org/wiki/Observability) stems from the discipline of [control theory](https://en.wikipedia.org/wiki/Control_theory) and refers to how well a system can be understood on the basis of the **telemetry** that it produces.

In software, observability typically refers to telemetry produced by **services** and is divided into three major verticals:

* [**Tracing**](https://opentracing.io/docs/overview/what-is-tracing), aka **distributed tracing**, provides insight into the full lifecycles, aka *traces*, of requests to the system, allowing you to pinpoint failures and performance issues.  
* [**Metrics**](https://opencensus.io/stats) provide quantitative information about processes running inside the system, including counters, gauges, and histograms.
* [**Logging**](https://en.wikipedia.org/wiki/Log_file) provides insight into application-specific messages emitted by processes.

These verticals are tightly interconnected. **Metrics** can be used to pinpoint, for example, a subset of misbehaving **traces**. **Logs** associated with those traces could help to find the root cause of this behavior. And then new **metrics** can be configured, based on this discovery, to catch this issue earlier next time.

OpenTelemetry is an effort to combine all three verticals into a single set of system components and language-specific telemetry libraries. It is meant to replace both the [OpenTracing](https://opentracing.io) project, which focused exclusively on tracing, and the [OpenCensus](https://opencensus.io) project, which focused on tracing and metrics.

OpenTelemetry will not initially support logging, though we aim to incorporate this over time.

## FAQ
### What does OpenTelemetry include?
OpenTelemetry is made up of an integrated set of APIs and libraries as well as a collection mechanism via an agent and collector. These components are used to generate, collect, and describe telemetry about distributed systems. This data includes basic context propagation, distributed traces, metrics, and other signals in the future. OpenTelemetry is designed to make it easy to get critical telemetry data out of your services and into your backend(s) of choice. For each supported language it offers a single set of APIs, libraries, and data specifications, and developers can take advantage of whichever components they see fit.

### Where can I read the OpenTelemetry specification?
The spec is available in the [open-telemetry/specification](https://github.com/open-telemetry/specification) repo on GitHub.

### What's the current status of the OpenTelemetry Project?
You can see our current status at the [release calendar](/release-calendar).

### I want to help influence the future direction of cloud-native telemetry. What should I do?
Excellent! The OpenTelemetry community repo has the full details, but here are a few good starting points: - Join our community mailing list - Keep up to date with the OpenTelemetry blog - We also have a very active chatroom on Gitter - All project meetings are shared on the public calendar (web, gCal, iCal), and we recommend attending the monthly community meeting - If your contributions will be focused on a particular language or feature area, join the special interest group leading its development

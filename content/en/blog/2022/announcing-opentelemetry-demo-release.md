---
title: OpenTelemetry Demo now Generally Available!
linkTitle: Demo GA Release
date: 2022-10-24
author: Austin Parker
---

Earlier this year, we announced a project to build an
[OpenTelemetry Demo](/blog/2022/demo-announcement/), representing the breadth of
OpenTelemetry features and languages. Today, the
[Demo SIG](https://cloud-native.slack.com/archives/C03B4CWV4DA) is proud to
announce
[OpenTelemetry Demo v1.0](https://github.com/open-telemetry/opentelemetry-demo/tree/v1.0.0)!
With this demo, you’ll be able to quickly run a complete end-to-end distributed
system instrumented with 100% OpenTelemetry Traces and Metrics.

![The system architecture of the demo application represented as directed acyclic graph in Jaeger UI](https://user-images.githubusercontent.com/47896520/196496223-6d6ea729-5bea-4a8c-a2c6-cd51cce386ae.png)

One of our primary goals of this project has been to create a robust sample
application for developers to use in learning OpenTelemetry, and we’re proud to
say that we’ve done just that. Every OpenTelemetry language SDK except Swift is
[represented](/docs/demo/service-table/) in this release -- yes, even PHP! We’ve
built complete [tracing flows](/docs/demo/trace-features/) that demonstrate a
breadth of common instrumentation tasks such as:

- Enriching spans from automatic instrumentation.
- Creating custom spans for richer, more useful traces.
- Propagating trace context automatically and manually.
- Handling observability baggage in order to pass attributes between services.
- Creating attributes, events, and other telemetry metadata.

We’ve also integrated OpenTelemetry Metrics across
[several services](/docs/demo/metric-features/) to capture runtime and business
metric use cases.

Now, it’d be enough to just provide a great demonstration of OpenTelemetry, but
one thing we wanted to focus on for our 1.0 release was showing not just the
‘how’, but the ‘why’, of OpenTelemetry. To that end, we’ve built a framework for
implementing [failure scenarios](/docs/demo/#scenarios) gated by feature flags.
In addition, we include pre-configured dashboards and walk-thrus in our docs on
how to read and interpret the telemetry data each service emits to discover the
underlying cause of performance regressions in the application.

Another goal of this demo is to streamline the ability of vendors and commercial
implementers of OpenTelemetry to have a standardized target for building demos
around. We’ve already seen quite a bit of adoption, with five companies
including Datadog, Dynatrace, Honeycomb, Lightstep, and New Relic integrating
the community demo application into their product demos (you can find a list
[here](https://github.com/open-telemetry/opentelemetry-demo#demos-featuring-the-astronomy-shop)).
We hope to encourage further contributions and collaboration along these lines.

However, just because we reached 1.0, that doesn’t mean we’re stopping -- this
demo is a living artifact, one that we intend to continue to improve. In the
coming months we plan to continue to iterate and improve coverage of metrics and
logs as more SDKs reach maturity.

We also hope to add new instrumentation scenarios and patterns by extending the
functionality of the application -- queues and async processing of requests, a
hosted version in order to explore the demo with zero setup, adding in support
for Swift, and more.

We’d love for you to take the demo for a spin and let us know what you think!
Check out the
[docs](https://github.com/open-telemetry/opentelemetry-demo/tree/main/docs#opentelemetry-demo-documentation),
or run the demo using [Docker](/docs/demo/docker-deployment/) or
[Kubernetes](/docs/demo/kubernetes-deployment/), and let us know your thoughts.
If you’d like to contribute, please file an
[issue on GitHub](https://github.com/open-telemetry/opentelemetry-demo/issues)
or join us on the CNCF Slack in
[#otel-community-demo](https://cloud-native.slack.com/archives/C03B4CWV4DA).

---
title: Announcing a Community Demo for OpenTelemetry
linkTitle: OpenTelemetry Community Demo
date: 2022-06-20
author: Carter Socha
---

## TLDR

The community has taken a good pre-existing demo (thanks,
[Google](https://github.com/GoogleCloudPlatform/microservices-demo)!) and is in
the process of making it better. Every GA SDK will be represented, demo support
will be extended to Metrics and Logs, and canonical scenarios will be documented
for each signal, with fault injection, and more!

If you want to try it yourself clone our
[repo](https://github.com/open-telemetry/opentelemetry-demo-webstore) then run
`docker compose up` from the command line. There are a couple [technology
requirements](https://github.com/open-telemetry/opentelemetry-demo-webstore#local-quickstart)
so be sure to check those out too.

The demo will take 15-20 minutes to build the first time so we encourage you to do some stretching and
take a water break in the meantime.

- Once the images are built you can access the Webstore at:
  <http://localhost:8080>

- And the Jaeger UI at: <http://localhost:16686>

Your command line output should look like this:

**INSERT PICTURE**

## Success of the Commons

As OpenTelemetry matures, users are increasingly looking for best practice
guides on how to onboard their services to the new paradigm or demo applications
so that they can try out the new tools themselves.

Multiple vendors have written their own demo applications but are wholly
responsible for the development & ongoing support. The existing demos are all
feature incomplete in their own ways with missing languages, restrictions on
backend choice, & they’re overly reliant on instrumentation libraries.

The OpenTelemetry Community Demo application is intended to be a ‘showcase’ for
OpenTelemetry API, SDK, and tools in a “production-ish” cloud native
application. The overall goal of this application is not only to provide a
canonical ‘demo’ of OpenTelemetry components, but also to act as a framework for
further customization by end-users, vendors, and other stakeholders.

### Project Goals

- Provide developers with a robust sample application they can use in learning
OpenTelemetry instrumentation.
- Provide observability vendors with a single, well-supported, demo platform
that they can further customize or simply use OOB.
- Provide the OpenTelemetry community with a living artifact that demonstrates
the features and capabilities of OTel APIs, SDKs, and tools.
- Provide OpenTelemetry maintainers and working groups a platform to demonstrate
new features/concepts real world like scenarios.

## Current State

As a starting point, we have selected a fork of the popular GCP microservices
demo. Our first feature additions have been to simplify local deployment by
consolidating the project onto a single docker compose file, updating the
documentation, & replacing a pre-existing service with a Ruby example. Otherwise
the pre-existing feature set from the GCP demo remains the same:

- 10 application microservice with support for 6 languages (C#, Go, Java,
Node.js, Python, & Ruby)
  - Ruby support was added within the last 2 weeks of publishing date
- Designed to work on docker locally
- Uses redis cache
- Auto-instrumentation using instrumentation libraries Tracing support for the
gRPC, Redis, & HTTP libraries
- Jaeger visualizations for distributed traces OpenTelemetry collector
- Always on sampling (100% of telemetry is submitted) Synthetic load generation

### BYOB (Bring Your Own Backend)

Jaeger is great (really) but what if you want to try this out with your APM
vendor of choice? You can send data to your preferred backend by simply changing
the [Collector
config file](https://github.com/open-telemetry/opentelemetry-demo-webstore#bring-your-own-backend)
to use their Collector exporter or by using your vendor's fork of our demo.

Lightstep has an [excellent
blog](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry)
they just published on how to get started sending demo data to power their
experiences from their forked demo.

### Current Architecture

![Screenshot of the current architecture.](/img/blog/current-demo-architecture.png "Screenshot of the current architecture")

## Upcoming New Features

We have a lot of exciting improvements that are planned or in progress to turn
this application into the canonical example of the full power of OpenTelemetry.

- Language examples for
  [C++](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/36),
  Erlang/elixir,
  [PHP](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/34),
  &
  [Rust](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/35)
- Extend support to
  [Metrics](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/43)
  &
  [Logs](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/44)
  for all GA SDKs
- Visualization component to consume Metrics
- Implement multiple instrumentation techniques
- Auto-instrumentation using the agent in a sidecar
- Manual instrumentation of all signals
- Additional instrumentation libraries where needed
- Demonstrate the ability to add
  [Baggage](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues/100)
  & other custom tags
- Continue to build on other cloud-native technologies Kubernetes \
gRPC \
OpenFeature \
etc.
- An enhanced OpenTelemetry collector gateway capabilities for ingestion,
  transformation, and export
- Probability based sampling
- Feature flag service to demonstrate various scenarios like fault injection &
  how to emit telemetry from a feature flag reliant service

### Future Architecture

![Screenshot of the future architecture.](/img/blog/future-demo-architecture.png "Screenshot of the future architecture")

## Going Forward

We’re still at the beginning of our journey but there’s great momentum behind
this project. If you’re interested in contributing we’d love your support. There
are links in our GitHub repo on how to get involved & you can [track our overall
progress](https://github.com/open-telemetry/opentelemetry-demo-webstore/issues)
from there.

## Interesting Links

- [Demo Requirements](https://github.com/open-telemetry/opentelemetry-demo-webstore/tree/main/docs/requirements)
- [Get Involved](https://github.com/open-telemetry/opentelemetry-demo-webstore#contributing)

---
title: OpenTelemetry Has Graduated…Now WHAT?
linkTitle: OTel Graduates...Now What?
date: 2026-06-15
author: >-
  [Adriana Villela](https://github.com/avillela) (Dynatrace LLC), [AuthorX
  Name](https://github.com/reese-lee) (New Relic)
draft: true
sig: Governance Committee
cSpell:ignore: ICYMI shoutout
---

ICYMI:
[OpenTelemetry (OTel) has officially achieved CNCF graduated status](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/)!
It now stands proudly alongside amazing open source projects such as
[Kubernetes](https://kubernetes.io) and [Argo](https://argoproj.github.io), to
name just a few. It’s been a long journey, and we’re very excited… But, now
what? To understand where we’re going, it’s important to understand where we
came from.

## History

In the not-so-distant past, telemetry signals were not standardized. This meant
telemetry formats differed from tool to tool, with each telemetry vendor
creating and maintaining its own instrumentation libraries. Vendor lock-in was a
huge problem: If you wanted to switch vendors, you had to strip out the previous
vendor’s libraries from your code and replace them with the new vendor’s
libraries. As a result, switching vendors was a nontrivial task.

In addition, the three core telemetry signals–traces, logs, and metrics–were
treated as separate, so there was no easy way to correlate them. Because of
this, the observability story was incomplete.

Previous attempts had been made at standardization: the
[CNCF](https://cncf.io)’s [OpenTracing](https://opentracing.io), and Google’s
[OpenCensus](https://opencensus.io), forming the basis for what was to become
OpenTelemetry.

![OpenTelemetry timeline](./otel-timeline.png 'OpenTelemetry timeline')

In the interest of having a single standard, OpenCensus and OpenTracing were
merged to form [OpenTelemetry](https://opentelemetry.io) in May 2019.
OpenTelemetry takes the best of both worlds, and then some, providing a tracing,
metrics, and logs specification, a set of standardized APIs, and language
specific implementations of these APIs.

Both OpenCensus and OpenTracing are now officially archived. OpenTracing was
archived in January 2022, and OpenCensus was archived in July 2023.

With the backing of all major Observability vendors, and an active developer and
end user community, OpenTelemetry became the de-facto standard for instrumenting
applications.

## Growth

[OpenTelemetry is the second-highest velocity project in the CNCF](https://www.cncf.io/blog/2026/02/09/what-cncf-project-velocity-in-2025-reveals-about-cloud-natives-future/),
just behind Kubernetes.
[According to the CNCF](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/),
OpenTelemetry has “over 12,000 contributions, from over 2,800 companies and
hundreds of maintainers across various language-specific Special Interest Groups
(SIGs).”

Since its inception, traces, logs, and metrics have reached general availability
(GA). [Profiling](blog/2024/profiling) was added as a new OTel signal. The
[OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) has
expanded. The
[OTel Collector](https://github.com/open-telemetry/opentelemetry-collector) has
expanded, with new components being added regularly. We’ve seen the addition of
new components to the OTel ecosystem to help make it more ergonomic, including
[OpAMP](docs/specs/opamp/), the
[OTel Operator](docs/platforms/kubernetes/operator/),
[OTel Weaver](https://github.com/open-telemetry/weaver), and
[OTel Arrow](https://github.com/open-telemetry/otel-arrow).

This is a very impressive achievement, considering that OpenTelemetry is a mere
seven years old. It sends a clear signal: OpenTelemetry is here to stay. And
graduation helps to cement that.

## Graduation!

OpenTelemetry achieved graduated status in May 2026, having started its path to
graduation in 2024.

So what does it take to become a graduated CNCF project? Projects must fulfill
the following criteria:

1. **Production adoption.** How many different organizations run OpenTelemetry
   in production?
2. **Robust governance.** This includes having a documented governance model
   with clearly defined roles around election and retirement, along with
   transparent communication and decision-making.
3. **Community health.** Are regular contributions being made? Is there an
   established process for PR review and management? Are reviewers responsive?
   Is there a breadth of contributors from multiple organizations?
4. **Security.** There must be at least one independent security audit, and all
   critical issues identified must be remediated.
5. **API stability.** Are the APIs stable, properly versioned, and released at a
   regular cadence? Is backwards compatibility ensured?
6. **Documentation.** Does the documentation stand on its own? Specifically,
   does it provide an architectural overview, along with user, operator, and
   contribution guides?
7. **TOC application and review.** A graduation application template is
   submitted for review by the
   [CNCF’s Technical Oversight Committee (TOC)](https://www.cncf.io/people/technical-oversight-committee/).
   You can check out
   [OTel’s submission](https://github.com/cncf/toc/issues/1739).

As you can see, a LOT of work was done behind the scenes by many dedicated
folks, ranging from OTel maintainers, to end users, to CNCF TOC members to make
this happen.

We’d like to give a HUGE shoutout to all in the OpenTelemetry community who made
graduation happen, and especially to our predecessor,
[Austin Parker](https://github.com/austinlparker), who led the graduation effort
with the CNCF.

## Why should I care?

So what does OpenTelemetry graduation mean for you, dear reader?

Dan Gomez Blanco, one of the maintainers of the
[OTel End User SIG](community/end-user/) put it perfectly
[in a recent LinkedIn post](https://www.linkedin.com/feed/update/urn:li:activity:7459538615640010752/):

    “For end users, this graduation signals that OTel is far from being an "emerging standard". Its contributor health, security and quality standards, governance processes, and wide adoption have been evaluated to be at the level required by any enterprise, of any scale. So, if you're in the 25% of skeptics not using OTel, there's really no excuse anymore. There has never been a better time to adopt it!”

In a nutshell: OpenTelemetry is production-ready, and fully open for business.
If your organization was holding out on using OpenTelemetry, you have no more
excuses!

## What’s next?

Software is never really “done”, and the same goes for OpenTelemetry. It will
continue to grow and evolve: from the specification to the API & SDK to the
Collector, and beyond.

Vendors have gone from requiring backend-specific OpenTelemetry exporters, to
supporting OTLP-native data ingest. And most of these vendors are also adding
more OTel-native components into their core products.

OpenTelemetry has a long future ahead of it, but we also know that it’s only
possible through continued work by maintainers and contributors, and of course,
through continued support and adoption by our end users.

We can’t wait for what the future has in store for us, and we’re excited to have
you along for the ride.

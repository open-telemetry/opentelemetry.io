---
title: Announcing the OpenTelemetry Demo 2.0
linkTitle: OTel Demo 2.0
date: 2025-02-17
author: >
  [Juliano Costa](https://github.com/julianocosta89) (Datadog)
sig: OpenTelemetry Demo
cSpell:ignore: Abhishek Veeramalla's
---

We're thrilled to announce that OpenTelemetry Demo 2.0 is here! We've been busy
behind the scenes, polishing up the demo to make it more complete, robust, and
user-friendly. We believe these exciting features and improvements deserve a
major release!

But before we jump in, let's take a look at some of the project stats.

## Statistics

With a total of 140 contributors, the OpenTelemetry Demo has been starred
**2048** times. On October 26, 2022—two days after General Availability—we had
a record 40 stars in a single day. If you use the Demo, consider
leaving us a star to help promote the project.

There are a total of 1.8k forks of the Demo. Notably, [Abhishek Veeramalla's
fork][1] stands out with 142 stars and has been forked 425 times.

The Demo containers have been pulled over **12 million times** (11,809,995 times
from `ghcr.io` plus 433,000 times from `hub.docker`).

The OpenTelemetry Demo includes the following CNCF projects:

- OpenTelemetry (of course)
- OpenFeature/Flagd
- Jaeger
- Prometheus
- Valkey

## What's new in 2.0?

This release is packed with exciting upgrades and changes. The following list is a quick
rundown of the highlights:

- **Flagd-ui introduced**: One of our most missed features since version 1.9.0
  is back! You can again manage feature flags directly in the Demo. For more
  details, see the [Feature Flags](/docs/demo/feature-flags/) page.
- **Image-provider introduced**: Since release 1.10.0, we've introduced a new
  service called Image Provider, which delivers static product images. This
  service, built on NGINX, returns images for every product and demonstrates how
  to instrument OpenTelemetry with an NGINX proxy using the NGINX Native
  OpenTelemetry module.
- **Redis replaced with Valkey**: Since version 1.11.0, we've replaced the Redis
  service with Valkey, introducing another CNCF project to the OTel Demo.
- **Build args moved to `.env` file**: If you forked the Demo and were using any
  custom image, keeping your fork in sync with upstream was always a hassle. To
  make things easier, we've moved most configurations to the `.env` file. We've
  also added a `_DOCKERFILE` environment variable, which allows you to specify
  the location of your build instructions.
- **Services renamed**: If you've been using the OTel Demo since its inception,
  you're probably accustomed to the verbose naming of every service. For 2.0,
  we've streamlined things by dropping the `-service` suffix from all service
  names. Now, instead of `ad-service`, `cart-service`, and `checkout-service`,
  you'll simply see `Ad`, `Cart`, and `Checkout`.
- **Accounting rewritten in .NET**: We wanted to showcase OTel's .NET
  auto-instrumentation in the Demo without adding an extra service. Since the
  Accounting service was originally written in Go—and we already had another
  service in that language—we decided to rewrite it in .NET. Now, the Demo
  features both the `Accounting` and `Cart` services, each demonstrating a
  different way to instrument .NET applications.
- **Added exemplars**: `Cart` service now records exemplars for `GetCart` and
  `AddItem` operations, allowing correlation between metrics and spans. See the
  [Exemplars section of the Cart documentation](/docs/demo/services/cart/#exemplars)
  to learn more.
- **React Native example app**: One of the most significant additions to this
  release is the brand new React Native app example. It can be built for Android
  or iOS (currently executable locally only). For instructions on how to run and
  test it, see the
  [React Native App documentation page](/docs/demo/services/react-native-app/).
- **Span links for messaging spans**: Following OTel's recommendation to always
  link producer and consumer spans
  ([Messaging spans - Trace structure](/docs/specs/semconv/messaging/messaging-spans/#trace-structure)),
  the Demo now demonstrates this best practice. Consumer spans for `Accounting`
  and `Fraud-Detection` are linked to the producer span
  (`Checkout/orders publish`).
- **Multi-arch builds**: To ensure that a variety of users can run the Demo
  locally, we've introduced new `make` targets to support building multiplatform
  images (for both `arm64` and `amd64` architectures).
- **Configured Dependabot**: We were falling behind on some dependencies, but
  now Dependabot is configured to keep the Demo up-to-date automatically.

## Current challenges

Of course, with great updates come a few growing pains. Here's what we're
currently tackling:

- **Grafana dashboards**: As semantic conventions and tools evolve with new
  releases, ensuring that our Grafana dashboards remain fully functional is a
  challenge. If you're experienced with Grafana, we'd love your help!
- **Dependabot PR testing**: While Dependabot helps keep all service
  dependencies up-to-date, we haven't yet implemented automated tests to ensure
  that updates don't cause crashes. This testing is still a manual process.
- **Demo scalability**: Balancing the expansion of demo scenarios while keeping
  the Demo easily runnable locally is one of our biggest challenges. With 19
  different services and new ideas emerging weekly, we're continuously working
  to maintain this balance.

## What's next?

We're not stopping here! Here are some of the next steps we're excited about,
and we'd love your help:

- **Bring Erlang/Elixir back**: In March 2024, we removed the initial Feature
  Flag service written in Elixir in favor of OpenFeature and Flagd. Since then,
  the Demo hasn't included a service in that language, but we're aiming to
  reintroduce Erlang/Elixir. Any help in this area would be much appreciated!
- **Remote access for React Native app**: We plan to enable the React Native app
  to access a remotely running Demo, expanding its usability.
- **Better automation and testing**: We're working to improve our automation and
  testing processes—especially for Dependabot PRs—to streamline our development
  workflow.

## Get involved!

Your feedback and contributions are what make this project thrive. If you're
interested in helping out—whether it's polishing up the dashboards, automating
tests, or bringing Erlang/Elixir back—please jump in and join the discussion on
our [GitHub repository][2] / SIG meetings ([calendar-demo][3]) or hop into the
[#otel-community-demo slack channel][4].

Thank you for your continued support, and happy demoing!

[1]: https://github.com/iam-veeramalla/ultimate-devops-project-demo
[2]: https://github.com/open-telemetry/opentelemetry-demo
[3]: https://groups.google.com/a/opentelemetry.io/g/calendar-demo-app
[4]: https://cloud-native.slack.com/archives/C03B4CWV4DA

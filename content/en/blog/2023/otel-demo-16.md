---
title: OpenTelemetry Demo 1.6 released
linkTitle: Demo 1.6 Released
date: 2023-11-07
author: '[Austin Parker](https://github.com/austinlparker)'
---

The OpenTelemetry Demo has been updated to version 1.6, and introduces alpha
support for the OpenTelemetry [Log signal](/docs/concepts/signals/logs/)!

## Our thoughts on logs

Why are we considering logging support to be in alpha? There are a few reasons.
The most important is that this is the first time we've shipped the demo with a
logging database. We chose [OpenSearch](https://opensearch.org/) as the storage
backend for logs because it's a popular option that aligns with the project's
license. It's worth noting that the demo doesn't require application-level logs
&mdash; everything you care about is available as a span.

Where logs shine is in bridging the gap between application traces and
infrastructure, and over the next few releases, we plan to enhance this story by
collecting Kubernetes, Envoy, and other logs relevant to the demo.

If this sounds like an interesting problem, we'd love to have you as a
[contributor](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CONTRIBUTING.md)!
We'd also appreciate any feedback you might have on how our support for logging
can improve.

## Other changes

This release also includes some nice additions on the Kubernetes side -- you'll
be able to increase the number of replicas per service, for instance. We've
updated many dependencies throughout the project as well.

## What's next?

With the addition of logging, the demo is mostly feature-complete. However,
there's more that can be done, and we're looking at a few major areas over the
next months:

- Increase the number of documented scenarios to demonstrate how OpenTelemetry
  can be used to solve real-world problems.
- Ensure that the demo reflects the OpenTelemetry feature matrix and that we're
  showing off everything you can do with the project.
- Improve our dashboards and add alerts, SLOs, and other observability features
  to the demo.
- Support other clients and front-end RUM features as they're released.

As always, we'd love to hear your feedback on the demo, and if you're looking
for a place to start contributing, the demo is a great place to get involved!

Check out the
[demo repository](https://github.com/open-telemetry/opentelemetry-demo) for more
information, and to find the latest release.

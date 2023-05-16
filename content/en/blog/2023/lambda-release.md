---
title: OpenTelemetry Updates our Lambda Support
linkTitle: OTel Lambda Updates
date: 2023-05-15
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
---

The Functions-as-a-Service (FAAS) SIG is incredibly excited to announce that the
OpenTelemetry (OTel) community is now releasing our own Lambda layers and has
[centralized documentation](https://opentelemetry.io/docs/faas/) on how to
monitor Amazon Web Services (AWS) Lambdas.

### A Slightly New World

If you've been monitoring Lambdas using OTel for a while now you may be slightly
confused by this announcement. You might say something like OTel has had a
[repo for Lambda layers](https://github.com/open-telemetry/opentelemetry-lambda)
and they've been available on AWS for years.

Which is totally correct. Thankfully, we're not remaking the wheel here.
However, there are a couple new updates.

Previously the OTel Lambda layers were only released as part of the
[Amazon Distribution of OTel (ADOT)](https://aws-otel.github.io/) and the
community had limited control over releases, the layers available on AWS
combined the Collector and auto-instrumentation capabilities into 1 package, and
there wasn't official OTel guidance on how to monitor Lambdas.

The FAAS SIG has written new Github Actions to release the Lambda layers
ourselves and empower the community to make our own release decisions, separated
the Collector and instrumentation layers to give customers options when
instrumenting their Lambdas, and added Lambda documentation to the OTel
collection.

The community now offers a standalone Lambda layer for the Collector alongside
auto-instrumentation layers for JavaScript, Java, and Python.

### Get Involved

We're not stopping at our current state. Going forward, the FAAS SIG is planning
on adding similar documentation + (potentially) auto-instrumentation for other
Cloud vendors like Azure and GCP, enhancing the existing Lambda assets, and
improving OpenTelemetry performance for Function specific scenarios.

If you'd like to help move this work forward, join a
[SIG meeting](https://github.com/open-telemetry/community#implementation-sigs)
(every Tuesday at 12 pm PST) or join our
[Slack channel](https://cloud-native.slack.com/archives/C04HVBETC9Z).

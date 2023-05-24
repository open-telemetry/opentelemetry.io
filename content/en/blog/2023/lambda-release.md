---
title: OpenTelemetry Updates Lambda Support
linkTitle: OTel Lambda Updates
date: 2023-05-25
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
---

The [Functions-as-a-Service (FaaS) SIG](https://docs.google.com/document/d/187XYoQcXQ9JxS_5v2wvZ0NEysaJ02xoOYNXj08pT0zc) is incredibly excited to announce that the release of OpenTelemetry Lambda layers, and associated [documentation](/docs/faas/) on how to
monitor Amazon Web Services (AWS) Lambdas.

## OTel FaaS repackaged

If you've been monitoring Lambdas using OTel for a while now, you may be slightly
confused by this announcement. You might think something like: OTel has had a
[repo for Lambda layers](https://github.com/open-telemetry/opentelemetry-lambda)
and they've been available on AWS for years.

You're totally correct. Rest assured, we're not reinventing the wheel.
However, there are some pre-existing problems that may impact users:

- The OTel Lambda layers were only released as part of the
  [AWS Distribution for OTel (ADOT)](https://aws-otel.github.io/), and the
  community had limited control over releases which meant a delay getting new
  features and fixes delivered.
- The layers available on AWS combined the Collector and auto-instrumentation
  capabilities into a single package, which contributed to performance degradations
  and limited user choice.
- There wasn't official OTel guidance on how to monitor Lambdas and no single
  source of truth for OTel users to reference.

The FaaS SIG has addressed the above-mentioned shortcomings:

- We have written new Github Actions to release the Lambda layers ourselves and
  empower the community to make our own release decisions.
- Separated the Collector and instrumentation layers to give customers options
  when instrumenting their Lambdas. The community now offers a standalone Lambda
  layer for the Collector alongside auto-instrumentation layers for JavaScript,
  Java, and Python.
- Added official community Lambda documentation to the OTel website under the
  new FAAS section.

## What next

Moving forward, the FaaS SIG plans to: enhance the documentation, add auto-instrumentation for other
Cloud vendors like Azure and GCP (tentative), enhancing the existing Lambda assets, and
improving OpenTelemetry performance for Function specific scenarios.

## Get Involved

Interested in learning more, or if you'd like to help: join us in a
[SIG meeting](https://github.com/open-telemetry/community#implementation-sigs)
(every Tuesday at 12 pm PST), or join us on Slack at 
[#otel-faas](https://cloud-native.slack.com/archives/C04HVBETC9Z).

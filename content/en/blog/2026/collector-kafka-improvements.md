---
title: OpenTelemetry Collector Kafka Components Improvements
linkTitle: Collector Kafka Improvements
sig: Collector SIG
date: {{ dataFormat "2026-01-02" .Date }}
author: >-
  [Andrew Wilkins](https://github.com/axw) (Elastic),
  [Paulo Dias](https://github.com/paulojmdias) (Five9),
  [Pavol Loffay](https://github.com/pavolloffay) (Red Hat),
  [Sean Marciniak](https://github.com/MovieStoreGuy) (Splunk)
draft: true
body_class: otel-with-contributions-from
---

The code owners for the Kafka components have been looking at improving the
maintainability of each component, ensuring consistent configuration, and
performance improvements where possible. Thanks to all who have contributed
to this effort, as of `v0.152.0` the Collector Contrib now ships with all
improvements by default.

## Background

Historically, each of these Kafka components were updated independently and were
optimized for their specific use case. This meant that some configuration that
should have been adopted for all impacted components was only added for that
specific component. Due to this, any potential consolidation efforts, or just
general maintenance required took a lot more effort than it should have.
This was definitely felt by our users through constant configuration changes,
changes in behaviour, and inconsistent expectations — something the code owners
set out to fix.

## Improvements

## Acknowledgements

These changes could not have been done without the direction of:

- [Andrew Wilkins](https://github.com/axw) (Elastic),
- [Paulo Dias](https://github.com/paulojmdias) (Five9),
- [Pavol Loffay](https://github.com/pavolloffay) (Red Hat),
- [Sean Marciniak](https://github.com/MovieStoreGuy) (Splunk)

Furthermore, we would also like to acknowledge the help we have received from 
[Travis Bischel](https://github.com/twmb) as we've made new changes, needed new
features within the Kafka SDK, they have been amazing to collaborate with as
someone external to the OpenTelemetry Project.

## What is coming next?

It has been clear that the Collector is a critical part of our user's telemetry
pipelines, but it has the following areas to improve:

- Flexible data partitioning
- Max message size handling

This will become our main focus areas when contributing to the Kafka components
so we can enable pipelines of any scale and data volume to continue working as 
required. 

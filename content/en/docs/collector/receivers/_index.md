---
title: Creating Custom Receivers
description:
aliases: [/docs/collector/receivers/about]
cascade:
  collectorVersion: 0.83.0
weight: 10
---

<!-- TODO hughesjj see how cascade works here -->

![OpenTelemetry Collector diagram with Jaeger, OTLP and Prometheus integration](img/otel-collector.svg)

## Introduction

Not every system proves an otlp-native export or import mechanism. In such
cases, you may wish to implement your own mechanism to import, process, and
export third party systems such as redis, prometheus, or jager. Opentelemetry
maintains a
[`opentelemetry-collector-contrib`](https://google.com/open-telemetry/opentelemetry-collector-contrib)
repository of such third party support, in addition to some useful common
tooling and a (more or less) weekly release of said components.

If you wish to build your own collector components, the docs herein will give
instructions and guidance on how to do so.  We'll also target adoption into `opentelemetry-collector-contrib`, in case you wish to share your work with the world at large.

This intends to be a comprehensive, living guide to creating your _own_ receiver
in open-telemetry. While this guide is geared for inclusion in
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib),
all of the tips and tricks herein should work for you if you'd prefer to include
it in your
[own distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/mdatagen/statusdata.go#L21)
or personal fork.

## Specify your requirements

First, you should think about how your requirements will shape the receiver you
want to build.  We'll dive into some common questions in each below section to help you determine
your requirements in an opentelemetry context.


### Traces, Metrics, Logs, or a combination thereof?

(See existing documentation for what each of these are. See existing guide for a
tracing receiver)

Are you trying to instrument the detailed call behavior of your functions?  Are you trying to monitor the health of your system for use in autoscaling or operational excellence?

OTLP has example of traces + logs + metrics

### [Semantic conventions](https://github.com/open-telemetry/semantic-conventions)

As of March 2023, the ability to do metric translation and any "view layer"
changes in opentelemetry is still being developed. Consumers of opentelemetry
metrics often use them for dashboarding, alarming, and analytics, so any change,
divergence, or duplication in the meaning of a metric has a rather large blast
radius. Thus, care should be taken to ensure your namings and intents are both
semantically meaningful and complement the offerings from the rest of the
opentelemetry ecosystem.

If you wish to follow best practices, and increase the you should take a look at
the
[semantic conventions](https://github.com/open-telemetry/semantic-conventions)
to see if there is any prior art which exists. While most receivers are still
converging to these conventions, in the future we plan to be more strict about
adherence prior to acceptance. While you can always target a beta or alpha
release of your receiver, getting the ball rolling on semantic conventions is
wise, especially given how arduous it can be to gather consensus in a
distributed open-source project, of which opentelemetry is.

## Building your receiver

### [mdatagen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/mdatagen)

You may have noticed -- we have a lot of contributed receivers! Rather than
making every single person put up with boring boiler plate and the hassle of
learning every convention, we invested in tooling to make creating, maintaining,
and instrumenting receivers easier and less bug prone.
[`mdatagen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/mdatagen)
is this tool, and will provide you both a good interface and structure to make
your job a little less ambiguous.



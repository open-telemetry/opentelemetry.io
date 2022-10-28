---
title: "Distributions"
description: >-
 A distribution, not to be confused with a fork, is customized version of an OpenTelemetry component.
weight: 90
---

The OpenTelemetry projects consists of multiple [components](../components) that
support multiple [signals](../signals). The reference implementation
of OpenTelemetry is available as:

- [Language-specific instrumentation libraries](../instrumenting)
- [A Collector binary](../data-collection)

From any reference implementation a distribution may be created.

## What is a distribution?

A distribution, not to be confused with a fork, is customized version of an
OpenTelemetry component. A distribution is a wrapper around an upstream
OpenTelemetry repository with some customizations. Customizations in a
distribution may include:

- Scripts to ease use or customize use for a specific back-end or vendor
- Changes to default settings required for a back-end, vendor, or end-user
- Additional packaging options that may be vendor or end-user specific
- Test, performance, and security coverage beyond what OpenTelemetry provides
- Additional capabilities beyond what OpenTelemetry provides
- Less capabilities from what OpenTelemetry provides

Distributions would broadly fall into the following categories:

- **"Pure":** These distributions provide the same functionality as upstream and
  are 100% compatible. Customizations would typically be to ease of use or
  packaging. These customizations may be back-end, vendor, or end-user specific.
- **"Plus":** These distributions provide the same functionality as upstream
  plus more. Customizations beyond those found in pure distributions would be
  the inclusion of additional components. Examples of this would include
  instrumentation libraries or vendor exporters not upstreamed to the
  OpenTelemetry project.
- **"Minus":** These distributions provide a reduced set of functionality from
  upstream. Examples of this would include the removal of 
  instrumentation libraries or receivers/processors/exporters/extensions found
  in the OpenTelemetry Collector project. These distributions may be provided to
  increase supportability and security considerations.

## Who would create a distribution?

Anyone could create a distribution. Today, several [vendors](../../../vendors)
offer distributions. In addition, end-users may consider creating a distribution
if they wish to use components in the [Registry](../../../registry) that are not
upstreamed to the OpenTelemetry project.

## Contribution or distribution?

Before you read on and learn how you can create your own distribution, ask
yourself if your additions on top of an OpenTelemetry component would be
beneficial for everyone and therefore should be included in the reference
implementations:

- Can your scripts for "ease of use" be generalized?
- Can your changes to default settings be the better option for everyone?
- Are your additional packaging options really specific?
- Might your test, performance & security coverage work with the reference
  implementation as well?
- Have you checked with the community if your additional capabilities could be
  part of the standard?

## Creating your own distribution

### Collector

A guide on how to create your own distribution is available in this blog post:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

If you are building your own distribution, the
[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
might be a good starting point.

### Language Specific Instrumentation libraries

There are language specific extensibility mechanisms to customize the
instrumentation libraries:

- [Javaagent](../../instrumentation/java/extensions)

## What you should know about distributions

When using OpenTelemetry project collateral such as logo and name for your
distribution, make sure that you are in line with the [OpenTelemetry Marketing
Guidelines for Contributing Organizations][guidelines].

The OpenTelemetry project does not certify distributions at this time. In the
future, OpenTelemetry may certify distributions and partners similarly to the
Kubernetes project. When evaluating a distribution, ensure using the
distribution does not result in vendor lock-in.

> Any support for a distribution comes from the distribution authors and not the
> OpenTelemetry authors.

[guidelines]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md

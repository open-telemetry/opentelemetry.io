---
title: Collector hosting best practices
linkTitle: Collector hosting
description: Follow best practices to securely host OpenTelemetry Collector.
weight: 15
---

When setting up hosting for OpenTelemetry (OTel) Collector, consider the
following practices to better secure your hosting instance.

## Storing configuration information securely

<!--- TODO: SHOULD ensure sensitive configuration information is stored securely. How? -->

## Permissions

<!--- TODO: SHOULD not run the OpenTelemetry Collector as root/admin user. Why? (Give the reader motivation.) How do you do that?
- NOTE: MAY require privileged access for some components

The Collector SHOULD NOT require privileged access, except where the data it's obtaining is in a privileged location. For instance, in order to get pod logs by mounting a node volume, the Collector daemonset needs enough privileges to get that data.

The rule of least privilege applies here. --->

## Receivers and exporters

To limit the exposure of servers to authorized users:

- Enable authentication, using bearer token authentication extensions and basic
  authentication extensions.
- Restrict the IPs that OTel Collector runs on.

## Processors

[Processors](/collector/configuration/#processors) sit between receivers and
exporters. They are responsible for processing telemetry before it's analyzed.
From a security perspective, processors are useful in a few ways.

### Safeguarding resource utilization

In addition, processors offer safeguards around resource utilization.

The `batch` and `memory_limiter` processors help ensure that the OpenTelemetry
Collector is resource efficient and does not run out memory when overloaded.
These two processors should be enabled on every defined pipeline.

For more information on recommended processors and how to order them in your
configuration, see the
[Collector processor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)
documentation.

After installing resource utilization safeguards in your hosting, make sure your
Collector configuration uses those
[safeguards in its configuration](/security/config-best-practices/).

### Another example

<!--- TODO: INSERT ADDITIONAL EXAMPLES HERE. -->

## Extensions

<!--- TODO: Extensions SHOULD NOT expose sensitive health or telemetry data. How? What can you do? -->

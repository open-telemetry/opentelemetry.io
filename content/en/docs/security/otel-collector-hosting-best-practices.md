---
title: OpenTelemetry Collector Hosting Best Practices
linkTitle: Collector hosting
description: Follow best practices to securely host OpenTelemetry Collector.
weight: 10
---

When setting up hosting for OpenTelemetry (OTel) Collector, consider the
following practices to better secure your hosting instance.

## Storing configuration information securely

<!--- TODO: SHOULD ensure sensitive configuration information is stored securely. How? -->

## Permissions

<!--- TODO: SHOULD not run the OpenTelemetry Collector as root/admin user. Why? (Give the reader motivation.) How do you do that?
- NOTE: MAY require privileged access for some components -->

## Receivers and exporters

To limit the exposure of servers to authorized users:

- Enable authentication, using bearer token authentication extensions and basic
  authentication extensions.
- Restrict the IPs that the OTel Collector runs on.

## Processors

Processors sit between receivers and exporters. They are responsible for
processing the data in some way. From a security perspective, they are useful in
a few ways.

### Safeguarding around resource utilization

In addition, processors offer safeguards around resource utilization.

<!-- start same page content in otel-collector-configuration-best-practices -->

The `batch` and especially `memory_limiter` processor help ensure that the
OpenTelemetry Collector is resource efficient and does not run when overloaded.
At least these two processors SHOULD be enabled on every defined pipeline.

For more information on recommended processors and order, refer to the
[OpenTelemetry Collector Processor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)
documentation.

<!-- /end same page content in otel-collector-configuration-best-practices -->

After installing resource utilization safeguards in your hosting, ensure your
OpenTelemetry Collector configuration uses those
[safeguards in its configuration](/security/otel-collector-configuration-best-practices/).

### Another example

<!--- TODO: INSERT ADDITIONAL EXAMPLES HERE. -->

## Extensions

<!--- TODO: Extensions SHOULD NOT expose sensitive health or telemetry data. How? What can you do? -->

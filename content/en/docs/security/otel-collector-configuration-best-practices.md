---
title: OpenTelemetry Collector Configuration Best Practices
linkTitle: Collector config
description:
  Follow best practices to securely configure OpenTelemetry Collector.
weight: 20
---

When setting up configuration for OpenTelemetry (OTel) Collector, consider the
following practices to better secure your OTel Collector instance.

## Receivers and exporters

We recommend enabling only the minimum required OTel Collector components of one
receiver and one exporter.

- Receivers and exporters can be either push or pull-based. In either case, the
  connection established SHOULD be over a secure and authenticated channel.
- Unused receivers and exporters SHOULD be disabled to minimize the attack
  vector of the Collector.
- Receivers and exporters may expose buffer, queue, payload, and worker settings
  using configuration parameters. If these settings are available, you should
  proceed with caution before modifying the default configuration values.
  Improperly setting these values may expose the OpenTelemetry Collector to
  additional attack vectors including resource exhaustion.

It is possible that a receiver MAY require the OpenTelemetry Collector run in a
privileged mode in order to operate, which could be a security concern, but
today this is not the case.

### Safeguards against denial of service attacks

Users should bind receivers' servers to addresses that limit connections to
authorized users, so that their Collectors aren't exposed to the public internet
or to wider networks than necessary.

For example, if the OTLP receiver OTLP/gRPC server only has local clients, the
`endpoint` setting SHOULD be bound to `localhost`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
```

Generally, `localhost`-like addresses should be preferred over the `0.0.0.0`
address. For more information, refer to the
[CWE-1327: Binding to an Unrestricted IP Address](https://cwe.mitre.org/data/definitions/1327.html)
definition.

### Encryption and authentication

Your OTel Collector configuration should include encryption and authentication.

- For communication encryption, refer to our
  [OTel Collector Configuring Certificates](/collector/configuration/#setting-up-certificates)
  documentation.

- For authentication, use the OTel Collector's authentication mechanism, as
  described in our
  [OTel Collector Authentication](/collector/configuration/#authentication)
  documentation.

**NOTE**: A security risk may present if configuration parameters are modified
improperly.

## Processors

Processors sit between receivers and exporters. They are responsible for
processing the data in some way. From a security perspective, they are useful in
a few ways.

### Recommended processors

<!--- TODO: SHOULD configure recommended processors. If so, what are they? -->

### Scrubbing sensitive data

You can use the OpenTelemetry Collector to scrub sensitive data before exporting
it to a back end. Configure the Collector to obfuscate or scrub sensitive data
before exporting.

<!--- TODO: SHOULD configure obfuscation/scrubbing of sensitive metadata. How? Give more details and/or link to an existing document -->

Use OpenTelemetry Collector's `redaction` processor to scrub sensitive data.

### Safeguarding around resource utilization

Processors also offer safeguards around resource utilization. After implementing
[safeguards around resource utilization in your hosting](/security/otel-collector-hosting-best-practices/),
ensure your OpenTelemetry Collector configuration uses these safeguards.

<!-- start same page content in otel-collector-hosting-best-practices -->

The `batch` processor helps to ensure that the OpenTelemetry Collector is
resource efficient and does not run out of memory when overloaded. At least
these two processors SHOULD be enabled on every defined pipeline.

For more information on recommended processors and order, refer to the
[OpenTelemetry Collector Processor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)
documentation.

<!-- /end same page content in otel-collector-hosting-best-practices -->

## Extensions

While receivers, processors, and exporters handle telemetry data directly,
extensions typical serve different needs.

<!--- TODO: Extensions SHOULD NOT expose sensitive health or telemetry data. How? What can you do? -->

### Health and Telemetry

The initial extensions provided health check information, Collector metrics and
traces, and the ability to generate and collect profiling data. When enabled
with their default settings, all of these extensions except the health check
extension are only accessibly locally to the OpenTelemetry Collector. Care
should be taken when configuring these extensions for remote access as sensitive
information may be exposed as a result.

### Collector's internal telemetry

<!--- INSERT RECOMMENDATIONS HERE. For example:

1. Remove zPages.
1. Remove configuration endpoints.
-->

### Observers

An observer is capable of performing service discovery of endpoints. Other
components of the OpenTelemetry Collector such as receivers MAY subscribe to
these extensions to be notified of endpoints coming or going. Observers MAY
require certain permissions in order to perform service discovery. For example,
the `k8s_observer` requires certain RBAC permissions in Kubernetes, while the
`host_observer` requires the OpenTelemetry Collector to run in privileged mode.

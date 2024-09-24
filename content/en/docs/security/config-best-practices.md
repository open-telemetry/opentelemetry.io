---
title: Collector configuration best practices
linkTitle: Collector config
description: Best practices to securely configure OpenTelemetry Collector.
weight: 20
---

When configuring the OpenTelemetry (OTel) Collector, consider the following
practices to better secure your Collector instance.

## Receivers and exporters

We recommend enabling a limited set of components in your Collector
configuration. Minimizing the number of components you use minimizes the attack
surface exposed.

- Use the [OpenTelemetry Collector Builder (`ocb`)](/collector/custom-collector)
  to create a Collector distribution that uses only the components you need.
- If you find that you have unused receivers and exporters, remove them from
  your configuration.
- Receivers and exporters can be push- or pull-based. In either case, you should
  establish the connection at least over a secure channel, potentially
  authenticated as well.
- Receivers and exporters might expose buffer, queue, payload, and worker
  settings using configuration parameters. If these settings are available, you
  should proceed with caution before modifying the default configuration values.
  Improperly setting these values might expose the OpenTelemetry Collector to
  additional attack vectors.

### Safeguards against denial of service attacks

Bind receivers' servers to addresses that limit connections to authorized users,
so that your Collectors aren't exposed to the public internet or to wider
networks than necessary.

For example, if the OTLP receiver OTLP/gRPC server has only local clients, bind
the `endpoint` setting to `localhost`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
```

Try to always use specific interfaces, such as the pod's IP, or `localhost`
instead of `0.0.0.0`. For more information, see
[CWE-1327: Binding to an Unrestricted IP Address](https://cwe.mitre.org/data/definitions/1327.html).

To change the default endpoint to be `localhost`-bound in all components, enable
the `component.UseLocalHostAsDefaultHost` feature gate. This feature gate will
be enabled by default in the Collector in a future release.

### Encryption and authentication

Your OTel Collector configuration should include encryption and authentication.

- For communication encryption, see
  [Configuring certificates](/collector/configuration/#setting-up-certificates).
- For authentication, use the OTel Collector's authentication mechanism, as
  described in [Authentication](/collector/configuration/#authentication).

## Processors

[Processors](/collector/configuration/#processors) sit between receivers and
exporters. They are responsible for processing telemetry before it's analyzed.
From a security perspective, processors are useful in a few ways.

### Recommended processors

<!--- TODO: SHOULD configure recommended processors. If so, what are they?

redaction processor (never tried myself)
transform processor (great for redacting PIIs and such) -->

### Scrubbing sensitive data

You can use the OpenTelemetry Collector to scrub sensitive data before exporting
it to a backend. Configure the Collector to obfuscate or scrub sensitive data
before exporting.

<!--- TODO: SHOULD configure obfuscation/scrubbing of sensitive metadata. How? Give more details and/or link to an existing document -->

Use OpenTelemetry Collector's `redaction` processor to scrub sensitive data.

<!--- TODO: Give example config for the redaction processor or remove this line. --->

### Safeguarding resource utilization

Processors also offer safeguards for resource utilization. After implementing
safeguards for resource utilization in your
[hosting infrastructure](/security/hosting-best-practices/), make sure your
OpenTelemetry Collector configuration uses these safeguards.

<!-- start same page content in hosting-best-practices -->

The `batch` and `memory_limiter` processors help ensure the OpenTelemetry
Collector is resource efficient and does not run out of memory when overloaded.
These two processors should be enabled on every defined pipeline.

For more information on recommended processors and how to order them in your
configuration, see the
[Collector processor](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor)
documentation.

<!-- /end same page content in hosting-best-practices -->

## Extensions

While receivers, processors, and exporters handle telemetry directly, extensions
serve different needs.

<!--- TODO: Extensions SHOULD NOT expose sensitive health or telemetry data. How? What can you do? -->

### Health and telemetry

Extensions are available for health check information, Collector metrics and
traces, and generating and collecting profiling data. When enabled with their
default settings, all of these extensions, except the health check extension,
are accessible only locally to the OpenTelemetry Collector. Take care to protect
sensitive information when configuring these extensions for remote access, as
they might expose it accidentally.

### Forwarding

A forwarding extension is used when you need to collect telemetry that's not
natively supported by the Collector. For example, the `http_forwarder` extension
can receive and forward HTTP payloads. Forwarding extensions are similar to
receivers and exporters so the same security considerations apply.

### Collector's internal telemetry

<!--- INSERT RECOMMENDATIONS HERE. For example:

1. Remove zPages.
1. Remove configuration endpoints.
-->

### Observers

An observer is a component that discovers services in endpoints. Other
components of the OpenTelemetry Collector, such as receivers, can subscribe to
these extensions to be notified of endpoints coming or going.

Observers might require certain permissions in order to discover services. For
example, the `k8s_observer` requires certain RBAC permissions in Kubernetes,
while the `host_observer` requires the OpenTelemetry Collector to run in
privileged mode.

<!--- But what about Juraci's comment here: https://github.com/open-telemetry/opentelemetry.io/pull/3652/files?diff=unified&w=0#r1417409370 --->

### Subprocesses

Extensions can also be used to run subprocesses when the Collector can't
natively run the collection mechanisms (for example, FluentBit). Subprocesses
expose a completely separate attack vector that depends on the subprocess
itself. In general, take care before running any subprocesses alongside the
Collector.

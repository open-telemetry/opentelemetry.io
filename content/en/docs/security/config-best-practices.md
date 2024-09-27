---
title: Collector configuration best practices
linkTitle: Collector configuration
weight: 112
---

When configuring the OpenTelemetry (OTel) Collector, consider these best
practices to better secure your Collector instance.

## Minimize your configuration

We recommend enabling a limited set of components in your Collector
configuration. Minimizing the number of components you use minimizes the attack
surface exposed.

- Use the
  [OpenTelemetry Collector Builder (`ocb`)](/docs/collector/custom-collector) to
  create a Collector distribution that uses only the components you need.
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

## Use encryption and authentication

Your OTel Collector configuration should include encryption and authentication.

- For communication encryption, see
  [Configuring certificates](/docs/collector/configuration/#setting-up-certificates).
- For authentication, use the OTel Collector's authentication mechanism, as
  described in [Authentication](/docs/collector/configuration/#authentication).

## Protect against denial of service attacks

For server-like receivers and extensions, you can protect your Collector from
exposure to the public internet or to wider networks than necessary by binding
these components' endpoints to addresses that limit connections to authorized
users. Try to always use specific interfaces, such as a pod's IP, or `localhost`
instead of `0.0.0.0`. For more information, see
[CWE-1327: Binding to an Unrestricted IP Address](https://cwe.mitre.org/data/definitions/1327.html).

From Collector v0.110.0, the default endpoints for all servers in Collector
components are set to `localhost:4317` for `gRPC` ports or `localhost:4318` for
`http` ports. For earlier versions of the Collector, change the default endpoint
from `0.0.0.0` to `localhost` in all components by enabling the
`component.UseLocalHostAsDefaultHost` feature gate.

If `localhost` resolves to a different IP due to your DNS settings, then
explicitly use the loopback IP instead: `127.0.0.1` for IPv4 or `::1` for IPv6.
For example, here's an IPv4 configuration using a `gRPC` port:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 127.0.0.1:4317
```

In IPv6 setups, make sure your system supports both IPv4 and IPv6 loopback
addresses so the network functions properly in dual-stack environments and
applications, where both protocol versions are used.

If you are working in environments that have nonstandard networking setups, such
as Docker or Kubernetes, see the
[example configurations](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks)
in our component developer documentation for ideas on how to bind your component
endpoints.

## Scrub sensitive data

[Processors](/docs/collector/configuration/#processors) sit between receivers
and exporters. They are responsible for processing telemetry before it's
analyzed. From a security perspective, processors are useful in a few ways.

You can use the OpenTelemetry Collector to scrub sensitive data before exporting
it to a backend. Configure the Collector to obfuscate or scrub sensitive data
before exporting.

<!--- TODO: SHOULD configure obfuscation/scrubbing of sensitive metadata. How? Give more details and/or link to an existing document -->

Use OpenTelemetry Collector's `redaction` processor to scrub sensitive data.

<!--- TODO: Give example config for the redaction processor or remove this line. --->

## Safeguard resource utilization

Processors also offer safeguards for resource utilization. After implementing
safeguards for resource utilization in your
[hosting infrastructure](/docs/security/hosting-best-practices/), make sure your
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

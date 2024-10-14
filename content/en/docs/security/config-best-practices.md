---
title: Collector configuration best practices
linkTitle: Collector configuration
weight: 112
---

When configuring the OpenTelemetry (OTel) Collector, consider these best
practices to better secure your Collector instance.

## Create secure configurations

Follow these guidelines to secure your Collector's configuration and its
pipelines.

### Store your configuration securely

The Collector's configuration might contain sensitive information including:

- Authentication information such as API tokens.
- TLS certificates including private keys.

You should store sensitive information securely such as on an encrypted
filesystem or secret store. You can use environment variables to handle
sensitive and non-sensitive data as the Collector supports
[environment variable expansion](/docs/collector/configuration/#environment-variables).

### Use encryption and authentication

Your OTel Collector configuration should include encryption and authentication.

- For communication encryption, see
  [Configuring certificates](/docs/collector/configuration/#setting-up-certificates).
- For authentication, use the OTel Collector's authentication mechanism, as
  described in [Authentication](/docs/collector/configuration/#authentication).

### Minimize the components in your configuration

We recommend limiting the set of components in your Collector configuration to
only those you need. Minimizing the number of components you use minimizes the
attack surface exposed.

- Use the
  [OpenTelemetry Collector Builder (`ocb`)](/docs/collector/custom-collector) to
  create a Collector distribution that uses only the components you need.
- If you find that you have unused receivers and exporters, remove them from
  your configuration.

### Configure with care

Some components can increase the security risk of your Collector pipelines.

- Receivers and exporters can be push- or pull-based. In either case, you should
  establish the connection at least over a secure channel, potentially
  authenticated as well.
- Receivers and exporters might expose buffer, queue, payload, and worker
  settings using configuration parameters. If these settings are available, you
  should proceed with caution before modifying the default configuration values.
  Improperly setting these values might expose the OpenTelemetry Collector to
  additional attack vectors.

## Manage specific security risks

Configure your Collector to block these threats to security.

### Protect against denial of service attacks

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
`component.UseLocalHostAsDefaultHost`
[feature gate](https://github.com/open-telemetry/opentelemetry-collector/tree/main/featuregate).

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

### Scrub sensitive data

[Processors](/docs/collector/configuration/#processors) are the Collector
components that sit between receivers and exporters. They are responsible for
processing telemetry before it's analyzed. You can use the OpenTelemetry
Collector's `redaction` processor to obfuscate or scrub sensitive data before
exporting it to a backend.

The
[`redaction` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)
deletes span, log, and metric datapoint attributes that don't match a list of
allowed attributes. It also masks attribute values that match a blocked value
list. Attributes that aren't on the allowed list are removed before any value
checks are done.

For example, here is a configuration that masks values containing credit card
numbers:

```yaml
processors:
  redaction:
    allow_all_keys: false
    allowed_keys:
      - description
      - group
      - id
      - name
    ignored_keys:
      - safe_attribute
    blocked_values: # Regular expressions for blocking values of allowed span attributes
      - '4[0-9]{12}(?:[0-9]{3})?' # Visa credit card number
      - '(5[1-5][0-9]{14})' # MasterCard number
    summary: debug
```

See the
[README](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)
for more details on adding the `redaction` processor to your Collector
configuration.

### Safeguard resource utilization

After implementing safeguards for resource utilization in your
[hosting infrastructure](/docs/security/hosting-best-practices/), consider
adding these safeguards to your OpenTelemetry Collector configuration.

Batching your telemetry and limiting the memory available to your Collector can
prevent out-of-memory errors and usage spikes. You can also handle traffic
spikes by adjusting queue sizes to manage memory usage while avoiding data loss.
For example, use the
[`exporterhelper`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)
to manage queue size for your `otlp` exporter:

```yaml
exporters:
  otlp:
    endpoint: <ENDPOINT>
    sending_queue:
      queue_size: 800
```

Filtering unwanted telemetry is another way you can protect your Collector's
resources. Not only does filtering protect your Collector instance, but it also
reduces the load on your backend. You can use the
[`filter` processor](/docs/collector/transforming-telemetry/#basic-filtering) to
drop logs, metrics, and spans you don't need. For example, here's a
configuration that drops non-HTTP spans:

```yaml
processors:
  filter:
    error_mode: ignore
    traces:
      span:
        - attributes["http.request.method"] == nil
```

You can also configure your components with appropriate timeout and retry
limits. These limits should allow your Collector to handle failures without
accumulating too much data in memory. See the
[`exporterhelper` documentation](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)
for more information.

Finally, consider using compression with your exporters to reduce the send size
of your data and conserve network and CPU resources. By default, the
[`otlp` exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter)
uses `gzip` compression.

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

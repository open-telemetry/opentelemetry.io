---
title: Collector configuration best practices
linkTitle: Collector configuration
weight: 112
cSpell:ignore: exporterhelper
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

### Minimize the number of components

We recommend limiting the set of components in your Collector configuration to
only those you need. Minimizing the number of components you use minimizes the
attack surface exposed.

- Use the
  [OpenTelemetry Collector Builder (`ocb`)](/docs/collector/custom-collector) to
  create a Collector distribution that uses only the components you need.
- Remove unused components from your configuration.

### Configure with care

Some components can increase the security risk of your Collector pipelines.

- Receivers, exporters, and other components should establish network
  connections over a secure channel, potentially authenticated as well.
- Receivers and exporters might expose buffer, queue, payload, and worker
  settings using configuration parameters. If these settings are available, you
  should proceed with caution before modifying the default configuration values.
  Improperly setting these values might expose the OpenTelemetry Collector to
  additional attack vectors.

## Set permissions carefully

Avoid running the Collector as a root user. Some components might require
special permissions, however. In those cases, follow the principle of least
privilege and make sure your components only have the access they need to do
their job.

### Observers

Observers are implemented as extensions. Extensions are a type of component that
adds capabilities on top of the primary functions of the Collector. Extensions
don't require direct access to telemetry and aren't part of pipelines, but they
can still pose security risks if they require special permissions.

An observer discovers networked endpoints such as a Kubernetes pod, Docker
container, or local listening port on behalf of the
[receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/receivercreator/README.md).
In order to discover services, observers might require greater access. For
example, the `k8s_observer` requires
[role-based access control (RBAC) permissions](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/k8sobserver#setting-up-rbac-permissions)
in Kubernetes.

## Manage specific security risks

Configure your Collector to block these security threats.

### Protect against denial of service attacks

For server-like receivers and extensions, you can protect your Collector from
exposure to the public internet or to wider networks than necessary by binding
these components' endpoints to addresses that limit connections to authorized
users. Try to always use specific interfaces, such as a pod's IP, or `localhost`
instead of `0.0.0.0`. For more information, see
[CWE-1327: Binding to an Unrestricted IP Address](https://cwe.mitre.org/data/definitions/1327.html).

From Collector v0.110.0, the default host for all servers in Collector
components is `localhost`. For earlier versions of the Collector, change the
default endpoint from `0.0.0.0` to `localhost` in all components by enabling the
`component.UseLocalHostAsDefaultHost`
[feature gate](https://github.com/open-telemetry/opentelemetry-collector/tree/main/featuregate).

If `localhost` resolves to a different IP due to your DNS settings, then
explicitly use the loopback IP instead: `127.0.0.1` for IPv4 or `::1` for IPv6.
For example, here's an IPv4 configuration using a gRPC port:

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
as Docker or Kubernetes, `localhost` might not work as expected. The following
examples show setups for the OTLP receiver gRPC endpoint. Other Collector
components might need similar configuration.

#### Docker

You can run the Collector in Docker by binding to the correct address. Here is a
`config.yaml` configuration file for an OTLP exporter in Docker:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: my-hostname:4317 # Use the same hostname from your docker run command
```

In your `docker run` command, use the `--hostname` argument to bind the
Collector to the `my-hostname` address. You can access the Collector from
outside that Docker network (for example, on a regular program running on the
host) by connecting to `127.0.0.1:4567`. Here is an example `docker run`
command:

```shell
docker run --hostname my-hostname --name container-name -p 127.0.0.1:4567:4317 otel/opentelemetry-collector:{{% param collector_vers %}}
```

#### Docker Compose

Similarly to plain Docker, you can run the Collector in Docker by binding to the
correct address.

The Docker `compose.yaml` file:

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:{{% param collector_vers %}}
    ports:
      - '4567:4317'
```

The Collector `config.yaml` file:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: otel-collector:4317 # Use the service name from your Docker compose file
```

You can connect to this Collector from another Docker container running in the
same network by connecting to `otel-collector:4317`. You can access the
Collector from outside that Docker network (for example, on a regular program
running on the host) by connecting to `127.0.0.1:4567`.

#### Kubernetes

If you run the Collector as a `DaemonSet`, you can use a configuration like the
following:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: collector
spec:
  selector:
    matchLabels:
      name: collector
  template:
    metadata:
      labels:
        name: collector
    spec:
      containers:
        - name: collector
          image: otel/opentelemetry-collector:{{% param collector_vers %}}
          ports:
            - containerPort: 4317
              hostPort: 4317
              protocol: TCP
              name: otlp-grpc
            - containerPort: 4318
              hostPort: 4318
              protocol: TCP
              name: otlp-http
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
```

In this example, you use the
[Kubernetes Downward API](https://kubernetes.io/docs/concepts/workloads/pods/downward-api/)
to get your own Pod IP, then bind to that network interface. Then, we use the
`hostPort` option to ensure that the Collector is exposed on the host. The
Collector's config should look like this:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
```

You can send OTLP data to this Collector from any Pod on the Node by accessing
`${MY_HOST_IP}:4317` to send OTLP over gRPC and `${MY_HOST_IP}:4318` to send
OTLP over HTTP, where `MY_HOST_IP` is the Node's IP address. You can get this IP
from the Downward API:

```yaml
env:
  - name: MY_HOST_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP
```

When sending OTLP data to `hostPort` using this method, the default configuration of
the [`k8sattributes` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 
prevents enriching pod OTLP data with k8s metadata. For example, the k8s.pod.name and
the k8s.namespace.name attributes won't be included. If pod association rules aren't 
configured for the `k8sattributes` processor, resources are associated with metadata only
by connection's IP Address.  This happens because the Collector sees this connection
as coming from the node and is unable to associate the pod with incoming OTLP data.

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
[documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)
to learn how to add the `redaction` processor to your Collector configuration.

### Safeguard resource utilization

After implementing safeguards for resource utilization in your
[hosting infrastructure](../hosting-best-practices/), consider also adding these
safeguards to your OpenTelemetry Collector configuration.

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

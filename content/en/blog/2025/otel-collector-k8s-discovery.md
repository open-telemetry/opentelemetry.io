---
title: Kubernetes annotation-based discovery for the OpenTelemetry Collector
linkTitle: K8s annotation-based discovery
date: 2025-01-27
author: >
  [Dmitrii Anoshin](https://github.com/dmitryax) (Cisco/Splunk), [Christos
  Markou](https://github.com/ChrsMark) (Elastic)
sig: Collector
issue: opentelemetry-collector-contrib#34427
cSpell:ignore: Anoshin Dmitrii Markou
---

In the world of containers and [Kubernetes](https://kubernetes.io/),
observability is crucial. Users need to know the status of their workloads at
any given time. In other words, they need observability into moving objects.

This is where the [OpenTelemetry Collector](/docs/collector/) and its
[receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/receivercreator)
component come in handy. Users can set up fairly complex monitoring scenarios
with a self-service approach, following the principle of least privilege at the
cluster level.

The self-service approach is great, but how much self-service can it actually
be? In this blog post, we will explore a newly added feature of the Collector
that makes dynamic workload discovery even easier, providing a seamless
experience for both administrators and users.

## Automatic discovery for containers and pods

Applications running on containers and pods become moving targets for the
monitoring system. With automatic discovery, monitoring agents like the
Collector can track changes at the container and pod levels and dynamically
adjust the monitoring configuration.

Today, the Collector—and specifically the receiver creator—can provide such an
experience. Using the receiver creator, observability users can define
configuration "templates" that rely on environment conditions. For example, as
an observability engineer, you can configure your Collectors to enable the
[NGINX receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/nginxreceiver)
when a NGINX pod is deployed on the cluster. The following configuration can
achieve this:

```yaml
receivers:
  receiver_creator:
    watch_observers: [k8s_observer]
    receivers:
      nginx:
        rule: type == "port" && port == 80 && pod.name matches "(?i)nginx"
        config:
          endpoint: 'http://`endpoint`/nginx_status'
          collection_interval: '15s'
```

The previous configuration is enabled when a pod is discovered via the
Kubernetes API that exposes port `80` (the known port for NGINX) and its name
matches the `nginx` keyword.

This is great, and as an SRE or Platform Engineer managing an observability
solution, you can rely on this to meet your users' needs for monitoring NGINX
workloads. However, what happens if another team wants to monitor a different
type of workload, such as Apache servers? They would need to inform your team,
and you would need to update the configuration with a new conditional
configuration block, take it through a pull request and review process, and
finally deploy it. This deployment would require the Collector instances to
restart for the new configuration to take effect. While this process might not
be a big deal for some teams, there is definitely room for improvement.

So, what if, as a Collector user, you could simply enable automatic discovery
and then let your cluster users tell the Collector how their workloads should be
monitored by annotating their pods properly? That sounds awesome, and it’s not
actually something new. OpenTelemetry already supports auto-instrumentation
through the [Kubernetes operator](/docs/kubernetes/operator/automatic/),
allowing users to instrument their applications automatically just by annotating
their pods. In addition, this is a feature that other monitoring agents in the
observability industry already support, and users are familiar with it.

All this motivation led the OpenTelemetry community
([GitHub issue](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/17418))
to create a similar feature for the Collector. We are happy to share that
autodiscovery based on Kubernetes annotations is now supported in the Collector
([GitHub issue](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/34427))!

## A solution

The solution is built on top of the existing functionality provided by the
[Kubernetes observer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/extension/observer/k8sobserver)
and
[receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/receivercreator).

The K8s observer notifies the receiver creator about the objects appearing in
the K8s cluster and provides all the information about them. In addition to the
K8s object metadata, the observer supplies information about the discovered
endpoints that the collector can connect to. This means that each discovered
endpoint can potentially be used by a particular scraping receiver to fetch
metrics data.

Each scraping receiver has a default configuration with only one required field:
`endpoint`. Given that the endpoint information is provided by the Kubernetes
observer, the only information that the user needs to provide explicitly is
which receiver/scraper should be used to scrape data from a discovered endpoint.
That information can be configured on the Collector, but as mentioned before,
this is inconvenient. A much more convenient place to define which receiver can
be used to scrape telemetry from a particular pod is the pod itself. Pod’s
annotations is the natural place to put that kind of detail. Given that the
receiver creator has access to the annotations, it can instantiate the proper
receiver with the receiver’s default configuration and discovered endpoint.

The following annotation instructs the receiver creator that this particular pod
runs NGINX, and the
[NGINX receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.117.0/receiver/nginxreceiver)
can be used to scrape metrics from it:

```yaml
io.opentelemetry.discovery.metrics/scraper: nginx
```

Apart from that, the discovery on the pod needs to be explicitly enabled with
the following annotation:

```yaml
io.opentelemetry.discovery.metrics/enabled: 'true'
```

In some scenarios, the default receiver’s configuration is not suitable for
connecting to a particular pod. In that case, it’s possible to define custom
configuration as part of another annotation:

```yaml
io.opentelemetry.discovery.metrics/config: |
  endpoint: "http://`endpoint`/nginx_status"
  collection_interval: '20s'
  initial_delay: '20s'
  read_buffer_size: '10'
```

It’s important to mention that the configuration defined in the annotations
cannot point the receiver creator to another pod. The Collector will reject such
configurations.

In addition to the metrics scraping, the annotation-based discovery also
supports log collection with filelog receiver. The following annotation can be
used to enable log collection on a particular pod:

```yaml
io.opentelemetry.discovery.logs/enabled: 'true'
```

Similar to metrics, an optional configuration can be provided in the following
form:

```yaml
io.opentelemetry.discovery.logs/config: |
  max_log_size: "2MiB"
  operators:
  - type: container
    id: container-parser
  - type: regex_parser
    regex: '^(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (?P<sev>[A-Z]*) (?P<msg>.*)$'
```

If the set of filelog receiver operators needs to be changed, the full list,
including the default container parser, has to be redefined because list config
fields are entirely replaced when merged into the default configuration struct.

The discovery functionality has to be explicitly enabled in the receiver creator
by adding the following configuration field:

```yaml
receivers:
  receiver_creator:
    watch_observers: [k8s_observer]
    discovery:
      enabled: true
```

## Give it a try

If you are an OpenTelemetry Collector user on Kubernetes, and you find this new
feature interesting, see [Receiver Creator configuration] section to learn more.

Give it a try and let us know what you think via the `#otel-collector` channel
of the [CNCF Slack workspace](https://slack.cncf.io/).

[Receiver Creator configuration]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.117.0/receiver/receivercreator/README.md#generate-receiver-configurations-from-provided-hints

---
title: Management
description: How to manage your OpenTelemetry collector deployment at scale
weight: 23
---

This document describes how you can manage your OpenTelemetry collector
deployment at scale.

To get the most out of this page you should know how to install and configure
the collector. These topics are covered elsewhere:

- [Getting Started][otel-collector-getting-started] to understand how to install
  the OpenTelemetry collector.
- [Configuration][otel-collector-configuration] for how to configure the
  OpenTelemetry collector, setting up telemetry pipelines.

## Basics

Telemetry collection at scale requires a structured approach to manage agents.
Typical agent management tasks include:

1. Querying the agent information and configuration. The agent information can
   include its version, operating system related information, or capabilities.
   The configuration of the agent refers to its telemetry collection setup, for
   example, the OpenTelemetry collector
   [configuration][otel-collector-configuration].
1. Upgrading/downgrading agents and management of agent-specific packages,
   including the base agent functionality and plugins.
1. Applying new configurations to agents. This might be required because of
   changes in the environment or due to policy changes.
1. Health and performance monitoring of the agents, typically CPU and memory
   usage and also agent-specific metrics, for example, the rate of processing or
   backpressure-related information.
1. Connection management between a control plane and the agent such as handling
   of TLS certificates (revocation and rotation).

Not every use case requires support for all of the above agent management tasks.
In the context of OpenTelemetry task _4. Health and performance monitoring_ is
ideally done using OpenTelemetry.

## OpAMP

Observability vendors and cloud providers offer proprietary solutions for agent
management. In the open source observability space, there is an emerging
standard that you can use for agent management: Open Agent Management Protocol
(OpAMP).

The [OpAMP specification][opamp-spec] defines how to manage a fleet of telemetry
data agents. These agents can be [OpenTelemetry collectors][otel-collector],
Fluent Bit or other agents in any arbitrary combination.

> **Note** The term "agent" is used here as a catch-all term for OpenTelemetry
> components that respond to OpAMP, this could be the collector but also SDK
> components.

OpAMP is a client/server protocol that supports communication over HTTP and over
WebSockets:

- The **OpAMP server** is part of the control plane and acts as the
  orchestrator, managing a fleet of telemetry agents.
- The **OpAMP client** is part of the data plane. The client side of OpAMP can
  be implemented in-process, for example, as the case in [OpAMP support in the
  OpenTelemetry collector][opamp-in-otel-collector]. The client side of OpAMP
  could alternatively be implemented out-of-process. For this latter option, you
  can use a supervisor that takes care of the OpAMP specific communication with
  the OpAMP server and at the same time controls the telemetry agent, for
  example to apply a configuration or to upgrade it. Note that the
  supervisor/telemetry communication is not part of OpAMP.

Let's have a look at a concrete setup:

![OpAMP example setup](../img/opamp.svg)

1. The OpenTelemetry collector, configured with pipeline(s) to:
   - (A) receive signals from downstream sources
   - (B) export signals to upstream destinations, potentially including
     telemetry about the collector itself (represented by the OpAMP `own_xxx`
     connection settings).
1. The bi-directional OpAMP control flow between the control plane implementing
   the server-side OpAMP part and the collector (or a supervisor controlling the
   collector) implementing OpAMP client-side.

You can try out a simple OpAMP setup yourself by using the [OpAMP protocol
implementation in Go][opamp-go]. For the following walkthrough you will need to
have Go in version 1.19 or above available.

We will set up a simple OpAMP control plane consisting of an example OpAMP
server and let an OpenTelemetry collector connect to it via an example OpAMP
supervisor.

First, clone the `open-telemetry/opamp-go` repo:

```sh
git clone https://github.com/open-telemetry/opamp-go.git
```

Next, we need an OpenTelemetry collector binary that the OpAMP supervisor can
manage. For that, install the [OpenTelemetry Collector Contrib][otelcolcontrib]
distro. The path to the collector binary (where you installed it into) is
referred to as `$OTEL_COLLECTOR_BINARY` in the following.

In the `./opamp-go/internal/examples/server` directory, launch the OpAMP server:

```console
$ go run .
2023/02/08 13:31:32.004501 [MAIN] OpAMP Server starting...
2023/02/08 13:31:32.004815 [MAIN] OpAMP Server running...
```

In the `./opamp-go/internal/examples/supervisor` directory create a file named
`supervisor.yaml` with the following content (telling the supervisor where to
find the server and what OpenTelemetry collector binary to manage):

```yaml
server:
  endpoint: ws://127.0.0.1:4320/v1/opamp

agent:
  executable: $OTEL_COLLECTOR_BINARY
```

> **Note** Make sure to replace `$OTEL_COLLECTOR_BINARY` with the actual file
> path. For example, in Linux or macOS, if you installed the collector in
> `/usr/local/bin/` then you would replace `$OTEL_COLLECTOR_BINARY` with
> `/usr/local/bin/otelcol`.

Next, create a collector configuration as follows (save it in a file called
`effective.yaml` in the `./opamp-go/internal/examples/supervisor` directory):

```yaml
receivers:
  prometheus/own_metrics:
    config:
      scrape_configs:
        - job_name: "otel-collector"
          scrape_interval: 10s
          static_configs:
            - targets: ["0.0.0.0:8888"]
  hostmetrics:
    collection_interval: 10s
    scrapers:
      load:
      filesystem:
      memory:
      network:

exporters:
  logging:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics, prometheus/own_metrics]
      exporters: [logging]
```

Now it's time to launch the supervisor (which in turn will launch your
OpenTelemetry collector):

```console
$ go run .
2023/02/08 13:32:54 Supervisor starting, id=01GRRKNBJE06AFVGQT5ZYC0GEK, type=io.opentelemetry.collector, version=1.0.0.
2023/02/08 13:32:54 Starting OpAMP client...
2023/02/08 13:32:54 OpAMP Client started.
2023/02/08 13:32:54 Starting agent /usr/local/bin/otelcol
2023/02/08 13:32:54 Connected to the server.
2023/02/08 13:32:54 Received remote config from server, hash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.
2023/02/08 13:32:54 Agent process started, PID=13553
2023/02/08 13:32:54 Effective config changed.
2023/02/08 13:32:54 Enabling own metrics pipeline in the config<F11>
2023/02/08 13:32:54 Effective config changed.
2023/02/08 13:32:54 Config is changed. Signal to restart the agent.
2023/02/08 13:32:54 Agent is not healthy: Get "http://localhost:13133": dial tcp [::1]:13133: connect: connection refused
2023/02/08 13:32:54 Stopping the agent to apply new config.
2023/02/08 13:32:54 Stopping agent process, PID=13553
2023/02/08 13:32:54 Agent process PID=13553 successfully stopped.
2023/02/08 13:32:54 Starting agent /usr/local/bin/otelcol
2023/02/08 13:32:54 Agent process started, PID=13554
2023/02/08 13:32:54 Agent is not healthy: Get "http://localhost:13133": dial tcp [::1]:13133: connect: connection refused
2023/02/08 13:32:55 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:55 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:56 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:57 Agent is healthy.
```

If everything worked out you should now be able to go to
[http://localhost:4321/](http://localhost:4321/) and access the OpAMP server UI
where you should see your collector listed, managed by the supervisor:

![OpAMP example setup](../img/opamp-server-ui.png)

You can also query the collector for the metrics exported (note the label
values):

```console
$ curl localhost:8888/metrics
...
# HELP otelcol_receiver_accepted_metric_points Number of metric points successfully pushed into the pipeline.
# TYPE otelcol_receiver_accepted_metric_points counter
otelcol_receiver_accepted_metric_points{receiver="prometheus/own_metrics",service_instance_id="01GRRKNBJE06AFVGQT5ZYC0GEK",service_name="io.opentelemetry.collector",service_version="1.0.0",transport="http"} 322
# HELP otelcol_receiver_refused_metric_points Number of metric points that could not be pushed into the pipeline.
# TYPE otelcol_receiver_refused_metric_points counter
otelcol_receiver_refused_metric_points{receiver="prometheus/own_metrics",service_instance_id="01GRRKNBJE06AFVGQT5ZYC0GEK",service_name="io.opentelemetry.collector",service_version="1.0.0",transport="http"} 0
```

## Other information

- Blog post [Using OpenTelemetry OpAMP to modify service telemetry on the
  go][blog-opamp-service-telemetry]
- YouTube videos:
  - [Lightning Talk: Managing OpenTelemetry Through the OpAMP
    Protocol][opamp-lt]
  - [What is OpAMP & What is BindPlane][opamp-bindplane]

[otel-collector]: /docs/collector/
[otel-collector-getting-started]: /docs/collector/getting-started
[otel-collector-configuration]: /docs/collector/configuration
[opamp-spec]:
  https://github.com/open-telemetry/opamp-spec/blob/main/specification.md
[opamp-in-otel-collector]:
  https://docs.google.com/document/d/1KtH5atZQUs9Achbce6LiOaJxLbksNJenvgvyKLsJrkc/edit#heading=h.ioikt02qpy5f
[opamp-go]: https://github.com/open-telemetry/opamp-go
[otelcolcontrib]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[blog-opamp-service-telemetry]: /blog/2022/opamp/
[opamp-lt]: https://www.youtube.com/watch?v=LUsfZFRM4yo
[opamp-bindplane]: https://www.youtube.com/watch?v=N18z2dOJSd8

---
title: 'Hardening the Collector Episode 1: A new default bind address'
linkTitle: A new default bind address for the Collector
date: 2024-07-02
author: '[Pablo Baeyens](https://github.com/mx-psi) (OpenTelemetry, Datadog)'
issue: 4760
sig: Collector SIG
# prettier-ignore
cSpell:ignore: awsfirehose awsproxy awsxray Baeyens jaegerremotesampling loki remotetap sapm signalfx skywalking splunk
---

The OpenTelemetry Collector recently went through a security audit sponsored by
the [CNCF](https://www.cncf.io/), facilitated by [OSTIF](https://ostif.org/),
and performed by [7ASecurity](https://7asecurity.com/). As part of this process
we published a security advisory related to a
[DoS vulnerability](/blog/2024/cve-2024-36129/) that was
[fully addressed in v0.102.1](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.102.1).

The security audit also motivated us to think about ways to harden official
Collector builds and have a more secure default configuration. We are working on
adopting [several][releases-586] [best][core-10469] [practices][core-10470] that
were recommended in the audit to achieve this and we will be publishing a series
of blog posts to keep the community informed. While we expect the report to be
made public soon, we can already say that we are very satisfied with the
confirmation that the Collector has proven to be very secure, highlighting the
secure coding practices and processes we already have in place.

One of the changes we have been working on is changing the default bind address
for Collector servers, such as those exposed by receivers or extensions that
listen for incoming connections. Up to v0.103.0, the default behavior was to
listen on all network interfaces by using the
[unspecified address `0.0.0.0`](https://en.wikipedia.org/wiki/0.0.0.0) on server
addresses. While this is a convenient default for test cases and development
environments, it is
[not the recommended practice for production environments](https://cwe.mitre.org/data/definitions/1327.html),
since it can expose the Collector servers to unnecessary risks. Starting on
v0.104.0 the default bind address becomes `localhost` for all Collector servers.

It has been a long way to get here. We started discussing this in relation to
[CVE-2022-27664](https://github.com/advisories/GHSA-69cg-p879-7622) on [v0.63.0
(September 2022)][core-6151], when we added a warning and improved our
documentation. On [v0.94.0 (September 2023)][core-8510], we decided to add a
feature gate, `component.UseLocalHostAsDefaultHost` to allow users to opt-in to
the new behavior. Finally, this feature gate was enabled by default on [v0.104.0
(June 2024)][core-10352] motivated by the security audit and
[CVE-2024-36129](/blog/2024/cve-2024-36129/).

## What have we changed?

Starting on v0.104.0, the default bind address of all servers exposed by the
Collector are `localhost` instead of `0.0.0.0`. For example, the OTLP receiver
default endpoints for OTLP/gRPC and OTLP/HTTP are now `localhost:4317` and
`localhost:4318` respectively. The full list of components affected by this
change is:

- [`otlp` receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver#otlp-receiver)
- [`awsfirehose` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awsfirehosereceiver#aws-kinesis-data-firehose-receiver)
- [`awsxray` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awsxrayreceiver#aws-x-ray-receiver)
- [`influxdb` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/influxdbreceiver#influxdb-receiver)
- [`jaeger` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/jaegerreceiver#jaeger-receiver)
- [`loki` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/lokireceiver#loki-receiver)
- [`opencensus` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/e228ef6c18aa2f05b2173f20be0578f714d0128b/receiver/opencensusreceiver#opencensus-receiver)
- [`sapm` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/6a2bd15cc941859767c7043a0597b8b0f6dd9f64/receiver/sapmreceiver#sapm-receiver)
- [`signalfx` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/signalfxreceiver#signalfx-receiver)
- [`skywalking` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/skywalkingreceiver#skywalking-receiver)
- [`splunk_hec` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/splunkhecreceiver#splunk-hec-receiver)
- [`zipkin` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/zipkinreceiver#zipkin-receiver)
- [`zookeeper` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/zookeeperreceiver#zookeeper-receiver)
- [`awsproxy` extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/awsproxy#aws-proxy)
- [`health_check` extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/healthcheckextension#health-check)
- [`jaegerremotesampling` extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/jaegerremotesampling#jaegers-remote-sampling-extension)
- [`remotetap` processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/remotetapprocessor#remote-tap-processor)

When in doubt, check the specific components' documentation to see the new
default values.

Starting on the [OpenTelemetry Collector Helm Chart][helm-chart] v0.47.1 and on
v0.87.0 of the OpenTelemetry Collector official Docker images we updated the
default configuration for all components to explicitly set the endpoints to an
explicit value.

## What does it mean to me?

If you are relying on the default configuration you may need to start explicitly
setting the endpoint on your Collector components. For example, if you are using
the following configuration with the OTLP receiver:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
```

You may now need to explicitly set the `otlp::protocols::grpc::endpoint`
[configuration setting](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.103.0/receiver/otlpreceiver/config.md):

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:HOST_IP}:4317
```

where the `HOST_IP` environment variable is set to the bind address you want to
use (for example, `status.podIP` on Kubernetes).

Because of the changes in the Collector Helm Chart and Collector Docker images
you are not affected if using the default configuration on either of these.

## How can I prepare for this change?

Since v0.63.0 the Collector logs a warning related to this when you have an
endpoint using the 0.0.0.0 address. Before upgrading, you can check for this
warning and address it. From v0.94.0 to v0.103.0 you can also preview the impact
of this change by [enabling][feature-gate] the
`component.UseLocalHostAsDefaultHost` feature gate.

Addressing this change should be straightforward, however, due to the number of
components that are impacted, starting on v0.104.0 you can temporarily opt out
of this change by disabling the `component.UseLocalHostAsDefaultHost` feature
gate so you can work on addressing this at your own pace. This feature gate will
be marked as stable in a future Collector release, so we recommend addressing
this as soon as possible.

## What's next?

As we work on adopting the best practices recommended by the security audit, we
will be publishing more blog posts to keep the community informed. This will
include hardening the Collector binaries on macOS and further the default
behavior of Collector servers. Stay tuned!

[helm-chart]:
  https://github.com/open-telemetry/opentelemetry-helm-charts?tab=readme-ov-file#opentelemetry-collector
[feature-gate]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/v0.103.0/featuregate#controlling-gates
[releases-586]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/issues/586
[core-6151]:
  https://github.com/open-telemetry/opentelemetry-collector/issues/6151
[core-8510]:
  https://github.com/open-telemetry/opentelemetry-collector/issues/8510
[core-10469]:
  https://github.com/open-telemetry/opentelemetry-collector/issues/10469
[core-10470]:
  https://github.com/open-telemetry/opentelemetry-collector/issues/10470
[core-10352]:
  https://github.com/open-telemetry/opentelemetry-collector/pull/10352

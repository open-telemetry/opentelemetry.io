---
title: OpenTelemetry eBPF Instrumentation Marks the First Release
linkTitle: OBI First Release
date: 2025-11-03
author: >-
  [Nikola Grcevski](https://github.com/grcevski) (Grafana Labs), [Tyler
  Yahn](https://github.com/MrAlias) (Splunk)
issue: 8295
sig: eBPF Instrumentation
cSpell:ignore: Beyla Coralogix Grcevski Odigos uninstrumented Yahn
---

Following a significant collaboration between Grafana Labs, Splunk, Coralogix,
Odigos and many other community members, we are thrilled to announce the first
alpha release of [OpenTelemetry eBPF
Instrumentation][otel-ebpf-instrumentation], or OBI for short.

This event marks a significant milestone after the project, originally Grafana
Beyla, was donated earlier this year by Grafana Labs. The development of eBPF
instrumentation has significantly sped up after the project became managed under
the OpenTelemetry umbrella. Many new protocols have been added, quality has
improved - especially when deploying at scale, and tests are running 10 times
faster. It’s a true testament to the value of the OpenTelemetry community.

## So what is OpenTelemetry eBPF Instrumentation and why should you care?

Unlike many other OpenTelemetry instrumentation approaches, OpenTelemetry eBPF
instrumentation (OBI) runs out-of-process and instruments at the protocol level,
rather than at the library level. It leverages the deep kernel integration,
process isolation, runtime safety, and performance benefits of the eBPF
technology.

Since OBI instruments at the protocol level, it means that you can essentially
instrument all applications (all programming languages, all libraries) with zero
effort, with a single command and you’ll always get a consistent picture. Let’s
breakdown this previous statement a bit into what it actually means for the end
user:

1. No restarts, no code changes, no application configuration changes! OBI alone
   provides fully automatic capture of metrics and traces. The beauty of eBPF is
   that you can drop something into a running environment and be certain it will
   not destabilize your system/cluster/application.
2. No new application dependencies - no new security vulnerabilities. Since OBI
   runs out-of-process, we are not adding anything to your application. You
   don’t need to upgrade or add OpenTelemetry SDK dependencies, or patch your
   application if the OpenTelemetry SDK dependency that you have added has a
   vulnerability. You can separately secure the access to OBI on your system,
   and that won’t impact anything else you have installed.
3. Your applications never get slower by adding telemetry. Since your
   application never has to add anything or do any work to export telemetry,
   your application performance is not impacted by the telemetry capture. OBI
   does most of the work at kernel level and it’s heavily optimized for
   performance. It has minimal CPU and memory footprint even at very high
   request rates.
4. Your telemetry is always consistent across all programming languages and
   libraries. OBI will keep your telemetry at the latest stable OpenTelemetry
   spec, across all of your services, without you having to wrangle compliance.
5. Wide range of supported protocol instrumentations, HTTP/HTTPS, HTTP/2, gRPC,
   SQL, Redis, MongoDB, Kafka, GraphQL, Elasticsearch/OpenSearch, AWS S3.
   Automatic trace context propagation for all programming languages.

## Should I just use OpenTelemetry eBPF Instrumentation for everything?

Yes and …

OpenTelemetry eBPF Instrumentation (OBI) is good for certain things, but becomes
even better when combined with other OpenTelemetry technology. Let’s look at
what this means in practice.

OpenTelemetry eBPF Instrumentation is a great tool to get started with
OpenTelemetry. It can quickly get you basic signals like RED (Request Error
Duration) metrics, service graphs, and traces for certain kinds of applications.
However, since the data capture is done at the kernel level, certain levels of
detail, which can be provided by other types of OpenTelemetry instrumentation,
will not be there. Let’s look into detail what this means:

1. Give OBI a shot if you have no telemetry at all, or partial telemetry, it’s
   an easy way to get everything auto-instrumented (especially compiled
   binaries). OBI detects that an application is instrumented with another
   OpenTelemetry SDK and doesn’t duplicate signals. So it’s easy and safe to
   drop into a mix of instrumented and uninstrumented applications.
2. Give OBI a shot if your application is using a library without OpenTelemetry
   support, for example a library that’s older than officially supported
   libraries, or a library that nobody has provided instrumentation for.
3. Keep services you have successfully instrumented with the OpenTelemetry SDKs
   or agents. There’s rarely a reason to migrate off other types of
   OpenTelemetry instrumentations, unless you are experiencing significant
   performance or cost issues. In which case, OBI may be able to help.
4. While OBI is an excellent tool for gathering metrics and service graphs, it
   doesn’t have good distributed tracing support for certain languages and
   technologies. For example, it currently doesn’t handle distributed tracing
   for reactive programming frameworks, Java virtual threads or complex thread
   pools. In general, OBI distributes traces work well for Go (HTTP and gRPC),
   Node.js (HTTP), Python (HTTP), NGINX (HTTP), PHP (HTTP/FPM), while for other
   programming languages support will vary a lot based on how your application
   internally manages threads and connections. We are looking for help with
   contributions to extend the distributed tracing support more broadly. The
   distributed tracing limitations are documented in the [Distributed Traces
   with OBI][distributed-traces] section of our docs.

## To summarize

We believe that observability should be a built-in capability of modern
infrastructure, not a bolt-on cost center. OpenTelemetry eBPF Instrumentation
lets you add essential telemetry capture to your environment with a single
command line. There should be no more excuses why you are not using
OpenTelemetry. No effort, no downtime, no code or configuration changes, every
reason to give it a shot.

## Getting started with OpenTelemetry eBPF Instrumentation

Getting started with OpenTelemetry eBPF Instrumentation (OBI) is
straightforward\! You can deploy it as standalone, as a Docker image or as a
Kubernetes Daemonset (or pod sidecar). For detailed instructions on
installation, configuration, and running your application with OBI, check out
the [Getting Started guide][getting-started].

For complete examples on how to install OBI in docker environments you can check
out our many [integration test examples][integration-examples], combining
multiple programming languages, database backends and cloud services. There are
also a number of Kubernetes examples in our Kubernetes [test
repository][test-repository].

## Next steps

If you want to get in touch with us, suggest a feature we should be working on,
or follow our work and be up to date with our releases, you can always find us
on GitHub at the [OpenTelemetry eBPF Instrumentation repository][ebpf-repo]. We
also run a regular and very active [Special Interest Group (SIG) Community
Call][sigs] weekly, where you can join in and become part of our community. If
you are unable to attend our community call, you can also easily find us
asynchronously on the CNCF Community Slack channel
[\#otel-ebpf-instrumentation][slack-ebpf].

## Acknowledgments

This alpha release is the result of countless hours of work by contributors from
around the world. Thank you to everyone who has contributed code, documentation,
feedback, and enthusiasm to make this milestone possible.

[otel-ebpf-instrumentation]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation
[distributed-traces]: /docs/zero-code/obi/distributed-traces/
[getting-started]: /docs/zero-code/obi/setup/
[integration-examples]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/main/internal/test/integration
[test-repository]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/tree/main/internal/test/integration/k8s/manifests
[ebpf-repo]:
  https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation
[sigs]:
  https://github.com/open-telemetry/community?tab=readme-ov-file#sig-ebpf-instrumentation
[slack-ebpf]: https://cloud-native.slack.com/archives/C08P9L4FPKJ

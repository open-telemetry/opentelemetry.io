---
title: One-command OpenTelemetry setup on Linux hosts
linkTitle: One-command OpenTelemetry setup on Linux hosts
date: 2026-07-23
author: >-
  [Antoine Toulme](https://github.com/atoulme) (Splunk), [Michele
  Mancioppi](https://github.com/mmanciop) (Dash0)
issue: 10908
sig: Packaging SIG
cSpell:ignore: Mancioppi metapackage Toulme
---

## OpenTelemetry as system dependency

Setting up OpenTelemetry for your applications and systems depends on where
those apps and systems run. Some are very automated, especially Kubernetes,
thanks to the OpenTelemetry Operator, or AWS Lambda, with the OpenTelemetry
Lambda layers.

But the countless Java, .NET, Node.js, and Python apps running directly on Linux
hosts have had no such automation. Instrumenting those has meant downloading
agents by hand and wiring up environment variables yourself. At
[OTel Unplugged EU](/blog/2025/otel-unplugged-fosdem/) in Brussels this
February, one ask kept coming up: clear packaging, installation, and usage
paths. You asked for:

```sh
{apt|yum} install opentelemetry
```

And now you can actually do it!

## Try it out

The `opentelemetry` package installs the
[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector)
together with the OpenTelemetry SDKs and auto-instrumentation packages for Java,
.NET, Node.js, and Python. The Injector hooks into the startup of processes on
the host and activates the matching auto-instrumentation for your applications —
no changes to your application code or deployment scripts required.

Getting up and running takes three steps: install the packages, tell the SDKs
where to send the telemetry, and restart the processes you want instrumented.

### Installing the packages

The project has
[defined steps to try this out now](https://github.com/open-telemetry/opentelemetry-packaging#installing)
— for the impatient:

On Debian, Ubuntu, and derivatives, add the APT repository:

```sh
echo "deb [trusted=yes] https://open-telemetry.github.io/opentelemetry-packaging/debian stable main" | sudo tee /etc/apt/sources.list.d/opentelemetry.list
sudo apt update
sudo apt install opentelemetry
```

On Fedora, RHEL, and derivatives, add the YUM repository:

```sh
cat <<EOF | sudo tee /etc/yum.repos.d/opentelemetry.repo
[opentelemetry]
name=OpenTelemetry Auto-Instrumentation System Packages
baseurl=https://open-telemetry.github.io/opentelemetry-packaging/rpm/packages
enabled=1
gpgcheck=0
EOF
sudo dnf install opentelemetry
```

You can also install the `opentelemetry-injector` package and the
auto-instrumentation packages for the languages you want to monitor, and they
will seamlessly work together.

Read the
[full instructions](https://github.com/open-telemetry/opentelemetry-packaging#installing)
to learn more about the options and where to send data.

### Configuring where to send the telemetry

Out of the box, the auto-instrumentation sends OTLP data to `localhost`: port
`4317` for OTLP/gRPC and port `4318` for OTLP/HTTP. From there, you have two
options.

**Send telemetry directly from the SDKs**: set the endpoint and credentials in
`/etc/opentelemetry/injector/default_env.conf`, and the Injector passes them to
every instrumented process:

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com
OTEL_EXPORTER_OTLP_HEADERS=api-key=REPLACE_ME
```

**Run a Collector on the host**: keep the default `localhost` endpoints, install
the OpenTelemetry Collector on the same host, and configure it in
`/etc/otelcol/config.yaml` to forward the telemetry to its destination. The
Collector packages are not currently installed by the `opentelemetry`
metapackage; see the [Collector packaging](#collector-packaging) section for how
that is going to change.

## Brought to you by the Packaging SIG

The Packaging SIG is officially
[established](https://github.com/open-telemetry/community/blob/898a6d5b4030a806883717dff3382c06d3dbd324/projects/packaging.md)
as of May 2026.

> The goal of the Packaging SIG is to provide a product-like, idiomatic
> experience of monitoring applications running on (virtual) hosts through a
> combination of the
> [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector)
> injecting SDKs and auto-instrumentation packages,
> [OpenTelemetry eBPF Instrumentation (OBI)](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation),
> and the OpenTelemetry Collector.

We believe that OpenTelemetry should feel like a product, and work towards the
[Stable By Default vision](/blog/2025/stability-proposal-announcement/) of the
project.

We collaborate in the
[opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging)
repository, discuss in the
[#otel-packaging channel](https://cloud-native.slack.com/archives/C0AD17NMBLZ)
of the CNCF Slack, and meet
[weekly on Wednesdays at 10:00 AM PT](https://github.com/open-telemetry/community#sig-packaging).

Come by and say hi!

## The future (TM)

The packaging effort is new. There are scope, scalability, and security
enhancements on our immediate roadmap.

### Towards production

The repository is hosted on GitHub under GitHub Pages. This is not meant for
production workloads, and we will look for
[production-grade hosting solutions](https://github.com/open-telemetry/opentelemetry-packaging/issues/4).

[We don't sign packages yet](https://github.com/open-telemetry/opentelemetry-packaging/issues/23).
We will find a secure solution that still allows us to quickly release without
creating manual, error-prone steps.

### Collector packaging

We will now work to add the OpenTelemetry Collector packages to the new
repositories. They are currently published under
[opentelemetry-collector-releases](https://github.com/open-telemetry/opentelemetry-collector-releases).
Track this
[issue](https://github.com/open-telemetry/opentelemetry-collector-releases/issues/1561)
for more information.

### More languages and OBI

Today, the Injector activates SDK-based auto-instrumentation for Java, .NET,
Node.js, and Python.

For languages without SDK auto-instrumentation — think Go, Rust, C++ — we will
work with the
[OpenTelemetry eBPF Instrumentation (OBI)](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)
folks to let OBI instrument applications using eBPF.

The OpenTelemetry Injector also has plans to
[support Ruby](https://github.com/open-telemetry/opentelemetry-injector/issues/367),
so that might also happen in the foreseeable future!

## Thank you!

A big thank you to the contributors who have participated in this effort.

Thank you as well to the many reviewers of the Packaging SIG proposal and
initial implementation!

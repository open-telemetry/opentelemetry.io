---
title: OpenTelemetry on Linux hosts
linkTitle: Linux
description:
  Install OpenTelemetry as a system package to automatically instrument the
  applications running on a Linux host.
weight: 250
cSpell:ignore: metapackage
---

Setting up OpenTelemetry usually depends on where your applications run. Some
environments are highly automated, such as
[Kubernetes](/docs/platforms/kubernetes/), thanks to the OpenTelemetry Operator,
or [Functions as a Service](/docs/platforms/faas/) with the OpenTelemetry Lambda
layers. But many Java, .NET, Node.js, and Python applications run directly on
Linux hosts, where instrumenting them has traditionally meant downloading agents
by hand and wiring up environment variables yourself.

The
[OpenTelemetry Packaging SIG](https://github.com/open-telemetry/opentelemetry-packaging)
provides **system packages** that make OpenTelemetry a dependency of the host
itself. After installing a single package and restarting your applications, the
Java, .NET, Node.js, and Python processes on the host are automatically
instrumented and start emitting telemetry.

## How it works

The `opentelemetry` package is a metapackage that depends on:

- The
  [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector),
  which configures the dynamic linker so that supported runtimes load the
  matching auto-instrumentation when a process starts.
- The language-specific auto-instrumentation packages for Java, .NET, Node.js,
  and Python.

Once installed, the injector adds the auto-instrumentation to every new process
of a supported runtime on the host. Applications that were already running are
instrumented after they are restarted. By default, telemetry is exported using
OTLP to `localhost` on ports `4317` (gRPC) and `4318` (HTTP), so you typically
run a local [OpenTelemetry Collector](/docs/collector/) to receive and forward
it.

The Packaging and OBI SIGs also plan to deliver
[OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) as a system package,
extending zero-code instrumentation to additional runtimes such as Go.

## Get started

- [Installation](installation/): add the repository and install the package on
  Debian, Ubuntu, Fedora, or RHEL and derivatives.
- [Configuration](configuration/): point the injector at your Collector or
  backend and tune what gets instrumented.

## Status and limitations

> [!WARNING]
>
> The system packages are early in their journey and are **not yet meant for
> production workloads**. Expect changes as the packaging story matures.
>
> Specifically:
>
> - The APT and YUM repositories are currently hosted on GitHub Pages, which is
>   **not their final home**.
> - Packages are **not yet signed**, so the installation instructions disable
>   signature verification.
> - The [OpenTelemetry Collector](/docs/collector/) is not yet part of the base
>   metapackage; you install and run it separately for now.
>
> The Packaging SIG is actively looking for end-user feedback. Please try the
> packages and open issues in the
> [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging)
> repository.

## Learn more

- Blog post:
  [One-command OpenTelemetry setup on Linux hosts](/blog/2026/packaging-first-repo/)
- The
  [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging)
  repository and its weekly SIG meeting.

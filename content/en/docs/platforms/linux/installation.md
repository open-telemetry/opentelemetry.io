---
title: Installation
weight: 10
description:
  Add the OpenTelemetry package repository and install the system packages on
  Debian, Ubuntu, Fedora, or RHEL and derivatives.
cSpell:ignore: metapackage
---

The OpenTelemetry system packages are published to an APT repository for
Debian-based distributions and a YUM repository for RPM-based distributions.
This page covers adding the repository and installing the `opentelemetry`
metapackage, which pulls in the
[OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector)
and the auto-instrumentation for Java, .NET, Node.js, and Python.

> [!WARNING]
>
> These packages are early in their journey and are not yet meant for production
> workloads. The repositories are hosted on GitHub Pages and the packages are
> not yet signed, so the instructions below disable signature verification. See
> [Status and limitations](../#status-and-limitations).

## Debian, Ubuntu, and derivatives {#apt}

Add the APT repository and install the package:

```sh
echo "deb [trusted=yes] https://open-telemetry.github.io/opentelemetry-packaging/debian stable main" |
  sudo tee /etc/apt/sources.list.d/opentelemetry.list
sudo apt update
sudo apt install opentelemetry
```

## Fedora, RHEL, and derivatives {#yum}

Add the YUM repository and install the package:

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

## Verify the installation

Restart an application written in a supported language, or start a new one, and
confirm that it emits telemetry to your configured destination. Until you
[configure a destination](../configuration/), telemetry is sent using OTLP to
`localhost` on ports `4317` (gRPC) and `4318` (HTTP), so you need a
[Collector](/docs/collector/) or another OTLP receiver listening there to see
the data.

## Install individual languages

The `opentelemetry` metapackage installs the injector together with the
auto-instrumentation for all supported languages. If you only need a subset, you
can install the language-specific packages on their own:

- `opentelemetry-java`
- `opentelemetry-nodejs`
- `opentelemetry-dotnet`
- `opentelemetry-python`

## Next steps

- [Configuration](../configuration/): send telemetry to your Collector or
  backend and control what gets instrumented.

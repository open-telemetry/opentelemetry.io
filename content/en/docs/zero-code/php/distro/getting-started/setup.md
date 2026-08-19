---
title: Set Up OpenTelemetry PHP Distro
description: >-
  Learn how to install and configure OpenTelemetry PHP Distro to start sending
  telemetry data from your PHP application.
weight: 1
cSpell:ignore: apk dpkg fpm RoadRunner Swoole
---

Learn how to instrument your PHP application with OpenTelemetry PHP Distro and
send telemetry data to an OTLP-compatible backend.

## Prerequisites

- Have a destination for telemetry data (OTLP endpoint).
- Use a supported Linux distribution and PHP version.
- Do not run another PHP APM or OpenTelemetry agent in the same process.

For supported operating systems and PHP versions, see
[Supported technologies](/docs/zero-code/php/distro/reference/supported-technologies/).

## Limitations

Known runtime and compatibility limitations are described in
[Limitations](/docs/zero-code/php/distro/getting-started/limitations/).

## Download and install packages

Download a package for your platform from the
[GitHub Releases](https://github.com/open-telemetry/opentelemetry-php-distro/releases)
page and install it.

### RPM (RHEL/CentOS/Fedora)

```sh
sudo rpm -ivh <package-file>.rpm
```

### DEB (Debian/Ubuntu)

```sh
sudo dpkg -i <package-file>.deb
```

### APK (Alpine)

```sh
sudo apk add --allow-untrusted <package-file>.apk
```

## Configure exporter

At a minimum, set:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

Example:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-otlp-endpoint:443/"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>"
```

## Restart PHP processes

After installation and configuration, restart PHP processes (for example
`php-fpm`, Apache workers, or long-running CLI workers) so the extension loads.

## Confirm telemetry

1. Open your observability backend.
2. Find your service in traces.
3. Generate traffic if no traces are visible yet.

## Troubleshooting

- Verify configuration options in
  [Configuration](/docs/zero-code/php/distro/reference/configuration/).
- Check known constraints in
  [Limitations](/docs/zero-code/php/distro/getting-started/limitations/).
- If using Laravel Octane (Swoole or RoadRunner), see
  [Long-running PHP servers](/docs/zero-code/php/distro/reference/long-running-server/).

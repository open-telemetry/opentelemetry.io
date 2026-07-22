---
title: Limitations
description: Known limitations and constraints of OpenTelemetry PHP Distro.
weight: 2
# prettier-ignore
cSpell:ignore: basedir ComponentProvider opentelemetry-php-contrib passenv xdebug
---

This page describes known limitations and constraints of OpenTelemetry PHP
Distro.

## Running with another PHP telemetry agent

Do not run OpenTelemetry PHP Distro together with another PHP APM or
OpenTelemetry agent in the same process. Running both can cause conflicts,
duplicate instrumentation, and unstable behavior.

## `open_basedir`

If `open_basedir` is enabled in `php.ini`, the distro installation path must be
included in allowed paths, otherwise the agent may fail to load.

## `xdebug`

Running with `xdebug` is not recommended in production and may cause stability
or memory issues in instrumented processes.

## File-based configuration (`OTEL_CONFIG_FILE`)

When using file-based (declarative) configuration:

- Remote configuration (OpAMP) is not available — file-based and remote
  configuration are mutually exclusive.
- Resource detectors registered via `Registry::registerResourceDetector()` (for
  example, cloud provider detectors from `opentelemetry-php-contrib`) are not
  automatically active. They must provide a `ComponentProvider` and be
  explicitly listed in the YAML `resource.detection/development.detectors`
  section.
- The distro ships a built-in `distro` detector for `telemetry.distro.name` and
  `telemetry.distro.version` attributes. See
  [Configuration](/docs/zero-code/php-distro/reference/configuration/#distro-resource-detector)
  for usage.
- Environment variable substitution (`${VAR_NAME}`) in YAML files relies on
  `$_SERVER` to read values. In web server contexts (Apache, nginx+FPM), process
  environment variables are not automatically available in `$_SERVER`. To use
  `${VAR_NAME}` substitution in your YAML configuration, ensure the variables
  are exposed to PHP:
  - **Apache (mod_php)**: Use `PassEnv VAR_NAME` or `SetEnv VAR_NAME value` in
    your virtual host configuration.
  - **PHP-FPM**: Set `env[VAR_NAME] = value` in your FPM pool configuration, or
    set `clear_env = no` to pass all process environment variables.
  - Alternatively, hardcode values directly in the YAML file instead of using
    `${VAR_NAME}` substitution.

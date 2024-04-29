---
title: Automatic Instrumentation Configuration
linkTitle: Configuration
description: Learn how to configure Automatic Instrumentation for Node.js
aliases: [module-config]
weight: 10
---

This module is highly configurable by setting
[environment variables](/docs/specs/otel/configuration/sdk-environment-variables/).
Many aspects of the auto instrumentation's behavior can be configured for your
needs, such as resource detectors, exporters, trace context propagation headers,
and more.

## SDK and exporter configuration

SDK and exporter configuration can be set using environment variables. More
information can be found [here](/docs/languages/sdk-configuration/).

## SDK resource detector configuration

By default, the module will enable all SDK resource detectors. You can use the
`OTEL_NODE_RESOURCE_DETECTORS` environment variable to enable only certain
detectors, or completely disable them:

- `env`
- `host`
- `os`
- `process`
- `serviceinstance`
- `container`
- `alibaba`
- `aws`
- `azure`
- `gcp`
- `all` - enables all resource detectors
- `none` - disables resource detection

For example, to only enable the `env` and `host` detectors, you can set:

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

### Excluding auto-instrumentation

By default, all
[supported instrumentation libraries](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/metapackages/auto-instrumentations-node/README.md#supported-instrumentations)
are enabled, but you can use the environment variable
`OTEL_NODE_ENABLED_INSTRUMENTATIONS` to enable only certain instrumentations by
providing a comma-separated list of the instrumentation package names without
the `@opentelemetry/instrumentation-` prefix.

For example, to enable only
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-instrumentation-http)
and
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express)
instrumentations:

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

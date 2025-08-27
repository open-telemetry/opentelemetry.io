---
title: Zero-Code Instrumentation Configuration
linkTitle: Configuration
description: Learn how to configure Zero-Code Instrumentation for Node.js
aliases:
  - /docs/languages/js/automatic/configuration
  - /docs/languages/js/automatic/module-config
weight: 10
cSpell:ignore: serviceinstance
---

This module is highly configurable by setting
[environment variables](/docs/specs/otel/configuration/sdk-environment-variables/).
Many aspects of the auto instrumentation's behavior can be configured for your
needs, such as resource detectors, exporters, trace context propagation headers,
and more.

## SDK and exporter configuration

[SDK and exporter configuration](/docs/languages/sdk-configuration/) can be set
using environment variables.

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

## Excluding instrumentation libraries

By default, all
[supported instrumentation libraries](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/README.md#supported-instrumentations)
are enabled, but you can use environment variables to enable or disable specific
instrumentations.

### Enable specific instrumentations

Use the environment variable `OTEL_NODE_ENABLED_INSTRUMENTATIONS` to enable only
certain instrumentations by providing a comma-separated list of the
instrumentation library names without the `@opentelemetry/instrumentation-`
prefix.

For example, to enable only
[@opentelemetry/instrumentation-http](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
and
[@opentelemetry/instrumentation-express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express)
instrumentations:

```shell
OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"
```

### Disable specific instrumentations

Use the environment variable `OTEL_NODE_DISABLED_INSTRUMENTATIONS` to keep the
fully enabled list and only disable certain instrumentations by providing a
comma-separated list of the instrumentation library names without the
`@opentelemetry/instrumentation-` prefix.

For example, to disable only
[@opentelemetry/instrumentation-fs](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-fs)
and
[@opentelemetry/instrumentation-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc)
instrumentations:

```shell
OTEL_NODE_DISABLED_INSTRUMENTATIONS="fs,grpc"
```

{{% alert title="Note" %}}

If both environment variables are set, `OTEL_NODE_ENABLED_INSTRUMENTATIONS` is
applied first, and then `OTEL_NODE_DISABLED_INSTRUMENTATIONS` is applied to that
list. Therefore, if the same instrumentation is included in both lists, that
instrumentation will be disabled.

{{% /alert %}}

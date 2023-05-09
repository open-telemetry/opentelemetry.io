---
title: Automatic Instrumentation Configuration
linkTitle: Configuration
weight: 45
---

This module is highly configurable by setting
[environment variables](/docs/reference/specification/sdk-environment-variables/). 
Many aspects of the auto instrumentation's behavior can be configured for your
needs, such as resource detectors, exporters, trace context propagation headers, and more.

## SDK and exporter configuration

SDK and exporter configuration can be set using environment variables.
More information can be found [here](/docs/concepts/sdk-configuration/).

## SDK resource detector configuration

Byy default, the module will enable all SDK resource detectors.
You can use the `OTEL_NODE_RESOURCE_DETECTORS` environment variable
to enable only certain detectors, or completely disable them:

- `env`
- `host`
- `os`
- `process`
- `container`
- `alibaba`
- `aws`
- `gcp`
- `all` - enables all resource detectors
- `none` - disables resource detection

For example, to only enable the `env` and `host` detectors, you can set:

```shell
OTEL_NODE_RESOURCE_DETECTORS=env,host
```

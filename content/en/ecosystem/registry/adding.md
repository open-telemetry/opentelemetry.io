---
title: Adding to the registry
linkTitle: Adding
description: How to add entries to the registry.
---

Do you maintain or contribute to an integration for OpenTelemetry? We'd love to
feature your project in the [registry](../)!

To add your project, submit a [pull request][]. You'll need to create a data
file in [data/registry][] for your project, by using the following template:
[registry-entry.yml][].

Make sure that your project names and descriptions follow our [marketing
guidelines][] and are in line with the Linux Foundation's branding and
[trademark usage guidelines][].

## Registry Types

When adding your project to the registry, you need to specify a `registryType`. This field categorizes your project based on its relationship to OpenTelemetry. Below are the possible values and their definitions:

### `application integration`
**Use for**: Applications or services that have OpenTelemetry natively integrated (built-in support) without requiring external plugins or instrumentation libraries.

**Examples**: Databases like Oracle DB with built-in OpenTelemetry support, web frameworks with native observability, or any software where OpenTelemetry is directly integrated into the core application.

**Note**: This is the only registry type that allows commercial/proprietary licenses.

### `core`
**Use for**: Core OpenTelemetry project components only. This is never applicable to third-party components or non-OpenTelemetry project components.

### `exporter`
**Use for**: Exporter components of the OpenTelemetry Collector or exporter libraries within language-specific SDKs.

**Examples**: OTLP exporters, Jaeger exporters, Prometheus exporters, or any component that sends telemetry data to external systems.

**Note**: Not applicable for third-party components that are exporting telemetry data.

### `extension`
**Use for**: Collector or SDK extensions that extend OpenTelemetry functionality.

**Examples**: Authentication extensions, sampling extensions, or any component that extends the behavior of OpenTelemetry components.

### `instrumentation`
**Use for**: Instrumentation libraries or native instrumentations for specific libraries/frameworks.

**Examples**: HTTP instrumentation, database instrumentation, framework-specific instrumentation, or any library that automatically instruments code to generate telemetry.

### `log-bridge`
**Use for**: Implementations of log-bridges for programming languages.

**Examples**: Libraries that bridge between existing logging systems and OpenTelemetry logging.

### `processor`
**Use for**: OpenTelemetry Collector processor components.

**Examples**: Batch processors, attribute processors, sampling processors, or any component that processes telemetry data within the collector pipeline.

### `provider`
**Use for**: OpenTelemetry Collector provider components.

**Examples**: Configuration providers, credential providers, or any component that provides resources or configuration to the collector.

### `receiver`
**Use for**: OpenTelemetry Collector receiver components.

**Examples**: OTLP receivers, Jaeger receivers, Prometheus receivers, or any component that receives telemetry data from external sources.

**Note**: Not applicable for third-party components that are receiving OpenTelemetry telemetry.

### `resource-detector`
**Use for**: Resource Detectors for language-specific SDKs.

**Examples**: AWS resource detectors, GCP resource detectors, or any component that automatically detects and adds resource information to telemetry.

### `utilities`
**Use for**: Any other tool that people can use to work with OpenTelemetry.

**Examples**: Testing utilities, debugging tools, migration tools, or any helper library that facilitates working with OpenTelemetry.

[data/registry]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]:
  https://www.linuxfoundation.org/legal/trademark-usage

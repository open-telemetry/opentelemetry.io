---
title: Declarative configuration
linkTitle: Configuration
weight: 55
description: Configure the Python SDK using a YAML configuration file
cSpell:ignore: pyyaml jsonschema
---

The Python SDK supports
[declarative configuration](/docs/languages/sdk-configuration/declarative-configuration/),
which lets you configure the SDK using a YAML file instead of code or
environment variables. This follows the
[OpenTelemetry declarative configuration specification](https://github.com/open-telemetry/opentelemetry-configuration).

> [!NOTE]
>
> Declarative configuration support in the Python SDK is **experimental**. The
> configuration file schema follows the
> [OTel declarative configuration spec](https://github.com/open-telemetry/opentelemetry-configuration)
> (currently at v1.1.0).

## Install

Install the SDK with the `file-configuration` extra, which pulls in the
required `pyyaml` and `jsonschema` dependencies:

```shell
pip install 'opentelemetry-sdk[file-configuration]'
```

## Enable with the environment variable

Set the `OTEL_CONFIG_FILE` environment variable to the path of your YAML
configuration file. When using
[auto-instrumentation](/docs/zero-code/python/), no code changes are needed —
the SDK configurator reads this variable automatically:

```shell
export OTEL_CONFIG_FILE=/path/to/otel-config.yaml
opentelemetry-instrument python app.py
```

## Enable programmatically

You can also apply a configuration file in code using the
`configure_sdk` function:

```python
from opentelemetry.sdk.configuration import configure_sdk

configure_sdk(config_file="/path/to/otel-config.yaml")
```

## Example configuration file

Below is a minimal YAML configuration file that sets a service name and exports
traces and metrics over OTLP/HTTP:

```yaml
# otel-config.yaml
file_format: "0.4"
resource:
  attributes:
    - name: service.name
      value: my-python-service

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/logs
```

For the full schema reference, see the
[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
repository.

## Environment variable interactions

When `OTEL_CONFIG_FILE` is set:

- **Spec-defined `OTEL_*` environment variables are ignored.** Variables such as
  `OTEL_TRACES_EXPORTER` or `OTEL_SERVICE_NAME` that have equivalents in the
  configuration file schema have no effect.
- **`${env:VAR}` substitution works inside the file.** You can reference
  environment variables in your YAML using the `${env:VAR}` syntax. For example:

  ```yaml
  resource:
    attributes:
      - name: service.name
        value: ${env:SERVICE_NAME}
  ```

- **Components can still read their own environment variables.** Some components
  enabled by the file, such as resource detectors, may read environment variables
  that are outside the configuration schema.

## Related resources

- [Declarative configuration overview](/docs/languages/sdk-configuration/declarative-configuration/)
- [Configuration file schema (opentelemetry-configuration)](https://github.com/open-telemetry/opentelemetry-configuration)
- [Python SDK tracking issue (opentelemetry-python#3631)](https://github.com/open-telemetry/opentelemetry-python/issues/3631)
- [`OTEL_CONFIG_FILE` support (opentelemetry-python#5271)](https://github.com/open-telemetry/opentelemetry-python/pull/5271)

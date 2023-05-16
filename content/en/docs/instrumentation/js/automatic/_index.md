---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 30
---

Automatic instrumentation provides a way to instrument any Node.js application
and capture telemetry data from many popular libraries and frameworks without
any code changes.

## Setup

Run the following commands to install the appropriate packages.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

The `@opentelemetry/api` and `@opentelemetry/auto-instrumentations-node`
packages install the API, SDK, and the instrumentation tools.

## Configuring the module

The module is highly configurable.

One option is to configure the module by way of using `env` to set environment
variables from the CLI:

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Alternatively, you can use `export` to set environment variables:

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

By default, all SDK resource detectors are used. You can use the environment
variable `OTEL_NODE_RESOURCE_DETECTORS` to enable only certain detectors, or
completely disable them.

To see the full range of configuration options, see
[Module Configuration](module-config).

## Supported libraries and frameworks

A number of popular NodeJS libraries are auto-instrumented. For the full list,
see
[Supported instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#supported-instrumentations).

## Troubleshooting

You can set the log level by setting the `OTEL_LOG_LEVEL` environment variable
to one of the following:

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`
- The default level is `info`.

> **NOTES:**
>
> - In a production environment, it is recommended to set `OTEL_LOG_LEVEL` to
>   info.
> - Logs are always sent to console, no matter the environment, or debug level.
> - Debug logs are extremely verbose and can negatively impact the performance
>   of your application. Enable debug logging only when needed.

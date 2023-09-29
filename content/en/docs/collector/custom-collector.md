---
title: Building a custom collector
weight: 29
# prettier-ignore
cSpell:ignore: batchprocessor chipset darwin debugexporter gomod loggingexporter otlpexporter otlpreceiver wyrtw
---

If you are planning to build and debug custom collector receivers, processors,
extensions, or exporters, you are going to need your own Collector instance.
That will allow you to launch and debug your OpenTelemetry Collector components
directly within your favorite Golang IDE.

The other interesting aspect of approaching the component development this way
is that you can use all the debugging features from your IDE (stack traces are
great teachers!) to understand how the Collector itself interacts with your
component code.

The OpenTelemetry Community developed a tool called [OpenTelemetry Collector
builder][ocb] (or `ocb` for short) to assist people in assembling their own
distribution, making it easy to build a distribution that includes their custom
components along with components that are publicly available.

As part of the process the `builder` will generate the Collector's source code,
which you can use to help build and debug your own custom components, so let's
get started.

## Step 1 - Install the builder

The `ocb` binary is available as a downloadable asset from [OpenTelemetry
Collector releases][releases]. You will find the list of assets at the bottom of
the page. Assets are named based on OS and chipset, so download the one that
fits your configuration.

The binary has a pretty long name, so you can simply rename it to `ocb`; and if
you are running Linux or macOS, you will also need to provide execution
permissions for the binary.

Open your terminal and type the following commands to accomplish both
operations:

```cmd
mv ocb_{{% param collectorVersion %}}_darwin_amd64 ocb
chmod 777 ocb
```

To make sure the `ocb` is ready to be used, go to your terminal and type
`./ocb help`, and once you hit enter you should have the output of the `help`
command showing up in your console.

## Step 2 - Create a builder manifest file

The builder's `manifest` file is a `yaml` where you pass information about the
code generation and compile process combined with the components that you would
like to add to your Collector's distribution.

The `manifest` starts with a map named `dist` which contains tags to help you
configure the code generation and compile process. In fact, all the tags for
`dist` are the equivalent of the `ocb` command line `flags`.

Here are the tags for the `dist` map:

| Tag              | Description                                                                                        | Optional | Default Value                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| module:          | The module name for the new distribution, following Go mod conventions. Optional, but recommended. | Yes      | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:            | The binary name for your distribution                                                              | Yes      | `otelcol-custom`                                                                  |
| description:     | A long name for the application.                                                                   | Yes      | `Custom OpenTelemetry Collector distribution`                                     |
| otelcol_version: | The OpenTelemetry Collector version to use as base for the distribution.                           | Yes      | `{{% param collectorVersion %}}`                                                  |
| output_path:     | The path to write the output (sources and binary).                                                 | Yes      | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:         | The version for your custom OpenTelemetry Collector.                                               | Yes      | `1.0.0`                                                                           |
| go:              | Which Go binary to use to compile the generated sources.                                           | Yes      | go from the PATH                                                                  |

As you can see on the table above, all the `dist` tags are optional, so you will
be adding custom values for them depending if your intentions to make your
custom Collector distribution available for consumption by other users or if you
are simply leveraging the `ocb` to bootstrap your component development and
testing environment.

For this tutorial, you will be creating a Collector's distribution to support
the development and testing of components.

Go ahead and create a manifest file named `builder-config.yaml` with the
following content:

> builder-config.yaml

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
```

Now you need to add the modules representing the components you want to be
incorporated in this custom Collector distribution. Take a look at the
[ocb configuration documentation](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration)
to understand the different modules and how to add the components.

We will be adding the following components to our development and testing
collector distribution:

- Exporters: OTLP and Debug[^1]
- Receivers: OTLP
- Processors: Batch

Here is what my `builder-config.yaml` manifest file looks after adding the
modules for the components above:

<!-- prettier-ignore -->
```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
  otelcol_version: {{% param collectorVersion %}}

exporters:
  - gomod:
      # NOTE: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.
      go.opentelemetry.io/collector/exporter/debugexporter v{{% param collectorVersion %}}
  - gomod:
      go.opentelemetry.io/collector/exporter/otlpexporter v{{% param collectorVersion %}}

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor v{{% param collectorVersion %}}

receivers:
  - gomod:
      go.opentelemetry.io/collector/receiver/otlpreceiver v{{% param collectorVersion %}}
```

## Step 3 - Generating the Code and Building your Collector's distribution

All you need now is to let the `ocb` do it's job, so go to your terminal and
type the following command:

```cmd
./ocb --config builder-config.yaml
```

If everything went well, here is what the output of the command should look
like:

```nocode
2022-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% param collectorVersion %}}", "date": "2023-01-03T15:05:37Z"}
2022-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2022-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2022-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2022-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2022-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

As defined in the `dist` section of your config file, you now have a folder
named `otelcol-dev` containing all the source code and the binary for your
Collector's distribution.

You can now use the generated code to bootstrap your component development
projects and easily build and distribute your own collector distribution with
your components.

[ocb]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[releases]: https://github.com/open-telemetry/opentelemetry-collector/releases

[^1]: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.

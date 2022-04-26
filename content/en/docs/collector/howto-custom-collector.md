---
title: "Building your own Collector instance"
weight: 30
---

If you are planning to build and debug your components, you are going to need your own Collector instance. That will allow you to launch and debug your OpenTelemetry Collector components directly within your favorite Golang IDE.

The other interesting aspect of approaching the component development this way is that you can use all the debugging features from your IDE (stack traces are great teachers!) to understand how the Collector itself interacts with your component code.

The OpenTelemetry Community developed a tool called [OpenTelemetry Collector builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)(aka `ocb`) to assist people in assembling their own distribution, making it easy to build a distribution that includes their custom components along with components that are publicly available.

As part of the process the `builder` will generate the Collector's source code, which you can borrow and steal as your own to help build and debug your own components, so let's get started.

## Step 1 - Install the builder

The `ocb` binary is available as a downloadable asset within the [OpenTelemetry Collector Releases Page](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.49.0) within the Collector's GitHub project. You will find the list of assets at the bottom of the page.

v0.49.0 is the latest and the assets are named based on OS and chipset, so download the one that fits your configuration.

The binary has a pretty long name, so you can simply rename it to `ocb`; and if you are running Linux or macOS, you will also need to provide execution permissions for the binary. 

Open your terminal and type the following commands to accomplish both operations:

```cmd
mv ocb_0.49.0_darwin_amd64 ocb
chmod 777 ocb
```

To make sure the `ocb` is ready to be used, go to your terminal and type `./ocb help`, and once you hit enter you should have the following output:

```

OpenTelemetry Collector distribution builder (dev)

Usage:
  builder [flags]
  builder [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  version     Version of opentelemetry-collector-builder

Flags:
      --config string            config file (default is $HOME/.otelcol-builder.yaml)
      --description string       A descriptive name for the OpenTelemetry Collector distribution (default "Custom OpenTelemetry Collector distribution")
      --go string                The Go binary to use during the compilation phase. Default: go from the PATH
  -h, --help                     help for builder
      --module string            The Go module for the new distribution (default "go.opentelemetry.io/collector/cmd/builder")
      --name string              The executable name for the OpenTelemetry Collector distribution (default "otelcol-custom")
      --otelcol-version string   Which version of OpenTelemetry Collector to use as base (default "0.42.0")
      --output-path string       Where to write the resulting files (default "/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831")
      --skip-compilation         Whether builder should only generate go code with no compile of the collector (default false)
      --version string           The version for the OpenTelemetry Collector distribution (default "1.0.0")

Use "builder [command] --help" for more information about a command.
```


## Step 2 - Create a builder manifest file


The builder's `manifest` file is a `yaml` where you basically pass information about the code generation and compile process combined with the components that you would like to add to your Collector's distribution.

The `manifest` starts with a map named `dist` which basically contains tags to help you configure the code generation and compile process. In fact, all the tags for `dist` are the equivalent of the `ocb` command line `flags`.

Here are the tags for the `dist` map:

| Tag              | Description | Optional | Default Value|
|------------------|-------------|----------|--------------|
| module:          | The module name for the new distribution, following Go mod conventions. Optional, but recommended.| Yes | "go.opentelemetry.io/collector/cmd/builder" |
| name:            | The binary name for your distribution | Yes | "otelcol-custom" |
| description:     | A long name for the application. | Yes | "Custom OpenTelemetry Collector distribution" |
| otelcol_version: | The OpenTelemetry Collector version to use as base for the distribution. | Yes | "0.49.0" | 
| output_path:     | The path to write the output (sources and binary). | Yes | "/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831" |
| version:         | The version for your custom OpenTelemetry Collector. | Yes | "1.0.0" |
| go:              | Which Go binary to use to compile the generated sources. | Yes | go from the PATH |


As you can see on the table above, all the `dist` tags are optional, so you will be adding custom values for them depending if your intentions to make your custom Collector distribution available for consumption by other users or if you are simply leveraging the `ocb` to bootstrap your component development and testing environment.

For this tutorial, you will be creating a Collector's distribution to support the development and testing of components.

Go ahead and create a `builder-config.yaml` with the following content:

> builder-config.yaml
```yaml
dist:
    name: otelcol-dev 
    description: "Basic OTel Collector distribution for Developers"
    output_path: ./otelcol-dev 
```

Now you need to add the modules representing the components you want to be incorporated in this custom Collector distribution. Take a look at the [ocb configuration documentation](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration) to understand the different modules and how to add the components.

We will be adding the following components to our development and testing collector distribution:

- Exporters: Jaeger and Logging
- Receivers: Otlp
- Processors: Batch

Here is what my `builder-config.yaml` manifest file looks after adding the modules for the components above:

```yaml
dist:
    name: otelcol-dev 
    description: "Basic OTel Collector distribution for Developers"
    output_path: ./otelcol-dev 

exporters:
  - gomod: "github.com/open-telemetry/opentelemetry-collector-contrib/exporter/jaegerexporter v0.49.0"
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.49.0

receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.49.0

processors:
  - import: go.opentelemetry.io/collector/processor/batchprocessor
    gomod: go.opentelemetry.io/collector v0.49.0
```


## Step 3 - Generating the Code and Building your Collector's distribution.

All you need now is to let the `ocb` do it's job, so go to your terminal and type the following command:

```
ocb --config builder-config.yaml
```

If everything went well, here is what the output of the command should look like:

```

2022-04-26T10:51:19.705-0500    INFO    internal/command.go:85  OpenTelemetry Collector distribution builder    {"version": "0.49.0", "date": "2022-04-13T22:49:20Z"}
2022-04-26T10:51:19.706-0500    INFO    internal/command.go:108 Using config file       {"path": "builder-config.yaml"}
2022-04-26T10:51:19.707-0500    INFO    builder/config.go:99    Using go        {"go-executable": "/usr/local/go/bin/go"}
2022-04-26T10:51:19.709-0500    INFO    builder/main.go:76      Sources created {"path": "./otelcol-dev"}
2022-04-26T10:51:20.345-0500    INFO    builder/main.go:108     Getting go modules
2022-04-26T10:51:30.285-0500    INFO    builder/main.go:87      Compiling
2022-04-26T10:51:40.217-0500    INFO    builder/main.go:94      Compiled        {"binary": "./otelcol-dev/otelcol-dev"}

```

As defined in the `dist` section of your config file, you now have a folder named `otelcol-dev` containing all the source code and the binary for your Collector's distribution.

You can now use the generated code to bootstrap your component development projects and easily build and distribute your own Collector distribution with your components.

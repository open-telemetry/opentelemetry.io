---
title: "Building your own Collector instance"
weight: 30
---

If you are planning to build and debug your components, you are going to need your own Collector instance. That will allow you to launch and debug your OpenTelemetry Collector components directly within your favorite Golang IDE.

The other interesting aspect of approaching the component development this way is that you can use all the debugging features from your IDE (stack traces are great teachers!) to understand how the Collector itself interacts with your component code.

In order to make it easy for developers to create their own custom builds of the Collector, the OpenTelemetry Community has developed a tool called [OpenTelemetry Collector builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).

The `builder` is meant to help developers to quickly assemble and build their own Collector's distributions, based on a given configuration file.

As part of the process the `builder` will generate the Collector's source code, which you can borrow and steal as your own to help build and debug your own components, so let's get started.

## Step 1 - Install the builder

You can install the builder through the `go install` command. 

Open your terminal and type:

```
go install go.opentelemetry.io/collector/cmd/builder@latest
```

The `builder` command will be installed on your `$GOPATH/bin`, which most likely is already added to your path.

To make sure it's there, go to your terminal and type `builder help`, and once you hit enter you should have the following output:

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

## Step 2 - Create a builder config file

The builder's manifest is a `yaml` where you basically pass information about the code generation and compile process combined with the components that you would like to add to your Collector's distribution.

Go ahead and create a `builder-config.yaml` with the following content:

> builder-config.yaml
```yaml
dist:
    module: github.com/open-telemetry/opentelemetry-collector # the module name for the new distribution, following Go mod conventions. Optional, but recommended.
    name: otelcol-mybuild # the binary name. Optional.
    description: "Custom OpenTelemetry Collector distribution" # a long name for the application. Optional.
    otelcol_version: "0.41.0" # the OpenTelemetry Collector version to use as base for the distribution. Optional.
    output_path: ./otelcol-mybuild # the path to write the output (sources and binary). Optional.
    version: "1.0.0" # the version for your custom OpenTelemetry Collector. Optional.
    go: "/usr/local/go/bin/go" # which Go binary to use to compile the generated sources. Optional.
exporters:
  - gomod: "github.com/open-telemetry/opentelemetry-collector-contrib/exporter/jaegerexporter v0.41.0"
  - import: go.opentelemetry.io/collector/exporter/loggingexporter
    gomod: go.opentelemetry.io/collector v0.41.0

receivers:
  - import: go.opentelemetry.io/collector/receiver/otlpreceiver
    gomod: go.opentelemetry.io/collector v0.41.0

processors:
  - import: go.opentelemetry.io/collector/processor/batchprocessor
    gomod: go.opentelemetry.io/collector v0.41.0
```

For more information on how to create your builder config file, check out the [OpenTelemetry Collector builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) folder inside the Collector's project in GitHub.

## Step 3 - Generating the Code and Building your Collector's distribution.

All you need now is to let the `builder` do it's job, so go to your terminal and type the following command:

```
builder --config builder-config.yaml
```

If everything went well, here is what the output of the command should look like:

```

2022-01-13T10:21:01.777-0600	INFO	internal/command.go:82	OpenTelemetry Collector distribution builder	{"version": "dev", "date": "unknown"}
2022-01-13T10:21:01.779-0600	INFO	internal/command.go:102	Using config file	{"path": "builder-config.yaml"}
2022-01-13T10:21:02.239-0600	INFO	builder/config.go:103	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-01-13T10:21:02.239-0600	INFO	builder/main.go:52	You're building a distribution with non-aligned version of the builder. Compilation may fail due to API changes. Please upgrade your builder or API	{"builder-version": "0.42.0"}
2022-01-13T10:21:02.241-0600	INFO	builder/main.go:76	Sources created{"path": "./otelcol-mybuild"}
2022-01-13T10:21:02.841-0600	INFO	builder/main.go:108	Getting go modules
2022-01-13T10:21:03.131-0600	INFO	builder/main.go:87	Compiling
2022-01-13T10:21:07.816-0600	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-mybuild/otelcol-mybuild"}

```

As defined in the `dist` section of your config file, you now have a folder named `otelcol-mybuild` containing all the source code and the binary for your Collector's distribution.

You can now use the generated code to bootstrap your component development projects and easily build and distribute your own Collector distribution with your components.

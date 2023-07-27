---
title: Building a Connector
spelling:
  cSpell:ignore spanmetrics servicegraph exampleconnector struct Errorf
  cSpell:ignore mapstructure pdata mapstructure pmetric ptrace uber gord
  cSpell:ignore gomod loggingexporter batchprocessor otlpreceiver Jaglowski
---

## Connectors in OpenTelemetry

The content of this page is most applicable if you already have an instrumented
application generating some kind of tracing telemetry data and already have an
understanding of the [OpenTelemetry Collector](/docs/collector).

## What is a Connector?

A connector acts as the means of sending telemetry data between different
collector pipelines by connecting them. A connector acts as an exporter to one
pipeline and a receiver to another. Each pipeline in the OpenTelemetry Collector
acts on one type of telemetry data. There may exist the need to process one form
of telemetry data into another one, but it is required to route the according
data to its proper collector pipeline.

## Why use a Connector?

The connector is beneficial at merging, routing and replicating data streams.
Along with sequential pipelining, which is to connect pipelines together, the
connector component is capable of conditional data flow and generated data
streams. Conditional data flow means sending data to the highest priority
pipeline and has error detection to route to alternative pipeline if need be.
Generated data streams means that the component generates and emits its own data
based on the received data. This tutorial emphasizes on the connector's ability
to connect pipelines.

There are processors in OpenTelemetry that convert telemetry data of one type
into another one. A few examples are the spanmetrics processor, as well as the
servicegraph processor. The spanmetrics processor generates aggregate requests,
error and duration metrics from span data. T​he servicegraph processor analyzes
trace data and generates metrics that describe the relationship between the
services. Both these processors ingest trace data and convert them to metrics
data. Since pipelines in the OpenTelemetry Collector are for only one type of
data, it is necessary to convert the trace data from the processor in the traces
pipeline and send it to the metrics pipeline. Historically, some processors
transmitted data by making use of a work-around that follows a bad practice
where a processor directly exports data after processing. The connector
component solves the need for this work-around and the processors that used the
work around have been deprecated.

Additional details about the connector's full capabilities can be found at the
following links:
[what are connectors in OpenTelemetry](https://observiq.com/blog/what-are-connectors-in-opentelemetry/),
[OpenTelemetry Connector Configurations](/docs/collector/configuration/#connectors)

### The Old Architecture:

![Before picture of how processors emitted data directly to another pipelines exporter](../img/otel-collector-before-connector.png)

### New Architecture Using a Connector:

![How the pipeline should work using the connector component](../img/otel-collector-after-connector.png)

## Building Example Connector

For this tutorial, we will write an example connector that takes traces and
converts them into metrics as a basic example of how the connector component in
OpenTelemetry functions. The functionality of the basic connector is to simply
count the number of spans in traces that contain a specific attribute name. The
count of these occurrences are stored in the connector.

## Configurations

### Setting up Collector Config:

Setup the configuration you will use for the OpenTelemetry Collector in the
`config.yaml` file. This file defines how your data will be routed, processed
and exported. The configurations defined in the file, detail how you want your
data pipeline to behave. You can define the components and how the data moves
through your defined pipeline from start to end. There are further details about
how to configure a collector at
[Collector Configurations](/docs/collector/configuration).

Use the following code for the example connector we will build. The code is an
example of a basic valid OpenTelemetry Collector configuration file.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
      http:
        endpoint: localhost:4318

exporters:
  logging:

connectors:
  example:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [example]
    metrics:
      receivers: [example]
      exporters: [logging]
```

In the connectors portion of the above code, you need to declare the names of
the usable connectors for your pipeline. Here, `example` is the name of the
connector we will create in this tutorial.

## Implementation

1.  Create a folder for your example connector. In this tutorial we will create
    a folder called `exampleconnector`.
2.  Navigate to the folder and run

    ```sh
    go mod init github.com/gord02/exampleconnector
    ```

3.  Run `go mod tidy`

    This will create files `go.mod` and `go.sum`.

4.  Create the following files in the folder
    - `config.go` - A file to define the connector's settings
    - `factory.go` - A file to create instances of the connector

### Create your connector settings in config.go

In order to be instantiated and participate in pipelines, the collector needs to
identify your connector and properly load its settings from within its
configuration file.

In order to be able to give your connector access to its settings, create a
`Config` struct. The struct must have an exported field for each of the
connector’s settings. The parameter fields added will be accessible from the
config.yaml file. Their name in the configuration file is set through a struct
tag. Create struct and add parameters. You can optionally add a validator
function to check if the given default values are valid for an instance of your
connector.

```go
package exampleconnector

import "fmt"

type Config struct {
    AttributeName string `mapstructure:"attribute_name"`
}

func (c *Config) Validate() error {
    if c.AttributeName == "" {
        return fmt.Errorf("attribute_name must not be empty")
    }
    return nil
}
```

Further details about mapstructure can be found at
[Go mapstructure](https://pkg.go.dev/github.com/mitchellh/mapstructure).

## Implement the Factory

To instantiate the object, you will need to use the `NewFactory` function
associated with each of the components. We will use the `connector.NewFactory`
function. The `connector.NewFactory` function instantiates and returns a
`connector.Factory` and it requires the following parameters:

- `component.Type`: a unique string identifier for your connector across all
  collector’s components of the same type. This string also acts as the name to
  refer to the connector by.
- `component.CreateDefaultConfigFunc`: a reference to a function that returns
  the default `component.Config` instance for your connector.
- `...FactoryOption`: the slice of `connector.FactoryOptions` will determine
  what type of signal your connector is capable of processing.

1.  Create factory.go file and define the unique string to identify your
    connector as a global constant.

    ```go
    const (
        defaultVal = "request.n"
        // this is the name used to refer to the connector in the config.yaml
        typeStr = "example"
    )
    ```

2.  Create the default configuration function. This is how you choose to
    initialize your connector object with default values.

    ```go
    func createDefaultConfig() component.Config {
        return &Config{
            AttributeName: defaultVal,
        }
    }
    ```

3.  Define the type of the connector you will work with. This will be passed as
    a factory option. A connector can connect pipelines of different or similar
    types. We have to define the type of the exported end of the connector and
    the receiver end of the connector. A connector that exports traces and
    receives metrics is just one distinct configuration of the connector
    component and the order of how it is defined matters. A connector that
    exporters traces and receives metrics is not the same as a connector that
    could export metrics and receive traces.

    ```go
    // createTracesToMetricsConnector defines the consumer type of the connector
    // We want to consume traces and export metrics, therefore, define nextConsumer as metrics, since consumer is the next component in the pipeline
    func createTracesToMetricsConnector(ctx context.Context, params connector.CreateSettings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
        c, err := newConnector(params.Logger, cfg)
        if err != nil {
            return nil, err
        }
        c.metricsConsumer = nextConsumer
        return c, nil
    }
    ```

    `createTracesToMetricsConnector` is a function that further initializes the
    connector component by defining its consumer component, or the next
    component to ingest the data after the connector transmits the data. It
    should be noted that the connector is not restricted to one ordered
    combination of types like we have here. For example, the count connector
    defines several of these functions for traces to metrics, logs to metrics
    and metrics to metrics.

    Parameters for the `createTracesToMetricsConnector`: {.h4}

    - `context.Context`: the reference to the collector’s `context.Context` so
      your trace receiver can properly manage its execution context.
    - `connector.CreateSettings`: the reference to some of the collector’s
      settings under which your receiver is created.
    - `component.Config`: the reference for the receiver config settings passed
      by the collector to the factory so it can properly read its settings from
      the collector config.
    - `consumer.Metrics`: the reference to the next consumer type in the
      pipeline, which is where received traces will go. This can be a processor,
      exporter or another connector.

4.  Write a `NewFactory` function that instantiates your custom factory for your
    connector(component).
    ```go
    // NewFactory creates a factory for example connector.
    func NewFactory() connector.Factory {
        // OpenTelemetry connector factory to make a factory for connectors
        return connector.NewFactory(
        typeStr,
        createDefaultConfig,
        connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
    }
    ```
    It should be noted that connectors can support multiple ordered combinations
    of data types.

`factory.go` file once finished:

```go
package exampleconnector

import (
    "context"

    "go.opentelemetry.io/collector/component"
    "go.opentelemetry.io/collector/connector"
    "go.opentelemetry.io/collector/consumer"
)

const (
    defaultVal = "request.n"
    // this is the name used to refer to the connector in the config.yaml
    typeStr = "example"
)


// NewFactory creates a factory for example connector.
func NewFactory() connector.Factory {
    // OpenTelemetry connector factory to make a factory for connectors

    return connector.NewFactory(
    typeStr,
    createDefaultConfig,
    connector.WithTracesToMetrics(createTracesToMetricsConnector, component.StabilityLevelAlpha))
}


func createDefaultConfig() component.Config {
    return &Config{
        AttributeName: defaultVal,
    }
}


// createTracesToMetricsConnector defines the consumer type of the connector
// We want to consume traces and export metrics, therefore, define nextConsumer as metrics, since consumer is the next component in the pipeline
func createTracesToMetricsConnector(ctx context.Context, params connector.CreateSettings, cfg component.Config, nextConsumer consumer.Metrics) (connector.Traces, error) {
    c, err := newConnector(params.Logger, cfg)
    if err != nil {
        return nil, err
    }
    c.metricsConsumer = nextConsumer
    return c, nil
}
```

## Implementing the Trace Connector

Implement the methods from the interface component specific to the type of the
component in the `connector.go` file. In this tutorial we will implement the
Traces connector and therefore must implement the interfaces: `baseConsumer`,
`Traces` and `component.Component`.

1.  Define the connector struct with the desired parameters for your connector

    ```go
    // schema for connector
    type connectorImp struct {
        config Config
        metricsConsumer consumer.Metrics
        logger *zap.Logger
    }
    ```

2.  Define the `newConnector` function to create a connector

    ```go
    // newConnector is a function to create a new connector
    func newConnector(logger *zap.Logger, config component.Config) (*connectorImp, error) {
        logger.Info("Building exampleconnector connector")
        cfg := config.(*Config)

        return &connectorImp{
            config: *cfg,
            logger: logger,
        }, nil
    }
    ```

    The `newConnector` function is a factory function to create an instance of a
    connector.

3.  Implement `Capabilities` method to properly implement the interface

    ```go
    // Capabilities implements the consumer interface.
    func (c *connectorImp) Capabilities() consumer.Capabilities {
        return consumer.Capabilities{MutatesData: false}
    }
    ```

    Implement the `Capabilities` method to ensure your connector is of type
    consumer. This method defines the capabilities of the component, whether the
    component can mutate data or not. If `MutatesData` is set to true, it
    indicates that the connector mutates the data structures it is handed.

4.  Implement `Consumer` method to consume telemetry data

    ```go
    // ConsumeTraces method is called for each instance of a trace sent to the connector
    func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error{
    // loop through the levels of spans of the one trace consumed
        for i := 0; i < td.ResourceSpans().Len(); i++ {
            resourceSpan := td.ResourceSpans().At(i)

            for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
                scopeSpan := resourceSpan.ScopeSpans().At(j)

                for k := 0; k < scopeSpan.Spans().Len(); k++ {
                    span := scopeSpan.Spans().At(k)
                    attrs := span.Attributes()
                    mapping := attrs.AsRaw()
                    for key, _ := range mapping {
                        if key == c.config.AttributeName {
                            // create metric only if span of trace had the specific attribute
                            metrics := pmetric.NewMetrics()
                            return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
                        }
                    }
                }
            }
        }
        return nil
    }
    ```

5.  Optional: Implement `Start` and `Shutdown` methods to properly implement the
    interface only if a specific implementation is required. Otherwise, it is
    enough to include `component.StartFunc` and `component.ShutdownFunc` as part
    of the defined connector struct.

The complete connector file:

```go
package exampleconnector

import (
    "context"
    "fmt"

    "go.uber.org/zap"

    "go.opentelemetry.io/collector/component"
    "go.opentelemetry.io/collector/consumer"
    "go.opentelemetry.io/collector/pdata/pmetric"
    "go.opentelemetry.io/collector/pdata/ptrace"
)


// schema for connector
type connectorImp struct {
    config Config
    metricsConsumer consumer.Metrics
    logger *zap.Logger
    // Include these parameters if a specific implementation for the Start and Shutdown function are not needed
    component.StartFunc
	component.ShutdownFunc
}

// newConnector is a function to create a new connector
func newConnector(logger *zap.Logger, config component.Config) (*connectorImp, error) {
    logger.Info("Building exampleconnector connector")
    cfg := config.(*Config)

    return &connectorImp{
    config: *cfg,
    logger: logger,
    }, nil
}


// Capabilities implements the consumer interface.
func (c *connectorImp) Capabilities() consumer.Capabilities {
    return consumer.Capabilities{MutatesData: false}
}

// ConsumeTraces method is called for each instance of a trace sent to the connector
func (c *connectorImp) ConsumeTraces(ctx context.Context, td ptrace.Traces) error {
    // loop through the levels of spans of the one trace consumed
    for i := 0; i < td.ResourceSpans().Len(); i++ {
        resourceSpan := td.ResourceSpans().At(i)

        for j := 0; j < resourceSpan.ScopeSpans().Len(); j++ {
            scopeSpan := resourceSpan.ScopeSpans().At(j)

            for k := 0; k < scopeSpan.Spans().Len(); k++ {
                span := scopeSpan.Spans().At(k)
                attrs := span.Attributes()
                mapping := attrs.AsRaw()
                for key, _ := range mapping {
                    if key == c.config.AttributeName {
                        // create metric only if span of trace had the specific attribute
                        metrics := pmetric.NewMetrics()
                        return c.metricsConsumer.ConsumeMetrics(ctx, metrics)
                    }
                }
            }
        }
    }
    return nil
}

```

## Using the Component

### Summary of Using OpenTelemetry Collector Builder:

You can use the
[OpenTelemetry Collector Builder](/docs/collector/custom-collector/) to build
your code and run it. The collector builder is a tool that enables you to build
your own OpenTelemetry Collector binary. You can add or remove components
(receivers, processors, connectors and exporters) to suit your needs.

1.  Follow the OpenTelemetry Collector Builder
    [installation instructions](/docs/collector/custom-collector/).

2.  Write a Configuration File:

    Once installed, the next step is to create a configuration file
    `builder-config.yaml`. This file defines the collector components you want
    to include in your custom binary.

    Here is an example of the configuration file you can use featuring your new
    connector component:

    ```yaml
    dist:
        name: otelcol-dev-bin
        description: Basic OpenTelemetry collector distribution for Developers
        output_path: ./otelcol-dev
        otelcol_version: 0.81.0


    exporters:
        - gomod:
        go.opentelemetry.io/collector/exporter/loggingexporter v0.81.0


    processors:
        - gomod:
        go.opentelemetry.io/collector/processor/batchprocessor v0.81.0


    receivers:
        - gomod:
    go.opentelemetry.io/collector/receiver/otlpreceiver v0.81.0


    connectors:
        - gomod: github.com/gord02/exampleconnector v0.81.0


    replaces:
    # a list of "replaces" directives that will be part of the resulting go.mod

    # This replace statement is necessary since the newly added component is not found/published to GitHub yet. Replace references to GitHub path with the local path
    - github.com/gord02/exampleconnector => [PATH-TO-COMPONENT-CODE]/exampleconnector
    ```

    It is necessary to include a replace statement. The replace section since
    your newly created component is not published to GitHub yet. The references
    to the GitHub path for your component will need to be replaced with the
    local path to your code.

    There are further details on replacement in go at
    [Go mod file Replace](https://go.dev/ref/mod#go-mod-file-replace).

3.  Build Your collector binary:

    Run the builder while passing in the builder config file detailing the
    included connector component which will then build the custom collector
    binary:

    ```sh
    builder --config [PATH-TO-CONFIG]/builder-config.yaml
    ```

    This will generate the collector binary in the specified output path
    directory that was in your config file.

4.  Run Your collector binary:

    Now you can run your custom collector binary:

    ```sh
    ./[OUTPUT_PATH]/[NAME-OF-DIST] --config [PATH-TO-CONFIG]/config.yaml
    ```

    The output path name and name of dist is detailed in the
    `build-config.yaml`.

Additional resources on the OpenTelemetry Collector Builder:

- [Building a custom collector](/docs/collector/custom-collector)
- [OpenTelemetry Collector Builder README](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
- [Connected Observability Pipelines in the OpenTelemetry Collector by Dan Jaglowski](https://www.youtube.com/watch?v=uPpZ23iu6kI)
- [Connector README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)

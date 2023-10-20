---
title: Building a Trace Receiver
weight: 98
# prettier-ignore
cSpell:ignore: amzn atmxph backendsystem batchprocessor chicago comcast crand debugexporter devs Errorf gogl Intn ispnetwork loggingexporter loglevel mapstructure mcrsft otelcontribcol otlpexporter otlpreceiver pcommon pdata protogen ptrace Rcvr rquedas sanfrancisco serialnumber slrs stateid struct structs Subchannel tailtracer uber wndws zapgrpc
---

<!-- markdownlint-disable heading-increment no-duplicate-heading -->

If you are reading this tutorial, you probably already have an idea of the
OpenTelemetry concepts behind distributed tracing, but if you don't you can
quickly read through it [here](/docs/concepts/signals/traces/).

Here is the definition of those concepts according to OpenTelemetry:

> Traces track the progression of a single request, called a trace, as it is
> handled by services that make up an application. The request may be initiated
> by a user or an application. Distributed tracing is a form of tracing that
> traverses process, network and security boundaries.

Although the definition seems very application centric, you can leverage the
OpenTelemetry trace model as a way to represent a request and quickly understand
its duration and the details about every step involved in completing it.

Assuming you already have a system generating some kind of tracing telemetry,
the [OpenTelemetry Collector](/docs/collector/) is the doorway to help you make
it available into the OTel world.

Within the Collector, a trace receiver has the role to receive and convert your
request telemetry from its original format into the OTel trace model, so the
information can be properly processed through the Collector's pipelines.

In order to implement a traces receiver you will need the following:

- A `Config` implementation to enable the trace receiver to gather and validate
  its configurations within the Collector's config.yaml.

- A `receiver.Factory` implementation so the Collector can properly instantiate
  the trace receiver component.

- A `TracesReceiver` implementation that is responsible to collect the
  telemetry, convert it to the internal trace representation, and hand the
  information to the next consumer in the pipeline.

In this tutorial we will create a sample trace receiver called `tailtracer` that
simulates a pull operation and generates traces as an outcome of that operation.
The next sections will guide you through the process of implementing the steps
above in order to create the receiver, so let's get started.

## Setting up your receiver development and testing environment

First use the [Building a Custom Collector](/docs/collector/custom-collector)
tutorial to create a Collector instance named `otelcol-dev`; all you need is to
copy the `builder-config.yaml` described on
[Step 2](/docs/collector/custom-collector#step-2---create-a-builder-manifest-file)
and run the builder. As an outcome you should now have a `otelcol-dev` folder
with your Collector's development instance ready to go.

In order to properly test your trace receiver, you will need a distributed
tracing backend so the Collector can send the telemetry to it. We will be using
[Jaeger](https://www.jaegertracing.io/docs/latest/getting-started/), if you
don't have a `Jaeger` instance running, you can easily start one using Docker
with the following command:

```sh
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14317:4317 \
  -p 14318:4318 \
  jaegertracing/all-in-one:1.41
```

Now, create a `config.yaml` file so you can set up your Collector's components.

```sh
cd otelcol-dev
touch config.yaml
```

For now, you just need a basic traces pipeline with the `otlp` receiver, the
`otlp` and `debug`[^1] exporters, here is what your `config.yaml` file should
look like:

> config.yaml

```yaml
receivers:
  otlp:
    protocols:
      grpc:

processors:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
```

Notice that I am only using the `insecure` flag in my `otlp` exporter config to
make my local development setup easier; you should not use this flag when
running your collector in production.

In order to verify that your initial pipeline is properly set up, you should
have the following output after running your `otelcol-dev` command:

```console
$ ./otelcol-dev --config config.yaml
2023-09-12T15:22:18.652-0700    info    service/telemetry.go:84 Setting up own telemetry...
2023-09-12T15:22:18.652-0700    info    service/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
2023-09-12T15:22:18.652-0700    debug   exporter@v0.85.0/exporter.go:273        Stable component.       {"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-09-12T15:22:18.652-0700    info    exporter@v0.85.0/exporter.go:275        Development component. May change in the future.        {"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-09-12T15:22:18.652-0700    debug   receiver@v0.85.0/receiver.go:294        Stable component.       {"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-09-12T15:22:18.652-0700    info    service/service.go:138  Starting otelcontribcol...      {"Version": "0.85.0", "NumCPU": 10}
2023-09-12T15:22:18.652-0700    info    extensions/extensions.go:31     Starting extensions...
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel created     {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] original dial target is: "localhost:14317"  {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] parsed dial target is: {URL:{Scheme:localhost Opaque:14317 User: Host: Path: RawPath: OmitHost:false ForceQuery:false RawQuery: Fragment: RawFragment:}}   {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] fallback to scheme "passthrough"    {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] parsed dial target is: {URL:{Scheme:passthrough Opaque: User: Host: Path:/localhost:14317 RawPath: OmitHost:false ForceQuery:false RawQuery: Fragment: RawFragment:}}      {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel authority set to "localhost:14317"  {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel switches to new LB policy "pick_first"      {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel created    {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel Connectivity change to CONNECTING   {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to CONNECTING  {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Server #3] Server created       {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [pick-first-lb 0x140027d9b30] Received SubConn state update: 0x140027d9ce0, {ConnectivityState:CONNECTING ConnectionError:<nil>}        {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel picks a new address "localhost:14317" to connect   {"grpc_log": true}
2023-09-12T15:22:18.652-0700    info    otlpreceiver@v0.85.0/otlp.go:83 Starting GRPC server    {"kind": "receiver", "name": "otlp", "data_type": "traces", "endpoint": "0.0.0.0:4317"}
2023-09-12T15:22:18.652-0700    info    service/service.go:161  Everything is ready. Begin running and processing data.
2023-09-12T15:22:18.652-0700    info    zapgrpc/zapgrpc.go:178  [core] [Server #3 ListenSocket #4] ListenSocket created {"grpc_log": true}
2023-09-12T15:22:18.662-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY       {"grpc_log": true}
```

Make sure you see the last line, that will confirm that the OTLP exporter has
successfully established a gRPC connection to your local Jaeger instance. Now
that we have our environment ready, let's start writing your receiver's code.

Now, create another folder called `tailtracer` so we can have a place to host
all of our receiver code.

```sh
mkdir tailtracer
```

Every Collector's component should be created as a Go module, so you will need
to properly initialize the `tailtracer` module. In my case here is what the
command looked like:

```sh
cd tailtracer
go mod init github.com/rquedas/otel4devs/collector/receiver/trace-receiver/tailtracer
```

## Reading and Validating your Receiver Settings

In order to be instantiated and participate in pipelines the Collector needs to
identify your receiver and properly load its settings from within its
configuration file.

The `tailtracer` receiver will have the following settings:

- `interval`: a string representing the time interval (in minutes) between
  telemetry pull operations
- `number_of_traces`: the number of mock traces generated for each interval

Here is what the `tailtracer` receiver settings will look like:

```yaml
receivers:
  tailtracer: # this line represents the ID of your receiver
    interval: 1m
    number_of_traces: 1
```

Under the `tailtracer` folder, create a file named `config.go` where you will
write all the code to support your receiver settings.

```sh
cd tailtracer
touch config.go
```

To implement the configuration aspects of a receiver you need create a `Config`
struct. Add the following code to your `config.go` file:

```go
package tailtracer

type Config struct{

}
```

In order to be able to give your receiver access to its settings the `Config`
struct must have a field for each of the receiver's settings.

Here is what your `config.go` file should look like after you implemented the
requirements above.

> config.go

```go
package tailtracer

// Config represents the receiver config settings within the collector's config.yaml
type Config struct {
   Interval    string `mapstructure:"interval"`
   NumberOfTraces int `mapstructure:"number_of_traces"`
}
```

{{% alert title="Check your work" color="primary" %}}

- Added the `Interval` and the `NumberOfTraces` fields to properly have access
  to their values from the config.yaml.

{{% /alert %}}

Now that you have access to the settings, you can provide any kind of validation
needed for those values by implementing the `Validate` method according to the
optional
[ConfigValidator](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/component/config.go#L50) interface.

In this case, the `interval` value will be optional (we will look at generating
default values later) but when defined should be at least 1 minute (1m) and the
`number_of_traces` will be a required value. Here is what the config.go looks
like after implementing the `Validate` method.

> config.go

```go
package tailtracer

import (
	"fmt"
	"time"
)

// Config represents the receiver config settings within the collector's config.yaml
type Config struct {
	Interval       string `mapstructure:"interval"`
	NumberOfTraces int    `mapstructure:"number_of_traces"`
}

// Validate checks if the receiver configuration is valid
func (cfg *Config) Validate() error {
	interval, _ := time.ParseDuration(cfg.Interval)
	if interval.Minutes() < 1 {
		return fmt.Errorf("when defined, the interval has to be set to at least 1 minute (1m)")
	}

	if cfg.NumberOfTraces < 1 {
		return fmt.Errorf("number_of_traces must be greater or equal to 1")
	}
	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Imported the `fmt` package to properly format print error messages.
- Added the `Validate` method to the Config struct to check if the `interval`
  setting value is at least 1 minute (1m) and if the `number_of_traces` setting
  value is greater or equal to 1. If that is not true the Collector will
  generate an error during its startup process and display the message
  accordingly.

{{% /alert %}}

If you want to take a closer look at the structs and interfaces involved in the
configuration aspects of a component, take a look at the
[component/config.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/component/config.go) file inside the Collector's
GitHub project.

## Enabling the Collector to instantiate your receiver

At the beginning of this tutorial, you created your `otelcol-dev` instance,
which is bootstrapped with the following components:

- Receivers: OTLP Receiver
- Processors: Batch Processor
- Exporters: Debug[^1] and OTLP Exporters

Go ahead and open the `components.go` file under the `otelcol-dev` folder, and
let's take a look at the `components()` function.

```go
func components() (otelcol.Factories, error) {
	var err error
	factories := otelcol.Factories{}

	factories.Extensions, err = extension.MakeFactoryMap(
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Receivers, err = receiver.MakeFactoryMap(
		otlpreceiver.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Exporters, err = exporter.MakeFactoryMap(
		debugexporter.NewFactory(),
		otlpexporter.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Processors, err = processor.MakeFactoryMap(
		batchprocessor.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	return factories, nil
}
```

As you can see, the `components()` function is responsible to provide the
Collector the factories for all its components which is represented by a
variable called `factories` of type `otelcol.Factories` (here is the declaration
of the
[otelcol.Factories](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/otelcol/factories.go#L27) struct), which will then be
used to instantiate the components that are configured and consumed by the
Collector's pipelines.

Notice that `factories.Receivers` is the field holding a map to all the receiver
factories (instances of `receiver.Factory`), and it currently has the
`otlpreceiver` factory only which is instantiated through the
`otlpreceiver.NewFactory()` function call.

The `tailtracer` receiver has to provide a `receiver.Factory` implementation,
and although you will find a `receiver.Factory` interface (you can find its
definition in the
[receiver/receiver.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/receiver/receiver.go#L69) file within the Collector's
project ), the right way to provide the implementation is by using the functions
available within the `go.opentelemetry.io/collector/receiver` package.

### Implementing your receiver.Factory

Start by creating a file named factory.go within the `tailtracer` folder.

```sh
cd tailtracer
touch factory.go
```

Now let's follow the convention and add a function named `NewFactory()` that
will be responsible to instantiate the `tailtracer` factory. Go ahead the add
the following code to your `factory.go` file:

```go
package tailtracer

import (
	"go.opentelemetry.io/collector/receiver"
)

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {

}
```

In order to instantiate your `tailtracer` receiver factory, you will use the
following function from the `receiver` package:

```go
func NewFactory(cfgType component.Type, createDefaultConfig component.CreateDefaultConfigFunc, options ...FactoryOption) Factory
```

The `receiver.NewFactory()` instantiates and returns a `receiver.Factory` and it
requires the following parameters:

- `component.Type`: a unique string identifier for your receiver across all
  Collector's components.

- `component.CreateDefaultConfigFunc`: a reference to a function that returns
  the component.Config instance for your receiver.

- `...FactoryOption`: the slice of `receiver.FactoryOption`s that will determine
  what type of signal your receiver is capable of processing.

Let's now implement the code to support all the parameters required by
`receiver.NewFactory()`.

### Identifying and Providing default settings for the receiver

Previously, we said that the `interval` setting for our `tailtracer` receiver
would be optional, in that case you will need to provide a default value for it
so it can be used as part of the default settings.

Go ahead and add the following code to your `factory.go` file:

```go
const (
	typeStr = "tailtracer"
	defaultInterval = 1 * time.Minute
)
```

As for default settings, you just need to add a function that returns a
`component.Config` holding the default configurations for the `tailtracer`
receiver.

To accomplish that, go ahead and add the following code to your `factory.go`
file:

```go
func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}
```

After these two changes you will notice a few imports are missing, so here is
what your `factory.go` file should look like with the proper imports:

> factory.go

```go
package tailtracer

import (
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/receiver"
)

const (
	typeStr = "tailtracer"
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Importing the `time` package in order to support the time.Duration type for
  the defaultInterval.
- Importing the `go.opentelemetry.io/collector/component` package, which is
  where `component.Config` is declared.
- Importing the `go.opentelemetry.io/collector/receiver` package, which is where
  `receiver.Factory` is declared.
- Added a `time.Duration` constant called `defaultInterval` to represent the
  default value for our receiver's `Interval` setting. We will be setting the
  default value for 1 minute hence the assignment of `1 * time.Minute` as its
  value.
- Added a function called `createDefaultConfig` which is responsible to return a
  component.Config implementation, which in this case is going to be an instance
  of our `tailtracer.Config` struct.
- The `tailtracer.Config.Interval` field was initialized with the
  `defaultInterval` constant.

{{% /alert %}}

### Enabling the factory to describe the receiver as capable of processing traces

The same receiver component can process traces, metrics, and logs. The
receiver's factory is responsible for describing those capabilities.

Given that traces are the subject of the tutorial, that's the only signal we
will enable the `tailtracer` receiver to work with. The `receiver` package
provides the following function and type to help the factory describe the trace
processing capabilities:

```go
func WithTraces(createTracesReceiver CreateTracesFunc, sl component.StabilityLevel) FactoryOption
```

The `receiver.WithTraces()` instantiates and returns a `receiver.FactoryOption`
and it requires the following parameters:

- `createTracesReceiver`: A reference to a function that matches the
  `receiver.CreateTracesFunc` type

The `receiver.CreateTracesFunc` type is a pointer to a function that is
responsible to instantiate and return a `receiver.Traces` instance and it
requires the following parameters:

- `context.Context`: the reference to the Collector's `context.Context` so your
  trace receiver can properly manage its execution context.
- `receiver.CreateSettings`: the reference to some of the Collector's settings
  under which your receiver is created.
- `component.Config`: the reference for the receiver config settings passed by
  the Collector to the factory so it can properly read its settings from the
  Collector config.
- `consumer.Traces`: the reference to the next `consumer.Traces` in the
  pipeline, which is where received traces will go. This is either a processor
  or an exporter.

Start by adding the bootstrap code to properly implement the
`receiver.CreateTracesFunc` function pointer. Go ahead and add the following
code to your `factory.go` file:

```go
func createTracesReceiver(_ context.Context, params receiver.CreateSettings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}
```

You now have all the necessary components to successfully instantiate your
receiver factory using the `receiver.NewFactory` function. Go ahead and and
update your `NewFactory()` function in your `factory.go` file as follow:

```go
// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

After these two changes you will notice a few imports are missing, so here is
what your `factory.go` file should look like with the proper imports:

> factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

const (
	typeStr = "tailtracer"
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.CreateSettings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

{{% alert title="Check your work" color="primary" %}}

- Importing the `context` package in order to support the `context.Context` type
  referenced in the `createTracesReceiver` function.
- Importing the `go.opentelemetry.io/collector/consumer` package in order to
  support the `consumer.Traces` type referenced in the `createTracesReceiver`
  function.
- Updated the `NewFactory()` function so it returns the `receiver.Factory`
  generated by the `receiver.NewFactory()` call with the required parameters.
  The generated receiver factory will be capable of processing traces through
  the call to
  `receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha)`

{{% /alert %}}

At this point, you have the `tailtracer` factory and config code needed for the
Collector to validate the `tailtracer` receiver settings if they are defined
within the `config.yaml`. You just need to add it to the Collector's
initialization process.

### Adding the receiver factory to the Collector's initialization

As explained before, all the Collector components are instantiated by the
`components()` function within the `components.go` file.

The `tailtracer` receiver factory instance has to be added to the `factories`
map so the Collector can load it properly as part of its initialization process.

Here is what the `components.go` file looks like after making the changes to
support that:

> components.go

```go
// Code generated by "go.opentelemetry.io/collector/cmd/builder". DO NOT EDIT.

package main

import (
	"go.opentelemetry.io/collector/exporter"
	"go.opentelemetry.io/collector/extension"
	"go.opentelemetry.io/collector/otelcol"
	"go.opentelemetry.io/collector/processor"
	"go.opentelemetry.io/collector/receiver"
	debugexporter "go.opentelemetry.io/collector/exporter/debugexporter"
	otlpexporter "go.opentelemetry.io/collector/exporter/otlpexporter"
	batchprocessor "go.opentelemetry.io/collector/processor/batchprocessor"
	otlpreceiver "go.opentelemetry.io/collector/receiver/otlpreceiver"
	tailtracer "github.com/rquedas/otel4devs/collector/receiver/trace-receiver/tailtracer"
)

func components() (otelcol.Factories, error) {
	var err error
	factories := otelcol.Factories{}

	factories.Extensions, err = extension.MakeFactoryMap(
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Receivers, err = receiver.MakeFactoryMap(
		otlpreceiver.NewFactory(),
		tailtracer.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Exporters, err = exporter.MakeFactoryMap(
		debugexporter.NewFactory(),
		otlpexporter.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Processors, err = processor.MakeFactoryMap(
		batchprocessor.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	return factories, nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Importing the
  `github.com/rquedas/otel4devs/collector/receiver/trace-receiver/tailtracer`
  module which is where the receiver types and function are.
- Added a call to `tailtracer.NewFactory()` as a parameter of the
  `receiver.MakeFactoryMap()` call so your `tailtracer` receiver factory is
  properly added to the `factories` map.

{{% /alert %}}

We added the `tailtracer` receiver settings to the `config.yaml` previously, so
here is what the beginning of the output for running your Collector with
`otelcol-dev` command should look like after building it with the current
codebase:

```console
$ ./otelcol-dev --config config.yaml
2023-09-28T08:56:53.027-0700    info    service@v0.86.0/telemetry.go:84 Setting up own telemetry...
2023-09-28T08:56:53.027-0700    info    service@v0.86.0/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
2023-09-28T08:56:53.027-0700    debug   exporter@v0.86.0/exporter.go:273        Stable component.       {"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-09-28T08:56:53.027-0700    info    exporter@v0.86.0/exporter.go:275        Development component. May change in the future.        {"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-09-28T08:56:53.027-0700    debug   receiver@v0.86.0/receiver.go:294        Alpha component. May change in the future.      {"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-09-28T08:56:53.027-0700    debug   receiver@v0.86.0/receiver.go:294        Stable component.       {"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-09-28T08:56:53.027-0700    info    service@v0.86.0/service.go:138  Starting otelcol-dev... {"Version": "1.0.0", "NumCPU": 10}
2023-09-28T08:56:53.027-0700    info    extensions/extensions.go:31     Starting extensions...
```

Look for the log line for "builder/receivers_builder.go:111" (it's the 4th line
from the bottom at the snippet showed here), you can see that the Collector
found the settings for the `tailtracer` receiver, validated them (the current
settings are all correct), but ignores the receiver given that it's not used in
any pipeline.

Let's check if the `tailtracer` factory is validating the receiver settings
correctly, the `interval` setting isn't required, so if you remove it from the
`config.yaml` and run the command again you should get the same output.

Now, let's test one of the `tailtracer` settings validation rules. Remove the
`number_of_traces` setting from the `config.yaml`, and here is what the output
for running the Collector will look like:

```console
$ ./otelcol-dev --config config.yaml
Error: invalid configuration: receiver "tailtracer" has invalid configuration: number_of_traces must be at least 1
2022/02/24 13:00:20 collector server run finished with error: invalid configuration: receiver "tailtracer" has invalid configuration: number_of_traces must be at least 1
```

The `tailtracer` receiver factory and config requirements are done and the
Collector is properly loading your component. You can now move to the core of
your receiver, the implementation of the component itself.

## Implementing the trace receiver component

In the previous section, I mentioned the fact that a receiver can process any of
the OpenTelemetry signals, and the Collector's API is designed to help you
accomplish that.

All the receiver APIs responsible to enable the signals are currently declared
in the
[receiver/receiver.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/receiver/receiver.go) file within the OTel
Collector's project in GitHub, open the file and take a minute to browse through
all the interfaces declared in it.

Notice that `receiver.Traces` (and its siblings `receiver.Metrics` and
`receiver.Logs`) at this point in time, doesn't describe any specific methods
other than the ones it "inherits" from `component.Component`.

It might feel weird, but remember, the Collector's API was meant to be
extensible, and the components and their signals might evolve in different ways,
so the role of those interfaces exist to help support that.

So, to create a `receiver.Traces`, you just need to implement the following
methods described by `component.Component` interface:

```go
Start(ctx context.Context, host Host) error
Shutdown(ctx context.Context) error
```

Both methods actually act as event handlers used by the Collector to communicate
with its components as part of their lifecycle.

The `Start()` represents a signal of the Collector telling the component to
start its processing. As part of the event, the Collector will pass the
following information:

- `context.Context`: Most of the time, a receiver will be processing a
  long-running operation, so the recommendation is to ignore this context and
  actually create a new one from context.Background().
- `Host`: The host is meant to enable the receiver to communicate with the
  Collector's host once it's up and running.

The `Shutdown()` represents a signal of the Collector telling the component that
the service is getting shutdown and as such the component should stop its
processing and make all the necessary cleanup work required:

- `context.Context`: the context passed by the Collector as part of the shutdown
  operation.

You will start the implementation by creating a new file called
`trace-receiver.go` within your project's `tailtracer` folder and add the
declaration to a type type called `tailtracerReceiver` as follow:

```go
type tailtracerReceiver struct{

}
```

Now that you have the `tailtracerReceiver` type you can implement the Start()
and Shutdown() methods so the receiver type can be compliant with the
`receiver.Traces` interface.

Here is what the `tailtracer/trace-receiver.go` file should look like with the
methods implementation:

> trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Importing the `context` package which is where the `Context` type and
  functions are declared.
- Importing the `go.opentelemetry.io/collector/component` package which is where
  the `Host` type is declared.
- Added a bootstrap implementation of the
  `Start(ctx context.Context, host component.Host)` method to comply with the
  `receiver.Traces` interface.
- Added a bootstrap implementation of the `Shutdown(ctx context.Context)` method
  to comply with the `receiver.Traces` interface.

{{% /alert %}}

The `Start()` method is passing 2 references (`context.Context` and
`component.Host`) that your receiver might need to keep so they can be used as
part of its processing operations.

The `context.Context` reference should be used for creating a new context to
support you receiver processing operations, and in that case you will need to
decide the best way to handle context cancellation so you can finalize it
properly as part of the component's shutdown within the `Shutdown()` method.

The `component.Host` can be useful during the whole lifecycle of the receiver so
you should keep that reference within your `tailtracerReceiver` type.

Here is what the `tailtracerReceiver` type declaration will look like after you
include the fields for keeping the references suggested above:

```go
type tailtracerReceiver struct {
  host component.Host
  cancel context.CancelFunc
}
```

Now you need to update the `Start()` methods so the receiver can properly
initialize its own processing context and have the cancellation function kept in
the `cancel` field and also initialize its `host` field value. You will also
update the `Stop()` method in order to finalize the context by calling the
`cancel` function.

Here is what the `trace-receiver.go` file look like after making the changes
above:

> trace-receiver.go

```go
package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
    host component.Host
	cancel context.CancelFunc
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
    tailtracerRcvr.host = host
    ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	tailtracerRcvr.cancel()
	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Updated the `Start()` method by adding the initialization to the `host` field
  with the `component.Host` reference passed by the Collector and the `cancel`
  function field with the cancellation based on a new context created with
  `context.Background()` (according the Collector's API documentation
  suggestions).
- Updated the `Stop()` method by adding a call to the `cancel()` context
  cancellation function.

{{% /alert %}}

### Keeping information passed by the receiver's factory

Now that you have implemented the `receiver.Traces` interface methods, your
`tailtracer` receiver component is ready to be instantiated and returned by its
factory.

Open the `tailtracer/factory.go` file and navigate to the
`createTracesReceiver()` function. Notice that the factory will pass references
as part of the `createTracesReceiver()` function parameters that your receiver
actually requires to work properly like its configuration settings
(`component.Config`), the next `Consumer` in the pipeline that will consume the
generated traces (`consumer.Traces`) and the Collector's logger so the
`tailtracer` receiver can add meaningful events to it
(`receiver.CreateSettings`).

Given that all this information will be only be made available to the receiver
at the moment its instantiated by the factory, The `tailtracerReceiver` type
will need fields to keep that information and use it within other stages of its
lifecycle.

Here is what the `trace-receiver.go` file looks like with the updated
`tailtracerReceiver` type declaration:

> trace-receiver.go

```go
package tailtracer

import (
	"context"
	"time"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.uber.org/zap"
)

type tailtracerReceiver struct {
	host         component.Host
	cancel       context.CancelFunc
	logger       *zap.Logger
	nextConsumer consumer.Traces
	config       *Config
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	tailtracerRcvr.cancel()
	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Importing the `go.opentelemetry.io/collector/consumer` which is where the
  pipeline's consumer types and interfaces are declared.
- Importing the `go.uber.org/zap` package, which is what the Collector uses for
  its debugging capabilities.
- Added a `zap.Logger` field named `logger` so we can have access to the
  Collector's logger reference from within the receiver.
- Added a `consumer.Traces` field named `nextConsumer` so we can push the traces
  generated by the `tailtracer` receiver to the next consumer declared in the
  Collector's pipeline.
- Added a `Config` field named `config` so we can have access to receiver's
  configuration settings defined within the Collector's config.
- Added a variable named `interval` that will be initialized as a
  `time.Duration` based on the value of the `interval` settings of the
  `tailtracer` receiver defined within the Collector's config.
- Added a `go func()` to implement the `ticker` mechanism so our receiver can
  generate traces every time the `ticker` reaches the amount of time specified
  by the `interval` variable and used the `tailtracerRcvr.logger` field to
  generate a info message every time the receiver supposed to be generating
  traces.

{{% /alert %}}

The `tailtracerReceiver` type is now ready to be instantiated and keep all
meaningful information passed by its factory.

Open the `tailtracer/factory.go` file and navigate to the
`createTracesReceiver()` function.

The receiver is only instantiated if it's declared as a component within a
pipeline and the factory is responsible to make sure the next consumer (either a
processor or exporter) in the pipeline is valid otherwise it should generate an
error.

The Collector's API provides some standard error types to help the factory
handle pipeline configurations. Your receiver factory should throw a
`component.ErrNilNextConsumer` in case the next consumer has an issue and is
passed as nil.

The `createTracesReceiver()` function will need a guard clause to make that
validation.

You will also need variables to properly initialize the `config` and the
`logger` fields of the `tailtracerReceiver` instance.

Here is what the `factory.go` file looks like with the updated
`createTracesReceiver()` function:

> factory.go

```go
package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

const (
	typeStr = "tailtracer"
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.CreateSettings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	if consumer == nil {
		return nil, component.ErrNilNextConsumer
	}

	logger := params.Logger
	tailtracerCfg := baseCfg.(*Config)

	traceRcvr := &tailtracerReceiver{
		logger:       logger,
		nextConsumer: consumer,
		config:       tailtracerCfg,
	}

	return traceRcvr, nil
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
```

{{% alert title="Check your work" color="primary" %}}

- Added a guard clause that verifies if the consumer is properly instantiated
  and if not returns the `component.ErrNilNextConsumer`error.
- Added a variable called `logger` and initialized it with the Collector's
  logger that is available as a field named `Logger` within the
  `receiver.CreateSettings` reference.
- Added a variable called `tailtracerCfg` and initialized it by casting the
  `component.Config` reference to the `tailtracer` receiver `Config`.
- Added a variable called `traceRcvr` and initialized it with the
  `tailtracerReceiver` instance using the factory information stored within the
  variables.
- Updated the return statement to now include the `traceRcvr` instance.

{{% /alert %}}

With the factory fully implemented and instantiating the trace receiver
component you are ready to test the receiver as part of a pipeline. Go ahead and
add the `tailtracer` receiver to your `traces` pipeline in the `config.yaml` as
follow:

```yaml
service:
  pipelines:
    traces:
      receivers: [otlp, tailtracer]
      processors: []
      exporters: [otlp/jaeger, debug]
```

Here is what the output for running your Collector with `otelcol-dev` command
should look like after you updated the `traces` pipeline:

```console
$ ./otelcol-dev --config config.yaml
2023-09-28T08:59:52.111-0700    info    service@v0.86.0/telemetry.go:84 Setting up own telemetry...
2023-09-28T08:59:52.111-0700    info    service@v0.86.0/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
2023-09-28T08:59:52.111-0700    debug   exporter@v0.86.0/exporter.go:273        Stable component.       {"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-09-28T08:59:52.112-0700    info    exporter@v0.86.0/exporter.go:275        Development component. May change in the future.        {"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-09-28T08:59:52.112-0700    debug   receiver@v0.86.0/receiver.go:294        Stable component.       {"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-09-28T08:59:52.112-0700    debug   receiver@v0.86.0/receiver.go:294        Alpha component. May change in the future.      {"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-09-28T08:59:52.112-0700    info    service@v0.86.0/service.go:138  Starting otelcol-dev... {"Version": "1.0.0", "NumCPU": 10}
2023-09-28T08:59:52.112-0700    info    extensions/extensions.go:31     Starting extensions...
2023-09-28T08:59:52.113-0700    info    otlpreceiver@v0.86.0/otlp.go:83 Starting GRPC server    {"kind": "receiver", "name": "otlp", "data_type": "traces", "endpoint": "0.0.0.0:4317"}
2023-09-28T08:59:52.113-0700    info    service@v0.86.0/service.go:161  Everything is ready. Begin running and processing data.
2023-09-28T09:00:52.113-0700    info    tailtracer/receiver.go:33       I should start processing traces now!   {"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
```

Look for the log line for "builder/receivers_builder.go:68 Receiver is
starting... {"kind": "receiver", "name": "tailtracer"}", you can see that the
Collector found the settings for the `tailtracer` receiver within the `traces`
pipeline and is now instantiating it and starting it given that 1 minute after
the Collector has started, you can see the info line we added to the `ticker`
function within the `Start()` method.

Now, go ahead and press <kbd>Ctrl + C</kbd> in your Collector's terminal so you
want watch the shutdown process happening. Here is what the output should look
like:

```cmd
^C2023-09-28T09:01:18.784-0700  info    otelcol@v0.86.0/collector.go:250        Received signal from OS {"signal": "interrupt"}
2023-09-28T09:01:18.784-0700    info    service@v0.86.0/service.go:170  Starting shutdown...
2023-09-28T09:01:18.784-0700    info    zapgrpc/zapgrpc.go:178  [core] [Server #3 ListenSocket #4] ListenSocket deleted {"grpc_log": true}
2023-09-28T09:01:18.784-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel Connectivity change to SHUTDOWN     {"grpc_log": true}
2023-09-28T09:01:18.784-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] ccBalancerWrapper: closing  {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Closing the name resolver   {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to SHUTDOWN    {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel deleted    {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    zapgrpc/zapgrpc.go:178  [transport] [client-transport 0x140002c8000] Closing: rpc error: code = Canceled desc = grpc: the client connection is closing   {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel deleted     {"grpc_log": true}
2023-09-28T09:01:18.785-0700    info    extensions/extensions.go:45     Stopping extensions...
2023-09-28T09:01:18.785-0700    info    service@v0.86.0/service.go:184  Shutdown complete.
```

As you can see there is an info log line for the `tailtracer` receiver which
means the component is responding correctly to the `Shutdown()` event. In the
next section you will learn more about the OpenTelemetry Trace data model so the
`tailtracer` receiver can finally generate traces!

## The Collector's Trace Data Model

You might be familiar with OpenTelemetry traces by using the SDKs and
instrumenting an application so you can see and evaluate your traces within a
distributed tracing backend like Jaeger.

Here is what a trace looks like in Jaeger:

![Jaeger trace](/img/docs/tutorials/Jaeger.jpeg)

Granted, this is a Jaeger trace, but it was generated by a trace pipeline within
the Collector, therefore you can use it to learn a few things about the OTel
trace data model :

- A trace is made of one or multiple spans structured within a hierarchy to
  represent dependencies.
- The spans can represent operations within a service and/or across services.

Creating a trace within the trace receiver will be slightly different than the
way you would do it with the SDKs, so let's start reviewing the high level
concepts.

### Working with Resources

In the OTel world, all telemetry is generated by a `Resource`, here is the
definition according to the [OTel spec](/docs/specs/otel/resource/sdk):

> A `Resource` is an immutable representation of the entity producing telemetry
> as Attributes. For example, a process producing telemetry that is running in a
> container on Kubernetes has a Pod name, it is in a namespace and possibly is
> part of a Deployment which also has a name. All three of these attributes can
> be included in the `Resource`.

Traces are most commonly used to represent a service request (the Services
entity described by Jaeger's model), which are normally implemented as processes
running in a compute unit, but OTel's API approach to describe a `Resource`
through attributes is flexible enough to represent any entity that you may
require like ATMs, IoT sensors, the sky is the limit.

So it's safe to say that for a trace to exist, a `Resource` will have to start
it.

In this tutorial we will simulate a system that has telemetry that demonstrate
ATMs located in 2 different states (eg: Illinois and California) accessing the
Account's backend system to execute balance, deposit and withdraw operations,
therefore we will have to implement code to create the `Resource` types
representing the ATM and the backend system.

Go ahead and create a file named `model.go` inside the `tailtracer` folder

```sh
cd tailtracer
touch model.go
```

Now, within the `model.go` file, add the definition for the `Atm` and the
`BackendSystem` types as follow:

> model.go

```go
package tailtracer

type Atm struct{
    ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
    OSVersion     string
	CloudProvider string
	CloudRegion   string
	ServiceName   string
	Endpoint      string
}
```

These types are meant to represent the entities as they are within the system
being observed and they contain information that would be quite meaningful to be
added to the traces as part of the `Resource` definition. You will add some
helper functions to generate the instances of those types.

Here is what the `model.go` file will look with the helper functions:

> model.go

```go
package tailtracer

import (
	"math/rand"
	"time"
)

type Atm struct{
    ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
    OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm{
	i := getRandomNumber(1, 2)
    var newAtm Atm

	switch i {
		case 1:
			newAtm = Atm{
				ID: 111,
				Name: "ATM-111-IL",
				SerialNumber: "atmxph-2022-111",
				Version: "v1.0",
				ISPNetwork: "comcast-chicago",
				StateID: "IL",

			}

		case 2:
			newAtm = Atm{
				ID: 222,
				Name: "ATM-222-CA",
				SerialNumber: "atmxph-2022-222",
				Version: "v1.0",
				ISPNetwork: "comcast-sanfrancisco",
				StateID: "CA",
			}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem{
    i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
    	ProcessName: "accounts",
		Version: "v2.5",
		OSType: "lnx",
		OSVersion: "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion: "us-east-2",
	}

	switch i {
		case 1:
		 	newBackend.Endpoint = "api/v2.5/balance"
		case 2:
		  	newBackend.Endpoint = "api/v2.5/deposit"
		case 3:
			newBackend.Endpoint = "api/v2.5/withdrawn"

	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max - min + 1) + min)
    return i
}
```

{{% alert title="Check your work" color="primary" %}}

- Imported the `math/rand` and `time` packages to support the implementation of
  the `generateRandomNumber` function.
- Added the `generateAtm` function that instantiates an `Atm` type and randomly
  assign either Illinois or California as values for `StateID` and the
  equivalent value for `ISPNetwork`.
- Added the `generateBackendSystem` function that instantiates a
  `BackendSystem`type and randomly assign service endpoint values for the
  `Endpoint` field.
- Added the `generateRandomNumber` function to help generating random numbers
  between a desired range.

{{% /alert %}}

Now that you have the functions to generate object instances representing the
entities generating telemetry, you are ready to represent those entities in the
OTel Collector world.

The Collector's API provides a package named `ptrace` (nested under the `pdata`
package) with all the types, interfaces and helper functions required to work
with traces within the Collector's pipeline components.

Open the `tailtracer/model.go` file and add
`go.opentelemetry.io/collector/pdata/ptrace` to the `import` clause so you can
have access to the `ptrace` package capabilities.

Before you can define a `Resource`, you need to create a `ptrace.Traces` that
will be responsible to propagate the traces through the Collector's pipeline and
you can use the helper function `ptrace.NewTraces()` to instantiate it. You will
also need to create instances of the `Atm` and `BackendSystem` types so you can
have data to represent the telemetry sources involved in your trace.

Open the `tailtracer/model.go` file and add the following function to it:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()
	}

	return traces
}
```

By now you have heard and read enough about how traces are made up of Spans. You
have probably also written some instrumentation code using the SDK's functions
and types available to create them, but what you probably didn't know, is that
within the Collector's API, that there are other types of "spans" involved in
creating a trace.

You will start with a type called `ptrace.ResourceSpans` which represents the
resource and all the operations that it either originated or received while
participating in a trace. You can find its definition within the
[/pdata/internal/data/protogen/trace/v1/trace.pb.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/pdata/internal/data/protogen/trace/v1/trace.pb.go).

`ptrace.Traces` has a method named `ResourceSpans()` which returns an instance
of a helper type called `ptrace.ResourceSpansSlice`. The
`ptrace.ResourceSpansSlice` type has methods to help you handle the array of
`ptrace.ResourceSpans` that will contain as many items as the number of
`Resource` entities participating in the request represented by the trace.

`ptrace.ResourceSpansSlice` has a method named `AppendEmpty()` that adds a new
`ptrace.ResourceSpan` to the array and return its reference.

Once you have an instance of a `ptrace.ResourceSpan` you will use a method named
`Resource()` which will return the instance of the `pcommon.Resource` associated
with the `ResourceSpan`.

Update the `generateTrace()` function with the following changes:

- add a variable named `resourceSpan` to represent the `ResourceSpan`
- add a variable named `atmResource` to represent the `pcommon.Resource`
  associated with the `ResourceSpan`.
- Use the methods mentioned above to initialize both variables respectively.

Here is what the function should look like after you implemented these changes:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
	}

	return traces
}
```

{{% alert title="Check your work" color="primary" %}}

- Added the `resourceSpan` variable and initialized it with the `ResourceSpan`
  reference returned by the `traces.ResourceSpans().AppendEmpty()` call.
- Added the `atmResource` variable and initialized it with the
  `pcommon.Resource` reference returned by the `resourceSpan.Resource()` call.

{{% /alert %}}

### Describing Resources through attributes

The Collector's API provides a package named `pcommon` (nested under the `pdata`
package) with all the types and helper functions required to describe a
`Resource`.

In the Collector's world, a `Resource` is described by attributes in a key/value
pair format represented by the `pcommon.Map` type.

You can check the definition of the `pcommon.Map` type and the related helper
functions to create attribute values using the supported formats in the
[/pdata/pcommon/common.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/pdata/pcommon/common.go) file within the Otel
Collector's GitHub project.

Key/value pairs provide a lot of flexibility to help model your `Resource` data,
so the OTel specification has some guidelines in place to help organize and
minimize the conflicts across all the different types of telemetry generation
entities that it may need to represent.

These guidelines are known as Resource Semantic Conventions and are
[documented in the OTel specification](/docs/specs/semconv/resource/).

When creating your own attributes to represent your own telemetry generation
entities, you should follow the guideline provided by the specification:

> Attributes are grouped logically by the type of the concept that they
> described. Attributes in the same group have a common prefix that ends with a
> dot. For example all attributes that describe Kubernetes properties start with
> `k8s.`

Let's start by opening the `tailtracer/model.go` and adding
`go.opentelemetry.io/collector/pdata/pcommon` to the `import` clause so you can
have access to the `pcommon` package capabilities.

Now go ahead and add a function to read the field values from an `Atm` instance
and write them as attributes (grouped by the prefix "atm.") into a
`pcommon.Resource` instance. Here is what the function looks like:

```go
func fillResourceWithAtm(resource *pcommon.Resource, atm Atm){
   atmAttrs := resource.Attributes()
   atmAttrs.PutInt("atm.id", atm.ID)
   atmAttrs.PutStr("atm.stateid", atm.StateID)
   atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
   atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
}
```

{{% alert title="Check your work" color="primary" %}}

- Declared a variable called `atmAttrs` and initialized it with the
  `pcommon.Map` reference returned by the `resource.Attributes()` call.
- Used the `PutInt()` and `PutStr()` methods from `pcommon.Map` to add int and
  string attributes based on the equivalent `Atm` field types. Notice that
  because those attributes are very specific and only represent the `Atm`
  entity, they are all grouped within the "atm." prefix.

{{% /alert %}}

The resource semantic conventions also have prescriptive attribute names and
well-known values to represent telemetry generation entities that are common and
applicable across different domains like
[compute unit](/docs/specs/semconv/resource/#compute-unit),
[environment](/docs/specs/semconv/resource/#compute-unit) and others.

So, when you look at the `BackendSystem` entity, it has fields representing
[OS](/docs/specs/semconv/resource/os/) related information and
[Cloud](/docs/specs/semconv/resource/cloud/) related information, and we will
use the attribute names and values prescribed by the resource semantic
convention to represent that information on its `Resource`.

All the resource semantic convention attribute names and well known-values are
kept within the
[/semconv/v1.9.0/generated_resource.go](https://github.com/open-telemetry/opentelemetry-collector/blob/{{%
param collectorVersion %}}/semconv/v1.9.0/generated_resource.go) file within the
Collector's GitHub project.

Let's create a function to read the field values from an `BackendSystem`
instance and write them as attributes into a `pcommon.Resource` instance. Open
the `tailtracer/model.go` file and add the following function:

```go
func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem){
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
		case backend.CloudProvider == "amzn":
			cloudProvider = conventions.AttributeCloudProviderAWS
		case backend.OSType == "mcrsft":
			cloudProvider = conventions.AttributeCloudProviderAzure
		case backend.OSType == "gogl":
			cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
		case backend.OSType == "lnx":
			osType = conventions.AttributeOSTypeLinux
		case backend.OSType == "wndws":
			osType = conventions.AttributeOSTypeWindows
		case backend.OSType == "slrs":
			osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)
 }
```

Notice that I didn't add an attribute named "atm.name" or "backendsystem.name"
to the `pcommon.Resource` representing the `Atm` and `BackendSystem` entity
names, that's because most (not to say all) distributed tracing backend systems
that are compatible with the OTel trace specification, interpret the
`pcommon.Resource` described in a trace as a `Service`, therefore they expect
the `pcommon.Resource` to carry a required attribute named `service.name` as
prescribed by the resource semantic convention.

We will also use non-required attribute named `service.version` to represent the
version information for both `Atm` and `BackendSystem` entities.

Here is what the `tailtracer/model.go` file looks like after adding the code for
properly assign the "service." group attributes:

> model.go

```go
package tailtracer

import (
	"math/rand"
	"time"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	conventions "go.opentelemetry.io/collector/semconv/v1.9.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
		case 1:
			newAtm = Atm{
				ID:           111,
				Name:         "ATM-111-IL",
				SerialNumber: "atmxph-2022-111",
				Version:      "v1.0",
				ISPNetwork:   "comcast-chicago",
				StateID:      "IL",
			}

		case 2:
			newAtm = Atm{
				ID:           222,
				Name:         "ATM-222-CA",
				SerialNumber: "atmxph-2022-222",
				Version:      "v1.0",
				ISPNetwork:   "comcast-sanfrancisco",
				StateID:      "CA",
			}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
		case 1:
			newBackend.Endpoint = "api/v2.5/balance"
		case 2:
			newBackend.Endpoint = "api/v2.5/deposit"
		case 3:
			newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(conventions.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(conventions.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
		case backend.CloudProvider == "amzn":
			cloudProvider = conventions.AttributeCloudProviderAWS
		case backend.OSType == "mcrsft":
			cloudProvider = conventions.AttributeCloudProviderAzure
		case backend.OSType == "gogl":
			cloudProvider = conventions.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(conventions.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(conventions.AttributeCloudRegion, backend.CloudRegion)

	switch {
		case backend.OSType == "lnx":
			osType = conventions.AttributeOSTypeLinux
		case backend.OSType == "wndws":
			osType = conventions.AttributeOSTypeWindows
		case backend.OSType == "slrs":
			osType = conventions.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(conventions.AttributeOSType, osType)
	backendAttrs.PutStr(conventions.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(conventions.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(conventions.AttributeServiceVersion, backend.Version)
}
```

{{% alert title="Check your work" color="primary" %}}

- Imported the `go.opentelemetry.io/collector/semconv/v1.9.0` package as
  `conventions`, in order to have access to all resource semantic conventions
  attribute names and values.
- Updated the `fillResourceWithAtm()` function by adding lines to properly
  assign the "service.name" and "service.version" attributes to the
  `pcommon.Resource` representing the `Atm` entity
- Updated the `fillResourceWithBackendSystem()` function by adding lines to
  properly assign the "service.name" and "service.version" attributes to the
  `pcommon.Resource` representing the `BackendSystem` entity
- Updated the `generateTraces` function by adding lines to properly instantiate
  a `pcommon.Resource` and fill in the attribute information for both `Atm` and
  `BackendSystem` entities using the `fillResourceWithAtm()` and
  `fillResourceWithBackendSystem()` functions

{{% /alert %}}

### Representing operations with spans

You now have a `ResourceSpan` instance with their respective `Resource` properly
filled with attributes to represent the `Atm` and `BackendSystem` entities, you
are ready to represent the operations that each `Resource` execute as part of a
trace within the `ResourceSpan`.

In the OTel world, in order for a system to generate telemetry, it needs to be
instrumented either manually or automatically through an instrumentation
library.

The instrumentation libraries are responsible to set the scope (also known as
the instrumentation scope) in which the operations participating on a trace
happened and then describe those operations as spans within the context of the
trace.

`pdata.ResourceSpans` has a method named `ScopeSpans()` which returns an
instance of a helper type called `ptrace.ScopeSpansSlice`. The
`ptrace.ScopeSpansSlice` type has methods to help you handle the array of
`ptrace.ScopeSpans` that will contain as many items as the number of
`ptrace.ScopeSpan` representing the different instrumentation scopes and the
spans it generated within the context of a trace.

`ptrace.ScopeSpansSlice` has a method named `AppendEmpty()` that adds a new
`ptrace.ScopeSpans` to the array and return its reference.

Let's create a function to instantiate a `ptrace.ScopeSpans` representing for
the ATM system's instrumentation scope and its spans. Open the
`tailtracer/model.go` file and add the following function:

```go
 func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) (ptrace.ScopeSpans){
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()

    return scopeSpans
}
```

The `ptrace.ScopeSpans` has a method named `Scope()` that returns a reference
for the `pcommon.InstrumentationScope` instance representing the instrumentation
scope that generated the spans.

`pcommon.InstrumentationScope` has the following methods to describe an
instrumentation scope:

- `SetName(v string)` sets the name for the instrumentation library

- `SetVersion(v string)` sets the version for the instrumentation library

- `Name() string` returns the name associated with the instrumentation library

- `Version() string` returns the version associated with the instrumentation
  library

Let's update the `appendAtmSystemInstrScopeSpans` function so we can set the
name and version of the instrumentation scope for the new `ptrace.ScopeSpans`.
Here is what `appendAtmSystemInstrScopeSpans` looks like after the update:

```go
 func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) (ptrace.ScopeSpans){
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}
```

You can now update the `generateTraces` function and add variables to represent
the instrumentation scope used by both `Atm` and `BackendSystem` entities by
initializing them with the `appendAtmSystemInstrScopeSpans()`. Here is what
`generateTraces()` looks like after the update:

```go
func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)
	}

	return traces
}
```

At this point, you have everything needed to represent the telemetry generation
entities in your system and the instrumentation scope that is responsible to
identify operations and generate the traces for the system. The next step is to
finally create the spans representing the operations that the given
instrumentation scope generated as part of a trace.

`ptrace.ScopeSpans` has a method named `Spans()` which returns an instance of a
helper type called `ptrace.SpanSlice`. The `ptrace.SpanSlice` type has methods
to help you handle the array of `ptrace.Span` that will contain as many items as
the number of operations the instrumentation scope was able to identify and
describe as part of the trace.

`ptrace.SpanSlice` has a method named `AppendEmpty()` that adds a new
`ptrace.Span` to the array and return its reference.

`ptrace.Span` has the following methods to describe an operation:

- `SetTraceID(v pcommon.TraceID)` sets the `pcommon.TraceID` uniquely
  identifying the trace which this span is associated with

- `SetSpanID(v pcommon.SpanID)` sets the `pcommon.SpanID` uniquely identifying
  this span within the context of the trace it is associated with

- `SetParentSpanID(v pcommon.SpanID)` sets `pcommon.SpanID` for the parent
  span/operation in case the operation represented by this span is executed as
  part of the parent (nested)

- `SetName(v string)` sets the name of the operation for the span

- `SetKind(v ptrace.SpanKind)` sets `ptrace.SpanKind` defining what kind of
  operation the span represents.

- `SetStartTimestamp(v pcommon.Timestamp)` sets the `pcommon.Timestamp`
  representing the date and time when the operation represented by the span has
  started

- `SetEndTimestamp(v pcommon.Timestamp)` sets the `pcommon.Timestamp`
  representing the date and time when the operation represented by the span has
  ended

As you can see per the methods above, a `ptrace.Span` is uniquely identified by
2 required IDs; their own unique ID represented by the `pcommon.SpanID` type and
the ID of the trace they are associated with represented by a `pcommon.TraceID`
type.

The `pcommon.TraceID` has to carry a globally unique ID represented through a 16
byte array and should follow the
[W3C Trace Context specification](https://www.w3.org/TR/trace-context/#trace-id)
while the `pcommon.SpanID` is a unique ID within the context of the trace they
are associated with and it's represented through a 8 byte array.

The `pcommon` package provides the following types to generate the span's IDs:

- `type TraceID [16]byte`

- `type SpanID [8]byte`

For this tutorial, you will be creating the IDs using functions from
`github.com/google/uuid` package for the `pcommon.TraceID` and functions from
the `crypto/rand` package to randomly generate the `pcommon.SpanID`. Open the
`tailtracer/model.go` file and add both packages to the `import` statement;
after that, add the following functions to help generate both IDs:

```go
import (
	crand "crypto/rand"
	"math/rand"
  	...
)

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}
```

{{% alert title="Check your work" color="primary" %}}

- Imported `crypto/rand` as `crand` (to avoid conflicts with `math/rand`).

{{% /alert %}}

Now that you have a way to properly identify the spans, you can start creating
them to represent the operations within and across the entities in your system.

As part of the `generateBackendSystem()` function, we have randomly assigned the
operations that the `BackEndSystem` entity can provide as services to the
system. We will now open the `tailtracer/model.go` file and a function called
`appendTraceSpans()` that will be responsible to create a trace and append spans
representing the `BackendSystem` operations. Here is what the initial
implementation for the `appendTraceSpans()` function looks like:

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
```

{{% alert title="Check your work" color="primary" %}}

- Added `traceId` and `backendSpanId` variables to respectively represent the
  trace and the span ID and initialized them with the helper functions created
  previously.
- Added `backendSpanStartTime` and `backendSpanFinishTime` to represent the
  start and the end time of the operation. For the tutorial, any `BackendSystem`
  operation will take 1 second.
- Added a variable called `backendSpan` which will hold the instance of the
  `ptrace.Span` representing this operation.
- Setting the `Name` of the span with the `Endpoint` field value from the
  `BackendSystem` instance.
- Setting the `Kind` of the span as `ptrace.SpanKindServer`. Take a look at
  [SpanKind section](/docs/specs/otel/trace/api/#spankind) within the trace
  specification to understand how to properly define SpanKind.
- Used all the methods mentioned before to fill the `ptrace.Span` with the
  proper values to represent the `BackendSystem` operation.

{{% /alert %}}

You probably noticed that there are 2 references to `ptrace.ScopeSpans` as
parameters in the `appendTraceSpans()` function, but we only used one of them.
Don't worry about it for now, we will get back to it later.

You will now update the `generateTraces()` function so it can actually generate
the trace by calling the `appendTraceSpans()` function. Here is what the updated
`generateTraces()` function looks like:

```go
func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}
```

You now have the `BackendSystem` entity and its operations represented in spans
within a proper trace context! All you need to do is to push the generated trace
through the pipeline so the next consumer (either a processor or an exporter)
can receive and process it.

`consumer.Traces` has a method called `ConsumeTraces()` which is responsible to
push the generated traces to the next consumer in the pipeline. All you need to
do now is to update the `Start()` method within the `tailtracerReceiver` type
and add the code to use it.

Open the `tailtracer/trace-receiver.go` file and update the `Start()` method as
follow:

```go
func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
    tailtracerRcvr.host = host
    ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
					tailtracerRcvr.nextConsumer.ConsumeTraces(ctx, generateTraces(tailtracerRcvr.config.NumberOfTraces))
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}
```

{{% alert title="Check your work" color="primary" %}}

- Added a line under the `case <=ticker.C` condition calling the
  `tailtracerRcvr.nextConsumer.ConsumeTraces()` method passing the new context
  created within the `Start()` method (`ctx`) and a call to the `generateTraces`
  function so the generated traces can be pushed to the next consumer in the
  pipeline.

{{% /alert %}}

If you run your `otelcol-dev`, here is what the output should look like after 2
minutes running:

```cmd
Starting: /Users/rquedas/go/bin/dlv dap --check-go-version=false --listen=127.0.0.1:54625 --log-dest=3 from /Users/rquedas/Documents/vscode-workspace/otel4devs/collector/receiver/trace-receiver/otelcol-dev
DAP server listening at: 127.0.0.1:54625
2023-09-28T08:59:52.111-0700    info    service@v0.86.0/telemetry.go:84 Setting up own telemetry...
2023-09-28T08:59:52.111-0700    info    service@v0.86.0/telemetry.go:201        Serving Prometheus metrics      {"address": ":8888", "level": "Basic"}
2023-09-28T08:59:52.111-0700    debug   exporter@v0.86.0/exporter.go:273        Stable component.       {"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-09-28T08:59:52.112-0700    info    exporter@v0.86.0/exporter.go:275        Development component. May change in the future.        {"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-09-28T08:59:52.112-0700    debug   receiver@v0.86.0/receiver.go:294        Stable component.       {"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-09-28T08:59:52.112-0700    debug   receiver@v0.86.0/receiver.go:294        Alpha component. May change in the future.      {"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-09-28T08:59:52.112-0700    info    service@v0.86.0/service.go:138  Starting otelcol-dev... {"Version": "1.0.0", "NumCPU": 10}
2023-09-28T08:59:52.112-0700    info    extensions/extensions.go:31     Starting extensions...
2023-09-28T08:59:52.113-0700    info    otlpreceiver@v0.86.0/otlp.go:83 Starting GRPC server    {"kind": "receiver", "name": "otlp", "data_type": "traces", "endpoint": "0.0.0.0:4317"}
2023-09-28T08:59:52.113-0700    info    service@v0.86.0/service.go:161  Everything is ready. Begin running and processing data.
2023-09-28T08:59:52.113-0700    info    zapgrpc/zapgrpc.go:178  [core] [Server #3 ListenSocket #4] ListenSocket created {"grpc_log": true}
2023-09-28T08:59:52.124-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY       {"grpc_log": true}
2023-09-28T08:59:52.124-0700    info    zapgrpc/zapgrpc.go:178  [core] [pick-first-lb 0x1400054fd10] Received SubConn state update: 0x1400054fec0, {ConnectivityState:READY ConnectionError:<nil>}       {"grpc_log": true}
2023-09-28T08:59:52.124-0700    info    zapgrpc/zapgrpc.go:178  [core] [Channel #1] Channel Connectivity change to READY        {"grpc_log": true}
2023-09-28T09:00:52.113-0700    info    tailtracer/receiver.go:33       I should start processing traces now!   {"kind": "receiver", "name": "tailtracer", "data_type": "traces"}

2023-09-28T09:00:52.743-0700	INFO	debugexporter/debug_exporter.go:40	TracesExporter	{"#spans": 1}
2023-09-28T09:00:52.743-0700	DEBUG	debugexporter/debug_exporter.go:49	ResourceSpans #0
Resource SchemaURL:
Resource labels:
     -> atm.id: INT(222)
     -> atm.stateid: STRING(CA)
     -> atm.ispnetwork: STRING(comcast-sanfrancisco)
     -> atm.serialnumber: STRING(atmxph-2022-222)
     -> service.name: STRING(ATM-222-CA)
     -> service.version: STRING(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope atm-system v1.0
ResourceSpans #1
Resource SchemaURL:
Resource labels:
     -> cloud.provider: STRING(aws)
     -> cloud.region: STRING(us-east-2)
     -> os.type: STRING(linux)
     -> os.version: STRING(4.16.10-300.fc28.x86_64)
     -> service.name: STRING(accounts)
     -> service.version: STRING(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope atm-system v1.0
Span #0
    Trace ID       : 5cce8a774d4546c2a5cbdeb607ec74c9
    Parent ID      :
    ID             : bb25c05c7fb13084
    Name           : api/v2.5/balance
    Kind           : SPAN_KIND_SERVER
    Start time     : 2023-09-28 09:00:52.743385 +0000 UTC
    End time       : 2023-09-28 09:00:53.743385 +0000 UTC
    Status code    : STATUS_CODE_OK
    Status message :
2023-09-28T09:00:52.743-0500	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer"}
2023-09-28T09:00:52.744-0500	INFO	debugexporter/debug_exporter.go:40	TracesExporter	{"#spans": 1}
2023-09-28T09:00:52.744-0500	DEBUG	debugexporter/debug_exporter.go:49	ResourceSpans #0
Resource SchemaURL:
Resource labels:
     -> atm.id: INT(111)
     -> atm.stateid: STRING(IL)
     -> atm.ispnetwork: STRING(comcast-chicago)
     -> atm.serialnumber: STRING(atmxph-2022-111)
     -> service.name: STRING(ATM-111-IL)
     -> service.version: STRING(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope atm-system v1.0
ResourceSpans #1
Resource SchemaURL:
Resource labels:
     -> cloud.provider: STRING(aws)
     -> cloud.region: STRING(us-east-2)
     -> os.type: STRING(linux)
     -> os.version: STRING(4.16.10-300.fc28.x86_64)
     -> service.name: STRING(accounts)
     -> service.version: STRING(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope atm-system v1.0
Span #0
    Trace ID       : 8a6ca822db0847f48facfebbb08bbb9e
    Parent ID      :
    ID             : 7cf668c1273ecee5
    Name           : api/v2.5/withdrawn
    Kind           : SPAN_KIND_SERVER
    Start time     : 2023-09-28 09:00:52.74404 +0000 UTC
    End time       : 2023-09-28 09:00:53.74404 +0000 UTC
    Status code    : STATUS_CODE_OK
    Status message :
```

Here is what the generated trace looks like in Jaeger:
![Jaeger trace](/img/docs/tutorials/Jaeger-BackendSystem-Trace.png)

What you currently see in Jaeger is the representation of a service that is
receiving a request from an external entity that isn't instrumented by an OTel
SDK, therefore it can't be identified as the origin/start of the trace. In order
for a `ptrace.Span` to understand it is representing an operation that was
execute as a result of another operation originated either within or outside
(nested/child) of the `Resource` within the same trace context you will need to:

- Set the same trace context as the caller operation by calling the
  `SetTraceID()` method and passing the `pcommon.TraceID` of the parent/caller
  `ptrace.Span` as a parameter.
- Define who is the caller operation within the context of the trace by calling
  `SetParentId()` method and passing the `pcommon.SpanID` of the parent/caller
  `ptrace.Span` as a parameter.

You will now create a `ptrace.Span` representing the `Atm` entity operations and
set it as the parent for `BackendSystem` span. Open the `tailtracer/model.go`
file and update the `appendTraceSpans()` function as follow:

```go
func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
		case strings.Contains(backend.Endpoint, "balance"):
			atmOperationName = "Check Balance"
		case strings.Contains(backend.Endpoint, "deposit"):
			atmOperationName = "Make Deposit"
		case strings.Contains(backend.Endpoint, "withdraw"):
			atmOperationName = "Fast Cash"
		}

	atmSpanId := NewSpanID()
    atmSpanStartTime := time.Now()
    atmDuration, _ := time.ParseDuration("4s")
    atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)


	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))


	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
    backendSpanStartTime := atmSpanStartTime.Add(backendDuration)


	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())

}
```

Go ahead and run your `otelcol-dev` again and after 2 minutes running, you
should start seeing traces in Jaeger like the following:
![Jaeger trace](/img/docs/tutorials/Jaeger-FullSystem-Traces-List.png)

We now have services representing both the `Atm` and the `BackendSystem`
telemetry generation entities in our system and can fully understand how both
entities are being used and contributing to the performance of an operation
executed by an user.

Here is the detailed view of one of those traces in Jaeger:
![Jaeger trace](/img/docs/tutorials/Jaeger-FullSystem-Trace-Details.png)

That's it! You have now reached the end of this tutorial and successfully
implemented a trace receiver, congratulations!

[^1]: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.

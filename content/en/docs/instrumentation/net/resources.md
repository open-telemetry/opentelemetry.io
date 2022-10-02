---
title: "Resources"
weight: 6
description:
---

A [resource][] represents the entity producing telemetry as resource attributes.
For example, a process producing telemetry that is running in a container on
Kubernetes has a Pod name, a namespace, and possibly a deployment name. All
three of these attributes can be included in the resource.

In your observability backend, you can use resource information to better
investigate interesting behavior. For example, if your trace or metrics data
indicate latency in your system, you can narrow it down to a specific container,
pod, or kubernetes deployment.

Below you will find some introductions on how to setup resource detection with
the Node.JS SDK.

## Setup

Follow the instructions in the [Getting Started][], so that you have a running
.NET app exporting data to the console.

## Process & Environment Resource Detection

TODO

To detect [process and process runtime resources][], ...

 and takes attributes from the environment variable `OTEL_RESOURCE_ATTRIBUTES`.

Run the application with some values set to `OTEL_RESOURCE_ATTRIBUTES`, e.g. we
set the `host.name` to identify the [Host][]:

```sh
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" dotnet run

Activity.TraceId:          460d16f39cc30f6f427c782da048e198
Activity.SpanId:           c108e932c1a4709c
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyService
Activity.DisplayName: main
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:08:30.4675920Z
Activity.Duration:    00:00:00.0044550
Activity.Tags:
    key: value
Resource associated with Activity:
    environment: production
    team: backend
    service.name: MyCompany.MyProduct.MyService
    service.version: 1.0.0
    service.instance.id: fd0af4fd-71aa-428b-aa4c-6fa145dda3a4
    host.name: localhost
```

As you can see, the resource `host.name` is added to the list of resources.

## Adding resources with environment variables

You can use the `OTEL_RESOURCE_ATTRIBUTES` environment variable to inject
resources into your application. The .NET SDK will automatically detect these
resrouces.

The following example adds [Service][], [Host][] and [OS][] resource attributes
via environment variables, running unix programs like `uname` to generate the
resource data.

```console
env OTEL_RESOURCE_ATTRIBUTES="service.name=app.js,service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    service.name: app.js
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 93B14BAD-813D-48EE-9FB1-2ADFD07C5E78
    host.name: myhost
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

## Adding resources in code

You can also add custom resources in code by attaching them to a
`ResourceBuilder`.

The following example builds on the [getting started] sample and adds two custom
resources, `environment.name` and `team.name` in code:

```csharp
using System.Diagnostics;
using System.Collections.Generic;

using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

var resourceBuilder =
    ResourceBuilder
        .CreateDefault()
        .AddAttributes(new Dictionary<string, object>
        {
            ["environment.name"] = "production",
            ["team.name"] = "backend"
        });

var sourceName = "tutorial-dotnet";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(sourceName)
    .SetResourceBuilder(resourceBuilder)
    .AddConsoleExporter()
    .Build();

var MyActivitySource = new ActivitySource(sourceName);

using var activity = MyActivitySource.StartActivity("SayHello");
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });
```

If you run the same command as in [Adding resources with environment
variables](#adding-resources-with-environment-variables), you'll see the
`environment.name` and `team.name` resources in the resource list:

Custom resources can also be configured in your code. The `NodeSDK` provides a
configuration option, where you can set them. For example you can update the
`tracing.js` like the following to have `service.*` attributes set:

```console
env OTEL_RESOURCE_ATTRIBUTES="service.name=app.js,service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    environment.name: production
    team.name: backend
    service.name: app.js
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 28976A1C-BF02-43CA-BAE0-6E0564431462
    host.name: pcarter
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

**Note**: If you set your resource attributes via environment variable and code,
any values set via the environment variable take precedence.

## Next steps

There are more resource detectors you can add to your configuration, for example
to get details about your [Cloud] environment or [Deployment][].

[resource]: /docs/reference/specification/resource/sdk/
[getting started]: /docs/instrumentation/net/getting-started/
[process and process runtime resources]:
  /docs/reference/specification/resource/semantic_conventions/process/
[host]: /docs/reference/specification/resource/semantic_conventions/host/
[otlp exporter]: /docs/instrumentation/js/exporters/#otlp-endpoint
[cloud]: /docs/reference/specification/resource/semantic_conventions/cloud/
[deployment]:
  /docs/reference/specification/resource/semantic_conventions/deployment_environment/
[service]: /docs/reference/specification/resource/semantic_conventions/#service
[os]: /docs/reference/specification/resource/semantic_conventions/os/

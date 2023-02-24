---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 3
---

You can use
[instrumentation libraries](/docs/reference/specification/glossary/#instrumentation-library)
in order to generate telemetry data for a particular instrumented library.

For example,
[the instrumentation library for ASP.NET Core](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)
will automatically create
[spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) and
[metrics](/docs/concepts/signals/metrics) based on the inbound HTTP requests.

## Setup

Each instrumentation library is a NuGet package, and installing them is
typically done like so:

```
dotnet add package OpenTelemetry.Instrumentation.{library-name-or-type}
```

It is typically then registered at application startup time, such as when
creating a [TracerProvider](/docs/concepts/signals/traces/#tracer-provider).

## Note on Versioning

The Semantic Conventions (Standards) for attribute names are not currently
stable the instrumentation package is currently not in a released state. That
doesn't mean that the functionality itself is not stable, only that the names of
some of the attributes may change in the future, some may be added, some may be
removed. This means that you need to use the `--prerelease` flag, or install a
specific version of the package

## Example with ASP.NET Core and HttpClient

As an example, here's how you can instrument inbound and output requests from an
ASP.NET Core app.

First, get the appropriate packages of OpenTelemetry Core:

```
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Exporter.Console
```

Then you can install the Instrumentation packages

```
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
```

Next, configure each instrumentation library at startup and use them!

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
      b
      .AddHttpClientInstrumentation()
      .AddAspNetCoreInstrumentation();
  });

var app = builder.Build();

var httpClient = new HttpClient();

app.MapGet("/hello", async () =>
{
    var html = await httpClient.GetStringAsync("https://example.com/");
    if (string.IsNullOrWhiteSpace(html))
    {
        return "Hello, World!";
    }
    else
    {
        return "Hello, World!";
    }
});

app.Run();
```

When you run this code and access the `/hello` endpoint, the instrumentation
libraries will:

- Start a new trace
- Generate a span representing the request made to the endpoint
- Generate a child span representing the HTTP GET made to `https://example.com/`

If you add more instrumentation libraries, then you get more spans for each of
those.

## Available instrumentation libraries

A full list of instrumentation libraries produced by OpenTelemetry is available
from the [opentelemetry-dotnet][] repository.

You can also find more instrumentations available in the
[registry](/ecosystem/registry/?language=dotnet&component=instrumentation).

## Next steps

After you have set up instrumentation libraries, you may want to add
[manual instrumentation](/docs/instrumentation/net/manual) to collect custom
telemetry data.

If you are using .NET Framework 4.x instead of modern .NET, refer to the
[.NET Framework docs](/docs/instrumentation/net/netframework) to configure
OpenTelemetry and instrumentation libraries on .NET Framework.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/net/exporters) to one or more
telemetry backends.

You can also check the
[automatic instrumentation for .NET](/docs/instrumentation/net/automatic), which
is currently in beta.

[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet

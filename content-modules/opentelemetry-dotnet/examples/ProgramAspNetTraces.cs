/*
Activity.Id:          00-d72f7e51dd06b57211f415489df89b1c-c8a394817946316d-01
    Activity.ParentId:    00-d72f7e51dd06b57211f415489df89b1c-e1c9fde6c8f415ad-01
    Activity.ActivitySourceName: MyCompany.MyProduct.MyServiceActivity.DisplayName: SayHello
    Activity.Kind:        Internal
    Activity.StartTime:   2021-12-21T01:15:27.5712866Z
    Activity.Duration:    00:00:00.0000487
    Activity.TagObjects:
        foo: 1
        bar: Hello, World!
        baz: [1, 2, 3]
    Resource associated with Activity:
        service.name: MyCompany.MyProduct.MyService
        service.version: 1.0.0
        service.instance.id: 45aacfb0-e117-40cb-9d4d-9bcca661f6dd

    Activity.Id:          00-d72f7e51dd06b57211f415489df89b1c-e1c9fde6c8f415ad-01
    Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
    Activity.DisplayName: /hello
    Activity.Kind:        Server
    Activity.StartTime:   2021-12-21T01:15:27.5384997Z
    Activity.Duration:    00:00:00.0429197
    Activity.TagObjects:
        http.host: localhost:7207
        http.method: GET
        http.target: /hello
        http.url: https://localhost:7207/hello
        http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36
        http.status_code: 200
        otel.status_code: UNSET
    Resource associated with Activity:
        service.name: MyCompany.MyProduct.MyService
        service.version: 1.0.0
        service.instance.id: 45aacfb0-e117-40cb-9d4d-9bcca661f6dd

*/

using System.Diagnostics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";
var MyActivitySource = new ActivitySource(serviceName);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetryTracing(b =>
{
    b
    .AddConsoleExporter()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddHttpClientInstrumentation()
    .AddAspNetCoreInstrumentation()
    .AddSqlClientInstrumentation();
});

var app = builder.Build();

app.MapGet("/hello", () =>
{
    using var activity = MyActivitySource.StartActivity("SayHello");
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });

    return "Hello, World!";
});

app.Run();

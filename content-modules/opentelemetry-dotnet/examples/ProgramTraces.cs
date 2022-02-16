/*
Activity.Id:          00-8389584945550f40820b96ce1ceb9299-745239d26e408342-01
    Activity.DisplayName: SayHello
    Activity.Kind:        Internal
    Activity.StartTime:   2020-08-12T15:59:10.4461835Z
    Activity.Duration:    00:00:00.0066039
    Activity.TagObjects:
        foo: 1
        bar: Hello, World!
        baz: [1, 2, 3]
    Resource associated with Activity:
        service.name: unknown_service:getting-started'

*/

using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

private static readonly ActivitySource MyActivitySource = new("MyCompany.MyProduct.MyLibrary");

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetSampler(new AlwaysOnSampler())
    .AddSource(MyActivitySource.Name)
    .AddConsoleExporter()
    .Build();

using var activity = MyActivitySource.StartActivity("SayHello")
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });

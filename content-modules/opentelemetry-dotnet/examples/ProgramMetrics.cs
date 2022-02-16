/*
Export MyCounter, Meter: MyCompany.MyProduct.MyLibrary/1.0
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:red name:apple LongSum Value: 6
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:yellow name:lemon LongSum Value: 7
(2021-09-23T22:00:08.4399776Z, 2021-09-23T22:00:08.4510115Z] color:green name:apple LongSum Value: 2

*/

using System.Diagnostics.Metrics;
using OpenTelemetry;
using OpenTelemetry.Metrics;

private static readonly Meter MyMeter = new("MyCompany.MyProduct.MyLibrary", "1.0");
private static readonly Counter<long> MyCounter = MyMeter.CreateCounter<long>("MyCounter");

using var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(MyMeter.Name)
    .AddConsoleExporter()
    .Build();

MyCounter.Add(1, new("name", "apple"), new("color", "red"));
MyCounter.Add(2, new("name", "lemon"), new("color", "yellow"));
MyCounter.Add(1, new("name", "lemon"), new("color", "yellow"));
MyCounter.Add(2, new("name", "apple"), new("color", "green"));
MyCounter.Add(5, new("name", "apple"), new("color", "red"));
MyCounter.Add(4, new("name", "lemon"), new("color", "yellow"));

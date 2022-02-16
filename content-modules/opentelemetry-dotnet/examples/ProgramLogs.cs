/*
LogRecord.TraceId:            00000000000000000000000000000000
LogRecord.SpanId:             0000000000000000
LogRecord.Timestamp:          2020-11-13T23:50:33.5764463Z
LogRecord.EventId:            0
LogRecord.CategoryName:       Program
LogRecord.LogLevel:           Information
LogRecord.TraceFlags:         None
LogRecord.State:              Hello from tomato 2.99.

*/

using Microsoft.Extensions.Logging;
using OpenTelemetry.Logs;

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(options => options
        .AddConsoleExporter());
});

var logger = loggerFactory.CreateLogger<Program>();
logger.LogInformation("Hello from {name} {price}.", "tomato", 2.99);

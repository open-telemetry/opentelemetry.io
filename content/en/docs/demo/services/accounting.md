---
title: Accounting Service
linkTitle: Accounting
aliases: [accountingservice]
---

This service calculates the total amount of sold products. This calculation is
currently mocked and received orders are printed out. Once a record is retrieved
from Kafka, it is saved to the database (PostgreSQL).

[Accounting Service](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## Auto-instrumentation

This service relies on the OpenTelemetry .NET Automatic Instrumentation to
automatically instrument libraries such as Kafka, and to configure the
OpenTelemetry SDK. The instrumentation is added via Nuget package
[OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation)
and activated using environment variables that are sourced from `instrument.sh`.
Using this installation approach also guarantees that all instrumentation
dependencies are properly aligned with the application.

## Publishing

The Docker build passes a Linux runtime identifier to `dotnet publish` to
include the native instrumentation components for the target architecture.

```sh
dotnet publish "./Accounting.csproj" -r linux-$TARGETARCH -c $BUILD_CONFIGURATION --no-restore -o /app/publish /p:UseAppHost=false
```

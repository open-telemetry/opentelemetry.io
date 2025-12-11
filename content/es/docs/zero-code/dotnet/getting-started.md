---
title: Primeros pasos
description: ¡Consigue telemetría para tu aplicación en menos de 5 minutos!
weight: 5
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
cSpell:ignore: ASPNETCORE rolldice
---

Esta página te mostrará cómo empezar a utilizar la instrumentación automática de
OpenTelemetry .NET.

Si estás buscando una forma de instrumentar manualmente tu aplicación, consulta
[esta guía](/docs/languages/dotnet/getting-started).

Aprenderás cómo puedes instrumentar automáticamente una aplicación .NET
sencilla, de tal manera que se emitan [trazas][], [métricas][] y [logs][] a la
consola.

## Requisitos previos

Asegúrate de tener lo siguiente instalado localmente:

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

## Ejemplo de aplicación

El siguiente ejemplo utiliza una aplicación básica
[API mínima con ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api).
Si no utilizas ASP.NET Core, no te preocupes, puedes seguir utilizando la
instrumentación automática de OpenTelemetry .NET.

Para ver ejemplos más detallados, consulta
[ejemplos](/docs/languages/dotnet/examples/).

### Crea e inicia un servidor HTTP

Para empezar, configura un entorno en un nuevo directorio llamado
«dotnet-simple». Dentro de ese directorio, ejecuta el siguiente comando:

```sh
dotnet new web
```

En el mismo directorio, sustituye el contenido de `Program.cs` por el siguiente
código:

```csharp
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var logger = app.Logger;

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

string HandleRollDice(string? player)
{
    var result = RollDice();

    if (string.IsNullOrEmpty(player))
    {
        logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
    }
    else
    {
        logger.LogInformation("{player} is rolling the dice: {result}", player, result);
    }

    return result.ToString(CultureInfo.InvariantCulture);
}

app.MapGet("/rolldice/{player?}", HandleRollDice);

app.Run();
```

En el subdirectorio «Properties», sustituye el contenido de
«launchSettings.json» por lo siguiente:

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:8080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

Compila y ejecuta la aplicación con el siguiente comando, luego abre
<http://localhost:8080/rolldice> en tu navegador web para asegurarte de que
funciona.

```sh
dotnet build
dotnet run
```

## Instrumentación

A continuación, utilizarás
[la instrumentación automática de OpenTelemetry .NET](../) para instrumentar la
aplicación en el momento del lanzamiento. Aunque puedes [Configurar la
instrumentación automática de .NET][] de varias maneras, los pasos que se
indican a continuación utilizan scripts de Unix-shell o PowerShell.

> **Nota**: Los comandos de PowerShell requieren privilegios elevados (de
> administrador).

1. Descarga los scripts de instalación desde [Releases][] del repositorio
   `opentelemetry-dotnet-instrumentation`:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
   $download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
   Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Ejecuta el siguiente script para descargar la instrumentación automática para
   tu entorno de desarrollo:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   ./otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   Import-Module $download_path
   Install-OpenTelemetryCore
   ```

   {{% /tab %}} {{< /tabpane >}}

3. Establece y exporta las variables que especifican un [exportador de
   consola][], luego ejecuta el script que configura otras variables de entorno
   necesarias utilizando una notación adecuada para tu entorno de
   shell/terminal. A continuación, ilustramos una notación para shells tipo bash
   y PowerShell:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   export OTEL_TRACES_EXPORTER=console \
     OTEL_METRICS_EXPORTER=console \
     OTEL_LOGS_EXPORTER=console
     OTEL_SERVICE_NAME=RollDiceService
   . $HOME/.otel-dotnet-auto/instrument.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $env:OTEL_TRACES_EXPORTER="console"
   $env:OTEL_METRICS_EXPORTER="console"
   $env:OTEL_LOGS_EXPORTER="console"
   Register-OpenTelemetryForCurrentSession -OTelServiceName "RollDiceService"
   ```

   {{% /tab %}} {{< /tabpane >}}

4. Ejecuta tu **aplicación** una vez más:

   ```sh
   dotnet run
   ```

   Ten en cuenta el resultado de «dotnet run».

5. Desde otra terminal, envía una solicitud utilizando `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

6. Después de unos 30 segundos, detén el proceso del servidor.

En este punto, deberías ver el trazo y el log de salida del servidor y del
cliente que se parece a esto (la salida se ha ajustado a la línea para facilitar
la lectura):

<details>
<summary>Trazas y Logs</summary>

```log
LogRecord.Timestamp:               2023-08-14T06:44:53.9279186Z
LogRecord.TraceId:                 3961d22b5f90bf7662ad4933318743fe
LogRecord.SpanId:                  93d5fcea422ff0ac
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            simple-dotnet
LogRecord.LogLevel:                Information
LogRecord.StateValues (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: simple-dotnet
telemetry.auto.version: 0.7.0
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.4.0.802

info: simple-dotnet[0]
      Anonymous player is rolling the dice: 1
Activity.TraceId:            3961d22b5f90bf7662ad4933318743fe
Activity.SpanId:             93d5fcea422ff0ac
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-08-14T06:44:53.9278162Z
Activity.Duration:           00:00:00.0049754
Activity.Tags:
    net.host.name: localhost
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://localhost:8080/rolldice
    http.flavor: 1.1
    http.user_agent: curl/8.0.1
    http.status_code: 200
Resource associated with Activity:
    service.name: simple-dotnet
    telemetry.auto.version: 0.7.0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.4.0.802
```

</details>

Además, al detener el servidor, deberías ver una salida de todas las métricas
recogidas (se muestra un extracto de muestra):

<details>
<summary>Métricas</summary>

```log
Export process.runtime.dotnet.gc.collections.count, Number of garbage collections that have occurred since process start., Meter: OpenTelemetry.Instrumentation.Runtime/1.1.0.2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen2 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen1 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen0 LongSum
Value: 6

...

Export http.client.duration, Measures the duration of outbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.Http/1.0.0.0
(2023-08-14T06:12:06.2661140Z, 2023-08-14T06:12:23.7750388Z] http.flavor: 1.1 http.method: POST http.scheme: https http.status_code: 200 net.peer.name: dc.services.visualstudio.com Histogram
Value: Sum: 1330.4766000000002 Count: 5 Min: 50.0333 Max: 465.7936
(-Infinity,0]:0
(0,5]:0
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:2
(75,100]:0
(100,250]:0
(250,500]:3
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

</details>

## Pasos siguientes

Para más información:

- Para configurar exportadores, muestreos, recursos y más, consulta
  [Configuración y ajustes](../configuration)
- Consulta la lista de [instrumentaciones disponibles](../instrumentations)
- Si deseas combinar la instrumentación automática y manual, aprende cómo
  [crear trazas y métricas personalizadas](../custom).
- Si tienes algún problema, consulta la
  [Guía de resolución de problemas](../troubleshooting).

[trazas]: /docs/concepts/signals/traces/
[métricas]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[Configurar la instrumentación automática de .NET]: ../configuration
[exportador de consola]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#internal-logs
[releases]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases

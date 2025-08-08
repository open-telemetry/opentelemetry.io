---
title: Démarrage rapide
description:
  Obtenez la télémétrie pour votre application en moins de 5 minutes !
weight: 5
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: ASPNETCORE rolldice
---

Cette page vous montrera comment démarrer avec l'instrumentation Zero-code
OpenTelemetry pour .NET.

Si vous cherchez un moyen d'instrumenter manuellement votre application,
consultez [ce guide](/docs/languages/dotnet/getting-started).

Vous apprendrez comment instrumenter automatiquement une application .NET
simple, de manière à ce que les [traces][], [métriques][] et [logs][] soient
émis vers la console.

## Prérequis {#prerequisites}

Assurez-vous d'avoir installé localement :

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

## Exemple d'application {#example-application}

L'exemple suivant utilise une application basique
[API minimale avec ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api).
Si vous n'utilisez pas ASP.NET Core, vous pouvez toujours utiliser
l'instrumentation Zero-code OpenTelemetry pour .NET.

Pour des exemples plus élaborés, consultez la page
[exemples](/docs/languages/dotnet/examples/).

### Créer et lancer un serveur HTTP {#create-and-launch-an-http-server}

Pour commencer, configurez un environnement dans un nouveau répertoire appelé
`dotnet-simple`. Dans ce répertoire, exécutez la commande suivante :

```sh
dotnet new web
```

Dans le même répertoire, remplacez le contenu de `Program.cs` par le code
suivant :

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

Dans le sous-répertoire `Properties`, remplacez le contenu de
`launchSettings.json` par ce qui suit :

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

Compilez et exécutez l'application avec la commande suivante, puis ouvrez
<http://localhost:8080/rolldice> dans votre navigateur web pour vous assurer
qu'elle fonctionne.

```sh
dotnet build
dotnet run
```

## Instrumentation {#instrumentation}

Ensuite, vous utiliserez
l'[instrumentation Zero-code OpenTelemetry pour .NET](../) pour instrumenter
l'application au moment du lancement. Bien que vous puissiez [configurer
l'instrumentation Zero-code .NET][] de plusieurs façons, les étapes ci-dessous
utilisent des scripts Unix-shell ou PowerShell.

> **Note** : Les commandes PowerShell nécessitent des privilèges élevés
> (administrateur).

1. Téléchargez les scripts d'installation depuis les [Releases][] du dépôt
   `opentelemetry-dotnet-instrumentation` :

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

2. Exécutez le script suivant pour télécharger l'instrumentation automatique
   pour votre environnement de développement :

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

3. Définissez et exportez les variables qui spécifient un [exportateur
   console][], puis exécutez le script configurant les autres variables
   d'environnement nécessaires en utilisant une notation adaptée à votre
   environnement shell/terminal &mdash; nous illustrons une notation pour les
   shells de type bash et PowerShell :

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

4. Exécutez votre **application** une fois de plus :

   ```sh
   dotnet run
   ```

   Notez la sortie de `dotnet run`.

5. Depuis un _autre_ terminal, envoyez une requête en utilisant `curl` :

   ```sh
   curl localhost:8080/rolldice
   ```

6. Après environ 30 secondes, arrêtez le processus serveur.

À ce stade, vous devriez voir les traces et logs du serveur et du client en
console et ils ressemblent à quelque chose comme ceci (ces logs sont tronqués
pour la lisibilité) :

<details>
<summary>Traces et Logs</summary>

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

Également lors de l'arrêt du serveur, vous devriez voir toutes les métriques
collectées en console (exemple) :

<details>
<summary>Métriques</summary>

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

## Et ensuite ? {#what-next}

Pour plus d'informations :

- Pour configurer les exportateurs, échantillonneurs, ressources et plus,
  consultez [Configuration et paramètres](../configuration)
- Consultez la liste des [instrumentations disponibles](../instrumentations)
- Si vous voulez combiner instrumentation automatique et manuelle, apprenez
  comment vous [pouvez créer des traces et métriques personnalisées](../custom)
- Si vous rencontrez des problèmes, consultez le
  [Guide de dépannage](../troubleshooting)

[traces]: /docs/concepts/signals/traces/
[métriques]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[configurer l'instrumentation Zero-code .NET]: ../configuration
[exportateur console]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#internal-logs
[releases]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases

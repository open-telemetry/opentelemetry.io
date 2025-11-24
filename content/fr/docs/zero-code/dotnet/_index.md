---
title: Instrumentation Zero-code .NET
description:
  Envoyer des traces et métriques depuis des applications et services .NET.
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649 # patched
drifted_from_default: true
cSpell:ignore: coreutils HKLM iisreset myapp
---

Utilisez l'instrumentation Zero-code pour .NET pour envoyer des traces et
métriques depuis des applications et services .NET vers des solutions
d'observabilité sans avoir à modifier leur code source.

Pour apprendre comment instrumenter votre code, lisez
[Instrumentation manuelle](/docs/languages/dotnet/instrumentation).

## Compatibilité {#compatibility}

L'instrumentation Zero-code pour .NET devrait fonctionner avec tous les systèmes
d'exploitation et versions de
[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)
officiellement supportés.

La version minimale supportée du
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) est
`4.6.2`.

Les architectures de processeur supportées sont :

- x86
- AMD64 (x86-64)
- ARM64 ([Expérimental](/docs/specs/otel/versioning-and-stability))

{{% alert title="Note" %}} La version ARM64 ne supporte pas les images basées
sur CentOS. {{% /alert %}}

Les tests d'intégration continue s'exécutent sur les systèmes d'exploitation
suivants :

- [Alpine x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Alpine ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Debian x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian.dockerfile)
- [Debian ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian-arm64.dockerfile)
- [CentOS Stream 9 x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-stream9.dockerfile)
- [macOS Ventura 13 x64](https://github.com/actions/runner-images/blob/main/images/macos/macos-13-Readme.md)
- [Microsoft Windows Server 2022 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)
- [Ubuntu 20.04 LTS x64](https://github.com/actions/runner-images/blob/e82adb8a25d915d5a4598ced53814bdacac218cc/images/ubuntu/Ubuntu2004-Readme.md)
- Ubuntu 22.04 LTS ARM64

## Configuration {#setup}

Pour instrumenter automatiquement une application .NET, téléchargez et exécutez
le script d'installation pour votre système d'exploitation.

### Linux et macOS {#linux-and-macos}

Téléchargez et exécutez le script `.sh` :

```shell
# Télécharger le script bash {#download-the-bash-script}
curl -sSfL https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh -O

# Installer les fichiers principaux {#install-core-files} {#install-core-files} {#install-core-files}
sh ./otel-dotnet-auto-install.sh

# Autoriser l'exécution du script d'instrumentation {#enable-execution-for-the-instrumentation-script}
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# Configurer l'instrumentation pour la session shell actuelle {#setup-the-instrumentation-for-the-current-shell-session}
. $HOME/.otel-dotnet-auto/instrument.sh

# Exécuter votre application avec instrumentation {#run-your-application-with-instrumentation} {#run-your-application-with-instrumentation}
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0 ./MyNetApp
```

{{% alert title="Note" color="warning" %}} Sur macOS
[`coreutils`](https://formulae.brew.sh/formula/coreutils) est requis. Si vous
avez installé [homebrew](https://brew.sh/), vous pouvez simplement l'obtenir en
exécutant:

```shell
brew install coreutils
```

{{% /alert %}}

### Windows (PowerShell) {#windows-powershell}

Sur Windows, utilisez le module PowerShell en tant qu'Administrateur.

{{% alert title="Note de version" color="warning" %}}

Windows
[PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
(v5.1) est requis. Les autres
[versions](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
incluant PowerShell Core (v6.0+) ne sont pas supportées pour le moment.

{{% /alert %}}

```powershell
# PowerShell 5.1 est requis
#Requires -PSEdition Desktop

# Télécharger le module
$module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
$download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

# Importer le module pour utiliser ses fonctions
Import-Module $download_path

# Installer les fichiers principaux (méthode en ligne vs hors ligne)
Install-OpenTelemetryCore
Install-OpenTelemetryCore -LocalPath "C:\Path\To\OpenTelemetry.zip"

# Configurer l'instrumentation pour la session PowerShell actuelle
Register-OpenTelemetryForCurrentSession -OTelServiceName "MyServiceDisplayName"

# Exécuter votre application avec instrumentation
.\MyNetApp.exe

# Vous pouvez obtenir des informations d'utilisation en appelant les commandes suivantes

# Lister toutes les commandes disponibles
Get-Command -Module OpenTelemetry.DotNet.Auto

# Obtenir les informations d'utilisation d'une commande
Get-Help Install-OpenTelemetryCore -Detailed
```

## Instrumenter un Service Windows exécutant une application .NET {#instrument-a-windows-service-running-a-net-application}

Utilisez le module PowerShell `OpenTelemetry.DotNet.Auto.psm1` pour configurer
l'instrumentation automatique pour un Service Windows :

```powershell
# Importer le module
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Installer les fichiers principaux
Install-OpenTelemetryCore

# Configurer l'instrumentation de votre Service Windows
Register-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName" -OTelServiceName "MyServiceDisplayName"
```

{{% alert title="Note" color="warning" %}}
`Register-OpenTelemetryForWindowsService` effectue un redémarrage du service.
{{% /alert %}}

### Configuration pour Service Windows {#configuration-for-windows-service}

{{% alert title="Note" color="warning" %}} N'oubliez pas de redémarrer le
Service Windows après avoir effectué des changements. Vous pouvez le faire en
exécutant `Restart-Service -Name $WindowsServiceName -Force` dans PowerShell.
{{% /alert %}}

Pour les applications .NET Framework, vous pouvez configurer
[les paramètres `OTEL_` les plus courants](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(comme `OTEL_RESOURCE_ATTRIBUTES`) via `appSettings` dans `App.config`.

L'alternative est de définir des variables d'environnement pour le Service
Windows dans le Registre Windows.

La clé de registre d'un Service Windows donné (nommé `$svcName`) est située sous
:

```powershell
HKLM\SYSTEM\CurrentControlSet\Services\$svcName
```

Les variables d'environnement sont définies dans un `REG_MULTI_SZ` (valeur de
registre multiligne) appelé `Environment` dans le format suivant :

```env
Var1=Value1
Var2=Value2
```

## Instrumenter une application ASP.NET déployée sur IIS {#instrument-an-aspnet-application-deployed-on-iis}

{{% alert title="Note" color="warning" %}} Les instructions suivantes
s'appliquent aux applications .NET Framework. {{% /alert %}}

Utilisez le module PowerShell `OpenTelemetry.DotNet.Auto.psm1` pour configurer
l'instrumentation automatique pour IIS :

```powershell
# Importer le module
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Installer les fichiers principaux
Install-OpenTelemetryCore

# Configurer l'instrumentation IIS
Register-OpenTelemetryForIIS
```

{{% alert title="Note" color="warning" %}} `Register-OpenTelemetryForIIS`
redémarrera IIS. {{% /alert %}}

### Configuration pour les applications ASP.NET {#configuration-for-aspnet-applications}

{{% alert title="Note" color="warning" %}} Les instructions suivantes
s'appliquent aux applications .NET Framework. {{% /alert %}}

Pour les applications ASP.NET, vous pouvez configurer
[les paramètres `OTEL_` les plus courants](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(comme `OTEL_SERVICE_NAME`) via `appSettings` dans `Web.config`.

Si un nom de service n'est pas explicitement configuré, un nom sera généré pour
vous. Si l'application est hébergée sur IIS dans .NET Framework, cela utilisera
`SiteName\VirtualDirectoryPath` ex : `MySite\MyApp`

Pour les applications ASP.NET Core, vous pouvez utiliser les éléments
[`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables)
à l'intérieur du bloc `<aspNetCore>` de votre fichier `Web.config` pour définir
la configuration via des variables d'environnement.

{{% alert title="Note" color="warning" %}} N'oubliez pas de redémarrer IIS après
avoir effectué des changements de configuration. Vous pouvez le faire en
exécutant `iisreset.exe`. {{% /alert %}}

### Configuration avancée {#advanced-configuration}

Vous pouvez ajouter les
[`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/)
dans `applicationHost.config` pour définir des variables d'environnement pour
des pools d'applications donnés.

Envisagez de définir des variables d'environnement communes pour toutes les
applications déployées sur IIS en définissant les variables d'environnement pour
les Services Windows `W3SVC` et `WAS`.

{{% alert title="Note" color="warning" %}} Pour les versions d'IIS antérieures à
10.0, vous pouvez envisager de créer un utilisateur distinct, définir ses
variables d'environnement et l'utiliser comme utilisateur du pool
d'applications. {{% /alert %}}

## Paquet NuGet {#nuget-package}

Vous pouvez instrumenter les applications
[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
en utilisant les paquets NuGet. Consulter [Paquets NuGet](./nuget-packages) pour
plus d'informations.

## Instrumenter un conteneur {#instrument-a-container}

Pour un exemple d'instrumentation de conteneur Docker, consultez
[cet exemple](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo)
sur GitHub.

Vous pouvez également utiliser l'
[Opérateur OpenTelemetry pour Kubernetes](/docs/platforms/kubernetes/operator/).

## Configuration de l'agent {#configuring-the-agent}

Pour voir la gamme complète d'options de configuration, consultez
[Configuration et paramètres](./configuration).

## Corrélation log vers trace {#log-to-trace-correlation}

{{% alert title="Note" color="warning" %}} La corrélation automatique log vers
trace fournie par l'instrumentation Zero-code pour .NET fonctionne actuellement
seulement pour les applications .NET utilisant `Microsoft.Extensions.Logging`.
Voir
[#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310)
pour plus de détails. {{% /alert %}}

Le SDK .NET OpenTelemetry corrèle automatiquement les journaux aux données de
trace. Quand les journaux sont émis dans le contexte d'une trace active, les
[champs](/docs/specs/otel/logs/data-model#trace-context-fields) `TraceId`,
`SpanId`, `TraceState`, qui forment le contexte de la trace, sont
automatiquement remplis.

Voici des journaux produits par une application console servant d'exemple :

```json
"logRecords": [
    {
        "timeUnixNano": "1679392614538226700",
        "severityNumber": 9,
        "severityText": "Information",
        "body": {
            "stringValue": "Success! Today is: {Date:MMMM dd, yyyy}"
        },
        "flags": 1,
        "traceId": "21df288eada1ce4ace6c40f39a6d7ce1",
        "spanId": "a80119e5a05fed5a"
    }
]
```

Pour plus d'informations, consultez :

- [SDK .NET OpenTelemetry](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/correlation)
- [Spécification OpenTelemetry](/docs/specs/otel/logs/data-model#trace-context-fields)

## Bibliothèques et frameworks supportés {#supported-libraries-and-frameworks}

L'instrumentation Zero-code pour .NET supporte une grande variété de
bibliothèques. Pour une liste complète, voir
[Instrumentations](./instrumentations).

## Dépannage {#troubleshooting}

Pour voir la télémétrie de votre application directement sur la sortie standard,
ajoutez `console` à la valeur des variables d'environnement suivantes avant de
lancer votre application :

- `OTEL_TRACES_EXPORTER`
- `OTEL_METRICS_EXPORTER`
- `OTEL_LOGS_EXPORTER`

Pour les étapes générales de dépannage et les solutions à des problèmes
spécifiques, consultez la page [Dépannage](./troubleshooting).

## Étapes suivantes {#next-steps}

Après avoir configuré l'instrumentation automatique pour votre application ou
votre service, vous pourriez souhaiter
[envoyer des traces et métriques personnalisées](./custom) ou ajouter une
[instrumentation manuelle](/docs/languages/dotnet/instrumentation) pour
collecter des données de télémétrie personnalisées.

## Désinstallation {#uninstall}

### Linux et macOS {#uninstall-unix}

Sur Linux et macOS, les étapes d'installation n'affectent que la session shell
actuelle donc aucune désinstallation explicite n'est requise.

### Windows (PowerShell) {#uninstall-windows}

Sur Windows, utilisez le module PowerShell en tant qu'Administrateur.

{{% alert title="Note de version" color="warning" %}}

Windows
[PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
(v5.1) est requis. Les autres
[versions](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
incluant PowerShell Core (v6.0+) ne sont pas supportées pour le moment.

{{% /alert %}}

```powershell
# PowerShell 5.1 est requis
#Requires -PSEdition Desktop

# Importer le module précédemment installé
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Si IIS était précédemment enregistré, le désenregistrer
Unregister-OpenTelemetryForIIS

# Si des services Windows étaient précédemment enregistrés, les désenregistrer
Unregister-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName"

# Finalement, désinstaller l'instrumentation OpenTelemetry
Uninstall-OpenTelemetryCore
```

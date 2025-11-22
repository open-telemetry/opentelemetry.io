---
title: Dépannage des problèmes d'instrumentation Zero-code .NET
linkTitle: Dépannage
weight: 50
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: corehost netfx pjanotti TRACEFILE
---

## Étapes générales {#general-steps}

Si vous rencontrez un problème avec l'instrumentation Zero-code OpenTelemetry
pour .NET, il y a des étapes qui peuvent vous aider à comprendre le problème.

### Activer la journalisation détaillée {#enable-detailed-logging}

Les journaux de debug détaillés peuvent vous aider à dépanner les problèmes
d'instrumentation, et peuvent être joints aux Issues du projet pour faciliter
l'investigation.

Pour obtenir les journaux détaillés de l'instrumentation Zero-code OpenTelemetry
pour .NET, définissez la variable d'environnement
[`OTEL_LOG_LEVEL`](../configuration#internal-logs) à `debug` avant que le
processus instrumenté ne démarre.

Par défaut, la bibliothèque écrit les fichiers de log dans des
[emplacements](../configuration#internal-logs) prédéfinis. Si nécessaire,
changez l'emplacement par défaut en mettant à jour la variable d'environnement
`OTEL_DOTNET_AUTO_LOG_DIRECTORY`.

Après avoir obtenu les logs, supprimez la variable d'environnement
`OTEL_LOG_LEVEL`, ou définissez-la à un niveau moins verbeux pour éviter une
surcharge inutile.

### Activer les traces pour le serveur hôte {#enable-host-tracing}

Les
[traces du serveur hôte](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing)
peuvent être utilisées pour rassembler des informations nécessaires pour
investiguer les divers problèmes, comme les assemblies non trouvés. Définissez
les variables d'environnement suivantes :

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

Puis redémarrez l'application pour collecter les logs.

## Problèmes courants {#common-issues}

### Aucune télémétrie n'est produite {#no-telemetry-is-produced}

Il n'y a aucune télémétrie générée. Il n'y a aucun log dans
[l'emplacement des journaux internes](../configuration#internal-logs) de
l'instrumentation Zero-code OpenTelemetry pour .NET.

Il peut arriver que le Profiler .NET ne puisse pas s'attacher et donc aucun log
ne serait émis.

La raison la plus courante est que l'application instrumentée n'a pas les
permissions pour charger les assemblies de l'instrumentation Zero-code
OpenTelemetry pour .NET.

### Impossible d'installer le paquet 'OpenTelemetry.AutoInstrumentation.Runtime.Native' {#could-not-install-package-opentelemetryautoinstrumentationruntimenative}

Lors de l'ajout des paquets NuGet à votre projet, vous obtenez un message
d'erreur similaire à :

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.6.0'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

Les paquets NuGet ne supportent pas les projets `csproj` dans l'ancien format.
Vous pouvez soit déployer l' instrumentation automatique sur la machine au lieu
d'utiliser les paquets NuGet, soit migrer votre projet vers le format SDK.

### Problèmes de performance {#performance-issues}

Si une utilisation élevée du CPU se produit, assurez-vous que vous n'avez pas
activé l'instrumentation automatique partout, en définissant les variables
d'environnement au niveau système ou utilisateur par exemple.

Si l'utilisation au niveau système ou utilisateur est intentionnelle, utilisez
les variables d'environnement
[`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](../configuration#global-settings) pour
exclure certaines applications de l'instrumentation automatique.

### L'outil CLI `dotnet` plante {#dotnet-cli-tool-is-crashing}

Vous obtenez des messages d'erreur similaires à celui ci-dessous lors de
l'exécution d'une application, par exemple avec `dotnet run` :

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

Avec la version `v0.6.0-beta.1` et antérieures, il y avait des problèmes lors de
l'instrumentation de l'outil CLI `dotnet`.

Par conséquent, si vous utilisez une de ces versions, nous conseillons
d'exécuter `dotnet build` avant d'instrumenter la session de terminal ou de
l'appeler dans une session de terminal séparée.

Voir
[#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
pour plus d'informations.

### Conflits de versions d'assemblies {#assembly-version-conflicts}

Vous voyez un message d'erreur similaire à celui ci-dessous :

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

Les paquets NuGet OpenTelemetry .NET et ses dépendances sont déployés avec
l'instrumentation Zero-code OpenTelemetry pour .NET.

Pour gérer les conflits de versions de dépendances, mettez à jour les références
de projet de l'application instrumentée pour utiliser les mêmes versions que
l'instrumentation Zero-code OpenTelemetry pour .NET.

Un moyen simple de s'assurer qu'aucun conflit de ce type ne se produise est
d'ajouter le paquet `OpenTelemetry.AutoInstrumentation` à votre application.
Pour des instructions sur comment l'ajouter à votre application, voir
[Utilisation des paquets NuGet OpenTelemetry.AutoInstrumentation](../nuget-packages).

Vous pouvez également ajouter seulement les paquets en conflit à votre projet.
Les dépendances suivantes sont utilisées par l'instrumentation Zero-code
OpenTelemetry pour .NET :

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)
- [OpenTelemetry.AutoInstrumentation.AdditionalDeps](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Build.props)

Leurs versions se trouvent dans les emplacements suivants :

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props)

Par défaut, les références d'assemblies pour les applications .NET Framework
sont redirigées pendant l'exécution vers les versions utilisées par
l'instrumentation automatique. Ce comportement peut être contrôlé via le
paramètre [`OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`](../configuration).

Si l'application livre déjà une redirection de liaison pour les assemblies
utilisés par l'instrumentation automatique, cette redirection automatique peut
échouer, voir
[#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833).
Vérifiez si une redirection de liaison existante empêche la redirection vers les
versions listées dans
[netfx_assembly_redirection.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.Native/netfx_assembly_redirection.h).

Pour que la redirection automatique ci-dessus fonctionne, il y a deux scénarios
spécifiques qui nécessitent que les assemblies utilisés pour instrumenter les
applications .NET Framework, ceux sous le dossier `netfx` du répertoire
d'installation, soient également installés dans le Global Assembly Cache (GAC) :

1. [**Instrumentation de type monkey patch**](https://en.wikipedia.org/wiki/Monkey_patch)
   d'assemblies chargées comme domain-neutral.
2. Redirection d'assemblies pour les applications à nommage fort si
   l'application livre également des versions différentes de certains assemblies
   également livrés dans le dossier `netfx`.

Si vous avez des problèmes dans un des scénarios ci-dessus, exécutez à nouveau
la commande `Install-OpenTelemetryCore` du module d'installation PowerShell pour
vous assurer que les installations GAC requises sont mises à jour.

Pour plus d'informations sur l'utilisation du GAC par l'instrumentation
Zero-code, voir
[le commentaire de pjanotti](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814).

Voir
[#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269)
et
[#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296)
pour plus d'informations.

### Assembly dans AdditionalDeps non trouvé {#assembly-in-additionaldeps-was-not-found}

#### Symptômes {#symptoms}

Vous obtenez un message d'erreur similaire au suivant :

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found
```

Cela peut être lié aux problèmes suivants :

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

## Autres problèmes {#other-issues}

Si vous rencontrez un problème non listé sur cette page, voir
[Étapes générales](#general-steps) pour collecter des informations de diagnostic
supplémentaires. Cela peut aider à faciliter le dépannage.

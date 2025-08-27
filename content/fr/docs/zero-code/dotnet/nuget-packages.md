---
title: Utilisation des paquets NuGet OpenTelemetry.AutoInstrumentation
linkTitle: Paquets NuGet
weight: 40
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: buildtasks
---

Utilisez les paquets NuGet dans les scénarios suivants :

1. Simplifier le déploiement. Par exemple, un conteneur exécutant une seule
   application.
1. Supporter l'instrumentation d'applications autonomes
   ([`--self-contained`](https://learn.microsoft.com/fr-fr/dotnet/core/deploying/#publish-self-contained)).
1. Faciliter l'expérimentation des développeurs avec l'instrumentation
   automatique via les paquets NuGet.
1. Résoudre les conflits de versions entre les dépendances utilisées par
   l'application et l'instrumentation Zero-code.

## Limitations {#limitations}

Bien que les paquets NuGet soient un moyen pratique de déployer
l'instrumentation Zero-code, ils ne peuvent pas être utilisés dans tous les cas.
Les raisons les plus courantes de ne pas utiliser les paquets NuGet incluent les
suivantes :

1. Vous ne pouvez pas ajouter le paquet au projet d'application. Par exemple, l'
   application provient d'un tiers qui ne peut pas ajouter le paquet.
1. Réduire l'utilisation du disque, ou la taille d'une machine virtuelle, quand
   plusieurs applications à instrumenter sont installées sur une seule machine.
   Dans ce cas, vous pouvez utiliser un seul déploiement pour toutes les
   applications .NET s'exécutant sur la machine.
1. Une application héritée qui ne peut pas être migrée vers le
   [format de projet de type SDK](https://learn.microsoft.com/fr-fr/nuget/resources/check-project-format#check-the-project-format).

## Utilisation des paquets NuGet {#using-the-nuget-packages}

Pour instrumenter automatiquement votre application avec OpenTelemetry .NET,
ajoutez le paquet `OpenTelemetry.AutoInstrumentation` à votre projet :

```terminal
dotnet add [<PROJECT>] package OpenTelemetry.AutoInstrumentation
```

Si l'application référence des paquets qui peuvent être instrumentés, mais
nécessitent d'autres paquets pour que l'instrumentation fonctionne, la
compilation échouera et vous invitera soit à ajouter la bibliothèque
d'instrumentation manquante, soit à ignorer l' instrumentation du paquet
correspondant :

```terminal
~packages/opentelemetry.autoinstrumentation.buildtasks/1.6.0/build/OpenTelemetry.AutoInstrumentation.BuildTasks.targets(29,5): error : OpenTelemetry.AutoInstrumentation: add a reference to the instrumentation package 'MongoDB.Driver.Core.Extensions.DiagnosticSources' version 1.4.0 or add 'MongoDB.Driver.Core' to the property 'SkippedInstrumentations' to suppress this error.
```

Pour résoudre l'erreur, ajoutez la bibliothèque d'instrumentation recommandée,
ou ignorez l'instrumentation du paquet listé en l'ajoutant à la propriété
`SkippedInstrumentation`, exemple :

```csproj
<PropertyGroup>
   <SkippedInstrumentations>MongoDB.Driver.Core;StackExchange.Redis</SkippedInstrumentations>
</PropertyGroup>
```

La même propriété peut également être spécifiée directement via la CLI, notez
que le séparateur, `;`, doit être correctement échappé comme '%3B' :

```powershell
dotnet build -p:SkippedInstrumentations=StackExchange.Redis%3BMongoDB.Driver.Core
```

Pour distribuer les composants natifs d'exécution appropriés avec votre
application .NET, spécifiez un
[Identificateur d'Exécution (RID)](https://learn.microsoft.com/fr-fr/dotnet/core/rid-catalog)
pour compiler l'application en utilisant `dotnet build` ou `dotnet publish`.
Cela peut nécessiter de choisir entre distribuer une application
[_self-contained_ ou _framework-dependent_](https://learn.microsoft.com/fr-fr/dotnet/core/deploying/).
Les deux types sont compatibles avec l'instrumentation Zero-code.

Utilisez le script dans le dossier de sortie de la compilation pour lancer
l'application avec l'instrumentation automatique activée.

- Sur Windows, utilisez `instrument.cmd <application_executable>`
- Sur Linux ou Unix, utilisez `instrument.sh <application_executable>`

Si vous lancez l'application en utilisant la CLI `dotnet`, ajoutez `dotnet`
après le script.

- Sur Windows, utilisez `instrument.cmd dotnet <application>`
- Sur Linux et Unix, utilisez `instrument.sh dotnet <application>`

Le script transmet à l'application tous les paramètres de ligne de commande que
vous aurez défini.

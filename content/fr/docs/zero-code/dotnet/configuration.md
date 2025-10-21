---
title: Configuration et paramètres
linkTitle: Configuration
aliases: [/docs/languages/net/automatic/config]
weight: 20
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
# prettier-ignore
cSpell:ignore: AZUREAPPSERVICE CLSID CORECLR dylib NETFX OPERATINGSYSTEM PROCESSRUNTIME UNHANDLEDEXCEPTION
---

## Méthodes de configuration {#configuration-methods}

Vous pouvez appliquer ou modifier les paramètres de configuration de la manière
suivante, les variables d'environnement ayant la priorité sur le fichier
`App.config` ou `Web.config` :

1. Variables d'environnement

   Les variables d'environnement sont le moyen principal de configurer les
   paramètres.

2. Fichier `App.config` ou `Web.config`

   Pour une application s'exécutant sur .NET Framework, vous pouvez utiliser un
   fichier de configuration web (`web.config`) ou un fichier de configuration
   d'application (`app.config`) pour configurer les paramètres `OTEL_*`.

   ⚠️ Seuls les paramètres commençant par `OTEL_` peuvent être définis en
   utilisant `App.config` ou `Web.config`. Cependant, les paramètres suivants ne
   sont pas supportés :
   - `OTEL_DOTNET_AUTO_HOME`
   - `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`
   - `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_INSTRUMENTATIONS_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_{INSTRUMENTATION_ID}_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_LOG_DIRECTORY`
   - `OTEL_LOG_LEVEL`
   - `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`

   Exemple avec le paramètre `OTEL_SERVICE_NAME` :

   ```xml
   <configuration>
   <appSettings>
       <add key="OTEL_SERVICE_NAME" value="my-service-name" />
   </appSettings>
   </configuration>
   ```

3. Détection automatique du nom de service

   Si aucun nom de service n'est explicitement configuré, il sera généré pour
   vous. Cela peut être utile dans certaines circonstances.
   - Si l'application est hébergée sur IIS dans .NET Framework, ce sera
     `SiteName\VirtualPath` ex : `MySite\MyApp`
   - Si ce n'est pas le cas, le nom de l'
     [Assembly d'entrée](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.getentryassembly?view=net-7.0)
     de l'application sera utilisé.

Par défaut, nous recommandons d'utiliser les variables d'environnement pour la
configuration. Cependant, si un paramètre donné le supporte, alors :

- utilisez `Web.config` pour configurer une application ASP.NET (.NET
  Framework),
- utilisez `App.config` pour configurer un Service Windows (.NET Framework).

## Paramètres globaux {#global-settings}

| Variable d'environnement             | Description                                                                                                                                                                                                                                                          | Valeur par défaut | Statut                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_HOME`              | Emplacement d'installation.                                                                                                                                                                                                                                          |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` | Noms des fichiers exécutables que le profileur ne peut pas instrumenter. Supporte plusieurs valeurs séparées par des virgules, par exemple : `ReservedProcess.exe,powershell.exe`. Si non défini, le profileur s'attache à tous les processus par défaut. \[1\]\[2\] |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` | Active la possibilité de faire échouer le processus quand l'instrumentation automatique ne peut pas être exécutée. Il est conçu à des fins de débogage. Il ne devrait pas être utilisé en environnement de production. \[1\]                                         | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGGER`            | Destination des journaux de diagnostic AutoInstrumentation. (valeurs supportées : `none`,`file`,`console`)                                                                                                                                                           | `file`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOG_LEVEL`                     | Niveau de log du SDK. (valeurs supportées : `none`,`error`,`warn`,`info`,`debug`)                                                                                                                                                                                    | `info`            | [Stable](/docs/specs/otel/versioning-and-stability)       |

\[1\] Si `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` est défini à `true` alors les
processus exclus de l'instrumentation par `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`
échoueront au lieu de continuer silencieusement.

\[2\] Notez que les applications lancées via `dotnet MyApp.dll` ont le nom de
processus `dotnet` ou `dotnet.exe`.

## Ressources {#resources}

Une ressource est la représentation immuable de l'entité produisant la
télémétrie. Voir
[Conventions sémantiques des ressources](/docs/specs/semconv/resource/) pour
plus de détails.

### Attributs de ressource {#resource-attributes}

| Variable d'environnement   | Description                                                                                                                                                                                                         | Valeur par défaut                                                                                                                                  | Statut                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `OTEL_RESOURCE_ATTRIBUTES` | Paires clé-valeur à utiliser comme attributs de ressource. Voir [SDK de ressource](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable) pour plus de détails.                 | Voir [Conventions sémantiques des ressources](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value) pour les détails. | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SERVICE_NAME`        | Définit la valeur de l'attribut de ressource [`service.name`](/docs/specs/semconv/resource/#service). Si `service.name` est fourni dans `OTEL_RESOURCE_ATTRIBUTES`, la valeur de `OTEL_SERVICE_NAME` a la priorité. | Voir [Détection automatique du nom de service](#configuration-methods) sous la section Méthode de configuration.                                   | [Stable](/docs/specs/otel/versioning-and-stability) |

### Détecteurs de ressource {#resource-detectors}

| Variable d'environnement                         | Description                                                                                                                                                                                                          | Valeur par défaut | Statut                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`     | Active tous les détecteurs de ressource.                                                                                                                                                                             | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_{0}_RESOURCE_DETECTOR_ENABLED` | Modèle de configuration pour activer un détecteur de ressource spécifique, où `{0}` est l'ID en majuscules du détecteur de ressource que vous voulez activer. Remplace `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`. | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |

Les détecteurs de ressource suivants sont inclus et activés par défaut :

| ID                | Description                         | Documentation                                                                                                                                                                                                                                 | Statut                                                    |
| ----------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `AZUREAPPSERVICE` | Détecteur Azure App Service         | [Documentation du détecteur de ressource Azure](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Azure-1.0.0-beta.9/src/OpenTelemetry.Resources.Azure/README.md)                                                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `CONTAINER`       | Détecteur de conteneur              | [Documentation du détecteur de ressource Container](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Container-1.0.0-beta.9/src/OpenTelemetry.Resources.Container/README.md) **Non supporté sur .NET Framework** | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `HOST`            | Détecteur d'hôte                    | [Documentation du détecteur de ressource Host](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Host-0.1.0-beta.3/src/OpenTelemetry.Resources.Host/README.md)                                                    | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OPERATINGSYSTEM` | Détecteur de système d'exploitation | [Documentation du détecteur de ressource Operating System](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.OperatingSystem-0.1.0-alpha.4/src/OpenTelemetry.Resources.OperatingSystem/README.md)                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`         | Détecteur de processus              | [Documentation du détecteur de ressource Process](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Process-0.1.0-beta.3/src/OpenTelemetry.Resources.Process/README.md)                                           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESSRUNTIME`  | Détecteur de runtime de processus   | [Documentation du détecteur de ressource Process Runtime](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.ProcessRuntime-0.1.0-beta.2/src/OpenTelemetry.Resources.ProcessRuntime/README.md)                     | [Expérimental](/docs/specs/otel/versioning-and-stability) |

## Propagateurs {#propagators}

Les propagateurs permettent aux applications de partager le contexte. Voir
[la spécification OpenTelemetry](/docs/specs/otel/context/api-propagators) pour
plus de détails.

| Variable d'environnement | Description                                                                                                                                                                                                                                                                                                                   | Valeur par défaut      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `OTEL_PROPAGATORS`       | Liste séparée par des virgules de propagateurs. Options supportées : `tracecontext`, `baggage`, `b3multi`, `b3`. Voir [la spécification OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/sdk-environment-variables.md#general-sdk-configuration) pour plus de détails. | `tracecontext,baggage` |

## Échantillonneurs {#samplers}

Les échantillonneurs vous permettent de contrôler le bruit potentiel et la
surcharge introduits par l'instrumentation OpenTelemetry en sélectionnant
quelles traces vous voulez collecter et exporter. Voir
[la spécification OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
pour plus de détails.

| Variable d'environnement  | Description                                                     | Valeur par défaut       | Statut                                              |
| ------------------------- | --------------------------------------------------------------- | ----------------------- | --------------------------------------------------- |
| `OTEL_TRACES_SAMPLER`     | Échantillonneur à utiliser pour les traces \[1\]                | `parentbased_always_on` | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_TRACES_SAMPLER_ARG` | Valeur chaîne à utiliser comme argument d'échantillonneur \[2\] |                         | [Stable](/docs/specs/otel/versioning-and-stability) |

\[1\] : Les valeurs supportées sont :

- `always_on`,
- `always_off`,
- `traceidratio`,
- `parentbased_always_on`,
- `parentbased_always_off`,
- `parentbased_traceidratio`.

\[2\] : Pour les échantillonneurs `traceidratio` et `parentbased_traceidratio` :
Probabilité d'échantillonnage, un nombre dans la plage [0..1], ex. "0.25". La
valeur par défaut est 1.0.

## Exportateurs {#exporters}

Les exportateurs transmettent la télémétrie.

| Variable d'environnement | Description                                                                                                  | Valeur par défaut | Statut                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------- | --------------------------------------------------- |
| `OTEL_TRACES_EXPORTER`   | Liste séparée par des virgules d'exportateurs. Options supportées : `otlp`, `zipkin`, `console`, `none`.     | `otlp`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRICS_EXPORTER`  | Liste séparée par des virgules d'exportateurs. Options supportées : `otlp`, `prometheus`, `console`, `none`. | `otlp`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGS_EXPORTER`     | Liste séparée par des virgules d'exportateurs. Options supportées : `otlp`, `console`, `none`.               | `otlp`            | [Stable](/docs/specs/otel/versioning-and-stability) |

### Exportateur de traces {#traces-exporter}

| Variable d'environnement         | Description                                                                        | Valeur par défaut | Statut                                              |
| -------------------------------- | ---------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------- |
| `OTEL_BSP_SCHEDULE_DELAY`        | Intervalle de délai (en millisecondes) entre deux exports consécutifs.             | `5000`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_EXPORT_TIMEOUT`        | Temps maximum autorisé (en millisecondes) pour exporter les données                | `30000`           | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_QUEUE_SIZE`        | Taille maximale de la file d'attente.                                              | `2048`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | Taille maximale du lot. Doit être inférieure ou égale à `OTEL_BSP_MAX_QUEUE_SIZE`. | `512`             | [Stable](/docs/specs/otel/versioning-and-stability) |

### Exportateur de métriques {#metrics-exporter}

| Variable d'environnement      | Description                                                                          | Valeur par défaut                                                   | Statut                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------- |
| `OTEL_METRIC_EXPORT_INTERVAL` | L'intervalle de temps (en millisecondes) entre le début de deux tentatives d'export. | `60000` pour l'exportateur OTLP, `10000` pour l'exportateur console | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRIC_EXPORT_TIMEOUT`  | Temps maximum autorisé (en millisecondes) pour exporter les données.                 | `30000` pour l'exportateur OTLP, aucun pour l'exportateur console   | [Stable](/docs/specs/otel/versioning-and-stability) |

### Exportateur de logs {#logs-exporter}

| Variable d'environnement                          | Description                                           | Valeur par défaut | Statut                                                    |
| ------------------------------------------------- | ----------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE` | Si le message de log formaté doit être défini ou non. | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |

### OTLP {#otlp}

**Statut** : [Stable](/docs/specs/otel/versioning-and-stability)

Pour activer l'exportateur OTLP, définissez la variable d'environnement
`OTEL_TRACES_EXPORTER`/`OTEL_METRICS_EXPORTER`/`OTEL_LOGS_EXPORTER` à `otlp`.

Pour personnaliser l'exportateur OTLP en utilisant des variables
d'environnement, voir la
[documentation de l'exportateur OTLP](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.1/src/OpenTelemetry.Exporter.OpenTelemetryProtocol#environment-variables).
Les variables d'environnement importantes incluent :

| Variable d'environnement                            | Description                                                                                                                                                                                                          | Valeur par défaut                                                                      | Statut                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                       | Point de terminaison cible pour l'exportateur OTLP. Voir [la spécification OpenTelemetry](/docs/specs/otel/protocol/exporter/) pour plus de détails.                                                                 | `http/protobuf` : `http://localhost:4318`, `grpc` : `http://localhost:4317`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`                | Équivalent à `OTEL_EXPORTER_OTLP_ENDPOINT`, mais s'applique seulement aux traces.                                                                                                                                    | `http/protobuf` : `http://localhost:4318/v1/traces`, `grpc` : `http://localhost:4317`  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`               | Équivalent à `OTEL_EXPORTER_OTLP_ENDPOINT`, mais s'applique seulement aux métriques.                                                                                                                                 | `http/protobuf` : `http://localhost:4318/v1/metrics`, `grpc` : `http://localhost:4317` | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`                  | Équivalent à `OTEL_EXPORTER_OTLP_ENDPOINT`, mais s'applique seulement aux logs.                                                                                                                                      | `http/protobuf` : `http://localhost:4318/v1/logs`, `grpc` : `http://localhost:4317`    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                       | Protocole de transport de l'exportateur OTLP. Valeurs supportées : `grpc`, `http/protobuf`. [1]                                                                                                                      | `http/protobuf`                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`                | Équivalent à `OTEL_EXPORTER_OTLP_PROTOCOL`, mais s'applique seulement aux traces.                                                                                                                                    | `http/protobuf`                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`               | Équivalent à `OTEL_EXPORTER_OTLP_PROTOCOL`, mais s'applique seulement aux métriques.                                                                                                                                 | `http/protobuf`                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`                  | Équivalent à `OTEL_EXPORTER_OTLP_PROTOCOL`, mais s'applique seulement aux logs.                                                                                                                                      | `http/protobuf`                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TIMEOUT`                        | Le temps d'attente maximum (en millisecondes) pour que le backend traite chaque lot.                                                                                                                                 | `10000` (10s)                                                                          | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`                 | Équivalent à `OTEL_EXPORTER_OTLP_TIMEOUT`, mais s'applique seulement aux traces.                                                                                                                                     | `10000` (10s)                                                                          | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`                | Équivalent à `OTEL_EXPORTER_OTLP_TIMEOUT`, mais s'applique seulement aux métriques.                                                                                                                                  | `10000` (10s)                                                                          | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`                   | Équivalent à `OTEL_EXPORTER_OTLP_TIMEOUT`, mais s'applique seulement aux logs.                                                                                                                                       | `10000` (10s)                                                                          | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_HEADERS`                        | Liste séparée par des virgules d'en-têtes HTTP supplémentaires envoyés avec chaque export, par exemple : `Authorization=secret,X-Key=Value`.                                                                         |                                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`                 | Équivalent à `OTEL_EXPORTER_OTLP_HEADERS`, mais s'applique seulement aux traces.                                                                                                                                     |                                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`                | Équivalent à `OTEL_EXPORTER_OTLP_HEADERS`, mais s'applique seulement aux métriques.                                                                                                                                  |                                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS`                   | Équivalent à `OTEL_EXPORTER_OTLP_HEADERS`, mais s'applique seulement aux logs.                                                                                                                                       |                                                                                        | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`                 | Taille maximale autorisée pour la valeur d'attribut.                                                                                                                                                                 | aucune                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_COUNT_LIMIT`                        | Nombre maximum autorisé d'attributs de span.                                                                                                                                                                         | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`            | Taille maximale autorisée pour la valeur d'attribut. [Non applicable pour les métriques.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits). | aucune                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`                   | Nombre maximum autorisé d'attributs de span. [Non applicable pour les métriques.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits).         | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_EVENT_COUNT_LIMIT`                       | Nombre maximum autorisé d'événements de span.                                                                                                                                                                        | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_LINK_COUNT_LIMIT`                        | Nombre maximum autorisé de liens de span.                                                                                                                                                                            | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT`                  | Nombre maximum autorisé d'attributs par événement de span.                                                                                                                                                           | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LINK_ATTRIBUTE_COUNT_LIMIT`                   | Nombre maximum autorisé d'attributs par lien de span.                                                                                                                                                                | 128                                                                                    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | La temporalité d'agrégation à utiliser sur la base du type d'instrument. [2]                                                                                                                                         | `cumulative`                                                                           | [Stable](/docs/specs/otel/versioning-and-stability) |

**[1]** : Considérations sur le `OTEL_EXPORTER_OTLP_PROTOCOL` :

- L'Instrumentation Automatique .NET OpenTelemetry utilise par défaut
  `http/protobuf`, ce qui diffère de la valeur par défaut du SDK .NET
  OpenTelemetry qui est `grpc`.
- Sur .NET 6 et supérieur, l'application doit référencer
  [`Grpc.Net.Client`](https://www.nuget.org/packages/Grpc.Net.Client/) pour
  utiliser le protocole d'exportateur OTLP `grpc`. Par exemple, en ajoutant
  `<PackageReference Include="Grpc.Net.Client" Version="2.65.0" />` au fichier
  `.csproj`.
- Sur .NET Framework, le protocole d'exportateur OTLP `grpc` n'est pas supporté.

**[2]** : Les valeurs reconnues (insensibles à la casse) pour
`OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` sont :

- `Cumulative` : Choisir la temporalité d'agrégation cumulative pour tous les
  types d'instruments.
- `Delta` : Choisir la temporalité d'agrégation Delta pour les types
  d'instruments Counter, Asynchronous Counter et Histogram, choisir l'agrégation
  Cumulative pour les types d'instruments UpDownCounter et Asynchronous
  UpDownCounter.
- `LowMemory` : Cette configuration utilise la temporalité d'agrégation Delta
  pour Synchronous Counter et Histogram et utilise la temporalité d'agrégation
  Cumulative pour les types d'instruments Synchronous UpDownCounter,
  Asynchronous Counter, et Asynchronous UpDownCounter.
  - ⚠️ Cette valeur connue de la
    [spécification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.35.0/specification/metrics/sdk_exporters/otlp.md?plain=1#L48)
    n'est pas supportée.

### Prometheus {#prometheus}

**Statut** : [Expérimental](/docs/specs/otel/versioning-and-stability)

{{% alert title="Avertissement" color="warning" %}} **NE PAS utiliser en
production.**

L'exportateur Prometheus est destiné à la boucle de développement interne. Les
environnements de production peuvent utiliser une combinaison d'exportateur OTLP
avec
[OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector-releases)
ayant un
[récepteur `otlp`](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.61.0/receiver/otlpreceiver)
et un
[exportateur `prometheus`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.61.0/exporter/prometheusexporter).
{{% /alert %}}

Pour activer l'exportateur Prometheus, définissez la variable d'environnement
`OTEL_METRICS_EXPORTER` à `prometheus`.

L'exportateur expose le point de terminaison HTTP des métriques sur
`http://localhost:9464/metrics` et il met en cache les réponses pendant 300
millisecondes.

Voir la
[documentation Prometheus Exporter HttpListener](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.0-rc.1/src/OpenTelemetry.Exporter.Prometheus.HttpListener).
pour en savoir plus.

### Zipkin {#zipkin}

**Statut** : [Stable](/docs/specs/otel/versioning-and-stability)

Pour activer l'exportateur Zipkin, définissez la variable d'environnement
`OTEL_TRACES_EXPORTER` à `zipkin`.

Pour personnaliser l'exportateur Zipkin en utilisant des variables
d'environnement, voir la
[documentation de l'exportateur Zipkin](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.1/src/OpenTelemetry.Exporter.Zipkin#configuration-using-environment-variables).
Les variables d'environnement importantes incluent :

| Variable d'environnement        | Description | Valeur par défaut                    | Statut                                              |
| ------------------------------- | ----------- | ------------------------------------ | --------------------------------------------------- |
| `OTEL_EXPORTER_ZIPKIN_ENDPOINT` | URL Zipkin  | `http://localhost:9411/api/v2/spans` | [Stable](/docs/specs/otel/versioning-and-stability) |

## Paramètres supplémentaires {#additional-settings}

| Variable d'environnement                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Valeur par défaut | Statut                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_TRACES_ENABLED`                   | Active les traces.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_OPENTRACING_ENABLED`              | Active le traceur OpenTracing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_ENABLED`                     | Active les logs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ENABLED`                  | Active les métriques.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`           | Active la redirection automatique des assemblies utilisés par l'instrumentation automatique sur .NET Framework.                                                                                                                                                                                                                                                                                                                                                                                                                                | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`        | Liste séparée par des virgules de noms `System.Diagnostics.ActivitySource` supplémentaires à ajouter au traceur au démarrage. Utilisez-le pour capturer des spans instrumentés manuellement.                                                                                                                                                                                                                                                                                                                                                   |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_LEGACY_SOURCES` | Liste séparée par des virgules de noms de sources legacy supplémentaires à ajouter au traceur au démarrage. Utilisez-le pour capturer des objets `System.Diagnostics.Activity` créés sans utiliser l'API `System.Diagnostics.ActivitySource`.                                                                                                                                                                                                                                                                                                  |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FLUSH_ON_UNHANDLEDEXCEPTION`      | Contrôle si les données de télémétrie sont vidées quand un événement [AppDomain.UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.appdomain.unhandledexception) est déclenché. Définissez à `true` quand vous soupçonnez que vous rencontrez un problème avec des données de télémétrie manquantes et que vous rencontrez également des exceptions non gérées.                                                                                                                                                            | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`       | Liste séparée par des virgules de noms `System.Diagnostics.Metrics.Meter` supplémentaires à ajouter au compteur au démarrage. Utilisez-le pour capturer des spans instrumentés manuellement.                                                                                                                                                                                                                                                                                                                                                   |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_PLUGINS`                          | Liste séparée par des deux-points de types de plugins d'instrumentation SDK OTel, spécifiés avec le [nom qualifié d'assembly](https://docs.microsoft.com/en-us/dotnet/api/system.type.assemblyqualifiedname?view=net-6.0#system-type-assemblyqualifiedname). _Note : Cette liste doit être séparée par des deux-points car les noms de types peuvent inclure des virgules._ Voir plus d'infos sur comment écrire des plugins à [plugins.md](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/plugins.md). |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |

## RuleEngine {#ruleengine}

RuleEngine est une fonctionnalité qui valide les assemblies API, SDK,
Instrumentation, et Exporter OpenTelemetry pour des scénarios non supportés,
s'assurant que l'instrumentation automatique OpenTelemetry est plus stable en se
retirant au lieu de planter. Elle fonctionne sur .NET 6 et supérieur.

Activez RuleEngine seulement pendant la première exécution de l'application, ou
quand le déploiement change ou que la bibliothèque d'Instrumentation Automatique
est mise à niveau. Une fois validé, il n'y a pas besoin de revalider les règles
quand l'application redémarre.

| Variable d'environnement               | Description        | Valeur par défaut | Statut                                                    |
| -------------------------------------- | ------------------ | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RULE_ENGINE_ENABLED` | Active RuleEngine. | `true`            | [Expérimental](/docs/specs/otel/versioning-and-stability) |

## Profileur .NET CLR {#net-clr-profiler}

Le CLR utilise les variables d'environnement suivantes pour configurer le
profileur. Voir
[.NET Runtime Profiler Loading](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/profiling/Profiler%20Loading.md)
pour plus d'informations.

| Variable d'environnement .NET Framework | Variable d'environnement .NET | Description                                                                                                           | Valeur requise                                                                                                                                                                                                                                                     | Statut                                                    |
| --------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `COR_ENABLE_PROFILING`                  | `CORECLR_ENABLE_PROFILING`    | Active le profileur.                                                                                                  | `1`                                                                                                                                                                                                                                                                | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER`                          | `CORECLR_PROFILER`            | CLSID du profileur.                                                                                                   | `{918728DD-259F-4A6A-AC2B-B85E1B658318}`                                                                                                                                                                                                                           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH`                     | `CORECLR_PROFILER_PATH`       | Chemin vers le profileur.                                                                                             | `$INSTALL_DIR/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so` pour Linux glibc, `$INSTALL_DIR/linux-musl-x64/OpenTelemetry.AutoInstrumentation.Native.so` pour Linux musl, `$INSTALL_DIR/osx-x64/OpenTelemetry.AutoInstrumentation.Native.dylib` pour macOS | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_32`                  | `CORECLR_PROFILER_PATH_32`    | Chemin vers le profileur 32-bit. Les chemins spécifiques à l'architecture ont la priorité sur les chemins génériques. | `$INSTALL_DIR/win-x86/OpenTelemetry.AutoInstrumentation.Native.dll` pour Windows                                                                                                                                                                                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_64`                  | `CORECLR_PROFILER_PATH_64`    | Chemin vers le profileur 64-bit. Les chemins spécifiques à l'architecture ont la priorité sur les chemins génériques. | `$INSTALL_DIR/win-x64/OpenTelemetry.AutoInstrumentation.Native.dll` pour Windows                                                                                                                                                                                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |

Définir l'Instrumentation Automatique .NET OpenTelemetry comme Profileur .NET
CLR est requis pour .NET Framework.

Sur .NET, le Profileur .NET CLR est utilisé seulement pour l'instrumentation
bytecode. Si avoir seulement l'instrumentation source est acceptable, vous
pouvez désactiver ou supprimer les variables d'environnement suivantes :

```env
COR_ENABLE_PROFILING
COR_PROFILER
COR_PROFILER_PATH_32
COR_PROFILER_PATH_64
CORECLR_ENABLE_PROFILING
CORECLR_PROFILER
CORECLR_PROFILER_PATH
CORECLR_PROFILER_PATH_32
CORECLR_PROFILER_PATH_64
```

## Runtime .NET {#net-runtime}

Sur .NET, il est requis de définir la variable d'environnement
[`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md).

Les variables d'environnement
[`DOTNET_ADDITIONAL_DEPS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/additional-deps.md)
et
[`DOTNET_SHARED_STORE`](https://docs.microsoft.com/en-us/dotnet/core/deploying/runtime-store)
sont utilisées pour atténuer les conflits de version d'assembly dans .NET.

| Variable d'environnement | Valeur requise                                                       | Statut                                                    |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `DOTNET_STARTUP_HOOKS`   | `$INSTALL_DIR/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll` | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_ADDITIONAL_DEPS` | `$INSTALL_DIR/AdditionalDeps`                                        | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_SHARED_STORE`    | `$INSTALL_DIR/store`                                                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |

## Logs internes {#internal-logs}

Les chemins de répertoire par défaut pour les journaux internes sont :

- Windows : `%ProgramData%\OpenTelemetry .NET AutoInstrumentation\logs`
- Linux : `/var/log/opentelemetry/dotnet`
- macOS : `/var/log/opentelemetry/dotnet`

Si les répertoires de journaux par défaut ne peuvent pas être créés,
l'instrumentation utilise le chemin du
[dossier temporaire](https://docs.microsoft.com/en-us/dotnet/api/System.IO.Path.GetTempPath?view=net-6.0)
de l'utilisateur actuel à la place.

| Variable d'environnement                          | Description                                                                       | Valeur par défaut                                    | Statut                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOG_DIRECTORY`                  | Répertoire des journaux du Traceur .NET.                                          | _Voir la note précédente sur les chemins par défaut_ | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOG_LEVEL`                                  | Niveau de log du SDK. (valeurs supportées : `none`,`error`,`warn`,`info`,`debug`) | `info`                                               | [Stable](/docs/specs/otel/versioning-and-stability)       |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE` | Si l'état du log doit être formaté.                                               | `false`                                              | [Expérimental](/docs/specs/otel/versioning-and-stability) |

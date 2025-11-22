---
title: Instrumentations disponibles
linkTitle: Instrumentations
description:
  Bibliothèques supportées par l'instrumentation Zero-code OpenTelemetry pour
  .NET.
weight: 10
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
drifted_from_default: true
# prettier-ignore
cSpell:ignore: ASPNET ASPNETCORE Bootstrapper DBSTATEMENT ELASTICTRANSPORT ENTITYFRAMEWORKCORE GRPCNETCLIENT HOSTINGSTARTUPASSEMBLIES HTTPCLIENT ILOGGER MASSTRANSIT MYSQLCONNECTOR MYSQLDATA NETRUNTIME npgsql NSERVICEBUS ORACLEMDA RABBITMQ SQLCLIENT STACKEXCHANGEREDIS WCFCLIENT WCFSERVICE
---

L'instrumentation Zero-code OpenTelemetry pour .NET supporte une grande variété
de bibliothèques.

## Instrumentations {#instrumentations}

Toutes les instrumentations sont activées par défaut pour tous les types de
signaux (traces, métriques et logs).

Vous pouvez désactiver toutes les instrumentations pour un type de signal
spécifique en définissant la variable d'environnement
`OTEL_DOTNET_AUTO_{SIGNAL}_INSTRUMENTATION_ENABLED` à `false`.

Pour une approche plus granulaire, vous pouvez désactiver des instrumentations
spécifiques pour un type de signal donné en définissant la variable
d'environnement `OTEL_DOTNET_AUTO_{SIGNAL}_{0}_INSTRUMENTATION_ENABLED` à
`false`, où `{SIGNAL}` est le type de signal, par exemple `TRACES`, et `{0}` est
le nom sensible à la casse de l'instrumentation.

| Variable d'environnement                               | Description                                                                                                                                                                                                                 | Valeur par défaut                                                                   | Statut                                                    |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`             | Active toutes les instrumentations.                                                                                                                                                                                         | `true`                                                                              | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`      | Active toutes les instrumentations de traces. Remplace `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                          | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_{0}_INSTRUMENTATION_ENABLED`  | Modèle de configuration pour activer une instrumentation de trace spécifique, où `{0}` est l'ID en majuscules de l'instrumentation que vous voulez activer. Remplace `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`.     | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`  | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED`     | Désactive toutes les instrumentations de métriques. Remplace `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                    | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_{0}_INSTRUMENTATION_ENABLED` | Modèle de configuration pour activer une instrumentation de métrique spécifique, où `{0}` est l'ID en majuscules de l'instrumentation que vous voulez activer. Remplace `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED`. | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED` | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`        | Désactive toutes les instrumentations de logs. Remplace `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                         | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_{0}_INSTRUMENTATION_ENABLED`    | Modèle de configuration pour activer une instrumentation de log spécifique, où `{0}` est l'ID en majuscules de l'instrumentation que vous voulez activer. Remplace `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`.         | Héritée de la valeur actuelle de `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`    | [Expérimental](/docs/specs/otel/versioning-and-stability) |

## Instrumentations de traces {#traces-instrumentations}

**Statut** : [Mixte](/docs/specs/otel/versioning-and-stability). Les traces sont
stables, mais certaines bibliothèques d'instrumentation sont en statut
Expérimental en raison de l'absence de convention sémantique stable.

| ID                    | Bibliothèque instrumentée                                                                                                                                                                                             | Versions supportées    | Type d'instrumentation   | Statut                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------ | --------------------------------------------------------- |
| `ASPNET`              | ASP.NET (.NET Framework) MVC / WebApi \[1\] **Non supporté sur .NET**                                                                                                                                                 | \* \[2\]               | source & bytecode        | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`          | ASP.NET Core **Non supporté sur .NET Framework**                                                                                                                                                                      | \*                     | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `AZURE`               | [Azure SDK](https://azure.github.io/azure-sdk/releases/latest/index.html)                                                                                                                                             | \[3\]                  | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ELASTICSEARCH`       | [Elastic.Clients.Elasticsearch](https://www.nuget.org/packages/Elastic.Clients.Elasticsearch)                                                                                                                         | \* \[4\]               | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ELASTICTRANSPORT`    | [Elastic.Transport](https://www.nuget.org/packages/Elastic.Transport)                                                                                                                                                 | ≥0.4.16                | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ENTITYFRAMEWORKCORE` | [Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore) **Non supporté sur .NET Framework**                                                                                     | ≥6.0.12                | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `GRAPHQL`             | [GraphQL](https://www.nuget.org/packages/GraphQL) **Non supporté sur .NET Framework**                                                                                                                                 | ≥7.5.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `GRPCNETCLIENT`       | [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client)                                                                                                                                                     | ≥2.52.0 & < 3.0.0      | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`          | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) et [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest)                        | \*                     | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `KAFKA`               | [Confluent.Kafka](https://www.nuget.org/packages/Confluent.Kafka)                                                                                                                                                     | ≥1.4.0 & < 3.0.0 \[5\] | bytecode                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `MASSTRANSIT`         | [MassTransit](https://www.nuget.org/packages/MassTransit) **Non supporté sur .NET Framework**                                                                                                                         | ≥8.0.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `MONGODB`             | [MongoDB.Driver.Core](https://www.nuget.org/packages/MongoDB.Driver.Core) / [MongoDB.Driver](https://www.nuget.org/packages/MongoDB.Driver)                                                                           | ≥2.7.0 < 4.0.0         | bytecode                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLCONNECTOR`      | [MySqlConnector](https://www.nuget.org/packages/MySqlConnector)                                                                                                                                                       | ≥2.0.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLDATA`           | [MySql.Data](https://www.nuget.org/packages/MySql.Data) **Non supporté sur .NET Framework**                                                                                                                           | ≥8.1.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `NPGSQL`              | [Npgsql](https://www.nuget.org/packages/Npgsql)                                                                                                                                                                       | ≥6.0.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS`         | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                                             | ≥8.0.0 & < 10.0.0      | source & bytecode        | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ORACLEMDA`           | [Oracle.ManagedDataAccess.Core](https://www.nuget.org/packages/Oracle.ManagedDataAccess.Core) et [Oracle.ManagedDataAccess](https://www.nuget.org/packages/Oracle.ManagedDataAccess) **Non supporté sur ARM64**       | ≥23.4.0                | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `RABBITMQ`            | [RabbitMQ.Client](https://www.nuget.org/packages/RabbitMQ.Client/)                                                                                                                                                    | ≥6.0.0                 | source ou bytecode \[6\] | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `QUARTZ`              | [Quartz](https://www.nuget.org/packages/Quartz) **Non supporté sur .NET Framework 4.7.1 et antérieur**                                                                                                                | ≥3.4.0                 | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `SQLCLIENT`           | [Microsoft.Data.SqlClient](https://www.nuget.org/packages/Microsoft.Data.SqlClient), [System.Data.SqlClient](https://www.nuget.org/packages/System.Data.SqlClient) \[7\] et `System.Data` (livré avec .NET Framework) | \* \[8\]               | source                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `STACKEXCHANGEREDIS`  | [StackExchange.Redis](https://www.nuget.org/packages/StackExchange.Redis) **Non supporté sur .NET Framework**                                                                                                         | ≥2.6.122 & < 3.0.0     | source & bytecode        | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `WCFCLIENT`           | WCF                                                                                                                                                                                                                   | \*                     | source & bytecode        | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `WCFSERVICE`          | WCF **Non supporté sur .NET**.                                                                                                                                                                                        | \*                     | source & bytecode        | [Expérimental](/docs/specs/otel/versioning-and-stability) |

\[1\] : Seul le mode pipeline intégré est supporté.

\[2\] : `ASP.NET (.NET Framework) MVC / WebApi` n'est pas supporté sur ARM64.

\[3\] : Paquets préfixés par `Azure.`, publiés après le 1er octobre 2021.

\[4\] : `Elastic.Clients.Elasticsearch` version ≥8.0.0 et <8.10.0. La version
≥8.10.0 est supportée par l'instrumentation `Elastic.Transport`.

\[5\] : `Confluent.Kafka` est supporté à partir de la version ≥1.8.2 sur ARM64.

\[6\] : `RabbitMq.Client` nécessite l'instrumentation bytecode seulement pour la
versions 6 et toutes ses versions mineures. La version 7.0.0+ utilise seulement
l'instrumentation source.

\[7\] : `System.Data.SqlClient` est
[déprécié](https://www.nuget.org/packages/System.Data.SqlClient/4.9.0#readme-body-tab).

\[8\] : `Microsoft.Data.SqlClient` v3.\* n'est pas supporté sur .NET Framework.
Vous pouvez voir la raison du
[problème](https://github.com/open-telemetry/opentelemetry-dotnet/issues/4243).
`System.Data.SqlClient` est supporté à partir de la version 4.8.5.

## Instrumentations de métriques {#metrics-instrumentations}

**Statut** : [Mixte](/docs/specs/otel/versioning-and-stability). Les métriques
sont stables, mais certaines instrumentations sont en statut Expérimental en
raison de l'absence de convention sémantique stable.

| ID            | Bibliothèque instrumentée                                                                                                                                                                                             | Documentation                                                                                                                                                                                                   | Versions supportées | Type d'instrumentation | Statut                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------- | --------------------------------------------------------- |
| `ASPNET`      | ASP.NET Framework \[1\] **Non supporté sur .NET**                                                                                                                                                                     | [Métriques ASP.NET](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.AspNet-1.11.0-beta.1/src/OpenTelemetry.Instrumentation.AspNet/README.md#list-of-metrics-produced)       | \*                  | source & bytecode      | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`  | ASP.NET Core **Non supporté sur .NET Framework**                                                                                                                                                                      | [Métriques ASP.NET Core](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.AspNetCore-1.11.0/src/OpenTelemetry.Instrumentation.AspNetCore/README.md#list-of-metrics-produced) | \*                  | source                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`  | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) et [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest)                        | [Métriques HttpClient](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Http-1.11.0/src/OpenTelemetry.Instrumentation.Http/README.md#list-of-metrics-produced)               | \*                  | source                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `NETRUNTIME`  | [OpenTelemetry.Instrumentation.Runtime](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Runtime)                                                                                                         | [Métriques Runtime](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Runtime-1.11.0/src/OpenTelemetry.Instrumentation.Runtime/README.md#metrics)                             | \*                  | source                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS` | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                                             | [Métriques NServiceBus](https://docs.particular.net/samples/open-telemetry/prometheus-grafana/#reporting-metric-values)                                                                                         | ≥8.0.0 & < 10.0.0   | source & bytecode      | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`     | [OpenTelemetry.Instrumentation.Process](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Process)                                                                                                         | [Métriques Process](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Process-1.11.0-beta.1/src/OpenTelemetry.Instrumentation.Process/README.md#metrics)                      | \*                  | source                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `SQLCLIENT`   | [Microsoft.Data.SqlClient](https://www.nuget.org/packages/Microsoft.Data.SqlClient), [System.Data.SqlClient](https://www.nuget.org/packages/System.Data.SqlClient) \[2\] et `System.Data` (livré avec .NET Framework) | [Métriques SqlClient](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/releases/tag/Instrumentation.SqlClient-1.11.0-beta.1)                                                                      | \* \[3\]            | source                 | [Expérimental](/docs/specs/otel/versioning-and-stability) |

\[1\] : Les métriques ASP.NET sont générées seulement si l'instrumentation de
trace `AspNet` est également activée.

\[2\] : `System.Data.SqlClient` est
[déprécié](https://www.nuget.org/packages/System.Data.SqlClient/4.9.0#readme-body-tab).

\[3\] : `Microsoft.Data.SqlClient` v3.\* n'est pas supporté sur .NET Framework,
en raison du
[problème](https://github.com/open-telemetry/opentelemetry-dotnet/issues/4243).
`System.Data.SqlClient` est supporté à partir de la version 4.8.5.

## Instrumentations de logs {#logs-instrumentations}

**Statut** : [Expérimental](/docs/specs/otel/versioning-and-stability).

| ID        | Bibliothèque instrumentée                                                                                                       | Versions supportées | Type d'instrumentation | Statut                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------- | --------------------------------------------------------- |
| `ILOGGER` | [Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging) **Non supporté sur .NET Framework** | ≥9.0.0              | bytecode ou source [1] | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `LOG4NET` | [log4net](https://www.nuget.org/packages/log4net)                                                                               | ≥2.0.13 && < 4.0.0  | bytecode               | [Expérimental](/docs/specs/otel/versioning-and-stability) |

**[1]** : Pour les applications ASP.NET Core, l'instrumentation `LoggingBuilder`
peut être activée sans utiliser le Profiler .NET CLR en définissant la variable
d'environnement `ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` à
`OpenTelemetry.AutoInstrumentation.AspNetCoreBootstrapper`.

### Options d'instrumentation {#instrumentation-options}

| Variable d'environnement                                                          | Description                                                                                                                                                                                                                                                                                                                  | Valeur par défaut | Statut                                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_ENTITYFRAMEWORKCORE_SET_DBSTATEMENT_FOR_TEXT`                   | L'instrumentation Entity Framework Core peut passer les instructions SQL via l'attribut `db.statement`. Les requêtes peuvent contenir des informations sensibles. Si défini à `false`, `db.statement` est enregistré seulement pour l'exécution de procédures stockées.                                                      | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_GRAPHQL_SET_DOCUMENT`                                           | L'instrumentation GraphQL peut passer les requêtes brutes via l'attribut `graphql.document`. Les requêtes peuvent contenir des informations sensibles.                                                                                                                                                                       | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_ORACLEMDA_SET_DBSTATEMENT_FOR_TEXT`                             | L'instrumentation Oracle Client peut passer les instructions SQL via l'attribut `db.statement`. Les requêtes peuvent contenir des informations sensibles. Si défini à `false`, `db.statement` est enregistré seulement pour l'exécution de procédures stockées.                                                              | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_SQLCLIENT_SET_DBSTATEMENT_FOR_TEXT`                             | L'instrumentation SQL Client peut passer les instructions SQL via l'attribut `db.statement`. Les requêtes peuvent contenir des informations sensibles. Si défini à `false`, `db.statement` est enregistré seulement pour l'exécution de procédures stockées. **Non supporté sur .NET Framework pour System.Data.SqlClient.** | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNET_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`          | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations ASP.NET captureront les valeurs d'en-têtes de requête HTTP pour tous les noms d'en-têtes configurés.                                                                                                                                        |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNET_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`         | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations ASP.NET captureront les valeurs d'en-têtes de réponse HTTP pour tous les noms d'en-têtes configurés. **Non supporté sur le mode IIS Classic.**                                                                                              |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNETCORE_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`      | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations ASP.NET Core captureront les valeurs d'en-têtes de requête HTTP pour tous les noms d'en-têtes configurés.                                                                                                                                   |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNETCORE_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`     | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations ASP.NET Core captureront les valeurs d'en-têtes de réponse HTTP pour tous les noms d'en-têtes configurés.                                                                                                                                   |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_CAPTURE_REQUEST_METADATA`  | Une liste séparée par des virgules de noms de métadonnées gRPC. Les instrumentations Grpc.Net.Client captureront les valeurs de métadonnées de requête gRPC pour tous les noms de métadonnées configurés.                                                                                                                    |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_CAPTURE_RESPONSE_METADATA` | Une liste séparée par des virgules de noms de métadonnées gRPC. Les instrumentations Grpc.Net.Client captureront les valeurs de métadonnées de réponse gRPC pour tous les noms de métadonnées configurés.                                                                                                                    |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_HTTP_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`            | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations HTTP Client captureront les valeurs d'en-têtes de requête HTTP pour tous les noms d'en-têtes configurés.                                                                                                                                    |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_HTTP_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`           | Une liste séparée par des virgules de noms d'en-têtes HTTP. Les instrumentations HTTP Client captureront les valeurs d'en-têtes de réponse HTTP pour tous les noms d'en-têtes configurés.                                                                                                                                    |                   | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_ASPNETCORE_DISABLE_URL_QUERY_REDACTION`                 | L'instrumentation ASP.NET Core désactive l'offuscation de la valeur de l'attribut `url.query`.                                                                                                                                                                                                                               | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_HTTPCLIENT_DISABLE_URL_QUERY_REDACTION`                 | L'instrumentation HTTP client désactive l'offuscation de la valeur de l'attribut `url.full`.                                                                                                                                                                                                                                 | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_ASPNET_DISABLE_URL_QUERY_REDACTION`                     | L'instrumentation ASP.NET désactive l'offuscation de la valeur de l'attribut `url.query`.                                                                                                                                                                                                                                    | `false`           | [Expérimental](/docs/specs/otel/versioning-and-stability) |

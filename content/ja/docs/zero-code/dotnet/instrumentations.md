---
title: 利用可能な計装
linkTitle: 計装
description: OpenTelemetry .NET 自動計装がサポートするライブラリ。
weight: 10
default_lang_commit: 460a794358f268c4c330b4dac8d4aa234ef1c35d
# prettier-ignore
cSpell:ignore: ADONET ASPNET ASPNETCORE Bootstrapper DBSTATEMENT ELASTICTRANSPORT ENTITYFRAMEWORKCORE GRPCNETCLIENT HOSTINGSTARTUPASSEMBLIES HTTPCLIENT ILOGGER ILREWRITE MASSTRANSIT MYSQLCONNECTOR MYSQLDATA NETRUNTIME netstandard NLOG npgsql NSERVICEBUS ORACLEMDA RABBITMQ SQLCLIENT SQLITE STACKEXCHANGEREDIS WCFCLIENT WCFCORE WCFSERVICE
---

OpenTelemetry .NET 自動計装は、さまざまなライブラリをサポートしています。

## 計装 {#instrumentations}

すべての計装は、すべてのシグナルタイプ（トレース、メトリクス、ログ）に対してデフォルトで有効になっています。

特定のシグナルタイプに対するすべての計装を無効にするには、環境変数 `OTEL_DOTNET_AUTO_{SIGNAL}_INSTRUMENTATION_ENABLED` を `false` に設定します。

より細かく制御するには、特定のシグナルタイプに対する個別の計装を無効にすることもできます。
環境変数 `OTEL_DOTNET_AUTO_{SIGNAL}_{0}_INSTRUMENTATION_ENABLED` を `false` に設定してください。
ここで `{SIGNAL}` はシグナルのタイプ（例: `TRACES`）、`{0}` は大文字小文字を区別する計装の名前です。

| 環境変数                                               | 説明                                                                                                                                                                    | デフォルト値                                                        | ステータス                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`             | すべての計装を有効にします。                                                                                                                                            | `true`                                                              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`      | すべてのトレース計装を有効にします。`OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` を上書きします。                                                                         | `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` の現在の値を継承         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_{0}_INSTRUMENTATION_ENABLED`  | 特定のトレース計装を有効にするための設定パターンです。`{0}` は有効にしたい計装の大文字の ID です。`OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED` を上書きします。    | `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED` の現在の値を継承  | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED`     | すべてのメトリクス計装を無効にします。`OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` を上書きします。                                                                       | `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` の現在の値を継承         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_{0}_INSTRUMENTATION_ENABLED` | 特定のメトリクス計装を有効にするための設定パターンです。`{0}` は有効にしたい計装の大文字の ID です。`OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED` を上書きします。 | `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED` の現在の値を継承 | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`        | すべてのログ計装を無効にします。`OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` を上書きします。                                                                             | `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED` の現在の値を継承         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_{0}_INSTRUMENTATION_ENABLED`    | 特定のログ計装を有効にするための設定パターンです。`{0}` は有効にしたい計装の大文字の ID です。`OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED` を上書きします。          | `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED` の現在の値を継承    | [Experimental](/docs/specs/otel/versioning-and-stability) |

## トレース計装 {#traces-instrumentations}

**ステータス**: [Mixed](/docs/specs/otel/versioning-and-stability)。
トレースは安定版ですが、安定したセマンティック規約がないため、個々の計装ライブラリは Experimental ステータスです。

| ID                    | 計装対象ライブラリ                                                                                                                                                                                                            | サポートバージョン     | 計装タイプ                      | ステータス                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------- | --------------------------------------------------------- |
| `ADONET`              | ADO.NET \[1\]                                                                                                                                                                                                                 | \[2\]                  | バイトコード                    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNET`              | ASP.NET (.NET Framework) MVC / WebApi \[3\] **.NET ではサポートされていません**                                                                                                                                               | \* \[4\]               | ソースおよびバイトコード        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`          | ASP.NET Core **.NET Framework ではサポートされていません**                                                                                                                                                                    | \*                     | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `AZURE`               | [Azure SDK](https://azure.github.io/azure-sdk/releases/latest/index.html)                                                                                                                                                     | \[5\]                  | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ELASTICSEARCH`       | [Elastic.Clients.Elasticsearch](https://www.nuget.org/packages/Elastic.Clients.Elasticsearch)                                                                                                                                 | \* \[6\]               | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ELASTICTRANSPORT`    | [Elastic.Transport](https://www.nuget.org/packages/Elastic.Transport)                                                                                                                                                         | ≥0.4.16                | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ENTITYFRAMEWORKCORE` | [Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore) **.NET Framework ではサポートされていません**                                                                                   | ≥6.0.12                | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `GRAPHQL`             | [GraphQL](https://www.nuget.org/packages/GraphQL) **.NET Framework ではサポートされていません**                                                                                                                               | ≥7.5.0                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `GRPCNETCLIENT`       | [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client)                                                                                                                                                             | ≥2.52.0 & < 3.0.0      | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`          | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) および [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest)                            | \*                     | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `KAFKA`               | [Confluent.Kafka](https://www.nuget.org/packages/Confluent.Kafka)                                                                                                                                                             | ≥1.4.0 & < 3.0.0 \[7\] | バイトコード                    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MASSTRANSIT`         | [MassTransit](https://www.nuget.org/packages/MassTransit) **.NET Framework ではサポートされていません**                                                                                                                       | ≥8.0.0                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MONGODB`             | [MongoDB.Driver.Core](https://www.nuget.org/packages/MongoDB.Driver.Core) / [MongoDB.Driver](https://www.nuget.org/packages/MongoDB.Driver)                                                                                   | ≥2.7.0                 | ソースまたはバイトコード \[8\]  | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLCONNECTOR`      | [MySqlConnector](https://www.nuget.org/packages/MySqlConnector)                                                                                                                                                               | ≥2.0.0                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLDATA`           | [MySql.Data](https://www.nuget.org/packages/MySql.Data) **.NET Framework ではサポートされていません**                                                                                                                         | ≥8.1.0                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NPGSQL`              | [Npgsql](https://www.nuget.org/packages/Npgsql)                                                                                                                                                                               | ≥6.0.0                 | ソースおよびバイトコード \[14\] | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS`         | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                                                     | ≥8.0.0 & < 10.0.0      | ソースおよびバイトコード        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ORACLEMDA`           | [Oracle.ManagedDataAccess.Core](https://www.nuget.org/packages/Oracle.ManagedDataAccess.Core) および [Oracle.ManagedDataAccess](https://www.nuget.org/packages/Oracle.ManagedDataAccess) **ARM64 ではサポートされていません** | ≥23.4.0                | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `RABBITMQ`            | [RabbitMQ.Client](https://www.nuget.org/packages/RabbitMQ.Client/)                                                                                                                                                            | ≥5.0.0                 | ソースまたはバイトコード \[9\]  | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `QUARTZ`              | [Quartz](https://www.nuget.org/packages/Quartz) **Quartz 4.x は .NET 10+ でのみサポートされます。Quartz 3.x は .NET Framework 4.7.1 以前ではサポートされていません**                                                          | \[15\]                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `SQLCLIENT`           | [Microsoft.Data.SqlClient](https://www.nuget.org/packages/Microsoft.Data.SqlClient)、[System.Data.SqlClient](https://www.nuget.org/packages/System.Data.SqlClient) \[10\] および `System.Data`（.NET Framework に同梱）       | \* \[11\]              | ソースおよびバイトコード \[12\] | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `SQLITE`              | [Microsoft.Data.Sqlite](https://www.nuget.org/packages/Microsoft.Data.Sqlite)                                                                                                                                                 | ≥8.0.0 & < 12.0.0      | バイトコード                    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `STACKEXCHANGEREDIS`  | [StackExchange.Redis](https://www.nuget.org/packages/StackExchange.Redis)                                                                                                                                                     | \[13\]                 | ソースおよびバイトコード        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `WCFCLIENT`           | WCF                                                                                                                                                                                                                           | \*                     | ソースおよびバイトコード        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `WCFCORE`             | [CoreWCF.Primitives](https://www.nuget.org/packages/CoreWCF.Primitives) **.NET Framework ではサポートされていません**                                                                                                         | ≥1.8.0                 | ソース                          | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `WCFSERVICE`          | WCF **.NET ではサポートされていません**。                                                                                                                                                                                     | \*                     | ソースおよびバイトコード        | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: `DbCommand` メソッドをカバーする汎用的な ADO.NET 計装です。
オーバーライドされたメソッドの実装のみをカバーします。
通常、多くの実装は C# の `new` キーワードを利用しているため、そのようなケースには固有の実装が必要です。
この計装は、`SQLCLIENT`、`NPGSQL`、`MYSQLDATA`、`MYSQLCONNECTOR`、`ORACLEMDA`、`SQLITE` などの固有の計装でカバーされるライブラリは対象外です。

\[2\]: `System.Data.Common`（≥4.0.0 および <12.0.0）、.NET Framework 用の `System.Data`（≥2.0.0 および <5.0.0）、および `netstandard`（≥2.0.0 および <3.0.0）をサポートしています。

\[3\]: 統合パイプラインモードのみサポートされています。

\[4\]: `ASP.NET (.NET Framework) MVC / WebApi` は ARM64 ではサポートされていません。

\[5\]: 2021年10月1日以降にリリースされた `Azure.` 接頭辞のパッケージ。

\[6\]: `Elastic.Clients.Elasticsearch` バージョン ≥8.0.0 および <8.10.0。
バージョン ≥8.10.0 は `Elastic.Transport` 計装でサポートされます。

\[7\]: `Confluent.Kafka` は、Windows および Linux の ARM64 ではバージョン ≥1.8.2 から、macOS では ≥1.9.2 からサポートされています。

\[8\]: `MongoDB.Driver` は `3.7.0` 未満のバージョンでのみバイトコード計装が必要です。
`3.7.0+` ではソース計装のみを使用します。

\[9\]: `RabbitMq.Client` は `5.*` および `6.*` バージョンでのみバイトコード計装が必要です。
`7.0.0+` ではソース計装のみを使用します。

\[10\]: `System.Data.SqlClient` は[非推奨](https://www.nuget.org/packages/System.Data.SqlClient/4.9.0#readme-body-tab)です。

\[11\]: `Microsoft.Data.SqlClient` v3.\* は、[イシュー](https://github.com/open-telemetry/opentelemetry-dotnet/issues/4243)により .NET Framework ではサポートされていません。
`System.Data.SqlClient` はバージョン 4.8.5 からサポートされています。

\[12\]: バイトコード計装はコンテキスト伝搬にのみ使用され、`OTEL_DOTNET_EXPERIMENTAL_SQLCLIENT_ENABLE_TRACE_CONTEXT_PROPAGATION` で設定できます。

\[13\]: `StackExchange.Redis` バージョン ≥2.6.122 および <4.0.0 が .NET でサポートされ、バージョン ≥2.6.122 および <3.0.0 が .NET Framework でサポートされています。

\[14\]: バイトコード計装はコンテキスト伝搬にのみ使用され、`OTEL_DOTNET_AUTO_NPGSQL_CONTEXT_PROPAGATION` で設定できます。

\[15\]: `Quartz` バージョン ≥3.4.0 および <4.0.0 がサポートされていますが、Quartz 3.x のサポートは非推奨です。
バージョン ≥4.0.0 は .NET 10+ でのみサポートされます。

## メトリクス計装 {#metrics-instrumentations}

**ステータス**: [Mixed](/docs/specs/otel/versioning-and-stability)。
メトリクスは安定版ですが、安定したセマンティック規約がないため、個々の計装は Experimental ステータスです。

| ID            | 計装対象ライブラリ                                                                                                                                                                                                     | ドキュメント                                                                                                                                                                                                  | サポートバージョン | 計装タイプ               | ステータス                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ | --------------------------------------------------------- |
| `ASPNET`      | ASP.NET Framework \[1\] **.NET ではサポートされていません**                                                                                                                                                            | [ASP.NET metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.AspNet-1.19.0/src/OpenTelemetry.Instrumentation.AspNet/README.md#list-of-metrics-produced)              | \*                 | ソースおよびバイトコード | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`  | ASP.NET Core **.NET Framework ではサポートされていません**                                                                                                                                                             | [ASP.NET Core metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.AspNetCore-1.19.0/src/OpenTelemetry.Instrumentation.AspNetCore/README.md#list-of-metrics-produced) | \*                 | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`  | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) および [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest)                     | [HttpClient metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Http-1.19.0/src/OpenTelemetry.Instrumentation.Http/README.md#list-of-metrics-produced)               | \*                 | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NETRUNTIME`  | [OpenTelemetry.Instrumentation.Runtime](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Runtime)                                                                                                          | [Runtime metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Runtime-1.19.0/src/OpenTelemetry.Instrumentation.Runtime/README.md#metrics)                             | \*                 | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NPGSQL`      | [Npgsql](https://www.nuget.org/packages/Npgsql) **.NET Framework ではサポートされていません**                                                                                                                          | [Npgsql metrics](https://www.npgsql.org/doc/diagnostics/metrics.html)                                                                                                                                         | ≥6.0.0             | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS` | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                                              | [NServiceBus metrics](https://docs.particular.net/samples/open-telemetry/prometheus-grafana/#reporting-metric-values)                                                                                         | ≥8.0.0 & < 10.0.0  | ソースおよびバイトコード | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`     | [OpenTelemetry.Instrumentation.Process](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Process)                                                                                                          | [Process metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Process-1.19.0-rc.1/src/OpenTelemetry.Instrumentation.Process/README.md#metrics)                        | \*                 | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `QUARTZ`      | [Quartz](https://www.nuget.org/packages/Quartz) **.NET 10+ でのみサポートされます**                                                                                                                                    | [Quartz metrics](https://www.quartz-scheduler.net/documentation/quartz-4.x/packages/opentelemetry-integration.html#metrics)                                                                                   | ≥4.0.0             | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `SQLCLIENT`   | [Microsoft.Data.SqlClient](https://www.nuget.org/packages/Microsoft.Data.SqlClient)、[System.Data.SqlClient](https://www.nuget.org/packages/System.Data.SqlClient) \[2\] および `System.Data`（.NET Framework に同梱） | [SqlClient metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/releases/tag/Instrumentation.SqlClient-1.19.0)                                                                             | \* \[3\]           | ソース                   | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: ASP.NET メトリクスは、`AspNet` トレース計装も有効な場合にのみ生成されます。

\[2\]: `System.Data.SqlClient` は[非推奨](https://www.nuget.org/packages/System.Data.SqlClient/4.9.0#readme-body-tab)です。

\[3\]: `Microsoft.Data.SqlClient` v3.\* は、[イシュー](https://github.com/open-telemetry/opentelemetry-dotnet/issues/4243)により .NET Framework ではサポートされていません。
`System.Data.SqlClient` はバージョン 4.8.5 からサポートされています。

## ログ計装 {#logs-instrumentations}

**ステータス**: [Experimental](/docs/specs/otel/versioning-and-stability)。

| ID        | 計装対象ライブラリ                                                                                                                        | サポートバージョン | 計装タイプ                     | ステータス                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------ | --------------------------------------------------------- |
| `ILOGGER` | [Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging) **.NET Framework ではサポートされていません** | ≥8.0.0 && < 12.0.0 | バイトコードまたはソース \[1\] | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `LOG4NET` | [log4net](https://www.nuget.org/packages/log4net) \[2\]                                                                                   | ≥2.0.13 && < 4.0.0 | バイトコード                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NLOG`    | [NLog](https://www.nuget.org/packages/NLog) \[2\]                                                                                         | ≥5.0.0 && < 7.0.0  | バイトコード                   | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: ASP.NET Core アプリケーションでは、環境変数 `ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` を `OpenTelemetry.AutoInstrumentation.AspNetCoreBootstrapper` に設定することで、.NET CLR プロファイラーを使用せずに `LoggingBuilder` 計装を有効にできます。

\[2\]: この計装はトレースコンテキスト注入とログブリッジの両方を提供します。

### 計装オプション {#instrumentation-options}

| 環境変数                                                                          | 説明                                                                                                                                                                                                                                                                                        | デフォルト値 | ステータス                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_ENTITYFRAMEWORKCORE_SET_DBSTATEMENT_FOR_TEXT`                   | Entity Framework Core 計装が `db.statement` 属性を通じて SQL 文を渡せるかどうかを制御します。クエリには機密情報が含まれる場合があります。`false` に設定すると、`db.statement` はストアドプロシージャの実行時のみ記録されます。                                                              | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_GRAPHQL_SET_DOCUMENT`                                           | GraphQL 計装が `graphql.document` 属性を通じて生のクエリを渡せるかどうかを制御します。クエリには機密情報が含まれる場合があります。                                                                                                                                                          | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_NPGSQL_CONTEXT_PROPAGATION`                                     | Npgsql 計装が、多重化されていないコマンドおよび Npgsql 10 の COPY 操作において `application_name` を通じて W3C traceparent を PostgreSQL に伝搬するかどうかを制御します。\[3\]                                                                                                              | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_ORACLEMDA_DATABASE_OPENTELEMETRY_TRACING`                       | Oracle Client 計装がデータベースの OpenTelemetry トレーシングを有効にし、サーバーにコンテキストを伝搬するかどうかを制御します。\[1\]                                                                                                                                                        | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_ORACLEMDA_SET_DBSTATEMENT_FOR_TEXT`                             | Oracle Client 計装が `db.statement` 属性を通じて SQL 文を渡せるかどうかを制御します。クエリには機密情報が含まれる場合があります。`false` に設定すると、`db.statement` はストアドプロシージャの実行時のみ記録されます。                                                                      | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_SQLCLIENT_SET_DBSTATEMENT_FOR_TEXT`                             | SQL Client 計装が `db.statement` 属性を通じて SQL 文を渡せるかどうかを制御します。クエリには機密情報が含まれる場合があります。`false` に設定すると、`db.statement` はストアドプロシージャの実行時のみ記録されます。**System.Data.SqlClient では .NET Framework でサポートされていません。** | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNET_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`          | HTTP ヘッダー名のカンマ区切りリスト。ASP.NET 計装は、設定されたすべてのヘッダー名に対して HTTP リクエストヘッダーの値をキャプチャします。                                                                                                                                                   |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNET_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`         | HTTP ヘッダー名のカンマ区切りリスト。ASP.NET 計装は、設定されたすべてのヘッダー名に対して HTTP レスポンスヘッダーの値をキャプチャします。**IIS クラシックモードではサポートされていません。**                                                                                               |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNETCORE_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`      | HTTP ヘッダー名のカンマ区切りリスト。ASP.NET Core 計装は、設定されたすべてのヘッダー名に対して HTTP リクエストヘッダーの値をキャプチャします。                                                                                                                                              |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ASPNETCORE_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`     | HTTP ヘッダー名のカンマ区切りリスト。ASP.NET Core 計装は、設定されたすべてのヘッダー名に対して HTTP レスポンスヘッダーの値をキャプチャします。                                                                                                                                              |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_CAPTURE_REQUEST_METADATA`  | gRPC メタデータ名のカンマ区切りリスト。Grpc.Net.Client 計装は、設定されたすべてのメタデータ名に対して gRPC リクエストメタデータの値をキャプチャします。                                                                                                                                     |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_GRPCNETCLIENT_INSTRUMENTATION_CAPTURE_RESPONSE_METADATA` | gRPC メタデータ名のカンマ区切りリスト。Grpc.Net.Client 計装は、設定されたすべてのメタデータ名に対して gRPC レスポンスメタデータの値をキャプチャします。                                                                                                                                     |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_HTTP_INSTRUMENTATION_CAPTURE_REQUEST_HEADERS`            | HTTP ヘッダー名のカンマ区切りリスト。HTTP Client 計装は、設定されたすべてのヘッダー名に対して HTTP リクエストヘッダーの値をキャプチャします。                                                                                                                                               |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_HTTP_INSTRUMENTATION_CAPTURE_RESPONSE_HEADERS`           | HTTP ヘッダー名のカンマ区切りリスト。HTTP Client 計装は、設定されたすべてのヘッダー名に対して HTTP レスポンスヘッダーの値をキャプチャします。                                                                                                                                               |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_ASPNETCORE_DISABLE_URL_QUERY_REDACTION`                 | ASP.NET Core 計装が `url.query` 属性値のリダクションを無効にするかどうかを制御します。                                                                                                                                                                                                      | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_HTTPCLIENT_DISABLE_URL_QUERY_REDACTION`                 | HTTP Client 計装が `url.full` 属性値のリダクションを無効にするかどうかを制御します。                                                                                                                                                                                                        | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_ASPNET_DISABLE_URL_QUERY_REDACTION`                     | ASP.NET 計装が `url.query` 属性値のリダクションを無効にするかどうかを制御します。                                                                                                                                                                                                           | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_EXPERIMENTAL_SQLCLIENT_ENABLE_TRACE_CONTEXT_PROPAGATION`             | .NET Framework のみ。`SQLCLIENT` 計装が SQL Server へのコンテキスト伝搬を有効にするかどうかを制御します。                                                                                                                                                                                   | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_SQLCLIENT_NETFX_ILREWRITE_ENABLED`                              | \[2\]                                                                                                                                                                                                                                                                                       | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: この機能はパッケージ `23.26.200` 以降でのみサポートされています。
Oracle AI Database 26ai サーバーも必要です。

\[2\]: .NET Framework 上の `SqlCommand` の IL リライトを有効にし、`SqlClient` 計装で `db.query.text` および `db.query.summary` が設定されるために必要な `CommandText` が利用可能であることを保証します。
以前は `CommandText` はストアドプロシージャに対してのみ利用可能でした。
この設定を有効にすると、生のクエリに対しても利用可能になります。
これにより [`SqlEventSource`](https://github.com/dotnet/SqlClient/blob/v1.0.19239.1/src/Microsoft.Data.SqlClient/netfx/src/Microsoft/Data/SqlClient/SqlCommand.cs#L6369) が発行するイベントの動作が変更されます。
このメカニズムが使用されている場合、アプリケーションの他の部分に影響を与える可能性があります。

\[3\]: OpenTelemetry Collector Contrib の PostgreSQL レシーバーは、この値を [`db.server.query_sample` イベント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/42f949127580c0d00088b785cd0b35842dc0ddb8/receiver/postgresqlreceiver/metadata.yaml)上の `postgresql.application_name` として公開します。
クエリサンプルの収集はデフォルトで無効であり、`pg_monitor` が必要です。[固定バージョンのレシーバー設定](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/42f949127580c0d00088b785cd0b35842dc0ddb8/receiver/postgresqlreceiver/README.md)を参照してください。
伝搬は、トレース対象の各操作の前に Npgsql の同期的な [`ExecuteInternalCommand` パス](https://github.com/npgsql/npgsql/blob/d3768398c17877b3a916c3c4d87e8e11698991fc/src/Npgsql/Internal/NpgsqlConnector.cs#L2864-L2875)を通じて `SET application_name` を実行します。
Npgsql はそのコマンドをフラッシュし、`CommandComplete` と `ReadyForQuery` のレスポンスを待つため、伝搬はトレース対象の操作ごとにデータベースとの 1 回のラウンドトリップを追加します。
アプリケーションの SQL を変更、接頭辞付与、結合することはありません。
Npgsql がユーザーアクションを終了する際、コネクターをまだ所有している間に、計装は同じパスを通じて `RESET application_name` を実行します。
これにより、伝搬された操作ごとに 1 回のクリーンアップラウンドトリップが追加され、呼び出し元に制御が戻るかコネクターが別の操作に使用される前に、接続が開かれたときに設定されたセッションデフォルトに値がリセットされます。
PostgreSQL の [`RESET`](https://www.postgresql.org/docs/18/sql-reset.html) は `SET` で後から割り当てられた値を復元しないため、このオプションを有効にすると、実行時にアプリケーションコードが `application_name` に対して行った変更が上書きされる可能性があります。
Npgsql の [`EndUserAction` ライフサイクル](https://github.com/npgsql/npgsql/blob/d3768398c17877b3a916c3c4d87e8e11698991fc/src/Npgsql/Internal/NpgsqlConnector.cs#L2687-L2724)を参照してください。
これらの内部コマンドは PostgreSQL の Simple Query フローを使用し、以前の名前なしステートメントとポータルを破棄します。Npgsql の明示的に準備されたステートメントと自動的に準備されたステートメントは名前付きであり、物理接続に関連付けられたままです。
PostgreSQL の[拡張クエリプロトコルのルール](https://www.postgresql.org/docs/17/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY)および Npgsql の[プリペアドステートメントのドキュメント](https://www.npgsql.org/doc/prepare.html)を参照してください。
`SET` と `RESET` は実際の PostgreSQL ステートメントであるため、短い実行中にポーリングしているオブザーバーが理論的にそれらをサンプリングする可能性があります。
トランザクションが失敗した状態の間はクリーンアップが遅延され、最初に `ROLLBACK` が実行できるようにした後、リカバリーアクションが正常に終了したときに実行されます。
Npgsql 10+ の COPY 操作は、[`TraceCopyStart` ライフサイクル](https://github.com/npgsql/npgsql/blob/d3768398c17877b3a916c3c4d87e8e11698991fc/src/Npgsql/Internal/NpgsqlConnector.cs#L2964-L2980)を通じてカバーされます。
多重化はサポートされていません。`application_name` は物理セッションの状態であり、Npgsql は 1 回の[多重化ループ](https://github.com/npgsql/npgsql/blob/d3768398c17877b3a916c3c4d87e8e11698991fc/src/Npgsql/MultiplexingDataSource.cs#L176-L199)で同じコネクターに複数の論理コマンドを書き込むことができます。
計装は多重化されたコネクターを検出すると、安全に伝搬をスキップし、警告を 1 回ログに記録します。

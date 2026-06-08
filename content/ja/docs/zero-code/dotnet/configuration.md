---
title: 構成と設定
linkTitle: 構成
description: .NET の自動計装の構成と設定
aliases: [/docs/languages/net/automatic/config]
weight: 20
default_lang_commit: c6ba3e413b9c48ff4f4dc44b4e4f8e1eae1f330b
# prettier-ignore
cSpell:ignore: AZUREAPPSERVICE CLSID CORECLR dylib ILREWRITE LOGRECORD NETFX OPERATINGSYSTEM PROCESSRUNTIME SQLCLIENT UNHANDLEDEXCEPTION
---

## 構成方法 {#configuration-methods}

以下の方法で構成設定を適用または編集できます。
環境変数は `App.config` や `Web.config` ファイルよりも優先されます。

1. 環境変数

   環境変数は設定を構成する主な方法です。

2. `App.config` または `Web.config` ファイル

   .NET Framework 上で動作するアプリケーションの場合、Web 構成ファイル（`web.config`）やアプリケーション構成ファイル（`app.config`）を使用して `OTEL_*` 設定を構成できます。

   ⚠️ `App.config` や `Web.config` を使用して設定できるのは、`OTEL_` で始まる設定のみです。
   ただし、以下の設定はサポートされていません。
   - `OTEL_DOTNET_AUTO_HOME`
   - `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`
   - `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_{INSTRUMENTATION_ID}_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_LOG_DIRECTORY`
   - `OTEL_LOG_LEVEL`
   - `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`（非推奨）
   - `OTEL_DOTNET_AUTO_REDIRECT_ENABLED`
   - `OTEL_DOTNET_AUTO_SQLCLIENT_NETFX_ILREWRITE_ENABLED`

   `OTEL_SERVICE_NAME` の設定例:

   ```xml
   <configuration>
   <appSettings>
       <add key="OTEL_SERVICE_NAME" value="my-service-name" />
   </appSettings>
   </configuration>
   ```

   > [!NOTE]
   >
   > .NET Framework では、`Web.config` や `App.config` の `OTEL_*` 値は起動時にプロセスレベルの環境変数に昇格され、OTel SDK はプロセスごとに一度だけ初期化されます。
   > IIS では複数のアプリケーションが単一のワーカープロセス（アプリケーションプール）を共有できるため、最初に起動したアプリケーションがそのプール内のすべてのアプリケーションの構成を決定します。

3. サービス名の自動検出

   サービス名が明示的に構成されていない場合、自動的に生成されます。
   これはいくつかの状況で役立ちます。
   - アプリケーションが .NET Framework の IIS 上でホストされている場合、`SiteName\VirtualPath`（例: `MySite\MyApp`）になります。
   - それ以外の場合は、アプリケーションの [entry Assembly](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.getentryassembly?view=net-7.0) の名前が使用されます。

デフォルトでは、構成に環境変数を使用することを推奨します。
ただし、特定の設定がサポートしている場合は次のようにします。

- ASP.NET アプリケーション（.NET Framework）の構成には `Web.config` を使用します。
- Windows サービス（.NET Framework）の構成には `App.config` を使用します。

## グローバル設定 {#global-settings}

| 環境変数                             | 説明                                                                                                                                                                                                                       | デフォルト値 | ステータス                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_HOME`              | インストール場所。                                                                                                                                                                                                         |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` | プロファイラーが計装できない実行ファイルの名前。カンマ区切りで複数の値をサポートします（例: `ReservedProcess.exe,powershell.exe`）。未設定の場合、プロファイラーはデフォルトですべてのプロセスにアタッチします。\[1\]\[2\] |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` | 自動計装が実行できない場合にプロセスをフェイルさせる機能を有効にします。デバッグ目的で設計されています。本番環境では使用しないでください。\[1\]                                                                            | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\] `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` が `true` に設定されている場合、`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` によって計装から除外されたプロセスは、サイレントに続行するかわりにフェイルします。

\[2\] `dotnet MyApp.dll` で起動されたアプリケーションのプロセス名は `dotnet` または `dotnet.exe` であることに注意してください。

## リソース {#resources}

リソースは、テレメトリーを生成しているエンティティの不変の表現です。
詳細については、[リソースのセマンティック規約](/docs/specs/semconv/resource/)を参照してください。

### リソース属性 {#resource-attributes}

| 環境変数                   | 説明                                                                                                                                                                                              | デフォルト値                                                                                                                                          | ステータス                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `OTEL_RESOURCE_ATTRIBUTES` | リソース属性として使用されるキーバリューペア。詳細については、[Resource SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable) を参照してください。      | 詳細については、[リソースのセマンティック規約](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)を参照してください。 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SERVICE_NAME`        | [`service.name`](/docs/specs/semconv/resource/#service) リソース属性の値を設定します。`OTEL_RESOURCE_ATTRIBUTES` で `service.name` が指定されている場合、`OTEL_SERVICE_NAME` の値が優先されます。 | 「構成方法」セクションの[サービス名の自動検出](#configuration-methods)を参照してください。                                                            | [Stable](/docs/specs/otel/versioning-and-stability) |

### リソースディテクター {#resource-detectors}

| 環境変数                                         | 説明                                                                                                                                                                                        | デフォルト値 | ステータス                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`     | すべてのリソースディテクターを有効にします。                                                                                                                                                | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_{0}_RESOURCE_DETECTOR_ENABLED` | 特定のリソースディテクターを有効にするための構成パターン。`{0}` は有効にしたいリソースディテクターの大文字の ID です。`OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED` をオーバーライドします。 | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |

以下のリソースディテクターがデフォルトで組み込まれ、有効になっています。

| ID                | 説明                           | ドキュメント                                                                                                                                                                                                                                        | ステータス                                                |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `AZUREAPPSERVICE` | Azure App Service ディテクター | [Azure リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Azure-1.15.1-beta.1/src/OpenTelemetry.Resources.Azure/README.md)                                                           | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `CONTAINER`       | Container ディテクター         | [Container リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Container-1.15.1-beta.1/src/OpenTelemetry.Resources.Container/README.md) **.NET Framework ではサポートされていません** | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `HOST`            | Host ディテクター              | [Host リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Host-1.15.1-beta.1/src/OpenTelemetry.Resources.Host/README.md)                                                              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OPERATINGSYSTEM` | Operating System ディテクター  | [Operating System リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.OperatingSystem-1.15.1-beta.1/src/OpenTelemetry.Resources.OperatingSystem/README.md)                            | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`         | Process ディテクター           | [Process リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.Process-1.15.1-beta.1/src/OpenTelemetry.Resources.Process/README.md)                                                     | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESSRUNTIME`  | Process Runtime ディテクター   | [Process Runtime リソースディテクターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Resources.ProcessRuntime-1.15.1-beta.1/src/OpenTelemetry.Resources.ProcessRuntime/README.md)                               | [Experimental](/docs/specs/otel/versioning-and-stability) |

## プロパゲーター {#propagators}

プロパゲーターはアプリケーション間でコンテキストを共有できるようにします。
詳細については、[OpenTelemetry 仕様](/docs/specs/otel/context/api-propagators)を参照してください。

| 環境変数           | 説明                                                                                                                                                                                                                                                                                                                  | デフォルト値           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `OTEL_PROPAGATORS` | カンマ区切りのプロパゲーターのリスト。サポートされるオプション: `tracecontext`、`baggage`、`b3multi`、`b3`。詳細については、[OpenTelemetry 仕様](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/sdk-environment-variables.md#general-sdk-configuration)を参照してください。 | `tracecontext,baggage` |

## サンプラー {#samplers}

サンプラーを使用すると、収集およびエクスポートするトレースを選択することで、OpenTelemetry の計装によって発生する潜在的なノイズやオーバーヘッドを制御できます。
詳細については、[OpenTelemetry 仕様](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)を参照してください。

| 環境変数                  | 説明                                         | デフォルト値            | ステータス                                          |
| ------------------------- | -------------------------------------------- | ----------------------- | --------------------------------------------------- |
| `OTEL_TRACES_SAMPLER`     | トレースに使用するサンプラー \[1\]           | `parentbased_always_on` | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_TRACES_SAMPLER_ARG` | サンプラーの引数として使用する文字列値 \[2\] |                         | [Stable](/docs/specs/otel/versioning-and-stability) |

\[1\]: サポートされる値:

- `always_on`
- `always_off`
- `traceidratio`
- `parentbased_always_on`
- `parentbased_always_off`
- `parentbased_traceidratio`

\[2\]: `traceidratio` および `parentbased_traceidratio` サンプラーの場合: サンプリング確率。[0..1] の範囲の数値です（例: "0.25"）。
デフォルトは 1.0 です。

## エクスポーター {#exporters}

エクスポーターはテレメトリーを出力します。

| 環境変数                | 説明                                                                                                      | デフォルト値 | ステータス                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `OTEL_TRACES_EXPORTER`  | カンマ区切りのエクスポーターのリスト。サポートされるオプション: `otlp`、`zipkin` [1]、`console`、`none`。 | `otlp`       | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRICS_EXPORTER` | カンマ区切りのエクスポーターのリスト。サポートされるオプション: `otlp`、`prometheus`、`console`、`none`。 | `otlp`       | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGS_EXPORTER`    | カンマ区切りのエクスポーターのリスト。サポートされるオプション: `otlp`、`console`、`none`。               | `otlp`       | [Stable](/docs/specs/otel/versioning-and-stability) |

**[1]**: `zipkin` は非推奨であり、今後のリリースで削除されます。

### トレースエクスポーター {#traces-exporter}

| 環境変数                         | 説明                                                                   | デフォルト値 | ステータス                                          |
| -------------------------------- | ---------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `OTEL_BSP_SCHEDULE_DELAY`        | 2 回の連続エクスポート間の遅延間隔（ミリ秒）。                         | `5000`       | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_EXPORT_TIMEOUT`        | データのエクスポートに許可される最大時間（ミリ秒）。                   | `30000`      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_QUEUE_SIZE`        | 最大キューサイズ。                                                     | `2048`       | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | 最大バッチサイズ。`OTEL_BSP_MAX_QUEUE_SIZE` 以下である必要があります。 | `512`        | [Stable](/docs/specs/otel/versioning-and-stability) |

### メトリクスエクスポーター {#metrics-exporter}

| 環境変数                      | 説明                                                 | デフォルト値                                                            | ステータス                                          |
| ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| `OTEL_METRIC_EXPORT_INTERVAL` | 2 回のエクスポート試行の開始間の時間間隔（ミリ秒）。 | OTLP エクスポーターの場合 `60000`、console エクスポーターの場合 `10000` | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_METRIC_EXPORT_TIMEOUT`  | データのエクスポートに許可される最大時間（ミリ秒）。 | OTLP エクスポーターの場合 `30000`、console エクスポーターの場合なし     | [Stable](/docs/specs/otel/versioning-and-stability) |

### ログエクスポーター {#logs-exporter}

| 環境変数                                          | 説明                                                 | デフォルト値 | ステータス                                                |
| ------------------------------------------------- | ---------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE` | フォーマットされたログメッセージを設定するかどうか。 | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |

### OTLP {#otlp}

**ステータス**: [Stable](/docs/specs/otel/versioning-and-stability)

OTLP エクスポーターを有効にするには、`OTEL_TRACES_EXPORTER`/`OTEL_METRICS_EXPORTER`/`OTEL_LOGS_EXPORTER` 環境変数を `otlp` に設定します。

環境変数を使用して OTLP エクスポーターをカスタマイズするには、[OTLP エクスポーターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.15.0/src/OpenTelemetry.Exporter.OpenTelemetryProtocol#environment-variables)を参照してください。
重要な環境変数は以下の通りです。

| 環境変数                                            | 説明                                                                                                                                                                               | デフォルト値                                                                         | ステータス                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                       | OTLP エクスポーターのターゲットエンドポイント。詳細については、[OpenTelemetry 仕様](/docs/specs/otel/protocol/exporter/)を参照してください。                                       | `http/protobuf`: `http://localhost:4318`、`grpc`: `http://localhost:4317`            | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`                | `OTEL_EXPORTER_OTLP_ENDPOINT` と同等ですが、トレースにのみ適用されます。                                                                                                           | `http/protobuf`: `http://localhost:4318/v1/traces`、`grpc`: `http://localhost:4317`  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`               | `OTEL_EXPORTER_OTLP_ENDPOINT` と同等ですが、メトリクスにのみ適用されます。                                                                                                         | `http/protobuf`: `http://localhost:4318/v1/metrics`、`grpc`: `http://localhost:4317` | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`                  | `OTEL_EXPORTER_OTLP_ENDPOINT` と同等ですが、ログにのみ適用されます。                                                                                                               | `http/protobuf`: `http://localhost:4318/v1/logs`、`grpc`: `http://localhost:4317`    | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                       | OTLP エクスポーターのトランスポートプロトコル。サポートされる値: `grpc`、`http/protobuf`。[1]                                                                                      | `http/protobuf`                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`                | `OTEL_EXPORTER_OTLP_PROTOCOL` と同等ですが、トレースにのみ適用されます。                                                                                                           | `http/protobuf`                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`               | `OTEL_EXPORTER_OTLP_PROTOCOL` と同等ですが、メトリクスにのみ適用されます。                                                                                                         | `http/protobuf`                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`                  | `OTEL_EXPORTER_OTLP_PROTOCOL` と同等ですが、ログにのみ適用されます。                                                                                                               | `http/protobuf`                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TIMEOUT`                        | バックエンドが各バッチを処理するための最大待機時間（ミリ秒）。                                                                                                                     | `10000`（10 秒）                                                                     | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`                 | `OTEL_EXPORTER_OTLP_TIMEOUT` と同等ですが、トレースにのみ適用されます。                                                                                                            | `10000`（10 秒）                                                                     | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`                | `OTEL_EXPORTER_OTLP_TIMEOUT` と同等ですが、メトリクスにのみ適用されます。                                                                                                          | `10000`（10 秒）                                                                     | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`                   | `OTEL_EXPORTER_OTLP_TIMEOUT` と同等ですが、ログにのみ適用されます。                                                                                                                | `10000`（10 秒）                                                                     | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_HEADERS`                        | 各エクスポートで送信される追加の HTTP ヘッダーのカンマ区切りリスト（例: `Authorization=secret,X-Key=Value`）。                                                                     |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`                 | `OTEL_EXPORTER_OTLP_HEADERS` と同等ですが、トレースにのみ適用されます。                                                                                                            |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`                | `OTEL_EXPORTER_OTLP_HEADERS` と同等ですが、メトリクスにのみ適用されます。                                                                                                          |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS`                   | `OTEL_EXPORTER_OTLP_HEADERS` と同等ですが、ログにのみ適用されます。                                                                                                                |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CERTIFICATE`                    | サーバーの TLS 証明書を検証するために使用する CA 証明書ファイル（PEM 形式）のパス。\[3\]                                                                                           |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`             | mTLS 認証用のクライアント証明書ファイル（PEM 形式）のパス。\[3\]                                                                                                                   |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_CLIENT_KEY`                     | mTLS 認証用のクライアント秘密鍵ファイル（PEM 形式）のパス。\[3\]                                                                                                                   |                                                                                      | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`                 | 属性値の最大許容サイズ。                                                                                                                                                           | none                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_ATTRIBUTE_COUNT_LIMIT`                        | スパン属性の最大許容数。                                                                                                                                                           | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`            | 属性値の最大許容サイズ。[メトリクスには適用されません。](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits) | none                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`                   | スパン属性の最大許容数。[メトリクスには適用されません。](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits) | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_EVENT_COUNT_LIMIT`                       | スパンイベントの最大許容数。                                                                                                                                                       | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_SPAN_LINK_COUNT_LIMIT`                        | スパンリンクの最大許容数。                                                                                                                                                         | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT`                  | スパンイベントあたりの属性の最大許容数。                                                                                                                                           | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LINK_ATTRIBUTE_COUNT_LIMIT`                   | スパンリンクあたりの属性の最大許容数。                                                                                                                                             | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT`       | ログレコード属性値の最大許容サイズ。                                                                                                                                               | none                                                                                 | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT`              | ログレコード属性の最大許容数。                                                                                                                                                     | 128                                                                                  | [Stable](/docs/specs/otel/versioning-and-stability) |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | 計装の種類に基づいて使用する集約のテンポラリティ。[2]                                                                                                                              | `cumulative`                                                                         | [Stable](/docs/specs/otel/versioning-and-stability) |

**[1]**: `OTEL_EXPORTER_OTLP_PROTOCOL` に関する考慮事項:

- OpenTelemetry .NET 自動計装のデフォルトは `http/protobuf` であり、OpenTelemetry .NET SDK のデフォルト値 `grpc` とは異なります。
- .NET 8 以上では、`grpc` OTLP エクスポータープロトコルを使用するためにアプリケーションが [`Grpc.Net.Client`](https://www.nuget.org/packages/Grpc.Net.Client/) を参照する必要があります。
  たとえば、`.csproj` ファイルに `<PackageReference Include="Grpc.Net.Client" Version="2.65.0" />` を追加します。
- .NET Framework では、`grpc` OTLP エクスポータープロトコルはサポートされていません。

**[2]**: `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` で認識される値（大文字小文字を区別しない）:

- `Cumulative`: すべての計装の種類に対して累積集約テンポラリティを選択します。
- `Delta`: Counter、Asynchronous Counter、Histogram の計装の種類に対して Delta 集約テンポラリティを選択し、UpDownCounter と Asynchronous UpDownCounter の計装の種類に対しては Cumulative 集約を選択します。
- `LowMemory`: この構成は、Synchronous Counter と Histogram に対して Delta 集約テンポラリティを使用し、Synchronous UpDownCounter、Asynchronous Counter、Asynchronous UpDownCounter の計装の種類に対しては Cumulative 集約テンポラリティを使用します。
  - ⚠️ [仕様](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.35.0/specification/metrics/sdk_exporters/otlp.md?plain=1#L48)で知られるこの値はサポートされていません。

**[3]**: mTLS（相互 TLS）構成に関する考慮事項:

- mTLS は .NET 8.0 以上でのみサポートされます。
- すべての証明書ファイルは PEM 形式である必要があります。
- mTLS を使用する場合、`OTEL_EXPORTER_OTLP_ENDPOINT` は `https://` を使用する必要があります。
- mTLS は .NET Framework ではサポートされていません。

### Prometheus {#prometheus}

**ステータス**: [Experimental](/docs/specs/otel/versioning-and-stability)

> [!WARNING] 警告: **本番環境では使用しないでください**
>
> Prometheus エクスポーターは内部開発ループ向けです。
> 本番環境では、OTLP エクスポーターと [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector-releases) の組み合わせを使用できます。
> Collector には [`otlp` レシーバー](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.97.0/receiver/otlpreceiver)と [`prometheus` エクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.97.0/exporter/prometheusexporter)を設定します。

Prometheus エクスポーターを有効にするには、`OTEL_METRICS_EXPORTER` 環境変数を `prometheus` に設定します。

エクスポーターは `http://localhost:9464/metrics` でメトリクスの HTTP エンドポイントを公開し、レスポンスを 300 ミリ秒間キャッシュします。

詳細については、[Prometheus Exporter HttpListener のドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet/tree/coreunstable-1.15.0-beta.1/src/OpenTelemetry.Exporter.Prometheus.HttpListener)を参照してください。

### Zipkin {#zipkin}

**ステータス**: [Stable](/docs/specs/otel/versioning-and-stability)

Zipkin エクスポーターを有効にするには、`OTEL_TRACES_EXPORTER` 環境変数を `zipkin` に設定します。

環境変数を使用して Zipkin エクスポーターをカスタマイズするには、[Zipkin エクスポーターのドキュメント](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.15.0/src/OpenTelemetry.Exporter.Zipkin#configuration-using-environment-variables)を参照してください。
重要な環境変数は以下の通りです。

| 環境変数                        | 説明       | デフォルト値                         | ステータス                                          |
| ------------------------------- | ---------- | ------------------------------------ | --------------------------------------------------- |
| `OTEL_EXPORTER_ZIPKIN_ENDPOINT` | Zipkin URL | `http://localhost:9411/api/v2/spans` | [Stable](/docs/specs/otel/versioning-and-stability) |

## 追加設定 {#additional-settings}

| 環境変数                                            | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | デフォルト値 | ステータス                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_TRACES_ENABLED`                   | トレースを有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_OPENTRACING_ENABLED`              | OpenTracing トレーサーを有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `false`      | [Deprecated](/docs/specs/otel/versioning-and-stability)   |
| `OTEL_DOTNET_AUTO_LOGS_ENABLED`                     | ログを有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ENABLED`                  | メトリクスを有効にします。                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`           | **非推奨。.NET Framework のみ。** プライマリ変数が設定されていない場合の `OTEL_DOTNET_AUTO_REDIRECT_ENABLED` のフォールバック。かわりに `OTEL_DOTNET_AUTO_REDIRECT_ENABLED` を使用してください。                                                                                                                                                                                                                                                                                        |              | [Deprecated](/docs/specs/otel/versioning-and-stability)   |
| `OTEL_DOTNET_AUTO_REDIRECT_ENABLED`                 | 自動計装で使用されるバージョン以上のバージョンへのアセンブリ参照のリダイレクトを有効にします。スタンドアロンデプロイメントのデフォルトは `true`、非スタンドアロンデプロイメント（例: NuGet パッケージデプロイメント）のデフォルトは `false` です。                                                                                                                                                                                                                                      |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`        | 起動時にトレーサーに追加される `System.Diagnostics.ActivitySource` 名のカンマ区切りリスト。手動で計装されたスパンをキャプチャするために使用します。                                                                                                                                                                                                                                                                                                                                     |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_LEGACY_SOURCES` | 起動時にトレーサーに追加されるレガシーソース名のカンマ区切りリスト。`System.Diagnostics.ActivitySource` API を使用せずに作成された `System.Diagnostics.Activity` オブジェクトをキャプチャするために使用します。                                                                                                                                                                                                                                                                         |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_FLUSH_ON_UNHANDLEDEXCEPTION`      | [AppDomain.UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.appdomain.unhandledexception) イベントが発生したときにテレメトリーデータをフラッシュするかどうかを制御します。テレメトリーデータの欠落と未処理の例外の両方が発生していると思われる場合に `true` に設定してください。                                                                                                                                                                                  | `false`      | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`       | 起動時にメーターに追加される `System.Diagnostics.Metrics.Meter` 名のカンマ区切りリスト。手動で作成されたメトリクスをキャプチャするために使用します。                                                                                                                                                                                                                                                                                                                                    |              | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_PLUGINS`                          | OTel SDK 計装プラグインタイプのコロン区切りリスト。[アセンブリ修飾名](https://docs.microsoft.com/en-us/dotnet/api/system.type.assemblyqualifiedname?view=net-6.0#system-type-assemblyqualifiedname)で指定します。_注: タイプ名にカンマが含まれる場合があるため、このリストはコロン区切りである必要があります。_ プラグインの書き方の詳細については、[plugins.md](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/plugins.md) を参照してください。 |              | [Experimental](/docs/specs/otel/versioning-and-stability) |

## RuleEngine {#ruleengine}

RuleEngine は、OpenTelemetry API、SDK、Instrumentation、Exporter アセンブリをサポートされていないシナリオに対して検証する機能であり、クラッシュするかわりにバックオフすることで OpenTelemetry の自動計装をより安定させます。
.NET 8 以上で動作します。

RuleEngine は、アプリケーションの初回実行時、またはデプロイメントが変更されたか自動計装ライブラリがアップグレードされた場合にのみ有効にしてください。
一度検証されると、アプリケーションの再起動時にルールを再検証する必要はありません。

| 環境変数                               | 説明                        | デフォルト値 | ステータス                                                |
| -------------------------------------- | --------------------------- | ------------ | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RULE_ENGINE_ENABLED` | RuleEngine を有効にします。 | `true`       | [Experimental](/docs/specs/otel/versioning-and-stability) |

## .NET CLR プロファイラー {#net-clr-profiler}

CLR はプロファイラーのセットアップに以下の環境変数を使用します。
詳細については、[.NET Runtime Profiler Loading](https://github.com/dotnet/runtime/blob/d8302cef7946be82775ba5b94a88ad8eee800714/docs/design/coreclr/profiling/Profiler%20Loading.md) を参照してください。

| .NET Framework 環境変数 | .NET 環境変数              | 説明                                                                            | 必要な値                                                                                                                                                                                                                                                                   | ステータス                                                |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `COR_ENABLE_PROFILING`  | `CORECLR_ENABLE_PROFILING` | プロファイラーを有効にします。                                                  | `1`                                                                                                                                                                                                                                                                        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER`          | `CORECLR_PROFILER`         | プロファイラーの CLSID。                                                        | `{918728DD-259F-4A6A-AC2B-B85E1B658318}`                                                                                                                                                                                                                                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH`     | `CORECLR_PROFILER_PATH`    | プロファイラーのパス。                                                          | Linux glibc の場合 `$INSTALL_DIR/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so`、Linux musl の場合 `$INSTALL_DIR/linux-musl-x64/OpenTelemetry.AutoInstrumentation.Native.so`、macOS の場合 `$INSTALL_DIR/osx-arm64/OpenTelemetry.AutoInstrumentation.Native.dylib` | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_32`  | `CORECLR_PROFILER_PATH_32` | 32 ビットプロファイラーのパス。ビット数固有のパスは汎用パスよりも優先されます。 | Windows の場合 `$INSTALL_DIR/win-x86/OpenTelemetry.AutoInstrumentation.Native.dll`                                                                                                                                                                                         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `COR_PROFILER_PATH_64`  | `CORECLR_PROFILER_PATH_64` | 64 ビットプロファイラーのパス。ビット数固有のパスは汎用パスよりも優先されます。 | Windows の場合 `$INSTALL_DIR/win-x64/OpenTelemetry.AutoInstrumentation.Native.dll`                                                                                                                                                                                         | [Experimental](/docs/specs/otel/versioning-and-stability) |

OpenTelemetry .NET 自動計装を .NET CLR プロファイラーとして設定することは、.NET Framework では必須です。

.NET では、.NET CLR プロファイラーはバイトコード計装にのみ使用されます。
ソース計装のみで十分な場合は、以下の環境変数を解除または削除できます。

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

## .NET ランタイム {#net-runtime}

.NET では、.NET CLR プロファイラーが使用されない場合、[`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md) 環境変数を設定する必要があります。

[`DOTNET_ADDITIONAL_DEPS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/additional-deps.md) と [`DOTNET_SHARED_STORE`](https://docs.microsoft.com/en-us/dotnet/core/deploying/runtime-store) 環境変数は、.NET でのアセンブリバージョンの競合を軽減するために使用されます。

| 環境変数                 | 必要な値                                                             | ステータス                                                |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `DOTNET_STARTUP_HOOKS`   | `$INSTALL_DIR/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll` | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_ADDITIONAL_DEPS` | `$INSTALL_DIR/AdditionalDeps`                                        | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `DOTNET_SHARED_STORE`    | `$INSTALL_DIR/store`                                                 | [Experimental](/docs/specs/otel/versioning-and-stability) |

.NET CLR プロファイラーが使用されており、[`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md) 環境変数が設定されていない場合、プロファイラーは `OpenTelemetry.AutoInstrumentation.Native.dll` ファイルの場所を基準に適切なディレクトリで `OpenTelemetry.AutoInstrumentation.StartupHook.dll` を探します。
フォルダー構造は ZIP アーカイブ構造または NuGet パッケージ構造（プラットフォーム依存またはプラットフォーム非依存）と一致させることができます。
スタートアップフックアセンブリが見つからない場合、プロファイラーの読み込みは中断されます。

## 内部ログ {#internal-logs}

内部ログのデフォルトのディレクトリパスは以下の通りです。

- Windows: `%ProgramData%\OpenTelemetry .NET AutoInstrumentation\logs`
- Linux: `/var/log/opentelemetry/dotnet`
- macOS: `/var/log/opentelemetry/dotnet`

デフォルトのログディレクトリを作成できない場合、計装は現在のユーザーの[一時フォルダー](https://docs.microsoft.com/en-us/dotnet/api/System.IO.Path.GetTempPath?view=net-6.0)のパスをかわりに使用します。

| 環境変数                         | 説明                                                                                  | デフォルト値                             | ステータス                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOG_DIRECTORY` | .NET Tracer ログのディレクトリ。                                                      | _デフォルトパスに関する前述の注記を参照_ | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_LOG_LEVEL`                 | SDK のログレベル。（サポートされる値: `none`、`error`、`warn`、`info`、`debug`）      | `info`                                   | [Stable](/docs/specs/otel/versioning-and-stability)       |
| `OTEL_DOTNET_AUTO_LOGGER`        | AutoInstrumentation 診断ログのシンク。（サポートされる値: `none`、`file`、`console`） | `file`                                   | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOG_FILE_SIZE` | Auto Instrumentation が作成する単一のログファイルの最大サイズ（バイト）               | 10 485 760（10 MB）                      | [Experimental](/docs/specs/otel/versioning-and-stability) |

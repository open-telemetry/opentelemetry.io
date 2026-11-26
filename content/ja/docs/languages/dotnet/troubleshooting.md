---
title: トラブルシューティング
description: OpenTelemetry .NET のトラブルシューティング方法を学ぶ
weight: 100
default_lang_commit: 820ce0e5f9c942912b85fad25b6ec8ff424bf73f
cSpell:ignore: appsettings Blazor knownsafe LOCALAPPDATA
---

OpenTelemetry .NET リポジトリ（[opentelemetry-dotnet][] および [opentelemetry-dotnet-contrib][]）から提供されるすべてのコンポーネントは、ドロップされた測定値、拒否された設定、失敗したエクスポートなどの内部状態を [EventSource](https://learn.microsoft.com/dotnet/api/system.diagnostics.tracing.eventsource) を通じて報告します。
`EventSource` の名前はすべて `OpenTelemetry-` で始まります。
たとえば、`OpenTelemetry-Sdk`、`OpenTelemetry-Api`、`OpenTelemetry-Exporter-OpenTelemetryProtocol` などです。

## 自己診断 {#self-diagnostics}

これらのイベントは [PerfView](https://github.com/microsoft/perfview) や [`dotnet-trace`][] などの汎用ツールでキャプチャできますが、SDK にはすべてのイベントをサブスクライブし、ローリングログファイル、コンソール、またはその両方に読みやすいエントリを書き込む自己診断機能も含まれています。

このページでは、`OpenTelemetry` パッケージのバージョン 1.20.0 から利用可能な `SelfDiagnosticsOptions` による自己診断の設定について説明します。
`appsettings.json` からの自動バインドにはバージョン 1.21.0 以降が必要です。
詳細なリファレンスについては、opentelemetry-dotnet リポジトリの[自己診断ドキュメント][reference]を参照してください。

> [!IMPORTANT]
>
> 自己診断は SDK 自体を診断するものです。
> テレメトリーパイプラインではなく、エントリがエクスポートされたり OpenTelemetry のログレコードに変換されたりすることはありません。
> アプリケーションログには `ILogger` とエクスポーターを使用してください。

自己診断はデフォルトで無効です。
_シンク_ と呼ばれる出力を少なくとも1つ有効にするまで、何も書き込まれません。
Blazor WebAssembly などのブラウザーベースのアプリではサポートされていません。

[.NET 自動計装](/docs/zero-code/dotnet/)を使用している場合は、まずその[トラブルシューティングページ](/docs/zero-code/dotnet/troubleshooting/)を参照してください。
エージェントは SDK イベントを自身のログにすでに含んでいます。

## 環境変数による有効化 {#enable-with-environment-variables}

環境変数を使用すればコード変更は不要です。
プロセスの開始前に設定してください。

任意のディレクトリにローリングログファイルを書き込みます。
ディレクトリを設定するだけでファイル出力が有効になり、ディレクトリが存在しない場合は作成されます。

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY=./otel-logs
```

```powershell
$env:OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY = "C:\otel-logs"
```

プラットフォームの[デフォルトログディレクトリ](#default-log-directory)にローリングログファイルを書き込みます。

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=file
```

`Debug` エントリを含めてコンソールに書き込みます。

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=stdout,stderr
export OTEL_LOG_LEVEL=debug
```

他の環境変数で有効にした出力をオフにします。

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=none
```

> [!TIP]
>
> デフォルトレベルの `Warning` は、本番環境で常時有効にしておいても安全なように設計されています。
> 問題を調査する場合のみ `Debug` に下げてください。

`OTEL_LOG_LEVEL` はレベルのみを設定します。
これだけでは出力は生成されません。

## appsettings.json による有効化 {#enable-with-appsettingsjson}

SDK はアプリケーション設定から `OpenTelemetry:SelfDiagnostics` セクションを自動的に読み取ります。
`appsettings.json` を読み込むアプリでは、以下のいずれかの設定を追加します。

```json
{
  "OpenTelemetry": {
    "SelfDiagnostics": {
      "MinimumLevel": "Debug",
      "LogDirectory": "/var/log/otel",
      "FileSizeLimitKilobytes": 4096,
      "MaxRetainedFiles": 5
    }
  }
}
```

設定がリロードをサポートしている場合（デフォルトの .NET ホストにおける `appsettings.json` のように）、変更は再起動なしで実行中のプロセスに適用されます。
これにより、インシデント中に `Debug` に切り替え、その後元に戻すことができます。
環境変数の変更には常に再起動が必要です。

設定が複数の場所で定義されている場合、通常の .NET 設定の優先順位が適用されます。
デフォルトのホストでは、環境変数が `appsettings.json` を上書きし、コマンドライン引数が両方を上書きします。
コードでの設定はこれらすべてを上書きします。

> [!WARNING]
>
> `"MinimumLevel": "NotALevel"` のような無効な値は、設定の読み込みまたはリロード時にエラーを引き起こします。
> SDK が最後の有効な設定を保持することは保証されないため、実行中のアプリケーションの設定を保存する前に値を確認してください。

## コードによる有効化 {#enable-with-code}

標準の .NET オプションパターンを使用して `SelfDiagnosticsOptions` を設定します。
コードでの設定は環境変数および設定ファイルよりも優先されます。

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry.SelfDiagnostics;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<SelfDiagnosticsOptions>(options =>
{
    options.MinimumLevel = LogLevel.Debug;
    options.LogDirectory = SelfDiagnosticsOptions.GetDefaultLogDirectory()
        ?? "/var/log/otel";
});

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddOtlpExporter());
```

`Sdk.CreateTracerProviderBuilder()` や他の `Sdk.Create*ProviderBuilder()` メソッドでプロバイダーをビルドする場合は、`ConfigureServices` 内で同じ `Configure` 呼び出しを行ってください。
自己診断の設定はプロセス全体に適用されるため、一度だけ設定してください。

## 設定 {#settings}

| オプション               | 環境変数                                     | デフォルト        | 説明                                                                                                     |
| ------------------------ | -------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `MinimumLevel`           | `OTEL_LOG_LEVEL`                             | `Warning`         | キャプチャされる最低レベル。[ログレベル](#log-levels)を参照。                                            |
| `LogDirectory`           | `OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY` | 未設定            | ログファイルのディレクトリ。設定するとファイル出力が有効になる。                                         |
| `LogToStdout`            | `OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS`         | `false`           | 標準出力にエントリを書き込む。                                                                           |
| `LogToStderr`            | `OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS`         | `false`           | 標準エラーにエントリを書き込む。両方のコンソールオプションが有効な場合、`Error` 以上がここに出力される。 |
| `FileSizeLimitKilobytes` | なし                                         | `10240`（10 MiB） | 新しいログファイルを開始するサイズ。`0` 以下の場合、サイズ制限なしの単一ファイルになる。                 |
| `MaxRetainedFiles`       | なし                                         | `10`              | 最も古いファイルが削除されるまでに保持されるログファイル数。`0` 以下の場合、すべてのファイルを保持する。 |
| `EnvironmentVariables`   | `OTEL_DOTNET_SELF_DIAGNOSTICS_ENV_VARS`      | `KnownSafeValues` | `OTEL_*` 環境変数がどの程度各ログファイルに書き込まれるか。[機密データ](#sensitive-data)を参照。         |

`OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS` は、`file`、`stdout`、`stderr`、`console`（`stdout,stderr` の略）、または `none` のカンマ区切りリストを受け取ります。
リストに `file` が含まれていない場合、ログディレクトリが設定されていてもファイルは書き込まれません。
これにより、デプロイメントがすべてのサービスにログディレクトリを設定している場合でも、個々のサービスがオプトアウトできます。

### デフォルトログディレクトリ {#default-log-directory}

`OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=file` でログディレクトリが未設定の場合、SDK は昇格された権限を必要としないユーザーごとのディレクトリに書き込みます。

| プラットフォーム    | デフォルトパス                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Windows             | `%LOCALAPPDATA%\OpenTelemetry\dotnet-diagnostics`                                                                    |
| macOS               | `~/Library/Logs/OpenTelemetry/dotnet-diagnostics`                                                                    |
| Linux / その他 Unix | `$XDG_STATE_HOME/opentelemetry/dotnet-diagnostics`、未設定の場合は `~/.local/state/opentelemetry/dotnet-diagnostics` |

コード内では、`SelfDiagnosticsOptions.GetDefaultLogDirectory()` が同じパスを返します。
ユーザーごとのディレクトリが利用できない場合、ファイル出力は無効のままとなり、SDK は標準エラーに警告を書き込みます。
その場合は明示的にディレクトリを設定してください。

### ログレベル {#log-levels}

`OTEL_LOG_LEVEL` は、`error`、`warn`、`info`、`debug`、`trace`、`none` のほか、.NET の [`LogLevel`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loglevel) 名も受け付けます。
値は大文字と小文字を区別しません。
OpenTelemetry の値は `LogLevel` 名にマッピングされます。
たとえば、`warn` は `Warning` に、`info` は `Information` にマッピングされます。

デフォルトは `Warning` であり、OpenTelemetry 仕様のデフォルトである `Information` とは異なります。
低いレベルでは出力が大幅に増えますが、問題を調査するまでは通常有用ではありません。
調査時には `Debug` を使用してください。
`Debug` は読み込まれた各アセンブリとそのバージョンもログに記録するため、どのビルドが実行されているかを確認する最も手軽な方法です。

## 出力の読み方 {#reading-the-output}

### ファイルプリアンブル {#file-preamble}

各ログファイルはプロセスを説明するプリアンブルで始まるため、単一のファイルだけで有用です。
以下の例は省略されています。

```text
=== OpenTelemetry .NET SDK self-diagnostics ===
SDK version          : 1.21.0
Runtime              : .NET 10.0.0
OS                   : Ubuntu 24.04.1 LTS
Process name         : MyCompany.MyService
Log directory        : /home/app/.local/state/opentelemetry/dotnet-diagnostics
...
Environment Variables (mode: KnownSafeValues):
OTEL_EXPORTER_OTLP_ENDPOINT_TRACES = [REDACTED]
OTEL_SERVICE_NAME = my-service
OTEL_TRACES_SAMPLER = parentbased_traceidratio
=== end preamble ===
```

プリアンブルは、SDK が認識するかどうかにかかわらず、設定されているすべての `OTEL_*` 環境変数を一覧表示します。
これにより、スペルミスした名前を簡単に発見できます。
上の例では、`OTEL_EXPORTER_OTLP_ENDPOINT_TRACES` は `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` であるべきです。

環境変数の値がパースできない場合、`Configuration Warnings:` ブロックに変数名、拒否された値、受け入れ可能な値が表示されます。

コンソール出力にはログエントリのみが含まれ、プリアンブルはありません。

### ログエントリ {#log-entries}

各エントリの形式は以下のとおりです。

```text
[<timestamp>][<threadId>][<spanId>][<level>]  <message> {EventId} <traceparent>
```

例:

```text
[2026-08-06T09:14:31.4471190Z][000014][00f067][Error]       OpenTelemetry-Exporter-OpenTelemetryProtocol: Exporter failed send data to collector to https://otlp.example.com:4317 endpoint. Data will not be sent. Exception: System.Net.Http.HttpRequestException: No connection could be made because the target machine actively refused it. {EventId: 2, EventName: FailedToReachCollector} <00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01>
```

メッセージは、それを書き込んだ `EventSource` の名前で始まるため、どのコンポーネントを調べるべきかがわかります。
スパンがアクティブだった場合、エントリは [W3C `traceparent`](https://www.w3.org/TR/trace-context/#traceparent-header) で終わるため、エントリをトレースと照合できます。

ログファイルは `otel-dotnet-{pid}-{processName}-{processStartTime}-{index}.log` という名前になります。
ファイルが `FileSizeLimitKilobytes` に達すると、SDK はそのファイルを閉じて次のファイルを開始します。
ファイル数が `MaxRetainedFiles` を超えると、SDK は最も古いファイルを削除します。
この制限はプロセスの各実行ごとに個別に適用されます。
他のプロセスや同じアプリケーションの以前の実行からのファイルは削除されないため、不要になったら手動で削除してください。

## 機密データ {#sensitive-data}

ファイルプリアンブルにはプロセスの `OTEL_*` 環境変数が含まれ、その名前空間外のものは含まれません。
`EnvironmentVariables` オプション、または `OTEL_DOTNET_SELF_DIAGNOSTICS_ENV_VARS` で、表示される情報量を制御します。

| モード            | 変数値      | 表示内容                                                                             |
| ----------------- | ----------- | ------------------------------------------------------------------------------------ |
| `None`            | `none`      | 何も表示しない。                                                                     |
| `Names`           | `names`     | 変数名のみ。                                                                         |
| `KnownSafeValues` | `knownsafe` | 名前に加えて、SDK が安全と判断した値。その他の値は `[REDACTED]` となる。デフォルト。 |
| `AllValues`       | `all`       | すべての値を未編集で表示。                                                           |

`KnownSafeValues` では、エンドポイントはスキーム、ホスト、ポートに縮小され、`OTEL_RESOURCE_ATTRIBUTES` は `service.name` などの既知のキーの値のみを保持します。

`AllValues` で書き込まれたファイルはシークレットとして扱ってください。
API キーや認証ヘッダーが含まれている可能性があります。
単一の再現実行でのみ有効にし、恒久的には有効にしないでください。

Linux および macOS の .NET 10 以降では、SDK はログディレクトリとファイルを所有ユーザーのみが読み取れるように作成します。
ログシッパーなどの他のアカウントには、明示的にアクセスを許可する必要があります。

## バグレポート用のログ収集 {#collect-logs-for-a-bug-report}

`Debug` レベルの自己診断ログは、バグレポートに含める最も有用な情報の1つです。
以下の設定で再現を実行してください。

```sh
export OTEL_LOG_LEVEL=debug
export OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY=./otel-logs
```

その後、[イシューを開いて][new-issue]以下を含めてください。

- ログファイル。
- 最小限の再現手順（ある場合）。
- 期待した動作と実際に起きたこと。
- 障害のおおよその発生時刻（関連するエントリを見つけるため）。

> [!IMPORTANT]
>
> 共有する前にログを確認してください。
> 環境変数の値はデフォルトでは編集されますが、ログメッセージにはパス、エンドポイント、リソース属性、環境からの例外の詳細が含まれている可能性があります。

## OTEL_DIAGNOSTICS.json からの移行 {#migrate-from-otel_diagnosticsjson}

以前のバージョンの SDK では、プロセスの作業ディレクトリにある `OTEL_DIAGNOSTICS.json` ファイルによって自己診断が有効化されていました。
このファイルは引き続き動作しますが、非推奨であり、将来のメジャーバージョンで削除される予定です。

バージョン 1.21.0 以降、このファイルはこのページで説明されているものと同じメカニズムを使用します。
その結果:

- 出力は、単一の循環 `{executable}.{pid}.log` ファイルではなく、ローリング `otel-dotnet-*.log` ファイルに書き込まれます。
- `FormatMessage` は無視されます。
  メッセージは常にフォーマットされます。
- 環境変数、`appsettings.json`、またはコードによって他の方法で自己診断出力が設定されている場合、このファイルは無視されます。

移行するには、ファイルを削除し、設定を [`OpenTelemetry:SelfDiagnostics`](#enable-with-appsettingsjson) セクションまたは[環境変数](#enable-with-environment-variables)に移してください。

| `OTEL_DIAGNOSTICS.json` | 置き換え先                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `LogDirectory`          | `LogDirectory`                                                                           |
| `LogLevel`              | `MinimumLevel`。`Informational` は `Information` に、`Verbose` は `Debug` になる。       |
| `FileSize`              | `FileSizeLimitKilobytes` と `MaxRetainedFiles`。旧サイズはすべてのファイルの合計だった。 |

[`dotnet-trace`]: https://learn.microsoft.com/dotnet/core/diagnostics/dotnet-trace
[new-issue]: https://github.com/open-telemetry/opentelemetry-dotnet/issues/new/choose
[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet
[opentelemetry-dotnet-contrib]: https://github.com/open-telemetry/opentelemetry-dotnet-contrib
[reference]: https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/docs/troubleshooting/README.md

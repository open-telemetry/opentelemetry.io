---
title: トラブルシューティング
description: OpenTelemetry .NET のトラブルシューティング方法を学ぶ
weight: 100
default_lang_commit: 3899955672f4abc64710cad23217b76528d7a961
cSpell:ignore: eventsource
---

OpenTelemetry .NET リポジトリ（[opentelemetry-dotnet][] および [opentelemetry-dotnet-contrib][]）から提供されるすべてのコンポーネントは、内部ロギングに [EventSource](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventsource) を使用しています。
OpenTelemetry SDK が使用する `EventSource` の名前は "OpenTelemetry-Sdk" です。
他のコンポーネントが使用する `EventSource` の名前については、各コンポーネントのドキュメントを参照してください。

これらのログは [PerfView](https://github.com/microsoft/perfview) や [`dotnet-trace`][dotnet-trace] などのツールで確認できますが、SDK にはトラブルシューティングに役立つ自己診断機能も搭載されています。

## 自己診断 {#self-diagnostics}

OpenTelemetry SDK には自己診断機能が組み込まれています。
この機能を有効にすると、すべての OpenTelemetry コンポーネント（名前が "OpenTelemetry-" で始まる EventSource）が生成する内部ログをリッスンし、ログファイルに書き込みます。

自己診断機能は、プロセスの実行中に（プロセスを再起動せずに）有効化、変更、無効化できます。
SDK は10秒ごとに非排他的な読み取り専用モードで設定ファイルの読み取りを試みます。
SDK は設定に従って新しいログを含むファイルを作成または上書きします。
このファイルは設定された最大サイズを超えることはなく、循環的に上書きされます。

自己診断を有効にするには、プロセスの[作業ディレクトリ](https://en.wikipedia.org/wiki/Working_directory)に移動し、以下の内容で `OTEL_DIAGNOSTICS.json` という名前の設定ファイルを作成します。

```json
{
  "LogDirectory": ".",
  "FileSize": 32768,
  "LogLevel": "Warning",
  "FormatMessage": "true"
}
```

自己診断を無効にするには、設定ファイルを削除します。

> [!TIP]
>
> ほとんどの場合、アプリケーションと同じ場所にファイルを配置できます。
> Windows では、[Process Explorer](https://docs.microsoft.com/sysinternals/downloads/process-explorer) を使用してプロセスをダブルクリックしてプロパティダイアログを開き、"Image" タブで "Current directory" を確認できます。
>
> 内部的には、SDK は [GetCurrentDirectory](https://docs.microsoft.com/dotnet/api/system.io.directory.getcurrentdirectory) にある設定ファイルを検索し、次に [AppContext.BaseDirectory](https://docs.microsoft.com/dotnet/api/system.appcontext.basedirectory) を検索します。
> コードからこれらのメソッドを呼び出すことで、正確なディレクトリを確認することもできます。

### 設定パラメーター {#configuration-parameters}

設定ファイルは以下のパラメーターをサポートしています。

#### LogDirectory {#logdirectory}

出力ログファイルが保存されるディレクトリです。
絶対パスまたは作業ディレクトリからの相対パスを指定できます。

#### FileSize {#filesize}

ログファイルサイズを [KiB](https://en.wikipedia.org/wiki/Kibibyte) 単位で指定する正の整数です。
この値は `[1024, 131072]`（1 MiB <= サイズ <= 128 MiB）の範囲内でなければならず、範囲外の場合は最も近い上限または下限に丸められます。
ログファイルはこの設定サイズを超えることはなく、循環的に上書きされます。

#### LogLevel {#loglevel}

キャプチャされるイベントの最低レベルです。
[`EventLevel` 列挙型](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventlevel)の[値](https://docs.microsoft.com/dotnet/api/system.diagnostics.tracing.eventlevel#fields)のいずれかでなければなりません。
レベルはイベントの重大度を表します。
低い重大度レベルには、より高い重大度レベルが含まれます。
たとえば、`Warning` には `Error` と `Critical` レベルが含まれます。

#### FormatMessage {#formatmessage}

ログメッセージのプレースホルダー（`{0}`、`{1}` など）を実際のパラメーター値に置き換えてフォーマットするかどうかを制御するブール値です。
`false`（デフォルト）に設定すると、メッセージはフォーマットされていないプレースホルダーの後に生のパラメーター値が続く形式でログに記録されます。
`true` に設定すると、プレースホルダーはフォーマットされたパラメーター値に置き換えられ、可読性が向上します。

**`FormatMessage: false`（デフォルト）の例:**

```text
2025-07-24T01:45:04.1020880Z:Measurements from Instrument '{0}', Meter '{1}' will be ignored. Reason: '{2}'. Suggested action: '{3}'{dotnet.gc.collections}{System.Runtime}{Instrument belongs to a Meter not subscribed by the provider.}{Use AddMeter to add the Meter to the provider.}
```

**`FormatMessage: true` の例:**

```text
2025-07-24T01:44:44.7059260Z:Measurements from Instrument 'dotnet.gc.collections', Meter 'System.Runtime' will be ignored. Reason: 'Instrument belongs to a Meter not subscribed by the provider.'. Suggested action: 'Use AddMeter to add the Meter to the provider.'
```

### 備考 {#remarks}

指定された `LogDirectory` に `ExecutableName.ProcessId.log`（たとえば `myapp.exe.12345.log`）という名前のログファイルが生成され、そこにログが書き込まれます。

SDK が `LogDirectory`、`FileSize`、または `LogLevel` フィールドの解析に失敗した場合、設定ファイルは無効として扱われ、ログファイルは生成されません。

`LogDirectory` または `FileSize` が変更されると、SDK は新しい設定に従って新しいログを含むファイルを作成または上書きします。
設定ファイルは4 KiB以下でなければなりません。
ファイルが4 KiBより大きい場合、最初の4 KiBの内容のみが読み取られます。

ログファイルは、最小限のオーバーヘッドと限定されたリソース使用量という目標を達成するために、適切なテキストファイル形式ではない場合があります。
ログテキストが設定サイズより小さい場合、末尾に `NUL` 文字が含まれることがあります。
書き込み操作が末尾に達すると、先頭から再開して既存のテキストを上書きします。

[dotnet-trace]: https://docs.microsoft.com/dotnet/core/diagnostics/dotnet-trace
[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet
[opentelemetry-dotnet-contrib]: https://github.com/open-telemetry/opentelemetry-dotnet-contrib

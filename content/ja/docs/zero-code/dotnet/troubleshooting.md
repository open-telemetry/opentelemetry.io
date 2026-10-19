---
title: .NET 自動計装の問題のトラブルシューティング
linkTitle: トラブルシューティング
weight: 50
default_lang_commit: 2728c8fbf4f09cf3b8257a1b628a7631fc77d639
cSpell:ignore: corehost netfx pjanotti's TRACEFILE
---

## 一般的な手順 {#general-steps}

OpenTelemetry .NET 自動計装で問題が発生した場合、問題を理解するのに役立つ手順があります。

### 詳細なログの有効化 {#enable-detailed-logging}

詳細なデバッグログは計装の問題のトラブルシューティングに役立ち、調査を容易にするためにこのプロジェクトのイシューに添付できます。

OpenTelemetry .NET 自動計装から詳細なログを取得するには、計装対象のプロセスを開始する前に [`OTEL_LOG_LEVEL`](../configuration#internal-logs) 環境変数を `debug` に設定してください。

デフォルトでは、ライブラリは事前に定義された[場所](../configuration#internal-logs)にログファイルを書き込みます。
必要に応じて、`OTEL_DOTNET_AUTO_LOG_DIRECTORY` 環境変数を更新してデフォルトの場所を変更してください。

ログを取得した後、不要なオーバーヘッドを避けるために `OTEL_LOG_LEVEL` 環境変数を削除するか、より低い詳細レベルに設定してください。

### ホストトレースの有効化 {#enable-host-tracing}

[ホストトレース](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing)は、アセンブリが見つからないなど、さまざまな問題に関連する調査に必要な情報を収集するために使用できます。
以下の環境変数を設定してください。

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

その後、アプリケーションを再起動してログを収集してください。

## よくある問題 {#common-issues}

### テレメトリーが生成されない {#no-telemetry-is-produced}

テレメトリーが生成されません。
OpenTelemetry .NET 自動計装の内部ログの[場所](../configuration#internal-logs)にもログがありません。

.NET プロファイラーがアタッチできず、そのためログが出力されないことがあります。

最も一般的な原因は、計装対象のアプリケーションに OpenTelemetry .NET 自動計装のアセンブリを読み込む権限がないことです。

### 'OpenTelemetry.AutoInstrumentation.Runtime.Native' パッケージをインストールできない {#could-not-install-package-opentelemetryautoinstrumentationruntimenative}

NuGet パッケージをプロジェクトに追加する際に、以下のようなエラーメッセージが表示されます。

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.6.0'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

NuGet パッケージは古いスタイルの `csproj` プロジェクトをサポートしていません。
NuGet パッケージを使用するかわりにマシンに自動計装をデプロイするか、プロジェクトを SDK スタイルの `csproj` に移行してください。

### パフォーマンスの問題 {#performance-issues}

CPU 使用率が高くなる場合、システムスコープまたはユーザースコープで環境変数を設定して自動計装をグローバルに有効にしていないか確認してください。

システムスコープまたはユーザースコープの使用が意図的な場合は、[`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](../configuration#global-settings) 環境変数を使用して、アプリケーションを自動計装から除外してください。

### `dotnet` CLI ツールがクラッシュする {#dotnet-cli-tool-is-crashing}

`dotnet run` などでアプリを実行した際に、以下のようなエラーメッセージが表示されます。

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

バージョン `v0.6.0-beta.1` 以前では、`dotnet` CLI ツールを計装する際に問題がありました。

そのため、これらのバージョンを使用している場合は、ターミナルセッションを計装する前に `dotnet build` を実行するか、別のターミナルセッションで呼び出すことをお勧めします。

詳細については、[#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744) を参照してください。

### アセンブリバージョンの競合 {#assembly-version-conflicts}

以下のようなエラーメッセージが表示されます。

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

OpenTelemetry .NET の NuGet パッケージとその依存関係は、OpenTelemetry .NET 自動計装とともにデプロイされます。

依存関係のバージョン競合を処理するには、計装対象のアプリケーションのプロジェクト参照を更新して、OpenTelemetry .NET 自動計装と同じバージョンを使用するようにしてください。

このような競合が発生しないようにする簡単な方法は、`OpenTelemetry.AutoInstrumentation` パッケージをアプリケーションに追加することです。
アプリケーションへの追加方法については、[Using the OpenTelemetry.AutoInstrumentation NuGet packages](../nuget-packages) を参照してください。

または、競合するパッケージのみをプロジェクトに追加してください。
以下の依存関係が OpenTelemetry .NET 自動計装で使用されています。

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)
- [OpenTelemetry.AutoInstrumentation.AdditionalDeps](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/c27acd9bd0f82de47217fba660d9f979e0a0cc2d/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Build.props)

バージョンは以下の場所で確認できます。

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/f2d70bd0f095852bf0270aad61b60dfe1ea7834f/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props)

デフォルトでは、.NET Framework アプリケーションのアセンブリ参照は、実行時に自動計装で使用されるバージョンにリダイレクトされます。
この動作は [`OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`](../configuration) 設定で制御できます。

アプリケーションが自動計装で使用されるアセンブリのバインディングリダイレクトをすでに含んでいる場合、この自動リダイレクトが失敗する可能性があります。
[#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833) を参照してください。
既存のバインディングリダイレクトが [netfx_assembly_redirection.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/62b4a6a855608a925caeea95752167df5a0960a0/src/OpenTelemetry.AutoInstrumentation.Native/netfx_assembly_redirection.h) に記載されたバージョンへのリダイレクトを妨げていないか確認してください。

上記の自動リダイレクトが機能するためには、.NET Framework アプリケーションの計装に使用されるアセンブリ（インストールディレクトリの `netfx` フォルダー配下のもの）をグローバルアセンブリキャッシュ（GAC）にもインストールする必要がある、2つの特定のシナリオがあります。

1. [**モンキーパッチ計装**](https://en.wikipedia.org/wiki/Monkey_patch)：ドメインニュートラルとして読み込まれたアセンブリの場合。
2. アセンブリリダイレクト：厳密な名前付きアプリケーションで、アプリケーションが `netfx` フォルダーにも含まれる一部のアセンブリの異なるバージョンを同梱している場合。

上記のシナリオのいずれかで問題が発生している場合は、PowerShell インストールモジュールから `Install-OpenTelemetryCore` コマンドを再度実行して、必要な GAC インストールが更新されていることを確認してください。

自動計装による GAC の使用方法の詳細については、[pjanotti's comment](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814) を参照してください。

詳細については、[#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269) と [#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296) を参照してください。

### AdditionalDeps 内のアセンブリが見つからない {#assembly-in-additionaldeps-was-not-found}

#### 症状 {#symptoms}

以下のようなエラーメッセージが表示されます。

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found
```

これは以下のイシューに関連している可能性があります。

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

## その他の問題 {#other-issues}

このページに記載されていない問題が発生した場合は、[一般的な手順](#general-steps)を参照して追加の診断情報を収集してください。
これによりトラブルシューティングが容易になる可能性があります。

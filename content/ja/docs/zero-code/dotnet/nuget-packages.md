---
title: OpenTelemetry.AutoInstrumentation NuGet パッケージの使用
linkTitle: NuGet パッケージ
weight: 40
default_lang_commit: 2b0cbe123f65c6d3d6271fa5c0692fc45c574597
cSpell:ignore: buildtasks
---

以下のシナリオでは NuGet パッケージを使用してください。

1. デプロイメントの簡素化。
   たとえば、単一のアプリケーションを実行するコンテナの場合です。
1. [`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-as-self-contained) アプリケーションの計装のサポート。
1. NuGet パッケージを使用した自動計装の開発者による実験の促進。
1. アプリケーションが使用する依存関係と自動計装との間のバージョンの競合の解決。

## 制限事項 {#limitations}

NuGet パッケージは自動計装をデプロイする便利な方法ですが、すべてのケースで使用できるわけではありません。
NuGet パッケージを使用しない最も一般的な理由には、以下のものがあります。

1. アプリケーションプロジェクトにパッケージを追加できない場合。
   たとえば、アプリケーションがサードパーティ製であり、パッケージを追加できない場合です。
1. 1台のマシンに複数の計装対象アプリケーションがインストールされている場合に、ディスク使用量や仮想マシンのサイズを削減したい場合。
   この場合、そのマシン上で動作するすべての .NET アプリケーションに対して単一のデプロイメントを使用できます。
1. [SDK スタイルのプロジェクト](https://learn.microsoft.com/en-us/nuget/resources/check-project-format#check-the-project-format)に移行できないレガシーアプリケーションの場合。

## NuGet パッケージの使用 {#using-the-nuget-packages}

OpenTelemetry .NET でアプリケーションを自動計装するには、`OpenTelemetry.AutoInstrumentation` パッケージをプロジェクトに追加します。

```terminal
dotnet add [<PROJECT>] package OpenTelemetry.AutoInstrumentation
```

アプリケーションが計装可能なパッケージを参照しているものの、計装を動作させるために他のパッケージが必要な場合、ビルドが失敗し、不足している計装ライブラリを追加するか、対応するパッケージの計装をスキップするよう求められます。

```terminal
~packages/opentelemetry.autoinstrumentation.buildtasks/1.6.0/build/OpenTelemetry.AutoInstrumentation.BuildTasks.targets(29,5): error : OpenTelemetry.AutoInstrumentation: add a reference to the instrumentation package 'MongoDB.Driver.Core.Extensions.DiagnosticSources' version 1.4.0 or add 'MongoDB.Driver.Core' to the property 'SkippedInstrumentations' to suppress this error.
```

エラーを解決するには、推奨される計装ライブラリを追加するか、`SkippedInstrumentation` プロパティにリストされたパッケージを追加して計装をスキップします。
例は以下のとおりです。

```csproj
<PropertyGroup>
   <SkippedInstrumentations>MongoDB.Driver.Core;StackExchange.Redis</SkippedInstrumentations>
</PropertyGroup>
```

同じプロパティは CLI で直接指定することもできます。
区切り文字 `;` は '%3B' として適切にエスケープする必要があることに注意してください。

```powershell
dotnet build -p:SkippedInstrumentations=StackExchange.Redis%3BMongoDB.Driver.Core
```

.NET アプリケーションに適切なネイティブランタイムコンポーネントを配布するには、[ランタイム識別子（RID）](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog)を指定して `dotnet build` または `dotnet publish` でアプリケーションをビルドします。
これには、[_self-contained_ または _framework-dependent_](https://learn.microsoft.com/en-us/dotnet/core/deploying/) アプリケーションのどちらを配布するかを選択する必要があるかもしれません。
どちらのタイプも自動計装と互換性があります。

ビルドの出力フォルダーにあるスクリプトを使用して、自動計装を有効にした状態でアプリケーションを起動します。

- Windows では、`instrument.cmd <application_executable>` を使用します。
- Linux または Unix では、`instrument.sh <application_executable>` を使用します。

`dotnet` CLI を使用してアプリケーションを起動する場合は、スクリプトの後に `dotnet` を追加します。

- Windows では、`instrument.cmd dotnet <application>` を使用します。
- Linux および Unix では、`instrument.sh dotnet <application>` を使用します。

スクリプトは、指定したすべてのコマンドラインパラメーターをアプリケーションに渡します。

---
title: ベストプラクティス
linkTitle: ベストプラクティス
description: OpenTelemetry .NET でログを使用する際のベストプラクティスを学びます
weight: 120
default_lang_commit: 346b2912021b98de4349f80753c829d9223a1f25
---

以下のベストプラクティスに従って、OpenTelemetry .NET のログを最大限に活用しましょう。

## Logging API {#logging-api}

### ILogger {#ilogger}

.NET は、アプリケーションの動作を監視し問題を診断するために、[`Microsoft.Extensions.Logging.ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger) インターフェイス（[`ILogger<TCategoryName>`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger-1) を含む）を通じて、高パフォーマンスな構造化ログをサポートしています。

#### パッケージバージョン {#package-version}

使用している .NET ランタイムのバージョンに関係なく、[Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging/) パッケージの最新の安定バージョンの [`ILogger`](https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger) インターフェイス（[`ILogger<TCategoryName>`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger-1) を含む）を使用してください。

- [OpenTelemetry .NET SDK](/docs/languages/dotnet/) の最新の安定バージョンを使用している場合、`Microsoft.Extensions.Logging` パッケージのバージョンはパッケージの依存関係を通じてすでに管理されているため、気にする必要はありません。
- バージョン `3.1.0` 以降、.NET ランタイムチームはメジャーバージョンの更新時でも `Microsoft.Extensions.Logging` の後方互換性に高い基準を設けているため、互換性について心配する必要はありません。

#### ロガーの取得 {#get-logger}

`ILogger` インターフェイスを使用するには、まずロガーを取得する必要があります。
ロガーの取得方法は次の2つの要素に依存します。

- 構築しているアプリケーションの種類。
- ログを記録したい場所。

一般的なルールとして、以下のようになります。

- [依存性注入（DI）](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection)を使用するアプリケーション（たとえば [ASP.NET Core](https://learn.microsoft.com/aspnet/core) や [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)）を構築している場合、ほとんどのケースでは DI が提供するロガーを使用するべきですが、DI のロギングパイプラインが利用可能になる前や、破棄された後にログを記録したい特殊なケースもあります。
  詳しくは [.NET 公式ドキュメント](https://learn.microsoft.com/dotnet/core/extensions/logging#integration-with-hosts-and-dependency-injection)と [5分で始める OpenTelemetry .NET ログ - ASP.NET Core アプリケーション](/docs/languages/dotnet/logs/getting-started-aspnetcore/)チュートリアルを参照してください。
- DI を使用しないアプリケーションを構築している場合は、[LoggerFactory](#loggerfactory) インスタンスを作成し、OpenTelemetry がそれと連携するように設定してください。
  詳しくは [5分で始める OpenTelemetry .NET ログ - コンソールアプリケーション](/docs/languages/dotnet/logs/getting-started-console/)チュートリアルを参照してください。

ログカテゴリ名にはドット区切りの [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) を使用すると、[ログのフィルタリング](#log-filtering)に便利です。
一般的な方法は完全修飾クラス名を使用することであり、さらに分類が必要な場合はサブカテゴリ名を追加します。
詳しくは [.NET 公式ドキュメント](https://learn.microsoft.com/dotnet/core/extensions/logging#log-category)を参照してください。
たとえば、以下のようになります。

```csharp
loggerFactory.CreateLogger<MyClass>(); // これは CreateLogger("MyProduct.MyLibrary.MyClass") と同等
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass"); // 完全修飾クラス名を使用
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass.DatabaseOperations"); // サブカテゴリ名を追加
loggerFactory.CreateLogger("MyProduct.MyLibrary.MyClass.FileOperations"); // 別のサブカテゴリ名を追加
```

ロガーの作成を頻繁に行いすぎないようにしてください。
ロガーは非常に高コストではありませんが、CPU とメモリのコストがかかるため、アプリケーション全体で再利用することを目的としています。

#### ログメッセージの書き方 {#write-log-messages}

構造化ログを使用してください。

- 構造化ログは非構造化ログよりも効率的です。
  - 個々のキーバリューペアに対してフィルタリングやリダクションを行えるため、ログメッセージ全体に対して行う必要がありません。
  - ストレージとインデックス作成がより効率的です。
- 構造化ログによりログの管理と利用が容易になります。

たとえば、以下のようになります。

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation("Hello from {food} {price}.", food, price);
```

文字列補間は避けてください。
たとえば、以下のようになります。

> [!WARNING]
>
> 以下のコードは[文字列補間](https://learn.microsoft.com/dotnet/csharp/tutorials/string-interpolation)によりパフォーマンスが低下します。

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation($"Hello from {food} {price}.");
```

最高のパフォーマンスを得るには、[コンパイル時ログソース生成](https://docs.microsoft.com/dotnet/core/extensions/logger-message-generator)パターンを使用してください。
たとえば、以下のようになります。

```csharp
var food = "tomato";
var price = 2.99;

logger.SayHello(food, price);

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);
}
```

> [!NOTE]
>
> [LoggerMessageAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggermessageattribute) を使用する場合、明示的な [EventId](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.eventid) を渡す必要はありません。
> コード生成時にメソッド名のハッシュに基づいて、永続的な `EventId` が自動的に割り当てられます。

複雑なオブジェクトをログに記録する必要がある場合は、[Microsoft.Extensions.Telemetry.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.Telemetry.Abstractions/) の [LogPropertiesAttribute](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.logpropertiesattribute) を使用してください。
詳しくは[複雑なオブジェクトのログ記録](/docs/languages/dotnet/logs/complex-objects/)チュートリアルを参照してください。

[LoggerExtensions](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerextensions) の拡張メソッドの使用は避けてください。
これらのメソッドはパフォーマンスに最適化されていません。
たとえば、以下のようになります。

> [!WARNING]
>
> 以下のコードは[ボクシング](https://learn.microsoft.com/dotnet/csharp/programming-guide/types/boxing-and-unboxing)によりパフォーマンスが低下します。

```csharp
var food = "tomato";
var price = 2.99;

logger.LogInformation("Hello from {food} {price}.", food, price);
```

[`ILogger.IsEnabled`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger.isenabled) の使用には高い基準を持ってください。

ロギング API は、ほとんどのロガーが特定のログレベルに対して**無効**になっているシナリオに高度に最適化されています。
ログ記録の前に `IsEnabled` を追加で呼び出しても、パフォーマンスの向上は得られません。
たとえば、以下のようになります。

> [!WARNING]
>
> 以下のコードの `logger.IsEnabled(LogLevel.Information)` の呼び出しではパフォーマンスの向上は得られません。

```csharp
var food = "tomato";
var price = 2.99;

if (logger.IsEnabled(LogLevel.Information)) // これはしないでください、パフォーマンスの向上はありません
{
    logger.SayHello(food, price);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);
}
```

`IsEnabled` は、引数の評価にコストがかかる場合にパフォーマンス上の利点をもたらすことがあります。
たとえば、以下のコードではロガーが有効でない場合、`Database.GetFoodPrice` の呼び出しはスキップされます。

```csharp
if (logger.IsEnabled(LogLevel.Information))
{
    logger.SayHello(food, Database.GetFoodPrice(food));
}
```

上記のシナリオでは `IsEnabled` がパフォーマンス上の利点をもたらす場合がありますが、ほとんどのユーザーにとってはより多くの問題を引き起こす可能性があります。
たとえば、コードのパフォーマンスがどのロガーが有効かに依存するようになり、さらに引数の評価にはロギング設定に依存する重大な副作用がある可能性もあります。

コンパイル時ソースジェネレーターを使用する場合は、例外をログに記録するための専用パラメーターを使用してください。
たとえば、以下のようになります。

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // ロジックを実行

    logger.SayHello(food, price);
}
catch (Exception ex)
{
    logger.SayHelloFailure(ex, food, price);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not say hello from {food} {price}.")]
    public static partial void SayHelloFailure(this ILogger logger, Exception exception, string food, double price);
}
```

> [!NOTE]
>
> コンパイル時ソースジェネレーターを使用する場合、検出された最初の `Exception` パラメーターには自動的に特別な処理が適用されます。
> これはメッセージテンプレートの一部にすべきでは**ありません**。
> 詳しくは [ログメソッドの構造](https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator#log-method-anatomy) を参照してください。

ロギング拡張メソッドを使用する場合は、例外をログに記録するための専用オーバーロードを使用するべきです。

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // ロジックを実行

    logger.LogInformation("Hello from {food} {price}.", food, price);
}
catch (Exception ex)
{
    logger.LogError(ex, "Could not say hello from {food} {price}.", food, price);
}
```

メッセージテンプレートに例外の詳細を追加することは避けてください。
たとえば、以下のようになります。

OpenTelemetry の仕様では `Exception` の詳細について[専用の属性を定義](/docs/specs/semconv/exceptions/)しているため、正しい `Exception` API を使用する必要があります。
以下の例は**やってはいけない**ことを示しています。
これらのケースでは詳細は失われませんが、専用の属性も追加されません。

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // ロジックを実行

    logger.SayHello(food, price);
}
catch (Exception ex)
{
    logger.SayHelloFailure(food, price, ex.Message);
}

internal static partial class LoggerExtensions
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Hello from {food} {price}.")]
    public static partial void SayHello(this ILogger logger, string food, double price);

    // 悪い例 - Exception はメッセージテンプレートの一部にすべきではありません。専用パラメーターを使用してください。
    [LoggerMessage(Level = LogLevel.Error, Message = "Could not say hello from {food} {price} {message}.")]
    public static partial void SayHelloFailure(this ILogger logger, string food, double price, string message);
}
```

```csharp
var food = "tomato";
var price = 2.99;

try
{
    // ロジックを実行

    logger.LogInformation("Hello from {food} {price}.", food, price);
}
catch (Exception ex)
{
    // 悪い例 - Exception はメッセージテンプレートの一部にすべきではありません。専用パラメーターを使用してください。
    logger.LogError("Could not say hello from {food} {price} {message}.", food, price, ex.Message);
}
```

## LoggerFactory {#loggerfactory}

多くの場合、[Microsoft.Extensions.Logging.LoggerFactory](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerfactory) と直接やり取りせずに [ILogger](#ilogger) を使用できます。
このセクションは、`LoggerFactory` を明示的に作成および管理する必要があるユーザーを対象としています。

`LoggerFactory` インスタンスの作成を頻繁に行いすぎないようにしてください。
`LoggerFactory` はかなりのコストがかかり、アプリケーション全体で再利用することを目的としています。
ほとんどのアプリケーションでは、プロセスごとに1つの `LoggerFactory` インスタンスで十分です。

[LoggerFactory](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loggerfactory) インスタンスを自分で作成した場合は、そのライフサイクルを管理してください。

- アプリケーション終了前に `LoggerFactory` インスタンスの破棄を忘れると、適切なフラッシュが行われないためログが欠落する可能性があります。
- `LoggerFactory` インスタンスを早すぎるタイミングで破棄すると、そのロガーファクトリに関連付けられた後続のロギング API 呼び出しは no-op になる可能性があります（つまり、ログが出力されなくなります）。

## ログの相関 {#log-correlation}

OpenTelemetry では、ログは自動的に[トレース](/docs/languages/dotnet/traces/)と相関付けられます。
詳しくは[ログの相関](/docs/languages/dotnet/logs/correlation/)チュートリアルを参照してください。

## ログのフィルタリング {#log-filtering}

より高度なフィルタリングやサンプリングについては、.NET チームが .NET 9 の期間内に対応する計画があります。
進捗状況の追跡やフィードバック・提案の提供には、この[ランタイムイシュー](https://github.com/dotnet/runtime/issues/82465)を使用してください。

## ログのリダクション {#log-redaction}

ログにはパスワードやクレジットカード番号などの機密情報が含まれる場合があり、プライバシーとセキュリティのインシデントを防ぐために適切なリダクションが必要です。
詳しくは[ログのリダクション](/docs/languages/dotnet/logs/redaction/)チュートリアルを参照してください。

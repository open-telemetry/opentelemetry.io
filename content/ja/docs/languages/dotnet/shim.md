---
title: OpenTelemetry トレーシング Shim
linkTitle: トレーシング Shim
weight: 110
default_lang_commit: bec33ed09231b738f244797c4346163128d9c98a
---

.NET は OpenTelemetry をサポートする他の言語やランタイムとは異なります。
トレースは [System.Diagnostics](https://docs.microsoft.com/dotnet/api/system.diagnostics) API によって実装されており、`ActivitySource` や `Activity` といった既存のコンストラクトを再利用して、内部的に OpenTelemetry に準拠するようになっています。

OpenTelemetry for .NET は、[System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics) ベースの実装の上に API Shim も提供しています。
この Shim は、同じコードベースで他の言語と OpenTelemetry を併用している場合や、OpenTelemetry の仕様と一貫した用語を使いたい場合に役立ちます。

## トレースの初期化 {#initializing-tracing}

[トレース](/docs/concepts/signals/traces/)を初期化するには、主に2つの方法があります。
コンソールアプリを使用するか、ASP.NET Core ベースのものを使用するかによって異なります。

### コンソールアプリ {#console-app}

コンソールアプリで[トレース](/docs/concepts/signals/traces/)を開始するには、トレーサープロバイダーを作成する必要があります。

まず、適切なパッケージがインストールされていることを確認してください。

```sh
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

次に、プログラムの先頭、重要なスタートアップ処理の中で、以下のようなコードを使用してください。

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// ...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

//...
```

ここで計装ライブラリを設定することもできます。

このサンプルではコンソールエクスポーターを使用しています。
別のエンドポイントにエクスポートする場合は、別のエクスポーターを使用する必要があります。

### ASP.NET Core {#aspnet-core}

ASP.NET Core ベースのアプリで[トレース](/docs/concepts/signals/traces/)を開始するには、ASP.NET Core セットアップ用の OpenTelemetry エクステンションを使用してください。

まず、適切なパッケージがインストールされていることを確認してください。

```sh
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

次に、`IServiceCollection` にアクセスできる ASP.NET Core のスタートアップルーチンで設定してください。

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// これらは設定ファイルや定数ファイルなどから取得できます。
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// 重要な OpenTelemetry 設定、コンソールエクスポーター、計装ライブラリを構成
builder.Services.AddOpenTelemetry().WithTracing(tcb =>
{
    tcb
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddAspNetCoreInstrumentation()
    .AddConsoleExporter();
});
```

上の例では、セットアップ時にサービスに対応する [`Tracer`](/docs/concepts/signals/traces/#tracer) が注入されます。
これにより、エンドポイントマッピング（または古いバージョンの .NET を使用している場合はコントローラー）でインスタンスにアクセスできるようになります。

サービスレベルのトレーサーを注入することは必須ではなく、パフォーマンスの向上にもなりません。
ただし、トレーサーインスタンスをどこに配置するかは決める必要があります。

ここで計装ライブラリを設定することもできます。

このサンプルではコンソールエクスポーターを使用しています。
別のエンドポイントにエクスポートする場合は、別のエクスポーターを使用する必要があります。

## トレーサーのセットアップ {#setting-up-a-tracer}

トレースが初期化されると、[`Tracer`](/docs/concepts/signals/traces/#tracer) を設定できます。
これにより、[`Span`](/docs/concepts/signals/traces/#spans) を使ってオペレーションをトレースできるようになります。

通常、`Tracer` は計装対象のアプリやサービスごとに一度だけインスタンス化されるため、共有の場所で一度インスタンス化するのがよいでしょう。
また、通常はサービス名と同じ名前が付けられます。

### ASP.NET Core でのトレーサーの注入 {#injecting-a-tracer-with-aspnet-core}

ASP.NET Core では一般的に、`Tracer` のような長寿命のオブジェクトのインスタンスをセットアップ時に注入することが推奨されています。

```csharp
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// ...

builder.Services.AddSingleton(TracerProvider.Default.GetTracer(serviceName));

// ...

var app = builder.Build();

// ...

app.MapGet("/hello", (Tracer tracer) =>
{
    using var span = tracer.StartActiveSpan("hello-span");

    // 処理を実行
});
```

### TracerProvider からトレーサーを取得する {#acquiring-a-tracer-from-a-tracerprovider}

ASP.NET Core を使用していない場合や `Tracer` のインスタンスを注入したくない場合は、インスタンス化した [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) から作成してください。

```csharp
// ...

var tracer = tracerProvider.GetTracer(serviceName);

// グローバルにアクセスできる場所に割り当て

//...
```

この `Tracer` インスタンスを中心的な場所の変数に割り当てて、サービス全体でアクセスできるようにするとよいでしょう。

サービスごとに必要な数だけ `Tracer` をインスタンス化できますが、通常はサービスごとに1つ定義すれば十分です。

## スパンの作成 {#creating-spans}

[スパン](/docs/concepts/signals/traces/#spans)を作成するには、名前を付けて `Tracer` から作成します。

```csharp
using var span = MyTracer.StartActiveSpan("SayHello");

// 'span' がトラッキングする処理を実行
```

## ネストされたスパンの作成 {#creating-nested-spans}

あるオペレーションの一部として追跡したい個別のサブオペレーションがある場合、その関係を表すスパンを作成できます。

```csharp
public static void ParentOperation(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // parentSpan でトラッキングされる処理を実行

    ChildOperation(tracer);

    // parentSpan でトラッキングされる処理を再開
}

public static void ChildOperation(Tracer tracer)
{
    using var childSpan = tracer.StartActiveSpan("child-span");

    // childSpan で ChildOperation の処理をトラッキング
}
```

トレース可視化ツールでスパンを表示すると、`child-span` は `parent-span` の下にネストされたオペレーションとしてトラッキングされます。

### 同じスコープ内のネストされたスパン {#nested-spans-in-the-same-scope}

同じスコープ内で親子関係を作成することもできます。
ただし、ネストされた `TelemetrySpan` を期待通りのタイミングで終了するよう注意する必要があるため、一般的には推奨されません。

```csharp
public static void DoWork(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // parentSpan でトラッキングされる処理を実行

    using (var childSpan = tracer.StartActiveSpan("child-span"))
    {
        // 同じ関数内で「子」の処理を実行
    }

    // parentSpan でトラッキングされる処理を再開
}
```

上の例では、`using` ブロックのスコープが明示的に定義されているため、`childSpan` は終了されます。
`parentSpan` のように `DoWork` 自体にスコープが設定されているのとは異なります。

## 独立したスパンの作成 {#creating-independent-spans}

前の例では、ネストされた階層に従う[スパン](/docs/concepts/signals/traces/#spans)の作成方法を示しました。
場合によっては、ネストではなく、同じルートの兄弟となる独立したスパンを作成したいことがあります。

```csharp
public static void DoWork(Tracer tracer)
{
    using var parent = tracer.StartSpan("parent");
    // 'parent' は 'child1' と 'child2' の両方の共有された親になります

    using (var child1 = tracer.StartSpan("child1"))
    {
        // 'child1' がトラッキングする処理を実行
    }

    using (var child2 = tracer.StartSpan("child2"))
    {
        // 'child2' がトラッキングする処理を実行
    }
}
```

## 新しいルートスパンの作成 {#creating-new-root-spans}

現在のトレースから完全に切り離された新しいルート[スパン](/docs/concepts/signals/traces/#spans)を作成することもできます。

```csharp
public static void DoWork(Tracer tracer)
{
    using var newRoot = tracer.StartRootSpan("newRoot");
}
```

## 現在のスパンの取得 {#get-the-current-span}

ある時点での現在の `TelemetrySpan` にアクセスして、追加情報で拡充できると便利な場合があります。

```csharp
var span = Tracer.CurrentSpan;
// ここで追加の処理を実行
```

上の例では `using` を使用していないことに注意してください。
使用すると、スコープを抜けた時点で現在の `TelemetrySpan` が終了してしまいます。
これは望ましい動作ではないでしょう。

## スパンに属性を追加する {#add-attributes-to-a-span}

[属性](/docs/concepts/signals/traces/#attributes)を使用すると、`TelemetrySpan` にキーと値のペアを付加して、トラッキングしている現在のオペレーションに関する追加情報を持たせることができます。

```csharp
using var span = tracer.StartActiveSpan("SayHello");

span.SetAttribute("operation.value", 1);
span.SetAttribute("operation.name", "Saying hello!");
span.SetAttribute("operation.other-stuff", new int[] { 1, 2, 3 });
```

## イベントの追加 {#adding-events}

[イベント](/docs/concepts/signals/traces/#span-events)は、`TelemetrySpan` のライフタイム中に「何かが起きた」ことを表す人間が読めるメッセージです。
プリミティブなログのようなものと考えることができます。

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("Doing something...");

// ...

span.AddEvent("Dit it!");
```

イベントはタイムスタンプと[属性](/docs/concepts/signals/traces/#attributes)のコレクションを指定して作成することもできます。

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("event-message");
span.AddEvent("event-message2", DateTimeOffset.Now);

// ...

var attributeData = new Dictionary<string, object>
{
    {"foo", 1 },
    { "bar", "Hello, World!" },
    { "baz", new int[] { 1, 2, 3 } }
};

span.AddEvent("asdf", DateTimeOffset.Now, new(attributeData));
```

## リンクの追加 {#adding-links}

`TelemetrySpan` は、因果関係のある0個以上の [`Link`](/docs/concepts/signals/traces/#span-links) を付けて作成できます。

```csharp
// どこかからコンテキストを取得（パラメーターとして渡されるなど）
var ctx = span.Context;

var links = new List<Link>
{
    new(ctx)
};

using var span = tracer.StartActiveSpan("another-span", links: links);

// 処理を実行
```

## スパンステータスの設定 {#set-span-status}

[ステータス](/docs/concepts/signals/traces/#span-status)はスパンに設定でき、通常はスパンが正常に完了しなかったことを示すために使用されます（`StatusCode.Error`）。
まれなシナリオでは、`Error` ステータスを `Ok` で上書きすることもできますが、正常に完了したスパンには `Ok` を設定しないでください。

ステータスはスパンが終了する前であればいつでも設定できます。

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// 何らかの処理を実行
}
catch (Exception ex)
{
    span.SetStatus(new(StatusCode.Error, "Something bad happened!"));
}
```

## スパンに例外を記録する {#record-exceptions-in-spans}

例外が発生したときに記録するのはよいプラクティスです。
[スパンステータスの設定](#set-span-status)と組み合わせて行うことが推奨されます。

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// 何らかの処理を実行
}
catch (Exception ex)
{
    span.SetStatus(new(StatusCode.Error, "Something bad happened!"));
    span.RecordException(ex)
}
```

これにより、現在のスタックトレースなどの情報がスパンの属性としてキャプチャされます。

## 次のステップ {#next-steps}

手動計装をセットアップしたら、[計装ライブラリ](/docs/languages/dotnet/libraries)を使用するとよいでしょう。
計装ライブラリは、使用している関連ライブラリを計装し、インバウンドおよびアウトバウンド HTTP リクエストなどのデータを生成します。

また、テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/dotnet/exporters)するための適切なエクスポーターを設定する必要もあります。

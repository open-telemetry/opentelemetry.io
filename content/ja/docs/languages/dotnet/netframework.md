---
title: .NET Framework の計装設定
linkTitle: .NET Framework
weight: 100
default_lang_commit: 4c76a8ab64aef829003446e6ff8d2869c51c03a6
cSpell:ignore: asax LINQ
---

OpenTelemetry は [.NET](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet) と [.NET Framework](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet-framework)（古い Windows ベースの .NET 実装）の両方をサポートしています。

すでにモダンなクロスプラットフォーム版の .NET を使用している場合は、この記事をスキップできます。

## ASP.NET の初期化 {#aspnet-initialization}

ASP.NET の初期化は、ASP.NET Core とは少し異なります。

まず、以下の NuGet パッケージをインストールしてください。

- [OpenTelemetry.Instrumentation.AspNet](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNet)
- [OpenTelemetry.Exporter.Console](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console)

次に、`Web.Config` ファイルを変更して、必要な HttpModule を追加します。

```xml
<system.webServer>
    <modules>
        <add
            name="TelemetryHttpModule"
            type="OpenTelemetry.Instrumentation.AspNet.TelemetryHttpModule,
                OpenTelemetry.Instrumentation.AspNet.TelemetryHttpModule"
            preCondition="integratedMode,managedHandler" />
    </modules>
</system.webServer>
```

最後に、`Global.asax.cs` ファイルで ASP.NET の計装を他の OpenTelemetry の初期化とともに設定します。

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

public class WebApiApplication : HttpApplication
{
    private TracerProvider _tracerProvider;

    protected void Application_Start()
    {
        _tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddAspNetInstrumentation()

            // エクスポーターの追加やリソースの設定などその他の構成
            .AddConsoleExporter()
            .AddSource("my-service-name")
            .SetResourceBuilder(
                ResourceBuilder.CreateDefault()
                    .AddService(serviceName: "my-service-name", serviceVersion: "1.0.0"))

            .Build();
    }

    protected void Application_End()
    {
        _tracerProvider?.Dispose();
    }
}
```

## ASP.NET の高度な設定 {#advanced-aspnet-configuration}

ASP.NET の計装は、デフォルトの動作を変更するように設定できます。

### フィルター {#filter}

ASP.NET の計装は、デフォルトですべての受信 HTTP リクエストを収集します。
ただし、`AspNetInstrumentationOptions` の `Filter` メソッドを使用して、受信リクエストをフィルタリングできます。
これは LINQ の `Where` 句と同様に機能し、条件に一致するリクエストのみが収集されます。

以下のコードスニペットは、`Filter` を使用して GET リクエストのみを許可する方法を示しています。

```csharp
this.tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddAspNetInstrumentation(
        (options) => options.Filter =
            (httpContext) =>
            {
                // HTTP GET リクエストに関するテレメトリーのみを収集する
                return httpContext.Request.HttpMethod.Equals("GET");
            })
    .Build();
```

フィルタリングは早い段階で行われ、データが収集された後に行われる[サンプリング](/docs/specs/otel/trace/sdk/#sampling)とは異なります。
フィルタリングは、そもそも何が収集されるかを制限します。

### エンリッチ {#enrich}

OpenTelemetry が生成するすべての `Activity` にデータを追加したい場合は、`Enrich` メソッドを使用できます。

`Enrich` アクションは `activity.IsAllDataRequested` が `true` の場合にのみ呼び出されます。
作成された `Activity`、イベント名、および生のオブジェクトが含まれます。

以下のコードスニペットは、`Enrich` を使用して追加のタグを付与する方法を示しています。

```csharp
this.tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddAspNetInstrumentation((options) => options.Enrich
        = (activity, eventName, rawObject) =>
    {
        if (eventName.Equals("OnStartActivity"))
        {
            if (rawObject is HttpRequest httpRequest)
            {
                activity?.SetTag("physicalPath", httpRequest.PhysicalPath);
            }
        }
        else if (eventName.Equals("OnStopActivity"))
        {
            if (rawObject is HttpResponse httpResponse)
            {
                activity?.SetTag("responseType", httpResponse.ContentType);
            }
        }
    })
    .Build();
```

トレースデータへのアノテーションの一般的な方法については、[Activity にタグを追加](../instrumentation/#activity-tags)を参照してください。

### RecordException {#recordexception}

ASP.NET の計装は、未処理の例外がスローされた場合、該当する `Activity` のステータスを自動的に `Error` に設定します。

`RecordException` プロパティを `true` に設定することで、例外を `ActivityEvent` として `Activity` 自体に保存することもできます。

## 次のステップ {#next-steps}

計装ライブラリによってオブザーバビリティが自動的に生成されるようになったら、カスタムテレメトリーデータを収集するために[手動計装](/docs/languages/dotnet/instrumentation)を追加することもできます。

また、テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/dotnet/exporters)するために、適切なエクスポーターを設定することも必要です。

現在ベータ版の [.NET の自動計装](/docs/zero-code/dotnet)も確認できます。

---
title: 計装ライブラリの使用
linkTitle: ライブラリ
weight: 40
default_lang_commit: dcb78a3aa2784ed071112b7bae3cf40e97032103
---

{{% docs/languages/libraries-intro "dotnet" %}}

## 計装ライブラリの使用 {#use-instrumentation-libraries}

ライブラリに OpenTelemetry が最初から付属していない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリまたはフレームワークのテレメトリーデータを生成できます。

たとえば、[ASP.NET Core の計装ライブラリ](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)は、受信した HTTP リクエストに基づいて[スパン](/docs/concepts/signals/traces/#spans)と[メトリクス](/docs/concepts/signals/metrics)を自動的に作成します。

## セットアップ {#setup}

各計装ライブラリは NuGet パッケージであり、通常は以下のようにインストールします。

```sh
dotnet add package OpenTelemetry.Instrumentation.{library-name-or-type}
```

通常、[トレーサープロバイダー](/docs/concepts/signals/traces/#tracer-provider)を作成する際などのアプリケーション起動時に登録します。

## バージョニングに関する注意事項 {#note-on-versioning}

属性名のセマンティック規約（標準）は現在安定しておらず、そのため計装ライブラリも現在リリース済みの状態ではありません。
これは機能自体が安定していないということではなく、一部の属性名が将来変更される可能性があり、追加や削除が行われる場合があるということです。
つまり、`--prerelease` フラグを使用するか、パッケージの特定のバージョンをインストールする必要があります。

## ASP.NET Core と HttpClient の例 {#example-with-aspnet-core-and-httpclient}

例として、ASP.NET Core アプリから受信リクエストと送信リクエストを計装する方法を示します。

まず、OpenTelemetry Core の適切なパッケージを取得します。

```sh
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Exporter.Console
```

次に計装ライブラリをインストールします。

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Instrumentation.Http --prerelease
```

その後、起動時に各計装ライブラリを設定して使用します。

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
  .WithTracing(b =>
  {
      b
      .AddHttpClientInstrumentation()
      .AddAspNetCoreInstrumentation();
  });

var app = builder.Build();

var httpClient = new HttpClient();

app.MapGet("/hello", async () =>
{
    var html = await httpClient.GetStringAsync("https://example.com/");
    if (string.IsNullOrWhiteSpace(html))
    {
        return "Hello, World!";
    }
    else
    {
        return "Hello, World!";
    }
});

app.Run();
```

このコードを実行して `/hello` エンドポイントにアクセスすると、計装ライブラリは以下を行います。

- 新しいトレースを開始する
- エンドポイントへのリクエストを表すスパンを生成する
- `https://example.com/` への HTTP GET を表す子スパンを生成する

さらに計装ライブラリを追加すると、それぞれに対応するスパンが追加されます。

## 利用可能な計装ライブラリ {#available-instrumentation-libraries}

OpenTelemetry が提供する計装ライブラリの完全なリストは [opentelemetry-dotnet][] リポジトリから入手できます。

[レジストリ](/ecosystem/registry/?language=dotnet&component=instrumentation)でも、さらに多くの計装を見つけることができます。

## 次のステップ {#next-steps}

計装ライブラリのセットアップが完了したら、カスタムテレメトリーデータを収集するためにコードに独自の[計装](/docs/languages/dotnet/instrumentation)を追加することを検討してください。

モダンな .NET ではなく .NET Framework 4.x を使用している場合は、[.NET Framework のドキュメント](/docs/languages/dotnet/netframework)を参照して、.NET Framework 上で OpenTelemetry と計装ライブラリを設定してください。

テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/dotnet/exporters)するための適切なエクスポーターも設定する必要があります。

現在ベータ版の [.NET の自動計装](/docs/zero-code/dotnet)も確認できます。

[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet

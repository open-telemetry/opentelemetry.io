---
title: OpenTelemetry .NET のリソース
linkTitle: リソース
description: リソースについて、および OpenTelemetry .NET でリソースを使う方法を学びます
weight: 40
default_lang_commit: 12862017e85a7b88fbd194241af00f4dbd4ee75c
cSpell:ignore: myhost pcarter uuidgen
---

{{% docs/languages/resources-intro %}}

## リソースとは {#what-are-resources}

OpenTelemetry において、リソースはテレメトリーを生成するエンティティのイミュータブルな表現です。
たとえば、リソースは Kubernetes コンテナ、Linux や Windows のプロセス、あるいはプロセス内で実行されているアプリケーションを表すことができます。

リソースは OpenTelemetry の基本的な概念であり、テレメトリーデータのソースを記述するために使用されます。
この情報はテレメトリーデータのデバッグや分析に役立ちます。

## リソース属性 {#resource-attributes}

リソース属性は、リソースに関するメタデータを提供するキーと値のペアです。
OpenTelemetry はリソース属性の[セマンティック規約](/docs/specs/semconv/resource/)を定義しており、該当する場合にはこれを使用すべきです。

一般的なリソース属性には次のものがあります。

- `service.name`: テレメトリーを生成するサービスの名前
- `service.version`: サービスのバージョン
- `service.namespace`: サービスのネームスペース
- `service.instance.id`: サービスインスタンスの一意な識別子
- `host.name`: ホストの名前
- `deployment.environment`: デプロイ環境（例: 本番、ステージング）

## セットアップ {#setup}

[Getting Started][] の手順に従い、コンソールにデータをエクスポートする .NET アプリケーションを実行できる状態にしてください。

## 環境変数によるリソースの追加 {#adding-resources-with-environment-variables}

`OTEL_RESOURCE_ATTRIBUTES` 環境変数を使用して、アプリケーションにリソースを注入できます。
.NET SDK はこれらのリソースを自動的に検出します。

次の例では、`uname` などの Unix コマンドを使ってリソースデータを生成し、[Service][]、[Host][]、[OS][] のリソース属性を環境変数で追加しています。

```console
$ env OTEL_RESOURCE_ATTRIBUTES="service.name=resource-tutorial-dotnet,service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    service.name: resource-tutorial-dotnet
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 93B14BAD-813D-48EE-9FB1-2ADFD07C5E78
    host.name: myhost
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

## コードによるリソースの追加 {#adding-resources-in-code}

`ResourceBuilder` にリソースをアタッチすることで、コード内でカスタムリソースを追加することもできます。

次の例は、[Getting Started][getting started] のサンプルを基にして、`environment.name` と `team.name` という2つのカスタムリソースをコードで追加しています。

```csharp
using System.Diagnostics;
using System.Collections.Generic;

using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

var serviceName = "resource-tutorial-dotnet";
var serviceVersion = "1.0";

var resourceBuilder =
    ResourceBuilder
        .CreateDefault()
        .AddService(serviceName: serviceName, serviceVersion: serviceVersion)
        .AddAttributes(new Dictionary<string, object>
        {
            ["environment.name"] = "production",
            ["team.name"] = "backend"
        });

var sourceName = "tutorial-dotnet";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(sourceName)
    .SetResourceBuilder(resourceBuilder)
    .AddConsoleExporter()
    .Build();

var MyActivitySource = new ActivitySource(sourceName);

using var activity = MyActivitySource.StartActivity("SayHello");
activity?.SetTag("foo", 1);
activity?.SetTag("bar", "Hello, World!");
activity?.SetTag("baz", new int[] { 1, 2, 3 });
```

この例では、`service.name` と `service.version` の値もコードで設定されています。
加えて、`service.instance.id` にはデフォルト値が設定されます。

[環境変数によるリソースの追加](#adding-resources-with-environment-variables)と同じコマンドを実行しますが、今回は `service.name`、`service.version`、`service.instance.id` を指定しません。
すると、リソース一覧に `environment.name` と `team.name` が表示されます。

```console
$ env OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,host.name=`HOSTNAME`,host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" dotnet run

Activity.TraceId:          d1cbb7787440cc95b325835cb2ff8018
Activity.SpanId:           2ca007300fcb3068
Activity.TraceFlags:           Recorded
Activity.ActivitySourceName: tutorial-dotnet
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-10-02T13:31:12.0175090Z
Activity.Duration:    00:00:00.0003920
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1,2,3]
Resource associated with Activity:
    environment.name: production
    team.name: backend
    service.name: resource-tutorial-dotnet
    service.namespace: tutorial
    service.version: 1.0
    service.instance.id: 28976A1C-BF02-43CA-BAE0-6E0564431462
    host.name: pcarter
    host.type: arm64
    os.name: Darwin
    os.version: 21.6.0
```

**注意**: リソース属性を環境変数とコードの両方で設定した場合、コードの値が優先されます。

## 次のステップ {#next-steps}

設定に追加できるリソース検出器は他にもあります。
たとえば、[Cloud][] 環境や [Deployment][] の詳細を取得できます。

[getting started]: /docs/languages/dotnet/getting-started/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/

## さらに学ぶ {#learn-more}

OpenTelemetry のリソースについて詳しくは、[リソース SDK 仕様](/docs/specs/otel/resource/sdk/)を参照してください。

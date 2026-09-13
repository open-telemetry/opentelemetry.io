---
title: 例外の報告
linkTitle: 例外
description: OpenTelemetry .NET トレースで例外を報告する方法を学ぶ
weight: 40
default_lang_commit: f8e6af4e73e9d550e8aeb582392458c77f93d440
cSpell:ignore: AppDomain
---

このガイドでは、手動でアクティビティ（スパン）を作成する際に、OpenTelemetry トレーシングに例外を報告する方法について説明します。
[計装ライブラリ](/docs/languages/dotnet/instrumentation/)を使用している場合、これらの機能は自動的に提供されることがあります。

## トレースにおける例外処理の理解 {#understanding-exception-handling-in-traces}

OpenTelemetry では、アプリケーションで発生するエラーに関するコンテキストを提供するために、トレースに例外を報告することが重要です。
基本的なステータス報告から完全な例外の詳細まで、これを処理する方法はいくつかあります。

## ユーザーが処理する例外 {#user-handled-exceptions}

ユーザーが処理する例外とは、アプリケーションによってキャッチされ処理される例外です。

```csharp
try
{
    Func();
}
catch (SomeException ex)
{
    DoSomething();
}
catch (Exception ex)
{
    DoSomethingElse();
    throw;
}
```

OpenTelemetry .NET は、これらの例外をトレースに報告するためのいくつかのオプションを提供しています。

### オプション 1：Activity のステータスを手動で設定する {#option-1-set-activity-status-manually}

もっとも基本的なオプションは、例外が発生したことを示すために Activity のステータスを Error に設定することです。

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        DoSomething();
    }
    catch (Exception ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        throw;
    }
}
```

### オプション 2：SetErrorStatusOnException 機能を使用する {#option-2-use-seterrorstatusonexception-feature}

深くネストされたアクティビティやサードパーティライブラリで作成されたアクティビティがある場合、手動でステータスを設定するのは困難になることがあります。
かわりに、例外を自動的に検出してアクティビティのステータスを設定するよう SDK を構成できます。

```csharp
Sdk.CreateTracerProviderBuilder()
    .SetErrorStatusOnException()
    // その他の設定...
    .Build();
```

この構成により、アクティビティがアクティブな間に発生した例外は、自動的にそのアクティビティのステータスを Error に設定します。

> [!NOTE]
>
> この機能は `System.Runtime.InteropServices.Marshal.GetExceptionPointers` に依存しているため、プラットフォームに依存します。

### オプション 3：エラーの説明を含める {#option-3-include-error-description}

より多くのコンテキストを提供するために、例外メッセージをステータスの説明として含めることができます。

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    }
}
```

### オプション 4：完全な例外を記録する {#option-4-record-the-full-exception}

もっとも詳細なデバッグ体験を得るために、`Activity.RecordException()` を使用して例外をイベントとしてアクティビティに保存します。

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
        activity?.RecordException(ex);
    }
}
```

これにより、例外の型、メッセージ、スタックトレースがアクティビティにキャプチャされ、トレーシングバックエンドで利用可能になります。

## 未処理の例外 {#unhandled-exceptions}

未処理の例外とは、アプリケーションによってキャッチおよび処理されない例外です。
通常、プロセスのクラッシュやスレッドの終了を引き起こします。

`AppDomain.UnhandledException` イベントハンドラーを使用することで、未処理の例外をキャプチャし、アクティブなアクティビティに記録できます。

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

public class Program
{
    private static readonly ActivitySource MyActivitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

    public static void Main()
    {
        AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionHandler;

        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddSource("MyCompany.MyProduct.MyLibrary")
            .SetSampler(new AlwaysOnSampler())
            .SetErrorStatusOnException()
            .AddConsoleExporter()
            .Build();

        using (MyActivitySource.StartActivity("Foo"))
        {
            using (MyActivitySource.StartActivity("Bar"))
            {
                throw new Exception("Oops!");
            }
        }
    }

    private static void UnhandledExceptionHandler(object source, UnhandledExceptionEventArgs args)
    {
        var ex = (Exception)args.ExceptionObject;

        var activity = Activity.Current;

        while (activity != null)
        {
            activity.RecordException(ex);
            activity.Dispose();
            activity = activity.Parent;
        }
    }
}
```

> [!CAUTION]
>
> `AppDomain.UnhandledException` は注意して使用してください。
> このハンドラー内で例外をスローすると、プロセスが回復不能な状態になります。

## ベストプラクティス {#best-practices}

OpenTelemetry トレースで例外を報告する際のベストプラクティスは以下のとおりです。

1. **常にステータスを Error に設定する**：最低限、例外が発生した場合はアクティビティのステータスを Error に設定してください。

2. **例外の詳細を含める**：可能な場合は `RecordException()` を使用して、完全な例外情報をキャプチャしてください。

3. **未処理の例外を処理する**：未処理の例外がトレースにキャプチャされるよう、グローバルハンドラーの設定を検討してください。

4. **自動化を検討する**：例外のステータス設定を自動化するために、SDK の `SetErrorStatusOnException()` オプションを使用してください。

5. **カーディナリティに注意する**：変動性の高い例外メッセージをステータスの説明に直接含めると、スパンのカーディナリティが増加する可能性があるため注意してください。

## さらに学ぶ {#learn-more}

- [Activity API リファレンス](https://learn.microsoft.com/dotnet/core/diagnostics/distributed-tracing-concepts)

---
title: テイルベースサンプリング
linkTitle: テイルベースサンプリング
description: OpenTelemetry .NET で失敗したすべてのスパンをキャプチャするためのテイルベースサンプリングの実装方法を学ぶ
weight: 29
default_lang_commit: 7333fc19a0fc19b5aae57f2aae72861f76cbae3e
---

このガイドでは、OpenTelemetry .NET でヘッドベースサンプリングに加えて、失敗したすべてのアクティビティ（スパン）を含めるためのテイルベースサンプリングを実現する方法の1つを説明します。

## テイルベースサンプリングとは {#what-is-tail-based-sampling}

テイルベースサンプリングは、トレースが完了した後にサンプリングの判定を行い、トレースの完全なコンテキストに基づいたより的確な判断を可能にします。
これは、トレースの開始時に判定を行うヘッドベースサンプリングとは対照的です。

この実装では、カスタムサンプラーと `ActivityProcessor`（スパンプロセッサー）を組み合わせて、ハイブリッドアプローチを実現します。

- ヘッドベースサンプリング（確率的/偏りのないサンプリング）
- テイルベースサンプリング（非確率的/偏りのあるサンプリング）

## 実装のアプローチ {#implementation-approach}

SDK は、ヘッドベースサンプリングを行ってすべてのアクティビティの確率的なサブセットを取得するハイブリッドアプローチを使用します。
このサブセットには、成功したアクティビティと失敗したアクティビティの両方が含まれます。
加えて、すべての失敗したアクティビティをキャプチャします。

これを実現するために、以下のことを行います。

1. 親ベースのサンプラーの判定がアクティビティをドロップする場合、SDK は「Record-Only」のサンプリング結果を返します。
   これにより、アクティビティプロセッサーがそのアクティビティを受け取ることが保証されます。
2. アクティビティプロセッサーでは、アクティビティの終了時に、それが失敗したアクティビティかどうかを確認します。
   失敗した場合、SDK は判定を「Record-Only」からサンプリング済みフラグを設定するように変更し、エクスポーターがそのアクティビティを受け取るようにします。

この例では、各アクティビティは他のアクティビティとは関係なく個別にフィルタリングされます。

## テイルベースサンプリングを使用する場面 {#when-to-use-tail-based-sampling}

ヘッドベースサンプリングに加えて、すべての失敗したアクティビティを取得したい場合に適しています。
このアプローチでは、追加のコンポーネントをインストールすることなく、SDK レベルで基本的なアクティビティレベルのテイルベースサンプリングを実現できます。

## トレードオフ {#tradeoffs}

この方式のテイルサンプリングには、いくつかのトレードオフがあります。

1. **追加のパフォーマンスコスト**：
   ヘッドベースサンプリングではアクティビティの作成時にサンプリングの判定が行われるのに対し、テイルサンプリングでは終了時にのみ判定が行われるため、追加のメモリ/処理コストが発生します。

2. **部分的なトレース**：
   このサンプリングはアクティビティレベルで行われるため、生成されるトレースは部分的になります。
   たとえば、呼び出しツリーの別の部分が成功した場合、それらのアクティビティはエクスポートされず、不完全なトレースになる可能性があります。

3. **複数のエクスポーター**：
   複数のエクスポーターを使用している場合、この判定はすべてのエクスポーターに影響します。

## コード例 {#example-code}

実装は、以下の2つの主要コンポーネントで構成されています。

### 1. 「Record-Only」判定を許可するカスタムの親ベースサンプラー {#1-a-custom-parent-based-sampler-that-allows-record-only-decisions}

```csharp
public class ParentBasedElseAlwaysRecordSampler : Sampler
{
    private readonly Sampler _rootSampler;

    public ParentBasedElseAlwaysRecordSampler(Sampler rootSampler)
        : base()
    {
        _rootSampler = rootSampler ?? throw new ArgumentNullException(nameof(rootSampler));
    }

    public override SamplingResult ShouldSample(in SamplingParameters samplingParameters)
    {
        // 親がある場合、その親のサンプリング判定を使用する
        if (samplingParameters.ParentContext.TraceId != default)
        {
            if (samplingParameters.ParentContext.TraceFlags.HasFlag(ActivityTraceFlags.Recorded))
            {
                return new SamplingResult(SamplingDecision.RecordAndSample);
            }
            else
            {
                // ドロップする代わりに、プロセッサーで処理できるように
                // このアクティビティを記録する
                return new SamplingResult(SamplingDecision.RecordOnly);
            }
        }

        // これはルートアクティビティ。ルートサンプラーを使用して判定する。
        return _rootSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"ParentBasedElseAlwaysRecordSampler({_rootSampler.Description})";
}
```

### 2. 失敗したアクティビティを選択的にサンプリングするテイルサンプリングプロセッサー {#2-a-tail-sampling-processor-that-selectively-samples-failed-activities}

```csharp
public class TailSamplingProcessor : BaseProcessor<Activity>
{
    private readonly string _statusTagName;

    public TailSamplingProcessor(string statusTagName = "otel.status_code")
    {
        _statusTagName = statusTagName;
    }

    public override void OnEnd(Activity activity)
    {
        // アクティビティがすでにサンプリング済みの場合、何もする必要はない
        if (activity.ActivityTraceFlags.HasFlag(ActivityTraceFlags.Recorded))
        {
            return;
        }

        // エラーアクティビティかどうかを確認する
        bool isError = false;

        if (activity.Status == ActivityStatusCode.Error)
        {
            isError = true;
        }
        else if (activity.TagObjects != null)
        {
            foreach (var tag in activity.TagObjects)
            {
                if (tag.Key == _statusTagName)
                {
                    if (tag.Value?.ToString() == "ERROR")
                    {
                        isError = true;
                        break;
                    }
                }
            }
        }

        if (isError)
        {
            Console.WriteLine($"Including error activity with id {activity.Id} and status {activity.Status}");
            activity.ActivityTraceFlags |= ActivityTraceFlags.Recorded;
        }
        else
        {
            Console.WriteLine($"Dropping activity with id {activity.Id} and status {activity.Status}");
        }
    }
}
```

## 出力例 {#example-output}

このサンプラーとプロセッサーを使用してアプリケーションを実行すると、以下のような出力が表示されます。

```text
Including error activity with id
00-404ddff248b8f9a9b21e347d68d2640e-035858bc3c168885-01 and status Error
Activity.TraceId:            404ddff248b8f9a9b21e347d68d2640e
Activity.SpanId:             035858bc3c168885
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.5563112Z
Activity.Duration:           00:00:00.0028144
Activity.Tags:
    foo: bar
StatusCode: Error
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel

Dropping activity with id 00-ea861bda268c58d328ab7cbe49851499-daba29055de80a53-00
and status Ok

Including head-sampled activity with id
00-f3c88010615e285c8f3cb3e2bcd70c7f-f9316215f12437c3-01 and status Ok
Activity.TraceId:            f3c88010615e285c8f3cb3e2bcd70c7f
Activity.SpanId:             f9316215f12437c3
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.8519346Z
Activity.Duration:           00:00:00.0000034
Activity.Tags:
    foo: bar
StatusCode: Ok
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel
```

この出力は、以下のことを示しています。

1. エラーアクティビティは常に含まれる（テイルベースサンプリングによる）
2. 一部の OK アクティビティはドロップされる（ヘッドベースサンプリングで選択されなかった場合）
3. 一部の OK アクティビティは含まれる（ヘッドベースサンプリングによる）

## 完全な例 {#complete-example}

アプリケーションの動作を含む完全な例については、[OpenTelemetry .NET リポジトリ](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples)を参照してください。

---
title: 層化サンプリング
linkTitle: 層化サンプリング
description: OpenTelemetry .NET トレースにおける層化サンプリングの実装方法を学ぶ
weight: 28
default_lang_commit: a959f27bd17234efa9077aa77051017d6886d023
cSpell:ignore: userinitiated
---

このガイドでは、OpenTelemetry .NET で層化サンプリングを実現する1つの方法を紹介します。

## 層化サンプリングとは {#what-is-stratified-sampling}

層化サンプリングとは、母集団を相互に排他的な部分母集団（「層」）に分割する方法です。
たとえば、「クエリ」という母集団に対する層は「ユーザー起動のクエリ」と「プログラムによるクエリ」になります。
その後、各層は確率的サンプリング手法を使ってサンプリングされます。
これにより、すべての部分母集団が確実に表現されます。

## 実装アプローチ {#implementation-approach}

SDK は、内部に2つのサンプラーを保持するカスタム `Sampler` を使用してこれを実現します。
層に基づいて、適切なサンプラーが呼び出されます。

この前提条件として、層化サンプリングの判定に使用されるタグ（たとえば `queryType`）がアクティビティの作成時に提供される必要があります。

SDK は不均等層化サンプリング（「不等確率サンプリング」とも呼ばれます）を使用します。
たとえば、各部分母集団のサンプルサイズは全体の母集団における出現頻度に比例しません。
この例では、すべてのユーザー起動のクエリが確実に表現されるように、100% のサンプリングレートを使用し、プログラムによるクエリに対してはそれよりもはるかに低いサンプリングレートを選択しています。

## コード例 {#example-code}

主要なコンポーネントはカスタム `StratifiedSampler` クラスです。

```csharp
public class StratifiedSampler : Sampler
{
    private readonly string _stratifyByTagName;
    private readonly Dictionary<string, Sampler> _samplersByStratum;
    private readonly Sampler _defaultSampler;

    public StratifiedSampler(
        string stratifyByTagName,
        Dictionary<string, Sampler> samplersByStratum,
        Sampler defaultSampler)
        : base()
    {
        _stratifyByTagName = stratifyByTagName;
        _samplersByStratum = samplersByStratum;
        _defaultSampler = defaultSampler;
    }

    public override SamplingResult ShouldSample(
        in SamplingParameters samplingParameters)
    {
        ReadOnlySpan<KeyValuePair<string, object>> attributes =
            samplingParameters.Tags;

        for (int i = 0; i < attributes.Length; i++)
        {
            if (attributes[i].Key.Equals(_stratifyByTagName,
                StringComparison.OrdinalIgnoreCase))
            {
                string stratum = attributes[i].Value.ToString().ToLowerInvariant();
                if (_samplersByStratum.TryGetValue(stratum, out Sampler sampler))
                {
                    Console.WriteLine($"StratifiedSampler handling {stratum} query");
                    return sampler.ShouldSample(samplingParameters);
                }

                break;
            }
        }

        return _defaultSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"StratifiedSampler: {_stratifyByTagName}";
}
```

## 出力例 {#example-output}

このサンプラーを使用したアプリケーションを実行すると、以下のような出力が表示されます。

```text
StratifiedSampler handling userinitiated query
Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             83bdc6bbebea1df8
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       1ddd00d845ad645e
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8156879Z
Activity.Duration:           00:00:00.0008656
Activity.Tags:
    queryType: userInitiated
    foo: child
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType

Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             1ddd00d845ad645e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8115186Z
Activity.Duration:           00:00:00.0424036
Activity.Tags:
    queryType: userInitiated
    foo: bar
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType
```

この出力は、2つの部分母集団（層）が独立してサンプリングされ、各層に異なるサンプリングレートが適用されていることを示しています。

## 完全な例 {#complete-example}

アプリケーションを含む完全な例については、[OpenTelemetry .NET リポジトリ](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples)を参照してください。

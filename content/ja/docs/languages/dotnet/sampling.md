---
title: サンプリング
description: OpenTelemetry .NET でのサンプリングの設定
weight: 50
default_lang_commit: 5c22cf6079a4d8b0c01abe4244565b0f193cf9cc
---

サンプリングは、どのトレースを記録しエクスポートするかを制御します。
収集するスパンの数を減らすことで、サンプリングはオーバーヘッドとテレメトリーの量を制御するのに役立ちます。

OpenTelemetry では、サンプリングの判定は通常、トレースの開始時に行われ（ヘッドベースサンプリング）、コンテキストを通じて下流のサービスに伝搬されます。

## サンプラーの設定 {#configure-a-sampler}

.NET では、`TracerProvider` の `SetSampler` を使用してサンプリングを設定します。

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetSampler(new TraceIdRatioBasedSampler(0.25))
    .Build();
```

この例では、トレースの約 25% をサンプリングします。

## 組み込みサンプラー {#built-in-samplers}

OpenTelemetry .NET SDK には、いくつかの組み込みサンプラー実装が用意されています。
これらはコード内または環境変数で設定できます。

### AlwaysOn {#alwayson}

すべてのトレースをサンプリングします。

完全な可視性が必要な開発環境やデバッグ環境で便利です。

### AlwaysOff {#alwaysoff}

トレースをまったくサンプリングしません。

計装を削除せずにトレースを無効にする場合に便利です。

### TraceIdRatioBased {#traceidratiobased}

固定の確率に基づいてトレースをサンプリングします。

```csharp
.SetSampler(new TraceIdRatioBasedSampler(0.1)) // 10%
```

テレメトリーの量を削減しつつ、トレースの代表的なサブセットをキャプチャするために、本番環境でよく使用されます。

### ParentBased {#parentbased}

親スパンが存在する場合、その親のサンプリング判定を使用します。

親が存在しない場合は、ルートサンプラーに委任します。
これにより、同じトレースに参加する分散サービス間で一貫したサンプリング判定を行えます。

## デフォルトサンプラー {#default-sampler}

デフォルトでは、.NET SDK は AlwaysOn のルートサンプラーを持つ ParentBased サンプラーを使用します。

これは以下のことを意味します。

- 新しいルートトレースはサンプリングされる
- 子スパンは親のサンプリング判定に従う

## 環境変数による設定 {#environment-variable-configuration}

サンプリングは環境変数を使用して設定することもできます。
コンテナ化されたクラウドネイティブのデプロイメントで便利です。

### OTEL_TRACES_SAMPLER {#otel_traces_sampler}

使用するサンプラーを指定します。

一般的な値は以下のとおりです。

- `always_on`
- `always_off`
- `traceidratio`
- `parentbased_always_on`
- `parentbased_always_off`
- `parentbased_traceidratio`

### OTEL_TRACES_SAMPLER_ARG {#otel_traces_sampler_arg}

設定されたサンプラーに引数を提供します。

たとえば、以下のように設定します。

```bash
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.25
```

これにより、25% のサンプリングレートが設定されます。

## 本番環境のガイダンス {#production-guidance}

開発環境では、AlwaysOn サンプラーの使用が多くの場合許容されます。

本番環境では、ParentBased サンプリングと比率ベースのルートサンプラーを組み合わせるのが一般的なアプローチです。
これにより、サービス間でのトレースの一貫性を保ちながら、テレメトリーの量のバランスが取れます。

完了したトレースに基づいてサンプリングの判定を行う必要がある場合（たとえば、遅いトレースやエラーのあるトレースのみを保持する場合）、OpenTelemetry Collector でテイルベースサンプリングを使用してください。

## 参考資料 {#further-reading}

- [サンプリングのコンセプト](/docs/concepts/sampling/)
- [.NET でのトレース](/docs/languages/dotnet/traces/)

---
title: ベンチマーク
description: >-
  Python SDK におけるトレース、メトリクス、ロギング、バゲージ操作のスループット
weight: 190
default_lang_commit: ce13abdfc9fac8e92bf420b1f758451f63082c69
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-python/benchmarks/data.js
---

OpenTelemetry Python SDK は、[opentelemetry-python][] リポジトリへのコミットごとにベンチマークテストを実行しています。
これらのテストはエンドツーエンドのパフォーマンステストの代替ではありません。

このページはベンチマークの[データ][data]をグラフ表示しています。
完全なダッシュボードは [Python Benchmarks][] を参照してください。

> [!TIP]
>
> 以下のグラフのポイントにカーソルを合わせると、値とコミットが表示されます。
> クリックするとコミットへのリンクが開きます。

{{< benchmarks data_url="param:otel-benchmarks.data_url" >}}

<!-- prettier-ignore-start -->
[data]: <{{% _param otel-benchmarks.data_url %}}>
[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python/
[Python Benchmarks]: https://open-telemetry.github.io/opentelemetry-python/benchmarks/
<!-- prettier-ignore-end -->

---
title: ベンチマーク
description: >-
  JavaScript SDKにおけるスパン、メトリクス、ログ、バゲッジ操作のスループット
weight: 101
default_lang_commit: 4b9a057a2bfb37e1ff1aff5b4dd4c7da363d7a86
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-js/benchmarks/data.js
---

OpenTelemetry JavaScript SDKは、[opentelemetry-js][]リポジトリへの各コミットでベンチマークテストを実行します。
これらのテストは、エンドツーエンドのパフォーマンステストの代替ではありません。

このページはベンチマーク[データ][data]をグラフで表示します。
完全なダッシュボードについては、[JavaScript Benchmarks][]を参照してください。

> [!TIP]
>
> 下のグラフのポイントにマウスを合わせると、値とコミットが表示されます。
> クリックすると該当コミットへのリンクが開きます。

{{< benchmarks data_url="param:otel-benchmarks.data_url" >}}

<!-- prettier-ignore-start -->
[data]: <{{% _param otel-benchmarks.data_url %}}>
[JavaScript Benchmarks]: https://open-telemetry.github.io/opentelemetry-js/benchmarks/
[opentelemetry-js]: https://github.com/open-telemetry/opentelemetry-js/
<!-- prettier-ignore-end -->

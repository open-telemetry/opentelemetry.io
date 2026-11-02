---
title: ベンチマーク
description: >-
  毎秒1万件のログ、メトリクス、トレース負荷におけるCollectorのCPUとメモリ使用量
weight: 99
default_lang_commit: 908ed9e2733fb2f91c43e9822f4eb4d68cebf65c
params:
  otel-benchmarks:
    data_url: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js
---

OpenTelemetry Collectorは、[opentelemetry-collector-contrib][]リポジトリへのすべてのコミットで負荷テストを実行しています。
これらの負荷テストでは、テストごとにさまざまな設定オプションでコレクターのバイナリを実行し、コレクターを通じてトラフィックを送信します。
テスト環境に関する詳細は、[Testbed][]で確認できます。

このページにはベンチマーク[データ][data]の一部がグラフとして表示されています。
すべての結果については、[Collector Benchmarks][]を参照してください。

> [!TIP]
>
> 以下のグラフ上のポイントにカーソルを合わせると、値とコミットが表示されます。
> ポイントをクリックすると、そのコミットへのリンクに移動できます。

{{< benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " >}}

<!-- prettier-ignore-start -->
[Collector Benchmarks]: https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/
[opentelemetry-collector-contrib]: https://github.com/open-telemetry/opentelemetry-collector-contrib/
[data]: <{{% _param otel-benchmarks.data_url %}}>
[Testbed]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/testbed#opentelemetry-collector-testbed
<!-- prettier-ignore-end -->

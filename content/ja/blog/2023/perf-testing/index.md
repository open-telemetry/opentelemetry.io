---
title: OTel コンポーネントのパフォーマンスベンチマーク
linkTitle: パフォーマンスベンチマーク
date: 2023-11-27
author: '[Martin Kuba](https://github.com/martinkuba) (Lightstep)'
default_lang_commit: 17662c24ee2f9789a70287c4ad02707582e3de98
cSpell:ignore: Kuba
---

ますます多くのユーザーが本番環境で OpenTelemetry の計装を使おうとしている中、重要な検討事項の1つは、OpenTelemetry がアプリケーションのパフォーマンスに与える影響です。
このブログ記事では、パフォーマンスベンチマークに関するツールの最近の改善点についていくつか紹介します。

## パフォーマンスオーバーヘッドの測定 {#measuring-performance-overhead}

計装は無料ではありません。
アプリケーションの操作をインターセプトし、（多くの場合）大量のデータを収集するため、追加の CPU とメモリを消費します。
これはスループットとレスポンスタイムに直接的な影響を与え、アプリケーションのエンドユーザー体験に影響する可能性があります。
また、サービスが実行されるインスタンス数の増加など、運用コストにも影響を与える可能性があります。

パフォーマンスオーバーヘッドに関する一般的なガイダンスを提供することは本質的に困難です。
パフォーマンスに影響を与える要因は多数あります。
アプリケーションのスループット、アプリケーションが実行されるハードウェア、正確に何が計装されているか、OpenTelemetry SDK の設定、サンプリングなどです。
最終的に、パフォーマンスを測定する最善の方法は、特定のアプリケーションのコンテキストにおいて負荷テストを実行することです。

とはいえ、多くの OpenTelemetry コンポーネントにはリグレッションを検出し、パフォーマンス特性をある程度把握するために使用できるパフォーマンステストが含まれています。

## OpenTelemetry Collector {#opentelemetry-collector}

[OpenTelemetry Collector](/docs/collector/) は、main ブランチへのマージごとに[エンドツーエンドの負荷テスト](https://github.com/open-telemetry/opentelemetry-collector-contrib/actions/workflows/load-tests.yml)を実行しています。
CI ワークフローには最近2つの更新がありました。

1. テストはコミュニティ所有のベアメタルマシンで実行されるようになり、テスト結果がより一貫したものになりました。
2. テスト結果は自動的に公開されるようになりました。
   負荷テスト結果の一部については、[Collector Benchmarks](/docs/collector/benchmarks/) を参照してください。
   [完全なテスト結果](https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/)も利用可能です。

## 言語 SDK {#language-sdks}

多くの OpenTelemetry SDK には、既存のマイクロベンチマークテストがすでに含まれています。
たとえば以下のようなものがあります。

- [SpanBenchmark.java](https://github.com/open-telemetry/opentelemetry-java/blob/bf3c4f3085d631b08d2cd210c1ddc3cd86182a53/sdk/trace/src/jmh/java/io/opentelemetry/sdk/trace/SpanBenchmark.java?from_branch=main)
- [test_benchmark_trace.py](https://github.com/open-telemetry/opentelemetry-python/blob/b3ab961b375298791274296099cb45136df0132f/opentelemetry-sdk/tests/performance/benchmarks/trace/test_benchmark_trace.py?from_branch=main)
- [benchmark_test.go](https://github.com/open-telemetry/opentelemetry-go/blob/80cb9097743d4fe0443cbf9465d01bf8e56cc175/sdk/trace/benchmark_test.go?from_branch=main)
- [benchmark/span.js](https://github.com/open-telemetry/opentelemetry-js/blob/e5f2d4234e2c172ec7290f140f29a39062087fe3/packages/opentelemetry-sdk-trace-base/test/performance/benchmark/span.js?from_branch=main)

これらのテストは以前はオンデマンドでのみ実行されていました。
最近のツールの改善により、Java と JavaScript のテストは main ブランチへのマージごとに自動的に実行されるようになり、結果は誰でも簡単にアクセスできるように公開されています。
テストはコミュニティ所有のベアメタルマシンでも実行されているため、結果は可能な限り一貫したものとなっています。

{{% figure
  src="java-benchmark-results.png"
  caption="Sample [benchmark results for Java](https://open-telemetry.github.io/opentelemetry-java/benchmarks/)"
%}}

{{% figure
  src="js-benchmark-results.png"
  caption="Sample [benchmark results for JavaScript](https://open-telemetry.github.io/opentelemetry-js/benchmarks/)"
%}}

Python と Go についても同様の更新を行う作業が進行中です。

## まとめ {#conclusion}

パフォーマンスの最適化は後付けとしてのみ考えられることが多いですが、そうである必要はありません。
プロジェクトのメンテナーとコミュニティに、開発中に実施できる信頼性の高いパフォーマンステストを提供するために、自動化ツールとドキュメントの改善を進めています。
コミュニティとしての最終的な目標は、エンドユーザーが私たちのコンポーネントを使用する際に、特に OpenTelemetry の計装がアプリケーションのパフォーマンスに与える影響について、安心して使えるようにすることです。

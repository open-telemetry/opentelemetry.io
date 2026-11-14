---
title: OpenCensus 互換性要件の非推奨化
linkTitle: OpenCensus 互換性の非推奨化
date: 2026-06-23
author: '[Krishna Chaitanya Balusu](https://github.com/Krishnachaitanyakc)'
issue: https://github.com/open-telemetry/opentelemetry-specification/pull/5138
sig: Specification
default_lang_commit: f1d6481f046978944c738e08097c7682ec966501
cSpell:ignore: Balusu Chaitanya Krishna
---

2026年6月12日、OpenTelemetry Specification プロジェクトは [PR #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138) をマージし、仕様における OpenCensus 互換性要件を非推奨としました。

この変更は、エコシステムがすでに到達している状況に合わせて仕様を更新するものです。
[OpenCensus は2023年7月31日にアーカイブ](/blog/2023/sunsetting-opencensus/)されており、OpenCensus 向けの OpenTelemetry シムは3年以上にわたって安定した移行ブリッジを提供してきました。

これは仕様要件の非推奨化であり、互換性に関する記述を即座に削除するものでも、既存のシムの成果物を今すぐ削除することを求めるものでもありません。

## 何が変わるのか {#what-is-changing}

- 仕様における OpenCensus 互換性要件が非推奨になります。
- 新しい SDK や実装において、新たに OpenCensus 互換性を実装することはもはや必須ではありません。
- 既存の OpenCensus シムは、非推奨期間中、後方互換性のために引き続きサポートできます（MAY）。
- 新しい作業では、新たな OpenCensus への依存を導入するのではなく、ネイティブの OpenTelemetry API、SDK、および OTLP ベースのワークフローを対象とすべきです。

## なぜ今なのか {#why-now}

OpenCensus は2023年7月にアーカイブされており、エコシステムでの採用はネイティブの OpenTelemetry API と OTLP ベースのワークフローに収束してきました。
このプロジェクトには、[2023年の OpenCensus リポジトリのサンセット](/blog/2023/sunsetting-opencensus/)、[Zipkin エクスポーターの非推奨化](/blog/2025/deprecating-zipkin-exporters/)（[仕様 PR #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715)）、および [OpenTracing 互換性の非推奨化](/blog/2026/deprecating-opentracing-compatibility/)（[仕様 PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938)）など、過去の非推奨化作業から、こうした段階的なアプローチの前例もあります。

## タイムラインとポリシー {#timeline-and-policy}

- **仕様の非推奨化**: **2026年6月**より有効。
- **仕様からの最も早い削除時期**: マージされた仕様本文に記載のとおり、**2027年6月より前にはなりません**。
- **シムのサポート**: 既存の OpenCensus シムは、[OpenTelemetry の SDK 安定性保証](/docs/specs/otel/versioning-and-stability/#sdk-support)に従い、少なくとも1年間はメンテナンスを継続します。

## ユーザーは何をすべきか {#what-should-users-do}

まだ OpenCensus シムに依存している場合、今こそネイティブの OpenTelemetry API および SDK への移行を計画する良い時期です。

まずは次のページを確認してください。

- 2023年のサンセット告知からの [OpenTelemetry への移行方法](/blog/2023/sunsetting-opencensus/#how-to-migrate-to-opentelemetry)。
- [OpenCensus 互換性の仕様 — 移行パス](/docs/specs/otel/compatibility/opencensus/#migration-path)。
- 言語別のシム:
  [Go](https://github.com/open-telemetry/opentelemetry-go/tree/928d4f3726bf08e5be046752ebae169ad9f9376a/bridge/opencensus)、
  [Java](https://github.com/open-telemetry/opentelemetry-java/tree/a5cd87f127cd8d4e5845bc1e29360f815a6f01c8/opencensus-shim)、
  [JavaScript](https://github.com/open-telemetry/opentelemetry-js/tree/13a035bc695996cf4aec885fef7b9866f48bc555/experimental/packages/shim-opencensus)、
  および
  [Python](https://github.com/open-telemetry/opentelemetry-python/tree/51c1d1888c4045b8296e088fa307738685321bf3/shim/opentelemetry-opencensus-shim)。

## おわりに {#closing}

ここでの非推奨化は、OpenCensus 互換性に関する記述を即座に削除することを意味するものではありません。
新しい SDK や計装がネイティブの OpenTelemetry API と OTLP を対象とすべきであることを明文化し、仕様をエコシステムがすでに到達している状況に合わせるためのものです。

フィードバックや移行に関する障壁がありましたら、[仕様 PR #5138](https://github.com/open-telemetry/opentelemetry-specification/pull/5138) または[元となったイシュー #5109](https://github.com/open-telemetry/opentelemetry-specification/issues/5109) でお知らせください。

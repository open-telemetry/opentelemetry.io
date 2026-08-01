---
title: OpenTracing 互換性要件の非推奨化
linkTitle: OpenTracing 互換性の非推奨化
date: 2026-04-23
author: '[Amol Patil](https://github.com/adp2201)'
issue: 9385
sig: Specification
default_lang_commit: e17943afc3a71a67fcdd3a69dcd428c3e45b306d
cSpell:ignore: Patil
---

2026年3月19日、OpenTelemetry Specification プロジェクトは [PR #4938](https://github.com/open-telemetry/opentelemetry-specification/pull/4938) をマージし、仕様における OpenTracing 互換性要件を非推奨としました。

この変更は、エコシステムがすでに到達している状況に合わせて仕様を更新するものです。
OpenTracing は何年も前にアーカイブされており、新しいインテグレーションは、OpenTracing のシム要件の上に構築するのではなく、ネイティブの OpenTelemetry API および SDK を使用することが期待されています。

これは仕様要件の非推奨化であり、互換性に関する記述を即座に削除するものでも、既存のシムの成果物を今すぐ削除することを求めるものでもありません。

## 何が変わるのか {#what-is-changing}

- 仕様における OpenTracing 互換性要件が非推奨になります。
- 新しい SDK や実装において、新たに OpenTracing 互換性を実装することはもはや必須ではありません。
- 既存の OpenTracing シムは、非推奨期間中、後方互換性のために引き続きサポートできます。
- 新しい作業では、新たな OpenTracing への依存を導入するのではなく、ネイティブの OpenTelemetry API、SDK、および OTLP ベースのワークフローを対象とすべきです。

## なぜ今なのか {#why-now}

OpenTracing 自体は何年も前にアーカイブされており、エコシステムでの採用はネイティブの OpenTelemetry API と OTLP ベースのワークフローに収束してきました。
このプロジェクトには、[PR #4715](https://github.com/open-telemetry/opentelemetry-specification/pull/4715) での Zipkin エクスポーターの非推奨化など、過去の非推奨化作業から、こうした段階的なアプローチの前例もあります。

## タイムラインとポリシー {#timeline-and-policy}

- **仕様の非推奨化**: **2026年3月**より有効。
- **仕様からの最も早い削除時期**: マージされた仕様本文に記載のとおり、**2027年3月より前にはなりません**。

## ユーザーは何をすべきか {#what-should-users-do}

まだ OpenTracing シムに依存している場合、今こそネイティブの OpenTelemetry API および SDK への移行を計画する良い時期です。

まずは次のページを確認してください。

- [OpenTracing からの移行](/docs/compatibility/migration/opentracing/)
- [OpenTracing 互換性の仕様ページ](/docs/specs/otel/compatibility/opentracing/)

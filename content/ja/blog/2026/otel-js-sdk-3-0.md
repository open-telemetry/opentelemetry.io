---
title: OpenTelemetry JavaScript SDK 3.0 のリリース
linkTitle: OTel JS SDK 3.0
date: 2026-11-05
author: >
  [Trent Mick](https://github.com/trentm) (Elastic), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
sig: OpenTelemetry JS
default_lang_commit: b2eb2bb46b0da10900c8fc36e3ee39b22b9894d9
cSpell:ignore: Gutierrez Marylia maryliag trentm
---

[OpenTelemetry JavaScript](/docs/languages/js/) は SDK 3.0（[安定版 v3.0.0 パッケージ][sdk-v3.0.0] および [実験的 v0.300.0 パッケージ][sdk-v0.300.0]）と API [1.10.0][api-v1.10.0] をリリースしました。

[sdk-v3.0.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/v3.0.0
[sdk-v0.300.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.300.0
[api-v1.10.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/api%2Fv1.10.0

> [!NOTE] マイグレーションガイド
>
> 破壊的変更の詳細については、[OpenTelemetry JS SDK 3.x マイグレーションガイド][migration guide]を参照してください。

[migration guide]: https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md

## JS SDK 3.x とは {#what-is-js-sdk-3x}

JS SDK 3.x は、[`opentelemetry-js` リポジトリ](https://github.com/open-telemetry/opentelemetry-js)から公開されている `@opentelemetry/*` JavaScript パッケージの新しいリリースを包含するもので、API パッケージおよび semantic-conventions パッケージは除きます。
この新しいメジャーバージョンのパッケージバージョンは、安定版が `>=3.0.0`、不安定版が `>=0.300.0` です。
パッケージの完全な一覧については[マイグレーションガイド][migration guide]を参照してください。

加えて、[`opentelemetry-js-contrib` リポジトリのすべてのパッケージ](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/3c07d44fc3d9d890fc659e653acde418ee081c51/packages)が JS SDK 3.x にアップグレードされ、リリースされました。

[OpenTelemetry のガイドライン](/docs/specs/otel/versioning-and-stability/#sdk-support)に従い、安定版 SDK パッケージの 2.x バージョンは 3.0.0 リリースから1年間サポートされます。

## 変更点 {#what-has-changed}

- **サポートされる Node.js の最小バージョンが `>=22.15.0` に引き上げられました。**
  これは、Node.js 18 および 20 のサポートが廃止されたことを意味します。
- すべてのパッケージが[**適切な ES Module（ESM）および CommonJS エクスポート**](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-dual-cjsesm-exports)を提供するようになりました。
  これにより、ESM やバンドラーを使用するユーザーにとって使い勝手が大幅に向上します。
- OTEP 4485 に基づく**複合属性**のサポートが API の一部（スパン属性、ログレコード属性など）に追加されました。
  API の一部では単純属性のみサポートされています（リソース属性、メトリクス属性など）。
  詳細は[マイグレーションガイドの解説](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-support-for-complex-attribute-values)を参照してください。
- `@opentelemetry/api-logs` パッケージが `@opentelemetry/api` に統合されました。
  **ログシグナルが安定版になりました！**
  ログの安定化により、OpenTelemetry の3つのシグナル（トレース、メトリクス、ログ）すべてが JavaScript で安定版となりました。
  この安定化については別途ブログ記事を投稿する予定です。
- [複数のトレーシング SDK パッケージが統合](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/doc/3.x/migration-guide.md#-opentelemetrysdk-trace-base-package-removed)され、`@opentelemetry/sdk-trace` パッケージにまとめられました。
  これにより、紛らわしい API が排除され、他のシグナルの SDK との一貫性が確保されました。
- 多くの非推奨パッケージが削除されました。
  `@opentelemetry/propagator-jaeger`、`@opentelemetry/exporter-jaeger`、`@opentelemetry/shim-opentracing`、`@opentelemetry/shim-opencensus` などが含まれます。
  完全な一覧についてはマイグレーションガイドを参照してください。
- **パブリックインターフェイスが変更されました。**
  いくつかのパブリック型やクラス名が名前変更または移動されました。

_API_ パッケージ（`@opentelemetry/api`）には破壊的変更はありません。
また、[ゼロコード計装](/docs/zero-code/js/)で説明されているように `@opentelemetry/auto-instrumentations-node` パッケージを使用しているユーザーは変更の必要はありません。

3.x / 0.300.x への移行に関する詳細と注意事項については、[マイグレーションガイド][migration guide]を参照してください。

## なぜこの変更が行われたのか {#why-was-this-done}

2025年3月の [SDK 2.0 リリース](/blog/2025/otel-js-sdk-2-0/)以降、OTel JS SIG はおよそ1年ごとに新しい SDK メジャーリリースを行うことを目標としてきました。
このケイデンスにより、[新しい Node.js メジャーリリース](https://github.com/nodejs/release#release-schedule)や、より最近の JavaScript エコシステムおよびツールの改善に対応し続けることができます。

3.0 に関して具体的には以下の理由があります。

- Node.js 20 は2026年4月にサポート終了を迎えました。
- 適切な ESM エクスポートを提供するにはパッケージエントリポイントの変更が必要でした。
- 非推奨かつメンテナンスされていないパッケージを削除することで、SIG は現在の機能に集中できるようになります。
- ログの安定化と複合属性のサポートには API と SDK の変更が必要でした。

## 参加するには {#how-can-i-get-involved}

SDK 3.x 以降の開発に貢献するにはいくつかの方法があります。

- [v3.0.0][sdk-v3.0.0] と [v0.300.0][sdk-v0.300.0] のリリースを試して、フィードバックを提供してください。
- コントリビューションの詳細については、[コントリビューションガイド](https://github.com/open-telemetry/opentelemetry-js/blob/44be44c2ed8a1e0fb0fd06a2142fca49c0ebbec3/CONTRIBUTING.md)を確認してください。
- [SIG ミーティング](https://github.com/open-telemetry/community/blob/2c7afdc7fef121bcded259c1234489b834a770e8/sigs.md#javascript-sdk)に参加してください。
- [Slack](https://cloud-native.slack.com/archives/C01NL1GRPQR) でコラボレーションしてください。

## 謝辞 {#acknowledgments}

メジャーリリースの出荷には多くの協調的な作業が必要であり、SDK 3.0 は時間を費やしてくれた多くの人々なしには実現しませんでした。
設計に関する議論、移行に関するプルリクエスト、長時間にわたるレビュー、そして何を破壊的変更とし何を維持するかについての慎重な判断に取り組んでくれた OpenTelemetry JavaScript SIG に感謝します。
また、より広い OpenTelemetry コミュニティと、このリリースに貢献してくださったすべての方々にも感謝します。

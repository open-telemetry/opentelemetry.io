---
title: OpenTelemetry JavaScript SDK 2.0 のリリース
linkTitle: OTel JS SDK 2.0
date: 2025-03-26
author: >
  [Jamie Danielson](https://github.com/JamieDanielson) (Honeycomb)
sig: OpenTelemetry JS
default_lang_commit: ab6ef133372515d3267cf99f06d4e5f8db0ef409
cSpell:ignore: Danielson
---

うれしいニュースです。
[OpenTelemetry JavaScript](/docs/languages/js/) の [SDK 2.0][v2.0.0] がリリースされました！

[v2.0.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/v2.0.0

> [!NOTE] マイグレーションガイド
>
> 破壊的変更の詳細については、**マイグレーションガイド**を参照してください。
> [OpenTelemetry JS SDK 2.x へのアップグレード][migration guide]

[migration guide]: https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main

## JS SDK 2.x とは {#what-is-js-sdk-2x}

JS SDK 2.x は、[`opentelemetry-js` リポジトリ](https://github.com/open-telemetry/opentelemetry-js)から公開されている `@opentelemetry/*` JavaScript パッケージの新しいリリースを包含するもので、API パッケージおよび semantic-conventions パッケージは除きます。
この新しいメジャーバージョンのパッケージバージョンは、安定版が `>=2.0.0`、不安定版が `>=0.200.0` です。
パッケージの完全な一覧については[マイグレーションガイド][migration guide]を参照してください。

## 変更点 {#what-has-changed}

概要は以下のとおりです。

- **サポートされる Node.js の最小バージョンが `^18.19.0 || >=20.6.0` に引き上げられました。**
  これは、Node.js 14 および 16 のサポートが廃止されたことを意味します。
- **サポートされる TypeScript の最小バージョンが 5.0.4 に引き上げられました。**
- **トランスパイルされた TypeScript のコンパイルターゲットが ES2022 に引き上げられました**（ES2017 から）。
- **パブリックインターフェイスが変更されました。**
  - 2.x / 0.200.x への移行に関する注意事項は、[アップグレードガイド](https://github.com/open-telemetry/opentelemetry-js/tree/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main)を参照してください。

詳細は以下のとおりです。

- [Node.js のサポートバージョン](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-nodejs-supported-versions)
- [TypeScript のサポートバージョン](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-typescript-supported-versions)
- [ES2022 コンパイルターゲット](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-es2022-compilation-target)
- [ブラウザでの `window.OTEL_*` サポートの廃止](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-drop-windowotel_-support-in-browsers)
- [`@opentelemetry/resources` の API 変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-opentelemetryresources-api-changes)
- [`@opentelemetry/core` の API 変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-opentelemetrycore-api-changes)
- [トレーシング SDK の API 変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-tracing-sdk-api-changes)
- [`@opentelemetry/sdk-metrics` の API 変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-opentelemetrysdk-metrics-api-changes)
- [リソースディテクターの*実装者*向け `@opentelemetry/resources` の変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-opentelemetryresources-changes-for-implementors-of-resource-detectors)
- [その他の変更](https://github.com/open-telemetry/opentelemetry-js/blob/4636de6a16d338a418ee901ee6b685b887585c4f/doc/upgrade-to-2.x.md?from_branch=main#-other-changes)

## なぜこの変更が行われたのか {#why-was-this-done}

以下の領域で破壊的変更を許容することで、最大の恩恵が得られると考えていました。

- 最適化: クラスと名前空間を削除し、より効果的なミニファイとツリーシェイキングを可能にする。
- より良いツーリングとサポート: 古いランタイムとツールバージョンを廃止し、ESM サポートの強化を活用し、ドキュメントを簡素化する。
- 開発速度: コードの複雑さを軽減し、非推奨フィールドを削除することで、機能開発とメンテナンス作業を迅速化する。

これは、毎年新しい SDK メジャーリリースを行うという目標の始まりでもあります。

2.0 の理由についてのより詳しい説明は、イシュー [#4083][] を参照してください。

[#4083]: https://github.com/open-telemetry/opentelemetry-js/issues/4083

## 参加するには {#how-can-i-get-involved}

[v0.200.0]: https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.200.0

- [v2.0.0][] と [v0.200.0][] のリリースを試して、フィードバックを提供してください。
- コントリビューションの詳細については、[コントリビューションガイド](https://github.com/open-telemetry/opentelemetry-js/blob/2d3716cb858aa79be36bca778b0b2301b3d50748/CONTRIBUTING.md?from_branch=main)を確認してください。
- [SIG ミーティング](https://groups.google.com/a/opentelemetry.io/g/calendar-js)に参加してください。
- [Slack](https://cloud-native.slack.com/archives/C01NL1GRPQR) でコラボレーションしてください。

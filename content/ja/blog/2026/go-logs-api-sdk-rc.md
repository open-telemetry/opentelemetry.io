---
title: OpenTelemetry Go Logs API と SDK がリリース候補ステータスに到達
linkTitle: OTel Go Logs API と SDK が RC に到達
date: 2026-08-31
author: '[Robert Pająk](https://github.com/pellared) (Splunk)'
issue: 11476
sig: SIG Go
default_lang_commit: a92bba88db05bd6684fabb0648c351f1c6d937ad
cSpell:ignore: logtest Pająk
---

OpenTelemetry Go `v1.47.0-rc.1` がリリースされました。
このリリースでは、Logs API と SDK がリリース候補（RC）に昇格しました。
これは安定版 v1 の互換性保証を提供する前の最終段階です。
設計は準備が整ったと考えており、互換性保証が発効する前に、コミュニティの皆さんに実際のアプリケーションやインテグレーションでテストしていただく必要があります。

## リリース候補に含まれるもの {#what-is-included-in-the-release-candidate}

RC は以下の2つのモジュールを対象としています。

- `go.opentelemetry.io/otel/log`
- `go.opentelemetry.io/otel/sdk/log`

これらのモジュールはベータ安定性の `v0.22.0` から `v1.47.0-rc.1` に移行します。
このバージョンは、協調的なバージョン番号を共有する他の安定版 OpenTelemetry Go モジュールと整合しています。
ログエクスポーターおよび `logtest` モジュールは引き続き実験的であり、この RC の安定性スコープには含まれません。

このリリースでは、ルートパッケージ `go.opentelemetry.io/otel` に `Logger`、`GetLoggerProvider`、`SetLoggerProvider` が追加されました。
`go.opentelemetry.io/otel/log/global` の同等の API は非推奨になりました。
これにより、グローバルなロガーアクセスが、トレーサーやメーターで既に使用されているパターンと統一されます。

完全なリリースノートについては、[リリース候補のリリース][rc-release]を参照してください。

## リリース候補への道のり {#the-journey-to-release-candidate}

現在の設計に向けた作業は、2023年後半の [Logs API とブリッジのプロトタイプ][api-prototype]から始まりました。
このプロトタイプにはベンチマークと初期のブリッジが含まれており、API のコミットメント前に形状とコストの両方をテストできました。

[最初の Logs API アルファ版][api-alpha]は2024年2月に続き、[最初の Logs SDK アルファ版][sdk-alpha]は4月に登場しました。
2024年5月には、[API と SDK を合わせた最初のベータリリース][beta-release]を公開しました。
それ以来、進化する OpenTelemetry Logs 仕様に継続的に追従し、API を当初のブリッジ中心のユースケースから直接利用へと拡大し、レコード表現、処理、制限、ライフサイクル動作、パフォーマンスを改善してきました。
最近の変更には、シグナル間で共通の [`attribute.Value` と `attribute.KeyValue` 型][shared-attributes]の採用と、エクスポーターのバックプレッシャー下でより安全な動作を実現するための [`BatchProcessor` の再設計][batch-redesign]が含まれています。

この長いベータ期間は意図的なものでした。
ロギングはアプリケーションの最もホットなパスにあることが多く、API が安定版になった後は修正がはるかに難しくなります。
互換性の約束を急ぐのではなく、実装やインテグレーションから学ぶのに十分な時間を確保したかったのです。

## 設計の指針 {#what-guided-the-design}

API と SDK を仕様に準拠し、堅牢で、可能な限り効率的にすることを目指しました。
同時に、OpenTelemetry Go のトレースやメトリクス API を使ったことがある人にとって馴染みやすいものにすることも重視しました。

- **仕様への準拠:** 公開されている抽象化と動作は、並行性、コンテキスト相関、レコード制限、プロセッサーとエクスポーターのライフサイクル要件を含む、OpenTelemetry Logs API および SDK 仕様を実装するよう設計されています。
- **堅牢性:** `BatchProcessor` は有界キューを使用し、ログの発行がエクスポーターの I/O を待たないようにしています。
  SDK はまた、明示的なフラッシュとシャットダウンのセマンティクスを定義しています。
- **パフォーマンス:** レコードとホットパスの操作は、ヒープアロケーションとガベージコレクションの負荷を削減するよう設計されています。
  SDK は、バッチプロセッサーを備えた OTLP エクスポーターという一般的な構成向けに最適化されています。
- **馴染みやすさ:** プロバイダー、計装スコープ、オプション、プロセッサー、エクスポーター、グローバルアクセスは、トレースおよびメトリクス API で確立されたパターンに従っています。
  そのため、Logs API は別のロギングフレームワークではなく、同じ Go SDK の一部のように感じられるはずです。

意思決定とトレードオフは、[Logs API 設計ドキュメント][api-design]と [Logs SDK 設計ドキュメント][sdk-design]に文書化されています。
これらのドキュメントには、検討した代替案や、レコード表現、属性の取り扱い、拡張性、バッチングモデルなどの選択理由も記録されています。

## RC を試す {#try-the-rc}

以下のモジュールをリリース候補に更新してください。

```sh
go get go.opentelemetry.io/otel@v1.47.0-rc.1
go get go.opentelemetry.io/otel/log@v1.47.0-rc.1
go get go.opentelemetry.io/otel/sdk/log@v1.47.0-rc.1
```

その上で、ご自身の環境で重要なパスを実行してみてください。
直接的な API 利用、ロギングブリッジ、カスタムプロセッサーやエクスポーター、大量のワークロード、属性の制限、アプリケーションのシャットダウンなどが対象です。

## 問題があれば今すぐ報告してください {#please-report-problems-now}

問題が発生した場合は、OpenTelemetry Go リポジトリで[新しいイシューを作成][new-issue]してください。
RC バージョン、Go のバージョン、可能であれば最小限の再現手順、期待していた動作を記載してください。

**フィードバック期間:** この投稿が公開されてから少なくとも14日間は、Logs API と SDK の安定化を待ちます。
重要な発見により別の RC が必要になった場合は、その RC の公開時に14日間のフィードバック期間を再開します。
これにより、安定化前に大きな変更をコミュニティが検証する時間が確保されます。

このフィードバック期間は重要です。
Logs API と SDK を安定化すると、[バージョニングポリシー][versioning]により v1 ライン全体を通じて互換性が求められます。
文書化された例外を除き、v1 内で破壊的な API 変更による問題修正はできなくなります。
互換性のない修正は、新しいメジャーバージョンまで待つ必要があります。
API の形状、動作、拡張ポイント、パフォーマンス特性がご自身のユースケースに合わない場合は、今がお知らせいただくタイミングです。

フィードバックを評価した後、必要な RC の更新を行い、Logs API と SDK を安定版に移行します。
設計、実装、レビュー、ベンチマーク、インテグレーション、フィードバックを通じて貢献してくださったすべての皆さんに感謝します。

[api-design]: https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/log/DESIGN.md
[api-alpha]: https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.24.0
[api-prototype]: https://github.com/open-telemetry/opentelemetry-go/pull/4725
[batch-redesign]: https://github.com/open-telemetry/opentelemetry-go/pull/8620
[beta-release]: https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.27.0
[new-issue]: https://github.com/open-telemetry/opentelemetry-go/issues/new/choose
[rc-release]: https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.47.0-rc.1
[sdk-design]: https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/sdk/log/DESIGN.md
[sdk-alpha]: https://github.com/open-telemetry/opentelemetry-go/pull/5260
[shared-attributes]: https://github.com/open-telemetry/opentelemetry-go/pull/8490
[versioning]: https://github.com/open-telemetry/opentelemetry-go/blob/73b17d449376ccd8420f84fc8d5d4435ad44e0d6/VERSIONING.md

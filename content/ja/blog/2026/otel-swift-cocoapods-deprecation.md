---
title: 'OpenTelemetry Swift の CocoaPods 非推奨化に関するお知らせ'
linkTitle: OTel Swift CocoaPods の非推奨化
date: 2026-07-20
author: '[Ariel Demarco](https://github.com/ArielDemarco)'
issue: 10655 # TODO: See https://opentelemetry.io/docs/contributing/blog/ for details (Required)
sig: Swift # TODO: add the name of the SIG that sponsors this blog post (Required)
default_lang_commit: 52bc572fc569401f35171b4138844754e5dac670
cSpell:ignore: cocoapods podspec
---

[CocoaPods Support Plan](https://blog.cocoapods.org/CocoaPods-Support-Plans/?ref=jsdelivr-blog.ghost.io) および [CocoaPods Spec Repository](https://blog.cocoapods.org/CocoaPods-Specs-Repo/) で発表されたとおり、CocoaPods はプロジェクトをメンテナンスモードに移行しており、cocoapods trunk は数か月以内に読み取り専用になる予定です。

OpenTelemetry Swift のメンテナーは、`opentelemetry-swift` および `opentelemetry-swift-core` で公開されているすべての pod について、CocoaPods サポートを非推奨化する予定です。

Swift Package Manager（SPM）が、すべての新規インテグレーションで推奨される優先的なインストール方法となりました。

既存の CocoaPods ユーザーには、SPM への移行計画を開始することをお勧めします。

## なぜこの変更を行うのか {#why-are-we-making-this-change}

複数のパッケージ配布システムのメンテナンスは、プロジェクトのメンテナーやコントリビューターの運用負担を増加させます。

加えて、CocoaPods エコシステム自体がインフラストラクチャとメンテナンスモデルの大幅な変更を発表しており、オープンソースプロジェクトにとって長期的なサポートがますます困難になっています。
その結果、最近ではすべての podspecs のメンテナンス、断続的なアップロードの問題、その他の CocoaPods 関連の問題により、CocoaPods サポートは私たちにとって決して手間のかからない作業とは言えなくなりました。

近年、Swift Package Manager は Apple エコシステムにおける標準的な依存関係管理ソリューションとなり、Apple が推奨する主要なパッケージマネージャーとなっています。

Swift Package Manager に注力することで、以下のことが可能になります。

- リリースとメンテナンスの複雑さの軽減
- リリースの信頼性の向上
- コントリビューターのワークフローの簡素化
- Apple 開発エコシステムの方向性とのより良い連携
- 配布ツールやトリアージではなく、SDK の改善にコントリビューターやメンテナーの時間をより多く充てること

## タイムライン {#timeline}

マイルストーンはまだ議論中ですが、おそらく以下のようになる見込みです。

| マイルストーン                   | 日付              |
| -------------------------------- | ----------------- |
| 非推奨化のアナウンス             | 7月               |
| 推奨移行期間の開始               | 2026年8月31日     |
| CocoaPods への最終リリースの公開 | 2026年9月30日まで |
| CocoaPods サポートの終了         | 2026年12月2日     |

## 既存ユーザーにとっての意味 {#what-does-this-mean-for-existing-users}

1. 既存の CocoaPods インテグレーションは引き続き機能します。
1. CocoaPods サポートが正式に終了した後は、以下のようになります。
   1. 以前に公開されたバージョンは引き続き利用可能です。
   1. 新しい SDK リリースは CocoaPods に公開されません。
   1. 追ってお知らせがあるまで、`.podspec` はリポジトリに残します。
   1. 新機能、バグ修正、セキュリティアップデートは、Swift Package Manager のリリースを通じてのみ利用可能になります。
   1. コントリビューターは、CocoaPods インテグレーション固有の問題の調査や解決にリソースを投入しません。

## 推奨される移行方法 {#recommended-migration-path}

できるだけ早い段階で Swift Package Manager への移行をお勧めします。

Swift Package Manager は完全にサポートされており、今後唯一の配布メカニズムとなります。

CocoaPods から SPM への移行は簡単です。
コミュニティには利用できるガイドやドキュメントがあります。

## フィードバック {#feedback}

一部の組織が依然として CocoaPods ベースのワークフローに依存していることは理解しています。

「推奨移行期間」を確定する前に、移行に関する課題、ツールのギャップ、運用上の懸念について、コミュニティからフィードバックを収集したいと考えています。

[GitHub Issues](https://github.com/open-telemetry/opentelemetry-swift/issues/new)、CNCF Slack の [#otel-swift](https://cloud-native.slack.com/archives/C01NCHR19SB) を通じてフィードバックをお寄せいただくか、毎週の [SIG Meetings](https://groups.google.com/a/opentelemetry.io/g/calendar-swift) にご参加ください。

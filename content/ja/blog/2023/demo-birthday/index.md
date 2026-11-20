---
title: OpenTelemetry デモが1(.4)歳に
linkTitle: OTel デモのアップデート
date: 2023-04-21
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
default_lang_commit: f22173f04f4dce6eefe102811371ec79b8cbd4f3
---

![OTel デモが 1.4 に](demo-birthday-3.png 'The OTel Demo turns 1.4')

1.4.0 リリースの準備を進めている今、信じがたいことですが、[OpenTelemetry デモ](/docs/demo/)は1周年を迎え、[1.0.0 リリース](/blog/2022/announcing-opentelemetry-demo-release/)で一般提供を宣言してから6ヶ月が経ちました。

## プロジェクトのマイルストーン {#project-milestones}

デモは最初の1年で目覚ましいマイルストーンを達成しました。
**70人超のコントリビューター、20の公式ベンダーフォーク、780の GitHub スター、180K の Docker プル**を記録しています。
プロジェクトチームは新しい機能の追加と既存機能の改善に精力的に取り組み、*460超のマージ済み PR、5つのサービスを新しい言語で書き直し、7つのまったく新しいコンポーネント/サービス*を提供しました。

セマンティック規約の安定化に取り組んでいると、時間はあっという間に過ぎます。
しかし、1.0.0 と 1.4.0 リリースの間で実際に何が変わったのでしょうか。
実はかなり多くの変更がありました。

## 主なハイライト {#the-highlights}

- **追加のサービスを加えたにもかかわらず、ビルド時間を2倍改善**
- _arm64 アーキテクチャ（M1 および M2 Mac）のサポートを追加_
- **Kafka を使用した非同期サポートと、新しい不正検出（Kotlin）/会計処理（Go）サービス**
- _Helm を使わずに Kubernetes デプロイを可能にする Kubernetes マニフェスト_
- **[コレクターデータフローダッシュボード](/docs/demo/collector-data-flow-dashboard/)のような、すぐに使えるダッシュボードを追加**
- **フロントエンドの多数のバグ修正**
- _テレメトリーパイプラインをリンクする方法を示すための、コレクター初の[コネクター](https://github.com/open-telemetry/opentelemetry-collector/blob/9fd84668bb02d15e0b055516b7eaefc988e0b33a/connector/README.md?from_branch=main)_
- **Java ログ SDK や JavaScript/Go メトリクス SDK などの新しい OTel SDK**
- _Ad、Currency、Product Catalog サービスでの新しい手動メトリクス計装_
- **PHP のゼロコード自動計装**
- _インフラストラクチャ情報でデータを充実させるブラウザーおよびコンピュートリソースディテクター_
- **表示された広告の10回に1回エラーを発生させるなどの[フィーチャーフラグシナリオ](/docs/demo/feature-flags/)を追加**
- _サービス再起動を修正する全般的な安定性の改善_

詳細な変更点については、[リリースノート](https://github.com/open-telemetry/opentelemetry-demo/releases)または[変更履歴](https://github.com/open-telemetry/opentelemetry-demo/blob/06d55710725a6d3a3adcbc0f336c472c7ac4a69d/CHANGELOG.md?from_branch=main)をご覧ください。

## 参加するには {#get-involved}

コントリビューターの皆さんはこのすべてに不可欠な存在であり、プロジェクトチームは感謝してもしきれません。
新しい機能の追加やコミュニティのツールの進化に伴い、開発は常に進行中です。
ご協力いただける方は、[コントリビューションガイド](https://github.com/open-telemetry/opentelemetry-demo/blob/59c9b2ca32be41e464fedc1eed6dcf4ad1503c3d/CONTRIBUTING.md?from_branch=main)をご確認いただくか、[Slack チャンネル](https://cloud-native.slack.com/archives/C03B4CWV4DA)にご参加ください。

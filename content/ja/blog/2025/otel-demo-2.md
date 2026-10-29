---
title: OpenTelemetry Demo 2.0 のリリースのお知らせ
linkTitle: OTel Demo 2.0
date: 2025-02-21
author: >
  [Juliano Costa](https://github.com/julianocosta89) (Datadog)
sig: OpenTelemetry Demo
default_lang_commit: eab64e41b388032bae1475f226e5e9e437ab314d
cSpell:ignore: Abhishek
---

OpenTelemetry Demo 2.0 のリリースをお知らせできることをうれしく思います！
私たちはこれまで、裏側でデモをより完成度を高く、堅牢で、使いやすいものにするための改善を重ねてきました。
これらのエキサイティングな機能と改善はメジャーリリースにふさわしいと考えています！

本題に入る前に、プロジェクトの統計情報を見てみましょう。

## 統計情報 {#statistics}

OpenTelemetry Demo には合計140名のコントリビューターがおり、**2048** 回スターされています。
2022年10月26日、つまり一般提供開始の2日後に、1日あたり40スターという記録を達成しました。
Demo を利用している方は、プロジェクトの普及を支援するためにぜひスターを付けてください。

Demo のフォーク数は合計1.8Kです。
特に [Abhishek Veeramalla のフォーク][1]は142スターを獲得し、425回フォークされています。

Demo のコンテナは **1200万回超** プルされています（`ghcr.io` から1180万回、`hub.docker` から43.3万回）。

OpenTelemetry Demo には以下の CNCF プロジェクトが含まれています。

- もちろん [OpenTelemetry](/)
- [Envoy][2]
- [OpenFeature/Flagd][3]
- [Jaeger][4]
- [Prometheus][5]
- [Valkey][6]

## 2.0 の新機能 {#whats-new-in-20}

このリリースにはエキサイティングなアップグレードと変更が盛り込まれています。
以下はハイライトの概要です。

- **Flagd-ui の導入**: バージョン1.9.0以降、最も惜しまれていた機能の1つが復活しました！
  Demo 内で直接フィーチャーフラグを管理できるようになりました。
  詳しくは[フィーチャーフラグ](/docs/demo/feature-flags/)のページをご覧ください。
- **Image-provider の導入**: リリース1.10.0以降、Image Provider という新しいサービスを導入しました。
  このサービスは静的な商品画像を配信します。
  NGINX 上に構築されたこのサービスは、すべての商品の画像を返し、NGINX Native OpenTelemetry モジュールを使用した NGINX プロキシでの OpenTelemetry の計装方法を示します。
- **Redis を Valkey に置き換え**: バージョン1.11.0以降、Redis サービスを Valkey に置き換え、OTel Demo にもう1つの CNCF プロジェクトを導入しました。
- **ビルド引数を `.env` ファイルに移動**: Demo をフォークしてカスタムイメージを使用していた場合、フォークを upstream と同期し続けるのは常に手間がかかりました。
  これを容易にするため、ほとんどの設定を `.env` ファイルに移動しました。
  また、ビルド手順の場所を指定できる `_DOCKERFILE` 環境変数も追加しました。
- **サービス名の変更**: OTel Demo を初期から使用してきた方は、各サービスの冗長な命名に慣れていたかもしれません。
  2.0では、すべてのサービス名から `-service` 接尾辞を削除してシンプルにしました。
  `ad-service`、`cart-service`、`checkout-service` のかわりに、`Ad`、`Cart`、`Checkout` と表示されるようになりました。
- **Accounting を .NET で書き直し**: 追加のサービスを増やさずに、Demo で OTel の .NET 自動計装を紹介したいと考えていました。
  Accounting サービスはもともと Go で書かれており、同じ言語のサービスがすでに存在していたため、.NET で書き直すことにしました。
  現在、Demo には `Accounting` と `Cart` の両サービスがあり、それぞれ .NET アプリケーションの異なる計装方法を示しています。
- **エグゼンプラーの追加**: `Cart` サービスは `GetCart` と `AddItem` の操作でエグゼンプラーを記録するようになり、メトリクスとスパンの相関付けが可能になりました。
  詳しくは [Cart ドキュメントのエグゼンプラーセクション](/docs/demo/services/cart/#exemplars)をご覧ください。
- **React Native サンプルアプリ**: このリリースで最も重要な追加の1つが、新しい React Native アプリのサンプルです。
  Android または iOS 向けにビルドできます（現在はローカルでのみ実行可能）。
  実行およびテストの手順については、[React Native App ドキュメントページ](/docs/demo/services/react-native-app/)をご覧ください。
- **メッセージングスパンのスパンリンク**: OTel のプロデューサースパンとコンシューマースパンを常にリンクするという推奨事項（[メッセージングスパン - トレース構造](/docs/specs/semconv/messaging/messaging-spans/#trace-structure)）に従い、Demo でこのベストプラクティスを実演するようになりました。
  `Accounting` と `Fraud-Detection` のコンシューマースパンは、プロデューサースパン（`Checkout/orders publish`）にリンクされています。
- **マルチアーキテクチャビルド**: さまざまなユーザーが Demo をローカルで実行できるよう、マルチプラットフォームイメージ（`arm64` と `amd64` の両アーキテクチャ）のビルドをサポートする新しい `make` ターゲットを導入しました。
- **Dependabot の設定**: いくつかの依存関係の更新が遅れていましたが、Dependabot を設定して Demo を自動的に最新の状態に保つようにしました。

## 現在の課題 {#current-challenges}

もちろん、大きなアップデートにはいくつかの成長痛が伴います。
現在取り組んでいる課題は以下のとおりです。

- **Grafana ダッシュボード**: セマンティック規約やツールが新しいリリースで進化するにつれ、Grafana ダッシュボードが完全に機能し続けるようにすることは課題です。
  Grafana の経験がある方は、ぜひご協力ください！
- **Dependabot PR のテスト**: Dependabot はすべてのサービスの依存関係を最新に保つのに役立っていますが、更新がクラッシュを引き起こさないことを保証する自動テストはまだ実装されていません。
  このテストは現在も手動プロセスです。
- **Demo のスケーラビリティ**: デモシナリオの拡張と Demo をローカルで簡単に実行できる状態の維持とのバランスをとることは、最も大きな課題の1つです。
  19の異なるサービスがあり、毎週新しいアイデアが生まれる中、このバランスを維持するために継続的に取り組んでいます。

## 次のステップ {#whats-next}

私たちはここで立ち止まりません！
次に予定しているステップの一部をご紹介します。
ぜひご協力ください。

- **Erlang/Elixir の復活**: 2024年3月に、OpenFeature と Flagd を採用するために Elixir で書かれた初期のフィーチャーフラグサービスを削除しました。
  それ以降、Demo にはこの言語のサービスが含まれていませんでしたが、Erlang/Elixir の再導入を目指しています。
  この分野でのご協力を大いに歓迎します！
- **React Native アプリのリモートアクセス**: React Native アプリからリモートで実行中の Demo にアクセスできるようにし、利用可能性を拡大する予定です。
- **自動化とテストの改善**: 特に Dependabot PR に対する自動化とテストプロセスの改善に取り組み、開発ワークフローを効率化する予定です。

## 参加しよう！ {#get-involved}

皆さんのフィードバックとコントリビューションがこのプロジェクトを活性化させています。
ダッシュボードの改善、テストの自動化、Erlang/Elixir の復活など、貢献にご興味がある方は、ぜひ [GitHub リポジトリ][7]や SIG ミーティング（[calendar-demo][8]）での議論に参加するか、[#otel-community-demo Slack チャンネル][9]にお越しください。

継続的なご支援に感謝します。楽しいデモ体験を！

[1]: https://github.com/iam-veeramalla/ultimate-devops-project-demo
[2]: https://www.envoyproxy.io/
[3]: https://flagd.dev/
[4]: https://www.jaegertracing.io/
[5]: https://prometheus.io/
[6]: https://valkey.io/
[7]: https://github.com/open-telemetry/opentelemetry-demo
[8]: https://groups.google.com/a/opentelemetry.io/g/calendar-demo-app
[9]: https://cloud-native.slack.com/archives/C03B4CWV4DA

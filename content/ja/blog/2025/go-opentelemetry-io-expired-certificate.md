---
title: 9月25日の go.opentelemetry.io インシデントの振り返り
linkTitle: go.opentelemetry.io インシデントの振り返り
date: 2025-09-26
author: >-
  [Damien Mathieu](https://github.com/dmathieu) (Elastic) [Pablo
  Baeyens](https://github.com/mx-psi) (Datadog)
default_lang_commit: d9691092259cdae7341ff4796022aab9a2219883
cSpell:ignore: baeyens goog
---

9月25日 10:35 UTC に、`go.opentelemetry.io` の SSL 証明書が期限切れになったという通知を受けました。

このエンドポイントは、OpenTelemetry 組織内のほとんどの Go モジュールの正規 URL です。
そのため、このエンドポイントからモジュールをダウンロードすることが不可能になりました。

## 何が起きたのか {#what-happened}

このエンドポイントは現在 Google App Engine プラットフォーム上で動作しており、SSL 証明書は Google によって管理されています。
これは [opentelemetry.io](/) ドメイン配下でこのプラットフォーム上で動作する唯一のエンドポイントです。

昨年7月、あるセキュリティリサーチャーから、ルートの OpenTelemetry ドメイン（[opentelemetry.io](/)）に [CAA DNS レコード](https://en.wikipedia.org/wiki/DNS_Certification_Authority_Authorization)がないことを指摘されました。
そのため、[ルートドメインの証明書に使用されている認証局](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/#netlify-managed-certificates)である LetsEncrypt を唯一の発行者とする CAA レコードを追加しました。

Google の CA が CAA レコードの発行者として登録されていなかったため、AppEngine プラットフォームは [go.opentelemetry.io](https://go.opentelemetry.io) の証明書を更新できませんでした。
そのため、9月25日 10:08:10 UTC に証明書が期限切れになると、すべてのリクエストが期限切れ証明書のエラーを返すようになりました。
これにより、ビルドシステムや [go.opentelemetry.io](https://go.opentelemetry.io) パッケージのドキュメント閲覧に問題が発生しました。

このプラットフォーム上で動作するアプリはこれが唯一であり、経験のある人が米国在住の数名に限られていたため、彼らが起きるまで効率的な対応が困難でした。
12:03 UTC に Google Cloud コンソールへのアクセスを取得し、12:14 UTC に [CAA レコード](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs#caa)に問題があることを特定しました。

12:16 UTC に、Google が適切に証明書を生成できるよう新しい CAA レコードをデプロイしました。
DNS の変更を検知すれば、プラットフォームが新しい SSL 証明書を再生成するだろうと想定していました。
この想定は正しかったようですが、プラットフォームが CAA レコードを再確認するまでに最大1日かかる可能性がありました。

13:58 UTC までに DNS レコードの伝搬を確認しましたが、証明書は生成されていませんでした。
残念ながら、インシデント対応に関わったメンバーはこのプラットフォームに関する知識が乏しく、証明書を強制的に再生成する方法を把握していませんでした。

14:54 UTC に SSL 証明書のマネージドセキュリティを無効化してから再有効化したところ、証明書が強制的に再生成されました。
数分後、リクエストが再び成功するようになりました。

## 詳細なタイムライン {#detailed-timeline}

- 10:08 UTC – [go.opentelemetry.io](https://go.opentelemetry.io) の SSL 証明書が期限切れ
- 10:35 UTC – ユーザーからの最初の問題報告
- 11:31 UTC – [このインシデントを追跡するパブリックイシュー](https://github.com/open-telemetry/opentelemetry-go-vanityurls/issues/81)を作成
- 12:03 UTC – golang-imports プロジェクトの Google Cloud コンソールへのアクセスを取得
- 12:14 UTC – CAA レコードに「pki.goog」発行者が欠けていることを特定
- 12:16 UTC – 正しい発行者セットを含む新しい CAA レコードをデプロイ
- 13:58 UTC – CAA レコードの伝搬を確認したが、SSL 証明書はまだ更新されていなかった
- 14:54 UTC – SSL 証明書のマネージドセキュリティを無効化してから再有効化
- 15:16 UTC – [go.opentelemetry.io](https://go.opentelemetry.io) の新しい SSL 証明書が発行されたことを確認

## 教訓 {#lessons-learned}

このインシデントが発覚すると、複数のメンバーがすぐに参加し、何が起きているのか把握しようとしました。
世界中に散らばるオープンソースプロジェクトとして、これは心強いことでした。

このアプリケーションが動作しているプラットフォームに関する知識が不足しており、そのためにインシデントの解決が必要以上に長引きました。
しかし、[約1年前](/blog/2024/go-opentelemetry-io/)にこのアプリが動作する Google アカウントを変更していたことは幸いでした。
変更していなければ、この問題を自分たちで修正することすらできなかったでしょう。

## アクションアイテム {#action-items}

AppEngine コンソールへのアクセスをより迅速に取得できるよう、[プレイブックの改善](https://github.com/open-telemetry/community/pull/3021)を開始しました。

このアプリケーションが特殊な存在でなくなるようにし、OpenTelemetry が維持する他のすべてのパブリックウェブサイトと同じ方法で運用できるようにする必要があります。
そのため、AppEngine プラットフォームから [opentelemetry.io](/) ウェブサイトを運用している Netlify プラットフォームへの[移行を検討](https://github.com/open-telemetry/opentelemetry-go-vanityurls/issues/83)する予定です。

また、あるユーザーの協力により、[opentelemetry.io](/) の未使用サブドメインのうち、期限切れの証明書を提供しているものがいくつかあることを特定しました。
これらはユーザーへの影響はありませんが、[それらの削除を検討](https://github.com/open-telemetry/community/issues/3022)する予定です。

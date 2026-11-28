---
title: 要対応 - 6月20日（金）に Slack ワークスペースの変更が行われます
linkTitle: Slack ワークスペースの変更
date: 2025-06-17
author: OpenTelemetry maintainers
default_lang_commit: f73c0ca547d4c6160a6afa492e36992b1876299b
---

昨日、Cloud Native Computing Foundation（CNCF）は、CNCF Slack ワークスペースが2025年6月20日（金）にエンタープライズプランからフリープランに変更されることを[発表しました](https://www.cncf.io/blog/2025/06/16/cncf-slack-workspace-changes-coming-on-friday-june-20/)。
この変更は OpenTelemetry コミュニティにおける Slack の使い方に影響を及ぼし、注意すべきいくつかの制限が生じます。
ただし、この変更がコラボレーションに大きな影響を与えるとは考えていません。

OpenTelemetry から Slack ワークスペースへのアクセスは中断されませんが、すべてのユーザーとプロジェクトコントリビューターは以下の対応を検討してください。

- **プライベートチャンネルの履歴とダイレクトメッセージをエクスポートしてください。**
  新しいフリープランでは、投稿が90日間しか保持されません。
  金曜日以降、90日以上前の投稿にはアクセスできなくなります。
  CNCF はすべてのパブリックチャンネルの履歴をバックアップしています。
  保存しておきたいプライベートチャンネルやダイレクトメッセージがある場合は、[CNCF のガイド](https://github.com/cncf/foundation/blob/268daffb181e0cb2bc36947039c0400c68e506f7/policies-guidance/slack-backup.md?from_branch=main)に従ってコンテンツをローカルにエクスポートして保存してください。
- **ファイルをバックアップしてください。**
  Slack に保存されているファイルは削除されます！
  金曜日までにファイルをダウンロードし、GitHub や Google Docs に保存してください。
- **ピン留めされた投稿を保存してください。**
  ピン留めされた投稿に保存されている重要な情報は、金曜日以降アクセスできなくなる可能性があります。
  情報のコピーを作成して GitHub や Google Docs に保存してください。
  チャンネルにブックマークを追加して、その保存先へのリンクを設定できます。

詳細は CNCF の[ブログ記事](https://www.cncf.io/blog/2025/06/16/cncf-slack-workspace-changes-coming-on-friday-june-20/)を参照してください。
質問がある方やディスカッションの経過を追いたい方は、[#slack-faq](https://cloud-native.slack.com/archives/C091NUGP5KN) チャンネルにご参加ください。

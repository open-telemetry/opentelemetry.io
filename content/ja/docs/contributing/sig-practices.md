---
title: 承認者およびメンテナーのための SIG のプラクティス
linkTitle: SIG のプラクティス
description: 承認者およびメンテナーがどのようにイシューやコントリビューションを管理するかを学びます。
weight: 999
default_lang_commit: 0cdf20f0dcbf7305541f8eab3001c95ce805fbc0
cSpell:ignore: chalin docsy
---

このページでは、承認者およびメンテナーが使用するガイドラインと一般的なプラクティスについて説明します。

## オンボーディング {#onboarding}

コントリビューターがドキュメントに対する責任の大きい役割（承認者、メンテナー）を引き受ける場合、既存の承認者およびメンテナーによってオンボーディングが行われます。

- `docs-approvers`（または `docs-maintainers`）グループに追加されます
- `#otel-comms`、`#otel-maintainers`、およびチーム内のプライベート Slack チャンネルに追加されます
- [SIG Comm ミーティング](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)と[メンテナーミーティング](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting)のカレンダー招待への登録を求められます
- SIG Comm の現在のミーティング時間が適しているかを確認し、適さない場合は既存の承認者およびメンテナーと調整して、全員に適した時間を決定します
- コントリビューター向けのさまざまなリソースを確認します
  - [コミュニティリソース](https://github.com/open-telemetry/community/)。
    特に、[コミュニティメンバーシップ](https://github.com/open-telemetry/community/blob/main/community-membership.md) と
    [ソーシャルメディアガイド](https://github.com/open-telemetry/community/blob/main/social-media-guide.md) に関するドキュメント
  - [コントリビューションガイドライン](/docs/contributing)。この一環として、これらのドキュメントをレビューし、イシューやプルリクエストを通じて改善するためのフィードバックを提供します

以下は、追加で確認すると有益なリソースです。

- [Hugo ドキュメント](https://gohugo.io/documentation/)
- [Docsy ドキュメント](https://www.docsy.dev/docs/)
- [マーケティングガイドライン](/community/marketing-guidelines/)。これは、Linux Foundation のブランドおよび
  [商標使用ガイドライン](https://www.linuxfoundation.org/legal/trademark-usage) 含みます。
  これらは、レジストリ、インテグレーション、ベンダー、導入事例、ディストリビューションのエントリーをレビューする際に特に重要です

## コラボレーション {#collaboration}

- 承認者およびメンテナーは、それぞれ異なる勤務時間や状況です。
  そのため、すべてのコミュニケーションは非同期とみなされ、通常のスケジュール外で返信する義務はありません
- 承認者またはメンテナーが長期間（数日または1週間以上）不在となる場合は、
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) チャンネルでの通知や GitHub ステータスの更新を行います。
- 承認者およびメンテナーは、[OTel 行動規範](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct) と[コミュニティの価値観](/community/mission/#community-values)に従います。
  彼らはコントリビューターに対して親切かつ協力的であり、何らかの対立や誤解、不快になるような状況が承認者またはメンテナーに生じた場合は、会話、イシューまたは PR から一歩引いて別の承認者やメンテナーに対応を依頼できます

## コードレビュー {#code-reviews}

### 一般 {#general}

- PR のブランチが `out-of-date with the base branch`（ベースブランチと同期していない）場合、継続的に更新する必要はありません。
  各更新ごとに CI チェックが再実行されます！
  マージ前に更新すれば十分です
- 非メンテナーによる PR で git サブモジュールを**決して**更新しないでください。
  これは時々誤って起こります。
  PR 作成者にその必要はないことを伝えてください。
  マージ前にこれを修正しますが、将来的には最新のフォークから作業する必要があります
- コントリビューターが CLA に署名できない場合、またはコミットの 1 つで誤って間違ったメールアドレスを使用した場合は、問題を修正するか、プルリクエストをリベースするように依頼してください。
  最悪の場合、PR を閉じて再度開き、新しい CLA チェックをトリガーします
- `cspell` に未知の単語は、PR 作成者によってページごとに `cspell` の ignore リストに追加される必要があります。
  承認者とメンテナーのみが、よく使用される用語をグローバルリストに追加します

### 共同所有 PR {#co-owned-prs}

SIG が共同所有するドキュメント（コレクター、デモ、言語固有など）を変更する PR は、ドキュメント承認者による承認と SIG 承認者による承認の 2 つの承認を目指す必要があります。

- ドキュメント承認者は PR に `sig:<name>` ラベルを付与し、SIG `-approvers` グループのタグ付与します
- ドキュメント承認者が PR を承認した後、[`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing) ラベルを追加します。
  これにより SIG に対応を促します
- SIG の承認が一定期間（通常 2 週間、緊急の場合は短縮可能）内に得られない場合、ドキュメントメンテナーの判断でマージできます

### ボットによる PR {#prs-from-bots}

ボットが作成した PR は以下の方法でマージできます。

- レジストリのバージョンを自動更新する PR は、即座に修正、承認、マージ可能です
- SDK、ゼロコード計装、またはコレクターのバージョンを自動更新する PR は、対応する SIG がマージを延期する必要があることを通知しない限り、承認およびマージできます
- 仕様のバージョンを自動更新する PR では、CI チェックに合格するためにスクリプトの更新が必要になることがよくあります。
  その場合は [@chalin](https://github.com/chalin/) が対応します。
  それ以外の場合は、対応する SIG がマージを延期する必要があることを通知しない限り、それらの PR は承認され、マージされる可能性があります

### 翻訳 PR {#translation-prs}

翻訳の変更を含む PR は、2 人の承認を目指します。
1 人はドキュメント承認者で、1 人は翻訳承認者です。
共同所有 PR の手順と同様のプラクティスが適用されます。

### PR のマージ {#merging-prs}

メンテナーは以下のワークフローを適用して PR をマージできます。

- PR がすべての承認を得ており、CI チェックが通っていることを確認します
- ブランチが最新でない場合、GitHub UI からリベースで更新を行います
- 更新により CI チェックが再実行されるため、チェックが成功するのを待つか、次のようなスクリプトを使用してバックグラウンドで実行します。

  ```shell
  export PR=<PR の ID>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```

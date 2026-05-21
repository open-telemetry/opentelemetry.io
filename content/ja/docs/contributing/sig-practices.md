---
title: 承認者およびメンテナーのための SIG のプラクティス
linkTitle: SIG のプラクティス
description: 承認者およびメンテナーがどのようにイシューやコントリビューションを管理するかを学びます。
weight: 999
cSpell:ignore: Comms contribfest
default_lang_commit: bb20a7fb593782fea0e05e988d1478831726f9f5
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

## トリアージ {#triage}

### イシュー {#issues}

- 新規のイシューは `@open-telemetry/docs-triagers` チームによってトリアージされます。
- 最初のステップとして、トリアージをする人はイシューのタイトルと説明を読み、以下のラベルを適用します
  - 必須: `sig:*`, `lang:*` または `docs:*` ラベルを適用してイシューの所有権を決定します
    - イシューが SIG によって共同所有されているコンテンツまたは質問と関連する場合は、`sig:*` ラベルが適用されます。たとえば、コレクターに関する質問は `sig:collector` ラベルが適用されます。
    - イシューが特定のローカリゼーションに関するコンテンツまたは質問と関連する場合は、`lang:*` ラベルが適用されます。
    - イシューがドキュメントチーム (SIG Comms) によって単独で所有されているコンテンツまたは質問と関連する場合は、`docs:*` ラベルが適用されます
      - `docs`
      - `docs:admin`
      - `docs:accessibility`
      - `docs:analytics-and-seo`
      - `docs:IA`
      - `docs:blog`
      - `docs:cleanup/refactoring`
      - `docs:upstream`, `docs:upstream/docsy`
      - `docs:javascript`
      - `docs:mobile`
      - `docs:registry`
      - `docs:ux`
  - 必須: `triage:*` ラベル
    - `triage:accepted`、`triage:accepted:needs-pr`
    - `triage:deciding`、`triage:deciding:blocked`、`triage:deciding:needs-info`
    - `triage:rejected`、`triage:rejected:duplicate`、`triage:rejected:invalid`、`triage:rejected:wontfix`
  - 必須: イシューの "type" を以下のように設定します
    - バグには `bug` イシュータイプ
    - 機能要望には `enhancement` イシュータイプ
    - 質問には `type:question` ラベル
    - 文章校正には `type:copyedit` ラベル
    - 作業として対応できない、方向性の定まらない議論の場合は、イシューを "discussions" に移動します
  - 任意: 該当する場合は、以下の見積もりラベルを適用します
    - `e0-minutes`
    - ...
    - `e4-months`
  - 任意 (メンテナーのみ): 優先度ラベル
    - `p0-critical`
    - `p1-high`
    - `p2-medium`
    - `p3-low`
  - 任意: 以下の特殊タグのいずれか
    - `good first issue`
    - `help wanted`
    - `contribfest`
    - `maintainers only`
    - `forever`
    - `stale`
- イシュー上で 14 日間活動がない場合、自動化により `triage:deciding` 状態のイシューに
  `triage:followup` ラベルが付与され、再トリアージの対象となります。
  `triage:followup` ラベルは 7 日以内に削除する必要があります。
  参加者へのメンションとラベルの削除で、十分な活動とみなされます。

### PR {#prs}

- 以下の例外を除いて、PR は `triage:accepted` ラベルが付与されたイシューとリンクされている必要があります
  - 自動的な PR
  - メンテナーまたは承認者によるホットフィックス
- 自動化により、PR は適切な共同所有 SIG またはローカリゼーションチームに[ラベル付け](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml)および[割り当て](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml)されます。
- PR はイシューと同じ共同所有ラベルをもつ必要があります
- SIG により PR が共同所有されている場合、このグループは、内容が技術的に正しいかを確認するための最初のレビューを行う責任があります。
- 言語チームにより PR が共同所有されている場合、このグループは、内容の翻訳が正確かどうかを確認するための最初のレビューを行う責任があります。
- ドキュメントチームの主な責務は、PR がプロジェクトの全体目標に沿っているか、構造内の適切な場所に配置されているか、スタイルおよびコンテンツガイドに従っているかを確認することです。
- マージに必要なものが欠けている PR には、適切なラベルを付与する必要があります
  - `missing:cla`
  - `missing:docs-approval`
  - `missing:sig-approval`
  - `blocked`
- PR 上で 21 日間活動がない場合、自動化により `stale` ラベルが付与され、再レビューが求められます。
  `stale` ラベルは 14 日以内に削除する必要があります。
  参加者へのメンションとラベルの削除で、十分な活動とみなされます。
- PR は決して自動的に閉じられません。

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
- cSpell に未知の単語は、以下の 3 つのうちいずれかの ignore リストに追加できます
  - **ページフロントマター**:
    一般的に、1 度しか現れない単語に適しています。
    詳細は[スペルチェック][Spell Checking]を参照してください。
  - **ロケール辞書**:
    `.cspell/en-words.txt` のように、同じ言語における複数のページで使用される単語に適しています。
  - **共通 (すべてのロケール) 単語リスト**:
    `.cspell/all-words.txt`。
    製品名や人名のように、スペルがすべての言語で有効な単語に適しています。
    詳細は[スペルチェック][Spell Checking]を参照してください。

  レビュワーと承認者は、レビュー中に配置が適切かどうかを判断できます。

[Spell Checking]: ../style-guide/#spell-checking

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

## PR のマージ {#merging-prs}

メンテナーは以下のワークフローを適用して PR をマージできます。

- PR がすべての承認を得ており、CI チェックが通っていることを確認します
- ブランチが最新でない場合、GitHub UI からリベースで更新を行います
- 更新により CI チェックが再実行されるため、チェックが成功するのを待つか、次のようなスクリプトを使用してバックグラウンドで実行します。

  ```shell
  export PR=<PR の ID>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```

## 仕様の PR と統合ブランチ {#spec-integration-branches}

ウェブサイトは、[opentelemetry-specification][] と [semantic-conventions][] リポジトリからの未リリースの変更を連続的に統合しています。
2 つのスケジュールされたワークフロー ([詳細][ci-section]) が毎日実行され、ドラフトの "integration" PR を次の dev バージョンに合わせて最新の状態に保ちます。

- ブランチパターン: `otelbot/spec-integration-vX.Y.Z-dev` および `otelbot/semconv-integration-vX.Y.Z-dev`。
- 稼働中のブランチ一覧: [spec][spec-branches] · [semconv][semconv-branches]。

[opentelemetry-specification]: https://github.com/open-telemetry/opentelemetry-specification
[semantic-conventions]: https://github.com/open-telemetry/semantic-conventions
[ci-section]: /site/build/ci-workflows/#spec-integration-branches
[spec-branches]: https://github.com/open-telemetry/opentelemetry.io/branches/all?query=spec-integration
[semconv-branches]: https://github.com/open-telemetry/opentelemetry.io/branches/all?query=semconv-integration

### Spec / semconv SIG メンテナー

リリース直前に以下の手順を実施します。

1. 前のセクションのリンクから、たとえば `otelbot/spec-integration-v1.56.0-dev` のような、対象となる仕様の最新の統合ブランチをみつけます。
2. ブランチページからリンクされている、関連 PR を開きます。
3. 対応するワークフローを新たに実行し、最新の変更を取り込みます

- [update-spec-integration-branch.yml][]
- [update-semconv-integration-branch.yml][]

4. PR チェックが成功している場合、仕様はリリース可能です。
   失敗している場合は、`@open-telemetry/docs-maintainers` にメンションし、リリース前に不具合を解消できるようにします。

### Comms SIG メンテナー

月を通して、統合 PR を定期的に確認し、CI チェックが成功するよう段階的な修正をコミットしてください。
アップストリームの変更セットがまだ小さいうちに、不具合を早期に察知する方が、リリース当日に慌てて対応するよりもはるかに簡単です。

[update-spec-integration-branch.yml]: https://github.com/open-telemetry/opentelemetry.io/actions/workflows/update-spec-integration-branch.yml
[update-semconv-integration-branch.yml]: https://github.com/open-telemetry/opentelemetry.io/actions/workflows/update-semconv-integration-branch.yml

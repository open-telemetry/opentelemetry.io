---
title: エージェントとメンテナー向けのスキル
linkTitle: スキル
description: サイトのメンテナンス時にエージェントとメンテナーが使用するスキル。
weight: 22
default_lang_commit: 49a4a61076ca6c7369666e858be884cd157f7d3c
drifted_from_default: true
cSpell:ignore: agentskills openai
---

このセクションでは、サイトのメンテナンス時にエージェントとメンテナーが使用するスキルと手順について説明します。

**エージェントスキル**とは、エージェントが呼び出したりメンテナーが手動で実行したりできる、[agentskills.io][] に準拠して記述された再利用可能なアクションを指します。
***メンテナー*スキル**（またはメンテナー手順）とは、エージェントやメンテナーが特定のタスクを達成するために従う一連の手順です。
エージェントスキルは [`.agents/skills/`][] で定義されています。
メンテナー手順はこのセクションで定義されています。

スキルと手順のステップでは、各アクションの意図を文章で記述します。
括弧内に記載されたコマンドはステップを実行するための提案であり、唯一の方法ではありません。
この規約が採用される前に記述されたスキルは、まだこれに従っていない可能性があります。

## エージェントスキル {#agent-skills}

上記のとおり、スキルは [`.agents/skills/`][] で定義されています。
以下がそのリストです。

- [`/approve-registry-update [pr-number-or-url]`][approve-registry-update]:
  otelbot のレジストリバージョンバンプ PR をマージすべきかどうかの判断をレビュアーに支援します。
  クリーンなバンプであることを検証し、確認後に承認してマージキューに追加します。
  引数なしの場合、オープンなレジストリ自動更新 PR を処理します。
- [`/draft-issue <issue-description>`][draft-issue]:
  イシューテンプレート、コントリビューティングガイドライン、ラベル分類に従って `opentelemetry.io` リポジトリに GitHub イシューを下書きします。
- [`/refresh-link-cache-pr-fix`][refresh-link-cache-pr-fix]:
  otelbot PR 上の非 2XX URL を取得、レビュー、修正を試みます（デフォルトではリンクチェックが失敗しているすべてのオープンな `otelbot/*` PR、または指示された特定のブランチ）。
- [`/resolve-link-cache-conflicts <optional-pr-number>`][resolve-link-cache-conflicts]:
  `link-cache.jsonc` のマージ/リベースの競合を解決します。
- [`/review-blog-post <blog-post-path-or-pr-number>`][review-blog-post]:
  OpenTelemetry のブログ投稿をフロントマター準拠、コンテンツ規約、GitHub リンクの安定性（`gh-url-hash`）、スペル、OTel 用語についてレビューします。
- [`/review-pull-request <pr-number-or-url>`][review-pull-request]:
  プルリクエストを CI チェックのセマンティクス、CLA と承認ラベルのワークフロー、リンクキャッシュの処理、ロケールルール、コンテンツ品質についてレビューします。
- [`/setup-new-localization <kickoff-issue | lang-code>`][setup-new-localization]:
  新しいウェブサイトのローカリゼーションをエンドツーエンドでセットアップします。
  Hugo の言語ブロック、コンテンツマウント、cSpell ワードリスト、`lang:<lang>` ラベラー設定とラベル、`locale-teams.yaml` と CODEOWNERS の再生成、`localization.md` のエントリを含みます。
- [`/update-i18n-drift-status [--locale locale,...] [--create-pr]`][update-i18n-drift-status]:
  ローカライズされたコンテンツの `drifted_from_default` フロントマターフィールドを更新します。
  処理するロケールの制限や PR の自動作成のためのオプション引数があります。
- [`/update-old-blog-ignores`][update-old-blog-ignores]:
  lint/format チェックおよび修正スクリプトから除外される古いブログ投稿の年範囲を更新します。
- [`/update-git-submodule <submodule>... <version|latest|HEAD>`][update-git-submodule]:
  1つ以上の git サブモジュールをターゲットバージョンに更新します。

Codex は `.agents/skills/` からスキルを検出します。
Claude Code は、同じスキルディレクトリを指す `.claude/skills/` の相対シンボリックリンクを使用します。
Codex では `$skill-name`、Claude Code では `/skill-name` で呼び出します。
Windows のチェックアウトでは、Claude Code 用に Git のシンボリックリンク対応（`core.symlinks=true`）が必要です。

### エージェントスキルの追加 {#adding-an-agent-skill}

1. [agentskills.io][] に従い、YAML フロントマターに `name` と `description` を含む `.agents/skills/<name>/SKILL.md` を作成します。
2. Claude Code 用の相対シンボリックリンクを追加します。
   `ln -s ../../.agents/skills/<name> .claude/skills/<name>`。
3. 明示的な呼び出し専用のスキルでは、Claude Code 用にフロントマターで `disable-model-invocation: true` を設定し、Codex 用にスキルディレクトリ内に `agents/openai.yaml` を追加します。

   ```yaml
   policy:
     allow_implicit_invocation: false
   ```

4. 上記のリストにスキルを追加します。
   共通の手順とリソースは `.agents/skills/` に、ランタイム固有のフックと設定は各ランタイムの設定ディレクトリに置きます。

## フック {#hooks}

上記のエージェントスキルに加えて、[フック][hooks]は特定のツールイベント時に自動的に実行されます。
設定は [`.claude/hooks/hooks.json`][hooks-json] にあり、フックのソースは [`scripts/validate/`][validate] 以下にあります。

- **ブログのフロントマターチェック**: `Write` と `Edit` に対する `PreToolUse` フックで、フロントマターに必須フィールドが欠けているか、日付形式が不正であるか、H1 見出しが導入されている場合に `content/en/blog/**/*.md` への変更をブロックします。
  レビューを待たずに、[`/review-blog-post`](#agent-skills) と同じ規約を書き込み時に適用します。
  ソース: [`scripts/validate/front-matter-check/`][frontmatter-check]。
  純粋なロジックは `index.mjs` にあり、同じフォルダの `index.test.mjs` でカバーされています（実行は `npm run test:local-tools`）。

## メンテナースキル {#maintainer-skills}

以下のセクションインデックスを参照してください。

[`.agents/skills/`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/.agents/skills
[agentskills.io]: https://agentskills.io
[approve-registry-update]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/approve-registry-update/SKILL.md
[draft-issue]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/draft-issue/SKILL.md
[refresh-link-cache-pr-fix]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/refresh-link-cache-pr-fix/SKILL.md
[resolve-link-cache-conflicts]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/resolve-link-cache-conflicts/SKILL.md
[review-blog-post]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-blog-post/SKILL.md
[review-pull-request]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-pull-request/SKILL.md
[setup-new-localization]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/setup-new-localization/SKILL.md
[update-i18n-drift-status]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-i18n-drift-status/SKILL.md
[update-old-blog-ignores]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-old-blog-ignores/SKILL.md
[update-git-submodule]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-git-submodule/SKILL.md
[hooks]: https://docs.claude.com/en/docs/claude-code/hooks
[hooks-json]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/hooks/hooks.json
[validate]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate
[frontmatter-check]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check

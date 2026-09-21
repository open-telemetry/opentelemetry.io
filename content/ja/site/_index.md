---
title: このウェブサイトについて
linkTitle: ウェブサイトドキュメント
description: このサイトがどのように構築、メンテナンス、デプロイされているか。
# NOTE: aliases are not currently enabled for this section.
cascade:
  type: docs
  params:
    hide_feedback: true
default_lang_commit: 116a47a010450c408dd4ec774cd849df4b1c2ddb
---

このセクションは、サイトのメンテナーとコントリビューター向けです。
OpenTelemetry ウェブサイトがどのように構成、構築、メンテナンス、デプロイされているかを説明します。

<span class="badge fs-6 py-2">
{{% _param FAS person-digging " pe-2" %}} セクション作成中。 {{%
_param FAS person-digging " ps-2" %}}
</span>

## コンテンツ（予定） {#content}

暫定的に計画されているコンテンツの構成:

- **About** — ウェブサイトプロジェクトに関する概要情報。
  目的、所有権、全体的なステータスを含みます。
- **Needs, requirements, and features** — ステークホルダーのニーズ、要件、その他関連情報を機能ごとに分類したもの。
- [**Skills**](/site/skills/) — サイトのメンテナンス時にエージェントや人間が使用するスキル。
- [**Design**](/site/design/) — アーキテクチャ設計、情報アーキテクチャ（IA）、レイアウト、UX の選択、テーマ関連の決定、その他の設計レベルの成果物。
- [**Implementation**](/site/implementation/) — コードレベルの構造と規約、Hugo/Docsy テンプレート、SCSS/JS カスタマイズ、パッチ、内部シム。
- [**Build**](/site/build/) — ツール、ローカル開発環境のセットアップ、CI/CD ワークフロー、デプロイ環境、自動化の詳細。
- **Deployment** — OpenTelemetry ウェブサイトのデプロイ固有の動作。
- [**Testing**](/site/testing/) — リンクチェック、アクセシビリティ標準、テスト、レビュープラクティス、その他の品質関連プロセス。
- **Roadmap** — マイルストーン、バックログ、優先度、技術的負債、設計/実装に関する決定。

## コンテンツの追加 {#adding-content}

ページは短く、情報密度を高く保ちます。

- 決定、根拠、制約、主要なルールを記録します。
- 長い背景セクションよりも簡潔な要約を優先します。
- 詳細はここで繰り返すのではなく、イシュー、計画、コードへのリンクを記載します。
- サイトの仕組みとその理由を説明するために必要なコンテンツのみを追加します。

## サイトビルド情報 {#site-build-information}

{{% td/site-build-info/netlify "opentelemetry" %}}

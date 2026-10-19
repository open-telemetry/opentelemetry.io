---
title: Collector コンポーネントの自動化
linkTitle: Collector コンポーネントの自動化
description: >-
  OpenTelemetry Collector コンポーネントの自動化プロセスの説明。
weight: 50
default_lang_commit: 38e36ae231c523f9e54499ad6ca05de7c49501c5
---

OpenTelemetry Collector コンポーネントページ内のテーブルは、[OpenTelemetry Ecosystem Explorer レジストリ](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/tree/main/ecosystem-registry/collector)のデータと自動的に同期されます。
このプロセスを管理するコードは [`scripts/collector-sync`][] にあります。

同期プロセスは、スケジュールで実行される GitHub Action（[`collector-sync.yml`][]）によって管理されます。

毎晩、GitHub Action は以下のステップを実行します。

1. OpenTelemetry Ecosystem Explorer レジストリから最新のデータを取得します。
2. レジストリのデータに基づいて、[`data/collector/`][] 内の関連するコンポーネントデータファイルを更新します。
3. コンポーネントデータファイルに変更がある場合、更新内容を含む PR を生成します。

すべてのコンポーネントページは [`data/collector/`][] ディレクトリから関連データを取り込むショートコードを参照しているため、データファイルが更新されると、コンポーネントページのテーブルは自動的に最新の情報を反映します。

関連するファイルとディレクトリ:

- [`data/collector/`][]: コンポーネントページのテーブルに表示するために使用されるコンポーネントデータファイルが格納されるディレクトリ。
- [`scripts/collector-sync`][]: レジストリデータの取得とコンポーネントデータファイルの更新を行うコードが含まれるディレクトリ。
- [`.github/workflows/collector-sync.yml`][`collector-sync.yml`]: 同期プロセスのスケジュール実行を行う GitHub Action ワークフロー。
- [`layouts/_shortcodes/collector-component-rows.html`][]: データファイルから完全な HTML テーブルをレンダリングします。
- [`layouts/_shortcodes/component-link.html`][]: コンポーネントのソースコードリポジトリへのリンクをレンダリングし、コンポーネントテーブルで使用されます。
- [`i18n/<language>.yml`][]: コンポーネントテーブルページの翻訳を含みます（`collector_component_` 接頭辞が付いており、ショートコードから参照されます）。

## 翻訳 {#translations}

Collector コンポーネントページの新しい翻訳を作成するには、以下のステップに従ってください。

- `content/en/docs/collector/components` にある既存の英語コンテンツを、新しい言語に対応するディレクトリ（例: スペイン語の場合は `content/es/docs/collector/components`）にコピーします。
- 新しい言語で静的コンテンツ（タイトル、説明など）を翻訳します。
- 対応する [`i18n/<language>.yml`][] ファイルが存在し、コンポーネントテーブルで使用される `collector_components_` 接頭辞のキーのエントリがあることを確認します。
  英語のエントリをコピーして値を翻訳できます。

[`scripts/collector-sync`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/collector-sync.sh
[`collector-sync.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/collector-sync.yml
[`data/collector/`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/collector
[`layouts/_shortcodes/collector-component-rows.html`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/collector-component-rows.html
[`layouts/_shortcodes/component-link.html`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/component-link.html
[`i18n/<language>.yml`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/i18n

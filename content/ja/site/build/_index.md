---
title: Build
description: >-
  CI/CD workflows, how to build this site, and how to perform various site
  maintenance activities
weight: 40
default_lang_commit: 74d8cb2aaefe493295c6c49e2e8ef39801847880
---

このセクションでは、OpenTelemetry ウェブサイトのビルド、デプロイ、メンテナンスプロセスを支える CI/CD ワークフロー、NPM スクリプト、ヘルパースクリプトについて説明します。

## フルビルドとリーンビルド {#build-kinds}

通常の（**フル**）Hugo ウェブサイトビルドに加え、Docsy はリンクチェックの大幅な高速化を可能にしつつ、完全なチェックカバレッジを維持する**リーンビルド**をサポートしています。
詳細は、Docsy ドキュメントの [Chrome build modes][] を参照してください。

一部のビルド npm スクリプトは常に同じ種類のサイト（フルまたはリーン）をビルドします。
それ以外のスクリプトは `BUILD_KIND` 環境変数の値を使用し、未設定の場合は `lean` をデフォルトとします。

| Script                     | Build kind   | Drafts/future | Minify |
| -------------------------- | ------------ | ------------- | ------ |
| `build`                    | `BUILD_KIND` | yes           | no     |
| `build:full`               | full         | yes           | no     |
| `build:lean`               | lean         | yes           | no     |
| `build:preview`            | full         | yes           | yes    |
| `build:production`         | full         | no            | yes    |
| `log:build` (CI artifact)  | `BUILD_KIND` | yes           | no     |
| `netlify-build:preview`    | full         | yes           | yes    |
| `netlify-build:production` | full         | no            | yes    |
| Most other commands        | `BUILD_KIND` | yes           | no     |

リンクチェックなど、最初にフレッシュビルドを強制するほとんどのチェックは `BUILD_KIND` を使用します。
リンクチェックスクリプトの詳細は、[リンクチェック](/site/build/link-checking/)を参照してください。

<!-- prettier-ignore-start -->
[Chrome build modes]: https://github.com/google/docsy/blob/main/docsy.dev/content/en/docs/deployment/chrome.md
<!-- prettier-ignore-end -->

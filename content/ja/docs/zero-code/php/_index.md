---
title: PHP ゼロコード計装
linkTitle: PHP
weight: 30
default_lang_commit: f60f406894f94169947ecbd236b933ee4008354c
cSpell:ignore: PECL
---

OpenTelemetry は PHP 向けに2つのゼロコード計装アプローチを提供しています。

|                      | [自動計装](auto/)                | [PHP Distro](/docs/zero-code/php/distro/) |
| -------------------- | -------------------------------- | ----------------------------------------- |
| **インストール**     | Composer + PECL エクステンション | OS パッケージ（`deb`、`rpm`、`apk`）      |
| **プラットフォーム** | Linux、macOS、Windows            | Linux のみ                                |
| **セットアップ**     | Composer オートローディング      | パッケージをインストールし、PHP を再起動  |
| **制御**             | 完全な手動制御                   | こだわりのあるデフォルト設定              |
| **最適な用途**       | 柔軟な環境、カスタム設定         | 本番 Linux デプロイメント                 |

## 自動計装を選択する {#choose-auto-instrumentation}

次のような場合は、[PHP ゼロコード自動計装](auto/)を使用してください。

- すでに Composer を使用している
- macOS または Windows で実行する必要がある
- 計装と設定を最大限制御したい

## PHP Distro を選択する {#choose-php-distro}

次のような場合は、[OpenTelemetry PHP Distro](/docs/zero-code/php/distro/) を使用してください。

- Linux にデプロイし、パッケージ管理されたインストール（`deb`、`rpm`、`apk`）を希望する
- アプリケーションコードや Composer に手を加えずにゼロコードオンボーディングを行いたい
- 本番環境向けに調整されたデフォルト設定（バックグラウンドエクスポート、推論されたスパン、OpAMP）を使用したい

---
title: OpenTelemetry が Elastic の PHP Distro の寄贈を受け入れました
linkTitle: Elastic PHP Distro の寄贈
date: 2026-04-16
author: >-
  [Pawel Filipczak](https://github.com/intuibase) (Elastic)
issue: https://github.com/open-telemetry/opentelemetry.io/issues/9434
sig: OpenTelemetry PHP
default_lang_commit: f7a82830045923a7627a11902ced71d688357fce
cSpell:ignore: Filipczak Pawel
---

OpenTelemetry コミュニティは OpenTelemetry PHP Distro プロジェクトの寄贈を受け入れました。
この投稿では、寄贈によって何が可能になるか、既存の PHP 計装パスとの関係、およびコントリビューターが次にどこで貢献できるかをまとめます。

## この寄贈が重要な理由 {#why-this-donation-matters}

OpenTelemetry は共通のオブザーバビリティ標準を提供していますが、ネイティブエクステンションのインストールやコンパイルが制限されている環境では、OpenTelemetry PHP の導入が依然として困難な場合があります。
よくある障壁は以下のとおりです。

- デプロイ中にネイティブエクステンションをビルドできない、制限された環境やセキュリティが強化されたシステム。
- 頻繁にリビルドされないランタイムイメージ。
- OS パッケージマネージャーに依存する運用ワークフロー。

PHP Distro は、運用ファーストのインストールモデルに重点を置くことで、これらの制約に対応しています。

## PHP Distro が提供するもの {#what-the-php-distro-provides}

このプロジェクトは、ネイティブコンポーネントと PHP ランタイムコンポーネントを、本番環境向けの単一のデプロイメントモデルに統合しています。
現在の機能は以下のとおりです。

- ビルド済みのネイティブエクステンションとローダーのアーティファクト。
- 自動計装のためのランタイム/ブートストラップロジック。
- `deb`、`rpm`、`apk` のパッケージングサポート。
- `ext-protobuf` を必要としない OTLP protobuf シリアライゼーション。
- より優れた可視性のための推論スパンと URL グルーピング機能。
- OpAMP 統合サポート。

PHP `8.1` から `8.4` を利用しているチームにとって、カスタムビルドパイプラインと比較して導入の手間を削減できます。

## 既存の PHP 計装との関係 {#relationship-to-existing-php-instrumentation}

この Distro は同じ OpenTelemetry PHP API と SDK の上に構築されているため、コアコンポーネントをフォークしたり置き換えたりするものではありません。
チームはサービスごとにどちらのインストールパスを選択することもできます。

- Distro パスは、パッケージ管理による運用ファーストのロールアウトで、コード変更を最小限に抑えます。
- Composer ベースのパスは、アプリケーションレベルのパッケージングが望ましい場合に、手動での制御とポータビリティを提供します。

どちらを選ぶかは、デプロイメントモデル、セキュリティ上の制約、およびランタイムパッケージングの管理体制によって異なります。

## 実用的なロールアウトチェックリスト {#practical-rollout-checklist}

本番環境への広範なロールアウトの前に、以下を検証してください。

- PHP のバージョンと SAPI（`php-fpm`、`mod_php`、CLI）間のランタイム互換性。
- 使用している Linux ディストリビューションにおけるパッケージ形式とアーキテクチャのサポート。
- テレメトリーの品質（スパンの完全性、命名、エクスポーターの動作）。
- 運用上の安全性（再起動とロールバックの手順、バージョンの固定）。

代表的なサービスを対象とした軽量な検証マトリクスを作成すると、後からの手戻りを避けるのに役立ちます。

## 現在のステータスと今後のトピック {#current-status-and-next-topics}

プロジェクトは大きなマイルストーンに到達し、最初のベータリリースに向けて進んでいます。
現在進行中のフォローアップトピックは以下のとおりです。

- 依存関係の衝突を減らすためのクラスおよび名前空間のシャドウイング。
- 宣言的な設定のサポート。
- PHP `8.5` の互換性。
- OpenTelemetry のポリシー策定と連携した集中設定機能。
- upstream の OpenTelemetry Distro における取り組みと、その上に構築されるベンダーディストリビューションとの継続的な整合。

## 貢献するには {#how-to-contribute}

貢献したい方は以下をご検討ください。

- 実環境で Distro をテストし、互換性に関する知見を共有する。
- [`opentelemetry-php-distro` リポジトリ](https://github.com/open-telemetry/opentelemetry-php-distro)でインストールやランタイムの問題を報告する。
- デプロイ、移行、トラブルシューティングに関するドキュメントの改善を提案する。
- OpenTelemetry PHP および関連する SIG のディスカッションに参加し、ロードマップとユーザーガイダンスの整合を図る。

寄贈の経緯とディスカッションについては、[open-telemetry/community issue #2846](https://github.com/open-telemetry/community/issues/2846) もご覧ください。

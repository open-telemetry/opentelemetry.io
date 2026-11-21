---
title: 'コントリビューター募集: Dart と Flutter 向け OpenTelemetry'
linkTitle: 'コントリビューター募集: OTel for Dart and Flutter'
date: 2026-06-29
author: >-
  [Michael Bushe](https://github.com/michaelbushe) (Mindful
  Software/Dartastic.io)
issue: 9902
sig: Governance Committee
default_lang_commit: edb0fd516545baeae64e4203c8164e62d2f2067a
cSpell:ignore: Bushe dartastic
---

## なぜ Dart と Flutter に OpenTelemetry が必要なのか {#why-opentelemetry-for-dart-and-flutter}

[Dart](https://dart.dev/) はフルスタック言語であり、クロスプラットフォームアプリケーション構築のための最も人気のあるフレームワークのひとつである [Flutter](https://flutter.dev/) の言語です。
データによると、現在のアプリストアへの申請の20%超が Flutter アプリです。
Dart はヌル安全かつ型安全であり、高速なバイナリにコンパイルされ、バックエンドサービスでの利用も増えています。
しかし、Dart は公式にメンテナンスされている OpenTelemetry SDK を持たない、トップ15プログラミング言語の中で最後の言語です。
以前のコミュニティ実装はすでにメンテナンスされておらず、Dart と Flutter の開発者にはサーバーやアプリからテレメトリーを取得するためのサポートされたパスがない状態です。

OpenTelemetry プロジェクトへの寄贈プロセスが進行中の、積極的に開発されている Dart 向け OpenTelemetry 仕様の実装がすでに存在します。
[dartastic_opentelemetry](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry) とそのスタンドアロン API パッケージ [dartastic_opentelemetry_api](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry_api) が Apache 2.0 ライセンスで [pub.dev](https://pub.dev/packages/dartastic_opentelemetry) に公開されています。
サーバー、デスクトップ、モバイル、Web ターゲット全体で、OTLP/gRPC および OTLP/HTTP エクスポーターによるトレース、メトリクス、ログをサポートしています。

## Dart と Flutter の SIG {#a-dart-and-flutter-sig}

これを OpenTelemetry の公式な一部にするための最初のステップは、Dart と Flutter の Special Interest Group（SIG）を結成することです。
SIG を立ち上げるための[プロジェクト提案](https://github.com/open-telemetry/community/pull/3517)がレビュー中であり、Dart API および SDK の[寄贈提案](https://github.com/open-telemetry/community/issues/2718)も提出されています。
これまでに4つのスポンサー組織にわたる6名のメンテナーがコミットしていますが、公式 Dart SDK の長期的な成功はコミュニティのさらなる成長にかかっています。

## コントリビューター募集 {#call-for-contributors}

Dart や Flutter で OpenTelemetry を使うことに興味がある方、あなたの力が必要です！
コードベースのメンテナンス、定期的な SIG ミーティングへの参加、SDK の推進に協力してくれるコントリビューターを探しています。

コントリビューターになることに興味がある方、またはなりそうな方をご存知の場合は、[寄贈提案](https://github.com/open-telemetry/community/issues/2718)にコメントしてください。

コントリビューターにはならないけれど、フィードバックの提供や SDK の試用には興味がある方は、[リポジトリ](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry)をご覧いただき、ご意見をイシューとして提出してください。
この段階では、すべてのフィードバックがプロジェクトの助けになります。

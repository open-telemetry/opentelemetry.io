---
title: コレクター
description: テレメトリーデータを受信、処理、エクスポートするためのベンダー非依存な方法
cascade:
  vers: 0.119.0
weight: 270
default_lang_commit: fd7da211d5bc37ca93112a494aaf6a94445e2e28
---

![Jaeger、OTLP、Prometheusを統合したOpenTelemetryコレクターのダイアグラム](img/otel-collector.svg)

## はじめに {#introduction}

OpenTelemetryコレクターは、テレメトリーデータの受信、処理、エクスポート方法について、ベンダーにとらわれない実装を提供します。
複数のエージェント／コレクターの実行、操作、メンテナンスの必要性を取り除きます。
これはスケーラビリティを向上させ、1つ以上のオープンソースまたは商用バックエンドに送信するオープンソースのオブザーバビリティデータフォーマット（Jaeger、Prometheus、Fluent Bitなど）をサポートします。
ローカルのコレクターエージェントは、計装ライブラリがテレメトリーデータをエクスポートするデフォルトの場所です。

## 目的 {#objectives}

- _利便性_: 合理的なデフォルト設定、一般的なプロトコルのサポート、ダウンロードしてすぐの実行と収集が可能
- _パフォーマンス_: さまざまな負荷や構成の下でも高い安定性とパフォーマンスを発揮
- _オブザーバビリティ_: オブザーバビリティがあるサービスの模範例
- _拡張性_: コアコードに触れることなくカスタマイズ可能
- _統一性_: 単一のコードベース、エージェントまたはコレクターとしてデプロイ可能、トレース、メトリクス、ログをサポート

## コレクターを使う場面 {#when-to-use-a-collector}

ほとんどの言語固有の計装ライブラリには、一般的なバックエンドやOTLP用のエクスポーターがあります。
ですので、あなたは次のように不思議に思うかもしれません。

> 各サービスがバックエンドに直接データを送信するのではなく、どのような状況でコレクターを使ってデータを送信するのだろう

OpenTelemetryを試したり始めたりするには、バックエンドに直接データを送ることは、素早く価値を得るための素晴らしい方法です。
また、開発環境や小規模な環境では、コレクターなしでも十分な結果を得られます。

しかし、一般的には、サービスとともにコレクターを使用することをおすすめします。理由は、サービスが素早くコレクターにデータをオフロードして、コレクターが再試行、バッチ処理、暗号化、機密データのフィルタリングなどの追加処理を行えるからです。

[コレクターのセットアップ](quick-start)も、思っているより簡単です。
各言語のデフォルトのOTLPエクスポーターは、ローカルコレクターのエンドポイントを想定しているので、コレクターを起動すると、自動的にテレメトリーの受信を開始します。

## Collector security {#collector-security}

ベストプラクティスに従い、コレクターが安全に[ホスト][hosted]と[設定][configured]されていることを確認してください。

## ステータスとリリース {#status-and-releases}

**コレクター**のステータスは、コレクターのコアコンポーネントが現在、[安定性レベル][stability levels]がまちまちであるため、 [混合状態（mixed）][mixed] となっています。

**コレクターコンポーネント** は成熟度が異なります。
各コンポーネントの安定性は `README.md` で明記されています。
利用可能なコレクターコンポーネントの一覧は、[レジストリ][registry] にあります。

{{% docs/latest-release collector-releases /%}}

[registry]: /ecosystem/registry/?language=collector
[hosted]: /docs/security/hosting-best-practices/
[configured]: /docs/security/config-best-practices/
[mixed]: /docs/specs/otel/document-status/#mixed
[stability levels]: https://github.com/open-telemetry/opentelemetry-collector#stability-levels

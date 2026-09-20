---
title: パフォーマンスオーバーヘッド
description: >-
  OpenTelemetry PHP Distro 使用時のパフォーマンスベンチマーク結果と、オーバーヘッドを最小化するためのガイダンス。
weight: 3
default_lang_commit: 98f910ef53d1e7f45002e7303b2af4da15282b21
cSpell:ignore: aimeos php-fpm
---

このページでは、OpenTelemetry PHP Distro を使用する際のパフォーマンスへの影響を概説し、オーバーヘッドを最小化するためのガイダンスを提供します。

他の計装エージェントと同様に、Distro はアプリケーションプロセス内で実行され、ランタイムコストが追加されます。
正確な影響は、アーキテクチャ、設定、デプロイ環境、ワークロードによって異なります。

以下のベンチマークでは、ローカルの Docker セットアップ（`PHP-FPM 8.2 + NGINX`）で複数の PHP オブザーバビリティのバリアントを比較しています。
コレクターを使用するシナリオでは、コレクターもローカルで実行され、ホストの CPU リソースを共有しています。

## ベンチマークのセットアップ {#benchmark-setup}

- アプリケーション: PHP-FPM 8.2 上の Laravel/Aimeos
- 環境: NGINX を使用したローカル Docker
- テレメトリーの送信先: OTLP 互換エンドポイント

## 結果 {#results}

| バリアント                                                            | リクエストあたりの平均時間 \[ms\] | オーバーヘッド \[ms\] |
| --------------------------------------------------------------------- | --------------------------------: | --------------------: |
| エージェントなし                                                      |                             17.36 |                  0.00 |
| ベンダー固有の APM エージェント                                       |                             20.63 |                  3.27 |
| OpenTelemetry PHP Distro                                              |                             23.08 |                  5.71 |
| OpenTelemetry PHP Distro + ローカルコレクター                         |                             24.37 |                  7.01 |
| バニラ OpenTelemetry PHP + protobuf（C エクステンション）+ コレクター |                             25.76 |                  8.40 |
| バニラ OpenTelemetry PHP pure-PHP protobuf エクスポート + コレクター  |                             49.02 |                 31.66 |
| バニラ OpenTelemetry PHP pure-PHP protobuf エクスポート               |                           2158.58 |               2141.22 |

## 主な知見 {#key-findings}

- OpenTelemetry PHP Distro は、pure-PHP protobuf エクスポートを使用したバニラ OpenTelemetry PHP と比較して、オーバーヘッドを大幅に削減します。
- ローカルのコレクター配置は、PHP ワーカーと CPU を取り合う場合にオーバーヘッドを増加させる可能性があります。
- バニラ OpenTelemetry PHP の pure-PHP protobuf エクスポートは、このベンチマークでは非常に高いオーバーヘッドをもたらします。

## 推奨事項 {#recommendations}

- 自身のワークロードとインフラストラクチャでオーバーヘッドを測定してください。
- 非同期トランスポートを使用した OTLP HTTP/protobuf を優先してください。
- レイテンシーに敏感なアプリケーションワーカーと、負荷の高いコレクターワークロードの同居は避けてください。
- SLO を満たすようにサンプリングとエクスポーターの設定を調整してください。

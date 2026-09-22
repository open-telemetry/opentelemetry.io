---
title: セルフオブザーバビリティダッシュボード
default_lang_commit: 98edce30d9f5ea1302ae983d86b178077586471e
---

OpenTelemetry SDK は、SDK 自体の動作を表す内部メトリクス（実験的な [`otel.sdk.*` セマンティック規約](/docs/specs/semconv/otel/sdk-metrics/)を使用）を出力できます。
たとえば、サービスがテレメトリーをドロップしているかどうか、エクスポートにどのくらい時間がかかっているか、プロセッサーキューがいっぱいになりつつあるかどうかなどです。
デモの**セルフオブザーバビリティ**ダッシュボードは、スパン、ログ、メトリクスの各パイプラインにわたってこれらのメトリクスを可視化します。

## SDK セルフオブザーバビリティの有効化 {#enabling-sdk-self-observability}

SDK セルフオブザーバビリティはオプトインかつ実験的であり、サービスごとに SDK 設定を通じて有効化されます。
デモでは、`ad`、`fraud-detection`、`kafka` サービスがオプトインしています。
ダッシュボードは `Service` テンプレート変数で駆動されるため、オプトインした追加サービスは自動的に表示されます。

## ダッシュボードへのアクセス {#accessing-the-dashboard}

デモが実行されたら、<http://localhost:8080/grafana/d/self-observability> でダッシュボードを直接開くか、Grafana ダッシュボード一覧（「Self-Observability」）から移動してください。

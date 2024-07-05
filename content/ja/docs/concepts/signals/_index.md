---
title: シグナル
description: OpenTelemetryがサポートするテレメトリーのカテゴリについて学ぶ
weight: 11
default_lang_commit: 9b5e318
---

OpenTelemetryの目的は、**[シグナル][signals]** を収集、処理、エクスポートすることです。
シグナルは、オペレーティングシステムやプラットフォーム上で動作しているアプリケーションの基本的な活動を記述するシステム出力です。
シグナルは、温度やメモリ使用量のような特定の時点で測定したいもの、またはあなたが追跡したい分散システムのコンポーネントを通過するイベントです。
異なるシグナルをグループ化して、同じテクノロジーの内部動作を異なる角度から観察することもできる。

OpenTelemetry は現在、[トレース](/docs/concepts/signals/traces)、[メトリクス](/docs/concepts/signals/metrics)、[ログ](/docs/concepts/signals/logs)と[バゲッジ](/docs/concepts/signals/baggage)をサポートしています。
_イベント_ は特定の種類のログで、_プロファイル_ はProfiling Working Groupによって[現在策定中](https://github.com/open-telemetry/oteps/blob/main/text/profiles/0212-profiling-vision.md)です。

[signals]: /docs/specs/otel/glossary/#signals

---
title: シグナル
description: OpenTelemetryがサポートするテレメトリーのカテゴリについて学ぶ
weight: 11
default_lang_commit: 43ecc19b51fd86d5b2f30c638f6d734ee8b94932
---

OpenTelemetryの目的は、**[シグナル][signals]** を収集、処理、エクスポートすることです。
シグナルは、オペレーティングシステムやプラットフォーム上で動作しているアプリケーションの基本的な活動を記述するシステム出力です。
シグナルは、温度やメモリ使用量のような特定の時点で測定したいもの、またはあなたが追跡したい分散システムのコンポーネントを通過するイベントです。
異なるシグナルをグループ化して、同じテクノロジーの内部動作を異なる角度から観察することもできる。

OpenTelemetry は現在、下記をサポートしています。

- [トレース](traces)
- [メトリクス](metrics)
- [ログ](logs)
- [バゲッジ](baggage)

同様に、下記は開発中または[提案][proposal]の段階です。

- [イベント][Events]は、特定の[ログ](logs)のタイプです。
- [プロファイル][Profiles] は、Profiling Working Group によって現在策定中です。

[Events]: /docs/specs/otel/logs/data-model/#events
[Profiles]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposal]: https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals

---
title: コンポーネント
description:
  OpenTelemetry Collectorのコンポーネント - receiver、processor、exporter、
  connector、extension
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collectorは、テレメトリーデータを処理するコンポーネントで構成されて
います。各コンポーネントはデータパイプラインにおいて特定の役割を持っています。

## コンポーネントの種類

- **[Receivers](receiver/)** - さまざまなソースやフォーマットからテレメトリーデータ
  を収集します
- **[Processors](processor/)** - テレメトリーデータを変換、フィルタリング、拡充
  します
- **[Exporters](exporter/)** - テレメトリーデータをオブザーバビリティバックエンドに
  送信します
- **[Connectors](connector/)** - exporterとreceiverの両方として機能し、2つの
  パイプラインを接続します
- **[Extensions](extension/)** - ヘルスチェックなどの追加機能を提供します

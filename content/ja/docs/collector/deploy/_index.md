---
title: コレクターのデプロイ
linkTitle: デプロイ
description: OpenTelemetryコレクターをデプロイするために適用できるパターン
aliases: [/docs/collector/deployment]
weight: 3
default_lang_commit: 5104763b7206dc4feff8e3c995d5b4f09066a36c
---

OpenTelemetryコレクターは、さまざまな方法で、さまざまなユースケースに使用できる単一のバイナリから構成されています。
このセクションでは、一般的なデプロイメントパターン、それらのユースケース、および長所と短所について説明します。
また、クロス環境およびマルチバックエンドのシナリオにおけるコレクター設定のベストプラクティスについても説明します。
デプロイメントに関するセキュリティの考慮事項については、[コレクターのホスティングに関するベストプラクティス][security]を参照してください。

## 追加のリソース {#additional-resources}

- KubeCon NA 2021の[OpenTelemetryコレクターデプロイメントパターン][y-patterns]に関する講演
  - 講演に付随する[デプロイメントパターン][gh-patterns]

[security]: /docs/security/hosting-best-practices/
[gh-patterns]: https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs

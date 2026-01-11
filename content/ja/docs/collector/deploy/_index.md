---
title: コレクターのデプロイ
linkTitle: デプロイ
description: OpenTelemetry Collectorのデプロイに適用可能なパターン
aliases:
  - /docs/collector/deployment/
weight: 3
---

OpenTelemetry Collectorは、単一のバイナリで構成されており、さまざまなユースケースに応じてさまざまな方法でデプロイできます。
このセクションでは、一般的なデプロイパターン、そのユースケース、長所と短所について説明します。
また、複数環境や複数バックエンドをまたがるシナリオにおけるコレクターの設定に関するベストプラクティスも提供します。
デプロイに関するセキュリティ上の考慮事項については、[コレクターのホスティングに関するベストプラクティス][security]を参照してください。

## 追加の資料 {#additional-resources}

- KubeCon NA 2021 talk on [OpenTelemetry Collector Deployment Patterns][y-patterns]
  - 講演で紹介された[デプロイパターン][gh-patterns]

[security]: /docs/security/hosting-best-practices/
[gh-patterns]: https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs

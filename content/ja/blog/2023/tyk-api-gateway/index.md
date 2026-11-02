---
title: Tyk API Gateway のネイティブ OpenTelemetry 統合
linkTitle: Tyk API Gateway のネイティブ OpenTelemetry 統合
date: 2023-11-07
author: >-
  [Sonja Chevre](https://github.com/SonjaChevre) (Tyk Technologies)
default_lang_commit: d9691092259cdae7341ff4796022aab9a2219883
---

{{< blog/integration-badge >}}

[Tyk API Gateway](https://github.com/TykTechnologies/tyk) が OpenTelemetry をファーストクラスでサポートし、ゲートウェイにネイティブの計装が直接組み込まれたことをお知らせします。
Tyk のネイティブ OpenTelemetry サポートにより、開発者や API プラットフォームチームは API トラフィックのエンドツーエンドのオブザーバビリティを得ることができ、トラブルシューティングと問題解決の迅速化を実現します。

## なぜ OpenTelemetry なのか {#why-opentelemetry}

API ゲートウェイは、API のフロントラインプロキシとして、API トラフィックの管理とセキュリティの両方において重要な役割を果たしています。
API ゲートウェイレベルでは、多くの重要なアクションが発生します。
レート制限ルール、認証の問題、キャッシュメカニズムなどにより、アップストリームサービスに到達しないリクエストも含め、すべてのリクエストを監視することが不可欠です。
API ゲートウェイでテレメトリーデータを収集することで、明確なエントリポイントと、すべての API コンシューマーのジャーニーの全体像を把握できます。

OpenTelemetry 以前から、Tyk Gateway はメトリクス、ログ、トレースをエクスポートするための10種類以上の異なるフォーマットをサポートしていました。
このサポートを維持するには、多大なエンジニアリングリソースが必要でした。
OpenTelemetry はこのプロセスを合理化し、テレメトリーデータの収集とエクスポートに対して、より効率的で標準化されたアプローチを可能にします。
その結果、ユーザーはテレメトリーデータをさらに幅広い[オブザーバビリティツールやベンダー](/ecosystem/vendors/)に送信できる柔軟性を得ることができます。

分散トレーシングについては、OpenTracing のサポートを廃止し OpenTelemetry を採用しました。
今後はメトリクスとログのエクスポートの合理化にも OpenTelemetry を活用する予定です。

## Tyk と OpenTelemetry の統合方法 {#how-to-integrate-tyk-with-opentelemetry}

バージョン 5.2 以降、[Tyk API Gateway は OpenTelemetry の分散トレーシングをネイティブにサポートしています](https://tyk.io/docs/product-stack/tyk-gateway/advanced-configurations/distributed-tracing/open-telemetry/open-telemetry-overview/)。
ここでは、その設定方法、API ごとの詳細トレーシングの有効化、カスタムプラグインの計装について説明します。

### ゲートウェイレベルで OpenTelemetry を有効にする {#enable-opentelemetry-at-gateway-level}

Tyk Gateway の設定ファイルを編集して、以下のように OpenTelemetry サポートを有効にします。

```json
{
  "opentelemetry": {
    "enabled": true
  }
}
```

対応する環境変数 `TYK_GW_OPENTELEMETRY_ENABLED=TRUE` を設定することでも、OpenTelemetry を有効にできます。

デフォルトでは、OpenTelemetry のスパンは gRPC プロトコルを使用して `localhost:4317` にエクスポートされます。
その他の設定オプションとデフォルト値については、[ドキュメント](https://tyk.io/docs/tyk-oss-gateway/configuration/#opentelemetry)を参照してください。

Tyk は2つのスパンをエクスポートします。
1つは API コール全体の所要時間、もう1つはアップストリームサービスへのコールです。
以下の Jaeger のスクリーンショットに示されています。

![Tyk API Gateway の分散トレース](tyk-api-gateway-opentelemetry-trace.png)

### API ごとの詳細トレーシング {#detailed-tracing-per-apis}

ゲートウェイレベルで OpenTelemetry を有効にすると、特定の API に対して詳細トレーシングを有効にする柔軟性が得られます。
そのためには、対応する API 定義を調整し、`detailed_tracing` オプションを `true` または `false` に切り替えるだけです。
この設定のデフォルト値は `false` です。
この設定により、Tyk は API のリクエスト/レスポンスライフサイクル全体にわたって実行されるすべてのミドルウェア操作に対してスパンを生成します。
これには、API バージョンの検証、認証、認可、レート制限、リクエストとレスポンスの変換などのアクションが含まれます。

ここでは、レート制限ミドルウェアによって報告された問題をすばやく特定できます。

![Tyk API Gateway のミドルウェア詳細付き分散トレース](tyk-api-gateway-opentelemetry-trace-detail.png)

### カスタムプラグインを OpenTelemetry で計装する {#instrumenting-custom-plugins-with-opentelemetry}

Tyk は、カスタムプラグイン（カスタムミドルウェアとも呼ばれる）を使用して機能を拡張することをサポートしており、高度に柔軟でカスタマイズ可能な API ゲートウェイソリューションとなっています。
この拡張性により、開発者はセキュリティの強化、新しい認証方式の追加、サードパーティサービスとの統合、カスタムリクエスト/レスポンス変換の実装など、特定のニーズに合わせて Tyk を調整できます。

OpenTelemetry SDK または Tyk の OpenTelemetry ライブラリ実装（すべての Tyk コンポーネントが利便性のために共有する OpenTelemetry SDK のラッパー）でカスタムプラグインを計装することで、Tyk ユーザーはカスタムプラグインの動作に関する追加のインサイトを得ることができ、より良い監視と迅速なトラブルシューティングが可能になります。
詳細については、Tyk のドキュメント [Go プラグインにおける OpenTelemetry 計装](https://tyk.io/docs/product-stack/tyk-gateway/advanced-configurations/plugins/otel-plugins/)を参照してください。

## 次のステップ {#whats-next}

[OTel Go メトリクス SDK の最初の安定版リリースが発表された](/blog/2023/otel-go-metrics-sdk-stable/)ことで、OpenTelemetry メトリクスのサポートを調査していく予定です。
最新情報をお見逃しなく。フィードバックがあれば、[Tyk のコミュニティまでお気軽にお寄せください](https://community.tyk.io/)。

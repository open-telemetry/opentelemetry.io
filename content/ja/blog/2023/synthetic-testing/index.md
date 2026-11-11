---
title: OpenTelemetry によるポータブルな合成 HTTP テスト
linkTitle: 合成 HTTP テスト
date: 2023-10-05
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
default_lang_commit: 9804fb55065c1cfa004c08f50e48c37e39bbe73c
cSpell:ignore: httpcheck
---

合成（Synthetic）テストはオブザーバビリティツールキットの重要な構成要素です。
アプリケーションの SLA の測定、さまざまな地域でのエンドポイントの監視、ユーザーのようにウェブページを操作する、またはデプロイ後のエラーを顧客が遭遇する前に特定するために使用できます。

このブログでは、HTTP ベースの合成可用性テストに焦点を当てます。
多くのベンダーが無料枠の充実した可用性テストのさまざまなオプションを提供していますが、エンタープライズ規模でエンドポイントを監視すると、オブザーバビリティベンダーの移行時に簡単には移管できない数千ものテストにすぐに膨れ上がる可能性があります。
OpenTelemetry（OTel）は、ユーザーがサービスへの可視性を最大化し、同じ機能を繰り返し再構築する必要なくオブザーバビリティへの投資を最大限に活用できるよう、オブザーバビリティデータのポータビリティに取り組んでいます。

コミュニティはプロジェクトの機能を継続的に改善しており、新機能を見逃しがちです。
[v0.63.0 リリース](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.63.0)で、[OTel Collector](/docs/collector/) は [HTTP Check Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/receiver/httpcheckreceiver?from_branch=main) と呼ばれるレシーバーを通じた合成 HTTP チェックのサポートを追加しました。
このコンポーネントは HTTP または HTTPS 経由でリクエストを送信し、リクエストの所要時間をキャプチャして返されたステータスコードを記録するメトリクスを生成します。
ファイアウォールで IP をホワイトリストに追加する必要なく、任意の環境にエージェントをデプロイしてパブリックまたはプライベートのエンドポイントをテストし、他の OTel データと同様にテスト結果を好みの送信先に転送できるようになりました。

## 最初の OTel 合成 ping テストをデプロイする {#deploy-your-first-otel-synthetic-ping-tests}

OTel 合成テストの導入はシンプルです。
通常通り Collector を設定し、選択したエンドポイント、HTTP メソッド、収集間隔を指定して HTTP Check レシーバーを追加します。
以下は導入のための基本的な Collector 設定です。
リクエストボディの送信はまだサポートされていませんが、各種リクエストでカスタムヘッダーを送信することは可能です。

```yaml
receivers:
  httpcheck:
    targets:
      - endpoint: https://api.restful-api.dev/objects
        method: GET
      - endpoint: https://httpbin.org/delete
        method: DELETE
      - endpoint: https://httpbin.org/post
        method: POST
        headers:
          test-key: 'test-123'
    collection_interval: 10s

exporters:
  #お好みのエクスポーター

processors:
  batch:

service:
  pipelines:
    metrics:
      receivers: [httpcheck]
      processors: [batch]
      #exporters: [your-exporter]
```

## 合成テストの出力 {#synthetic-test-output}

レシーバーはデフォルトで3つのメトリクスを生成します: `httpcheck.duration`、`httpcheck.status`、`httpcheck.error` です。
これらのメトリクスはビジュアライゼーションやアラートの定義に使用できます。
エラーが発生しない場合、`httpcheck.error` チャートにはデータが入りません。
以下は `httpcheck.duration` と `httpcheck.status` メトリクスのスクリーンショットの例です。

### Duration Check {#duration-check}

![合成 duration check の結果](httpcheck-duration.png 'Synthetic duration check result')

### Status Check {#status-check}

![合成 status check の結果](httpcheck-status.png 'Synthetic status check result')

## 今後の展望 {#whats-next}

合成テストは OTel にとってエキサイティングな新機能であり、コミュニティは時間をかけて進化させていきたいと考えています。
合成テスト機能に関する具体的なリクエストがあれば、[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/) リポジトリに HTTP Check レシーバーのイシューを作成するか、PR を作成してご自身で機能を追加してください。
すべてのコントリビューションとフィードバックを歓迎します。

より複雑なブラウザーベースのテストについては、[Selenium プロジェクト](https://www.selenium.dev/documentation/grid/advanced_features/observability/)がネイティブの OpenTelemetry 統合を提供しています。
このデータの活用方法についてフォローアップブログを書きたいと考えています。

将来的には、カスタムリクエストボディのサポートや、[Playwright](https://playwright.dev/) のような他の複雑なブラウザーテストフレームワークからの結果の取り込みを追加したいと考えています。
テストを楽しんでください！

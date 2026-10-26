---
title: OpenTelemetry ログ重複排除プロセッサーによるログ量の削減
linkTitle: ログ重複排除プロセッサー
date: 2026-01-20
author: '[Juraci Paixao Krohling](https://github.com/jpkrohling) (OllyGarden)'
canonical_url: https://blog.olly.garden/reducing-log-volume-with-the-opentelemetry-log-deduplication-processor?link-check=no
default_lang_commit: 87bfbf12b9489ac9028d5519cf91caaaea5909e8
# prettier-ignore
cSpell:ignore: jpkrohling Krohling logdedup logdedupprocessor OllyGarden OTTL Paixao telemetrygen
---

![ログ重複排除のコンセプトを示すカバー画像](cover.png)

あなたのログの少なくとも 80% は、おそらく繰り返しのノイズです。
接続リトライ、ヘルスチェック、ハートビートメッセージなど、同じログ行が毎分何千回も繰り返されます。
そのすべてにストレージコストがかかる一方、シグナルはノイズに埋もれてしまいます。
OpenTelemetry Collector のログ重複排除プロセッサーは、この問題に対するエレガントなソリューションを提供します。

## 繰り返しログの問題 {#the-repetitive-log-problem}

現代の分散システムは膨大な量のログを生成しますが、その量の多くは収穫逓減をもたらします。
下流の依存サービスが利用できないときに接続エラーをログに記録する、典型的なマイクロサービスを考えてみましょう。
サービスが 100 ミリ秒ごとに 30 秒間リトライすると、1 回のインシデントに対してほぼ同一のログエントリが 300 件生成されます。
各エントリは、ロギングバックエンドのストレージ、ネットワーク帯域幅、処理能力を消費します。

ヘルスチェックのエンドポイントが問題をさらに悪化させます。
Kubernetes のプローブ、ロードバランサーのチェック、監視システムはすべて、定期的な間隔でログエントリを生成します。
1 つのサービスが 1 時間あたり何千件ものヘルスチェックレスポンスをログに記録することがあり、そのどれも「サービスが稼働していた」以上の有意義なインサイトを提供しません。

OpenTelemetry Collector の logdedupprocessor は、設定可能な時間ウィンドウにわたって同一のログを集約することで、この問題を解決します。
すべての重複エントリを転送するかわりに、そのメッセージが何回出現したかのカウントを付与した単一のログを出力します。

## ログ重複排除の仕組み {#how-log-deduplication-works}

コアコンセプトは単純明快です。
ログは、リソース属性、スコープ、ボディ、属性、重大度、イベント名が同一である場合に同一と見なされます。
特筆すべき点として、タイムスタンプはこの同一性チェックから除外されます。
タイムスタンプはログエントリごとに自然に異なるためです。
属性の順序は同一性に影響しません。
プロセッサーはこれらのフィールドのハッシュを計算し、設定可能なインターバル内での出現回数を追跡します。

インターバルが満了すると、プロセッサーは 3 つの追加属性を持つ単一のログエントリを出力します。
`log_count`（重複の回数）、`first_observed_timestamp`、`last_observed_timestamp` です。
すべての同一エントリを保存することなく、出現頻度パターンへの完全な可視性を維持できます。

このアプローチは、重要な点でサンプリングとは異なります。
サンプリングはデータを永久に破棄します。
重複排除は、重要な情報（何が起きたか、どのくらいの頻度で、いつ）を保持しつつ、冗長なストレージを排除します。

## 実用的な設定 {#practical-configuration}

以下は、接続エラーを重複排除しつつ監査ログを保持する設定です。

```yaml
processors:
  logdedup:
    interval: 1s
    conditions:
      - severity_number >= SEVERITY_NUMBER_ERROR
      - attributes["log.type"] == "connection"
    exclude_fields:
      - attributes.request_id
      - attributes.timestamp
```

`conditions` フィールドは、OpenTelemetry Transformation Language（OTTL）の式を使用して、どのログを重複排除するかをフィルタリングします。
条件に一致しないログは変更されずに通過します。
この例では、`log.type=connection` 属性を持つ ERROR レベルのログのみが重複排除の対象になります。

`exclude_fields` オプションは、比較からカーディナリティの高いフィールドを除外します。
リクエスト ID やタイムスタンプなどのフィールドは、ログメッセージが意味的に同一であってもエントリ間で異なります。
これらを除外することで、これらの変動するフィールドのみが異なるログは重複として扱われます。

## 完全なパイプラインの例 {#a-complete-pipeline-example}

ログ重複排除プロセッサーを使用するには、Collector のパイプラインに含めます。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  logdedup:
    interval: 1s
    conditions:
      - severity_number >= SEVERITY_NUMBER_ERROR
      - attributes["log.type"] == "connection"
    exclude_fields:
      - attributes.request_id
      - attributes.timestamp

exporters:
  otlp:
    endpoint: your-backend:4317

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [logdedup]
      exporters: [otlp]
```

## telemetrygen によるテスト {#testing-with-telemetrygen}

この設定をローカルでテストするには、telemetrygen を使用して接続エラーログを生成します。

```bash
telemetrygen logs \
  --otlp-insecure \
  --logs 100 \
  --rate 10 \
  --severity-text ERROR \
  --severity-number 17 \
  --body "Connection refused: failed to connect to database at 10.0.0.5:5432" \
  --telemetry-attributes 'log.type="connection"' \
  --telemetry-attributes 'service.name="order-service"' \
  --telemetry-attributes 'db.system="postgresql"'
```

これにより、すべて ERROR の重大度で `log.type=connection` 属性を持つ 100 件のログが毎秒 10 件の速度で生成され、重複排除がトリガーされます。
数秒後、バックエンドには 100 件の個別エントリではなく、`log_count: N` が付与された数件のログエントリが表示されるはずです。

## トレードオフと考慮事項 {#tradeoffs-and-considerations}

ログ重複排除プロセッサーは、インターバル設定と同等のレイテンシーを導入します。
ログはインターバルが満了するまで保持されてから転送されます。
ほとんどのユースケースでは 1 秒の遅延は許容範囲ですが、リアルタイムアラートシステムでは調整が必要な場合があります。

すべての発生をオリジナルのタイムスタンプ付きで保持する必要があるコンプライアンス上重要なログの場合は、重複排除を完全にスキップしてください。
監査ログ、セキュリティイベント、規制対象の記録では、完全な忠実性が求められることが多いです。

トレードオフは明快です。
わずかな遅延と個別のタイムスタンプを失うかわりに、ストレージの削減とより明確なシグナルが得られます。
大量の繰り返しログに対しては、このトレードオフは通常その価値があります。

## まとめ {#conclusion}

ログ重複排除プロセッサーは、現代のロギングパイプラインにおけるノイズ問題に対する実用的なソリューションを提供します。
出現頻度情報を保持しつつ同一エントリを集約することで、オブザーバビリティを犠牲にすることなく、ストレージコストを大幅に削減し、シグナルの明瞭性を向上させることができます。

フィルタリングやサンプリングなどの他の OpenTelemetry Collector プロセッサーと組み合わせることで、ログ重複排除はテレメトリーパイプラインのきめ細かな制御を実現します。
その結果、重要なものをキャプチャし、ノイズを排除するロギングシステムが構築されます。

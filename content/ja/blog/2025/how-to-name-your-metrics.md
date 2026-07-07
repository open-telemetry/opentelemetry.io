---
title: メトリクスの命名方法
linkTitle: メトリクスの命名方法
date: 2025-09-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-metrics
default_lang_commit: 915093171531629473320bc12b6abb923a8346be
# prettier-ignore
cSpell:ignore: apiserver ecommerce jpkrohling kubelet OllyGarden postgres scheduler UCUM
---

メトリクスはオブザーバビリティの定量的な基盤であり、システムのパフォーマンスを示す数値です。
この記事は OpenTelemetry の命名シリーズの3番目の投稿であり、これまでに[スパンの命名方法](/blog/2025/how-to-name-your-spans/)と[意味のある属性でスパンを充実させる方法](/blog/2025/how-to-name-your-span-attributes/)を取り上げてきました。
今回は、重要な測定値の命名に取り組みましょう。

ストーリーを語るスパンとは異なり、メトリクスは数量を示します。
どれだけの数か、どれだけの速さか、どれだけの量か。
しかし、メトリクスの命名もスパンの命名と同様に重要であり、これまで学んだ原則はここにも当てはまります。
「誰が」は名前ではなく属性に入れるべきです。

## 従来のシステムから学ぶ {#learning-from-traditional-systems}

OpenTelemetry のベストプラクティスに入る前に、従来のモニタリングシステムがメトリクスの命名をどのように扱っているかを見てみましょう。
たとえば Kubernetes を見てみましょう。
そのメトリクスは次のようなパターンに従っています。

- `apiserver_request_total`
- `scheduler_schedule_attempts_total`
- `container_cpu_usage_seconds_total`
- `kubelet_volume_stats_used_bytes`

パターンに気づきましたか？
**コンポーネント名 + リソース + アクション + 単位**。
サービスやコンポーネントの名前がメトリクス名に直接埋め込まれています。
このアプローチは、コンテキストを格納するための選択肢が限られていた、よりシンプルなデータモデルでは理にかなっていました。

しかし、このアプローチにはいくつかの問題があります。

- **オブザーバビリティバックエンドの煩雑化**: コンポーネントごとに独自のメトリクス名前空間ができるため、類似した名前の数十から数百のメトリクスの中から適切なメトリクスを見つけるのが難しくなります。
- **集約の柔軟性不足**: 異なるコンポーネント間でメトリクスを合計するのが困難です。
- **ベンダーロックイン**: メトリクス名が特定の実装に紐づいてしまいます。
- **メンテナンスの負荷**: 新しいサービスの追加には新しいメトリクス名が必要になります。

## 主要なアンチパターン: メトリクス名にサービス名を含める {#the-core-anti-pattern-service-names-in-metric-names}

OpenTelemetry メトリクスにおいて最も重要な原則があります。
**メトリクス名にサービス名を含めないでください。**

決済サービスがあるとしましょう。
次のようなメトリクスを作成したくなるかもしれません。

- `payment.transaction.count`
- `payment.latency.p95`
- `payment.error.rate`

これはやめましょう。
サービス名は `service.name` リソース属性を通じてコンテキストとしてすでに利用可能です。
かわりに、次のようにしてください。

- `transaction.count`（`service.name=payment`）
- `http.server.request.duration`（`service.name=payment`）
- `error.rate`（`service.name=payment`）

なぜこのほうがよいのでしょうか？
すべてのサービスにわたって簡単に集約できるからです。

```promql
sum(transaction.count)  // すべてのサービスにわたる全トランザクション
sum(transaction.count{service.name="payment"})  // 決済トランザクションのみ
```

すべてのサービスが独自のメトリクス名を持っていたら、意味のあるダッシュボードを構築するためにすべてのサービス名を知る必要があります。
クリーンな名前にすれば、1つのクエリですべてに対応できます。

## OpenTelemetry のリッチなコンテキストモデル {#opentelemetrys-rich-context-model}

OpenTelemetry のメトリクスは、スパン属性の記事で取り上げた[リッチなコンテキストモデル](/docs/specs/otel/common/#attribute)と同じ恩恵を受けます。
メトリクス名にすべてを詰め込むかわりに、コンテキストを配置できる複数のレイヤーがあります。

### 従来のアプローチ（Prometheus スタイル）: {#traditional-approach-prometheus-style}

```promql
payment_service_transaction_total{method="credit_card",status="success"}
user_service_auth_latency_milliseconds{endpoint="/login",region="us-east"}
inventory_service_db_query_seconds{table="products",operation="select"}
```

### OpenTelemetry アプローチ: {#opentelemetry-approach}

```yaml
transaction.count
- Resource: service.name=payment, service.version=1.2.3, deployment.environment.name=prod
- Scope: instrumentation.library.name=com.acme.payment, instrumentation.library.version=2.1.0
- Attributes: method=credit_card, status=success

auth.duration
- Resource: service.name=user, service.version=2.0.1, deployment.environment.name=prod
- Scope: instrumentation.library.name=express.middleware
- Attributes: endpoint=/login, region=us-east
- Unit: ms

db.client.operation.duration
- Resource: service.name=inventory, service.version=1.5.2
- Scope: instrumentation.library.name=postgres.client
- Attributes: db.sql.table=products, db.operation=select
- Unit: s
```

この3層の分離は、OpenTelemetry 仕様の **Events → Metric Streams → Timeseries** モデルに従っており、コンテキストが名前に詰め込まれるのではなく、複数の階層レベルを通じて流れます。

## 単位: 名前からは除外する {#units-keep-them-out-of-names-too}

サービス名がメトリクス名に含まれるべきでないと学んだように、**単位もまたメトリクス名に含まれるべきではありません**。

従来のシステムでは、適切な単位メタデータがないため、名前に単位を含めることが多いです。

- `response_time_milliseconds`
- `memory_usage_bytes`
- `throughput_requests_per_second`

OpenTelemetry は単位を名前とは別のメタデータとして扱います。

- `http.server.request.duration`（単位 `ms`）
- `system.memory.usage`（単位 `By`）
- `http.server.request.rate`（単位 `{request}/s`）

このアプローチにはいくつかの利点があります。

1. **クリーンな名前**: メトリクス名に見苦しい接尾辞が付かなくなります。
2. **標準化された単位**: [統一計量単位コード（UCUM）](/docs/specs/semconv/general/metrics/#instrument-units)に従います。
3. **バックエンドの柔軟性**: システムが単位変換を自動的に処理できます。
4. **一貫した規約**: OpenTelemetry の[セマンティック規約](/docs/specs/semconv/general/metrics/)に沿っています。

仕様では、技術的な理由がない限り、`MiBy`（メビバイト）ではなく `By`（バイト）のような接頭辞のない単位を使用することを推奨しています。

## 実践的な命名ガイドライン {#practical-naming-guidelines}

メトリクス名を作成する際には、スパンで学んだ `{verb} {object}` の原則を、適切な場面で適用してください。

1. **操作に着目する**: 何が計測されているのか？
2. **操作主体ではない**: 誰が計測しているのか、ではない。
3. **セマンティック規約に従う**: 利用可能な[確立されたパターン](/docs/specs/semconv/general/metrics/)を使用する。
4. **単位はメタデータとして保持する**: 名前に単位を接尾辞として付けない。

以下は OpenTelemetry の[セマンティック規約](/docs/specs/semconv/general/metrics/)に従った例です。

- `http.server.request.duration`（`payment_http_requests_ms` ではなく）
- `db.client.operation.duration`（`user_service_db_queries_seconds` ではなく）
- `messaging.client.sent.messages`（`order_service_messages_sent_total` ではなく）
- `transaction.count`（`payment_transaction_total` ではなく）

## 実際の移行例 {#real-world-migration-examples}

| 従来の方式（コンテキスト + 単位を名前に含む） | OpenTelemetry（クリーンな分離）                                              | よりよい理由                         |
| :-------------------------------------------- | :--------------------------------------------------------------------------- | :----------------------------------- |
| `payment_transaction_total`                   | `transaction.count` + `service.name=payment` + 単位 `1`                      | サービス間で集約可能                 |
| `user_service_auth_latency_ms`                | `auth.duration` + `service.name=user` + 単位 `ms`                            | 標準的な操作名、適切な単位メタデータ |
| `inventory_db_query_seconds`                  | `db.client.operation.duration` + `service.name=inventory` + 単位 `s`         | セマンティック規約に準拠             |
| `api_gateway_requests_per_second`             | `http.server.request.rate` + `service.name=api-gateway` + 単位 `{request}/s` | クリーンな名前、適切なレート単位     |
| `redis_cache_hit_ratio_percent`               | `cache.hit_ratio` + `service.name=redis` + 単位 `1`                          | 比率は無単位                         |

## クリーンな命名の利点 {#benefits-of-clean-naming}

コンテキストをメトリクス名から分離することで、クエリのパフォーマンスと運用ワークフローの両方を改善する具体的な技術的利点が得られます。
最初の利点は、サービス間の集約です。
`sum(transaction.count)` のようなクエリは、サービス名のリストを知る必要も維持する必要もなく、すべてのサービスからデータを返します。
50のマイクロサービスがあるシステムでは、50個のかわりに1つのクエリで済み、51番目のサービスを追加してもそのクエリは壊れません。

この一貫性により、ダッシュボードをサービス間で再利用できるようになります。
認証サービスの HTTP リクエストを監視するために作成したダッシュボードは、決済サービス、在庫サービス、またはその他の HTTP 提供コンポーネントに対しても変更なしで機能します。
クエリを一度書けば（`http.server.request.duration` を `service.name` でフィルタリング）、どこにでも適用できます。
ほぼ同一のダッシュボードを何十個もメンテナンスする必要はありません。
一部のオブザーバビリティベンダーはこれをさらに発展させ、セマンティック規約のメトリクス名に基づいてダッシュボードを自動生成しています。
サービスが `http.server.request.duration` を出力すると、プラットフォームはそのメトリクスに適したビジュアライゼーションと集約が何かを正確に把握します。

クリーンな命名は、メトリクス名前空間の煩雑さも軽減します。
数十のサービスがそれぞれ独自のメトリクスを定義しているプラットフォームを考えてみてください。
従来の命名では、メトリクスブラウザーに数百のサービス固有のバリエーションが表示されます。
`apiserver_request_total`、`payment_service_request_total`、`user_service_request_total`、`inventory_service_request_total` などです。
適切なメトリクスを見つけるには、冗長なバリエーションをスクロールして検索しなければなりません。
クリーンな命名では、コンテキストを属性で捕捉する1つのメトリクス名（`request.count`）があります。
これにより、メトリクスの発見が簡単になります。
必要な測定を見つけてから、対象のサービスでフィルタリングするだけです。

単位がメタデータであり名前の接尾辞ではなくなると、単位の取り扱いが体系的になります。
オブザーバビリティプラットフォームは単位変換を自動的に実行できます。
同じ期間メトリクスをあるグラフではミリ秒で、別のグラフでは秒で表示できます。
ビジュアライゼーションに適した形式に基づいて表示されます。
メトリクスは単位メタデータ `ms` を持つ `request.duration` のままであり、`request_duration_ms` と `request_duration_seconds` の2つの別々のメトリクスにはなりません。

このアプローチは、手動計装と自動計装の間の互換性も保証します。
`http.server.request.duration` のようなセマンティック規約に従うと、カスタムメトリクスが自動計装ライブラリによって生成されたものと整合します。
これにより、手動で計装されたサービスと自動で計装されたサービスの両方にわたってクエリが機能する一貫したデータモデルが作成され、エンジニアはどのメトリクスがどのソースから来ているかを覚える必要がなくなります。

## 避けるべき一般的な落とし穴 {#common-pitfalls-to-avoid}

エンジニアはデプロイ固有の情報をメトリクス名に直接埋め込みがちで、`user_service_v2_latency` のようなパターンが生まれます。
バージョン3をデプロイすると、このメトリクス名を参照するすべてのダッシュボード、アラート、クエリを更新しなければなりません。
同じ問題が `node_42_memory_usage` のようなインスタンス固有の名前でも発生します。
動的スケーリングのあるクラスターでは、同じ測定を表す数百の異なるメトリクス名が生まれ、シンプルな集約クエリを書くことが不可能になります。

環境固有の接頭辞も同様のメンテナンス問題を引き起こします。
`prod_payment_errors` や `staging_auth_count` のように命名されたメトリクスでは、環境をまたいで機能する単一のクエリを書くことができません。
本番環境を監視するダッシュボードは、変更なしにステージング環境には使用できません。
環境間でメトリクスを比較する必要がある場合（一般的なデバッグ作業です）、各環境のメトリクス名を明示的に参照する複雑なクエリを書かなければなりません。

メトリクス名に技術スタックの詳細を含めると、将来の移行時に問題が生じます。
`nodejs_payment_memory` という名前のメトリクスは、サービスを Go で書き直した場合に誤解を招きます。
同様に、`postgres_user_queries` は別のデータベースに移行する場合にリネームが必要です。
これらの技術固有の名前は、異なる技術スタックを使用するサービスが同じビジネス機能を果たしている場合でも、サービス間で機能するクエリを書くことを妨げます。

ビジネスドメインとインフラストラクチャメトリクスを混在させると、システムが何をするかとどのように行うかの分離が崩れます。
`ecommerce_cpu_usage` のようなメトリクスは、ビジネス上の目的（EC）と技術的な測定（CPU 使用量）を混同しています。
これにより、異なるビジネスドメイン間でインフラストラクチャモニタリングを再利用することが困難になり、同じインフラストラクチャが複数のビジネス機能を提供するマルチテナント環境を複雑にします。

メトリクス名に単位を含める慣習（`latency_ms`、`memory_bytes`、`count_total`）は、OpenTelemetry が適切な単位メタデータを提供するようになった現在では冗長です。
また、自動的な単位変換も妨げます。
`request_duration_ms` と `request_duration_seconds` が別々のメトリクスとして存在する場合、異なるタイムスケールに対して異なるクエリが必要です。
単位メタデータを含む単一の `request.duration` メトリクスであれば、オブザーバビリティプラットフォームが変換を自動的に処理します。

パターンは明確です。
デプロイ、インスタンス、環境、バージョンによって変わるコンテキストは、メトリクス名ではなく属性に入れるべきです。
メトリクス名は、何を測定しているかを示すべきです。
それ以外のすべて（誰が測定しているか、どこで実行されているか、どのバージョンか）は、必要に応じてフィルタリング、グルーピング、集約できる属性レイヤーに配置します。

## よりよいメトリクスを育てる {#cultivating-better-metrics}

このシリーズで先に取り上げたスパンと同様に、適切に命名されたメトリクスは、将来の自分自身とチームへの贈り物です。
インシデント時の明快さを提供し、強力なサービス間分析を可能にし、オブザーバビリティデータを単に膨大なものではなく真に有用なものにします。

重要な知見はスパンで学んだことと同じです。
**関心の分離**。
メトリクス名は何を測定しているかを示します。
コンテキスト（誰が測定しているか、どこで、いつ、どのように）は、OpenTelemetry が提供するリッチな属性階層に配置します。

次の投稿では、**メトリクス属性**（メトリクスを真に強力にするコンテキストレイヤー）を深く掘り下げます。
名前に含めるべきでないリッチなコンテキスト情報を構造化する方法と、情報の豊富さとカーディナリティの懸念のバランスをとる方法を探ります。

それまで覚えておいてください。
クリーンなメトリクス名は、きちんと手入れされた庭の小道のようなものです。
必要な場所に正確に導いてくれます。

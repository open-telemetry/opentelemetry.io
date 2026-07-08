---
title: メトリクスの名前の付け方
linkTitle: メトリクスの名前の付け方
date: 2025-09-11
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-metrics
default_lang_commit: 42ef3933bf759e3ab583fef09455ef5c047a17c0
# prettier-ignore
cSpell:ignore: apiserver ecommerce jpkrohling kubelet OllyGarden postgres scheduler UCUM
---

メトリクスはオブザーバビリティの定量的な背骨であり、システムがどのように動作しているかを示す数値です。
この記事は OpenTelemetry の命名シリーズの第3弾で、これまでに[スパンの名前の付け方](/blog/2025/how-to-name-your-spans/)と[意味のある属性でスパンを豊かにする方法](/blog/2025/how-to-name-your-span-attributes/)を取り上げてきました。
今回は、重要な計測値に名前を付ける方法を扱います。

何が起こったかを物語るスパンとは異なり、メトリクスは量に関する情報を伝えます。
いくつあるか、どれくらい速いか、どれくらいの量か。
しかし、メトリクスの命名もスパンの命名と同じくらい重要であり、これまで学んだ原則がここでも適用されます。
「誰が」という情報は名前ではなく属性に入れるべきです。

## 従来のシステムから学ぶ {#learning-from-traditional-systems}

OpenTelemetry のベストプラクティスに入る前に、従来の監視システムがメトリクスの命名をどのように扱っているかを見てみましょう。
たとえば Kubernetes を例に取ります。
Kubernetes のメトリクスは以下のようなパターンに従います。

- `apiserver_request_total`
- `scheduler_schedule_attempts_total`
- `container_cpu_usage_seconds_total`
- `kubelet_volume_stats_used_bytes`

パターンに気づきましたか？
**コンポーネント名 + リソース + アクション + 単位**です。
サービスまたはコンポーネントの名前がメトリクス名に直接埋め込まれています。
このアプローチは、コンテキストを格納するオプションが限られたシンプルなデータモデルでは理にかなっていました。

しかし、これにはいくつかの問題があります。

- **オブザーバビリティバックエンドの煩雑化**: 各コンポーネントが独自のメトリクス名前空間を持つため、数十から数百の似た名前のメトリクスの中から正しいものを見つけることが難しくなります。
- **柔軟性のない集約**: 異なるコンポーネント間でメトリクスを合計することが困難です。
- **ベンダーロックイン**: メトリクス名が特定の実装に紐づいてしまいます。
- **メンテナンスのオーバーヘッド**: 新しいサービスを追加するたびに新しいメトリクス名が必要になります。

## コアアンチパターン：メトリクス名にサービス名を入れる {#the-core-anti-pattern-service-names-in-metric-names}

OpenTelemetry メトリクスにおいて最も重要な原則は、**メトリクス名にサービス名を含めないこと**です。

たとえば、決済サービスがあるとします。
以下のようなメトリクスを作りたくなるかもしれません。

- `payment.transaction.count`
- `payment.latency.p95`
- `payment.error.rate`

これはやめましょう。
サービス名は `service.name` リソース属性を通じてコンテキストとしてすでに利用可能です。
かわりに以下のようにします。

- `transaction.count` と `service.name=payment`
- `http.server.request.duration` と `service.name=payment`
- `error.rate` と `service.name=payment`

なぜこちらが良いのでしょうか。
すべてのサービスを横断して簡単に集約できるからです。

```promql
sum(transaction.count)  // すべてのサービスのすべてのトランザクション
sum(transaction.count{service.name="payment"})  // 決済トランザクションのみ
```

すべてのサービスが独自のメトリクス名を持っていた場合、意味のあるダッシュボードを構築するにはすべてのサービス名を把握する必要があります。
きれいな名前にすれば、1つのクエリですべてに対応できます。

## OpenTelemetry のリッチなコンテキストモデル {#opentelemetrys-rich-context-model}

OpenTelemetry のメトリクスは、スパン属性の記事で取り上げた[リッチなコンテキストモデル](/docs/specs/otel/common/#attribute)の恩恵を受けます。
すべてをメトリクス名に押し込むのではなく、コンテキストを配置できる複数のレイヤーがあります。

### 従来のアプローチ（Prometheus スタイル）: {#traditional-approach-prometheus-style}

```promql
payment_service_transaction_total{method="credit_card",status="success"}
user_service_auth_latency_milliseconds{endpoint="/login",region="us-east"}
inventory_service_db_query_seconds{table="products",operation="select"}
```

### OpenTelemetry のアプローチ: {#opentelemetry-approach}

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

この3層の分離は、OpenTelemetry 仕様の **Events → Metric Streams → Timeseries** モデルに従っており、コンテキストは名前に詰め込まれるのではなく、複数の階層レベルを通じて流れます。

## 単位：名前から除外する {#units-keep-them-out-of-names-too}

サービス名がメトリクス名に入るべきでないことを学んだのと同様に、**単位もメトリクス名に入れるべきではありません**。

従来のシステムでは、適切な単位メタデータがないために名前に単位を含めることがよくありました。

- `response_time_milliseconds`
- `memory_usage_bytes`
- `throughput_requests_per_second`

OpenTelemetry では単位を名前とは別のメタデータとして扱います。

- `http.server.request.duration` と単位 `ms`
- `system.memory.usage` と単位 `By`
- `http.server.request.rate` と単位 `{request}/s`

このアプローチにはいくつかの利点があります。

1. **きれいな名前**: 見苦しい接尾辞でメトリクス名が散らかりません。
2. **標準化された単位**: [計量単位統一コード（UCUM）](/docs/specs/semconv/general/metrics/#instrument-units)に従います。
3. **バックエンドの柔軟性**: システムが自動的に単位変換を処理できます。
4. **一貫した規約**: OpenTelemetry の[セマンティック規約](/docs/specs/semconv/general/metrics/)に沿っています。

仕様では、技術的な理由がない限り、`MiBy`（メビバイト）ではなく `By`（バイト）のような接頭辞なしの単位を使用することを推奨しています。

## 実践的な命名ガイドライン {#practical-naming-guidelines}

メトリクス名を作成する際は、スパンで学んだ `{動詞} {目的語}` の原則を適切な場面で適用します。

1. **操作に焦点を当てる**: 何が計測されているか？
2. **操作者ではなく**: 誰が計測しているか、ではない。
3. **セマンティック規約に従う**: 利用可能な場合は[確立されたパターン](/docs/specs/semconv/general/metrics/)を使用する。
4. **単位はメタデータとして保持する**: 名前に単位の接尾辞を付けない。

以下は OpenTelemetry の[セマンティック規約](/docs/specs/semconv/general/metrics/)に従った例です。

- `http.server.request.duration`（`payment_http_requests_ms` ではなく）
- `db.client.operation.duration`（`user_service_db_queries_seconds` ではなく）
- `messaging.client.sent.messages`（`order_service_messages_sent_total` ではなく）
- `transaction.count`（`payment_transaction_total` ではなく）

## 実際の移行例 {#real-world-migration-examples}

| 従来型（コンテキスト + 単位を名前に含む） | OpenTelemetry（きれいな分離）                                                | 改善点                               |
| :---------------------------------------- | :--------------------------------------------------------------------------- | :----------------------------------- |
| `payment_transaction_total`               | `transaction.count` + `service.name=payment` + 単位 `1`                      | サービス間で集約可能                 |
| `user_service_auth_latency_ms`            | `auth.duration` + `service.name=user` + 単位 `ms`                            | 標準的な操作名、適切な単位メタデータ |
| `inventory_db_query_seconds`              | `db.client.operation.duration` + `service.name=inventory` + 単位 `s`         | セマンティック規約に準拠             |
| `api_gateway_requests_per_second`         | `http.server.request.rate` + `service.name=api-gateway` + 単位 `{request}/s` | きれいな名前、適切なレート単位       |
| `redis_cache_hit_ratio_percent`           | `cache.hit_ratio` + `service.name=redis` + 単位 `1`                          | 比率は単位なし                       |

## きれいな命名の利点 {#benefits-of-clean-naming}

コンテキストをメトリクス名から分離することで、クエリのパフォーマンスと運用ワークフローの両方を改善する具体的な技術的利点が得られます。
最初の利点はサービス間の集約です。
`sum(transaction.count)` のようなクエリは、サービス名のリストを把握・維持する必要なく、すべてのサービスからデータを返します。
50のマイクロサービスを持つシステムでは、50のクエリのかわりに1つで済み、51番目のサービスを追加してもそのクエリは壊れません。

この一貫性により、ダッシュボードをサービス間で再利用できます。
認証サービスの HTTP リクエスト監視用に構築したダッシュボードは、決済サービス、在庫管理サービス、その他の HTTP を提供するコンポーネントでも変更なしで機能します。
クエリを一度書くだけです。
`http.server.request.duration` を `service.name` でフィルタリングし、どこにでも適用できます。
ほぼ同一のダッシュボードを何十個もメンテナンスする必要はもうありません。
一部のオブザーバビリティベンダーはこれをさらに進め、セマンティック規約のメトリクス名に基づいてダッシュボードを自動生成しています。
サービスが `http.server.request.duration` を出力すると、プラットフォームはそのメトリクスに対してどのような可視化や集約が適切かを正確に把握します。

きれいな命名は、メトリクスの名前空間の煩雑さも軽減します。
数十のサービスがそれぞれ独自のメトリクスを定義するプラットフォームを考えてみましょう。
従来の命名では、メトリクスブラウザに数百のサービス固有のバリエーションが表示されます。
`apiserver_request_total`、`payment_service_request_total`、`user_service_request_total`、`inventory_service_request_total` などです。
正しいメトリクスを見つけることは、冗長なバリエーションをスクロールして検索する作業になります。
きれいな命名では、1つのメトリクス名（`request.count`）にコンテキストをキャプチャする属性が付きます。
これにより、メトリクスの検出が簡単になります。
必要な計測値を見つけてから、対象のサービスでフィルタリングするだけです。

単位がメタデータとして扱われる場合、単位の処理は体系的になります。
オブザーバビリティプラットフォームは自動的に単位変換を実行できます。
同じ期間メトリクスを、可視化に適した形で、あるグラフではミリ秒で、別のグラフでは秒で表示できます。
メトリクスは単位メタデータ `ms` を持つ `request.duration` のままであり、`request_duration_ms` と `request_duration_seconds` の2つの別々のメトリクスにはなりません。

このアプローチはまた、手動計装と自動計装の互換性も確保します。
`http.server.request.duration` のようなセマンティック規約に従えば、カスタムメトリクスが自動計装ライブラリによって生成されたものと一致します。
これにより、手動と自動の両方で計装されたサービス間でクエリが機能する一貫したデータモデルが構築され、エンジニアはどのメトリクスがどのソースから来ているかを覚える必要がなくなります。

## 避けるべきよくある落とし穴 {#common-pitfalls-to-avoid}

エンジニアはデプロイ固有の情報をメトリクス名に直接埋め込むことがよくあります。
`user_service_v2_latency` のようなパターンです。
これはバージョン3がデプロイされると壊れます。
メトリクス名を参照するすべてのダッシュボード、アラート、クエリを更新する必要があります。
`node_42_memory_usage` のようなインスタンス固有の名前でも同じ問題が発生します。
動的スケーリングのクラスターでは、同じ計測値を表す数百の異なるメトリクス名ができてしまい、シンプルな集約クエリを書くことが不可能になります。

環境固有の接頭辞も同様のメンテナンス問題を引き起こします。
`prod_payment_errors` と `staging_auth_count` という名前のメトリクスでは、環境間で共通のクエリを書くことができません。
本番環境を監視するダッシュボードは、変更なしではステージング環境に使えません。
環境間でメトリクスを比較する必要がある場合（一般的なデバッグ作業）、各環境のメトリクス名を明示的に参照する複雑なクエリを書く必要があります。

メトリクス名に技術スタックの詳細を含めると、将来の移行で問題が生じます。
`nodejs_payment_memory` という名前のメトリクスは、サービスを Go で書き直すと誤解を招くようになります。
同様に、`postgres_user_queries` は別のデータベースに移行する場合にリネームが必要になります。
これらの技術固有の名前はまた、同じビジネス機能を果たしていても異なる技術スタックを使用するサービス間で共通のクエリを書くことを妨げます。

ビジネスドメインとインフラストラクチャメトリクスの混在は、システムが何をするかとどのように動作するかの分離に違反します。
`ecommerce_cpu_usage` のようなメトリクスは、ビジネス目的（eコマース）と技術的計測値（CPU 使用率）を混同しています。
これにより、異なるビジネスドメイン間でインフラストラクチャ監視を再利用することが難しくなり、同じインフラストラクチャが複数のビジネス機能を提供するマルチテナントデプロイメントも複雑になります。

メトリクス名に単位を含める慣習（`latency_ms`、`memory_bytes`、`count_total`）は、OpenTelemetry が適切な単位メタデータを提供する現在では冗長です。
これはまた、自動的な単位変換を妨げます。
`request_duration_ms` と `request_duration_seconds` が別々のメトリクスとして存在する場合、異なる時間スケールで異なるクエリが必要です。
単位メタデータを含む1つの `request.duration` メトリクスであれば、オブザーバビリティプラットフォームが自動的に変換を処理します。

パターンは明確です。
デプロイ、インスタンス、環境、バージョンによって変わるコンテキストは、メトリクス名ではなく属性に入れるべきです。
メトリクス名は何を計測しているかを示すべきです。
それ以外のすべて（誰が計測しているか、どこで実行されているか、どのバージョンか）は、必要に応じてフィルタリング、グルーピング、集約できる属性レイヤーに入れます。

## より良いメトリクスの育成 {#cultivating-better-metrics}

このシリーズで先に取り上げたスパンと同様に、良い名前のメトリクスは将来の自分自身とチームへの贈り物です。
インシデント時に明確さを提供し、強力なサービス間分析を可能にし、オブザーバビリティデータを単に大量であるだけでなく、本当に有用なものにします。

重要な知見はスパンで学んだものと同じです。
**関心の分離**です。
メトリクス名は何を計測しているかを表します。
コンテキスト（誰が計測しているか、どこで、いつ、どのように）は、OpenTelemetry が提供するリッチな属性階層の中に存在します。

次の記事では、**メトリクス属性**（メトリクスを本当に強力にするコンテキストレイヤー）について深く掘り下げます。
名前に入れるべきでないリッチなコンテキスト情報をどのように構造化するか、そして情報量とカーディナリティの懸念のバランスをどう取るかを探ります。

それまで覚えておいてください。
きれいなメトリクス名は、手入れの行き届いた庭の小道のようなものです。
必要な場所に正確に導いてくれます。

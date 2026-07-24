---
title: スパン属性の名前の付け方
linkTitle: スパン属性の名前の付け方
date: 2025-08-27
author: >-
  [Juraci Paixão Kröhling](https://github.com/jpkrohling) (OllyGarden)
canonical_url: https://blog.olly.garden/how-to-name-your-span-attributes
default_lang_commit: 5e10a38c4879c9c45a4063b04834755bdffeb4cb
cSpell:ignore: jpkrohling OllyGarden shopify
---

OpenTelemetry の命名ベストプラクティスシリーズの第2弾へようこそ。
[前回の記事](/blog/2025/how-to-name-your-spans/)では、`{verb} {object}` パターンを使ったスパンの命名方法を紹介しました。
今回は、スパン属性について掘り下げます。
スパン属性は、トレースを単純な操作ログから強力なデバッグおよび分析ツールへと変える、豊かなコンテキストデータです。

このガイドの対象読者は以下のような開発者です。

- カスタムスパンと属性を使って**自分のアプリケーションを計装している**
- 自動計装が提供する以上の**テレメトリーを拡充している**
- 他の人が計装する**ライブラリを作成している**

属性の命名に関する判断は、オブザーバビリティデータの使いやすさと保守性に直接影響します。
正しく決めましょう。

## セマンティック規約から始める {#start-with-semantic-conventions}

時間を節約し、相互運用性を向上させる最も重要なルールを紹介します。
**OpenTelemetry の[セマンティック規約](/docs/specs/semconv/registry/attributes/)が存在し、そのセマンティクスがユースケースと一致する場合は、それを使ってください**。

これは単なる利便性の問題ではなく、より広い OpenTelemetry エコシステムとシームレスに統合されるテレメトリーを構築するためです。
標準化された属性名を使えば、データは既存のダッシュボード、アラートルール、分析ツールと自動的に連携します。

### セマンティクスが一致する場合は規約を使う {#when-semantics-match-use-the-convention}

| ニーズ                     | 使用するセマンティック規約 | 理由                                 |
| :------------------------- | :------------------------- | :----------------------------------- |
| HTTP リクエストメソッド    | `http.request.method`      | すべての HTTP 計装で標準化されている |
| データベースコレクション名 | `db.collection.name`       | データベース監視ツールと連携する     |
| サービスの識別             | `service.name`             | サービス相関のためのコアリソース属性 |
| ネットワークピアアドレス   | `network.peer.address`     | ネットワークレベルのデバッグの標準   |
| エラー分類                 | `error.type`               | 一貫したエラー分析を可能にする       |

重要な原則は、**命名の好みよりもセマンティクスの一致を優先する**ことです。
`db.collection.name` よりも `database_table` の方が好みだとしても、セマンティック規約がデータを正確に表している場合はそちらを使ってください。

### セマンティクスが一致しない場合は無理に使わない {#when-semantics-dont-match-dont-force-it}

セマンティック規約を誤用したくなる誘惑に抵抗してください。

| やってはいけないこと                              | 問題点                                         |
| :------------------------------------------------ | :--------------------------------------------- |
| ファイル名に `db.collection.name` を使う          | ファイルとデータベースコレクションは異なる概念 |
| ビジネスアクションに `http.request.method` を使う | 「approve_payment」は HTTP メソッドではない    |
| トランザクション ID に `user.id` を使う           | ユーザーとトランザクションは異なるエンティティ |

セマンティック規約の誤用は、カスタム属性を作るよりも悪い結果をもたらします。
混乱を招き、標準のセマンティクスを前提としたツールを壊します。

## ゴールデンルール：ドメインファーストで、カンパニーファーストにしない {#the-golden-rule-domain-first-never-company-first}

セマンティック規約にないカスタム属性が必要な場合、最も重要な原則は次のとおりです。
**ドメインや技術から始めること。会社名やアプリケーション名から始めてはいけません。**

この原則は当たり前のように思えますが、業界全体で一貫して違反されています。
なぜ重要なのか、どうすれば正しく実践できるのかを説明します。

### カンパニーファーストの命名が失敗する理由 {#why-company-first-naming-fails}

| 悪い属性名                  | 問題点                                   |
| :-------------------------- | :--------------------------------------- |
| `og.user.id`                | 会社接頭辞がグローバル名前空間を汚染する |
| `myapp.request.size`        | アプリケーション固有で再利用できない     |
| `acme.inventory.count`      | 標準属性との相関が困難になる             |
| `shopify_store.product.sku` | 概念を1つのベンダーに不必要に結びつける  |

これらのアプローチは以下のような属性を生み出します。

- チームや組織をまたいだ相関が困難
- 異なるコンテキストでの再利用が不可能
- ベンダーロックインされ柔軟性がない
- OpenTelemetry の相互運用性の目標と矛盾する

### ドメインファーストの成功例 {#domain-first-success-stories}

| 良い属性名           | うまくいく理由                 |
| :------------------- | :----------------------------- |
| `user.id`            | 普遍的な概念、ベンダー中立     |
| `request.size`       | アプリケーション間で再利用可能 |
| `inventory.count`    | 明確でドメイン固有の概念       |
| `product.sku`        | 標準的な EC 用語               |
| `workflow.step.name` | 汎用的なプロセス管理の概念     |

このアプローチは、誰にでも理解でき、同じ問題に直面する他の人が再利用でき、将来にわたって使える属性を生み出します。

## 構造を理解する：ドットとアンダースコア {#understanding-the-structure-dots-and-underscores}

OpenTelemetry の属性名は、可読性と一貫性のバランスを取る特定の構造パターンに従います。
このパターンを理解することで、標準的なセマンティック規約と自然に調和する属性を作成できます。

### 階層的な区切りにはドットを使う {#use-dots-for-hierarchical-separation}

ドット（`.`）は階層的なコンポーネントを区切り、`{domain}.{component}.{property}` というパターンに従います。

セマンティック規約の例：

- `http.request.method` - HTTP ドメイン、リクエストコンポーネント、メソッドプロパティ
- `db.collection.name` - データベースドメイン、コレクションコンポーネント、名前プロパティ
- `service.instance.id` - サービスドメイン、インスタンスコンポーネント、ID プロパティ

### 複数語のコンポーネントにはアンダースコアを使う {#use-underscores-for-multi-word-components}

1つのコンポーネントが複数の単語を含む場合はアンダースコア（`_`）を使います。

- `http.response.status_code` - 「status_code」は1つの論理的なコンポーネント
- `system.memory.usage_percent` - 「usage_percent」は1つの計測概念

### 必要に応じてより深い階層を作る {#create-deeper-hierarchies-when-needed}

明確さが増す場合はさらにネストできます。

- `http.request.body.size`
- `k8s.pod.label.{key}`
- `messaging.kafka.message.key`

各レベルは意味のある概念的な境界を表す必要があります。

## 予約済み名前空間：絶対に使ってはいけないもの {#reserved-namespaces-what-you-must-never-use}

特定の名前空間は厳密に予約されており、これらのルールに違反するとテレメトリーデータが壊れる可能性があります。

### `otel.*` 名前空間は使用禁止 {#the-otel-namespace-is-off-limits}

`otel.*` 接頭辞は、OpenTelemetry 仕様自体のために排他的に予約されています。
OpenTelemetry の概念をネイティブにサポートしていないテレメトリー形式で表現するために使用されます。

予約済みの `otel.*` 属性には以下があります。

- `otel.scope.name` - 計装スコープ名
- `otel.status_code` - スパンステータスコード
- `otel.span.sampling_result` - サンプリング判定

**`otel.` で始まる属性は絶対に作成しないでください。**
この名前空間への追加は、OpenTelemetry 仕様の一部として承認される必要があります。

### その他の予約済み属性 {#other-reserved-attributes}

仕様は以下の特定の属性名も予約しています。

- `error.type`
- `exception.message`、`exception.stacktrace`、`exception.type`
- `server.address`、`server.port`
- `service.name`
- `telemetry.sdk.language`、`telemetry.sdk.name`、`telemetry.sdk.version`
- `url.scheme`

## セマンティック規約のパターン {#semantic-convention-patterns}

良い属性命名の直感を身につける最良の方法は、OpenTelemetry のセマンティック規約を学ぶことです。
これらは、オブザーバビリティの専門家による何千時間もの設計作業を反映しています。

### ドメインの整理パターン {#domain-organization-patterns}

セマンティック規約が明確なドメインを中心にどのように整理されているかに注目してください。

#### インフラストラクチャドメイン {#infrastructure-domains}

- `service.*` - サービスの識別とメタデータ
- `host.*` - ホスト/マシン情報
- `container.*` - コンテナランタイム情報
- `process.*` - オペレーティングシステムのプロセス

#### 通信ドメイン {#communication-domains}

- `http.*` - HTTP プロトコルの詳細
- `network.*` - ネットワーク層の情報
- `rpc.*` - リモートプロシージャコールの属性
- `messaging.*` - メッセージキューシステム

#### データドメイン {#data-domains}

- `db.*` - データベース操作
- `url.*` - URL コンポーネント

### 汎用プロパティパターン {#universal-property-patterns}

すべてのドメインにわたって、共通プロパティの一貫したパターンが見られます。

#### 識別プロパティ {#identity-properties}

- `.name` - 人が読める識別子（`service.name`、`container.name`）
- `.id` - システム識別子（`container.id`、`process.pid`）
- `.version` - バージョン情報（`service.version`）
- `.type` - 分類（`messaging.operation.type`、`error.type`）

#### ネットワークプロパティ {#network-properties}

- `.address` - ネットワークアドレス（`server.address`、`client.address`）
- `.port` - ポート番号（`server.port`、`client.port`）

#### 計測プロパティ {#measurement-properties}

- `.size` - バイト計測（`http.request.body.size`）
- `.count` - 数量（`messaging.batch.message_count`）
- `.duration` - 時間計測（`http.server.request.duration`）

カスタムドメインを作成する場合は、同じパターンに従ってください。
在庫管理の場合は次のように検討します。

- `inventory.item.name`
- `inventory.item.id`
- `inventory.location.address`
- `inventory.batch.count`

## カスタムドメインを安全に作成する {#creating-custom-domains-safely}

ビジネスロジックが既存のセマンティック規約にない属性を必要とすることもあります。
これは正常なことです。OpenTelemetry はすべてのビジネスドメインをカバーすることはできません。

### 安全なカスタムドメインのガイドライン {#guidelines-for-safe-custom-domains}

1. 他の人が再利用できる**説明的で汎用的な名前を選ぶ**。
2. ドメイン名に**会社固有の用語を避ける**。
3. セマンティック規約が確立した**階層パターンに従う**。
4. **自分のドメインが将来のセマンティック規約になりうるか検討する**。

### よく設計されたカスタム属性の例 {#examples-of-well-designed-custom-attributes}

| ドメイン       | 良い属性                                 | うまくいく理由                 |
| :------------- | :--------------------------------------- | :----------------------------- |
| ビジネス       | `payment.method`、`order.status`         | 明確で再利用可能なビジネス概念 |
| ロジスティクス | `inventory.location`、`shipment.carrier` | ドメイン固有だが他にも適用可能 |
| プロセス       | `workflow.step.name`、`approval.status`  | 汎用的なプロセス管理           |
| コンテンツ     | `document.format`、`media.codec`         | 普遍的なコンテンツの概念       |

## 稀な例外：接頭辞が合理的な場合 {#the-rare-exception-when-prefixes-make-sense}

稀なケースでは、会社やアプリケーションの接頭辞が必要になることがあります。
これは通常、カスタム属性が分散システム内の他のソースの属性と衝突する可能性がある場合に発生します。

**接頭辞を検討すべき場合：**

- 分散システムでベンダー属性と衝突する可能性がある場合。
- 本当に会社固有のプロプライエタリ技術を計装している場合。
- 汎用化すべきでない内部実装の詳細をキャプチャしている場合。

ほとんどのビジネスロジック属性では、ドメインファーストの命名に従ってください。

## アクションプラン {#your-action-plan}

スパン属性に適切な名前を付けることで、保守性が高く、相互運用可能で、組織全体で価値のあるテレメトリーデータが生まれます。
以下がロードマップです。

1. **まずセマンティック規約を確認する** - セマンティクスが一致する場合はそれを使う。
2. **ドメインを先頭にし、会社名を先頭にしない** - ベンダー中立な属性を作る。
3. **予約済み名前空間を尊重する** - 特に `otel.*` を避ける。
4. **階層パターンに従う** - ドットとアンダースコアを一貫して使う。
5. **再利用性を考えて構築する** - 今のニーズだけでなく先を見据える。

これらの原則に従うことで、今日の計装の課題を解決するだけでなく、すべての人に利益をもたらす、より一貫性のある相互運用可能なオブザーバビリティエコシステムに貢献することになります。

このシリーズの次の記事では、スパンからメトリクスに焦点を移します。
システムのパフォーマンスを示す定量的な計測値に名前を付ける方法と、同じ分離原則やドメインファーストの考え方が最も重要な数値にも適用される理由を探ります。

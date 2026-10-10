---
title: OpenTelemetry Java エージェント 3.0 がまもなく登場 — 今すぐプレビューしましょう
linkTitle: OpenTelemetry Java エージェント 3.0 のプレビュー
date: 2026-10-06
author: >-
  [Jay DeLuca](https://github.com/jaydeluca) (Grafana Labs)
sig: SIG Java
default_lang_commit: 4b2fa5c404644a6ab7a68cb6848c65d32263aa53
cSpell:ignore: Dotel enduser Hystrix invokedynamic Twilio
---

[OpenTelemetry Java エージェント][java-agent]の **[2.32.0 リリース][release-2.32.0]** が公開されました。
これは **3.0** のリリース候補であり、**2026年10月** のリリースを目標としています。
3.0 までに一部の動作が変更される可能性はありますが、デフォルトになる前に今すぐ新しい動作をプレビューできます。

3.0 はテレメトリー、設定、計装のデフォルトを変更します。
データベースとコードの規約は安定版のデフォルトになり、メッセージングはまだ実験的な新しい規約を採用し、一部のキャプチャ設定や計装のデフォルトも変更されます。
[確認すべきポイント](#what-to-check)では各領域について説明しています。

ご自身のダッシュボード、アラート、ダウンストリームパイプラインに対して試し、3.0 が確定する前に[問題があればお知らせください][issues]。

## プレビューを試す {#try-the-preview}

以下の例では、環境変数と[宣言的設定][decl-config]を示しています。
Java エージェントでの宣言的設定のサポートは実験的です。
試す場合は、[設定コンバーター][dc-converter]と Ecosystem Explorer の[設定ビルダー][explorer-builder]を使って始められます。
YAML ファイルは `-Dotel.config.file=/path/to/otel-config.yaml` で渡してください。

環境変数を最初のタブに、宣言的設定を2番目のタブに表示しています。
YAML スニペットは、既存の設定ファイルにマージするためのフラグメントです。
リソース、エクスポーター、その他の設定はそのまま維持してください。

### ステップ 1: 古いテレメトリーと新しいテレメトリーを比較する {#step-1-compare-old-and-new-telemetry}

テストデプロイメントで開始し、プレビュー設定を有効にする前にベースラインのテレメトリーをキャプチャしてください。
次に、アプリケーションに関連するドメインを選択します。
アンブレラプレビューフラグをオフにした状態で、`/dup` を追加すると、古い属性と新しい属性、およびデュアルエミッションがサポートされているメトリクスを同時に出力できます。

{{< tabpane text=true >}}

{{% tab header="環境変数" %}}

```text
OTEL_INSTRUMENTATION_COMMON_V3_PREVIEW=false
OTEL_SEMCONV_STABILITY_OPT_IN=database/dup,code/dup
OTEL_SEMCONV_STABILITY_PREVIEW=messaging/dup
```

{{% /tab %}} {{% tab header="宣言的設定" %}}

```yaml
instrumentation/development:
  general:
    stability_opt_in_list: 'database/dup,code/dup'
  java:
    common:
      v3_preview: false
      semconv_stability:
        preview: [messaging/dup]
```

{{% /tab %}} {{< /tabpane >}}

たとえば、`public` スキーマを使用するよう設定された、データベース `orders` への PostgreSQL JDBC 接続を考えてみましょう。
デュアルエミッションを使用すると、スパンに両方のネーミングスキームを持たせることができます。

| レガシー属性                           | 安定版属性                              |
| -------------------------------------- | --------------------------------------- |
| `db.system: "postgresql"`              | `db.system.name: "postgresql"`          |
| `db.name: "orders"`                    | `db.namespace: "orders\|public"`        |
| `db.statement: "SELECT * FROM orders"` | `db.query.text: "SELECT * FROM orders"` |

ここで、`db.namespace` はデータベースとスキーマを `orders|public` として結合していますが、`db.name` には `orders` のみが含まれています。
クエリを更新する際は、キーだけでなく値も確認してください。
プレビューを試すときは既存のデータベースおよびスキーマ設定をそのまま維持してください。
`public` はこの例で選んだスキーマにすぎません。

> [!NOTE]
>
> **デュアルエミッションは、すべてのレガシーメトリクスや両方のトレース形状を保持するわけではありません。**
> データベースコネクションプールのメトリクスは、`database/dup` を使用しても新しい名前と単位に切り替わります。
> スパンには名前と種類が1つしかなく、`/dup` はそれらに新しい規約を使用します。
> ベースラインキャプチャを使って、同時に出力される属性だけでなく、メトリクスとトレース構造も比較してください。

### ステップ 2: 統合プレビューをテストする {#step-2-test-the-combined-preview}

次に、アンブレラフラグをオンにして、規約とデフォルトをまとめてテストします。

{{< tabpane text=true >}}

{{% tab header="環境変数" %}}

```text
OTEL_INSTRUMENTATION_COMMON_V3_PREVIEW=true
```

{{% /tab %}} {{% tab header="宣言的設定" %}}

```yaml
instrumentation/development:
  java:
    common:
      v3_preview: true
```

{{% /tab %}} {{< /tabpane >}}

アンブレラフラグを有効にすると、新しいデータベース、コード、メッセージングの規約が適用され、**それらのドメインでは `/dup` が無効になります**。

アプリケーションの起動、キャプチャされたフィールド、欠落しているスパンやメトリクスを確認してください。
レガシーフィールドなしでダッシュボードやアラートが機能するか確認し、名前だけでなく値と単位も確認してください。
ミリ秒で表現されている閾値は、メトリクスが秒に変わるときに変換が必要です。

何か壊れて、規約の変更とデフォルト変更のどちらが原因か分からない場合は、アンブレラフラグをオフにし、ステップ 1 の設定から `/dup` を削除して、新しい規約のみをテストしてください。

## 確認すべきポイント {#what-to-check}

### 名前、値、型、単位 {#names-values-types-and-units}

上記の JDBC の例では属性名の変更を示していますが、キーの名前変更だけではすべてのクエリを修正できるわけではありません。

- **名前:** `db.client.connections.max` は `db.client.connection.limit` になります。
  `connections` を `connection` に置き換えるだけでは不十分です。
- **値:** `db.system: "mssql"` は `db.system.name: "microsoft.sql_server"` になります。
- **単位:** データベースコネクションプールの期間メトリクスがミリ秒から秒に変更されます。
- **統合:** `code.namespace` と `code.function` が `code.function.name` に統合されます。

### データベースエンドポイントの識別 {#database-endpoint-identity}

データベース移行の詳細については、[データベースセマンティック規約安定性移行ガイド][db-migration]から始めてください。

サポートされているデータベースクライアントでは、`server.address` は設定されたターゲットを表し、`network.peer.address` は実際に接続されたエンドポイントを識別します（利用可能な場合）。
クラスターの場合、設定されたターゲットは単一のホストではなく、エンドポイントのリストになることがあります。
`server.address` でグループ化されたサービスグラフやダッシュボードを確認してください。
属性名は変わっていなくても、グルーピングが変わる可能性があります。

### メッセージングのトレース構造 {#messaging-trace-structure}

メッセージングはセマンティック規約 [v1.24][messaging-1.24] から [v1.43][messaging-1.43] に移行します。
これはクエリと、トレース内でプロデューサーの処理がコンシューマーの処理に接続される方法の両方に影響します。
Kafka の場合、名前の変更は次のようになります。

| 操作 | レガシースパン名 | プレビュースパン名 |
| ---- | ---------------- | ------------------ |
| 送信 | `orders publish` | `send orders`      |
| 受信 | `orders receive` | `poll orders`      |
| 処理 | `orders process` | `process orders`   |

操作名が先頭に来るようになり、クライアント API を反映した名前になります。
古い `messaging.operation` 属性も `messaging.operation.name` と `messaging.operation.type` に分割されます。
Kafka のポーリングの場合、name は `poll`、type は `receive` です。

**一部のセットアップでは親子関係が変わります。**
Kafka でメッセージを1つずつ処理し、プロデューサーのコンテキストがメッセージに伝搬されている場合、親はコンシューマーの実行方法に依存します。

| セットアップ                                           | レガシー                                             | プレビュー                                                             |
| ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| 受信スパンがオフ（デフォルト）、アクティブスパンなし   | 処理スパンは送信スパンの子                           | 変更なし、さらに送信スパンへのリンクが追加される                       |
| 受信スパンがオフ、別のスパン内でメッセージが処理される | 処理スパンは送信スパンの子                           | 処理スパンはアクティブスパンの子になり、送信スパンへのリンクのみを持つ |
| 受信スパンがオン、アクティブスパンなし                 | 処理スパンは受信スパンの子で、別のトレースに含まれる | 処理スパンは送信スパンの子で、同じトレースに含まれる                   |

メッセージ処理がアクティブなアプリケーションスパン（スケジュールされたジョブのスパンや `@WithSpan` で作成されたメソッドスパンなど）の内部で実行されている場合、プレビューではそのスパンが処理スパンの親になります。
処理スパンは、プロデューサーのスパンを親として使用するかわりに、リンクを持ちます。
これは受信スパンが有効な場合にも適用されます。
バッチ処理スパンは複数のメッセージにリンクでき、この単一メッセージの親モデルには従いません。

受信スパンがオンでアクティブなコンシューマー側のスパンがない場合、単一メッセージの例は次のようになります。

```text
Legacy                                   Preview
trace A                                  trace A
  orders publish        PRODUCER           send orders            PRODUCER
                                             └─ process orders    CONSUMER
trace B                                  trace B
  orders receive        CONSUMER           poll orders            CLIENT
    └─ orders process   CONSUMER             (link → send orders)
         (link → orders publish)
```

プレビューでは、送信スパンが親である場合でも、処理スパンは送信スパンへのリンクを持ちます。
ポーリングスパンはクライアント操作を単独で表すようになり、種類が `CONSUMER` から `CLIENT` に変更されます。

受信スパンは引き続きオプトインです。
2.32.0 の Kafka では、受信テレメトリーを有効にするとポーリング期間メトリクスも有効になります。
無効の場合でも、プレビューは処理中に消費されたメッセージ数と処理期間を記録します。
レガシーメッセージングメトリクスが出力されていたケース（Pulsar など）では、規約の変更は次のとおりです。

| レガシーメトリクス           | プレビューメトリクス                  |
| ---------------------------- | ------------------------------------- |
| `messaging.publish.duration` | `messaging.client.operation.duration` |
| `messaging.receive.duration` | `messaging.client.operation.duration` |
| `messaging.receive.messages` | `messaging.client.consumed.messages`  |
| _（なし）_                   | `messaging.client.sent.messages`      |
| _（なし）_                   | `messaging.process.duration`          |

Kafka はこの表のプレビュー計装を新たに取得しますが、ここに記載されているレガシー計装は出力していませんでした。
`messaging/dup` で Kafka に両方のセットが生成されることを期待しないでください。

### キャプチャ設定と計装のデフォルト {#capture-settings-and-instrumentation-defaults}

プレビューでは、テレメトリーの名前変更だけでなく、追加や削除も行われる場合があります。
たとえば、アプリケーションが SLF4J のキーバリューペアを使って、ログメッセージに `order.id` と `customer.tier` を構造化フィールドとしてすでに付与しているとします。
アンブレラプレビューを有効にすると、キャプチャを個別に有効にしなくても、それらのフィールドがエクスポートされたログに表示されることがあります。
MDC は引き続き個別に設定が必要で、オプトインです。

構造化フィールドから `order.id` のみをキャプチャするには次のようにします。

{{< tabpane text=true >}}

{{% tab header="環境変数" %}}

```text
OTEL_INSTRUMENTATION_COMMON_LOGGING_STRUCTURED_ATTRIBUTES_INCLUDED=order.id
```

{{% /tab %}} {{% tab header="宣言的設定" %}}

```yaml
instrumentation/development:
  java:
    common:
      logging:
        structured_attributes:
          included: [order.id]
```

{{% /tab %}} {{< /tabpane >}}

共通の `.included` / `.excluded` セレクターは、プレビューモードでは無視される古いソース固有の構造化フィールドキャプチャ設定を置き換えます。
移行時に出力されるフィールドを確認してください。
新しいセレクターは glob パターンをサポートするため、`*` は「すべてを含める」を意味します。
リテラル名のリストを使用していた他のキャプチャ設定（メッセージングの `capture-headers` など）を移行する場合、対応する `.included` セレクターに `*` をコピーすると、キャプチャが広がる可能性があります。

プレビュー有効化後にテレメトリーや起動時に気づく可能性のあるその他のデフォルト変更は次のとおりです。

| プレビュー有効化後に気づく可能性のあること                           | 確認すべきこと                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 追加の構造化ログ属性                                                 | 共通の `.included` / `.excluded` セレクターを確認する                                      |
| Hibernate、Hystrix、Twilio のスパンが表示されない                    | これらの計装はデフォルトでオフになっているため、必要なものを明示的に再有効化する           |
| Zipkin エクスポーターを使用するとエージェント/SDK の初期化が失敗する | Zipkin エクスポーターのサポートはプレビューモードでは削除されているため、OTLP に切り替える |

### ユーザー識別情報のキャプチャ {#identity-capture}

ユーザー識別属性をキャプチャしている場合は、クエリだけでなくキャプチャ設定も更新してください。
アンブレラプレビューでは、古い `otel.instrumentation.common.enduser.*.enabled` 設定は無視されます。
キャプチャは引き続きオプトインです。
必要なフィールドには `otel.instrumentation.common.user.name.enabled=true` と `otel.instrumentation.common.user.roles.enabled=true` を使用してください。

- `enduser.id` は `user.name` になります。
- `enduser.role`（カンマ区切りの文字列）は `user.roles`（文字列配列）になります。
- `enduser.scope` は置き換えがなく、キャプチャされなくなります。

### エクステンションとディストリビューションのメンテナー向け {#for-extension-and-distribution-maintainers}

エクステンションとディストリビューションのメンテナーもプレビューをテストしてください。
invokedynamic 計装がデフォルトになり、計装クラスとヘルパークラスのロード方法が変更されます。

## AI を活用した移行支援 {#using-ai-to-help-with-the-migration}

[OpenTelemetry Ecosystem Explorer][explorer] は、バージョン固有の計装メタデータを提供しており、AI エージェントが名前、型、単位の変更を特定するのに役立ちます。
キャプチャした `/dup` テレメトリーと組み合わせて値の変更を確認し、ダッシュボードやアラートの更新案を AI エージェントに作成させましょう。

<details>
<summary>ご自身のスタックに合わせて調整するプロンプト例</summary>

```text
Help migrate my dashboards and alerts to the Java agent 3.0 preview.

Agent version, libraries, and preview settings: <details>
Queries and backend naming conventions: <files or examples>
Baseline and preview telemetry: <files or samples>

Use the OpenTelemetry Ecosystem Explorer (https://explorer.opentelemetry.io/)
metadata for my version and my telemetry. Check the emission conditions against
my settings; use upstream sources to verify mappings the metadata cannot prove.

Return a cited old-to-new mapping and draft query changes. Check names, types,
values, and units; flag trace-shape or capture changes separately. Mark missing
or conflicting evidence VERIFY, including unavailable version metadata. Do not
assume missing metadata means no change. Preserve query intent and flag any
backend naming assumptions. Do not apply changes.
```

</details>

提案された変更を適用する前に、実際のデータと照合して確認してください。

## 発見した問題を教えてください {#tell-us-what-you-find}

エージェントのバージョン、設定、影響を受けるライブラリのバージョン、予期しない動作の簡単な例を添えて[イシューを作成してください][issues]。
今テストすることで、3.0 がデフォルトになる前に問題に対処する時間が生まれます。

[release-2.32.0]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v2.32.0
[java-agent]: https://github.com/open-telemetry/opentelemetry-java-instrumentation
[issues]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues
[decl-config]: /docs/zero-code/java/agent/declarative-configuration/
[explorer]: https://explorer.opentelemetry.io/
[dc-converter]: /docs/zero-code/java/agent/declarative-configuration/#convert-your-existing-configuration
[explorer-builder]: https://explorer.opentelemetry.io/java-agent/configuration/builder
[messaging-1.24]: https://github.com/open-telemetry/semantic-conventions/blob/v1.24.0/docs/messaging/messaging-spans.md
[messaging-1.43]: https://github.com/open-telemetry/semantic-conventions/blob/v1.43.0/docs/messaging/messaging-spans.md
[db-migration]: /docs/specs/semconv/non-normative/db-migration/

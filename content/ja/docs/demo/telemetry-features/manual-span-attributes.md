---
title: 手動スパン属性
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: bf53e16042a4ec7ae37779f944c49d1cde3719d3
cSpell:ignore: enduser
---

このページでは、デモ全体で使用される手動スパン属性を一覧にしています。

## 広告 {#ad}

| 名前                         | 型     | 説明                                     |
| ---------------------------- | ------ | ---------------------------------------- |
| `demo.ad.context_keys`       | string | 広告ターゲティング用のコンテキストキー   |
| `demo.ad.context_keys.count` | number | コンテキストキーの数                     |
| `demo.ad.count`              | number | 配信された広告の数                       |
| `demo.ad.request_type`       | string | 広告リクエストの種類                     |
| `demo.ad.response_type`      | string | 広告レスポンスの種類                     |
| `demo.ad.category`           | string | 広告カテゴリ                             |
| `session.id`                 | string | セッションの一意な識別子                 |
| `enduser.id`                 | string | システム内のエンドユーザーの一意な識別子 |

## カート {#cart}

| 名前                    | 型     | 説明                 |
| ----------------------- | ------ | -------------------- |
| `user.id`               | string | ユーザー識別子       |
| `demo.product.id`       | string | 商品識別子           |
| `demo.product.quantity` | number | 商品の数量           |
| `demo.cart.items.count` | number | カート内のアイテム数 |

## 決済 {#checkout}

| 名前                                   | 型      | 説明                                                                        |
| -------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `demo.cart.items.count`                | number  | カート内のアイテムの合計数                                                  |
| `demo.order.amount`                    | number  | 注文金額                                                                    |
| `demo.order.id`                        | string  | 注文 ID                                                                     |
| `demo.order.items.count`               | number  | 注文内のユニークなアイテム数                                                |
| `user_agent.synthetic.type`            | string  | `test` などの合成トラフィックのカテゴリ                                     |
| `demo.payment.card_cvv`                | number  | カード CVV（`emitRawPii` フィーチャーフラグが有効な場合のみ）               |
| `demo.payment.card_number`             | string  | カード番号（`emitRawPii` フィーチャーフラグが有効な場合のみ）               |
| `demo.payment.transaction.id`          | string  | 支払いトランザクション ID                                                   |
| `demo.shipping.amount`                 | number  | 配送料                                                                      |
| `demo.shipping.tracking.id`            | string  | 配送追跡 ID                                                                 |
| `demo.user_context.selected_currency`  | string  | ユーザーの通貨                                                              |
| `messaging.kafka.producer.duration_ms` | number  | Kafka プロデューサーの確認応答を得るまでの時間（ミリ秒）                    |
| `messaging.kafka.producer.success`     | boolean | メッセージが Kafka に正常に書き込まれたかどうか                             |
| `user.email`                           | string  | ユーザーのメールアドレス（`emitRawPii` フィーチャーフラグが有効な場合のみ） |
| `user.id`                              | string  | ユーザー ID                                                                 |

## 通貨 {#currency}

| 名前                 | 型     | 説明               |
| -------------------- | ------ | ------------------ |
| `demo.exchange.from` | string | 変換元の通貨コード |
| `demo.exchange.to`   | string | 変換先の通貨コード |

## メール {#email}

| 名前            | 型     | 説明       |
| --------------- | ------ | ---------- |
| `demo.order.id` | string | 注文識別子 |

## フロントエンド {#frontend}

| 名前                     | 型     | 説明                                        |
| ------------------------ | ------ | ------------------------------------------- |
| `demo.synthetic_request` | string | リクエストが合成/テストトラフィックかどうか |
| `session.id`             | string | セッションの一意な識別子                    |
| `enduser.id`             | string | システム内のエンドユーザーの一意な識別子    |

## 負荷生成ツール {#load-generator}

| 名前                       | 型     | 説明                                        |
| -------------------------- | ------ | ------------------------------------------- |
| `session.id`               | string | セッションの一意な識別子                    |
| `demo.synthetic_request`   | string | リクエストが合成/テストトラフィックかどうか |
| `user.id`                  | string | ユーザー識別子                              |
| `demo.request.flood.count` | number | フラッドで送信された繰り返しリクエストの数  |
| `demo.product.id`          | string | 商品識別子                                  |
| `demo.product.quantity`    | number | 商品の数量                                  |
| `demo.ad.category`         | string | 広告カテゴリ                                |
| `demo.cart.items.count`    | number | カート内のアイテム数                        |
| `gen_ai.input.messages`    | string | モデルへの入力として提供されたチャット履歴  |

## 支払い {#payment}

| 名前                              | 型      | 説明                                     |
| --------------------------------- | ------- | ---------------------------------------- |
| `user_agent.synthetic.type`       | string  | `test` などの合成トラフィックのカテゴリ  |
| `enduser.id`                      | string  | システム内のエンドユーザーの一意な識別子 |
| `demo.user_context.loyalty_level` | string  | 顧客ロイヤルティレベル                   |
| `demo.payment.card_type`          | string  | クレジットカードの種類                   |
| `demo.payment.card_valid`         | boolean | カードの検証ステータス                   |
| `demo.payment.card_number`        | string  | クレジットカード番号                     |
| `demo.payment.card_cvv`           | number  | クレジットカード CVV                     |
| `demo.payment.charged`            | boolean | 支払いが正常に請求されたかどうか         |
| `demo.payment.amount`             | string  | 支払い金額                               |

## 商品カタログ {#product-catalog}

| 名前                        | 型     | 説明                   |
| --------------------------- | ------ | ---------------------- |
| `demo.product.count`        | number | 利用可能な商品の合計数 |
| `demo.product.id`           | string | 商品識別子             |
| `demo.product.name`         | string | 商品名                 |
| `demo.product.search.count` | number | 検索結果の数           |

## 見積もり {#quote}

| 名前                              | 型     | 説明                 |
| --------------------------------- | ------ | -------------------- |
| `demo.shipping.quote.items_count` | number | 見積もりのアイテム数 |
| `demo.shipping.quote.cost.total`  | number | 見積もり合計金額     |

## レコメンデーション {#recommendation}

| 名前                                     | 型       | 説明                                             |
| ---------------------------------------- | -------- | ------------------------------------------------ |
| `demo.product.recommended.count`         | number   | レコメンデーションされた商品数                   |
| `demo.feature_flag.recommendation_cache` | boolean  | レコメンデーションキャッシュが有効かどうか       |
| `demo.recommendation.cache_hit`          | boolean  | レコメンデーションキャッシュがヒットしたかどうか |
| `demo.product.count`                     | number   | 利用可能な商品の合計数                           |
| `demo.product.filtered.count`            | number   | フィルタリング後の商品数                         |
| `demo.product.filtered.list`             | string[] | フィルタリングされた商品 ID のリスト             |

## 配送 {#shipping}

| 名前                       | 型     | 説明       |
| -------------------------- | ------ | ---------- |
| `demo.shipping.cost.total` | string | 送料の合計 |

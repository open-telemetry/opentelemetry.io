---
title: 手動スパン属性
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: 3560c03d5cbe845c6189e6e30441434c7760eca0
---

このページでは、デモ全体で使用される手動スパン属性を一覧にしています。

## 広告 {#ad}

| 名前                        | 型     | 説明                                                   |
| --------------------------- | ------ | ------------------------------------------------------ |
| `app.ads.category`          | string | 返された広告のカテゴリ                                 |
| `app.ads.contextKeys`       | string | 関連する広告を見つけるために使用されるコンテキストキー |
| `app.ads.contextKeys.count` | number | 使用されたユニークなコンテキストキーの数               |
| `app.ads.count`             | number | ユーザーに返された広告の数                             |
| `app.ads.ad_request_type`   | string | `targeted` または `not_targeted`                       |
| `app.ads.ad_response_type`  | string | `targeted` または `random`                             |

## カート {#cart}

| 名前                   | 型     | 説明                           |
| ---------------------- | ------ | ------------------------------ |
| `app.cart.items.count` | number | カート内のユニークなアイテム数 |
| `app.product.id`       | string | カートアイテムの商品 ID        |
| `app.product.quantity` | string | カートアイテムの数量           |
| `app.user.id`          | string | ユーザー ID                    |

## 決済 {#checkout}

| 名前                         | 型     | 説明                         |
| ---------------------------- | ------ | ---------------------------- |
| `app.cart.items.count`       | number | カート内のアイテムの合計数   |
| `app.order.amount`           | number | 注文金額                     |
| `app.order.id`               | string | 注文 ID                      |
| `app.order.items.count`      | number | 注文内のユニークなアイテム数 |
| `app.payment.transaction.id` | string | 支払いトランザクション ID    |
| `app.shipping.amount`        | number | 配送料                       |
| `app.shipping.tracking.id`   | string | 配送追跡 ID                  |
| `app.user.currency`          | string | ユーザーの通貨               |
| `app.user.id`                | string | ユーザー ID                  |

## 通貨 {#currency}

| 名前                           | 型     | 説明               |
| ------------------------------ | ------ | ------------------ |
| `app.currency.conversion.from` | string | 変換元の通貨コード |
| `app.currency.conversion.to`   | string | 変換先の通貨コード |

## メール {#email}

| 名前                  | 型     | 説明                               |
| --------------------- | ------ | ---------------------------------- |
| `app.email.recipient` | string | 注文確認に使用されるメールアドレス |
| `app.order.id`        | string | 注文 ID                            |

## フロントエンド {#frontend}

| 名前                     | 型     | 説明                           |
| ------------------------ | ------ | ------------------------------ |
| `app.cart.size`          | number | カート内のアイテムの合計数     |
| `app.cart.items.count`   | number | カート内のユニークなアイテム数 |
| `app.cart.shipping.cost` | number | カートの送料                   |
| `app.cart.total.price`   | number | カートの合計金額               |
| `app.currency`           | string | ユーザーの通貨                 |
| `app.currency.new`       | string | 設定する新しい通貨             |
| `app.order.total`        | number | 注文の合計金額                 |
| `app.product.id`         | string | 商品 ID                        |
| `app.product.quantity`   | number | 商品の数量                     |
| `app.products.count`     | number | 表示された商品の合計数         |
| `app.request.id`         | string | リクエスト ID                  |
| `app.session.id`         | string | セッション ID                  |
| `app.user.id`            | string | ユーザー ID                    |

## 負荷生成ツール {#load-generator}

| 名前 | 型  | 説明 |
| ---- | --- | ---- |
| なし |     |      |

## 支払い {#payment}

| 名前                     | 型      | 説明                                                   |
| ------------------------ | ------- | ------------------------------------------------------ |
| `app.payment.amount`     | number  | 支払いの合計金額                                       |
| `app.payment.card_type`  | string  | 支払いに使用されたカードの種類                         |
| `app.payment.card_valid` | boolean | 使用されたカードが有効かどうか                         |
| `app.payment.charged`    | boolean | 請求が成功したかどうか（負荷生成ツール使用時は false） |

## 商品カタログ {#product-catalog}

| 名前                        | 型     | 説明                 |
| --------------------------- | ------ | -------------------- |
| `app.product.id`            | string | 商品 ID              |
| `app.product.name`          | string | 商品名               |
| `app.products.count`        | number | カタログ内の商品数   |
| `app.products_search.count` | number | 検索で返された商品数 |

## 見積もり {#quote}

| 名前                    | 型     | 説明                     |
| ----------------------- | ------ | ------------------------ |
| `app.quote.items.count` | number | 出荷するアイテムの合計数 |
| `app.quote.cost.total`  | number | 送料の見積もり合計       |

## レコメンデーション {#recommendation}

| 名前                             | 型      | 説明                                   |
| -------------------------------- | ------- | -------------------------------------- |
| `app.filtered_products.count`    | number  | フィルタリングされて返された商品数     |
| `app.products.count`             | number  | カタログ内の商品数                     |
| `app.products_recommended.count` | number  | レコメンデーションとして返された商品数 |
| `app.cache_hit`                  | boolean | キャッシュにアクセスしたかどうか       |

## 配送 {#shipping}

| 名前                      | 型     | 説明       |
| ------------------------- | ------ | ---------- |
| `app.shipping.cost.total` | number | 送料の合計 |

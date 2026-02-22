---
title: 手动 Span 属性
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: afa0a0900a9fbd6f1a02d7ea31091a5a20cb5612
---

本页面列出了在整个 Demo 使用的所有手动 Span 属性：

## 广告 {#ad}

| 名称                        | 类型   | 描述                         |
| --------------------------- | ------ | ---------------------------- |
| `app.ads.category`          | string | 返回广告的分类               |
| `app.ads.contextKeys`       | string | 用于查找相关广告的上下文键   |
| `app.ads.contextKeys.count` | number | 使用的唯一上下文键数量       |
| `app.ads.count`             | number | 返回给用户的广告数量         |
| `app.ads.ad_request_type`   | string | `targeted` 或 `not_targeted` |
| `app.ads.ad_response_type`  | string | `targeted` 或 `random`       |

## 购物车 {#cart}

| 名称                   | 类型   | 描述                 |
| ---------------------- | ------ | -------------------- |
| `app.cart.items.count` | number | 购物车中唯一商品数量 |
| `app.product.id`       | string | 购物车商品的产品 ID  |
| `app.product.quantity` | string | 购物车商品数量       |
| `app.user.id`          | string | 用户 ID              |

## 结算 {#checkout}

| 名称                         | 类型   | 描述               |
| ---------------------------- | ------ | ------------------ |
| `app.cart.items.count`       | number | 购物车中商品总数   |
| `app.order.amount`           | number | 订单金额           |
| `app.order.id`               | string | 订单 ID            |
| `app.order.items.count`      | number | 订单中唯一商品数量 |
| `app.payment.transaction.id` | string | 支付交易 ID        |
| `app.shipping.amount`        | number | 运费金额           |
| `app.shipping.tracking.id`   | string | 物流追踪 ID        |
| `app.user.currency`          | string | 用户使用的货币     |
| `app.user.id`                | string | 用户 ID            |

## 货币 {#currency}

| 名称                           | 类型   | 描述         |
| ------------------------------ | ------ | ------------ |
| `app.currency.conversion.from` | string | 原始货币代码 |
| `app.currency.conversion.to`   | string | 目标货币代码 |

## 电子邮件 {#email}

| 名称                  | 类型   | 描述                       |
| --------------------- | ------ | -------------------------- |
| `app.email.recipient` | string | 用于订单确认的电子邮箱地址 |
| `app.order.id`        | string | 订单 ID                    |

## 前端 {#frontend}

| 名称                     | 类型   | 描述                 |
| ------------------------ | ------ | -------------------- |
| `app.cart.size`          | number | 购物车中商品总数     |
| `app.cart.items.count`   | number | 购物车中唯一商品数量 |
| `app.cart.shipping.cost` | number | 购物车运费           |
| `app.cart.total.price`   | number | 购物车总价           |
| `app.currency`           | string | 用户货币             |
| `app.currency.new`       | string | 要设置的新货币       |
| `app.order.total`        | number | 订单总金额           |
| `app.product.id`         | string | 产品 ID              |
| `app.product.quantity`   | number | 产品数量             |
| `app.products.count`     | number | 展示的产品总数       |
| `app.request.id`         | string | 请求 ID              |
| `app.session.id`         | string | 会话 ID              |
| `app.user.id`            | string | 用户 ID              |

## 负载生成器 {#load-generator}

| 名称 | 类型 | 描述 |
| ---- | ---- | ---- |
| 暂无 |      |      |

## 支付 {#payment}

| 名称                     | 类型    | 描述                                   |
| ------------------------ | ------- | -------------------------------------- |
| `app.payment.amount`     | number  | 支付总金额                             |
| `app.payment.card_type`  | string  | 支付所用的银行卡类型                   |
| `app.payment.card_valid` | boolean | 使用的银行卡是否有效                   |
| `app.payment.charged`    | boolean | 是否成功扣款（在负载生成器中为 false） |

## 产品目录 {#product-catalog}

| 名称                        | 类型   | 描述               |
| --------------------------- | ------ | ------------------ |
| `app.product.id`            | string | 产品 ID            |
| `app.product.name`          | string | 产品名称           |
| `app.products.count`        | number | 目录中的产品数量   |
| `app.products_search.count` | number | 搜索返回的产品数量 |

## 产品评价 {#product-reviews}

| 名称                                | 类型   | 描述                   |
| ----------------------------------- | ------ | ---------------------- |
| `app.product.id`                    | string | 产品 ID                |
| `app.product_reviews.count`         | number | 产品评价数量           |
| `app.product_reviews.average_score` | number | 产品平均评分           |
| `app.product.question`              | string | 针对某个产品提出的问题 |

## 报价 {#quote}

| 名称                    | 类型   | 描述               |
| ----------------------- | ------ | ------------------ |
| `app.quote.items.count` | number | 需要发货的商品总数 |
| `app.quote.cost.total`  | number | 运费报价总额       |

## 推荐 {#recommendation}

| 名称                             | 类型    | 描述                 |
| -------------------------------- | ------- | -------------------- |
| `app.filtered_products.count`    | number  | 返回的筛选后产品数量 |
| `app.products.count`             | number  | 目录中的产品数量     |
| `app.products_recommended.count` | number  | 返回的推荐产品数量   |
| `app.cache_hit`                  | boolean | 是否命中缓存         |

## 物流 {#shipping}

| 名称                      | 类型   | 描述     |
| ------------------------- | ------ | -------- |
| `app.shipping.cost.total` | number | 运费总额 |

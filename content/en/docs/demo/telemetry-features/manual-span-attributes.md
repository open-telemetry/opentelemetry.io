---
title: Manual Span Attributes
aliases: [manual_span_attributes, ../manual-span-attributes]
cSpell:ignore: enduser
---

This page lists the manual Span Attributes used throughout the demo:

## Ad

| Name                         | Type   | Description                                    |
| ---------------------------- | ------ | ---------------------------------------------- |
| `demo.ad.context_keys`       | string | Context keys for ad targeting                  |
| `demo.ad.context_keys.count` | number | Number of context keys                         |
| `demo.ad.count`              | number | Number of advertisements served                |
| `demo.ad.request_type`       | string | Type of ad request                             |
| `demo.ad.response_type`      | string | Type of ad response                            |
| `demo.ad.category`           | string | Advertisement category                         |
| `session.id`                 | string | Unique identifier of a session                 |
| `enduser.id`                 | string | Unique identifier of an end user in the system |

## Cart

| Name                    | Type   | Description             |
| ----------------------- | ------ | ----------------------- |
| `user.id`               | string | User identifier         |
| `demo.product.id`       | string | Product identifier      |
| `demo.product.quantity` | number | Product quantity        |
| `demo.cart.items.count` | number | Number of items in cart |

## Checkout

| Name                                   | Type    | Description                                                     |
| -------------------------------------- | ------- | --------------------------------------------------------------- |
| `demo.cart.items.count`                | number  | Total number of items in cart                                   |
| `demo.order.amount`                    | number  | Order amount                                                    |
| `demo.order.id`                        | string  | Order ID                                                        |
| `demo.order.items.count`               | number  | Number of unique items in order                                 |
| `user_agent.synthetic.type`            | string  | Category of synthetic traffic, such as `test`                   |
| `demo.payment.card_cvv`                | number  | Card CVV, only when the `emitRawPii` feature flag is enabled    |
| `demo.payment.card_number`             | string  | Card number, only when the `emitRawPii` feature flag is enabled |
| `demo.payment.transaction.id`          | string  | Payment transaction ID                                          |
| `demo.shipping.amount`                 | number  | Shipping amount                                                 |
| `demo.shipping.tracking.id`            | string  | Shipping tracking ID                                            |
| `demo.user_context.selected_currency`  | string  | User currency                                                   |
| `messaging.kafka.producer.duration_ms` | number  | Time to get the Kafka producer acknowledgement, in milliseconds |
| `messaging.kafka.producer.success`     | boolean | Whether the message was successfully written to Kafka           |
| `user.email`                           | string  | User email, only when the `emitRawPii` feature flag is enabled  |
| `user.id`                              | string  | User ID                                                         |

## Currency

| Name                 | Type   | Description          |
| -------------------- | ------ | -------------------- |
| `demo.exchange.from` | string | Source currency code |
| `demo.exchange.to`   | string | Target currency code |

## Email

| Name            | Type   | Description      |
| --------------- | ------ | ---------------- |
| `demo.order.id` | string | Order identifier |

## Frontend

| Name                     | Type   | Description                                    |
| ------------------------ | ------ | ---------------------------------------------- |
| `demo.synthetic_request` | string | Whether the request is synthetic/test traffic  |
| `session.id`             | string | Unique identifier of a session                 |
| `enduser.id`             | string | Unique identifier of an end user in the system |

## Load Generator

| Name                       | Type   | Description                                    |
| -------------------------- | ------ | ---------------------------------------------- |
| `session.id`               | string | Unique identifier of a session                 |
| `demo.synthetic_request`   | string | Whether the request is synthetic/test traffic  |
| `user.id`                  | string | User identifier                                |
| `demo.request.flood.count` | number | Number of repeated requests sent in a flood    |
| `demo.product.id`          | string | Product identifier                             |
| `demo.product.quantity`    | number | Product quantity                               |
| `demo.ad.category`         | string | Advertisement category                         |
| `demo.cart.items.count`    | number | Number of items in cart                        |
| `gen_ai.input.messages`    | string | Chat history provided to the model as an input |

## Payment

| Name                              | Type    | Description                                    |
| --------------------------------- | ------- | ---------------------------------------------- |
| `user_agent.synthetic.type`       | string  | Category of synthetic traffic, such as `test`  |
| `enduser.id`                      | string  | Unique identifier of an end user in the system |
| `demo.user_context.loyalty_level` | string  | Customer loyalty level                         |
| `demo.payment.card_type`          | string  | Credit card type                               |
| `demo.payment.card_valid`         | boolean | Card validation status                         |
| `demo.payment.card_number`        | string  | Credit card number                             |
| `demo.payment.card_cvv`           | number  | Credit card CVV                                |
| `demo.payment.charged`            | boolean | Whether payment was successfully charged       |
| `demo.payment.amount`             | string  | Payment amount                                 |

## Product Catalog

| Name                        | Type   | Description                        |
| --------------------------- | ------ | ---------------------------------- |
| `demo.product.count`        | number | Total number of products available |
| `demo.product.id`           | string | Product identifier                 |
| `demo.product.name`         | string | Product name                       |
| `demo.product.search.count` | number | Number of search results           |

## Quote

| Name                              | Type   | Description              |
| --------------------------------- | ------ | ------------------------ |
| `demo.shipping.quote.items_count` | number | Number of items in quote |
| `demo.shipping.quote.cost.total`  | number | Total quote cost         |

## Recommendation

| Name                                     | Type     | Description                               |
| ---------------------------------------- | -------- | ----------------------------------------- |
| `demo.product.recommended.count`         | number   | Number of products recommended            |
| `demo.feature_flag.recommendation_cache` | boolean  | Whether recommendation caching is enabled |
| `demo.recommendation.cache_hit`          | boolean  | Whether the recommendation cache was hit  |
| `demo.product.count`                     | number   | Total number of products available        |
| `demo.product.filtered.count`            | number   | Number of products after filtering        |
| `demo.product.filtered.list`             | string[] | List of filtered product IDs              |

## Shipping

| Name                       | Type   | Description         |
| -------------------------- | ------ | ------------------- |
| `demo.shipping.cost.total` | string | Total shipping cost |

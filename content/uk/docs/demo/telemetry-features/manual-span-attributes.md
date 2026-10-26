---
title: Атрибути відрізків, створених вручну
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: 3735e2ce87957c968083ea53aa8eb0d50f4c3fbe
cSpell:ignore: enduser
---

Ця сторінка містить перелік атрибутів відрізків, створених вручну, що використовуються в демонстрації:

## Ad

| Назва                        | Тип    | Опис                                                     |
| ---------------------------- | ------ | -------------------------------------------------------- |
| `demo.ad.context_keys`       | string | Ключі контексту для таргетування реклами                 |
| `demo.ad.context_keys.count` | number | Кількість ключів контексту                               |
| `demo.ad.count`              | number | Кількість показаних оголошень                            |
| `demo.ad.request_type`       | string | Тип запиту на рекламу                                    |
| `demo.ad.response_type`      | string | Тип відповіді на рекламу                                 |
| `demo.ad.category`           | string | Категорія оголошення                                     |
| `session.id`                 | string | Унікальний ідентифікатор сесії                           |
| `enduser.id`                 | string | Унікальний ідентифікатор кінцевого користувача в системі |

## Cart

| Назва                   | Тип    | Опис                         |
| ----------------------- | ------ | ---------------------------- |
| `user.id`               | string | Ідентифікатор користувача    |
| `demo.product.id`       | string | Ідентифікатор товару         |
| `demo.product.quantity` | number | Кількість товару             |
| `demo.cart.items.count` | number | Кількість предметів у кошику |

## Checkout

| Назва                                  | Тип     | Опис                                                                             |
| -------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `demo.cart.items.count`                | number  | Загальна кількість предметів у кошику                                            |
| `demo.order.amount`                    | number  | Сума замовлення                                                                  |
| `demo.order.id`                        | string  | Ідентифікатор замовлення                                                         |
| `demo.order.items.count`               | number  | Кількість унікальних предметів у замовленні                                      |
| `user_agent.synthetic.type`            | string  | Категорія синтетичного трафіку, наприклад `test`                                 |
| `demo.payment.card_cvv`                | number  | CVV картки, лише коли увімкнено прапорець функції `emitRawPii`                   |
| `demo.payment.card_number`             | string  | Номер картки, лише коли увімкнено прапорець функції `emitRawPii`                 |
| `demo.payment.transaction.id`          | string  | Ідентифікатор платіжної транзакції                                               |
| `demo.shipping.amount`                 | number  | Сума доставки                                                                    |
| `demo.shipping.tracking.id`            | string  | Ідентифікатор відстеження доставки                                               |
| `demo.user_context.selected_currency`  | string  | Валюта користувача                                                               |
| `messaging.kafka.producer.duration_ms` | number  | Час отримання підтвердження від продюсера Kafka, у мілісекундах                  |
| `messaging.kafka.producer.success`     | boolean | Чи було повідомлення успішно записано в Kafka                                    |
| `user.email`                           | string  | Електронна пошта користувача, лише коли увімкнено прапорець функції `emitRawPii` |
| `user.id`                              | string  | Ідентифікатор користувача                                                        |

## Currency

| Назва                | Тип    | Опис                |
| -------------------- | ------ | ------------------- |
| `demo.exchange.from` | string | Код вихідної валюти |
| `demo.exchange.to`   | string | Код цільової валюти |

## Email

| Назва           | Тип    | Опис                     |
| --------------- | ------ | ------------------------ |
| `demo.order.id` | string | Ідентифікатор замовлення |

## Frontend

| Назва                    | Тип    | Опис                                                     |
| ------------------------ | ------ | -------------------------------------------------------- |
| `demo.synthetic_request` | string | Чи є запит синтетичним/тестовим трафіком                 |
| `session.id`             | string | Унікальний ідентифікатор сесії                           |
| `enduser.id`             | string | Унікальний ідентифікатор кінцевого користувача в системі |

## Load Generator

| Назва                      | Тип    | Опис                                             |
| -------------------------- | ------ | ------------------------------------------------ |
| `session.id`               | string | Унікальний ідентифікатор сесії                   |
| `demo.synthetic_request`   | string | Чи є запит синтетичним/тестовим трафіком         |
| `user.id`                  | string | Ідентифікатор користувача                        |
| `demo.request.flood.count` | number | Кількість повторних запитів, надісланих у потоці |
| `demo.product.id`          | string | Ідентифікатор товару                             |
| `demo.product.quantity`    | number | Кількість товару                                 |
| `demo.ad.category`         | string | Категорія оголошення                             |
| `demo.cart.items.count`    | number | Кількість предметів у кошику                     |
| `gen_ai.input.messages`    | string | Історія чату, надана моделі як вхідні дані       |

## Payment

| Назва                             | Тип     | Опис                                                     |
| --------------------------------- | ------- | -------------------------------------------------------- |
| `user_agent.synthetic.type`       | string  | Категорія синтетичного трафіку, наприклад `test`         |
| `enduser.id`                      | string  | Унікальний ідентифікатор кінцевого користувача в системі |
| `demo.user_context.loyalty_level` | string  | Рівень лояльності клієнта                                |
| `demo.payment.card_type`          | string  | Тип кредитної картки                                     |
| `demo.payment.card_valid`         | boolean | Статус перевірки картки                                  |
| `demo.payment.card_number`        | string  | Номер кредитної картки                                   |
| `demo.payment.card_cvv`           | number  | CVV кредитної картки                                     |
| `demo.payment.charged`            | boolean | Чи було успішно стягнуто платіж                          |
| `demo.payment.amount`             | string  | Сума платежу                                             |

## Product Catalog

| Назва                       | Тип    | Опис                                 |
| --------------------------- | ------ | ------------------------------------ |
| `demo.product.count`        | number | Загальна кількість доступних товарів |
| `demo.product.id`           | string | Ідентифікатор товару                 |
| `demo.product.name`         | string | Назва товару                         |
| `demo.product.search.count` | number | Кількість результатів пошуку         |

## Quote

| Назва                             | Тип    | Опис                             |
| --------------------------------- | ------ | -------------------------------- |
| `demo.shipping.quote.items_count` | number | Кількість предметів у розрахунку |
| `demo.shipping.quote.cost.total`  | number | Загальна вартість розрахунку     |

## Recommendation

| Назва                                    | Тип      | Опис                                           |
| ---------------------------------------- | -------- | ---------------------------------------------- |
| `demo.product.recommended.count`         | number   | Кількість рекомендованих товарів               |
| `demo.feature_flag.recommendation_cache` | boolean  | Чи увімкнено кешування рекомендацій            |
| `demo.recommendation.cache_hit`          | boolean  | Чи було влучання в кеш рекомендацій            |
| `demo.product.count`                     | number   | Загальна кількість доступних товарів           |
| `demo.product.filtered.count`            | number   | Кількість товарів після фільтрації             |
| `demo.product.filtered.list`             | string[] | Список ідентифікаторів відфільтрованих товарів |

## Shipping

| Назва                      | Тип    | Опис                       |
| -------------------------- | ------ | -------------------------- |
| `demo.shipping.cost.total` | string | Загальна вартість доставки |

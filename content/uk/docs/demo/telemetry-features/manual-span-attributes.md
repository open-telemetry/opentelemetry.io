---
title: Атрибути відрізків, створених вручну
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

Ця сторінка містить перелік атрибутів відрізків, створених вручну, що використовуються в демонстрації:

## Ad

| Назва                       | Тип    | Опис                                                       |
| --------------------------- | ------ | ---------------------------------------------------------- |
| `app.ads.category`          | string | Категорія для поверненої реклами                           |
| `app.ads.contextKeys`       | string | Ключі контексту, використані для пошуку повʼязаної реклами |
| `app.ads.contextKeys.count` | number | Кількість унікальних ключів контексту                      |
| `app.ads.count`             | number | Кількість реклами, поверненої користувачу                  |
| `app.ads.ad_request_type`   | string | Або `targeted`, або `not_targeted`                         |
| `app.ads.ad_response_type`  | string | Або `targeted`, або `random`                               |

## Cart

| Назва                  | Тип    | Опис                                         |
| ---------------------- | ------ | -------------------------------------------- |
| `app.cart.items.count` | number | Кількість унікальних предметів у кошику      |
| `app.product.id`       | string | Ідентифікатор продукту для предмета у кошику |
| `app.product.quantity` | string | Кількість предметів у кошику                 |
| `app.user.id`          | string | Ідентифікатор користувача                    |

## Checkout

| Назва                        | Тип    | Опис                                        |
| ---------------------------- | ------ | ------------------------------------------- |
| `app.cart.items.count`       | number | Загальна кількість предметів у кошику       |
| `app.order.amount`           | number | Сума замовлення                             |
| `app.order.id`               | string | Ідентифікатор замовлення                    |
| `app.order.items.count`      | number | Кількість унікальних предметів у замовленні |
| `app.payment.transaction.id` | string | Ідентифікатор платіжної транзакції          |
| `app.shipping.amount`        | number | Сума доставки                               |
| `app.shipping.tracking.id`   | string | Ідентифікатор відстеження доставки          |
| `app.user.currency`          | string | Валюта користувача                          |
| `app.user.id`                | string | Ідентифікатор користувача                   |

## Currency

| Назва                          | Тип    | Опис                         |
| ------------------------------ | ------ | ---------------------------- |
| `app.currency.conversion.from` | string | Код валюти для конвертації з |
| `app.currency.conversion.to`   | string | Код валюти для конвертації в |

## Email

| Назва                 | Тип    | Опис                                          |
| --------------------- | ------ | --------------------------------------------- |
| `app.email.recipient` | string | Електронна пошта для підтвердження замовлення |
| `app.order.id`        | string | Ідентифікатор замовлення                      |

## Frontend

| Назва                    | Тип    | Опис                                            |
| ------------------------ | ------ | ----------------------------------------------- |
| `app.cart.size`          | number | Загальна кількість предметів у кошику           |
| `app.cart.items.count`   | number | Кількість унікальних предметів у кошику         |
| `app.cart.shipping.cost` | number | Вартість доставки кошика                        |
| `app.cart.total.price`   | number | Загальна вартість кошика                        |
| `app.currency`           | string | Валюта користувача                              |
| `app.currency.new`       | string | Нова валюта для встановлення                    |
| `app.order.total`        | number | Загальна вартість замовлення                    |
| `app.product.id`         | string | Ідентифікатор продукту                          |
| `app.product.quantity`   | number | Кількість продукту                              |
| `app.products.count`     | number | Загальна кількість продуктів, що відображаються |
| `app.request.id`         | string | Ідентифікатор запиту                            |
| `app.session.id`         | string | Ідентифікатор сесії                             |
| `app.user.id`            | string | Ідентифікатор користувача                       |

## Load Generator

| Назва         | Тип | Опис |
| ------------- | --- | ---- |
| Поки що немає |     |      |

## Payment

| Назва                    | Тип     | Опис                                                      |
| ------------------------ | ------- | --------------------------------------------------------- |
| `app.payment.amount`     | number  | Загальна сума платежу                                     |
| `app.payment.card_type`  | string  | Тип картки, використаної для платежу                      |
| `app.payment.card_valid` | boolean | Чи була використана картка дійсною                        |
| `app.payment.charged`    | boolean | Чи був платіж успішним (false з генератором навантаження) |

## Product Catalog

| Назва                       | Тип    | Опис                                     |
| --------------------------- | ------ | ---------------------------------------- |
| `app.product.id`            | string | Ідентифікатор продукту                   |
| `app.product.name`          | string | Назва продукту                           |
| `app.products.count`        | number | Кількість продуктів у каталозі           |
| `app.products_search.count` | number | Кількість продуктів, повернених у пошуку |

## Quote

| Назва                   | Тип    | Опис                                      |
| ----------------------- | ------ | ----------------------------------------- |
| `app.quote.items.count` | number | Загальна кількість предметів для доставки |
| `app.quote.cost.total`  | number | Загальна вартість доставки                |

## Recommendation

| Назва                            | Тип     | Опис                                           |
| -------------------------------- | ------- | ---------------------------------------------- |
| `app.filtered_products.count`    | number  | Кількість повернених відфільтрованих продуктів |
| `app.products.count`             | number  | Кількість продуктів у каталозі                 |
| `app.products_recommended.count` | number  | Кількість повернених рекомендованих продуктів  |
| `app.cache_hit`                  | boolean | Чи був доступ до кешу                          |

## Shipping

| Назва                     | Тип    | Опис                       |
| ------------------------- | ------ | -------------------------- |
| `app.shipping.cost.total` | number | Загальна вартість доставки |

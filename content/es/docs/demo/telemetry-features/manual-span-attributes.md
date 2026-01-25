---
title: Atributos de Span Manuales
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: 5b243d6b471ea2b384fa931e7ebfece074b1f2e5
---

Esta página lista los Atributos de Span manuales utilizados en la demo:

## Ad

| Nombre                      | Tipo   | Descripción                                  |
| --------------------------- | ------ | -------------------------------------------- |
| `app.ads.category`          | string | Categoría del anuncio devuelto               |
| `app.ads.contextKeys`       | string | Claves de contexto usadas para encontrar ads |
| `app.ads.contextKeys.count` | number | Cantidad de claves de contexto únicas usadas |
| `app.ads.count`             | number | Cantidad de anuncios devueltos al usuario    |
| `app.ads.ad_request_type`   | string | `targeted` o `not_targeted`                  |
| `app.ads.ad_response_type`  | string | `targeted` o `random`                        |

## Cart

| Nombre                 | Tipo   | Descripción                           |
| ---------------------- | ------ | ------------------------------------- |
| `app.cart.items.count` | number | Número de items únicos en el carrito  |
| `app.product.id`       | string | ID del producto en el carrito         |
| `app.product.quantity` | string | Cantidad del producto en el carrito   |
| `app.user.id`          | string | ID del usuario                        |

## Checkout

| Nombre                       | Tipo   | Descripción                            |
| ---------------------------- | ------ | -------------------------------------- |
| `app.cart.items.count`       | number | Número total de items en el carrito    |
| `app.order.amount`           | number | Monto del pedido                       |
| `app.order.id`               | string | ID del pedido                          |
| `app.order.items.count`      | number | Número de items únicos en el pedido    |
| `app.payment.transaction.id` | string | ID de la transacción de pago           |
| `app.shipping.amount`        | number | Monto del envío                        |
| `app.shipping.tracking.id`   | string | ID de seguimiento del envío            |
| `app.user.currency`          | string | Moneda del usuario                     |
| `app.user.id`                | string | ID del usuario                         |

## Currency

| Nombre                         | Tipo   | Descripción                      |
| ------------------------------ | ------ | -------------------------------- |
| `app.currency.conversion.from` | string | Código de moneda de origen       |
| `app.currency.conversion.to`   | string | Código de moneda de destino      |

## Email

| Nombre                | Tipo   | Descripción                               |
| --------------------- | ------ | ----------------------------------------- |
| `app.email.recipient` | string | Email usado para confirmación del pedido  |
| `app.order.id`        | string | ID del pedido                             |

## Frontend

| Nombre                   | Tipo   | Descripción                           |
| ------------------------ | ------ | ------------------------------------- |
| `app.cart.size`          | number | Número total de items en el carrito   |
| `app.cart.items.count`   | number | Cantidad de items únicos en carrito   |
| `app.cart.shipping.cost` | number | Costo de envío del carrito            |
| `app.cart.total.price`   | number | Precio total del carrito              |
| `app.currency`           | string | Moneda del usuario                    |
| `app.currency.new`       | string | Nueva moneda a establecer             |
| `app.order.total`        | number | Costo total del pedido                |
| `app.product.id`         | string | ID del producto                       |
| `app.product.quantity`   | number | Cantidad del producto                 |
| `app.products.count`     | number | Total de productos mostrados          |
| `app.request.id`         | string | ID de la petición                     |
| `app.session.id`         | string | ID de la sesión                       |
| `app.user.id`            | string | ID del usuario                        |

## Load Generator

| Nombre   | Tipo | Descripción   |
| -------- | ---- | ------------- |
| Ninguno  |      |               |

## Payment

| Nombre                   | Tipo    | Descripción                                             |
| ------------------------ | ------- | ------------------------------------------------------- |
| `app.payment.amount`     | number  | Monto total del pago                                    |
| `app.payment.card_type`  | string  | Tipo de tarjeta usada para el pago                      |
| `app.payment.card_valid` | boolean | Si la tarjeta usada era válida                          |
| `app.payment.charged`    | boolean | Si el cargo fue exitoso (false con el load generator)   |

## Product Catalog

| Nombre                      | Tipo   | Descripción                               |
| --------------------------- | ------ | ----------------------------------------- |
| `app.product.id`            | string | ID del producto                           |
| `app.product.name`          | string | Nombre del producto                       |
| `app.products.count`        | number | Número de productos en el catálogo        |
| `app.products_search.count` | number | Número de productos devueltos en búsqueda |

## Product Reviews

| Nombre                              | Tipo   | Descripción                          |
| ----------------------------------- | ------ | ------------------------------------ |
| `app.product.id`                    | string | ID del producto                      |
| `app.product_reviews.count`         | number | Número de reseñas del producto       |
| `app.product_reviews.average_score` | number | Puntuación promedio de reseñas       |
| `app.product.question`              | string | Pregunta realizada sobre un producto |

## Quote

| Nombre                  | Tipo   | Descripción                |
| ----------------------- | ------ | -------------------------- |
| `app.quote.items.count` | number | Total de items a enviar    |
| `app.quote.cost.total`  | number | Cotización total de envío  |

## Recommendation

| Nombre                           | Tipo    | Descripción                                |
| -------------------------------- | ------- | ------------------------------------------ |
| `app.filtered_products.count`    | number  | Número de productos filtrados devueltos    |
| `app.products.count`             | number  | Número de productos en el catálogo         |
| `app.products_recommended.count` | number  | Número de productos recomendados devueltos |
| `app.cache_hit`                  | boolean | Si se accedió al caché o no                |

## Shipping

| Nombre                    | Tipo   | Descripción           |
| ------------------------- | ------ | --------------------- |
| `app.shipping.cost.total` | number | Costo total de envío  |

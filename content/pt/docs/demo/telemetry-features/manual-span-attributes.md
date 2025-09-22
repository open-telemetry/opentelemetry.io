---
title: Atributos de Span Manuais
aliases: [manual_span_attributes, ../manual-span-attributes]
---

Esta página lista os Atributos de Span Manuais usados em todo o demo:

## Ad

| Nome                        | Tipo   | Descrição                           |
| --------------------------- | ------ | ------------------------------------- |
| `app.ads.category`          | string | Categoria do anúncio retornado              |
| `app.ads.contextKeys`       | string | Chaves de contexto usadas para encontrar anúncios relacionados |
| `app.ads.contextKeys.count` | number | Contagem de chaves de contexto únicas usadas     |
| `app.ads.count`             | number | Contagem de anúncios retornados ao usuário         |
| `app.ads.ad_request_type`   | string | `targeted` ou `not_targeted`   |
| `app.ads.ad_response_type`  | string | `targeted` ou `random`         |

## Cart

| Nome                   | Tipo   | Descrição                    |
| ---------------------- | ------ | ------------------------------ |
| `app.cart.items.count` | number | Número de itens únicos no carrinho |
| `app.product.id`       | string | ID do produto para item do carrinho       |
| `app.product.quantity` | string | Quantidade para item do carrinho         |
| `app.user.id`          | string | ID do usuário                        |

## Checkout

| Nome                         | Tipo   | Descrição                     |
| ---------------------------- | ------ | ------------------------------- |
| `app.cart.items.count`       | number | Número total de itens no carrinho   |
| `app.order.amount`           | number | Valor do pedido                    |
| `app.order.id`               | string | ID do pedido                        |
| `app.order.items.count`      | number | Número de itens únicos no pedido |
| `app.payment.transaction.id` | string | ID da transação de pagamento          |
| `app.shipping.amount`        | number | Valor do envio                 |
| `app.shipping.tracking.id`   | string | ID de rastreamento do envio            |
| `app.user.currency`          | string | Moeda do usuário                   |
| `app.user.id`                | string | ID do usuário                         |

## Currency

| Nome                           | Tipo   | Descrição                   |
| ------------------------------ | ------ | ----------------------------- |
| `app.currency.conversion.from` | string | Código da moeda para converter de |
| `app.currency.conversion.to`   | string | Código da moeda para converter para   |

## Email

| Nome                  | Tipo   | Descrição                       |
| --------------------- | ------ | --------------------------------- |
| `app.email.recipient` | string | Email usado para confirmação do pedido |
| `app.order.id`        | string | ID do pedido                          |

## Frontend

| Nome                     | Tipo   | Descrição                   |
| ------------------------ | ------ | ----------------------------- |
| `app.cart.size`          | number | Número total de itens no carrinho |
| `app.cart.items.count`   | number | Contagem de itens únicos no carrinho |
| `app.cart.shipping.cost` | number | Custo de envio do carrinho            |
| `app.cart.total.price`   | number | Preço total do carrinho              |
| `app.currency`           | string | Moeda do usuário                 |
| `app.currency.new`       | string | Nova moeda para definir           |
| `app.order.total`        | number | Custo total do pedido              |
| `app.product.id`         | string | ID do produto                    |
| `app.product.quantity`   | number | Quantidade do produto              |
| `app.products.count`     | number | Total de produtos exibidos      |
| `app.request.id`         | string | ID da requisição                    |
| `app.session.id`         | string | ID da sessão                    |
| `app.user.id`            | string | ID do usuário                       |

## Load Generator

| Nome     | Tipo | Descrição |
| -------- | ---- | ----------- |
| Nenhum ainda |      |             |

## Payment

| Nome                     | Tipo    | Descrição                                           |
| ------------------------ | ------- | ----------------------------------------------------- |
| `app.payment.amount`     | number  | Valor total do pagamento                                  |
| `app.payment.card_type`  | string  | Tipo de cartão usado para pagamento                         |
| `app.payment.card_valid` | boolean | O cartão usado era válido                               |
| `app.payment.charged`    | boolean | A cobrança foi bem-sucedida (falso com gerador de carga) |

## Product Catalog

| Nome                        | Tipo   | Descrição                           |
| --------------------------- | ------ | ------------------------------------- |
| `app.product.id`            | string | ID do produto                            |
| `app.product.name`          | string | Nome do produto                          |
| `app.products.count`        | number | Número de produtos no catálogo         |
| `app.products_search.count` | number | Número de produtos retornados na pesquisa |

## Quote

| Nome                    | Tipo   | Descrição          |
| ----------------------- | ------ | -------------------- |
| `app.quote.items.count` | number | Total de itens para enviar  |
| `app.quote.cost.total`  | number | Cotação total de envio |

## Recommendation

| Nome                             | Tipo    | Descrição                             |
| -------------------------------- | ------- | --------------------------------------- |
| `app.filtered_products.count`    | number  | Número de produtos filtrados retornados    |
| `app.products.count`             | number  | Número de produtos no catálogo           |
| `app.products_recommended.count` | number  | Número de produtos recomendados retornados |
| `app.cache_hit`                  | boolean | Se o cache foi acessado ou não            |

## Shipping

| Nome                      | Tipo   | Descrição         |
| ------------------------- | ------ | ------------------- |
| `app.shipping.cost.total` | number | Custo total de envio |

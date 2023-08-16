---
title: Service Roles
aliases: [/docs/demo/service_table]
cSpell:ignore: loadgenerator
---

View [Service Graph](../architecture/) to visualize request flows.

| Service                                               | Language      | Description                                                                                                                                  |
| ----------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [accountingservice](../services/accounting/)          | Go            | Processes incoming orders and count the sum of all orders (mock/).                                                                           |
| [adservice](../services/ad/)                          | Java          | Provides text ads based on given context words.                                                                                              |
| [cartservice](../services/cart/)                      | .NET          | Stores the items in the user's shopping cart in Redis and retrieves it.                                                                      |
| [checkoutservice](../services/checkout/)              | Go            | Retrieves user cart, prepares order and orchestrates the payment, shipping and the email notification.                                       |
| [currencyservice](../services/currency/)              | C++           | Converts one money amount to another currency. Uses real values fetched from European Central Bank. It's the highest QPS service.            |
| [emailservice](../services/email/)                    | Ruby          | Sends users an order confirmation email (mock/).                                                                                             |
| [frauddetectionservice](../services/fraud-detection/) | Kotlin        | Analyzes incoming orders and detects fraud attempts (mock/).                                                                                 |
| [featureflagservice](../services/feature-flag/)       | Erlang/Elixir | CRUD feature flag service to demonstrate various scenarios like fault injection & how to emit telemetry from a feature flag reliant service. |
| [frontend](../services/frontend/)                     | JavaScript    | Exposes an HTTP server to serve the website. Does not require sign up / login and generates session IDs for all users automatically.         |
| [loadgenerator](../services/load-generator/)          | Python/Locust | Continuously sends requests imitating realistic user shopping flows to the frontend.                                                         |
| [paymentservice](../services/payment/)                | JavaScript    | Charges the given credit card info (mock/) with the given amount and returns a transaction ID.                                               |
| [productcatalogservice](../services/product-catalog/) | Go            | Provides the list of products from a JSON file and ability to search products and get individual products.                                   |
| [quoteservice](../services/quote/)                    | PHP           | Calculates the shipping costs, based on the number of items to be shipped.                                                                   |
| [recommendationservice](../services/recommendation/)  | Python        | Recommends other products based on what's given in the cart.                                                                                 |
| [shippingservice](../services/shipping/)              | Rust          | Gives shipping cost estimates based on the shopping cart. Ships items to the given address (mock/).                                          |

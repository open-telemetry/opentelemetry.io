---
title: Service Roles
---

View [Service Graph]({{% relref "./current_architecture.md" %}}) to visualize request flows.

| Service                                                      | Language      | Description                                                                                                                                  |
|--------------------------------------------------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| [accountingservice]({{% relref "./services/accountingservice.md" %}})         | Go            | Processes incoming orders and count the sum of all orders (mock).                                                                            |
| [adservice]({{% relref "./services/adservice.md" %}})                         | Java          | Provides text ads based on given context words.                                                                                              |
| [cartservice]({{% relref "./services/cartservice.md" %}})                     | DotNet        | Stores the items in the user's shopping cart in Redis and retrieves it.                                                                      |
| [checkoutservice]({{% relref "./services/checkoutservice.md" %}})             | Go            | Retrieves user cart, prepares order and orchestrates the payment, shipping and the email notification.                                       |
| [currencyservice]({{% relref "./services/currencyservice.md" %}})             | C++           | Converts one money amount to another currency. Uses real values fetched from European Central Bank. It's the highest QPS service.            |
| [emailservice]({{% relref "./services/emailservice.md" %}})                   | Ruby          | Sends users an order confirmation email (mock).                                                                                              |
| [frauddetectionservice]({{% relref "./services/frauddetectionservice.md" %}}) | Kotlin        | Analyzes incoming orders and detects fraud attempts (mock).                                                                                  |
| [featureflagservice]({{% relref "./services/featureflagservice.md" %}})       | Erlang/Elixir | CRUD feature flag service to demonstrate various scenarios like fault injection & how to emit telemetry from a feature flag reliant service. |
| [frontend]({{% relref "./services/frontend.md" %}})                           | JavaScript    | Exposes an HTTP server to serve the website. Does not require signup/login and generates session IDs for all users automatically.            |
| [loadgenerator]({{% relref "./services/loadgenerator.md" %}})                 | Python/Locust | Continuously sends requests imitating realistic user shopping flows to the frontend.                                                         |
| [paymentservice]({{% relref "./services/paymentservice.md" %}})               | JavaScript    | Charges the given credit card info (mock) with the given amount and returns a transaction ID.                                                |
| [productcatalogservice]({{% relref "./services/productcatalogservice.md" %}}) | Go            | Provides the list of products from a JSON file and ability to search products and get individual products.                                   |
| [quoteservice]({{% relref "./services/quoteservice.md" %}})                   | PHP           | Calculates the shipping costs, based on the number of items to be shipped.                                                                   |
| [recommendationservice]({{% relref "./services/recommendationservice.md" %}}) | Python        | Recommends other products based on what's given in the cart.                                                                                 |
| [shippingservice]({{% relref "./services/shippingservice.md" %}})             | Rust          | Gives shipping cost estimates based on the shopping cart. Ships items to the given address (mock).                                           |

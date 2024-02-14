---
title: Services
aliases: [service_table, service-table]
cSpell:ignore: loadgenerator
---

To visualize request flows, see the [Service Diagram](../architecture/).

| Service                                   | Language      | Description                                                                                                                                  |
| ----------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [accountingservice](accounting/)          | Go            | Processes incoming orders and count the sum of all orders (mock/).                                                                           |
| [adservice](ad/)                          | Java          | Provides text ads based on given context words.                                                                                              |
| [cartservice](cart/)                      | .NET          | Stores the items in the user's shopping cart in Redis and retrieves it.                                                                      |
| [checkoutservice](checkout/)              | Go            | Retrieves user cart, prepares order and orchestrates the payment, shipping and the email notification.                                       |
| [currencyservice](currency/)              | C++           | Converts one money amount to another currency. Uses real values fetched from European Central Bank. It's the highest QPS service.            |
| [emailservice](email/)                    | Ruby          | Sends users an order confirmation email (mock/).                                                                                             |
| [frauddetectionservice](fraud-detection/) | Kotlin        | Analyzes incoming orders and detects fraud attempts (mock/).                                                                                 |
| [featureflagservice](feature-flag/)       | Erlang/Elixir | CRUD feature flag service to demonstrate various scenarios like fault injection & how to emit telemetry from a feature flag reliant service. |
| [frontend](frontend/)                     | JavaScript    | Exposes an HTTP server to serve the website. Does not require sign up / login and generates session IDs for all users automatically.         |
| [loadgenerator](load-generator/)          | Python/Locust | Continuously sends requests imitating realistic user shopping flows to the frontend.                                                         |
| [paymentservice](payment/)                | JavaScript    | Charges the given credit card info (mock/) with the given amount and returns a transaction ID.                                               |
| [productcatalogservice](product-catalog/) | Go            | Provides the list of products from a JSON file and ability to search products and get individual products.                                   |
| [quoteservice](quote/)                    | PHP           | Calculates the shipping costs, based on the number of items to be shipped.                                                                   |
| [recommendationservice](recommendation/)  | Python        | Recommends other products based on what's given in the cart.                                                                                 |
| [shippingservice](shipping/)              | Rust          | Gives shipping cost estimates based on the shopping cart. Ships items to the given address (mock/).                                          |

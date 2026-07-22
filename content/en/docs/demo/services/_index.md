---
title: Services
aliases: [service_table, service-table]
cSpell:ignore: Gradio LangGraph mcp MkDocs
---

To visualize request flows, see the [Service Diagram](../architecture/).

| Service                               | Language      | Description                                                                                                                          |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [accounting](accounting/)             | .NET          | Processes incoming orders and count the sum of all orders (mock/).                                                                   |
| [ad](ad/)                             | Java          | Provides text ads based on given context words.                                                                                      |
| [agent](agent/)                       | Python        | AI assistant that answers shop questions and performs actions using a LangGraph agent with built-in or MCP tools.                    |
| [cart](cart/)                         | .NET          | Stores the items in the user's shopping cart in Valkey and retrieves it.                                                             |
| [chatbot](chatbot/)                   | Python        | Browser-based chat UI (Gradio) that forwards user messages to the agent service.                                                     |
| [checkout](checkout/)                 | Go            | Retrieves user cart, prepares order and orchestrates the payment, shipping and the email notification.                               |
| [currency](currency/)                 | C++           | Converts one money amount to another currency. Uses real values fetched from European Central Bank. It's the highest QPS service.    |
| [email](email/)                       | Ruby          | Sends users an order confirmation email (mock/).                                                                                     |
| [flagd-ui](flagd-ui/)                 | Elixir        | Allows toggling and editing of feature flags.                                                                                        |
| [fraud-detection](fraud-detection/)   | Kotlin        | Analyzes incoming orders and detects fraud attempts (mock/).                                                                         |
| [frontend](frontend/)                 | TypeScript    | Exposes an HTTP server to serve the website. Does not require sign up / login and generates session IDs for all users automatically. |
| [load-generator](load-generator/)     | Python/Locust | Continuously sends requests imitating realistic user shopping flows to the frontend.                                                 |
| [mcp](mcp/)                           | Python        | Exposes the shop's operations as tools over the Model Context Protocol for the agent service.                                        |
| [opamp-server](opamp-server/)         | Go            | Reference OpAMP server that acts as a control plane for the OpenTelemetry Collector.                                                 |
| [payment](payment/)                   | JavaScript    | Charges the given credit card info (mock/) with the given amount and returns a transaction ID.                                       |
| [product-catalog](product-catalog/)   | Go            | Provides the list of products from a JSON file and ability to search products and get individual products.                           |
| [product-reviews](product-reviews/)   | Python        | Returns product reviews and answers questions about a specific product based on the product description and reviews.                 |
| [quote](quote/)                       | PHP           | Calculates the shipping costs, based on the number of items to be shipped.                                                           |
| [recommendation](recommendation/)     | Python        | Recommends other products based on what's given in the cart.                                                                         |
| [shipping](shipping/)                 | Rust          | Gives shipping cost estimates based on the shopping cart. Ships items to the given address (mock/).                                  |
| [telemetry-docs](telemetry-docs/)     | NGINX         | Generates and hosts documentation of the demo's telemetry schema (Weaver + MkDocs).                                                  |
| [react-native-app](react-native-app/) | TypeScript    | React Native mobile application that provides a UI on top of the shopping services.                                                  |

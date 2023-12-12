---
title: Trace Feature Coverage by Service
linkTitle: Trace Feature Coverage
aliases: [trace_service_features]
---

| Service            | Language        | Instrumentation Libraries | Manual Span Creation | Span Data Enrichment | RPC Context Propagation | Span Links | Baggage | Resource Detection |
| ------------------ | --------------- | ------------------------- | -------------------- | -------------------- | ----------------------- | ---------- | ------- | ------------------ |
| Accounting Service | Go              | 🚧                        | 🚧                   | 🚧                   | 🚧                      | 🚧         | 🚧      | ✅                 |
| Ad                 | Java            | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Cart               | .NET            | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | ✅                 |
| Checkout           | Go              | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | ✅                 |
| Currency           | C++             | 🔕                        | ✅                   | ✅                   | ✅                      | 🔕         | 🔕      | 🚧                 |
| Email              | Ruby            | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Feature Flag       | Erlang / Elixir | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Fraud Detection    | Kotlin          | ✅                        | 🚧                   | 🚧                   | 🚧                      | 🚧         | 🚧      | 🚧                 |
| Frontend           | JavaScript      | ✅                        | ✅                   | ✅                   | 🔕                      | ✅         | ✅      | ✅                 |
| Payment            | JavaScript      | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | ✅      | ✅                 |
| Product Catalog    | Go              | ✅                        | 🔕                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Quote Service      | PHP             | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Recommendation     | Python          | ✅                        | ✅                   | ✅                   | 🔕                      | 🔕         | 🔕      | 🚧                 |
| Shipping           | Rust            | 🔕                        | ✅                   | ✅                   | ✅                      | 🔕         | 🔕      | 🚧                 |

Emoji Legend:

- Completed: ✅
- Not Applicable: 🔕
- Not Present (Yet): 🚧

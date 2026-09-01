---
title: Cobertura de trazas por servicio
linkTitle: Cobertura de trazas
aliases: [trace_service_features, trace-features, ../trace-features]
default_lang_commit: 5b243d6b471ea2b384fa931e7ebfece074b1f2e5
drifted_from_default: true
---

| Servicio        | Lenguaje   | Bibliotecas de Instrumentación | Creación Manual de Spans | Enriquecimiento de Span | Propagación de Contexto RPC | Span Links | Baggage | Detección de Recursos |
| --------------- | ---------- | ------------------------------ | ------------------------ | ----------------------- | --------------------------- | ---------- | ------- | --------------------- |
| Accounting      | .NET       | ✅                             | 🚧                       | 🚧                      | 🚧                          | 🚧         | 🚧      | ✅                    |
| Ad              | Java       | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Cart            | .NET       | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | ✅                    |
| Checkout        | Go         | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | ✅                    |
| Currency        | C++        | 🔕                             | ✅                       | ✅                      | ✅                          | 🔕         | 🔕      | 🚧                    |
| Email           | Ruby       | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Flagd-ui        | TypeScript | ✅                             | 🚧                       | 🚧                      | 🚧                          | 🚧         | 🚧      | 🚧                    |
| Fraud Detection | Kotlin     | ✅                             | 🚧                       | 🚧                      | 🚧                          | ✅         | 🚧      | 🚧                    |
| Frontend        | TypeScript | ✅                             | ✅                       | ✅                      | 🔕                          | ✅         | ✅      | ✅                    |
| Load Generator  | Python     | ✅                             | 🚧                       | 🚧                      | 🚧                          | 🚧         | 🚧      | 🚧                    |
| Payment         | JavaScript | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | ✅      | ✅                    |
| Product Catalog | Go         | ✅                             | 🔕                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Product Reviews | Python     | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Quote Service   | PHP        | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Recommendation  | Python     | ✅                             | ✅                       | ✅                      | 🔕                          | 🔕         | 🔕      | 🚧                    |
| Shipping        | Rust       | ✅                             | ✅                       | ✅                      | ✅                          | 🔕         | 🔕      | ✅                    |

Leyenda de emojis:

- Completado: ✅
- No Aplica: 🔕
- Pendiente: 🚧

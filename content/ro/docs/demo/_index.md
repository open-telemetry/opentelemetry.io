---
title: Documentație Demo OpenTelemetry
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: 246dda29574fe21ebe0522792b96dd972eb43627
---

Bine ai venit la documentația [Demo OpenTelemetry](/ecosystem/demo/), care
acoperă cum să instalezi și să rulezi demo-ul, precum și câteva scenarii pe care
le poți folosi pentru a vedea OpenTelemetry în acțiune.

## Rularea Demo-ului

Vrei să deployezi demo-ul și să-l vezi în acțiune? Începe aici.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referință Funcționalități pe Limbaj

Vrei să înțelegi cum funcționează instrumentarea unei anumite limbi? Începe
aici.

| Limbaj    | Instrumentare Automată                                                                                                                                     | Librării de Instrumentare                                                                       | Instrumentare Manuală                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| .NET       | [Serviciul Accounting](services/accounting/)                                                                                                               | [Serviciul Cart](services/cart/)                                                                | [Serviciul Cart](services/cart/)                                                                |
| C++        |                                                                                                                                                            |                                                                                                 | [Serviciul Currency](services/currency/)                                                        |
| Elixir     |                                                                                                                                                            | [Serviciul Flagd-UI](services/flagd-ui/)                                                        |                                                                                                 |
| Go         |                                                                                                                                                            | [Serviciul Checkout](services/checkout/), [Serviciul Product Catalog](services/product-catalog/) | [Serviciul Checkout](services/checkout/), [Serviciul Product Catalog](services/product-catalog/) |
| Java       | [Serviciul Ad](services/ad/)                                                                                                                               |                                                                                                 | [Serviciul Ad](services/ad/)                                                                    |
| JavaScript | [Serviciul Payment](services/payment/)                                                                                                                     |                                                                                                 | [Serviciul Payment](services/payment/)                                                          |
| TypeScript |                                                                                                                                                            | [Frontend](services/frontend/), [Aplicația React Native](services/react-native-app/)            | [Frontend](services/frontend/)                                                                  |
| Kotlin     |                                                                                                                                                            | [Serviciul Fraud Detection](services/fraud-detection/)                                          |                                                                                                 |
| PHP        |                                                                                                                                                            | [Serviciul Quote](services/quote/)                                                              | [Serviciul Quote](services/quote/)                                                              |
| Python     | [Serviciul Recommendation](services/recommendation/), [Serviciul Agent](services/agent/), [Serviciul Chatbot](services/chatbot/), [Serviciul MCP](services/mcp/) |                                                                                                 | [Serviciul Recommendation](services/recommendation/)                                            |
| Ruby       |                                                                                                                                                            | [Serviciul Email](services/email/)                                                              | [Serviciul Email](services/email/)                                                              |
| Rust       |                                                                                                                                                            | [Serviciul Shipping](services/shipping/)                                                        | [Serviciul Shipping](services/shipping/)                                                        |

## Documentație Servicii

Informații specifice despre cum este deployat OpenTelemetry în fiecare serviciu
pot fi găsite aici:

- [Serviciul Accounting](services/accounting/)
- [Serviciul Ad](services/ad/)
- [Serviciul Agent](services/agent/)
- [Serviciul Cart](services/cart/)
- [Serviciul Chatbot](services/chatbot/)
- [Serviciul Checkout](services/checkout/)
- [Serviciul Email](services/email/)
- [Frontend](services/frontend/)
- [Generatorul de Load](services/load-generator/)
- [Serviciul MCP](services/mcp/)
- [Serviciul Payment](services/payment/)
- [Serviciul Product Catalog](services/product-catalog/)
- [Serviciul Quote](services/quote/)
- [Serviciul Recommendation](services/recommendation/)
- [Serviciul Shipping](services/shipping/)
- [Serviciul Image Provider](services/image-provider/)
- [Aplicația React Native](services/react-native-app/)

## Scenarii cu Feature Flags

Cum poți rezolva probleme cu OpenTelemetry? Aceste
[scenarii activate prin feature flags](feature-flags/) te ghidează prin câteva
probleme pre-configurate și îți arată cum să interpretezi datele OpenTelemetry
pentru a le rezolva.

## Referință

Documentația de referință a proiectului, precum cerințele și matricele de
funcționalități.

- [Arhitectură](architecture/)
- [Dezvoltare](development/)
- [Referință Feature Flags](feature-flags/)
- [Matrice Acoperire Metrici](telemetry-features/metric-coverage/)
- [Cerințe](./requirements/)
- [Capturi de Ecran](screenshots/)
- [Servicii](services/)
- [Referință Atribute Span](telemetry-features/manual-span-attributes/)
- [Teste](tests/)
- [Matrice Acoperire Trace](telemetry-features/trace-coverage/)

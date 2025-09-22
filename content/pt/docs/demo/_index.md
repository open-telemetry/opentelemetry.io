---
title: Documentação do Demo do OpenTelemetry
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
---

Bem-vindo à documentação do [Demo do OpenTelemetry](/ecosystem/demo/), que
cobre como instalar e executar o demo, além de alguns cenários para ver o
OpenTelemetry em ação.

## Executando o Demo

Quer implantar o demo e vê-lo em ação? Comece aqui.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referência de Recursos por Linguagem

Quer entender como funciona a instrumentação de uma linguagem específica?
Comece aqui.

| Linguagem   | Instrumentação Automática                           | Bibliotecas de Instrumentação                                                                   | Instrumentação Manual                                                                          |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| .NET        | [Serviço de Contabilidade](services/accounting/)     | [Serviço de Carrinho](services/cart/)                                                            | [Serviço de Carrinho](services/cart/)                                                            |
| C++         |                                                      |                                                                                                  | [Serviço de Moeda](services/currency/)                                                           |
| Go          |                                                      | [Serviço de Checkout](services/checkout/), [Catálogo de Produtos](services/product-catalog/)     | [Serviço de Checkout](services/checkout/), [Catálogo de Produtos](services/product-catalog/)     |
| Java        | [Serviço de Anúncios](services/ad/)                  |                                                                                                  | [Serviço de Anúncios](services/ad/)                                                              |
| JavaScript  |                                                      |                                                                                                  | [Serviço de Pagamento](services/payment/)                                                        |
| TypeScript  |                                                      | [Frontend](services/frontend/), [App React Native](services/react-native-app/)                   | [Frontend](services/frontend/)                                                                   |
| Kotlin      |                                                      | [Serviço de Detecção de Fraudes](services/fraud-detection/)                                      |                                                                                                  |
| PHP         |                                                      | [Serviço de Cotações](services/quote/)                                                           | [Serviço de Cotações](services/quote/)                                                           |
| Python      | [Serviço de Recomendações](services/recommendation/) |                                                                                                  | [Serviço de Recomendações](services/recommendation/)                                            |
| Ruby        |                                                      | [Serviço de E-mail](services/email/)                                                             | [Serviço de E-mail](services/email/)                                                             |
| Rust        |                                                      | [Serviço de Entrega](services/shipping/)                                                         | [Serviço de Entrega](services/shipping/)                                                         |

## Documentação dos Serviços

Informações específicas sobre como o OpenTelemetry é implantado em cada
serviço:

- [Serviço de Contabilidade](services/accounting/)
- [Serviço de Anúncios](services/ad/)
- [Serviço de Carrinho](services/cart/)
- [Serviço de Checkout](services/checkout/)
- [Serviço de E-mail](services/email/)
- [Frontend](services/frontend/)
- [Gerador de Carga](services/load-generator/)
- [Serviço de Pagamento](services/payment/)
- [Catálogo de Produtos](services/product-catalog/)
- [Serviço de Cotações](services/quote/)
- [Serviço de Recomendações](services/recommendation/)
- [Serviço de Entrega](services/shipping/)
- [Provedor de Imagens](services/image-provider/)
- [App React Native](services/react-native-app/)

## Cenários com Feature Flags

Como resolver problemas com OpenTelemetry? Estes
[cenários com feature flags](feature-flags/) apresentam problemas pré-configurados
e mostram como interpretar os dados do OpenTelemetry para resolvê-los.

## Referência

Documentação de referência do projeto, como requisitos e matrizes de recursos.

- [Arquitetura](architecture/)
- [Desenvolvimento](development/)
- [Referência de Feature Flags](feature-flags/)
- [Matriz de Recursos de Métricas](telemetry-features/metric-coverage/)
- [Requisitos](./requirements/)
- [Capturas de Tela](screenshots/)
- [Serviços](services/)
- [Referência de Atributos de Span](telemetry-features/manual-span-attributes/)
- [Testes](tests/)
- [Matriz de Recursos de Rastros](telemetry-features/trace-coverage/)

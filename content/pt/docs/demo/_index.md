---
title: Documentação do OpenTelemetry Demo
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
---

Bem-vindo à documentação do [OpenTelemetry Demo](/ecosystem/demo/), que aborda
como instalar e executar o OpenTelemetry Demo, além de alguns cenários que você
pode usar para ver o OpenTelemetry em ação.

## Executando o Demo {#running-the-demo}

Quer implantar o OpenTelemetry Demo e vê-lo em ação? Comece por aqui.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referência de recursos por linguagem {#language-feature-reference}

Quer entender como funciona a instrumentação de uma linguagem específica? Comece
por aqui.

| Linguagem  | Instrumentação automática                                                                                                                                | Bibliotecas de instrumentação                                                                | Instrumentação manual                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| .NET       | [Serviço Accounting](services/accounting/)                                                                                                               | [Serviço Cart](services/cart/)                                                               | [Serviço Cart](services/cart/)                                                               |
| C++        |                                                                                                                                                          |                                                                                              | [Serviço Currency](services/currency/)                                                       |
| Elixir     |                                                                                                                                                          | [Serviço Flagd-UI](services/flagd-ui/)                                                       |                                                                                              |
| Go         |                                                                                                                                                          | [Serviço Checkout](services/checkout/), [Serviço Product Catalog](services/product-catalog/) | [Serviço Checkout](services/checkout/), [Serviço Product Catalog](services/product-catalog/) |
| Java       | [Serviço Ad](services/ad/)                                                                                                                               |                                                                                              | [Serviço Ad](services/ad/)                                                                   |
| JavaScript | [Serviço Payment](services/payment/)                                                                                                                     |                                                                                              | [Serviço Payment](services/payment/)                                                         |
| TypeScript |                                                                                                                                                          | [Frontend](services/frontend/), [Aplicativo React Native](services/react-native-app/)        | [Frontend](services/frontend/)                                                               |
| Kotlin     |                                                                                                                                                          | [Serviço Fraud Detection](services/fraud-detection/)                                         |                                                                                              |
| PHP        |                                                                                                                                                          | [Serviço Quote](services/quote/)                                                             | [Serviço Quote](services/quote/)                                                             |
| Python     | [Serviço Recommendation](services/recommendation/), [Serviço Agent](services/agent/), [Serviço Chatbot](services/chatbot/), [Serviço MCP](services/mcp/) |                                                                                              | [Serviço Recommendation](services/recommendation/)                                           |
| Ruby       |                                                                                                                                                          | [Serviço Email](services/email/)                                                             | [Serviço Email](services/email/)                                                             |
| Rust       |                                                                                                                                                          | [Serviço Shipping](services/shipping/)                                                       | [Serviço Shipping](services/shipping/)                                                       |

## Documentação dos serviços {#service-documentation}

Informações específicas sobre como o OpenTelemetry é implantado em cada serviço
podem ser encontradas aqui:

- [Serviço Accounting](services/accounting/)
- [Serviço Ad](services/ad/)
- [Serviço Agent](services/agent/)
- [Serviço Cart](services/cart/)
- [Serviço Chatbot](services/chatbot/)
- [Serviço Checkout](services/checkout/)
- [Serviço Email](services/email/)
- [Frontend](services/frontend/)
- [Gerador de carga](services/load-generator/)
- [Serviço MCP](services/mcp/)
- [Serviço Payment](services/payment/)
- [Serviço Product Catalog](services/product-catalog/)
- [Serviço Quote](services/quote/)
- [Serviço Recommendation](services/recommendation/)
- [Serviço Shipping](services/shipping/)
- [Serviço Image Provider](services/image-provider/)
- [Aplicativo React Native](services/react-native-app/)

## Cenários com feature flags {#feature-flag-scenarios}

Como você pode resolver problemas com o OpenTelemetry? Estes
[cenários habilitados por feature flags](feature-flags/) guiam você por alguns
problemas pré-configurados e mostram como interpretar os dados do OpenTelemetry
para resolvê-los.

## Referência {#reference}

Documentação de referência do projeto, como requisitos e matrizes de recursos.

- [Arquitetura](architecture/)
- [Desenvolvimento](development/)
- [Referência de feature flags](feature-flags/)
- [Matriz de recursos de métricas](telemetry-features/metric-coverage/)
- [Requisitos](./requirements/)
- [Capturas de tela](screenshots/)
- [Serviços](services/)
- [Referência de atributos de trechos](telemetry-features/manual-span-attributes/)
- [Testes](tests/)
- [Matriz de recursos de rastros](telemetry-features/trace-coverage/)

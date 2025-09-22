---
title: Feature Flags
aliases:
  - feature_flags
  - scenarios
  - services/feature-flag
  - services/featureflagservice
cSpell:ignore: OLJCESPC7Z
---

O demo fornece várias feature flags que você pode usar para simular diferentes
cenários. Essas flags são gerenciadas pelo [`flagd`](https://flagd.dev), um
serviço de feature flags simples que oferece suporte ao
[OpenFeature](https://openfeature.dev).

Os valores das flags podem ser alterados por meio da interface disponível em
<http://localhost:8080/feature> ao executar o demo. Alterar os valores por essa
interface será refletido no serviço flagd.

Há duas opções para alterar as feature flags pela interface:

- **Visão Básica**: Uma visão amigável em que variantes padrão (as mesmas opções
  que precisam ser alteradas ao configurar pelo arquivo bruto) podem ser
  selecionadas e salvas para cada feature flag. Atualmente, a visão básica não
  suporta direcionamento fracionário.

- **Visão Avançada**: Uma visão em que o arquivo JSON bruto de configuração é
  carregado e pode ser editado no navegador. Essa visão oferece a flexibilidade
  de editar um arquivo JSON bruto e também valida o esquema para garantir que o
  JSON seja válido e que os valores fornecidos estejam corretos.

## Feature flags implementadas

| Feature Flag                        | Serviço(s)        | Descrição                                                                                                 |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad                | Gera um erro em `GetAds` em 1/10 das vezes                                                                |
| `adServiceManualGc`                 | Ad                | Dispara coletas de lixo manuais completas no serviço de anúncios                                          |
| `adServiceHighCpu`                  | Ad                | Gera alta carga de CPU no serviço de anúncios. Para demonstrar throttling de CPU, defina limites de CPU   |
| `cartServiceFailure`                | Cart              | Gera um erro sempre que `EmptyCart` é chamado                                                             |
| `emailMemoryLeak`                   | Email             | Simula um vazamento de memória no serviço `email`.                                                         |
| `productCatalogFailure`             | Catálogo de Prod. | Gera um erro para requisições `GetProduct` com o ID: `OLJCESPC7Z`                                         |
| `recommendationServiceCacheFailure` | Recommendation    | Cria um vazamento de memória devido a um cache que cresce exponencialmente. 1.4x de crescimento, 50% das requisições |
| `paymentServiceFailure`             | Payment           | Gera um erro ao chamar o método `charge`.                                                                  |
| `paymentServiceUnreachable`         | Checkout          | Usa um endereço inválido ao chamar o PaymentService, simulando indisponibilidade.                          |
| `loadgeneratorFloodHomepage`        | Load Generator    | Inunda a home com muitas requisições; configurável alterando o JSON do flagd.                              |
| `kafkaQueueProblems`                | Kafka             | Sobrecarrega a fila do Kafka e introduz atraso no consumidor causando pico de lag.                         |
| `imageSlowLoad`                     | Frontend          | Utiliza injeção de falhas do Envoy, produzindo atraso no carregamento de imagens.                          |

## Cenário guiado de depuração

O cenário `recommendationServiceCacheFailure` tem um
[guia dedicado](recommendation-cache/) para ajudar a entender como depurar
vazamentos de memória com OpenTelemetry.

## Arquitetura de Feature Flags

Consulte a [documentação do flagd](https://flagd.dev) para mais informações
sobre como o flagd funciona e o site do [OpenFeature](https://openfeature.dev)
para documentação e informações sobre a API do OpenFeature.

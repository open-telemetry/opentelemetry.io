---
title: O que é o OpenTelemetry?
description: Uma breve explicação sobre o que o OpenTelemetry é e não é.
weight: 150
default_lang_commit: f37118d8489a60d73dd881645f317d866b53b418
---

O OpenTelemetry é:

- Um _framework_ de
  [Observabilidade](/docs/concepts/observability-primer/#what-is-observability)
  e um conjunto de ferramentas projetadas para criar e gerenciar dados de
  telemetria como [rastros](/docs/concepts/signals/traces/),
  [métricas](/docs/concepts/signals/metrics/) e
  [logs](/docs/concepts/signals/logs/).
- Agnóstico em relação a fornecedores e ferramentas, o que possibilita ser
  utilizado com uma grande variedade de _backends_ de observabilidade, incluindo
  ferramentas de código aberto como [Jaeger](https://www.jaegertracing.io/) e
  [Prometheus](https://prometheus.io/), além de soluções comerciais.
- Não é um _backend_ de observabilidade como Jaeger, Prometheus ou outras
  soluções comerciais.
- É focado na geração, coleta, gerenciamento e exportação de telemetria. Um dos
  principais objetivos do OpenTelemetry é permitir que você possa instrumentar
  suas aplicações ou sistemas de forma fácil, independentemente da linguagem,
  infraestrutura ou ambiente de execução. O armazenamento e a visualização da
  telemetria são intencionalmente deixados para outras ferramentas.

## O que é observabilidade?

[Observabilidade](/docs/concepts/observability-primer/#what-is-observability) é
a capacidade de entender o estado interno de um sistema ao examinar os dados que
ele emite. No contexto de software, isso significa ser capaz de entender o
estado interno do sistema analisando seus dados de telemetria, que incluem
rastros, métricas e logs.

Para tornar um sistema observável, ele deve ser
[instrumentado](/docs/concepts/instrumentation). Ou seja, o código deve emitir
[rastros](/docs/concepts/signals/traces/),
[métricas](/docs/concepts/signals/metrics/) ou
[logs](/docs/concepts/signals/logs/). Os dados instrumentados devem então ser
enviados para um backend de observabilidade.

## Por que OpenTelemetry?

Com a ascensão da computação em nuvem, arquiteturas de microsserviços e
requisitos de negócios cada vez mais complexos, a necessidade de
[observabilidade](/docs/concepts/observability-primer/#what-is-observability) de
software e infraestrutura é cada vez maior.

O OpenTelemetry atende à necessidade de observabilidade seguindo dois
princípios-chave:

1. Você tem controle total sobre os dados que gera. Não há dependência de
   fornecedor (_vendor lock-in_).
2. Você só precisa aprender um único conjunto de APIs e convenções.

Ambos os princípios combinados dão a flexibilidade que equipes e organizações
precisam no mundo da computação moderna atual.

Se você quiser saber mais, dê uma olhada na
[missão, visão e valores](/community/mission/) do OpenTelemetry.

## Os principais componentes do OpenTelemetry

O OpenTelemetry consiste dos seguintes componentes:

- Uma [especificação](/docs/specs/otel) para todos os componentes
- Um [protocolo](/docs/specs/otlp/) padrão que define o formato dos dados de
  telemetria
- [Convenções semânticas](/docs/specs/semconv/) que estabelecem um padrão de
  nomenclatura para tipos comuns de dados de telemetria
- APIs que definem como gerar dados de telemetria
- [SDKs para linguagens de programação](/docs/languages) que implementam a
  especificação, APIs e exportação de dados de telemetria
- Um [ecossistema de bibliotecas](/ecosystem/registry) que implementa
  instrumentação para bibliotecas e frameworks comuns
- Componentes para instrumentação automática que geram dados de telemetria sem
  exigir alterações no código
- O [OpenTelemetry Collector](/docs/collector), um _proxy_ intermediário que
  recebe, processa e exporta dados de telemetria
- Várias outras ferramentas, como o
  [OpenTelemetry Operator para Kubernetes](/docs/kubernetes/operator/),
  [OpenTelemetry Helm Charts](/docs/kubernetes/helm/), e
  [recursos da comunidade para FaaS](/docs/faas/)

O OpenTelemetry é utilizado por diversas
[bibliotecas, serviços e aplicativos](/ecosystem/integrations/) que o integram
para fornecer observabilidade por padrão.

O OpenTelemetry é suportado por inúmeros [fornecedores](/ecosystem/vendors/),
muitos dos quais oferecem suporte comercial para o OpenTelemetry e contribuem
diretamente para o projeto.

## Extensibilidade

O OpenTelemetry é projetado para ser extensível. Alguns exemplos de como ele
pode ser estendido incluem:

- Adicionar um _receiver_ ao OpenTelemetry Collector para suportar dados de
  telemetria de uma fonte personalizada
- Carregar bibliotecas de instrumentação personalizadas em um SDK
- Criar uma [distribuição](/docs/concepts/distributions/) de um SDK ou do
  Collector adaptada a um caso de uso específico
- Criar um novo _exporter_ para um _backend_ personalizado que ainda não suporta
  o protocolo do OpenTelemetry (OTLP)
- Criar um propagador personalizado para formatos de propagação de contexto não
  padronizados

Embora a maioria dos usuários possa não precisar estender o OpenTelemetry, o
projeto é projetado para tornar isso possível em quase todos os níveis.

## História {#history}

O OpenTelemetry é um projeto da
[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io) que é resultado
da [fusão] entre dois projetos anteriores, [OpenTracing](https://opentracing.io)
e [OpenCensus](https://opencensus.io). Ambos os projetos foram criados para
resolver o mesmo problema: a falta de um padrão de como instrumentar o código e
enviar dados de telemetria para um _backend_ de Observabilidade. Como nenhum dos
projetos conseguiu resolver o problema por completo de forma independente, eles
se fundiram para formar o OpenTelemetry e combinar seus esforços para oferecer
uma solução única.

Se você está atualmente utilizando OpenTracing ou OpenCensus, pode aprender como
migrar para o OpenTelemetry no [guia de migração](/docs/migration/).

[fusão]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## Próximos passos

- [Começando](/docs/getting-started/) &mdash; mergulhe de cabeça!
- Aprenda sobre os [conceitos do OpenTelemetry](/docs/concepts/).

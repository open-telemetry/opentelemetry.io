---
title: O que é o OpenTelemetry?
description: Uma breve explicação sobre o que o OpenTelemetry é e não é.
weight: 150
default_lang_commit: 0930994d5be6f01b05d0caca0550c468d2f3e829
cSpell:ignore: youtube
---

O OpenTelemetry é:

- Um **_framework_ e conjunto de ferramentas** projetado para facilitar a
  - [Geração][instr]
  - Exportação
  - [Coleta](../concepts/components/#collector)

  de [dados de telemetria][telemetry data] como [rastros][traces],
  [métricas][metrics] e [logs].

- **Código aberto**, além de **agnóstico em relação a fornecedores e
  ferramentas**, o que possibilita ser utilizado com uma grande variedade de
  _backends_ de observabilidade, incluindo ferramentas de código aberto como
  [Jaeger] e [Prometheus], além de soluções comerciais. O OpenTelemetry **não**
  é um _backend_ de observabilidade.

Um dos principais objetivos do OpenTelemetry é permitir que você possa
instrumentar suas aplicações ou sistemas de maneira fácil, independentemente da
linguagem de programação, infraestrutura ou ambiente de execução.

O _backend_ (armazenamento) e o _frontend_ (visualização) de dados de telemetria
são intencionalmente deixados para outras ferramentas.

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

Para mais vídeos nesta série e mais recursos, consulte
[Próximos passos](#what-next)

## O que é observabilidade? {#what-is-observability}

[Observabilidade][observability] é a capacidade de entender o estado interno de
um sistema ao examinar os dados que ele emite. No contexto de software, isso
significa ser capaz de entender o estado interno do sistema analisando seus
dados de telemetria, que incluem rastros, métricas e logs.

Para tornar um sistema observável, ele deve ser [instrumentado][instr]. Ou seja,
o código deve emitir [rastros][traces], [métricas][metrics] ou [logs]. Os dados
instrumentados devem então ser enviados para um backend de observabilidade.

## Por que OpenTelemetry? {#why-opentelemetry}

Com a ascensão da computação em nuvem, arquiteturas de microsserviços e
requisitos de negócios cada vez mais complexos, a necessidade de
[observabilidade][observability] de software e infraestrutura é cada vez maior.

O OpenTelemetry atende à necessidade de observabilidade seguindo dois
princípios-chave:

1. Você tem controle total sobre os dados que gera. Não há dependência de
   fornecedor (_vendor lock-in_).
2. Você só precisa aprender um único conjunto de APIs e convenções.

Ambos os princípios combinados dão a flexibilidade que equipes e organizações
precisam no mundo da computação moderna atual.

Se você quiser saber mais, dê uma olhada na
[missão, visão e valores](/community/mission/) do OpenTelemetry.

## Os principais componentes do OpenTelemetry {#main-opentelemetry-components}

O OpenTelemetry consiste dos seguintes componentes:

- Uma [especificação](/docs/specs/otel) para todos os componentes
- Um [protocolo](/docs/specs/otlp/) padrão que define o formato dos dados de
  telemetria
- [Convenções semânticas](/docs/specs/semconv/) que estabelecem um padrão de
  nomenclatura para tipos comuns de dados de telemetria
- APIs que definem como gerar dados de telemetria
- [SDKs para linguagens de programação](../languages) que implementam a
  especificação, APIs e exportação de dados de telemetria
- Um [ecossistema de bibliotecas](/ecosystem/registry) que implementa
  instrumentação para bibliotecas e frameworks comuns
- Componentes para instrumentação automática que geram dados de telemetria sem
  exigir alterações no código
- O [OpenTelemetry Collector](../collector), um _proxy_ intermediário que
  recebe, processa e exporta dados de telemetria
- Várias outras ferramentas, como o
  [OpenTelemetry Operator para Kubernetes](../platforms/kubernetes/operator/),
  [OpenTelemetry Helm Charts](../platforms/kubernetes/helm/), e
  [recursos da comunidade para FaaS](../platforms/faas/)

O OpenTelemetry é utilizado por diversas
[bibliotecas, serviços e aplicativos](/ecosystem/integrations/) que o integram
para fornecer observabilidade por padrão.

O OpenTelemetry é suportado por inúmeros [fornecedores](/ecosystem/vendors/),
muitos dos quais oferecem suporte comercial para o OpenTelemetry e contribuem
diretamente para o projeto.

## Extensibilidade {#extensibility}

O OpenTelemetry é projetado para ser extensível. Alguns exemplos de como ele
pode ser estendido incluem:

- Adicionar um _receiver_ ao OpenTelemetry Collector para suportar dados de
  telemetria de uma fonte personalizada
- Carregar bibliotecas de instrumentação personalizadas em um SDK
- Criar uma [distribuição](../concepts/distributions/) de um SDK ou do Collector
  adaptada a um caso de uso específico
- Criar um novo _exporter_ para um _backend_ personalizado que ainda não suporta
  o protocolo do OpenTelemetry (OTLP)
- Criar um propagador personalizado para formatos de propagação de contexto não
  padronizados

Embora a maioria dos usuários possa não precisar estender o OpenTelemetry, o
projeto é projetado para tornar isso possível em quase todos os níveis.

## História {#history}

O OpenTelemetry é um projeto da [Cloud Native Computing Foundation][] (CNCF) que
é resultado da [fusão][merger] entre dois projetos anteriores,
[OpenTracing](https://opentracing.io) e [OpenCensus](https://opencensus.io).
Ambos os projetos foram criados para resolver o mesmo problema: a falta de um
padrão de como instrumentar o código e enviar dados de telemetria para um
_backend_ de Observabilidade. Como nenhum dos projetos conseguiu resolver o
problema por completo de forma independente, eles se fundiram para formar o
OpenTelemetry e combinar seus esforços para oferecer uma solução única.

Se você está atualmente utilizando OpenTracing ou OpenCensus, pode aprender como
migrar para o OpenTelemetry no [guia de migração](../migration/).

[merger]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## Próximos passos {#what-next}

- [Começando](../getting-started/) &mdash; mergulhe de cabeça!
- Aprenda sobre os [conceitos do OpenTelemetry](../concepts/).
- [Assista vídeos][Watch videos] da série [OTel para
  iniciantes][OTel for beginners] ou outras [listas de reprodução][playlists].
- Registre-se nos [treinamentos](/training), incluindo o **treinamento
  gratuito** _[Getting started with OpenTelemetry](/training/#courses)_.

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]:
  https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official

---
title: Componentes
description: Os principais componentes que compõem o OpenTelemetry
weight: 20
default_lang_commit: f5c228e5d03deaabc00d5920c5757bf7bd23e3f3
---

O OpenTelemetry é atualmente composto por vários componentes principais:

- [Especificação](#specification)
- [Collector](#collector)
- [Implementações de API e SDK específicas](#language-specific-api--sdk-implementations)
  - [Bibliotecas de Instrumentação](#instrumentation-libraries)
  - [Exporters](#exporters)
  - [Instrumentação sem código](#zero-code-instrumentation)
  - [Detectores de Recursos](#resource-detectors)
  - [Propagadores entre Serviços](#cross-service-propagators)
  - [Amostragens](#samplers)
- [Kubernetes Operator](#kubernetes-operator)
- [Função como Serviço](#function-as-a-service-assets)

O OpenTelemetry permite que você substitua o uso de SDKs ou ferramentas
específicas para gerar e exportar dados de telemetria.

## Especificação {#specification}

Descreve os requisitos e expectativas entre diferentes linguagens para todas as
implementações. Além de uma definição de termos, a especificação define o
seguinte:

- **API:** Define tipos de dados e operações para gerar e correlacionar dados de
  rastreamento, métricas e logs.
- **SDK:** Define os requisitos para implementação específica de linguagem da
  API. São definidos aqui também os conceitos de configuração, processamento e
  exportação de dados.
- **Data:** Define o Protocolo OpenTelemetry (OTLP) e as convenções semânticas
  independentes de fornecedores que um backend de telemetria pode suportar.

Para mais informações, consulte [especificação](/docs/specs/).

## Collector

O Collector é um proxy para qualquer sistema de telemetria que pode receber...,
processar e exportar dados de telemetria. Ele suporta o recebimento de dados de
telemetria em vários formatos. (Por exemplo, OTLP, Jaeger, Prometheus, bem como
muitas outras ferramentas ) .e enviar dados para um ou mais sistema de
telemetria. Ele também suporta o processamento e a filtragem de dados de
telemetria antes de serem exportados.

Para mais informações, consulte [Coletor](/docs/collector/).

## Implementações de API e SDK específicas {#language-specific-api--sdk-implementations}

O OpenTelemetry também possui SDKs para as linguagens mais populares do mercado
e permitem usar a API do OpenTelemetry para gerar dados de telemetria e exportar
esses dados para qualquer sistema de telemetria. Esses SDKs também permitem que
você utilize qualquer biblioteca e ou frameworks dessas linguagens da
instrumentação manual.

Para mais informações, consulte
[Instrumentando](/docs/concepts/instrumentation/).

### Bibliotecas de instrumentação {#instrumentation-libraries}

O OpenTelemetry suporta um grande número de componentes que geram dados de
telemetria relevantes a partir de bibliotecas e frameworks populares para as
linguagens suportadas. Por exemplo, requisições HTTP de entrada e saída de uma
biblioteca HTTP geram dados sobre essas requisições. Um objetivo aspiracional do
OpenTelemetry é que todas as bibliotecas populares sejam construídas para serem
observáveis por padrão, de modo que dependências separadas não sejam
necessárias.

Para mais informações, consulte
[Bibliotecas de instrumentação](/docs/concepts/instrumentation/libraries/).

### Exporters {#exporters}

{{% pt/docs/languages/exporters/intro %}}

### Instrumentação sem código {#zero-code-instrumentation}

O OpenTelemetry possibilita essa forma de instrumentar sua aplicação sem alterar
seu código-fonte. Embora o mecanismo dependa da linguagem, a instrumentação sem
código adiciona as capacidades da API e do SDK do OpenTelemetry à sua aplicação.
Além disso, pode adicionar um conjunto de bibliotecas de instrumentação e
dependências do exportador.

Para mais informações, consulte
[Instrumentação sem código](/docs/concepts/instrumentation/zero-code/).

### Detectores de recursos {#resource-detectors}

Um [recurso](/docs/concepts/resources/) representa a entidade que produz
telemetria como atributos de recurso. Por exemplo, um processo que produz
telemetria que está sendo executado em um contêiner no Kubernetes tem um nome de
Pod, um namespace e possivelmente um nome de implantação. Você pode incluir
todos esses atributos no recurso. As implementações específicas de linguagem do
OpenTelemetry fornecem detecção de recursos a partir da variável de ambiente
`OTEL_RESOURCE_ATTRIBUTES` e para muitas entidades comuns, como tempo de
execução do processo, serviço, host ou sistema operacional.

Para mais informações, consulte [Recursos](/docs/concepts/resources/).

### Propagadores entre serviços {#cross-service-propagators}

A propagação é o mecanismo que move dados entre serviços e processos. Embora não
se limite ao rastreamento, a propagação permite que os rastros construam
informações sobre um sistema através de serviços que estão distribuídos
arbitrariamente entre limites de processos e redes.

Na grande maioria dos casos de uso, a propagação de contexto ocorre por meio de
bibliotecas de instrumentação. Se for necessário, você pode usar propagadores
manualmente para serializar e desserializar aspectos como o contexto de um
trecho e a [bagagem](/docs/concepts/signals/baggage/).

### Amostragem {#samplers}

A amostragem é um processo que restringe a quantidade de rastros que são gerados
por um sistema. Cada implementação específica de linguagem do OpenTelemetry
oferece [amostradores pela cabeça](/docs/concepts/sampling/#head-sampling).
[Amostragem](/docs/concepts/sampling/#head-sampling).

Para mais informações, consulte [Amostragem](/docs/concepts/sampling).

## Operador Kubernetes {#kubernetes-operator}

O OpenTelemetry Operator é a implementação de um Operador Kubernetes. O operador
gerencia o OpenTelemetry Collector e a instrumentação sem código das cargas de
trabalho que utilizam OpenTelemetry.

Para mais informações, consulte
[Kubernetes Operator](/docs/kubernetes/operator/).

## Função como Serviço {#function-as-a-service-assets}

O OpenTelemetry oferece vários métodos de monitoramento de Function-as-a-Service
fornecidos por diferentes provedores de nuvem. A comunidade OpenTelemetry
atualmente disponibiliza camadas Lambda pré-construídas, capazes de realizar
instrumentação sem código na sua aplicação, bem como a opção de uma camada
Lambda do Coletor independente, que pode ser usada ao instrumentar aplicações
manualmente ou automaticamente.

Para mais informações, consulte [Função como Serviço](/docs/faas/).

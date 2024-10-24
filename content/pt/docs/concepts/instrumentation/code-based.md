---
title: Manual
description: >-
  Aprenda as etapas essenciais na configuração da instrumentação manual
weight: 20
default_lang_commit: fe0c3f68902aeb6e7584ffc32c6c8964d7a89e6e
---

## Importe a API e o SDK do OpenTelemetry

Primeiro, você precisará importar o OpenTelemetry para o seu código. Se estiver
desenvolvendo uma biblioteca ou algum outro componente que se destina a ser
consumido por um binário executável, você só dependeria da API. Se o seu
artefato for um processo ou serviço independente, então você dependeria da API e
do SDK. Para obter mais informações sobre a API e o SDK do OpenTelemetry,
consulte a [especificação](/docs/specs/otel/).

## Configure a API do OpenTelemetry

Para criar rastros ou métricas, primeiro você precisa criar um _provider_ do
tipo _tracer_ e/ou _meter_. Geralmente, recomendamos que o SDK forneça um único
provider padrão para esses objetos. Em seguida, você obtém uma instância
_tracer_ ou _meter_ desse _provider_ e atribui a ela um nome e uma versão. O
nome que você escolher aqui deve identificar exatamente o que está sendo
instrumentado - se você está desenvolvendo uma biblioteca, por exemplo, você
deve nomeá-la com o nome da sua biblioteca (por exemplo
`com.example.myLibrary`), pois esse nome será usado como _namespace_ em todos os
eventos de trecho ou métricas que forem produzidos. Além disso, é recomendável
fornecer uma _string_ de versão (ou seja, `semver:1.0.0`) que corresponda à
versão atual da sua biblioteca ou serviço.

## Configure o SDK do OpenTelemetry

Se você está desenvolvendo um serviço, também precisará configurar o SDK com as
opções adequadas para exportar seus dados de telemetria para um _backend_ de
análise. Recomendamos que esta configuração seja feita programaticamente por
meio de um arquivo de configuração ou outro mecanismo. Além disso, existem
opções de ajuste específicas para cada linguagem de programação que você pode
utilizar.

## Crie dados de telemetria

Depois de configurar a API e o SDK, você estará pronto para criar eventos de
rastros e métricas usando os objetos _tracer_ e _meter_ obtidos do _provider_.
Utilize bibliotecas de instrumentação para suas dependências -- confira o
[OpenTelemetry Registry](/ecosystem/registry/) ou o repositório da sua linguagem
de programação para mais informações sobre essas bibliotecas.

## Exporte dados

Depois de criar os dados de telemetria, você vai querer enviá-los para algum
lugar. O OpenTelemetry oferece suporte a dois métodos principais de exportação
de dados do seu processo para um _backend_ de análise: diretamente da sua
aplicação ou por meio de um proxy através do
[OpenTelemetry Collector](/docs/collector).

A exportação a partir da sua aplicação exige que você importe e dependa de um ou
mais _exporters_, bibliotecas responsáveis por traduzir os objetos de trechos e
métricas em memória do OpenTelemetry para o formato apropriado para ferramentas
de análise de telemetria, como Jaeger ou Prometheus. Além disso, o OpenTelemetry
suporta um protocolo conhecido como `OTLP`, que é compatível com todos os SDKs
do OpenTelemetry. Esse protocolo pode ser utilizado para enviar dados ao
OpenTelemetry Collector, um processo binário que pode ser executado como
_proxy_, _sidecar_ ou em um _host_ separado. O Collector pode então ser
configurado para encaminhar e exportar esses dados para ferramentas de análise
de sua escolha.

Além das ferramentas _open source_ como Jaeger ou Prometheus, uma lista
crescente de empresas oferece suporte para ingestão de dados de telemetria do
OpenTelemetry. Para mais detalhes, consulte os
[Fornecedores](/ecosystem/vendors/).

---
title: Instrumentação baseada em Código
description: Aprenda o essencial para configurar a instrumentação baseada em código
weight: 20
aliases: [manual]
cSpell:ignore: proxying
default_lang_commit: 13c2d415e935fac3014344e67c6c61556779fd6f
---

## Importe a API e SDK do OpenTelemetry

Primeiro, você precisará importar o OpenTelemetry para o código do seu serviço. Se você estiver desenvolvendo uma biblioteca ou algum outro componente que será consumido por um binário executável, então você só precisará depender da API. Se o seu artefato for um processo ou serviço independente, então você precisará depender tanto da API quanto do SDK. Para saber mais informações sobre a API e SDK do OpenTelemetry, consulte a [especificação](/docs/specs/otel/).

## Configure a API do OpenTelemetry

Para criar rastros ou métricas, você precisará primeiro criar um rastreador e/ou um provedor de métricas. Em geral, recomendamos que o SDK forneça um provedor padrão único para esses objetos. Em seguida, você obterá uma instância de rastreador ou medidor desse provedor e dará a ele um nome e uma versão. O nome que você escolher aqui deve identificar exatamente o que está sendo instrumentado - se você estiver escrevendo uma biblioteca, por exemplo, então você deve nomeá-la com o nome da sua biblioteca (por exemplo, `com.example.myLibrary`), pois esse nome irá agrupar todos os spans ou eventos de métricas produzidos. Também é recomendado que você forneça uma string de versão (por exemplo, `semver:1.0.0`) que corresponda à versão atual da sua biblioteca ou serviço.

## Configure o SDK do OpenTelemetry

Se você estiver desenvolvendo um processo de serviço, também precisará configurar o SDK com as opções apropriadas para exportar seus dados de telemetria para algum backend de análise. Recomendamos que essa configuração seja feita programaticamente por meio de um arquivo de configuração ou algum outro mecanismo. Também existem opções de ajuste específicas de cada linguagem das quais você pode se beneficiar.

## Crie Dados de Telemetria

Depois de configurar a API e o SDK, você poderá criar rastros e eventos de métricas por meio dos objetos rastreador e medidor que você obteve do provedor. Utilize Bibliotecas de Instrumentação para suas dependências - confira o [registro](/ecosystem/registry/) ou o repositório da linguagem escolhida para ter mais informações sobre elas.

## Exporte os Dados

Depois de criar os dados de telemetria, você vai querer enviá-los para algum lugar. O OpenTelemetry suporta dois métodos principais de exportação de dados do seu processo para um backend de análise, seja diretamente de um processo ou por meio do [OpenTelemetry Collector](/docs/collector).

A exportação in-process requer que você importe e dependa de um ou mais _exporters_, bibliotecas que traduzem os objetos de trecho e métrica em memória do OpenTelemetry para o formato apropriado para ferramentas de análise de telemetria como Jaeger ou Prometheus. Além disso, o OpenTelemetry suporta um protocolo de comunicação conhecido como `OTLP`, que é suportado por todos os SDKs do OpenTelemetry. Esse protocolo pode ser usado para enviar dados para o OpenTelemetry Collector, um processo binário independente que pode ser executado como um proxy ou sidecar para suas instâncias de serviço ou em um host separado. O Collector pode então ser configurado para encaminhar e exportar esses dados para as suas ferramentas de análise preferidas.

Além de ferramentas de código aberto como Jaeger ou Prometheus, uma lista crescente de empresas suporta a ingestão de dados de telemetria do OpenTelemetry. Para mais detalhes, consulte [Fornecedores](/ecosystem/vendors/).

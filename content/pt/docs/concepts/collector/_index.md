---
title: Collector
description:
  Forma independente de fornecedor para receber, processar e exportar dados de
  telemetria.
aliases: [collector/about]
sidebar_root_for: children
cascade:
  vers: 0.147.0
weight: 270
default_lang_commit: 2871fe3c7fdc376e55ce84f601a54264226531bb
---

![Diagrama do OpenTelemetry Collector com integração para Jaeger, OTLP e Prometheus](img/otel-collector.svg)

## Introdução {#introduction}

O OpenTelemetry Collector oferece uma implementação independente de fornecedor
para receber, processar e exportar dados de telemetria. Eliminando a necessidade
de executar, operar e manter múltiplos agentes/coletores. Isso melhora a
escalabilidade e oferece suporte a formatos de dados de observabilidade de
código aberto (por exemplo, Jaeger, Prometheus, Fluent Bit, etc.), enviando
dados para um ou mais _backends_ de código aberto ou comerciais.

## Objetivos {#objectives}

- _Usabilidade_: Configuração padrão razoável, suporte a protocolos populares,
  executa e coleta dados pronto para uso.
- _Desempenho_: Altamente estável e performático sob cargas e configurações
  variadas.
- _Observabilidade_: Um exemplo de serviço observável.
- _Extensibilidade_: Personalizável sem alterar o código principal.
- _Unificação_: Base de código única, implantável como agente ou coletor, com
  suporte a rastros, métricas e logs.

## Quando usar um collector {#when-to-use-a-collector}

Na maioria das bibliotecas de instrumentação específicas de linguagem, você tem
exportadores para _backends_ populares e para OTLP. Você pode se perguntar:

> em quais circunstâncias usar um collector para enviar dados, em vez de fazer
> cada serviço enviar diretamente para o _backend_?

Para testar e começar com OpenTelemetry, enviar seus dados diretamente para um
_backend_ é uma ótima forma de obter valor rapidamente. Além disso, em um
ambiente de desenvolvimento ou de pequena escala, você pode obter bons
resultados sem um collector.

No entanto, em geral recomendamos usar um collector junto ao seu serviço, pois
isso permite que o serviço envie os dados rapidamente, enquanto o collector
cuida de tratamentos adicionais, como tentativas de reenvio, agrupamento em
lotes, criptografia e até filtragem de dados sensíveis.

Também é mais fácil [configurar um collector](quick-start) do que parece: os
exportadores OTLP padrão em cada linguagem assumem um endpoint local de
collector. Portanto, ao iniciar um collector, a recepção de telemetria começa
automaticamente.

## Segurança do collector {#collector-security}

Siga as melhores práticas para garantir que seus collectors sejam [hospedados][]
e [configurados][] com segurança.

## Status {#status}

O status do **Collector** é: [misto][], pois os componentes centrais do
Collector atualmente têm [níveis de estabilidade][] mistos.

Os **componentes do Collector** diferem em seus níveis de maturidade. Cada
componente tem sua estabilidade documentada em seu `README.md`. Você pode
encontrar uma lista de todos os componentes de Collector disponíveis no
[registro][].

O suporte é garantido para os artefatos de _software_ do Collector por um
período de tempo determinado, com base no público-alvo do artefato. Esse suporte
inclui, no mínimo, correções para bugs críticos e problemas de segurança.
Consulte as
[políticas de suporte](https://github.com/open-telemetry/opentelemetry-collector/blob/main/VERSIONING.md)
para mais detalhes.

## Distribuições e lançamentos {#releases}

Para informações sobre distribuições e lançamentos do Collector, incluindo a
[última versão][], consulte [Distribuições](distributions/).

[configurados]: /docs/security/config-best-practices/
[hospedados]: /docs/security/hosting-best-practices/
[última versão]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest
[misto]: /docs/specs/otel/document-status/#mixed
[registro]: /ecosystem/registry/?language=collector
[níveis de estabilidade]:
  https://github.com/open-telemetry/opentelemetry-collector#stability-levels

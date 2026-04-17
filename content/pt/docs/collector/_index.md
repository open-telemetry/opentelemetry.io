---
title: Collector
description:
  Receba, processe e exporte dados de telemetria de forma agnóstica a
  fornecedor.
aliases: [collector/about]
sidebar_root_for: children
cascade:
  vers: 0.147.0
weight: 270
default_lang_commit: 2871fe3c7fdc376e55ce84f601a54264226531bb
---

![Diagrama do OpenTelemetry Collector com integração para Jaeger, OTLP e Prometheus](img/otel-collector.svg)

## Introdução {#introduction}

O OpenTelemetry Collector oferece uma implementação agnóstica a fornecedores
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

## Quando usar um Collector {#when-to-use-a-collector}

Na maioria das bibliotecas de instrumentação específicas de linguagem, há
exportadores para _backends_ populares e para OTLP. Você pode se perguntar:

> em quais circunstâncias usar um Collector para enviar dados, em vez de fazer
> cada serviço enviar diretamente para o _backend_?

Para experimentar e dar os primeiros passos com o OpenTelemetry, enviar seus
dados diretamente para um _backend_ é uma ótima forma de obter valor
rapidamente. Além disso, em um ambiente de desenvolvimento ou de pequena escala,
você pode obter bons resultados sem um Collector.

No entanto, em geral recomenda-se utilizar um Collector junto ao serviço, pois
isso permite que o serviço envie os dados rapidamente enquanto o Collector cuida
de tratamentos adicionais, como tentativas de reenvio, agrupamento em lotes,
criptografia e até filtragem de dados sensíveis.

[Configurar um Collector](quick-start) é mais fácil do que pode parecer: os
exportadores OTLP padrão em cada linguagem assumem uma rota (_endpoint_) local
de Collector. Portanto, ao iniciar um Collector, a recepção de telemetria começa
automaticamente.

## Segurança do Collector {#collector-security}

Siga as boas práticas para garantir que seus Collectores estejam
[hospedados][hosted] e [configurados][configured] com segurança.

## Status {#status}

O status do **Collector** é: [misto][mixed], pois os componentes centrais do
Collector atualmente possuem [níveis de estabilidade][stability levels]
variados.

Os **componentes do Collector** diferem em seus níveis de maturidade. Cada
componente tem sua estabilidade documentada em seu respectivo `README.md`. Uma
lista de todos os componentes disponíveis do Collector pode ser encontrada no
[registro][registry].

O suporte a artefatos de _software_ do Collector é garantido por um período de
tempo determinado, com base no público-alvo do artefato. Esse suporte inclui, no
mínimo, correções para _bugs_ críticos e problemas de segurança. Consulte as
[políticas de suporte](https://github.com/open-telemetry/opentelemetry-collector/blob/main/VERSIONING.md)
para mais detalhes.

## Distribuições e lançamentos {#releases}

Para informações sobre distribuições e lançamentos do Collector, incluindo a
[versão mais recente][latest release], consulte [Distribuições](distributions/).

[configured]: /docs/security/config-best-practices/
[hosted]: /docs/security/hosting-best-practices/
[latest release]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest
[mixed]: /docs/specs/otel/document-status/#mixed
[registry]: /ecosystem/registry/?language=collector
[stability levels]:
  https://github.com/open-telemetry/opentelemetry-collector#stability-levels
